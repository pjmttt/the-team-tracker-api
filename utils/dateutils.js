const moment = require('moment-timezone');

function localdate(input, company) {
	if (!company.timezone) return moment(input);
	return moment.tz(input, company.timezone);
}

module.exports = {
	localdate
}