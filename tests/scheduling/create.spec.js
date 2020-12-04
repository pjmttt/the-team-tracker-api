const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../server');
const testhelpers = require('../testhelpers');
const models = require('../../models');

describe('Testing schedule creation', function () {
	this.timeout(60000);

	beforeEach(async () => {
		await models.schedule.destroy({ truncate: true });
	})

	it('unpublished', async () => {
		const lookups = (await request(app).get('/api/lookups')).body;
		let params = {
			userId: global.signup.user.userId,
			taskId: lookups.tasks[0].taskId,
			shiftId: lookups.shifts[0].shiftId,
			scheduleDate: new Date(),
			startTime: new Date(),
			endTime: new Date()
		};

		let result = await request(app)
			.post(`/api/schedules`)
			.send(params);
		expect(result.statusCode).to.eq(201);

		let url = `/api/schedules?start=2000-02-16&end=2099-02-16`;
		let scheds = (await request(app).get(url)).body;
		expect(scheds.data.length).to.eq(1);

		url = `/api/schedules?start=2000-02-16&end=2099-02-16&forUser=true`;
		scheds = (await request(app).get(url)).body;
		expect(scheds.data.length).to.eq(0);

		url = `/api/schedules?start=2000-02-16&end=2099-02-16&assigned=true`;
		scheds = (await request(app).get(url)).body;
		expect(scheds.data.length).to.eq(0);

		let emails = await testhelpers.getEmails();
		expect(emails.length).to.eq(0);
	});

	it('published', async () => {
		const usr = await testhelpers.createUser({ roles: [], enableTextNotifications: true });
		const lookups = (await request(app).get('/api/lookups')).body;
		let params = {
			userId: usr.userId,
			taskId: lookups.tasks[0].taskId,
			shiftId: lookups.shifts[0].shiftId,
			scheduleDate: new Date(),
			startTime: new Date(),
			endTime: new Date(),
			published: true,
		};

		const jwt = await testhelpers.getJWT(usr);

		let result = await request(app)
			.post(`/api/schedules`)
			.send(params);
		expect(result.statusCode).to.eq(201);

		let url = `/api/schedules?start=2000-02-16&end=2099-02-16`;
		let scheds = (await request(app).get(url)).body;
		expect(scheds.data.length).to.eq(1);

		url = `/api/schedules?start=2000-02-16&end=2099-02-16&forUser=true`;
		scheds = (await request(app).get(url).set('access-token', jwt)).body;
		expect(scheds.data.length).to.eq(1);

		url = `/api/schedules?start=2000-02-16&end=2099-02-16&assigned=true`;
		scheds = (await request(app).get(url)).body;
		expect(scheds.data.length).to.eq(1);

		let emails = await testhelpers.getEmails();
		expect(emails.length).to.eq(0);
		// for (let ml of emails) {
		// 	expect(ml.bcc.length).to.eq(1);
		// }

		// const txt = emails.find(t => t.text != null && t.subject == null);
		// const eml = emails.find(e => e.html != null && e.subject != null);
		// expect(txt).to.exist;
		// expect(eml).to.not.exist;

		// expect(txt.bcc.length).to.eq(1);
		// expect(txt.bcc[0]).to.eq(`${usr.phoneNumber}@mailinator.com`);

	});

});