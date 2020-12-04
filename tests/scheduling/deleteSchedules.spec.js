const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../server');
const testhelpers = require('../testhelpers');
const models = require('../../models');
const moment = require('moment');

describe('Testing delete schedules', function () {
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
			.post(`/api/deleteSchedules`)
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
			.post(`/api/deleteSchedules`)
			.set('access-token', testhelpers.getJWT(usr))
			.send(params);

		expect(response.statusCode).to.eq(200);
	});

	async function createSchedules() {
		const lookups = (await request(app).get('/api/lookups')).body;
		const usr1 = await testhelpers.createUser({ roles: [] });
		const usr2 = await testhelpers.createUser({ roles: [] });
		let dt = new Date();

		while (dt.getDay() != 1) {
			dt.setDate(dt.getDate() - 1);
		}

		let startTime = new Date();
		let endTime = new Date();
		endTime.setHours(endTime.getHours() + 1);
		const scheds = [];
		scheds.push(await testhelpers.createSchedule(lookups, usr1.userId, dt, startTime, endTime));

		dt.setDate(dt.getDate() + 1);
		startTime.setHours(startTime.getHours() + 1);
		endTime.setHours(startTime.getHours() + 1);
		scheds.push(await testhelpers.createSchedule(lookups, usr2.userId, dt, startTime, endTime));

		dt.setDate(dt.getDate() + 1);
		startTime.setHours(startTime.getHours() + 1);
		endTime.setHours(startTime.getHours() + 1);
		scheds.push(await testhelpers.createSchedule(lookups, null, dt, startTime, endTime));

		dt.setDate(dt.getDate() + 1);
		startTime.setHours(startTime.getHours() + 1);
		endTime.setHours(startTime.getHours() + 1);
		scheds.push(await testhelpers.createSchedule(lookups, null, dt, startTime, endTime));


		dt.setDate(dt.getDate() + 7);
		while (dt.getDay() != 1) {
			dt.setDate(dt.getDate() - 1);
		}
		startTime = new Date();
		endTime = new Date();
		scheds.push(await testhelpers.createSchedule(lookups, usr1.userId, dt, startTime, endTime));

		dt.setDate(dt.getDate() + 1);
		startTime.setHours(startTime.getHours() + 1);
		endTime.setHours(startTime.getHours() + 1);
		scheds.push(await testhelpers.createSchedule(lookups, usr2.userId, dt, startTime, endTime));

		dt.setDate(dt.getDate() + 1);
		startTime.setHours(startTime.getHours() + 1);
		endTime.setHours(startTime.getHours() + 1);
		scheds.push(await testhelpers.createSchedule(lookups, null, dt, startTime, endTime));

		dt.setDate(dt.getDate() + 1);
		startTime.setHours(startTime.getHours() + 1);
		endTime.setHours(startTime.getHours() + 1);
		scheds.push(await testhelpers.createSchedule(lookups, null, dt, startTime, endTime));

		dt.setDate(dt.getDate() + 7);
		while (dt.getDay() != 1) {
			dt.setDate(dt.getDate() - 1);
		}
		startTime = new Date();
		endTime = new Date();
		scheds.push(await testhelpers.createSchedule(lookups, usr1.userId, dt, startTime, endTime));

		dt.setDate(dt.getDate() + 1);
		startTime.setHours(startTime.getHours() + 1);
		endTime.setHours(startTime.getHours() + 1);
		scheds.push(await testhelpers.createSchedule(lookups, usr2.userId, dt, startTime, endTime));

		dt.setDate(dt.getDate() + 1);
		startTime.setHours(startTime.getHours() + 1);
		endTime.setHours(startTime.getHours() + 1);
		scheds.push(await testhelpers.createSchedule(lookups, null, dt, startTime, endTime));

		dt.setDate(dt.getDate() + 1);
		startTime.setHours(startTime.getHours() + 1);
		endTime.setHours(startTime.getHours() + 1);
		scheds.push(await testhelpers.createSchedule(lookups, null, dt, startTime, endTime));

		return scheds;
	}

	it('delete schedules', async () => {
		const scheds = await createSchedules();

		const dt = new Date();
		dt.setDate(dt.getDate() + 7);
		while (dt.getDay() != 1) {
			dt.setDate(dt.getDate() - 1);
		};

		for (let i = 0; i < 7; i++) {
			let response = await request(app)
				.post(`/api/deleteSchedules`)
				.send({ forDate: dt });
			dt.setDate(dt.getDate() + 1);
			expect(response.statusCode).to.eq(200);
		}

		response = await request(app).get('/api/schedules?start=1900-01-01&end=2099-01-01');
		expect(response.body.data.length).to.eq(scheds.length);
		response.body.data.sort((a, b) => {
			return new Date(a.scheduleDate).getTime() - new Date(b.scheduleDate).getTime();
		});
		for (let i = 0; i < scheds.length; i++) {
			const d = response.body.data[i];
			expect(moment(d.scheduleDate).format("YYYYMMDD")).to.eq(moment(scheds[i].scheduleDate).format("YYYYMMDD"));
			expect(moment(d.startTime).format("HHmm")).to.eq(moment(scheds[i].startTime).format("HHmm"));
			expect(moment(d.endTime).format("HHmm")).to.eq(moment(scheds[i].endTime).format("HHmm"));
			if (i > 3 && i < 8) {
				expect(d.userId).to.eq(null, i.toString());
			}
			else {
				expect(d.userId).to.eq(scheds[i].userId, i.toString());
			}
			expect(d.shiftId).to.eq(scheds[i].shiftId);
			expect(d.taskId).to.eq(scheds[i].taskId);
		}
	});

	it('delete unscheduled', async () => {
		const scheds = await createSchedules();

		const dt = new Date();
		dt.setDate(dt.getDate() + 7);
		while (dt.getDay() != 1) {
			dt.setDate(dt.getDate() - 1);
		};

		for (let i = 0; i < 7; i++) {
			let response = await request(app)
				.post(`/api/deleteSchedules`)
				.send({ forDate: dt, unscheduled: true });
			dt.setDate(dt.getDate() + 1);
			expect(response.statusCode).to.eq(200);
		}

		response = await request(app).get('/api/schedules?start=1900-01-01&end=2099-01-01');
		expect(response.body.data.length).to.eq(scheds.length - 2);
		response.body.data.sort((a, b) => {
			return new Date(a.scheduleDate).getTime() - new Date(b.scheduleDate).getTime();
		});
		for (let i = 0; i < 6; i++) {
			const d = response.body.data[i];
			expect(moment(d.scheduleDate).format("YYYYMMDD")).to.eq(moment(scheds[i].scheduleDate).format("YYYYMMDD"));
			expect(moment(d.startTime).format("HHmm")).to.eq(moment(scheds[i].startTime).format("HHmm"));
			expect(moment(d.endTime).format("HHmm")).to.eq(moment(scheds[i].endTime).format("HHmm"));
			expect(d.userId).to.eq(scheds[i].userId, i.toString());
			expect(d.shiftId).to.eq(scheds[i].shiftId);
			expect(d.taskId).to.eq(scheds[i].taskId);
		}

		for (let i = 9; i < scheds.length; i++) {
			const d = response.body.data[i - 2];
			expect(moment(d.scheduleDate).format("YYYYMMDD")).to.eq(moment(scheds[i].scheduleDate).format("YYYYMMDD"));
			expect(moment(d.startTime).format("HHmm")).to.eq(moment(scheds[i].startTime).format("HHmm"));
			expect(moment(d.endTime).format("HHmm")).to.eq(moment(scheds[i].endTime).format("HHmm"));
			expect(d.userId).to.eq(scheds[i].userId, i.toString());
			expect(d.shiftId).to.eq(scheds[i].shiftId);
			expect(d.taskId).to.eq(scheds[i].taskId);
		}
	});

	it('delete all', async () => {
		const scheds = await createSchedules();

		let dt = new Date();
		dt.setDate(dt.getDate() + 7);
		while (dt.getDay() != 1) {
			dt.setDate(dt.getDate() - 1);
		};

		for (let i = 0; i < 7; i++) {
			let response = await request(app)
				.post(`/api/deleteSchedules`)
				.send({ forDate: dt });
			dt.setDate(dt.getDate() + 1);
			expect(response.statusCode).to.eq(200);
		}

		dt = new Date();
		dt.setDate(dt.getDate() + 7);
		while (dt.getDay() != 1) {
			dt.setDate(dt.getDate() - 1);
		};

		for (let i = 0; i < 7; i++) {
			let response = await request(app)
				.post(`/api/deleteSchedules`)
				.send({ forDate: dt, unscheduled: true });
			dt.setDate(dt.getDate() + 1);
			expect(response.statusCode).to.eq(200);
		}

		response = await request(app).get('/api/schedules?start=1900-01-01&end=2099-01-01');
		expect(response.body.data.length).to.eq(scheds.length - 4);
		response.body.data.sort((a, b) => {
			return new Date(a.scheduleDate).getTime() - new Date(b.scheduleDate).getTime();
		});
		for (let i = 0; i < 4; i++) {
			const d = response.body.data[i];
			expect(moment(d.scheduleDate).format("YYYYMMDD")).to.eq(moment(scheds[i].scheduleDate).format("YYYYMMDD"));
			expect(moment(d.startTime).format("HHmm")).to.eq(moment(scheds[i].startTime).format("HHmm"));
			expect(moment(d.endTime).format("HHmm")).to.eq(moment(scheds[i].endTime).format("HHmm"));
			expect(d.userId).to.eq(scheds[i].userId, i.toString());
			expect(d.shiftId).to.eq(scheds[i].shiftId);
			expect(d.taskId).to.eq(scheds[i].taskId);
		}

		for (let i = 8; i < scheds.length; i++) {
			const d = response.body.data[i - 4];
			expect(moment(d.scheduleDate).format("YYYYMMDD")).to.eq(moment(scheds[i].scheduleDate).format("YYYYMMDD"));
			expect(moment(d.startTime).format("HHmm")).to.eq(moment(scheds[i].startTime).format("HHmm"));
			expect(moment(d.endTime).format("HHmm")).to.eq(moment(scheds[i].endTime).format("HHmm"));
			expect(d.userId).to.eq(scheds[i].userId, i.toString());
			expect(d.shiftId).to.eq(scheds[i].shiftId);
			expect(d.taskId).to.eq(scheds[i].taskId);
		}
	});
});