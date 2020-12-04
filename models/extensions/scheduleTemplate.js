const moment = require('moment');

async function creating(template, user, models, transaction, req, res) {
	if (template.schedules) {
		for (let s of template.schedules) {
			if (s.scheduleDate) {
				s.dayOfWeek = moment(s.scheduleDate).day();
			}
			delete s.scheduleId;
			delete s.scheduleDate;
		}
	}
}

module.exports = {
	creating,
	saveChildren: ['schedules'],
}