// const express = require("express");
// const router = require("./router");
// const { sequelize } = require("./models/models");
// const bodyParser = require("body-parser");
// const compression = require("compression");
// const cors = require("cors");

// const app = express();

// // bodyParser: req.body 변수 생성 & 손쉬운 데이터 파싱을 지원
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

// // compression: 데이터 압축
// app.use(compression());

// // cors: 크로스오리진 지원, 모든 출처 허용 설정
// app.use(cors());

// // router 적용
// app.use("/api", router);

// // Sequelize 연동
// // force:false -> 기존 DB 구조를 유지하면서 모델과 동기화
// sequelize.sync({ force: true }).then(() => {
//   console.log("connect to mysql");
// });

// app.listen(3000, () => {
//   console.log("express app run in 3000 port!");
// });

// module.exports = app;

const express = require("express");
const router = require("./router");
const { sequelize } = require("./models/models");
const bodyParser = require("body-parser");
const compression = require("compression");
const cors = require("cors");

const app = express();

// bodyParser: req.body 변수 생성 & 손쉬운 데이터 파싱을 지원
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// compression: 데이터 압축
app.use(compression());

// cors: 크로스오리진 지원, 모든 출처 허용 설정
app.use(cors());

// router 적용
app.use("/api", router);

// Sequelize 연동 및 데이터베이스 초기화 함수
const initDatabase = async () => {
  try {
    // 외래 키 제약 조건 비활성화
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");

    // 데이터베이스 동기화
    await sequelize.sync({ force: false });

    // 외래 키 제약 조건 다시 활성화
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("connect to mysql");
  } catch (error) {
    console.error("데이터베이스 초기화 중 오류 발생:", error);
  }
};

// 데이터베이스 초기화 후 서버 시작
initDatabase().then(() => {
  app.listen(3000, () => {
    console.log("express app run in 3000 port!");
  });
});

module.exports = app;
