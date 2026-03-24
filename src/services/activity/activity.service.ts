/** 활동 서비스 — 활동 CRUD, 출석 기록, 템플릿 조회 */
import { and, eq, gt, inArray, lt } from 'drizzle-orm';
import { db } from '../../db';
import { activities } from '../../db/schema/activity';
import { activityImages } from '../../db/schema/activity-image';
import { attendances } from '../../db/schema/attendance';
import { users } from '../../db/schema/user';
import { ACTIVITY_TEMPLATES } from '../../enums/activity-template';
import { BadRequestError, NotFoundError } from '../../utils/errors';
import { daysAgo } from '../shared/date.util';
import { updateAggregateWhenChanged, updateUserAttendanceAggregate } from './update-aggregate';

/** 활동 템플릿 목록을 반환합니다. */
export function getActivityTemplates() {
  return Object.values(ACTIVITY_TEMPLATES);
}

/** 조직의 활동 목록을 출석/이미지 포함하여 조회합니다. (N+1 방지) */
export async function getAllOrganizationActivities(organizationId: number) {
  const activityRows = await db
    .select()
    .from(activities)
    .where(eq(activities.organizationId, organizationId))
    .orderBy(activities.startTime);

  if (activityRows.length === 0) return null;

  const ids = activityRows.map((a) => a.id);

  const [attendanceRows, imageRows] = await Promise.all([
    db
      .select({
        id: attendances.id,
        activityId: attendances.activityId,
        userId: attendances.userId,
        status: attendances.attendanceStatus,
        note: attendances.description,
        userName: users.name,
        userEmail: users.email,
      })
      .from(attendances)
      .innerJoin(users, and(eq(attendances.userId, users.id), eq(users.isDeleted, false)))
      .where(inArray(attendances.activityId, ids)),
    db.select().from(activityImages).where(inArray(activityImages.activityId, ids)),
  ]);

  const attendanceMap = groupBy(attendanceRows, 'activityId');
  const imageMap = groupBy(imageRows, 'activityId');

  return activityRows.map((a) => ({
    id: a.id,
    activityCategory: a.activityCategory,
    location: a.location,
    startDateTime: a.startTime,
    endDateTime: a.endTime,
    notes: a.description,
    name: a.name,
    description: a.description,
    createdAt: a.createdAt,
    attendances: (attendanceMap[a.id] ?? []).map((att) => ({
      id: att.id,
      userId: att.userId,
      userName: att.userName,
      userEmail: att.userEmail,
      status: att.status,
      note: att.note,
    })),
    images: (imageMap[a.id] ?? []).map((img) => ({
      id: img.id,
      name: img.name,
      path: img.path,
    })),
  }));
}

/** 활동 상세 정보를 조회합니다. */
export async function getActivityDetails(activityId: number) {
  const [activity] = await db
    .select()
    .from(activities)
    .where(eq(activities.id, activityId))
    .limit(1);
  if (!activity) return null;

  const [attendanceRows, imageRows] = await Promise.all([
    db
      .select({
        id: attendances.id,
        userId: attendances.userId,
        status: attendances.attendanceStatus,
        note: attendances.description,
        userName: users.name,
        userEmail: users.email,
      })
      .from(attendances)
      .innerJoin(users, and(eq(attendances.userId, users.id), eq(users.isDeleted, false)))
      .where(eq(attendances.activityId, activityId)),
    db.select().from(activityImages).where(eq(activityImages.activityId, activityId)),
  ]);

  return {
    id: activity.id,
    activityCategory: activity.activityCategory,
    location: activity.location,
    startDateTime: activity.startTime,
    endDateTime: activity.endTime,
    notes: activity.description,
    name: activity.name,
    description: activity.description,
    attendances: attendanceRows.map((a) => ({
      id: a.id,
      userId: a.userId,
      userName: a.userName,
      userEmail: a.userEmail,
      status: a.status,
      note: a.note,
    })),
    images: imageRows.map((i) => ({ id: i.id, name: i.name, path: i.path })),
  };
}

interface RecordData {
  activityData: {
    startDateTime: Date;
    endDateTime: Date;
    notes?: string;
    location?: string;
    name?: string;
    activityCategory?: string;
  };
  attendances: { userId: number; status: string; note?: string }[];
  imageInfo?: { fileName: string; url: string };
}

