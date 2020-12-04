const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../server');
const testhelpers = require('../testhelpers');
const models = require('../../models');
const dateutils = require('../../utils/dateutils');
const moment = require('moment');

describe('Testing forgot password', function () {
	this.timeout(60000);

	it('allow user password', async () => {
		const usr1 = await testhelpers.createUser({ roles: [] });
		let response = await request(app).post(`/api/forgotPassword`).send({ email: usr1.email });
		expect(response.statusCode).to.eq(200);

		const emails = await testhelpers.getEmails();
		expect(emails.length).to.eq(1);
		expect(emails[0].bcc.length).to.eq(1);
		expect(emails[0].bcc[0]).to.eq(usr1.email);

		const dbusr = await models.user.findById(usr1.userId);
		expect(emails[0].html).to.include(dbusr.forgotPassword);

		response = await request(app).post(`/api/resetPassword`).send({ key: dbusr.forgotPassword, password: '12345' });
		expect(response.statusCode).to.eq(200);
		response = await request(app).post(`/api/login`).send({ email: dbusr.email, password: '12345' });
		expect(response.statusCode).to.eq(200);
	});
});