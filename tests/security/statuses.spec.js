const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../server');
const testhelpers = require('../testhelpers');
const permissionshelper = require('./permissionshelper');

describe('Statuses security:', function () {
	it('get statuses', async () => {
		const url = `statuses`;
		await permissionshelper.testSecurity([], url, 'GET', null, 403);
		await permissionshelper.testSecurity([100, 500, 900, 1000], url, 'GET', null, 403);
		await permissionshelper.testSecurity([600], url, 'GET', null, 200);
	});

	it('post statuses', async () => {
		let params = { statusName: "test status", abbreviation: "T" };

		const url = `statuses`;
		await permissionshelper.testSecurity([], url, 'POST', params, 403);
		await permissionshelper.testSecurity([100, 500, 900, 1000], url, 'POST', params, 403);
		await permissionshelper.testSecurity([600], url, 'POST', params, 201);
	});

	it('put statuses', async () => {
		const status = await testhelpers.createStatus();

		let params = {};

		const url = `statuses/${status.statusId}`;
		await permissionshelper.testSecurity([], url, 'PUT', params, 403);
		await permissionshelper.testSecurity([100, 500, 900, 1000], url, 'PUT', params, 403);
		await permissionshelper.testSecurity([600], url, 'PUT', params, 200);
	});

	it('delete statuses', async () => {
		let status = await testhelpers.createStatus();
		let url = `statuses/${status.statusId}`;
		await permissionshelper.testSecurity([], url, 'DELETE', null, 403);
		await permissionshelper.testSecurity([100, 500, 900, 1000], url, 'DELETE', null, 403);
		await permissionshelper.testSecurity([600], url, 'DELETE', null, 204);
	});
});