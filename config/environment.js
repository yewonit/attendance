import { config } from "dotenv";

config();

const environment = {
	local: {
		DB_HOST: process.env.LOCAL_DB_HOST,
		DB_PORT: process.env.LOCAL_DB_PORT || 3306,
		DB_USER: process.env.LOCAL_DB_USER,
		DB_PASSWORD: process.env.LOCAL_DB_PASSWORD,
		DB_NAME: process.env.LOCAL_DB_NAME,
		AUTH_SERVER_HOST: process.env.AUTH_SERVER_HOST,
		AUTH_SERVER_PORT: process.env.AUTH_SERVER_PORT,
	},
	development: {
		DB_HOST: process.env.DEVELOPMENT_DB_HOST,
		DB_PORT: process.env.DEVELOPMENT_DB_PORT || 3306,
		DB_USER: process.env.DEVELOPMENT_DB_USER,
		DB_PASSWORD: process.env.DEVELOPMENT_DB_PASSWORD,
		DB_NAME: process.env.DEVELOPMENT_DB_NAME,
		AUTH_SERVER_HOST: process.env.AUTH_SERVER_HOST,
		AUTH_SERVER_PORT: process.env.AUTH_SERVER_PORT,
	},
	production: {
		DB_HOST: process.env.PRODUCTION_DB_HOST,
		DB_PORT: process.env.PRODUCTION_DB_PORT || 3306,
		DB_USER: process.env.PRODUCTION_DB_USER,
		DB_PASSWORD: process.env.PRODUCTION_DB_PASSWORD,
		DB_NAME: process.env.PRODUCTION_DB_NAME,
		AUTH_SERVER_HOST: process.env.AUTH_SERVER_HOST,
		AUTH_SERVER_PORT: process.env.AUTH_SERVER_PORT,
	},
};

const nodeEnv = process.env.NODE_ENV || "local";
export default environment[nodeEnv];
