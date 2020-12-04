const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../server');
const testhelpers = require('../testhelpers');
const permissionshelper = require('./permissionshelper');

describe('InventoryItems security:', function () {
	it('get inventoryItems', async () => {
		const url = `inventoryItems`;
		await permissionshelper.testSecurity([], url, 'GET', null, 403);
		await permissionshelper.testSecurity([100, 900, 1000], url, 'GET', null, 403);
		await permissionshelper.testSecurity([500, 600], url, 'GET', null, 200);
	});

	it('post inventoryItems', async () => {
		const cat = await testhelpers.createInventoryCategory();
		let params = { 
			inventoryItemName: "test inventoryItem",
			inventoryCategoryId: cat.inventoryCategoryId
		};

		const url = `inventoryItems`;
		await permissionshelper.testSecurity([], url, 'POST', params, 403);
		await permissionshelper.testSecurity([100, 900, 1000], url, 'POST', params, 403);
		await permissionshelper.testSecurity([500, 600], url, 'POST', params, 201);
	});

	it('put inventoryItems', async () => {
		const inventoryItem = await testhelpers.createInventoryItem();

		let params = {};

		const url = `inventoryItems/${inventoryItem.inventoryItemId}`;
		await permissionshelper.testSecurity([], url, 'PUT', params, 403);
		await permissionshelper.testSecurity([100, 900, 1000], url, 'PUT', params, 403);
		await permissionshelper.testSecurity([500, 600], url, 'PUT', params, 200);
	});

	it('delete inventoryItems', async () => {
		let inventoryItem = await testhelpers.createInventoryItem();
		let url = `inventoryItems/${inventoryItem.inventoryItemId}`;
		await permissionshelper.testSecurity([], url, 'DELETE', null, 403);
		await permissionshelper.testSecurity([100, 900, 1000], url, 'DELETE', null, 403);

		await permissionshelper.testSecurity([500], url, 'DELETE', null, 204);

		inventoryItem = await testhelpers.createInventoryItem();
		url = `inventoryItems/${inventoryItem.inventoryItemId}`;
		await permissionshelper.testSecurity([600], url, 'DELETE', null, 204);
	});
});