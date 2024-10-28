// User.Ctrl.js
const models = require("../../../models/models"); // 실제 경로에 맞게 수정해야 합니다.
const crudController = require("../common/crud.Ctrl");

// 📝 사용자 정보 유효성 검사 함수
const validateUserInfo = async (data) => {
  // 🔒 필수 필드 검증
  if (!data.name) {
    const error = new Error("사용자 이름이 누락되었습니다. 😢");
    error.status = 400;
    throw error;
  }
  if (!data.email) {
    const error = new Error("사용자 이메일 주소가 누락되었습니다. 📧");
    error.status = 400;
    throw error;
  }
  if (!data.password) {
    const error = new Error("사용자 비밀번호가 누락되었습니다. 🔑");
    error.status = 400;
    throw error;
  }

  // ✅ 추가 유효성 검사 로직
  // 추가적인 유효성 검사 로직을 구현할 수 있습니다.
};

// 📦 사용자 관련 컨트롤러 모듈
const userController = {
  // ✨ 사용자 생성
  createUser: crudController.create(models.User, validateUserInfo),

  // 📖 전체 사용자 조회
  readUsers: crudController.readAll(models.User),

  // 🔍 특정 사용자 조회
  readUser: crudController.readOne(models.User),

  // ✏️ 사용자 정보 업데이트
  updateUser: crudController.update(models.User, validateUserInfo),

  // 🗑️ 사용자 삭제
  deleteUser: crudController.delete(models.User),

  // 🔍 이름으로 사용자 조회
  getUserByName: async (req, res, next) => {
    console.log("🔥 getUserByName 함수 시작");
    try {
      const encodedName = req.query.name;
      console.log("인코딩된 이름:", encodedName);

      const name = decodeURIComponent(encodedName);
      console.log("디코딩된 이름:", name);

      // 콘솔에 빨간색으로 이름을 로그로 출력합니다.
      console.log("\x1b[31m%s\x1b[0m", `처리될 이름: ${name}`);

      if (!name) {
        console.log("이름이 제공되지 않음");
        res.status(400).json({ message: "이름이 제공되지 않았습니다." });
        return;
      }

      const user = await models.User.findOne({ where: { name } });
      if (user) {
        console.log(`사용자 찾음: ${user.name}`);
        res.status(200).json({ message: "이름이 있습니다." });
      } else {
        console.log("사용자를 찾을 수 없음");
        res.status(200).json({ message: "이름이 없습니다." });
      }
    } catch (error) {
      console.error("오류 발생:", error);
      next(error);
    }
  },

  // 📞 전화번호로 사용자 일치 여부 확인
  checkUserPhoneNumber: async (req, res, next) => {
    try {
      const { name, phoneNumber } = req.body;

      // 이름이나 전화번호가 제공되지 않은 경우 에러 응답
      if (!name || !phoneNumber) {
        return res
          .status(400)
          .json({ message: "이름 또는 전화번호가 제공되지 않았습니다." });
      }

      // 1단계: 사용자 찾기
      const user = await models.User.findOne({
        where: { name, phone_number: phoneNumber },
        attributes: { exclude: ["password"] },
      });

      // 사용자가 존재하지 않는 경우
      if (!user) {
        return res.status(200).json({
          message: "사용자 정보가 일치하지 않습니다.",
          isMatched: false,
        });
      }

      // 2단계: UserHasRole에서 역할 정보 찾기
      const userHasRoles = await models.UserHasRole.findAll({
        where: { user_id: user.id },
        attributes: [
          "id",
          "role_id",
          "organization_id",
          "role_start_date",
          "role_end_date",
        ],
      });

      // 3단계: 역할 및 조직 정보 찾기
      const rolesWithOrganization = await Promise.all(
        userHasRoles.map(async (userHasRole) => {
          // 역할 정보 찾기
          const role = await models.Role.findOne({
            where: { id: userHasRole.role_id },
            attributes: ["id", "role_name", "created_at"],
          });

          // 조직 정보 찾기
          const organization = await models.Organization.findOne({
            where: { id: userHasRole.organization_id },
            attributes: [
              "id",
              "organization_name",
              "organization_description",
              "organization_code",
            ],
          });

          // 역할 및 조직 정보를 반환
          return {
            userHasRoleId: userHasRole.id,
            roleId: role.id,
            roleStart: userHasRole.role_start_date,
            roleEnd: userHasRole.role_end_date,
            roleName: role.role_name,
            roleCreatedAt: role.created_at,
            organizationId: organization.id,
            organizationName: organization.organization_name,
            organizationCode: organization.organization_code,
            organizationDescription: organization.organization_description,
          };
        })
      );

      // 최종 사용자 데이터 구성
      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phone_number,
        roles: rolesWithOrganization,
      };

      // 프론트엔드로 응답 전송
      res.status(200).json({
        message: "사용자 정보가 일치합니다.",
        isMatched: true,
        userData: userData,
      });
    } catch (error) {
      // 오류 발생 시 처리
      next(error);
    }
  },

  // 🎨 추가 사용자 관련 기능 예시
  // 추가적인 사용자 관련 기능을 구현할 수 있습니다.
};

// 📤 모듈 내보내기
module.exports = userController;
