const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../server');
const testhelpers = require('../testhelpers');
const models = require('../../models');

const tradesUrl = '/api/postTrade';
const tradesUrl2 = '/api/scheduleTrades';

describe('Testing trades', function () {
	this.timeout(60000);

	it('cant trade someone else schedule', async () => {
		const lookups = (await request(app).get('/api/lookups')).body;
		const usr = await testhelpers.createUser({ roles: [] });
		const usr2 = await testhelpers.createUser({ roles: [] });

		const sched = await testhelpers.createSchedule(lookups, usr.userId);
		let response = await request(app)
			.post(tradesUrl)
			.set('access-token', testhelpers.getJWT(usr2))
			.send({ scheduleId: sched.scheduleId });
		expect(response.statusCode).to.eq(409);
		expect(response.body.message).to.eq('Cannot trade this schedule.');
	});

	it('no rights to trade schedule', async () => {
		const lookups = (await request(app).get('/api/lookups')).body;
		const usr = await testhelpers.createUser({ roles: [] });
		const usr2 = await testhelpers.createUser({ roles: [] });

		const sched = await testhelpers.createSchedule(lookups);
		let response = await request(app)
			.post(tradesUrl)
			.set('access-token', testhelpers.getJWT(usr2))
			.send({ scheduleId: sched.scheduleId });
		expect(response.statusCode).to.eq(409);
		expect(response.body.message).to.eq('Cannot trade this schedule.');
	});

	it('cant dup trade', async () => {
		const lookups = (await request(app).get('/api/lookups')).body;
		const usr = await testhelpers.createUser({ enableEmailNotifications: false });

		const sched = await testhelpers.createSchedule(lookups, usr.userId);
		let response = await request(app)
			.post(tradesUrl)
			.set('access-token', testhelpers.getJWT(usr))
			.send({ scheduleId: sched.scheduleId });
		expect(response.statusCode).to.eq(200);

		response = await request(app)
			.post(tradesUrl)
			.set('access-token', testhelpers.getJWT(usr))
			.send({ scheduleId: sched.scheduleId });

		expect(response.statusCode).to.eq(409);
		expect(response.body.message).to.eq('Schedule already marked for trade.');
	});

	it('create trade', async () => {
		const lookups = (await request(app).get('/api/lookups')).body;
		const usr0 = await testhelpers.createUser({ roles: [] });
		const usr = await testhelpers.createUser({ enableTextNotifications: true });
		const usr1 = await testhelpers.createUser({ enableTextNotifications: true });
		const usr2 = await testhelpers.createUser({ enableEmailNotifications: true });
		const usr3 = await testhelpers.createUser({ emailNotifications: [], textNotifications: [], enableTextNotifications: true, enableEmailNotifications: true });
		const usr4 = await testhelpers.createUser({ emailNotifications: [], textNotifications: [], enableTextNotifications: true, enableEmailNotifications: true });

		const sched = await testhelpers.createSchedule(lookups);
		let response = await request(app)
			.post(tradesUrl)
			.set('access-token', testhelpers.getJWT(global.signup.user))
			.send({ scheduleId: sched.scheduleId });
		expect(response.statusCode).to.eq(200);

		const emails = await testhelpers.getEmails();
		expect(emails.length).to.eq(2);
		for (let ml of emails) {
			// expect(ml.replyTo).to.eq(global.signup.user.email);
		}

		const txt = emails.find(t => t.text != null && t.subject == null);
		const eml = emails.find(e => e.html != null && e.subject != null);
		expect(txt).to.exist;
		expect(eml).to.exist;

		expect(txt.bcc.length).to.eq(2);
		expect(txt.bcc.indexOf(`${usr.phoneNumber}@mailinator.com`)).to.be.above(-1);
		expect(txt.bcc.indexOf(`${usr1.phoneNumber}@mailinator.com`)).to.be.above(-1);

		expect(eml.bcc.length).to.eq(1);
		expect(eml.bcc[0]).to.eq(usr2.email);

		// expect(txt.text.indexOf(`Trade has been posted by ${global.signup.user.firstName} ${global.signup.user.lastName}`)).to.be.above(-1);
		// expect(eml.text.indexOf(`Trade has been posted by ${global.signup.user.firstName} ${global.signup.user.lastName}`)).to.be.above(-1);
	});

	async function testTrade(round) {
		const lookups = (await request(app).get('/api/lookups')).body;
		const usr = round == 2 ? global.signup.user : await testhelpers.createUser({ enableTextNotifications: true, enableEmailNotifications: true });
		const usr2 = await testhelpers.createUser({ enableTextNotifications: true, enableEmailNotifications: true });
		const usr3 = await testhelpers.createUser({ roles: [1000], enableTextNotifications: true, enableEmailNotifications: true });

		// CREATE TRADE
		const sched = await testhelpers.createSchedule(lookups, round == 2 ? null : usr.userId);
		let response = await request(app)
			.post(tradesUrl)
			.set('access-token', testhelpers.getJWT(usr))
			.send({ scheduleId: sched.scheduleId });
		expect(response.statusCode).to.eq(200);
		await testhelpers.deleteEmails();
		const scheduleTradeId = response.body.scheduleTradeId;

		let targetSchedule = null;

		// REQUEST TRADE
		let jwt = await testhelpers.getJWT(usr2);
		let params = {};
		if (round == 1) {
			targetSchedule = await testhelpers.createSchedule(lookups, usr2.userId);
			params.tradeForScheduleId = targetSchedule.scheduleId;
		}
		response = await request(app)
			.put(`/api/requestTrade/${scheduleTradeId}`)
			.set('access-token', jwt)
			.send(params);
		expect(response.statusCode).to.eq(200);

		let trade = await models.scheduleTrade.findById(scheduleTradeId);
		expect(trade.tradeStatus).to.eq(round == 2 ? 2 : 1);

		let emails = await testhelpers.getEmails();
		expect(emails.length).to.eq(2);
		for (let ml of emails) {
			// expect(ml.replyTo).to.eq(usr2.email);
		}

		let txt = emails.find(t => t.text != null && t.subject == null);
		let eml = emails.find(e => e.html != null && e.subject != null);
		expect(txt).to.exist;
		expect(eml).to.exist;

		expect(txt.bcc.length).to.eq(1);
		expect(txt.bcc[0]).to.eq(`${(round == 2 ? usr3.phoneNumber : usr.phoneNumber)}@mailinator.com`);

		expect(eml.bcc.length).to.eq(1);
		expect(eml.bcc[0]).to.eq(round == 2 ? usr3.email : usr.email);

		await testhelpers.deleteEmails();

		if (round < 2 || round == 4) {
			// ACCEPT TRADE
			jwt = await testhelpers.getJWT(usr);
			response = await request(app)
				.put(`/api/acceptDeclineTrade/${scheduleTradeId}`)
				.set('access-token', jwt)
				.send({ accept: true });
			expect(response.statusCode).to.eq(200);

			trade = await models.scheduleTrade.findById(scheduleTradeId);
			expect(trade.tradeStatus).to.eq(2);

			let schedule = await models.schedule.findById(sched.scheduleId);
			expect(schedule.userId).to.eq(usr.userId);

			if (targetSchedule) {
				schedule = await models.schedule.findById(targetSchedule.scheduleId);
				expect(targetSchedule.userId).to.eq(usr2.userId);
			}

			emails = await testhelpers.getEmails();
			expect(emails.length).to.eq(2);
			for (let ml of emails) {
				// expect(ml.replyTo).to.eq(usr.email);
			}

			txt = emails.find(t => t.text != null && t.subject == null);
			eml = emails.find(e => e.html != null && e.subject != null);
			expect(txt).to.exist;
			expect(eml).to.exist;

			expect(txt.bcc.length).to.eq(1);
			expect(txt.bcc[0]).to.eq(`${usr3.phoneNumber}@mailinator.com`);

			expect(eml.bcc.length).to.eq(1);
			expect(eml.bcc[0]).to.eq(usr3.email);

			await testhelpers.deleteEmails();
		}
		else if (round == 3) {
			// DECLINE TRADE
			jwt = await testhelpers.getJWT(usr);
			response = await request(app)
				.put(`/api/acceptDeclineTrade/${scheduleTradeId}`)
				.set('access-token', jwt)
				.send({ accept: false });
			expect(response.statusCode).to.eq(200);

			trade = await models.scheduleTrade.findById(scheduleTradeId);
			expect(trade.tradeStatus).to.eq(0);

			let schedule = await models.schedule.findById(sched.scheduleId);
			expect(schedule.userId).to.eq(usr.userId);

			emails = await testhelpers.getEmails();
			expect(emails.length).to.eq(2);
			for (let ml of emails) {
				// expect(ml.replyTo).to.eq(usr.email);
			}

			txt = emails.find(t => t.text != null && t.subject == null);
			eml = emails.find(e => e.html != null && e.subject != null);
			expect(txt).to.exist;
			expect(eml).to.exist;

			expect(txt.bcc.length).to.eq(1);
			expect(txt.bcc[0]).to.eq(`${usr2.phoneNumber}@mailinator.com`);

			expect(eml.bcc.length).to.eq(1);
			expect(eml.bcc[0]).to.eq(usr2.email);

			return;
		}

		// APPROVE DENY TRADE
		if (round < 2) {
			jwt = await testhelpers.getJWT(usr);
			response = await request(app)
				.put(`/api/approveDenyTrade/${scheduleTradeId}`)
				.set('access-token', jwt)
				.send({ approve: true });
			expect(response.statusCode).to.eq(403);
		}

		if (round == 0) {
			jwt = await testhelpers.getJWT(usr3);
		}
		else {
			jwt = await testhelpers.getJWT(global.signup.user);
		}

		if (round == 4) {
			response = await request(app)
				.put(`/api/approveDenyTrade/${scheduleTradeId}`)
				.set('access-token', jwt)
				.send({ approve: false });
			expect(response.statusCode).to.eq(200);

			trade = await models.scheduleTrade.findById(scheduleTradeId);
			expect(trade.tradeStatus).to.eq(4);

			schedule = await models.schedule.findById(sched.scheduleId);
			expect(schedule.userId).to.eq(usr.userId);

			if (targetSchedule) {
				schedule = await models.schedule.findById(targetSchedule.scheduleId);
				expect(schedule.userId).to.eq(usr2.userId);
			}
		}
		else {
			response = await request(app)
				.put(`/api/approveDenyTrade/${scheduleTradeId}`)
				.set('access-token', jwt)
				.send({ approve: true });
			expect(response.statusCode).to.eq(200);

			trade = await models.scheduleTrade.findById(scheduleTradeId);
			expect(trade.tradeStatus).to.eq(3);

			schedule = await models.schedule.findById(sched.scheduleId);
			expect(schedule.userId).to.eq(usr2.userId);

			if (targetSchedule) {
				schedule = await models.schedule.findById(targetSchedule.scheduleId);
				expect(schedule.userId).to.eq(usr.userId);
			}
		}

		emails = await testhelpers.getEmails();
		console.log("BOD", emails.map(e => ({ txt: e.text, bcc: e.bcc })));
		expect(emails.length).to.eq(round == 2 ? 4 : 6);
		for (let ml of emails) {
			// expect(ml.replyTo).to.eq(round == 0 ? usr3.email : global.signup.user.email);
		}

		txt = emails.filter(t => t.text != null && t.subject == null);
		eml = emails.filter(e => e.html != null && e.subject != null);
		expect(txt.length).to.eq(round == 2 ? 2 : 3);
		expect(eml.length).to.eq(round == 2 ? 2 : 3);

		if (round < 2) {
			expect(txt.find(t => t.bcc.length == 1 && t.bcc[0] == `${usr.phoneNumber}@mailinator.com`)).to.exist;
			expect(eml.find(t => t.bcc.length == 1 && t.bcc[0] == `${usr.email}`)).to.exist;
		}

		expect(txt.find(t => t.bcc.length == 1 && t.bcc[0] == `${usr2.phoneNumber}@mailinator.com`)).to.exist;
		expect(eml.find(t => t.bcc.length == 1 && t.bcc[0] == `${usr2.email}`)).to.exist;

		expect(txt.find(t => t.bcc.length == 1 && t.bcc[0] == `${usr3.phoneNumber}@mailinator.com`)).to.exist;
		expect(eml.find(t => t.bcc.length == 1 && t.bcc[0] == `${usr3.email}`)).to.exist;
	}

	it('trade no target accept approve', async () => {
		await testTrade(0);
	});

	it('trade target accept approve', async () => {
		await testTrade(1);
	});

	it('trade no source', async () => {
		await testTrade(2);
	});

	it('trade decline', async () => {
		await testTrade(3);
	});

	it('trade accept deny', async () => {
		await testTrade(4);
	});

	it('no endpoints', async () => {
		const lookups = (await request(app).get('/api/lookups')).body;
		const usr = await testhelpers.createUser({ enableEmailNotifications: false });
		const sched = await testhelpers.createSchedule(lookups, usr.userId);
		let response = await request(app)
			.post(tradesUrl2)
			.set('access-token', testhelpers.getJWT(usr))
			.send({ scheduleId: sched.scheduleId });
		expect(response.statusCode).to.eq(404);

		response = await request(app)
			.post(tradesUrl)
			.set('access-token', testhelpers.getJWT(usr))
			.send({ scheduleId: sched.scheduleId });
		expect(response.statusCode).to.eq(200);

		const tradeId = response.body.scheduleTradeId;

		response = await request(app)
			.put(`${tradesUrl2}/${tradeId}`)
			.set('access-token', testhelpers.getJWT(usr))
			.send({ scheduleId: sched.scheduleId });
		expect(response.statusCode).to.eq(404);
	});

	it('delete my trade', async () => {
		const lookups = (await request(app).get('/api/lookups')).body;
		const usr = await testhelpers.createUser({ enableEmailNotifications: false });
		const sched = await testhelpers.createSchedule(lookups, usr.userId);
		let response = await request(app)
			.post(tradesUrl)
			.set('access-token', testhelpers.getJWT(usr))
			.send({ scheduleId: sched.scheduleId });
		expect(response.statusCode).to.eq(200);

		const tradeId = response.body.scheduleTradeId;

		response = await request(app)
			.delete(`${tradesUrl2}/${tradeId}`)
			.set('access-token', testhelpers.getJWT(usr))
		expect(response.statusCode).to.eq(204);
	});

	it('delete my trade', async () => {
		const lookups = (await request(app).get('/api/lookups')).body;
		const usr = await testhelpers.createUser({ enableEmailNotifications: false });
		const sched = await testhelpers.createSchedule(lookups, usr.userId);
		let response = await request(app)
			.post(tradesUrl)
			.set('access-token', testhelpers.getJWT(usr))
			.send({ scheduleId: sched.scheduleId });
		expect(response.statusCode).to.eq(200);

		const tradeId = response.body.scheduleTradeId;

		response = await request(app)
			.delete(`${tradesUrl2}/${tradeId}`)
			.set('access-token', testhelpers.getJWT(usr))
		expect(response.statusCode).to.eq(204);
	});

	it('cant delete blank trade', async () => {
		const lookups = (await request(app).get('/api/lookups')).body;
		const usr = await testhelpers.createUser({ enableEmailNotifications: false });
		const sched = await testhelpers.createSchedule(lookups);
		let response = await request(app)
			.post(tradesUrl)
			.set('access-token', testhelpers.getJWT(global.signup.user))
			.send({ scheduleId: sched.scheduleId });
		expect(response.statusCode).to.eq(200);

		const tradeId = response.body.scheduleTradeId;

		response = await request(app)
			.delete(`${tradesUrl2}/${tradeId}`)
			.set('access-token', testhelpers.getJWT(usr))
		expect(response.statusCode).to.eq(409);
	});

	it('cant delete other user trade', async () => {
		const lookups = (await request(app).get('/api/lookups')).body;
		const usr = await testhelpers.createUser({ enableEmailNotifications: false });
		const usr2 = await testhelpers.createUser({ enableEmailNotifications: false });
		const sched = await testhelpers.createSchedule(lookups, usr.userId);
		let response = await request(app)
			.post(tradesUrl)
			.set('access-token', testhelpers.getJWT(usr))
			.send({ scheduleId: sched.scheduleId });
		expect(response.statusCode).to.eq(200);

		const tradeId = response.body.scheduleTradeId;

		response = await request(app)
			.delete(`${tradesUrl2}/${tradeId}`)
			.set('access-token', testhelpers.getJWT(usr2))
		expect(response.statusCode).to.eq(409);
	});

	it('delete as scheduler', async () => {
		const lookups = (await request(app).get('/api/lookups')).body;
		const usr = await testhelpers.createUser({ enableEmailNotifications: false });
		const usr2 = await testhelpers.createUser({ roles: [1000] });
		const sched = await testhelpers.createSchedule(lookups, usr.userId);
		let response = await request(app)
			.post(tradesUrl)
			.set('access-token', testhelpers.getJWT(usr))
			.send({ scheduleId: sched.scheduleId });
		expect(response.statusCode).to.eq(200);

		const tradeId = response.body.scheduleTradeId;

		response = await request(app)
			.delete(`${tradesUrl2}/${tradeId}`)
			.set('access-token', testhelpers.getJWT(usr2))
		expect(response.statusCode).to.eq(204);
	});

	it('delete as admin', async () => {
		const lookups = (await request(app).get('/api/lookups')).body;
		const usr = await testhelpers.createUser({ enableEmailNotifications: false });
		const sched = await testhelpers.createSchedule(lookups, usr.userId);
		let response = await request(app)
			.post(tradesUrl)
			.set('access-token', testhelpers.getJWT(usr))
			.send({ scheduleId: sched.scheduleId });
		expect(response.statusCode).to.eq(200);

		const tradeId = response.body.scheduleTradeId;

		response = await request(app)
			.delete(`${tradesUrl2}/${tradeId}`)
			.set('access-token', testhelpers.getJWT(global.signup.user))
		expect(response.statusCode).to.eq(204);
	});
});