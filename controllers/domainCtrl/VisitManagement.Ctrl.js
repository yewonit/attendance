const { Visitation } = require("../../models/models");

const VisitManagementCtrl = {
  getVisitPost: async (req, res) => {
    console.log("🔥 check");
    try {
      const { id } = req.params; // URL에서 id 추출

      // Visitation 모델을 사용하여 visitee_id로 필터링합니다.
      const visitations = await Visitation.findAll({
        where: {
          visitee_id: id,
          is_deleted: "N", // 삭제되지 않은 데이터만 조회
        },
        attributes: [
          "id",
          "visitor_id",
          "visitee_id",
          "visitation_date",
          "visitation_content",
          "created_at",
          "updated_at",
          "creator_id",
          "updater_id",
          "creator_ip",
          "updater_ip",
          "access_service_id",
        ],
      });

      // 조회된 데이터가 없을 경우 404 상태 코드와 메시지를 반환합니다.
      if (visitations.length === 0) {
        return res
          .status(200)
          .json({ message: "심방 정보가 존재하지 않습니다.", data: [] });
      }

      // 조회된 데이터를 JSON 배열로 변환하여 200 상태 코드와 함께 반환합니다.
      return res.status(200).json(visitations);
    } catch (error) {
      console.error("심방 정보 조회 중 오류 발생:", error);
      return res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
  },
};

module.exports = VisitManagementCtrl;
