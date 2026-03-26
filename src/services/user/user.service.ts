/** 사용자 서비스 — CRUD, 검색, 일괄 생성 */
import { and, eq, like } from 'drizzle-orm';
import { db } from '../../db';
import { organizations } from '../../db/schema/organization';
import { roles } from '../../db/schema/role';
import { users } from '../../db/schema/user';
import { userRoles } from '../../db/schema/user-role';
import { BadRequestError, ConflictError, NotFoundError } from '../../utils/errors';
import { hashPassword } from '../../utils/password';
import { getCurrentSeasonId } from '../season/season.service';
import { ROLE_IDS } from '../shared/constants';
import { getRecentSunday } from '../shared/date.util';
import { formatPhoneNumber, validateEmail, validatePassword } from '../shared/validation.util';

// ── 생성 ──

interface CreateUserInput {
  name: string;
  gender: string;
  nameSuffix?: string;
  birthDate?: Date | null;
  phoneNumber: string;
  organizationId: number;
}

/** 단일 사용자를 생성하고 기본 역할(순원)을 부여합니다. */
export async function createUser(input: CreateUserInput) {
  const phone = formatPhoneNumber(input.phoneNumber);

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(
      and(eq(users.name, input.name), eq(users.phoneNumber, phone), eq(users.isDeleted, false)),
    )
    .limit(1);

  if (existing.length > 0) {
    throw new ConflictError('이미 같은 전화번호로 생성된 유저가 있습니다.');
  }

  return db.transaction(async (tx) => {
    const [result] = await tx.insert(users).values({
      name: input.name,
      nameSuffix: input.nameSuffix || 'AAA',
      gender: input.gender,
      birthDate: input.birthDate ?? null,
      phoneNumber: phone,
      registrationDate: getRecentSunday() as unknown as Date,
      isNewMember: true,
    });

    const userId = result.insertId;

    const [org] = await tx
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.id, input.organizationId))
      .limit(1);
    if (!org) throw new NotFoundError('Organization', input.organizationId);

    await tx.insert(userRoles).values({
      userId,
      roleId: ROLE_IDS.MEMBER,
      organizationId: input.organizationId,
    });

    return userId;
  });
}

interface BatchUserInput {
  name: string;
  gender: string;
  nameSuffix?: string;
  birthDate?: Date | null;
  phone?: string;
  email?: string;
  organizationId: number;
}

/** 복수 사용자를 일괄 생성합니다. (단일 트랜잭션) */
export async function createUsers(inputList: BatchUserInput[]) {
  if (inputList.length === 0) throw new BadRequestError('사용자 목록이 비어있습니다.');

  return db.transaction(async (tx) => {
    const createdIds: number[] = [];

    for (const u of inputList) {
      const phone = formatPhoneNumber(u.phone ?? '');
      const [result] = await tx.insert(users).values({
        name: u.name,
        nameSuffix: u.nameSuffix || 'AAA',
        email: u.email ?? null,
        gender: u.gender,
        birthDate: u.birthDate ?? null,
        phoneNumber: phone,
        registrationDate: getRecentSunday() as unknown as Date,
        isNewMember: true,
      });

      await tx.insert(userRoles).values({
        userId: result.insertId,
        roleId: ROLE_IDS.MEMBER,
        organizationId: u.organizationId,
      });

      createdIds.push(result.insertId);
    }
    return createdIds;
  });
}

// ── 조회 ──

/** ID로 사용자를 조회합니다. */
export async function findUserById(id: number) {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!user) throw new NotFoundError('User', id);
  return user;
}

/** 전체 사용자를 조회합니다. */
export async function findAllUsers() {
  return db.select().from(users);
}

