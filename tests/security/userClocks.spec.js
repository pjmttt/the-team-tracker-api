const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../server');
const testhelpers = require('../testhelpers');
const permissionshelper = require('./permissionshelper');

describe('UserClocks security:', function () {
	it('get userClocks', async () => {
		const url = `userClocks?start=2018-02-16&end=2018-02-16`;
		await permissionshelper.testSecurity([], url, 'GET', null, 200);
		await permissionshelper.testSecurity([], url + '&forUser=true', 'GET', null, 200);
	});
});