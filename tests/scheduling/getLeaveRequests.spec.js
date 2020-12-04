const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../server');
const testhelpers = require('../testhelpers');
const models = require('../../models');
const moment = require('moment');

describe('Testing get time offs', function () {
	this.timeout(60000);

	beforeEach(async () => {
		await models.leaveRequest.destroy({ truncate: true });
	});


	it('should get all time offs', async () => {
		let dt = new Date();
		const lookups = (await request(app).get('/api/lookups')).body;

		const requests = [];
		dt.setDate(dt.getDate() - 300);
		for (let i = 0; i < 500; i++) {
			const usr = lookups.users[Math.floor(Math.random() * lookups.users.length)].userId;
			requests.push({
				userId: lookups.users[Math.floor(Math.random() * lookups.users.length)].userId,
				startDate: new Date(dt),
				endDate: i % 4 == 0 ? new Date() : null,
				status: 0,
				updatedBy: global.signup.user.userId,
			});
			dt.setDate(dt.getDate() + 1);
		}

		// randomize
		requests.sort((a, b) => {
			let rand1 = Math.random();
			let rand2 = Math.random();
			return rand1 - rand2;
		});

		await models.leaveRequest.bulkCreate(requests);

		const dummySignup = await testhelpers.signup();
		const usr = await testhelpers.createUser({ companyId: dummySignup.user.companyId });
		await testhelpers.createLeaveRequest(usr.userId, new Date());

		let response = await request(app).get('/api/leaveRequests');
		expect(response.body.count).to.eq(500);
		expect(response.body.data.length).to.eq(500);

		response = await request(app).get(`/api/leaveRequests?where=startDate%20gte%20${moment(new Date()).format("MM-DD-YYYY")}`);
		expect(response.body.count).to.eq(200);
		expect(response.body.data.length).to.eq(200);

		let testDt = new Date();
		testDt.setDate(testDt.getDate() - 1);

		for (let d of response.body.data) {
			expect(new Date(d.startDate).getTime()).to.be.above(testDt.getTime());
		}

		response = await request(app).get(`/api/leaveRequests?where=startDate%20gte%20${moment(new Date()).format("MM-DD-YYYY")}&limit=10&orderBy=startDate`);
		expect(response.body.count).to.eq(200);
		expect(response.body.data.length).to.eq(10);

		let endTestDt = new Date(testDt);
		endTestDt.setDate(testDt.getDate() + 10);
		for (let d of response.body.data) {
			expect(new Date(d.startDate).getTime()).to.be.above(testDt.getTime());
			expect(new Date(d.startDate).getTime()).to.be.below(endTestDt.getTime());
		}

		response = await request(app).get(`/api/leaveRequests?limit=30&offset=101&orderBy=startDate&where=startDate%20gte%20${moment(new Date()).format("MM-DD-YYYY")}`);
		expect(response.body.count).to.eq(200);
		expect(response.body.data.length).to.eq(30);

		testDt = new Date();
		testDt.setDate(testDt.getDate() + 100);
		endTestDt = new Date(testDt);
		endTestDt.setDate(endTestDt.getDate() + 30);
		for (let d of response.body.data) {
			expect(new Date(d.startDate).getTime()).to.be.above(testDt.getTime());
			expect(new Date(d.startDate).getTime()).to.be.below(endTestDt.getTime());
		}


		response = await request(app).get('/api/leaveRequests?limit=50&orderBy=user%20lastName%20desc');
		expect(response.body.count).to.eq(500);
		expect(response.body.data.length).to.eq(50);

		for (let i = 1; i < 50; i++) {
			expect(response.body.data[i].user.lastName <= response.body.data[i - 1].user.lastName).to.be.true;
		}

		response = await request(app).get('/api/leaveRequests?limit=50&orderBy=user%20lastName,startDate');
		expect(response.body.count).to.eq(500);
		expect(response.body.data.length).to.eq(50);

		for (let i = 1; i < 50; i++) {
			expect(response.body.data[i].user.lastName >= response.body.data[i - 1].user.lastName).to.be.true;
			if (response.body.data[i].user.lastName == response.body.data[i - 1].user.lastName) {
				expect(new Date(response.body.data[i].startDate).getTime())
					.to.be.above(new Date(response.body.data[i - 1].startDate).getTime())
			}
		}

		testDt = new Date();
		testDt.setDate(testDt.getDate() + 100);
		testDt.setMinutes(0);
		testDt.setHours(0);
		testDt.setMilliseconds(0);
		response = await request(app).get(`/api/leaveRequests?where=startDate%20gte%20${moment(testDt).format("YYYY-MM-DD")}&limit=10&orderBy=startDate`);
		expect(response.body.count).to.eq(100);
		expect(response.body.data.length).to.eq(10);

		endTestDt = new Date(testDt);
		endTestDt.setDate(endTestDt.getDate() + 10);
		for (let i = 0; i < 10; i++) {
			let d = response.body.data[i];
			expect(new Date(d.startDate).getTime()).to.be.above(testDt.getTime());
			expect(new Date(d.startDate).getTime()).to.be.below(endTestDt.getTime());
			if (i > 0)
				expect(new Date(d.startDate).getTime())
					.to.be.above(new Date(response.body.data[i - 1].startDate).getTime())
		}
		
		const user = lookups.users.find(u => u.userId == requests[0].userId);
		const matches = requests.filter(r => r.userId == user.userId);
		response = await request(app).get(`/api/leaveRequests?limit=2&where=user.firstName%20eq%20${user.firstName}`);
		expect(response.body.count).to.eq(requests.filter(r => r.userId == user.userId).length);
		expect(response.body.data.length).to.eq(2);

		for (let d of response.body.data) {
			expect(d.user.firstName).to.eq(user.firstName);
		}

		response = await request(app).get(`/api/leaveRequests?limit=2&where=userId%20eq%20${user.userId}&orderBy=startDate%20desc`);
		expect(response.body.count).to.eq(matches.length);
		expect(response.body.data.length).to.eq(2);

		matches.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate));
		expect(new Date(response.body.data[0].startDate).getTime()).to.eq(new Date(matches[0].startDate).getTime());
		expect(new Date(response.body.data[1].startDate).getTime()).to.eq(new Date(matches[1].startDate).getTime());
		for (let d of response.body.data) {
			expect(d.user.firstName).to.eq(user.firstName);
		}

		await testhelpers.deleteData();
		global.signup = await testhelpers.signup(true);
	});
});