/** 이름으로 사용자를 검색하고 역할/조직 정보를 포함합니다. (N+1 방지) */
export async function searchMembersByName(name: string) {
  if (!name) throw new BadRequestError('이름이 제공되지 않았습니다.');

  const decoded = decodeURIComponent(name);
  const matchedUsers = await db
    .select({ id: users.id, name: users.name, email: users.email, phoneNumber: users.phoneNumber })
    .from(users)
    .where(and(like(users.name, `%${decoded}%`), eq(users.isDeleted, false)));

  if (matchedUsers.length === 0) return [];

  const userIds = matchedUsers.map((u) => u.id);
  const seasonId = await getCurrentSeasonId();

  const roleRows = await db
    .select({
      userId: userRoles.userId,
      roleName: roles.name,
      orgId: organizations.id,
      orgName: organizations.name,
    })
    .from(userRoles)
    .innerJoin(roles, and(eq(userRoles.roleId, roles.id), eq(roles.isDeleted, false)))
    .innerJoin(
      organizations,
      and(
        eq(userRoles.organizationId, organizations.id),
        eq(organizations.seasonId, seasonId),
        eq(organizations.isDeleted, false),
      ),
    )
    .where(and(...userIds.map((uid) => eq(userRoles.userId, uid))));

  // TODO: inArray 사용 — 현재 drizzle에서는 큰 배열 시 성능 고려 필요
  const roleMap = new Map<
    number,
    { roleName: string; organizationId: number; organizationName: string }[]
  >();
  for (const r of roleRows) {
    const list = roleMap.get(r.userId) ?? [];
    list.push({ roleName: r.roleName, organizationId: r.orgId, organizationName: r.orgName });
    roleMap.set(r.userId, list);
  }

  return matchedUsers.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phoneNumber: u.phoneNumber,
    roles: roleMap.get(u.id) ?? [],
  }));
}

/** 이름 존재 여부를 확인합니다. */
export async function checkUserNameExists(name: string): Promise<boolean> {
  if (!name) throw new BadRequestError('이름이 제공되지 않았습니다.');
  const decoded = decodeURIComponent(name);
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.name, decoded))
    .limit(1);
  return !!user;
}

/** 이름+전화번호로 사용자를 인증합니다. */
export async function checkUserPhoneNumber(name: string, phoneNumber: string) {
  if (!name || !phoneNumber) throw new BadRequestError('이름 또는 전화번호가 제공되지 않았습니다.');

  const [user] = await db
    .select({ id: users.id, name: users.name, email: users.email, phoneNumber: users.phoneNumber })
    .from(users)
    .where(and(eq(users.name, name), eq(users.phoneNumber, phoneNumber)))
    .limit(1);

  if (!user) throw new BadRequestError('사용자 정보가 일치하지 않습니다.');

  const { getUserRolesOfCurrentSeason } = await import('./user-role.service');
  const userRolesData = await getUserRolesOfCurrentSeason(user.id);

  return { ...user, roles: userRolesData };
}

// ── 수정 ──

interface UpdateUserInput {
  name?: string;
  nameSuffix?: string;
  email?: string;
  password?: string;
  gender?: string;
  birthDate?: Date | null;
  phone?: string;
  organizationId?: number;
}

/** 사용자 정보를 수정합니다. */
export async function updateUser(id: number, input: UpdateUserInput) {
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.id, id)).limit(1);
  if (!existing) throw new NotFoundError('User', id);

  if (input.email) await validateEmail(input.email);
  let hashedPassword: string | undefined;
  if (input.password) {
    validatePassword(input.password);
    hashedPassword = await hashPassword(input.password);
  }

  const phone = input.phone ? formatPhoneNumber(input.phone) : undefined;

  return db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({
        ...(input.name && { name: input.name }),
        ...(input.nameSuffix && { nameSuffix: input.nameSuffix }),
        ...(input.email && { email: input.email }),
        ...(hashedPassword && { password: hashedPassword }),
        ...(input.gender && { gender: input.gender }),
        ...(input.birthDate && { birthDate: input.birthDate }),
        ...(phone && { phoneNumber: phone }),
      })
      .where(eq(users.id, id));

    if (input.organizationId) {
      await tx
        .update(userRoles)
        .set({ organizationId: input.organizationId })
        .where(eq(userRoles.userId, id));
    }
  });
}

/** 이메일과 비밀번호를 최초 설정합니다. */
export async function setEmailAndPassword(id: number, email: string, password: string) {
  const [existing] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!existing) throw new NotFoundError('User', id);
  if (existing.email || existing.password)
    throw new BadRequestError('이미 이메일과 패스워드가 등록되어있습니다.');

  await validateEmail(email);
  validatePassword(password);
  const hashed = await hashPassword(password);

  await db.update(users).set({ email, password: hashed }).where(eq(users.id, id));
}

/** 이메일 중복을 확인합니다. */
export async function emailDuplicationCheck(email: string) {
  await validateEmail(email);
}

// ── 삭제 ──

/** 사용자를 삭제합니다. */
export async function deleteUser(id: number) {
  const [result] = await db.delete(users).where(eq(users.id, id));
  if (result.affectedRows === 0) throw new NotFoundError('User', id);
}
