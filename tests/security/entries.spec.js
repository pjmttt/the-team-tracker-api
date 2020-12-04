const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../server');
const testhelpers = require('../testhelpers');
const permissionshelper = require('./permissionshelper');

describe('Entries security:', function () {
	this.timeout(10000);
	it('get entries', async () => {
		const url = `entries?start=2018-02-16&end=2018-02-16`;
		await permissionshelper.testSecurity([], url, 'GET', null, 403);
		await permissionshelper.testSecurity([500, 900, 1000], url, 'GET', null, 403);
		await permissionshelper.testSecurity([100, 600], url, 'GET', null, 200);
		await permissionshelper.testSecurity([], url + '&forUser=true', 'GET', null, 200);
	});

	it('post entries', async () => {
		const lookups = (await request(app).get('/api/lookups')).body;
		let params = {
			entryDate: new Date(),
			shiftId: lookups.shifts[0].shiftId,
			taskId: lookups.tasks[0].taskId,
			userId: lookups.users[0].userId,
			comments: 'Test entry comments',
			enteredById: lookups.users[0].userId,
			entrySubtasks: [{
				statusId: lookups.statuses[0].statusId,
				subtaskId: lookups.tasks[0].subtasks[0].subtaskId,
				comments: 'Test subtask comments'
			}]
		};

		const url = `entries`;
		await permissionshelper.testSecurity([], url, 'POST', params, 403);
		await permissionshelper.testSecurity([500, 900, 1000], url, 'POST', params, 403);
		await permissionshelper.testSecurity([100, 600], url, 'POST', params, 201);
	});

	it('put entries', async () => {
		const entries = await testhelpers.createEntries();

		let params = {};

		const url = `entries/${entries.entry.entryId}`;
		await permissionshelper.testSecurity([], url, 'PUT', params, 403);
		await permissionshelper.testSecurity([500, 900, 1000], url, 'PUT', params, 403);
		await permissionshelper.testSecurity([100, 600], url, 'PUT', params, 200);
	});

	it('delete entries', async () => {
		let entries = await testhelpers.createEntries();
		let url = `entries/${entries.entry.entryId}`;
		await permissionshelper.testSecurity([], url, 'DELETE', null, 403);
		await permissionshelper.testSecurity([500, 900, 1000], url, 'DELETE', null, 403);
		await permissionshelper.testSecurity([100], url, 'DELETE', null, 204);

		entries = await testhelpers.createEntries();
		url = `entries/${entries.entry.entryId}`;
		await permissionshelper.testSecurity([600], url, 'DELETE', null, 204);
	});
});