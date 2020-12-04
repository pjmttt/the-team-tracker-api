const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../server');
const testhelpers = require('../testhelpers');
const permissionshelper = require('./permissionshelper');

describe('userProgressChecklists security:', function () {
	it('get userProgressChecklists', async () => {
		const url = `userProgressChecklists?start=2018-02-16&end=2018-02-16`;
		await permissionshelper.testSecurity([], url, 'GET', null, 403);
		await permissionshelper.testSecurity([500, 900, 1000], url, 'GET', null, 403);
		await permissionshelper.testSecurity([100, 600], url, 'GET', null, 200);
		await permissionshelper.testSecurity([], url + '&forUser=true', 'GET', null, 200);
	});

	it('post userProgressChecklists', async () => {
		const lookups = (await request(app).get('/api/lookups?lookupType=5')).body;
		let params = {
			startDate: new Date(),
			progressChecklistId: lookups.progressChecklists[0].progressChecklistId,
			userId: lookups.users[0].userId,
			managerId: lookups.users[0].userId,
		};

		const url = `userProgressChecklists`;
		await permissionshelper.testSecurity([], url, 'POST', params, 403);
		await permissionshelper.testSecurity([500, 900, 1000], url, 'POST', params, 403);
		await permissionshelper.testSecurity([100, 600], url, 'POST', params, 201);
	});

	it('put userProgressChecklists', async () => {
		const userProgressChecklists = await testhelpers.createUserProgressChecklist();

		let params = {};

		const url = `userProgressChecklists/${userProgressChecklists.userProgressChecklistId}`;
		await permissionshelper.testSecurity([], url, 'PUT', params, 403);
		await permissionshelper.testSecurity([500, 900, 1000], url, 'PUT', params, 403);
		await permissionshelper.testSecurity([100, 600], url, 'PUT', params, 200);
	});

	it('delete userProgressChecklists', async () => {
		let userProgressChecklist = await testhelpers.createUserProgressChecklist();
		let url = `userProgressChecklists/${userProgressChecklist.userProgressChecklistId}`;

		await permissionshelper.testSecurity([], url, 'DELETE', null, 403);
		await permissionshelper.testSecurity([500, 900, 1000], url, 'DELETE', null, 403);
		await permissionshelper.testSecurity([100], url, 'DELETE', null, 204);

		userProgressChecklist = await testhelpers.createUserProgressChecklist();
		url = `userProgressChecklists/${userProgressChecklist.userProgressChecklistId}`;
		await permissionshelper.testSecurity([600], url, 'DELETE', null, 204);
	});
});