const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../server');
const testhelpers = require('../testhelpers');
const models = require('../../models');
const dateutils = require('../../utils/dateutils');
const moment = require('moment');

describe('Testing load from schedule', function () {
	this.timeout(60000);

	beforeEach(async () => {
		await models.schedule.destroy({ truncate: true });
		await models.entry.destroy({ truncate: true });
	})

	it('no access', async () => {
		const lookups = (await request(app).get('/api/lookups')).body;
		const scheds = [];
		scheds.push(await testhelpers.createSchedule(lookups));
		scheds.push(await testhelpers.createSchedule(lookups));

		const usr = await testhelpers.createUser({ roles: [500, 900, 1000] });

		let response = await await request(app)
			.post(`/api/entriesFromSchedule`)
			.set('access-token', testhelpers.getJWT(usr))
			.send({ forDate: moment().format("L") });
		expect(response.statusCode).to.eq(403);
	});

	it('manager access', async () => {
		const lookups = (await request(app).get('/api/lookups')).body;
		const scheds = [];
		scheds.push(await testhelpers.createSchedule(lookups));
		scheds.push(await testhelpers.createSchedule(lookups));

		const usr = await testhelpers.createUser({ roles: [100] });

		let response = await await request(app)
			.post(`/api/entriesFromSchedule`)
			.set('access-token', testhelpers.getJWT(usr))
			.send({ forDate: moment().format("L") });
		expect(response.statusCode).to.eq(200);
	});

	it('should load entries from schedule', async () => {
		const lookups = (await request(app).get('/api/lookups')).body;
		const usr1 = await testhelpers.createUser({ roles: [] });
		const usr2 = await testhelpers.createUser({ roles: [] });

		let dt = new Date();
		const sched1 = await testhelpers.createSchedule(lookups, usr1.userId, dt);
		const sched2 = await testhelpers.createSchedule(lookups, usr2.userId, dt);
		await testhelpers.createSchedule(lookups, null, dt);
		await testhelpers.createSchedule(lookups, null, dt);
		dt.setDate(dt.getDate() + 1);
		await testhelpers.createSchedule(lookups, usr1.userId, dt);
		await testhelpers.createSchedule(lookups, usr2.userId, dt);
		await testhelpers.createSchedule(lookups, null, dt);
		await testhelpers.createSchedule(lookups, null, dt);

		response = await await request(app).post(`/api/entriesFromSchedule`).send({ forDate: moment().format("L") });
		expect(response.statusCode).to.eq(200);

		response = await request(app).get(`/api/entries?start=${moment().format("YYYY-MM-DD")}&end=${moment().format("YYYY-MM-DD")}`);
		expect(response.statusCode).to.eq(200);
		expect(response.body.data.length).to.eq(2);

		const found1 = response.body.data.find(d => d.userId == usr1.userId);
		expect(found1).to.exist;
		expect(found1.shiftId).to.eq(sched1.shiftId);
		expect(found1.taskId).to.eq(sched1.taskId);

		const found2 = response.body.data.find(d => d.userId == usr2.userId);
		expect(found2).to.exist;
		expect(found2.shiftId).to.eq(sched2.shiftId);
		expect(found2.taskId).to.eq(sched2.taskId);
	});
});