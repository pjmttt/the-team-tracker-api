
const envPath = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
const dotenv = require('dotenv').config({ path: envPath });
const express = require('express');
const bodyParser = require('body-parser');
const router = require('./api/router');
const auth = require('./utils/authorization');
const apihelper = require('./helpers/apihelper');
const moment = require('moment');
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const transport = new DailyRotateFile({
	filename: 'logs/info-%DATE%.log',
	datePattern: 'YYYY-MM-DD'
})
const logger = winston.createLogger({
	level: 'info',
	format: winston.format.json(),
	transports: [
		transport
	]
});

let app = express();
let port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Access-Token');
	if (req.method == 'OPTIONS') {
		res.sendStatus(200);
	}
	else {
		next();
	}
});

async function applyRequestMiddlewares(req, res, next) {
	if (req.url != '/login' &&
		req.url != '/forgotPassword' &&
		req.url != '/resetPassword' &&
		req.url != '/signup' &&
		req.url != '/ping' &&
		req.url != '/clockIn' &&
		req.url != '/clockOut' &&
		req.url != '/sendEmails' &&
		req.url != '/requestDemo'
	) {
		try {
			res.locals.user = await auth.getLoggedInUser(req);
			if (res.locals.user && process.env.NODE_ENV != 'test') {
				try {
					logger.info(`${moment().format("LT")}: ${res.locals.user.email} - ${res.locals.user.company.companyName}: ${req.method} ${req.url} - ${req.headers['user-agent'] || 'UNKNOWN'}`);
				}
				catch (e) {
					// TODO: don't want crash
					console.log("ERR:", e);
				}
			}
			if (req.url != '/users' && req.url != '/requestSubscription' && req.url != '/processPayment' && !res.locals.user.company.subscriptionTransactionNumber) {
				const expirationDate = moment(res.locals.user.company.expirationDate);
				if (expirationDate.isBefore(moment())) {
					return res.status(400).json("Subscription expired!");
				}
			}
		} catch (e) {
			return res.status(401).json(e.message || e);
		}
	}
	next();
}

app.use(`/api`, applyRequestMiddlewares, router);

app.use(function (err, req, res, next) {
	try {
		logger.error(`${moment().format("LT")}: ${req.method} ${req.url} - ${err.message || err} - ${err.stack}`);
	}
	catch (e) {
		// TODO: don't want crash
		console.log("ERR:", e);
	}
	apihelper.createErrorResponse(res, err);
	next(err);
});

app.listen(port);

console.log(`listening: ${port}`);

module.exports = app;
