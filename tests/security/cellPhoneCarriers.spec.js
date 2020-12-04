const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../server');
const testhelpers = require('../testhelpers');
const permissionshelper = require('./permissionshelper');

describe('CellPhoneCarriers security:', function () {
	it('get cellPhoneCarriers', async () => {
		const url = `cellPhoneCarriers`;
		await permissionshelper.testSecurity([], url, 'GET', null, 200);
		await permissionshelper.testSecurity([100, 500, 900, 1000], url, 'GET', null, 200);
		await permissionshelper.testSecurity([600], url, 'GET', null, 200);
	});

	it('post cellPhoneCarriers', async () => {
		let params = { carrierName: "test cellPhoneCarrier", domain: 'testdom' };

		const url = `cellPhoneCarriers`;
		await permissionshelper.testSecurity([], url, 'POST', params, 403);
		await permissionshelper.testSecurity([100, 500, 900, 1000], url, 'POST', params, 403);
		await permissionshelper.testSecurity([600], url, 'POST', params, 201);
	});

	it('put cellPhoneCarriers', async () => {
		const cellPhoneCarrier = await testhelpers.createCellPhoneCarrier();

		let params = {};

		const url = `cellPhoneCarriers/${cellPhoneCarrier.cellPhoneCarrierId}`;
		await permissionshelper.testSecurity([], url, 'PUT', params, 403);
		await permissionshelper.testSecurity([100, 500, 900, 1000], url, 'PUT', params, 403);
		await permissionshelper.testSecurity([600], url, 'PUT', params, 200);
	});

	it('delete cellPhoneCarriers', async () => {
		let cellPhoneCarrier = await testhelpers.createCellPhoneCarrier();
		let url = `cellPhoneCarriers/${cellPhoneCarrier.cellPhoneCarrierId}`;
		await permissionshelper.testSecurity([], url, 'DELETE', null, 403);
		await permissionshelper.testSecurity([100, 500, 900, 1000], url, 'DELETE', null, 403);
		await permissionshelper.testSecurity([600], url, 'DELETE', null, 204);
	});
});