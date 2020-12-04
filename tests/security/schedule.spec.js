const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../server');
const testhelpers = require('../testhelpers');
const permissionshelper = require('./permissionshelper');

describe('Schedules security:', function () {
	it('get schedules', async () => {
		const url = `schedules?start=2000-02-16&end=2099-02-16`;
		await permissionshelper.testSecurity([], url, 'GET', null, 403);
		await permissionshelper.testSecurity([500, 900, 100], url, 'GET', null, 403);
		await permissionshelper.testSecurity([1000, 600], url, 'GET', null, 200);

		await permissionshelper.testSecurity([], url + '&forUser=true', 'GET', null, 200);
		await permissionshelper.testSecurity([], url + '&assigned=true', 'GET', null, 200);
	});

	it('post schedules', async () => {
		const lookups = (await request(app).get('/api/lookups')).body;
		let params = {
			userId: global.signup.user.userId,
			taskId: lookups.tasks[0].taskId,
			shiftId: lookups.shifts[0].shiftId,
			scheduleDate: new Date(),
			startTime: new Date(),
			endTime: new Date()
		};

		const url = `schedules`;
		await permissionshelper.testSecurity([], url, 'POST', params, 403);
		await permissionshelper.testSecurity([500, 900, 100], url, 'POST', params, 403);
		await permissionshelper.testSecurity([1000, 600], url, 'POST', params, 201);
	});

	it('put schedules', async () => {
		const schedule = await testhelpers.createSchedule(null, global.signup.user.userId);

		let params = {};

		const url = `schedules/${schedule.scheduleId}`;
		await permissionshelper.testSecurity([], url, 'PUT', params, 403);
		await permissionshelper.testSecurity([500, 900, 100], url, 'PUT', params, 403);
		await permissionshelper.testSecurity([1000, 600], url, 'PUT', params, 200);
	});

	it('delete schedules', async () => {
		let schedule = await testhelpers.createSchedule(null, global.signup.user.userId);
		let url = `schedules/${schedule.scheduleId}`;
		await permissionshelper.testSecurity([], url, 'DELETE', null, 403);
		await permissionshelper.testSecurity([500, 900, 100], url, 'DELETE', null, 403);
		await permissionshelper.testSecurity([1000], url, 'DELETE', null, 204);

		schedule = await testhelpers.createSchedule(null, global.signup.user.userId);
		url = `schedules/${schedule.scheduleId}`;
		await permissionshelper.testSecurity([600], url, 'DELETE', null, 204);
	});
});