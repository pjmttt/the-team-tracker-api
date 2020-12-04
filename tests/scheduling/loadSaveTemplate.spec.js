const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../server');
const testhelpers = require('../testhelpers');
const models = require('../../models');
const moment = require('moment');

describe('Testing load save template', function () {
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


		const params = {
			templateName: 'test template',
			schedules: scheds.map(s => Object.assign({}, s))
		}

		let response = await request(app)
			.post(`/api/scheduleTemplates`)
			.set('access-token', testhelpers.getJWT(usr))
			.send(params);

		expect(response.statusCode).to.eq(403);
	});

	it('scheduler access', async () => {
		const lookups = (await request(app).get('/api/lookups')).body;
		const scheds = [];
		scheds.push(await testhelpers.createSchedule(lookups));
		scheds.push(await testhelpers.createSchedule(lookups));

		const usr = await testhelpers.createUser({ roles: [1000] });


		const params = {
			templateName: 'test template',
			schedules: scheds.map(s => Object.assign({}, s))
		}

		let response = await request(app)
			.post(`/api/scheduleTemplates`)
			.set('access-token', testhelpers.getJWT(usr))
			.send(params);

		expect(response.statusCode).to.eq(201);
	});

	it('should save & load template', async () => {
		const lookups = (await request(app).get('/api/lookups')).body;
		const usr1 = await testhelpers.createUser({ roles: [] });
		const usr2 = await testhelpers.createUser({ roles: [] });
		const usr3 = await testhelpers.createUser({ roles: [], enableTextNotifications: true, enableEmailNotifications: true });
		const usr4 = await testhelpers.createUser({ roles: [], enableTextNotifications: true, enableEmailNotifications: true });

		let dt = new Date();
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
		
		dt.setDate(dt.getDate() + 1);
		startTime.setHours(startTime.getHours() + 1);
		endTime.setHours(startTime.getHours() + 1);
		scheds.push(await testhelpers.createSchedule(lookups, null, dt, startTime, endTime));

		scheds.push(await testhelpers.createSchedule(lookups, usr3.userId, dt, startTime, endTime, true));
		scheds.push(await testhelpers.createSchedule(lookups, usr4.userId, dt, startTime, endTime, true));
		
		const params = {
			templateName: 'test template',
			schedules: scheds.map(s => Object.assign({}, s))
		}

		let response = await request(app)
			.post(`/api/scheduleTemplates`)
			.send(params);

		expect(response.statusCode).to.eq(201);

		await models.user.update({ isFired: true },{ where: { userId: usr3.userId }, fields: ['isFired'] });
		await models.user.destroy({ where: { userId: usr4.userId } });

		const templateId = response.body.scheduleTemplateId;

		for (let s of scheds) {
			response = await request(app).delete(`/api/schedules/${s.scheduleId}`);
			expect(response.statusCode).to.eq(204);
		}

		response = await request(app).get('/api/schedules?start=1900-01-01&end=2099-01-01');
		expect(response.statusCode).to.eq(200);
		expect(response.body.data.length).to.eq(0);

		dt = new Date();
		dt.setDate(dt.getDate() + 7);
		response = await await request(app).post(`/api/schedulesFromTemplate/${templateId}`).send({ forDate: moment(dt).format("L") });
		expect(response.statusCode).to.eq(200);


		response = await request(app).get('/api/schedules?start=1900-01-01&end=2099-01-01');
		expect(response.body.data.length).to.eq(4);
		response.body.data.sort((a, b) => {
			return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
		});
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