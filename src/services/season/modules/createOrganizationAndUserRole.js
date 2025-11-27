import models from "../../../models/models.js";
import { ValidationError } from "../../../utils/errors.js";
import { Op } from "sequelize";

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
  const userIds = [];

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
    let userId = await createUserRole(item, soonOrganization.id, allUsers, allRoles, transaction);
    userIds.push(userId);
  }

  // 5단계: userIds에 포함되지 않는 사용자들의 UserAttendanceAggregate를 비활성화
  await models.UserAttendanceAggregate.update(
    { is_disabled: true },
    {
      where: {
        user_id: {
          [Op.notIn]: userIds,
        },
      },
      transaction,
    }
  );
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
    let filteredUsers;

    if (!user && item.phone_number) {
      filteredUsers = users.filter(u => u.phone_number === item.phone_number);
      if (filteredUsers.length === 1) {
        user = filteredUsers[0];
      }
      if (filteredUsers.length > 1) {
        throw new ValidationError(`${item.name} (전화번호: ${item.phone_number}) 한 명으로 특정이 불가능합니다.`);
      }
    }

    if (!user && item.birth_date) {
      filteredUsers = users.filter(u => u.birth_date === item.birth_date);
      if (filteredUsers.length === 1) {
        user = filteredUsers[0];
      }
      if (filteredUsers.length > 1) {
        throw new ValidationError(`${item.name} (생년월일: ${item.birth_date}) 한 명으로 특정이 불가능합니다.`);
      }
    }

    if (item.name_suffix) {
      filteredUsers = users.filter(u => u.name_suffix === item.name_suffix);
      if (filteredUsers.length === 1) {
        user = filteredUsers[0];
      }
      if (filteredUsers.length > 1) {
        throw new ValidationError(`${item.name} (이름 접미사: ${item.name_suffix}) 한 명으로 특정이 불가능합니다.`);
      }
    }

    if (!user) {
      throw new ValidationError(`${item} 한 명으로 특정이 불가능합니다.`);
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

  return user.id;
}

export { createOrganizationAndUserRole };
