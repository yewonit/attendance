/** 새 회기 자동 생성 — 다음 년도 시즌이 없으면 새로 생성합니다. */
import { and, eq } from 'drizzle-orm';
import { db } from '../../../db';
import { seasons } from '../../../db/schema/season';
import { getFirstWednesdayAfterLastSundayOfNovember } from '../../shared/date.util';

/** 다음 회기를 생성하거나 기존 것의 ID를 반환합니다. */
export async function createNewSeason(): Promise<number> {
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  const seasonName = nextYear.toString();

  const [existing] = await db
    .select({ id: seasons.id })
    .from(seasons)
    .where(and(eq(seasons.name, seasonName), eq(seasons.isDeleted, false)))
    .limit(1);

  if (existing) return existing.id;

  const [prev] = await db
    .select({ endDate: seasons.endDate })
    .from(seasons)
    .where(and(eq(seasons.name, currentYear.toString()), eq(seasons.isDeleted, false)))
    .limit(1);

  const startDate = prev?.endDate ?? null;
  const endDate = getFirstWednesdayAfterLastSundayOfNovember(nextYear);

  const [result] = await db.insert(seasons).values({
    name: seasonName,
    startDate,
    endDate,
    endDelay: null,
    isDeleted: false,
  });

  return result.insertId;
}
