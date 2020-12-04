const emailhelper = require('../helpers/emailhelper');

(async function() {
	require('dotenv').config({ path: '../.env' });
	await emailhelper.processEmailQueue();
})().then(() => process.exit());