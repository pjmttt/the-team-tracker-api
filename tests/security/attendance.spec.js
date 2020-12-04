const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../server');
const testhelpers = require('../testhelpers');
const permissionshelper = require('./permissionshelper');

describe('Attendance security:', function () {
	this.timeout(10000);
	
	it('get attendance', async () => {
		const url = `attendance?start=2018-02-16&end=2018-02-16`;
		await permissionshelper.testSecurity([], url, 'GET', null, 403);
		await permissionshelper.testSecurity([500, 900], url, 'GET', null, 403);
		await permissionshelper.testSecurity([100, 600, 1000], url, 'GET', null, 200);
		await permissionshelper.testSecurity([], url + '&forUser=true', 'GET', null, 200);
	});

	it('post attendance', async () => {
		const lookups = (await request(app).get('/api/lookups?lookupType=3')).body;
		let params = {
			attendanceDate: new Date(),
			userId: lookups.users[0].userId,
			attendanceReasonId: lookups.attendanceReasons[0].attendanceReasonId
		};

		const url = `attendance`;
		await permissionshelper.testSecurity([], url, 'POST', params, 403);
		await permissionshelper.testSecurity([500, 900], url, 'POST', params, 403);
		await permissionshelper.testSecurity([100, 600, 1000], url, 'POST', params, 201);
	});

	it('put attendance', async () => {
		const attendance = await testhelpers.createAttendance();

		let params = {};

		const url = `attendance/${attendance.attendanceId}`;
		await permissionshelper.testSecurity([], url, 'PUT', params, 403);
		await permissionshelper.testSecurity([500, 900], url, 'PUT', params, 403);
		await permissionshelper.testSecurity([100, 600, 1000], url, 'PUT', params, 200);
	});

	it('delete attendance', async () => {
		let attendance = await testhelpers.createAttendance();
		let url = `attendance/${attendance.attendanceId}`;
		await permissionshelper.testSecurity([], url, 'DELETE', null, 403);
		await permissionshelper.testSecurity([500, 900], url, 'DELETE', null, 403);
		await permissionshelper.testSecurity([100], url, 'DELETE', null, 204);

		attendance = await testhelpers.createAttendance();
		url = `attendance/${attendance.attendanceId}`;
		await permissionshelper.testSecurity([600], url, 'DELETE', null, 204);

		attendance = await testhelpers.createAttendance();
		url = `attendance/${attendance.attendanceId}`;
		await permissionshelper.testSecurity([1000], url, 'DELETE', null, 204);
	});
});