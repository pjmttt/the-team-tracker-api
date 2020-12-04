const dotenv = require('dotenv').config({ path: '.env' });
const config = {
	development: {
		dialect: process.env.DB_DIALECT,
		username: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
	},
	qa: {
		dialect: process.env.DB_DIALECT,
		username: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
	},
	test: {
		dialect: process.env.DB_DIALECT,
		username: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
	},
};

module.exports = config;
