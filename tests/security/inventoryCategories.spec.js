const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../server');
const testhelpers = require('../testhelpers');
const permissionshelper = require('./permissionshelper');

describe('InventoryCategories security:', function () {
	it('get inventoryCategories', async () => {
		const url = `inventoryCategories`;
		await permissionshelper.testSecurity([], url, 'GET', null, 403);
		await permissionshelper.testSecurity([100, 900, 1000], url, 'GET', null, 403);
		await permissionshelper.testSecurity([500, 600], url, 'GET', null, 200);
	});

	it('post inventoryCategories', async () => {
		let params = { categoryName: "test inventory category" };

		const url = `inventoryCategories`;
		await permissionshelper.testSecurity([], url, 'POST', params, 403);
		await permissionshelper.testSecurity([100, 900, 1000], url, 'POST', params, 403);
		await permissionshelper.testSecurity([500, 600], url, 'POST', params, 201);
	});

	it('put inventoryCategories', async () => {
		const inventoryCategory = await testhelpers.createInventoryCategory();

		let params = {};

		const url = `inventoryCategories/${inventoryCategory.inventoryCategoryId}`;
		await permissionshelper.testSecurity([], url, 'PUT', params, 403);
		await permissionshelper.testSecurity([100, 900, 1000], url, 'PUT', params, 403);
		await permissionshelper.testSecurity([500, 600], url, 'PUT', params, 200);
	});

	it('delete inventoryCategories', async () => {
		let inventoryCategory = await testhelpers.createInventoryCategory();
		let url = `inventoryCategories/${inventoryCategory.inventoryCategoryId}`;
		await permissionshelper.testSecurity([], url, 'DELETE', null, 403);
		await permissionshelper.testSecurity([100, 900, 1000], url, 'DELETE', null, 403);

		await permissionshelper.testSecurity([500], url, 'DELETE', null, 204);

		inventoryCategory = await testhelpers.createInventoryCategory();
		url = `inventoryCategories/${inventoryCategory.inventoryCategoryId}`;
		await permissionshelper.testSecurity([600], url, 'DELETE', null, 204);
	});
});