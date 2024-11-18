require("dotenv").config()

const environment = {
	local: {
		DB_HOST: process.env.LOCAL_DB_HOST,
		DB_USER: process.env.LOCAL_DB_USER,
		DB_PASSWORD: process.env.LOCAL_DB_PASSWORD,
		DB_NAME: process.env.LOCAL_DB_NAME,
	},
	development: {
		DB_HOST: process.env.DEVELOPMENT_DB_HOST,
		DB_USER: process.env.DEVELOPMENT_DB_USER,
		DB_PASSWORD: process.env.DEVELOPMENT_DB_PASSWORD,
		DB_NAME: process.env.DEVELOPMENT_DB_NAME,
	},
	production: {
		DB_HOST: process.env.PRODUCTION_DB_HOST,
		DB_USER: process.env.PRODUCTION_DB_USER,
		DB_PASSWORD: process.env.PRODUCTION_DB_PASSWORD,
		DB_NAME: process.env.PRODUCTION_DB_NAME,
	},
}

const nodeEnv = process.env.NODE_ENV || "local"
module.exports = environment[nodeEnv]
