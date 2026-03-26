/**
 * 시즌 조직 구성 데이터 검증
 * 국(gook)/그룹(group)/순(soon)/전화번호/역할/생년월일을 각각 검증하고 변환합니다.
 */
import { db } from '../../../db';
import { roles } from '../../../db/schema/role';
import { BadRequestError } from '../../../utils/errors';
import { DEFAULT_ROLE_NAME } from '../../shared/constants';

export interface SeasonDataItem {
  gook: string;
  group: string;
  soon: string;
  name: string;
  nameSuffix?: string;
  phoneNumber?: string;
  birthDate?: string;
  role?: string;
}

/** 모든 검증을 순차 실행하고 변환된 데이터를 반환합니다. */
export async function validateNewSeasonData(data: SeasonDataItem[]): Promise<SeasonDataItem[]> {
  validateGook(data);
  validateGroup(data);
  validateSoon(data);
  validatePhone(data);
  await validateRole(data);
  validateBirthDate(data);
  return data;
}

function validateGook(data: SeasonDataItem[]) {
  for (const [i, item] of data.entries()) {
    if (!item.gook?.trim()) {
      throw new BadRequestError(`${i + 1}번째 데이터에 gook 값이 없습니다.`);
    }
    if (item.gook.includes('청년')) {
      item.gook = item.gook.replace('청년', '').trim();
    }
  }
}

function validateGroup(data: SeasonDataItem[]) {
  for (const [i, item] of data.entries()) {
    if (!item.group?.trim()) {
      throw new BadRequestError(`${i + 1}번째 데이터에 group 값이 없습니다.`);
    }
    if (!item.group.endsWith('그룹')) {
      throw new BadRequestError(
        `${i + 1}번째 group이 '그룹'으로 끝나지 않습니다. (현재: ${item.group})`,
      );
    }
  }
}

function validateSoon(data: SeasonDataItem[]) {
  for (const [i, item] of data.entries()) {
    if (!item.soon?.trim()) {
      throw new BadRequestError(`${i + 1}번째 데이터에 soon 값이 없습니다.`);
    }
    if (!item.soon.endsWith('순')) {
      throw new BadRequestError(
        `${i + 1}번째 soon이 '순'으로 끝나지 않습니다. (현재: ${item.soon})`,
      );
    }
  }
}

const PHONE_REGEX = /^[\d-]+$/;
const INVISIBLE_CHARS = /(\u200B|\u200C|\u200D|\uFEFF|\u00A0)/g;

function validatePhone(data: SeasonDataItem[]) {
  for (const [i, item] of data.entries()) {
    if (!item.phoneNumber?.trim()) continue;
    const phone = item.phoneNumber.trim().replace(INVISIBLE_CHARS, '');
    if (!PHONE_REGEX.test(phone)) {
      throw new BadRequestError(
        `${i + 1}번째 phoneNumber 형식이 올바르지 않습니다. (현재: ${item.phoneNumber})`,
      );
    }
    item.phoneNumber = phone.replaceAll('-', '').replaceAll(' ', '');
  }
}

async function validateRole(data: SeasonDataItem[]) {
  const validRoles = await db.select({ name: roles.name }).from(roles);
  const validNames = validRoles.map((r) => r.name);

  for (const [i, item] of data.entries()) {
    if (!item.role?.trim()) {
      item.role = DEFAULT_ROLE_NAME;
    } else if (!validNames.includes(item.role)) {
      throw new BadRequestError(
        `${i + 1}번째 role이 올바르지 않습니다. (현재: ${item.role}, 허용: ${validNames.join(', ')})`,
      );
    }
  }
}

const TWO_DIGIT_REGEX = /^\d{2}$/;

function validateBirthDate(data: SeasonDataItem[]) {
  for (const [i, item] of data.entries()) {
    if (!item.birthDate?.toString().trim()) continue;
    const s = item.birthDate.toString().trim();
    if (!TWO_DIGIT_REGEX.test(s)) {
      throw new BadRequestError(
        `${i + 1}번째 birthDate가 두자리 숫자가 아닙니다. (현재: ${item.birthDate})`,
      );
    }
    const y = Number.parseInt(s, 10);
    item.birthDate = y <= 50 ? `20${s}-01-01` : `19${s}-01-01`;
  }
}
