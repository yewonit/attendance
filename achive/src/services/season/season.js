import { Op } from "sequelize";
import models from "../../models/models.js";
import { sequelize } from "../../utils/database.js";
import { NotFoundError } from "../../utils/errors.js";
import { createNewSeason } from "./modules/createNewSeason.js";
import { createOrganizationAndUserRole } from "./modules/createOrganizationAndUserRole.js";
import { deleteBeforeCreateOrganization } from "./modules/deleteBeforeCreateOrganization.js";
import { validateNewSeasonData } from "./modules/validate.js";

const seasonService = {
  createNewSeason: async (data) => {
    await validateNewSeasonData(data);

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
  async getNextOrganization(name, userId) {
    const currentSeasonId = await this.getCurrentSeasonId();
    const nextSeason = currentSeasonId + 1;

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

  async getCurrentSeasonId() {
    const now = new Date();
    const currentSeason = await models.Season.findOne({
      where: {
        is_deleted: false,
        start_date: {
          [Op.lte]: now,
        },
        end_date: {
          [Op.gte]: now,
        },
      },
      attributes: ["id"],
    });
    if (!currentSeason) {
      throw new NotFoundError("현재 회기를 찾을 수 없습니다.");
    }
    return currentSeason.id;
  }
};

export default seasonService;
