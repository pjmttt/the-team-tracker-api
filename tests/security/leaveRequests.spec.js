const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../server');
const testhelpers = require('../testhelpers');
const permissionshelper = require('./permissionshelper');

describe('LeaveRequests security:', function () {
	it('get leaveRequests', async () => {
		const url = `leaveRequests?start=2018-02-16&end=2018-02-16`;
		await permissionshelper.testSecurity([], url, 'GET', null, 403);
		await permissionshelper.testSecurity([500, 900, 100], url, 'GET', null, 403);
		await permissionshelper.testSecurity([1000, 600], url, 'GET', null, 200);

		await permissionshelper.testSecurity([], url + '&forUser=true', 'GET', null, 200);
	});
});