import { ValidationError } from "../../utils/errors.js";
import models from "../../models/models.js";

const seasonService = {
  createNewSeason: async (data) => {
    validateNewSeasonData(data);
    
    // 새로운 회기 생성 또는 조회
    const seasonId = await createNewSeason();
    
    // 중복 생성 방지를 위한 기존 데이터 삭제
    await deleteBeforeCreateOrganization(seasonId);
    
    // 새로운 조직 및 사용자 역할 생성
    await createOrganizationAndUserRole(data, seasonId);
  }
};

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
 * 전화번호(phone) 데이터 검증 및 변환
 * - phone 값이 있다면 전화번호 형식인지 체크
 * - 모든 '-'를 제거하여 숫자만 남김
 */
const validatePhone = (data) => {
  const phoneRegex = /^[\d-]+$/;
  
  data.forEach((item, index) => {
    if (item.phone && item.phone.trim() !== '') {
      // 전화번호 형식 체크 (숫자와 '-'만 허용)
      if (!phoneRegex.test(item.phone)) {
        throw new ValidationError(
          `${index + 1}번째 데이터의 phone 값이 올바른 전화번호 형식이 아닙니다. (현재 값: ${item.phone})`
        );
      }
      
      // 모든 '-' 제거
      item.phone = item.phone.replaceAll("-", "");
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

/**
 * 새로운 회기 생성 또는 조회
 * - 현재 년도 + 1 한 년도가 season 테이블에 name으로 존재하는지 체크
 * - 존재하면 해당 데이터의 id를 반환
 * - 존재하지 않으면 새로운 회기를 생성하고 id를 반환
 * 
 * @returns {Promise<number>} 회기 ID
 */
const createNewSeason = async () => {
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  const seasonName = nextYear.toString();
  
  // 해당 년도의 회기가 이미 존재하는지 체크
  let season = await models.Season.findOne({
    where: {
      name: seasonName,
      is_deleted: false,
    },
  });
  
  // 존재하지 않으면 새로운 회기 생성
  if (!season) {
    season = await models.Season.create({
      name: seasonName,
      is_deleted: false,
    });
  }
  
  return season.id;
}

const deleteBeforeCreateOrganization = async (seasonId) => {
  // 해당 seasonId를 가진 기존 데이터 삭제
  // 1. 해당 seasonId를 가진 모든 organization 조회
  const existingOrganizations = await models.Organization.findAll({
    where: {
      season_id: seasonId,
      is_deleted: false,
    },
    attributes: ['id'],
  });
  
  const organizationIds = existingOrganizations.map(org => org.id);
  
  // 2. 해당 organization들과 연관된 user_role 삭제
  if (organizationIds.length > 0) {
    await models.UserRole.destroy({
      where: {
        organization_id: organizationIds,
      },
    });
    
    // 3. 해당 seasonId를 가진 organization 삭제
    await models.Organization.destroy({
      where: {
        season_id: seasonId,
        is_deleted: false,
      },
    });
  }
}

// 조직 생성을 위한 헬퍼 함수
const findOrCreateOrganization = async (name, upperOrgId) => {
  let org = await models.Organization.findOne({
    where: {
      season_id: seasonId,
      name: name,
      upper_organization_id: upperOrgId,
      is_deleted: false,
    },
  });
  
  if (!org) {
    org = await models.Organization.create({
      season_id: seasonId,
      name: name,
      upper_organization_id: upperOrgId,
      is_deleted: false,
    });
  }
  
  return org;
};

const createOrganizationAndUserRole = async (data, seasonId) => {
  // 루트 조직 (코람데오 청년선교회) 생성
  const rootOrganization = await models.Organization.create({
    season_id: seasonId,
    name: '코람데오 청년선교회',
    upper_organization_id: 1,
    is_deleted: false,
  });

  const allUsers = await models.User.findAll({
    where: {
      is_deleted: false,
    },
    attributes: ['id', 'name', 'name_suffix', 'phone_number'],
  });

  const allRoles = await models.Role.findAll({
    where: {
      is_deleted: false,
    },
    attributes: ['id', 'name'],
  });
  
  // 이미 생성된 조직을 추적하기 위한 Map
  const gookOrganizations = new Map();
  const groupOrganizations = new Map();
  const soonOrganizations = new Map();
  
  // 데이터를 순회하며 계층 구조 생성
  for (const item of data) {
    const { gook, group, soon } = item;
    
    // 1단계: 국(gook) 조직 생성 또는 조회
    if (!gookOrganizations.has(gook)) {
      const gookOrg = await findOrCreateOrganization(gook, rootOrganization.id);
      gookOrganizations.set(gook, gookOrg);
    }
    const gookOrganization = gookOrganizations.get(gook);
    
    // 2단계: 그룹 조직 생성 또는 조회
    const groupKey = `${gook}_${group}`;
    if (!groupOrganizations.has(groupKey)) {
      const groupOrg = await findOrCreateOrganization(groupKey, gookOrganization.id);
      groupOrganizations.set(groupKey, groupOrg);
    }
    const groupOrganization = groupOrganizations.get(groupKey);
    
    // 3단계: 순 조직 생성 (항상 생성, 중복 체크는 이름으로만)
    const soonKey = `${gook}_${group}_${soon}`;
    if (!soonOrganizations.has(soonKey)) {
      const soonOrg = await findOrCreateOrganization(soonKey, groupOrganization.id);
      soonOrganizations.set(soonKey, soonOrg);
    }
    const soonOrganization = soonOrganizations.get(soonKey);

    // 4단계: 사용자 역할 생성
    await createUserRole(item, soonOrganization.id, allUsers, allRoles);
  }
}

const createUserRole = async (item, organizationId, allUsers, allRoles) => {
  // 우선 allUser에서 item의 이름을 가진 사용자가 한 명인지 확인
  let user = null;
  const users = allUsers.filter(user => user.name === item.name);
  // 만약 한 명이 아니라면 name_suffix와 phone_number를 사용하여 특정 사용자를 찾음
  if (users.length > 1) {
    user = allUsers.find(user => (user.name === item.name && user.name_suffix === item.name_suffix) || (user.name === item.name && user.phone_number === item.phone));
    if (!user) {
      throw new ValidationError(`${item.name} ${item.phone} 사용자를 찾을 수 없거나 한 명으로 특정이 불가능합니다.`);
    }
  } else {
    user = users[0];
  }

  const role = allRoles.find(role => role.name === item.role);
  if (!role) {
    throw new ValidationError(`${item.role} 역할을 찾을 수 없습니다.`);
  }

  await models.UserRole.create({
    user_id: user.id,
    role_id: role.id,
    organization_id: organizationId,
  });
}

export default seasonService;

