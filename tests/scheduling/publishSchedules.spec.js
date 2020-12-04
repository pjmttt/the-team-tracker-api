const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../server');
const testhelpers = require('../testhelpers');
const models = require('../../models');
const moment = require('moment');

describe('Testing publish schedules', function () {
	this.timeout(60000);

	it('no access', async () => {
		const usr = await testhelpers.createUser({ roles: [500, 900, 100] });

		let response = await request(app)
			.post(`/api/publishSchedules`)
			.set('access-token', testhelpers.getJWT(usr))
			.send({});

		expect(response.statusCode).to.eq(403);
	});

	it('scheduler access', async () => {
		const lookups = (await request(app).get('/api/lookups')).body;
		const sched1 = await testhelpers.createSchedule(lookups);
		const sched2 = await testhelpers.createSchedule(lookups);

		const usr = await testhelpers.createUser({ roles: [1000] });

		const params = {
			scheduleIds: [sched1.scheduleId, sched2.scheduleId]
		}

		let response = await request(app)
			.post(`/api/publishSchedules`)
			.set('access-token', testhelpers.getJWT(usr))
			.send(params);

		expect(response.statusCode).to.eq(200);
	});

	it('publish schedules', async () => {
		const lookups = (await request(app).get('/api/lookups')).body;

		const usr1 = await testhelpers.createUser({ roles: [] });
		const usr2 = await testhelpers.createUser({ roles: [], enableTextNotifications: true, enableEmailNotifications: true });
		const usr3 = await testhelpers.createUser({ roles: [], enableTextNotifications: true });
		const usr4 = await testhelpers.createUser({ roles: [], enableEmailNotifications: true });
		const usr5 = await testhelpers.createUser({ roles: [], enableTextNotifications: true, enableEmailNotifications: true });
		
		const sched1 = await testhelpers.createSchedule(lookups, null, null, null, null, true);
		const sched2 = await testhelpers.createSchedule(lookups, usr1.userId);
		const sched3 = await testhelpers.createSchedule(lookups);
		const sched4 = await testhelpers.createSchedule(lookups, usr2.userId);
		const sched5 = await testhelpers.createSchedule(lookups, usr2.userId);
		const sched6 = await testhelpers.createSchedule(lookups, usr3.userId);
		const sched7 = await testhelpers.createSchedule(lookups, usr3.userId);
		const sched8 = await testhelpers.createSchedule(lookups, usr4.userId);
		const sched9 = await testhelpers.createSchedule(lookups, usr5.userId);

		await testhelpers.deleteEmails();

		let response = await request(app)
			.post(`/api/publishSchedules`)
			.send({
				scheduleIds: [
					sched1.scheduleId,
					sched2.scheduleId,
					sched3.scheduleId,
					sched4.scheduleId,
					sched5.scheduleId,
					sched6.scheduleId,
					sched7.scheduleId,
					sched8.scheduleId,
				]
			});

		expect(response.statusCode).to.eq(200);

		const saved1 = await models.schedule.findById(sched1.scheduleId);
		expect(saved1.published).to.eq(true);
		const saved2 = await models.schedule.findById(sched2.scheduleId);
		expect(saved2.published).to.eq(true);
		const saved3 = await models.schedule.findById(sched3.scheduleId);
		expect(saved3.published).to.eq(false);
		const saved4 = await models.schedule.findById(sched4.scheduleId);
		expect(saved4.published).to.eq(true);
		const saved5 = await models.schedule.findById(sched5.scheduleId);
		expect(saved5.published).to.eq(true);
		const saved6 = await models.schedule.findById(sched6.scheduleId);
		expect(saved6.published).to.eq(true);
		const saved7 = await models.schedule.findById(sched7.scheduleId);
		expect(saved7.published).to.eq(true);
		const saved8 = await models.schedule.findById(sched8.scheduleId);
		expect(saved8.published).to.eq(true);
		const saved9 = await models.schedule.findById(sched9.scheduleId);
		expect(saved9.published).to.eq(false);

		let emails = await testhelpers.getEmails();
		expect(emails.length).to.eq(4);
		for (let ml of emails) {
			expect(ml.bcc.length).to.eq(1);
		}

		let txt = emails.find(t => t.text != null && t.subject == null && t.bcc[0] == `${usr1.phoneNumber}@mailinator.com`);
		let eml = emails.find(e => e.html != null && e.subject != null && e.bcc[0] == usr1.email);
		expect(txt).to.not.exist;
		expect(eml).to.not.exist;

		txt = emails.find(t => t.text != null && t.subject == null && t.bcc[0] == `${usr2.phoneNumber}@mailinator.com`);
		eml = emails.find(e => e.html != null && e.subject != null && e.bcc[0] == usr2.email);
		expect(txt).to.exist;
		expect(eml).to.exist;

		txt = emails.find(t => t.text != null && t.subject == null && t.bcc[0] == `${usr3.phoneNumber}@mailinator.com`);
		eml = emails.find(e => e.html != null && e.subject != null && e.bcc[0] == usr3.email);
		expect(txt).to.exist;
		expect(eml).to.not.exist;

		txt = emails.find(t => t.text != null && t.subject == null && t.bcc[0] == `${usr4.phoneNumber}@mailinator.com`);
		eml = emails.find(e => e.html != null && e.subject != null && e.bcc[0] == usr4.email);
		expect(txt).to.not.exist;
		expect(eml).to.exist;

		txt = emails.find(t => t.text != null && t.subject == null && t.bcc[0] == `${usr5.phoneNumber}@mailinator.com`);
		eml = emails.find(e => e.html != null && e.subject != null && e.bcc[0] == usr5.email);
		expect(txt).to.not.exist;
		expect(eml).to.not.exist;
	});
});