/** 활동과 출석을 동시에 생성합니다. (단일 트랜잭션) */
export async function recordActivityAndAttendance(
  organizationId: number,
  activityTemplateId: number,
  data: RecordData,
) {
  const { activityData, attendances: attendanceList, imageInfo } = data;

  if (!activityData.startDateTime || !activityData.endDateTime) {
    throw new BadRequestError('시작 시간과 종료 시간은 필수입니다.');
  }

  const template = Object.values(ACTIVITY_TEMPLATES).find((t) => t.id === activityTemplateId);
  if (!template) throw new BadRequestError('해당 활동 템플릿을 찾을 수 없습니다.');

  await db.transaction(async (tx) => {
    const [activityResult] = await tx.insert(activities).values({
      name: template.name || activityData.name || '',
      description: activityData.notes ?? null,
      activityCategory: template.activityCategory || activityData.activityCategory || '',
      location: activityData.location ?? null,
      organizationId,
      startTime: activityData.startDateTime,
      endTime: activityData.endDateTime,
    });

    const activityId = activityResult.insertId;

    if (imageInfo) {
      await tx.insert(activityImages).values({
        activityId,
        name: imageInfo.fileName,
        path: imageInfo.url,
      });
    }

    const activityName = template.name || activityData.name || '';
    for (const att of attendanceList) {
      await tx.insert(attendances).values({
        activityId,
        userId: att.userId,
        attendanceStatus: att.status,
        description: att.note ?? null,
      });
      await updateUserAttendanceAggregate(tx, att.userId, activityName, att.status);
    }
  });
}

/** 활동과 출석을 동시에 수정합니다. (단일 트랜잭션) */
export async function updateActivityAndAttendance(activityId: number, data: RecordData) {
  const { activityData, attendances: attendanceList, imageInfo } = data;

  const [activity] = await db
    .select()
    .from(activities)
    .where(eq(activities.id, activityId))
    .limit(1);
  if (!activity) throw new NotFoundError('Activity', activityId);

  await db.transaction(async (tx) => {
    await tx
      .update(activities)
      .set({
        location: activityData.location ?? null,
        startTime: activityData.startDateTime,
        endTime: activityData.endDateTime,
        description: activityData.notes ?? null,
      })
      .where(eq(activities.id, activityId));

    if (imageInfo?.url && imageInfo?.fileName) {
      const [existingImage] = await tx
        .select()
        .from(activityImages)
        .where(eq(activityImages.activityId, activityId))
        .limit(1);

      if (existingImage) {
        await tx
          .update(activityImages)
          .set({ name: imageInfo.fileName, path: imageInfo.url })
          .where(eq(activityImages.id, existingImage.id));
      } else {
        await tx
          .insert(activityImages)
          .values({ activityId, name: imageInfo.fileName, path: imageInfo.url });
      }
    }

    for (const att of attendanceList) {
      const [existing] = await tx
        .select()
        .from(attendances)
        .where(and(eq(attendances.activityId, activityId), eq(attendances.userId, att.userId)))
        .limit(1);

      if (existing) {
        await tx
          .update(attendances)
          .set({ attendanceStatus: att.status, description: att.note ?? null })
          .where(eq(attendances.id, existing.id));
        await updateAggregateWhenChanged(tx, att.userId, activity.name, att.status);
      } else {
        await tx.insert(attendances).values({
          activityId,
          userId: att.userId,
          attendanceStatus: att.status,
          description: att.note ?? null,
        });
        await updateUserAttendanceAggregate(tx, att.userId, activity.name, att.status);
      }
    }
  });
}

/** 활동과 관련 출석/이미지를 모두 삭제합니다. */
export async function deleteActivityAndAttendance(activityId: number) {
  await db.transaction(async (tx) => {
    await tx.delete(attendances).where(eq(attendances.activityId, activityId));
    await tx.delete(activityImages).where(eq(activityImages.activityId, activityId));
    await tx.delete(activities).where(eq(activities.id, activityId));
  });
}

/** 최근 1주 이내 청년예배 활동 ID 목록을 조회합니다. */
export async function getLastWeekYoungAdultIds(orgIds: number[]) {
  if (orgIds.length === 0) return [];
  const rows = await db
    .select({ id: activities.id })
    .from(activities)
    .where(
      and(
        gt(activities.startTime, daysAgo(7)),
        eq(activities.name, '청년예배'),
        inArray(activities.organizationId, orgIds),
      ),
    );
  return rows.map((r) => r.id);
}

/** 1~2주 전 청년예배 활동 ID 목록을 조회합니다. */
export async function get2WeeksAgoYoungAdultIds(orgIds: number[]) {
  if (orgIds.length === 0) return [];
  const rows = await db
    .select({ id: activities.id })
    .from(activities)
    .where(
      and(
        lt(activities.startTime, daysAgo(7)),
        gt(activities.startTime, daysAgo(14)),
        eq(activities.name, '청년예배'),
        inArray(activities.organizationId, orgIds),
      ),
    );
  return rows.map((r) => r.id);
}

// ── 유틸 ──

function groupBy<T extends Record<string, unknown>>(arr: T[], key: string): Record<number, T[]> {
  return arr.reduce<Record<number, T[]>>((map, item) => {
    const k = item[key] as number;
    if (!map[k]) map[k] = [];
    map[k].push(item);
    return map;
  }, {});
}
