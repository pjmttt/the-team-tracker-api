const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../server');
const testhelpers = require('../testhelpers');
const permissionshelper = require('./permissionshelper');

describe('Tasks security:', function () {
	it('get tasks', async () => {
		const url = `tasks`;
		await permissionshelper.testSecurity([], url, 'GET', null, 403);
		await permissionshelper.testSecurity([100, 500, 900, 1000], url, 'GET', null, 403);
		await permissionshelper.testSecurity([600], url, 'GET', null, 200);
	});

	it('post tasks', async () => {
		let params = { taskName: "test task" };

		const url = `tasks`;
		await permissionshelper.testSecurity([], url, 'POST', params, 403);
		await permissionshelper.testSecurity([100, 500, 900, 1000], url, 'POST', params, 403);
		await permissionshelper.testSecurity([600], url, 'POST', params, 201);
	});

	it('put tasks', async () => {
		const task = (await testhelpers.createTasks(null, 1))[0];

		let params = {};

		const url = `tasks/${task.taskId}`;
		await permissionshelper.testSecurity([], url, 'PUT', params, 403);
		await permissionshelper.testSecurity([100, 500, 900, 1000], url, 'PUT', params, 403);
		await permissionshelper.testSecurity([600], url, 'PUT', params, 200);
	});

	it('delete tasks', async () => {
		let task = (await testhelpers.createTasks(null, 1))[0];
		let url = `tasks/${task.taskId}`;
		await permissionshelper.testSecurity([], url, 'DELETE', null, 403);
		await permissionshelper.testSecurity([100, 500, 900, 1000], url, 'DELETE', null, 403);
		await permissionshelper.testSecurity([600], url, 'DELETE', null, 204);
	});
});