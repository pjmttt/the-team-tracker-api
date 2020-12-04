const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../server');
const testhelpers = require('../testhelpers');
const permissionshelper = require('./permissionshelper');

describe('Vendors security:', function () {
	it('get vendors', async () => {
		const url = `vendors`;
		await permissionshelper.testSecurity([], url, 'GET', null, 403);
		await permissionshelper.testSecurity([100, 900, 1000], url, 'GET', null, 403);
		await permissionshelper.testSecurity([500, 600], url, 'GET', null, 200);
	});

	it('post vendors', async () => {
		let params = { vendorName: "test vendor" };

		const url = `vendors`;
		await permissionshelper.testSecurity([], url, 'POST', params, 403);
		await permissionshelper.testSecurity([100, 900, 1000], url, 'POST', params, 403);
		await permissionshelper.testSecurity([500, 600], url, 'POST', params, 201);
	});

	it('put vendors', async () => {
		const vendor = await testhelpers.createVendor();

		let params = {};

		const url = `vendors/${vendor.vendorId}`;
		await permissionshelper.testSecurity([], url, 'PUT', params, 403);
		await permissionshelper.testSecurity([100, 900, 1000], url, 'PUT', params, 403);
		await permissionshelper.testSecurity([500, 600], url, 'PUT', params, 200);
	});

	it('delete vendors', async () => {
		let vendor = await testhelpers.createVendor();
		let url = `vendors/${vendor.vendorId}`;
		await permissionshelper.testSecurity([], url, 'DELETE', null, 403);
		await permissionshelper.testSecurity([100, 900, 1000], url, 'DELETE', null, 403);

		await permissionshelper.testSecurity([500], url, 'DELETE', null, 204);

		vendor = await testhelpers.createVendor();
		url = `vendors/${vendor.vendorId}`;
		await permissionshelper.testSecurity([600], url, 'DELETE', null, 204);
	});
});