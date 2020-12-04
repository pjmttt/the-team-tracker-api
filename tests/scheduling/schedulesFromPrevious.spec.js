const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../server');
const testhelpers = require('../testhelpers');
const models = require('../../models');
const moment = require('moment');

describe('Testing schedules from previous', function () {
	this.timeout(60000);

	beforeEach(async () => {
		await models.schedule.destroy({ truncate: true });
	})

	it('no access', async () => {
		const lookups = (await request(app).get('/api/lookups')).body;
		const scheds = [];
		scheds.push(await testhelpers.createSchedule(lookups));
		scheds.push(await testhelpers.createSchedule(lookups));

		const usr = await testhelpers.createUser({ roles: [500, 900, 100] });

		let response = await await request(app)
			.post(`/api/schedulesFromPrevious`)
			.set('access-token', testhelpers.getJWT(usr))
			.send({ forDate: moment().format("L") });
		expect(response.statusCode).to.eq(403);
	});

	it('scheduler access', async () => {
		const lookups = (await request(app).get('/api/lookups')).body;
		const scheds = [];
		scheds.push(await testhelpers.createSchedule(lookups));
		scheds.push(await testhelpers.createSchedule(lookups));

		const usr = await testhelpers.createUser({ roles: [1000] });

		let response = await await request(app)
			.post(`/api/schedulesFromPrevious`)
			.set('access-token', testhelpers.getJWT(usr))
			.send({ forDate: moment().format("L") });
			expect(response.statusCode).to.eq(200);
	});

	it('should copy from previous', async () => {
		const lookups = (await request(app).get('/api/lookups')).body;
		const usr1 = await testhelpers.createUser({ roles: [] });
		const usr2 = await testhelpers.createUser({ roles: [] });
		const usr3 = await testhelpers.createUser({ roles: [], enableTextNotifications: true, enableEmailNotifications: true });
		const usr4 = await testhelpers.createUser({ roles: [], enableTextNotifications: true, enableEmailNotifications: true });

		let dt = new Date();
		while (dt.getDay() != 1) {
			dt.setDate(dt.getDate() - 1);
		}
		let weekStartDt = new Date(dt);
		dt.setDate(dt.getDate() - 7);
		let startTime = new Date();
		let endTime = new Date();
		endTime.setHours(endTime.getHours() + 1);
		const scheds = [];
		scheds.push(await testhelpers.createSchedule(lookups, usr1.userId, dt, startTime, endTime, true));

		dt.setDate(dt.getDate() + 1);
		startTime.setHours(startTime.getHours() + 1);
		endTime.setHours(startTime.getHours() + 1);
		scheds.push(await testhelpers.createSchedule(lookups, usr2.userId, dt, startTime, endTime, true));

		dt.setDate(dt.getDate() + 1);
		startTime.setHours(startTime.getHours() + 1);
		endTime.setHours(startTime.getHours() + 1);
		scheds.push(await testhelpers.createSchedule(lookups, null, dt, startTime, endTime));

		await testhelpers.createSchedule(lookups, usr3.userId, dt, startTime, endTime, true);
		await testhelpers.createSchedule(lookups, usr4.userId, dt, startTime, endTime, true);
		await models.user.update({ isFired: true },{ where: { userId: usr3.userId }, fields: ['isFired'] });
		await models.user.destroy({ where: { userId: usr4.userId } });

		dt.setDate(dt.getDate() + 1);
		startTime.setHours(startTime.getHours() + 1);
		endTime.setHours(startTime.getHours() + 1);
		scheds.push(await testhelpers.createSchedule(lookups, null, dt, startTime, endTime));

		response = await await request(app).post(`/api/schedulesFromPrevious`).send({ forDate: moment().format("L") });
		expect(response.statusCode).to.eq(200);

		let startDate = moment(weekStartDt);
		let endDate = moment(weekStartDt);
		endDate.date(endDate.date() + 7);


		response = await request(app).get(`/api/schedules?start=${startDate.format("YYYY-MM-DD")}&end=${endDate.format("YYYY-MM-DD")}`);
		expect(response.body.data.length).to.eq(4);
		response.body.data.sort((a, b) => {
			return new Date(a.scheduleDate).getTime() - new Date(b.scheduleDate).getTime();
		});

		dt = new Date();
		while (dt.getDay() != 1) {
			dt.setDate(dt.getDate() - 1);
		}
		dt.setDate(dt.getDate());
		for (let i = 0; i < 4; i++) {
			const d = response.body.data[i];
			expect(moment(d.scheduleDate).format("YYYYMMDD")).to.eq(moment(dt).format("YYYYMMDD"));
			expect(d.scheduleTemplateId).to.eq(null);
			expect(moment(d.startTime).format("HHmm")).to.eq(moment(scheds[i].startTime).format("HHmm"));
			expect(moment(d.endTime).format("HHmm")).to.eq(moment(scheds[i].endTime).format("HHmm"));
			expect(d.userId).to.eq(scheds[i].userId);
			expect(d.shiftId).to.eq(scheds[i].shiftId);
			expect(d.taskId).to.eq(scheds[i].taskId);
			expect(d.published).to.eq(false);
			dt.setDate(dt.getDate() + 1);
		}
	});
});