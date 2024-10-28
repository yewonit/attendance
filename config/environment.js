require("dotenv").config();

const environment = {
  development: {
    mysqlHost: process.env.DEVELOPMENT_MYSQL_HOST,
    mysqlUser: process.env.DEVELOPMENT_MYSQL_USER,
    mysqlPassword: process.env.DEVELOPMENT_MYSQL_PASSWORD,
    mysqlDB: process.env.DEVELOPMENT_MYSQL_DB,
  },
  production: {
    mysqlHost: process.env.PRODUCTION_MYSQL_HOST,
    mysqlUser: process.env.PRODUCTION_MYSQL_USER,
    mysqlPassword: process.env.PRODUCTION_MYSQL_PASSWORD,
    mysqlDB: process.env.PRODUCTION_MYSQL_DB,
  },
};

const nodeEnv = process.env.NODE_ENV || "development";
module.exports = environment[nodeEnv];
