const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../server');
const testhelpers = require('../testhelpers');
const guid = require('../../utils/guid');
const moment = require('moment');

const url = '/api/companies';
const lookupsUrl = '/api/lookups';

describe('Testing create update companies:', function () {
	it('create and update', async () => {
		let res = await request(app).post(url).send({});
		expect(res.statusCode).to.eq(409);

		let params = {
			companyName: 'changed company',
			subscriptionRequestNumber: guid(),
			subscriptionTransactionNumber: 'shouldbenull',
			modules: [2],
			expirationDate: '2020-01-01',
		}

		res = await request(app).put(`${url}/${global.signup.user.companyId}`).send(params);
		expect(res.statusCode).to.eq(200);
		expect(res.body.companyName).to.eq('changed company');
		expect(res.body.subscriptionRequestNumber).to.not.exist;
		expect(res.body.subscriptionTransactionNumber).to.not.exist;
		expect(moment(res.body.expirationDate).format("MMDDYYYY")).to.eq(moment().add(30, 'days').format("MMDDYYYY"));

		const models = require('../../models');
		const co = await models.company.findById(global.signup.user.companyId);
		expect(co.companyName).to.eq('changed company');
		expect(co.subscriptionRequestNumber).to.not.exist;
		expect(co.subscriptionTransactionNumber).to.not.exist;
		expect(moment(co.expirationDate).format("MMDDYYYY")).to.eq(moment().add(30, 'days').format("MMDDYYYY"));

		params = {
			companyName: 'changed company',
			subscriptionRequestNumber: guid(),
			subscriptionTransactionNumber: 'shouldbenull',
			modules: [0,1,2,3],
			expirationDate: '2020-01-01',
		}

		res = await request(app).put(`${url}/${global.signup.user.companyId}`).send(params);
	});
});