const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../server');
const testhelpers = require('../testhelpers');
const models = require('../../models');

describe('Testing attendance', function () {
	it('search attendance', async () => {
		let res = await request(app).get(`/api/attendance?1=1&limit=25&offset=25&orderBy=user.lastName,user.firstName`);
		expect(res.statusCode).to.eq(200);
	});
});