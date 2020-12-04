const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../server');
const testhelpers = require('../testhelpers');
const permissionshelper = require('./permissionshelper');

describe('Shifts security:', function () {
	it('get shifts', async () => {
		const url = `shifts`;
		await permissionshelper.testSecurity([], url, 'GET', null, 403);
		await permissionshelper.testSecurity([100, 500, 900, 1000], url, 'GET', null, 403);
		await permissionshelper.testSecurity([600], url, 'GET', null, 200);
	});

	it('post shifts', async () => {
		let params = { shiftName: "test shift" };

		const url = `shifts`;
		await permissionshelper.testSecurity([], url, 'POST', params, 403);
		await permissionshelper.testSecurity([100, 500, 900, 1000], url, 'POST', params, 403);
		await permissionshelper.testSecurity([600], url, 'POST', params, 201);
	});

	it('put shifts', async () => {
		const shift = (await testhelpers.createShifts(1))[0];

		let params = {};

		const url = `shifts/${shift.shiftId}`;
		await permissionshelper.testSecurity([], url, 'PUT', params, 403);
		await permissionshelper.testSecurity([100, 500, 900, 1000], url, 'PUT', params, 403);
		await permissionshelper.testSecurity([600], url, 'PUT', params, 200);
	});

	it('delete shifts', async () => {
		let shift = (await testhelpers.createShifts(1))[0];
		let url = `shifts/${shift.shiftId}`;
		await permissionshelper.testSecurity([], url, 'DELETE', null, 403);
		await permissionshelper.testSecurity([100, 500, 900, 1000], url, 'DELETE', null, 403);
		await permissionshelper.testSecurity([600], url, 'DELETE', null, 204);
	});
});