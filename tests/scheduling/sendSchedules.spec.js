const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../server');
const testhelpers = require('../testhelpers');
const models = require('../../models');
const moment = require('moment');

describe('Testing send schedules', function () {
	this.timeout(60000);

	it('no access', async () => {
		const usr = await testhelpers.createUser({ roles: [500, 900, 100] });

		let response = await request(app)
			.post(`/api/sendSchedules`)
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
			.post(`/api/sendSchedules`)
			.set('access-token', testhelpers.getJWT(usr))
			.send(params);

		expect(response.statusCode).to.eq(200);
	});

	it('send schedules', async () => {
		const lookups = (await request(app).get('/api/lookups')).body;
		const usr0 = await testhelpers.createUser({ roles: [], enableEmailNotifications: true, enableTextNotifications: true });
		const usr1 = await testhelpers.createUser({ });
		const usr2 = await testhelpers.createUser({ });
		const usr3 = await testhelpers.createUser({ emailNotifications: [], enableEmailNotifications: true, textNotifications: [] });
		const usr4 = await testhelpers.createUser({ emailNotifications: [], enableTextNotifications: true, textNotifications: [] });
		const usr5 = await testhelpers.createUser({ emailNotifications: [], textNotifications: [], enableEmailNotifications: true, enableTextNotifications: true });
		const usr6 = await testhelpers.createUser({ roles: [], enableTextNotifications: true, enableEmailNotifications: true });
		const usr7 = await testhelpers.createUser({ roles: [], enableTextNotifications: true, enableEmailNotifications: true });
		
		let scheds = [];
		const dt = new Date();
		scheds.push(await testhelpers.createSchedule(lookups, usr0.userId, dt, null, null, true));

		dt.setDate(dt.getDate() + 1);
		scheds.push(await testhelpers.createSchedule(lookups, usr1.userId, dt));

		dt.setDate(dt.getDate() + 1);
		scheds.push(await testhelpers.createSchedule(lookups, null, dt, null, null, true));

		dt.setDate(dt.getDate() + 1);
		scheds.push(await testhelpers.createSchedule(lookups, null, dt, null, null, true));

		dt.setDate(dt.getDate() + 1);
		scheds.push(await testhelpers.createSchedule(lookups, usr2.userId, dt, null, null, true));

		dt.setDate(dt.getDate() + 1);
		scheds.push(await testhelpers.createSchedule(lookups, usr2.userId, dt));

		dt.setDate(dt.getDate() + 1);
		scheds.push(await testhelpers.createSchedule(lookups, usr3.userId, dt, null, null, true));

		dt.setDate(dt.getDate() + 1);
		scheds.push(await testhelpers.createSchedule(lookups, usr3.userId, dt));

		dt.setDate(dt.getDate() + 1);
		scheds.push(await testhelpers.createSchedule(lookups, usr4.userId, dt, null, null, true));

		dt.setDate(dt.getDate() + 1);
		scheds.push(await testhelpers.createSchedule(lookups, usr4.userId, dt, null, null, true));

		dt.setDate(dt.getDate() + 1);
		scheds.push(await testhelpers.createSchedule(lookups, usr4.userId, dt));

		dt.setDate(dt.getDate() + 1);
		scheds.push(await testhelpers.createSchedule(lookups, usr5.userId, dt));

		dt.setDate(dt.getDate() + 1);
		scheds.push(await testhelpers.createSchedule(lookups, usr5.userId, dt));

		await testhelpers.createSchedule(lookups, usr6.userId, dt);
		await testhelpers.createSchedule(lookups, usr7.userId, dt);

		await models.user.update({ isFired: true },{ where: { userId: usr6.userId }, fields: ['isFired'] });
		await models.user.destroy({ where: { userId: usr7.userId } });

		const usrs = [usr0, usr1, usr2, usr3, usr4];

		// let emails = await testhelpers.getEmails();

		// expect(emails.length).to.eq(5);
		// for (let e of emails) {
		// 	expect(e.bcc.length).to.eq(1);
		// }

		// for (let u of [usr1, usr2, usr4, usr5]) {
		// 	const emls = emails.filter(e => e.bcc[0] == u.email);
		// 	expect(emls.length).to.eq(0);
		// }

		// for (let u of [usr0, usr3]) {
		// 	const emls = emails.filter(e => e.bcc[0] == u.email);
		// 	expect(emls.length).to.eq(1);
		// 	const eml = emls[0];
		// 	expect(eml.subject).to.not.be.eq(null);
		// 	for (let s of scheds.filter(s => s.userId == u.userId)) {
		// 		if (s.published) {
		// 			expect(eml.subject).to.contain(moment(s.scheduleDate).format("MM/DD/YYYY"));
		// 			expect(eml.html).to.contain(moment(s.scheduleDate).format("MM/DD/YYYY"));
		// 		}
		// 		else {
		// 			expect(eml.subject).to.not.contain(moment(s.scheduleDate).format("MM/DD/YYYY"));
		// 			expect(eml.html).to.not.contain(moment(s.scheduleDate).format("MM/DD/YYYY"));
		// 		}
		// 	}
		// }

		// for (let u of [usr1, usr2, usr3, usr5]) {
		// 	const emls = emails.filter(e => e.bcc[0] == `${u.phoneNumber}@mailinator.com`);
		// 	expect(emls.length).to.eq(0);
		// }

		// for (let u of [usr0]) {
		// 	const emls = emails.filter(e => e.bcc[0] == `${u.phoneNumber}@mailinator.com`);
		// 	expect(emls.length).to.eq(1);
		// 	const eml = emls[0];
		// 	expect(eml.subject).to.be.eq(null);
		// 	for (let s of scheds.filter(s => s.userId == u.userId)) {
		// 		if (s.published) {
		// 			expect(eml.text).to.contain(moment(s.scheduleDate).format("MM/DD/YYYY"));
		// 		}
		// 		else {
		// 			expect(eml.text).to.not.contain(moment(s.scheduleDate).format("MM/DD/YYYY"));
		// 		}
		// 	}
		// }

		// for (let u of [usr4]) {
		// 	const emls = emails.filter(e => e.bcc[0] == `${u.phoneNumber}@mailinator.com`);
		// 	expect(emls.length).to.eq(2);
		// }

		// await testhelpers.deleteEmails();
		response = await request(app)
			.post(`/api/sendSchedules`)
			.send({ scheduleIds: scheds.map(s => s.scheduleId), isText: true });

		expect(response.statusCode).to.eq(200);

		emails = await testhelpers.getEmails();

		expect(emails.length).to.eq(2);
		for (let e of emails) {
			expect(e.bcc.length).to.eq(1);
		}

		for (let u of [usr1, usr2, usr3, usr5]) {
			const emls = emails.filter(e => e.bcc[0] == `${u.phoneNumber}@mailinator.com`);
			expect(emls.length).to.eq(0);
		}

		for (let u of [usr0, usr4]) {
			const emls = emails.filter(e => e.bcc[0] == `${u.phoneNumber}@mailinator.com`);
			expect(emls.length).to.eq(1);
			const eml = emls[0];
			expect(eml.subject).to.be.eq(null);
			for (let s of scheds.filter(s => s.userId == u.userId)) {
				if (s.published) {
					expect(eml.text).to.contain(moment(s.scheduleDate).format("MM/DD/YYYY"));
				}
				else {
					expect(eml.text).to.not.contain(moment(s.scheduleDate).format("MM/DD/YYYY"));
				}
			}
		}

		await testhelpers.deleteEmails();
		response = await request(app)
			.post(`/api/sendSchedules`)
			.send({ scheduleIds: scheds.map(s => s.scheduleId) });

		expect(response.statusCode).to.eq(200);

		emails = await testhelpers.getEmails();

		expect(emails.length).to.eq(2);
		for (let e of emails) {
			expect(e.bcc.length).to.eq(1);
		}

		for (let u of [usr1, usr2, usr4, usr5]) {
			const emls = emails.filter(e => e.bcc[0] == u.email);
			expect(emls.length).to.eq(0);
		}

		for (let u of [usr0, usr3]) {
			const emls = emails.filter(e => e.bcc[0] == u.email);
			expect(emls.length).to.eq(1);
			const eml = emls[0];
			expect(eml.subject).to.not.be.eq(null);
			for (let s of scheds.filter(s => s.userId == u.userId)) {
				if (s.published) {
					expect(eml.subject).to.contain(moment(s.scheduleDate).format("MM/DD/YYYY"));
					expect(eml.html).to.contain(moment(s.scheduleDate).format("MM/DD/YYYY"));
				}
				else {
					expect(eml.subject).to.not.contain(moment(s.scheduleDate).format("MM/DD/YYYY"));
					expect(eml.html).to.not.contain(moment(s.scheduleDate).format("MM/DD/YYYY"));
				}
			}
		}
	});
});