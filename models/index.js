"use strict";

// 파일 시스템 모듈을 가져옵니다. 파일과 디렉토리 작업을 위해 필요합니다.
const fs = require("fs");
// 경로 작업을 위한 모듈을 가져옵니다. 파일 경로를 쉽게 조작할 수 있습니다.
const path = require("path");
// Sequelize ORM을 가져옵니다. 데이터베이스 작업을 추상화하고 용이하게 만들어줍니다.
const Sequelize = require("sequelize");
// 현재 파일의 이름을 가져옵니다. 이를 통해 나중에 현재 파일을 필터링할 수 있습니다.
const basename = path.basename(__filename);
// 환경 변수를 가져옵니다. 개발, 테스트, 운영 등 환경에 따라 다를 수 있습니다.
const env = process.env.NODE_ENV || "development";
// Sequelize 설정을 불러옵니다. 데이터베이스 연결 정보가 담겨 있습니다.
const config = require(__dirname + "/../config/config.json")[env];
// 데이터베이스 연결 정보를 담을 객체를 초기화합니다.
const db = {};

// Sequelize 인스턴스를 초기화합니다.
let sequelize;
if (config.use_env_variable) {
  // 환경 변수에서 데이터베이스 연결 정보를 가져올 경우 해당 정보를 이용해 Sequelize를 구성합니다.
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  // 직접 설정 파일에서 데이터베이스 연결 정보를 가져올 경우 해당 정보를 이용해 Sequelize를 구성합니다.
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

// 현재 디렉토리의 파일 목록을 읽고, 각 파일을 반복 처리합니다.
fs.readdirSync(__dirname)
  .filter((file) => {
    // 현재 파일, 숨김 파일, js 확장자가 아닌 파일을 제외합니다.
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    // 각 모델 파일을 가져와 Sequelize 모델로 초기화합니다.
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    // 초기화된 모델을 db 객체에 추가합니다.
    db[model.name] = model;
  });

// 모델 간의 관계(associate)가 정의되어 있다면, 해당 관계를 설정합니다.
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Sequelize 인스턴스와 Sequelize 라이브러리 자체를 db 객체에 추가합니다.
// 이렇게 함으로써 데이터베이스 연결 및 ORM 기능을 애플리케이션의 다른 부분에서 쉽게 사용할 수 있습니다.
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// 최종적으로 db 객체를 모듈로 내보냅니다.
module.exports = db;
