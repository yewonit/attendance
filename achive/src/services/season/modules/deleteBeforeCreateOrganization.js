import models from "../../../models/models.js";

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

export { deleteBeforeCreateOrganization };
