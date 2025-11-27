import { ValidationError } from "../../../utils/errors.js";

const validateNewSeasonData = (data) => {
  validateGook(data);
  validateGroup(data);
  validateSoon(data);
  validatePhone(data);
  validateRole(data);
  validateBirthDate(data);
  return data
}

/**
 * 국(gook) 데이터 검증 및 변환
 * - 모든 데이터에 gook 값이 있는지 체크
 * - '청년 1국' 형식을 '1국'으로 변환
 */
const validateGook = (data) => {
  data.forEach((item, index) => {
    if (!item.gook || item.gook.trim() === '') {
      throw new ValidationError(`${index + 1}번째 데이터에 gook 값이 없습니다.`);
    }

    // '청년 1국' -> '1국' 변환
    if (item.gook.includes('청년')) {
      item.gook = item.gook.replace('청년', '').trim();
    }
  });

  return data;
}

/**
 * 그룹(group) 데이터 검증
 * - 모든 데이터에 group 값이 있는지 체크
 * - group 값이 '그룹'으로 끝나는지 체크
 */
const validateGroup = (data) => {
  data.forEach((item, index) => {
    if (!item.group || item.group.trim() === '') {
      throw new ValidationError(`${index + 1}번째 데이터에 group 값이 없습니다.`);
    }

    if (!item.group.endsWith('그룹')) {
      throw new ValidationError(
        `${index + 1}번째 데이터의 group 값이 '그룹'으로 끝나지 않습니다. (현재 값: ${item.group})`
      );
    }
  });

  return data;
}

/**
 * 순(soon) 데이터 검증
 * - 모든 데이터에 soon 값이 있는지 체크
 * - soon 값이 '순'으로 끝나는지 체크
 */
const validateSoon = (data) => {
  data.forEach((item, index) => {
    if (!item.soon || item.soon.trim() === '') {
      throw new ValidationError(`${index + 1}번째 데이터에 soon 값이 없습니다.`);
    }

    if (!item.soon.endsWith('순')) {
      throw new ValidationError(
        `${index + 1}번째 데이터의 soon 값이 '순'으로 끝나지 않습니다. (현재 값: ${item.soon})`
      );
    }
  });

  return data;
}

/**
 * 전화번호(phone_number) 데이터 검증 및 변환
 * - phone_number 값이 있다면 전화번호 형식인지 체크
 * - 모든 '-'와 공백을 제거하여 숫자만 남김
 */
const validatePhone = (data) => {
  const phoneRegex = /^[\d-]+$/;

  data.forEach((item, index) => {
    if (item.phone_number && item.phone_number.trim() !== '') {
      // 앞뒤 공백 및 보이지 않는 문자 제거
      let phoneNumber = item.phone_number.trim();

      // 보이지 않는 문자 제거 (zero-width space, non-breaking space 등)
      phoneNumber = phoneNumber.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '');

      // 전화번호 형식 체크 (숫자와 '-'만 허용)
      if (!phoneRegex.test(phoneNumber)) {
        throw new ValidationError(
          `${index + 1}번째 데이터의 phone_number 값이 올바른 전화번호 형식이 아닙니다. (현재 값: ${item.phone_number})`
        );
      }

      // 모든 '-'와 공백 제거하여 숫자만 남김
      item.phone_number = phoneNumber.replaceAll("-", "").replaceAll(" ", "");
    }
  });

  return data;
}

/**
 * 역할(role) 데이터 검증 및 설정
 * - role 값이 없다면 '순원'으로 설정
 * - 있다면 정해진 역할 중 하나인지 체크
 */
const validateRole = (data) => {
  const validRoles = ['국장', '그룹장', '부그룹장', '순장', '부순장', '순원'];

  data.forEach((item, index) => {
    if (!item.role || item.role.trim() === '') {
      // role 값이 없으면 '순원'으로 설정
      item.role = '순원';
    } else {
      // role 값이 있으면 유효한 값인지 체크
      if (!validRoles.includes(item.role)) {
        throw new ValidationError(
          `${index + 1}번째 데이터의 role 값이 올바르지 않습니다. (현재 값: ${item.role}, 허용 값: ${validRoles.join(', ')})`
        );
      }
    }
  });

  return data;
}

/**
 * 생년월일(birth_date) 데이터 검증 및 변환
 * - birth_date 값이 있다면 두자리 숫자인지 체크
 * - 20 이하인 경우: 20xx-01-01로 변환
 * - 21 이상인 경우: 19xx-01-01로 변환
 */
const validateBirthDate = (data) => {
  const twoDigitRegex = /^\d{2}$/;

  data.forEach((item, index) => {
    if (item.birth_date && item.birth_date.toString().trim() !== '') {
      const birthDateStr = item.birth_date.toString().trim();

      // 두자리 숫자인지 체크
      if (!twoDigitRegex.test(birthDateStr)) {
        throw new ValidationError(
          `${index + 1}번째 데이터의 birth_date 값이 두자리 숫자가 아닙니다. (현재 값: ${item.birth_date})`
        );
      }

      const year = parseInt(birthDateStr, 10);

      // 50 이하면 2000년대, 51 이상이면 1900년대
      if (year <= 50) {
        item.birth_date = `20${birthDateStr}-01-01`;
      } else {
        item.birth_date = `19${birthDateStr}-01-01`;
      }
    }
  });

  return data;
}

export { validateNewSeasonData };
