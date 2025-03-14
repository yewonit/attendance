// crud.Ctrl.js

const {
  ValidationError,
  UniqueConstraintError,
  ForeignKeyConstraintError,
} = require("sequelize");

// 📝 공통 CRUD 컨트롤러 모듈
const crudController = {
  // ✅ 데이터 생성 함수
  create: (model, validateData) => async (req, res, next) => {
    try {
      // 📊 입력 데이터 유효성 검사
      if (validateData) {
        await validateData(req.body);
      }

      // ✨ 데이터 생성
      const data = await model.create(req.body);

      // 📨 응답 데이터 전송
      res.status(201).json({ data, message: "생성 완료" });
    } catch (error) {
      // 🚨 에러 처리
      await handleError(error, req, res, next);
    }
  },

  // 📖 데이터 조회 함수
  readAll: (model) => async (req, res, next) => {
    try {
      // 📚 모든 데이터 조회
      const data = await model.findAll();

      // 📨 응답 데이터 전송
      res.status(200).json({ data, message: "조회 완료" });
    } catch (error) {
      // 🚨 에러 처리
      await handleError(error, req, res, next);
    }
  },

  // 🔍 특정 데이터 조회 함수
  readOne: (model) => async (req, res, next) => {
    try {
      // 🔎 특정 데이터 조회
      // req.params.id를 사용하여 URL 경로에서 ID를 가져옵니다.
      const data = await model.findByPk(req.params.id);

      // 📊 조회 결과 확인
      if (data) {
        // 📨 응답 데이터 전송
        res.status(200).json({ data, message: "조회 완료" });
      } else {
        // 🙅‍♂️ 데이터를 찾을 수 없음
        const error = new Error("리소스(DB데이터를)를 찾을 수 없음");
        error.status = 404;
        throw error;
      }
    } catch (error) {
      // 🚨 에러 처리
      await handleError(error, req, res, next);
    }
  },

  // ✏️ 데이터 업데이트 함수
  update: (model, validateData) => async (req, res, next) => {
    console.log("🔍 [Update Request] 시작합니다.");

    try {
      // 📊 입력 데이터 유효성 검사
      if (validateData) {
        console.log("🔬 [Validation] 입력 데이터 유효성 검사를 시작합니다.");
        await validateData(req.body);
        console.log("✅ [Validation] 입력 데이터 유효성 검사 완료.");
      } else {
        console.log("⚠️ [Validation] 유효성 검사 함수가 제공되지 않았습니다.");
      }

      console.log(
        `🔄 [Data Update] ID ${req.body.id}의 데이터 업데이트를 시도합니다.`
      );

      // 🔄 데이터 업데이트
      const [updated] = await model.update(req.body, {
        where: { id: req.body.id },
      });

      // 📊 업데이트 결과 확인
      if (updated) {
        console.log(
          `✅ [Data Update] ID ${req.body.id}의 데이터 업데이트 성공.`
        );
        // 📨 응답 데이터 전송
        res.status(200).json({ message: "업데이트 완료" });
      } else {
        // 🙅‍♂️ 데이터를 찾을 수 없음
        console.error(
          `❌ [Data Update] ID ${req.body.id}에 해당하는 데이터를 찾을 수 없습니다.`
        );
        const error = new Error("리소스(해당 ID의 데이터)를 찾을 수 없음");
        error.status = 404;
        throw error;
      }
    } catch (error) {
      // 🚨 에러 처리
      console.error(
        "🚨 [Error] 데이터 업데이트 중 오류가 발생했습니다.",
        error
      );
      await handleError(error, req, res, next);
    }
  },

  // 🗑️ 데이터 삭제 함수
  delete: (model) => async (req, res, next) => {
    try {
      // 🔥 데이터 삭제
      // req.body 안쪽에 데이터를 콘솔에서 확인
      console.log("🔥:", req.body.id);
      const deleted = await model.destroy({ where: { id: req.body.id } });

      // 📊 삭제 결과 확인
      if (deleted) {
        // 📨 응답 데이터 전송
        res.status(200).json({ message: "삭제 완료" });
      } else {
        // 🙅‍♂️ 데이터를 찾을 수 없음
        const error = new Error("리소스(해당 ID의 데이터)를 찾을 수 없음");
        error.status = 404;
        throw error;
      }
    } catch (error) {
      // 🚨 에러 처리
      await handleError(error, req, res, next);
    }
  },
};

// 🚨 에러 처리 함수
const handleError = async (err, req, res, next) => {
  // 🌐 요청 정보 로깅
  console.error(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
  );

  // 🔍 에러 유형 확인 및 메시지 설정
  let errorMessage = "서버 내부에서 처리할 수 없는 에러가 발생하였습니다.";
  let statusCode = err.status || 500;

  if (err instanceof ValidationError) {
    // 📝 유효성 검사 에러
    errorMessage = `입력된 데이터가 요구 사항을 만족하지 못합니다: ${err.errors
      .map((e) => `${e.path}: ${e.message}`)
      .join(", ")}`;
    statusCode = 400;
  } else if (err instanceof UniqueConstraintError) {
    // 🔒 중복 데이터 에러
    errorMessage = `데이터의 유니크 조건을 위반하였습니다. 중복된 값이 존재합니다: ${err.errors
      .map((e) => `${e.path}: ${e.message}`)
      .join(", ")}`;
    statusCode = 409;
  } else if (err instanceof ForeignKeyConstraintError) {
    // 🔗 외래 키 제약 조건 에러
    errorMessage = `외래 키 제약 조건이 충족되지 않습니다. 관련 데이터가 존재하지 않을 수 있습니다: ${err.detail}`;
    statusCode = 422;
  } else if (err.message) {
    // 📛 기타 에러
    errorMessage = err.message;
  }

  // 📝 에러 정보 로깅
  console.error(
    `[${new Date().toISOString()}] ${statusCode} - ${errorMessage}`
  );
  console.error(err.stack);

  // 📨 에러 응답 전송
  res.status(statusCode).json({
    code: statusCode,
    message: errorMessage,
    error: err.name || "ServerError",
    timestamp: new Date().toISOString(),
  });
};

// 📦 모듈 내보내기
module.exports = crudController;
