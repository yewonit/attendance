import { Op } from "sequelize";
import models from "../../models/models.js";
import { sequelize } from "../../utils/database.js";
import { NotFoundError, ValidationError } from "../../utils/errors.js";
import { getCurrentSeasonId } from "../../utils/season.js";

const seasonService = {
  createNewSeason: async (data) => {
    validateNewSeasonData(data);

    // 새로운 회기 생성 또는 조회
    const seasonId = await createNewSeason();

    // 중복 생성 방지를 위한 기존 데이터 삭제 및 새로운 조직 및 사용자 역할 생성을 하나의 트랜잭션으로 처리
    await sequelize.transaction(async (t) => {
      await deleteBeforeCreateOrganization(seasonId, t);
      await createOrganizationAndUserRole(data, seasonId, t);
    });
  },

  /**
   * 다음 회기에서 사용자의 조직 정보를 조회
   * - 동명이인이 있을 경우 모든 사용자의 정보를 배열로 반환
   * - 프론트엔드에서 이름과 생일로 본인을 선택할 수 있도록 birth_date 포함
   * 
   * @param {string} name - 조회할 사용자 이름 (userId가 없을 때 사용)
   * @param {number} userId - 조회할 사용자 ID (우선순위: userId > name)
   * @returns {Promise<Array<Object>>} 사용자들의 조직 정보 및 조직 구성원 목록 배열
   * @throws {NotFoundError} 다음 회기가 없거나 사용자를 찾을 수 없는 경우
   */
  getNextOrganization: async (name, userId) => {
    const currentSeason = getCurrentSeasonId();
    const nextSeason = currentSeason + 1;

    // 다음 회기 존재 여부 확인
    const season = await models.Season.findOne({
      where: {
        id: nextSeason,
      },
    });
    if (!season) {
      throw new NotFoundError("다음 회기를 찾을 수 없습니다.");
    }

    // userId 또는 name 기반으로 사용자 조회 조건 설정
    const userWhere = userId
      ? { id: userId }
      : { name: name };

    // 다음 회기에서 해당 사용자 조회 (조직 포함)
    // UserRole을 먼저 조회하고 User, Organization, Role을 include하는 방식으로 변경
    const userRoles = await models.UserRole.findAll({
      include: [
        {
          model: models.User,
          as: "user",
          required: true,
          where: userWhere,
          attributes: ["id", "name", "phone_number", "birth_date"],
        },
        {
          model: models.Organization,
          as: "organization",
          required: true,
          where: {
            season_id: nextSeason,
            is_deleted: false,
          },
          attributes: ["id", "name", "upper_organization_id"],
        },
        {
          model: models.Role,
          as: "role",
          required: true,
          attributes: ["id", "name"],
        },
      ],
    });

    // UserRole을 User별로 그룹화
    const usersMap = new Map();
    for (const userRole of userRoles) {
      const userId = userRole.user.id;
      if (!usersMap.has(userId)) {
        usersMap.set(userId, {
          ...userRole.user.toJSON(),
          userRoles: [],
        });
      }
      usersMap.get(userId).userRoles.push(userRole);
    }
    const users = Array.from(usersMap.values());

    // 사용자를 찾을 수 없는 경우
    if (!users || users.length === 0) {
      const searchCriteria = userId ? `userId: ${userId}` : `이름: ${name}`;
      throw new NotFoundError(`다음 회기에 ${searchCriteria} 사용자를 찾을 수 없습니다.`);
    }

    // 각 사용자의 조직 정보를 조회하여 배열로 반환
    const results = [];

    for (const user of users) {
      const userRole = user.userRoles[0]; // 해당 season의 UserRole (배열의 첫 번째 요소)
      const userOrgId = userRole.organization.id;
      const userOrgUpperOrgId = userRole.organization.upper_organization_id;

      // 그룹장 조회
      const groupLeaderRole = await models.UserRole.findOne({
        include: [
          {
            model: models.User,
            as: "user",
            required: true,
            attributes: ["id", "name", "phone_number", "birth_date"],
          },
          {
            model: models.Organization,
            as: "organization",
            required: true,
            where: {
              upper_organization_id: userOrgUpperOrgId,
            },
            attributes: ["id", "name"],
          },
          {
            model: models.Role,
            as: "role",
            required: true,
            where: {
              id: 1, // 그룹장
            },
            attributes: ["id", "name", "sort_order"],
          },
        ],
      });

      const groupLeader = groupLeaderRole ? {
        ...groupLeaderRole.user.toJSON(),
        userRoles: [groupLeaderRole],
      } : null;

      // 그룹장을 찾을 수 없는 경우 해당 사용자는 건너뜀
      if (!groupLeader) {
        continue;
      }

      // 같은 조직의 구성원들 조회
      const sameOrgUserRoles = await models.UserRole.findAll({
        include: [
          {
            model: models.User,
            as: "user",
            required: true,
            attributes: ["id", "name", "phone_number", "birth_date"],
          },
          {
            model: models.Organization,
            as: "organization",
            required: true,
            where: {
              id: userOrgId,
            },
            attributes: ["id", "name"],
          },
          {
            model: models.Role,
            as: "role",
            required: true,
            attributes: ["id", "name", "sort_order"],
          },
        ],
      });

      // UserRole을 User별로 그룹화
      const sameOrgUsersMap = new Map();
      for (const userRole of sameOrgUserRoles) {
        const userId = userRole.user.id;
        if (!sameOrgUsersMap.has(userId)) {
          sameOrgUsersMap.set(userId, {
            ...userRole.user.toJSON(),
            userRoles: [],
          });
        }
        sameOrgUsersMap.get(userId).userRoles.push(userRole);
      }
      const sameOrgUsers = Array.from(sameOrgUsersMap.values());

      // JavaScript에서 정렬 (sort_order 순, 그 다음 이름 순)
      sameOrgUsers.sort((a, b) => {
        // 먼저 sort_order로 정렬
        const sortOrderA = a.userRoles[0]?.role?.sort_order ?? 999;
        const sortOrderB = b.userRoles[0]?.role?.sort_order ?? 999;
        const sortOrderCompare = sortOrderA - sortOrderB;
        if (sortOrderCompare !== 0) return sortOrderCompare;

        // sort_order가 같으면 이름으로 정렬
        return a.name.localeCompare(b.name);
      });

      // 조직 구성원 목록 생성 (그룹장 + 같은 조직 구성원)
      // sameOrgUsers에 이미 같은 이름과 같은 핸드폰 번호의 유저가 있는지 확인
      const isGroupLeaderInSameOrg = sameOrgUsers.some(
        (member) =>
          member.name === groupLeader.name &&
          member.phone_number === groupLeader.phone_number
      );

      const orgPeople = [
        // groupLeader가 sameOrgUsers에 없을 때만 추가
        ...(isGroupLeaderInSameOrg
          ? []
          : [
            {
              name: groupLeader.name,
              role: groupLeader.userRoles[0].role.name,
              phoneNumber: groupLeader.phone_number,
              birthYear: groupLeader.birth_date
                ? new Date(groupLeader.birth_date).getFullYear().toString().slice(-2)
                : null,
            },
          ]),
        ...sameOrgUsers.map((member) => ({
          name: member.name,
          role: member.userRoles[0].role.name,
          phoneNumber: member.phone_number,
          birthYear: member.birth_date
            ? new Date(member.birth_date).getFullYear().toString().slice(-2)
            : null,
        })),
      ];

      // 결과에 추가
      results.push({
        name: user.name,
        birthYear: user.birth_date ? new Date(user.birth_date).getFullYear().toString().slice(-2) : null, // 프론트엔드에서 동명이인 구분용
        phoneNumber: user.phone_number,
        role: userRole.role.name,
        organization: userRole.organization.name,
        organizationPeople: orgPeople,
      });
    }

    return results;
  },

  getAllNationsOrgList: async () => {
    const currentSeason = getCurrentSeasonId();

    const orgList = await models.Organization.findAll({
      where: {
        season_id: currentSeason,
        is_deleted: false,
        name: {
          [Op.and]: [
            {
              [Op.or]: [
                { [Op.like]: '237국_%' },
                { [Op.like]: '올네이션스국_%' }
              ]
            },
            { [Op.like]: '%순' }
          ],
        },
      },
      attributes: ["id", "name"],
    });

    return orgList;
  },
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

const deleteBeforeCreateOrganization = async (seasonId, transaction) => {
  // 해당 seasonId를 가진 기존 데이터 삭제
  // 1. 해당 seasonId를 가진 모든 organization 조회
  const existingOrganizations = await models.Organization.findAll({
    where: {
      season_id: seasonId,
      is_deleted: false,
    },
    attributes: ['id'],
    transaction,
  });

  const organizationIds = existingOrganizations.map(org => org.id);

  // 2. 해당 organization들과 연관된 user_role 삭제
  if (organizationIds.length > 0) {
    await models.UserRole.destroy({
      where: {
        organization_id: organizationIds,
      },
      transaction,
    });

    // 3. 해당 seasonId를 가진 organization 삭제
    await models.Organization.destroy({
      where: {
        season_id: seasonId,
        is_deleted: false,
      },
      transaction,
    });
  }
}

// 조직 생성을 위한 헬퍼 함수
const findOrCreateOrganization = async (name, upperOrgId, seasonId, transaction) => {
  let org = await models.Organization.findOne({
    where: {
      season_id: seasonId,
      name: name,
      upper_organization_id: upperOrgId,
      is_deleted: false,
    },
    transaction,
  });

  if (!org) {
    org = await models.Organization.create({
      season_id: seasonId,
      name: name,
      upper_organization_id: upperOrgId,
      is_deleted: false,
    }, { transaction });
  }

  return org;
};

const createOrganizationAndUserRole = async (data, seasonId, transaction) => {
  // 루트 조직 (코람데오 청년선교회) 생성
  const rootOrganization = await models.Organization.create({
    season_id: seasonId,
    name: '코람데오 청년선교회',
    upper_organization_id: 1,
    is_deleted: false,
  }, { transaction });

  const allUsers = await models.User.findAll({
    where: {
      is_deleted: false,
    },
    attributes: ['id', 'name', 'name_suffix', 'phone_number', 'birth_date'],
    transaction,
  });

  const allRoles = await models.Role.findAll({
    where: {
      is_deleted: false,
    },
    attributes: ['id', 'name'],
    transaction,
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
      const gookOrg = await findOrCreateOrganization(gook, rootOrganization.id, seasonId, transaction);
      gookOrganizations.set(gook, gookOrg);
    }
    const gookOrganization = gookOrganizations.get(gook);

    // 2단계: 그룹 조직 생성 또는 조회
    const groupKey = `${gook}_${group}`;
    if (!groupOrganizations.has(groupKey)) {
      const groupOrg = await findOrCreateOrganization(groupKey, gookOrganization.id, seasonId, transaction);
      groupOrganizations.set(groupKey, groupOrg);
    }
    const groupOrganization = groupOrganizations.get(groupKey);

    // 3단계: 순 조직 생성 (항상 생성, 중복 체크는 이름으로만)
    const soonKey = `${gook}_${group}_${soon}`;
    if (!soonOrganizations.has(soonKey)) {
      const soonOrg = await findOrCreateOrganization(soonKey, groupOrganization.id, seasonId, transaction);
      soonOrganizations.set(soonKey, soonOrg);
    }
    const soonOrganization = soonOrganizations.get(soonKey);

    // 4단계: 사용자 역할 생성
    await createUserRole(item, soonOrganization.id, allUsers, allRoles, transaction);
  }
}

const createUserRole = async (item, organizationId, allUsers, allRoles, transaction) => {
  // 우선 allUser에서 item의 이름을 가진 사용자가 한 명인지 확인
  let user = null;
  let users = allUsers.filter(user => user.name === item.name);

  // 사용자를 찾을 수 없는 경우
  if (users.length === 0) {
    throw new ValidationError(`${item.name} (전화번호: ${item.phone_number}) 사용자를 찾을 수 없습니다.`);
  }
  // 만약 한 명이 아니라면 name_suffix와 phone_number를 사용하여 특정 사용자를 찾음
  else if (users.length > 1) {
    // name_suffix로 먼저 찾기 (item.name_suffix가 없으면 undefined === "" 비교가 false가 됨)
    if (item.name_suffix) {
      user = users.find(u => u.name_suffix === item.name_suffix);
    }

    if (!user && item.phone_number) {
      user = users.find(u => u.phone_number === item.phone_number);
    }

    if (!user && item.birth_date) {
      user = users.find(u => u.birth_date === item.birth_date);
    }

    if (!user) {
      throw new ValidationError(`${item.name} (전화번호: ${item.phone_number}) 한 명으로 특정이 불가능합니다.`);
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
  }, { transaction });
}

export default seasonService;
