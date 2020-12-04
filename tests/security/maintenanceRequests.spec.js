const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../server');
const testhelpers = require('../testhelpers');
const permissionshelper = require('./permissionshelper');

describe('MaintenanceRequests security:', function () {
	it('get maintenanceRequests', async () => {
		const url = `maintenanceRequests`;
		await permissionshelper.testSecurity([500, 1000], url, 'GET', null, 403);
		await permissionshelper.testSecurity([100], url, 'GET', null, 200);
		await permissionshelper.testSecurity([900, 600], url, 'GET', null, 200);
	});

	it('post maintenanceRequests', async () => {
		let params = {
			requestDescription: 'test request',
			requestDate: new Date(),
			requestedById: global.signup.user.userId
		};

		const url = `maintenanceRequests`;
		await permissionshelper.testSecurity([500, 1000], url, 'POST', params, 403);
		await permissionshelper.testSecurity([100, 900, 600], url, 'POST', params, 201);
	});

	it('put maintenanceRequests', async () => {
		const maintenanceRequest = await testhelpers.createMaintenanceRequest();

		let params = {};

		const url = `maintenanceRequests/${maintenanceRequest.maintenanceRequestId}`;
		await permissionshelper.testSecurity([500, 1000], url, 'PUT', params, 403);
		await permissionshelper.testSecurity([100], url, 'PUT', params, 200);
		await permissionshelper.testSecurity([900, 600], url, 'PUT', params, 200);
	});

	it('delete maintenanceRequests', async () => {
		let maintenanceRequest = await testhelpers.createMaintenanceRequest();
		let url = `maintenanceRequests/${maintenanceRequest.maintenanceRequestId}`;

		await permissionshelper.testSecurity([], url, 'DELETE', null, 403);

		maintenanceRequest = await testhelpers.createMaintenanceRequest();
		url = `maintenanceRequests/${maintenanceRequest.maintenanceRequestId}`;
		await permissionshelper.testSecurity([100], url, 'DELETE', null, 204);

		maintenanceRequest = await testhelpers.createMaintenanceRequest();
		url = `maintenanceRequests/${maintenanceRequest.maintenanceRequestId}`;
		await permissionshelper.testSecurity([500], url, 'DELETE', null, 403);

		maintenanceRequest = await testhelpers.createMaintenanceRequest();
		url = `maintenanceRequests/${maintenanceRequest.maintenanceRequestId}`;
		await permissionshelper.testSecurity([1000], url, 'DELETE', null, 403);
		
		maintenanceRequest = await testhelpers.createMaintenanceRequest();
		url = `maintenanceRequests/${maintenanceRequest.maintenanceRequestId}`;
		await permissionshelper.testSecurity([900], url, 'DELETE', null, 204);
		await permissionshelper.testSecurity([900], url, 'DELETE', null, 404);

		maintenanceRequest = await testhelpers.createMaintenanceRequest();
		url = `maintenanceRequests/${maintenanceRequest.maintenanceRequestId}`;
		await permissionshelper.testSecurity([600], url, 'DELETE', null, 204);
	});
});