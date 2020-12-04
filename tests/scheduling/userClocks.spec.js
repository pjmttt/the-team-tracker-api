const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../server');
const testhelpers = require('../testhelpers');
const models = require('../../models');

const userClockUrl = '/api/userClocks';

describe('Testing user clocks', function () {
	this.timeout(60000);

	it('cant submit user clock for someone else', async () => {
		const usr = await testhelpers.createUser({ roles: [] });
		const usr2 = await testhelpers.createUser({ roles: [] });
		let response = await request(app)
			.post(userClockUrl)
			.set('access-token', testhelpers.getJWT(usr))
			.send({
				userId: usr2.userId,
				clockInDate: new Date()
			});
		expect(response.statusCode).to.eq(403);
	});

	it('submit user clock as scheduler', async () => {
		const usr = await testhelpers.createUser({ roles: [1000] });
		const usr2 = await testhelpers.createUser({ roles: [] });
		let response = await request(app)
			.post(userClockUrl)
			.set('access-token', testhelpers.getJWT(usr))
			.send({
				userId: usr2.userId,
				clockInDate: new Date(),
			});
		expect(response.statusCode).to.eq(201);
		expect(response.body.status).to.eq(0);

		const emails = await testhelpers.getEmails();
		expect(emails.length).to.eq(0);
	});

	it('submit user clock as admin', async () => {
		const usr2 = await testhelpers.createUser({ roles: [] });
		let response = await request(app)
			.post(userClockUrl)
			.set('access-token', testhelpers.getJWT(global.signup.user))
			.send({
				userId: usr2.userId,
				clockInDate: new Date(),
			});
		expect(response.statusCode).to.eq(201);
		expect(response.body.status).to.eq(0);

		const emails = await testhelpers.getEmails();
		expect(emails.length).to.eq(0);
	});

	async function testUserClock(round) {
		const usr = await testhelpers.createUser({ roles: [], enableTextNotifications: round == 0, enableEmailNotifications: round == 2 });
		const usr2 = await testhelpers.createUser({ roles: [1000], enableTextNotifications: true });
		const usr3 = await testhelpers.createUser({ roles: [100, 500, 900], enableEmailNotifications: true });
		const usr4 = await testhelpers.createUser({ roles: [1000], enableTextNotifications: true, enableEmailNotifications: true });
		const usr5 = await testhelpers.createUser({ roles: [100, 500, 900], enableTextNotifications: true, enableEmailNotifications: true });
		const params = {
			status: 0,
			userId: usr.userId,
			clockInDate: new Date()
		}
		let response = await request(app)
			.post(userClockUrl)
			.set('access-token', testhelpers.getJWT(usr))
			.send(params);
		expect(response.statusCode).to.eq(201);
		expect(response.body.status).to.eq(1);

		let emails = await testhelpers.getEmails();
		expect(emails.length).to.eq(2);
		for (let ml of emails) {
			// expect(ml.replyTo).to.eq(usr.email);
		}

		let txt = emails.find(t => t.text != null && t.subject == null);
		let eml = emails.find(e => e.html != null && e.subject != null);
		expect(txt).to.exist;
		expect(eml).to.exist;

		expect(txt.bcc.length).to.eq(2);
		expect(txt.bcc.indexOf(`${usr2.phoneNumber}@mailinator.com`)).to.be.above(-1);
		expect(txt.bcc.indexOf(`${usr4.phoneNumber}@mailinator.com`)).to.be.above(-1);

		expect(eml.bcc.length).to.eq(1);
		expect(eml.bcc[0]).to.eq(usr4.email);

		await testhelpers.deleteEmails();

		const id = response.body.userClockId;
		response = await request(app)
			.put(`${userClockUrl}/${id}`)
			.set('access-token', testhelpers.getJWT(usr3))
			.send({
				status: 0,
			});

		expect(response.statusCode).to.eq(403);

		// approve
		if (round == 0) {
			response = await request(app)
				.put(`${userClockUrl}/${id}`)
				.set('access-token', testhelpers.getJWT(usr2))
				.send({
					status: 0,
				});
		}
		else if (round == 1) {
			response = await request(app)
				.put(`${userClockUrl}/${id}`)
				.set('access-token', testhelpers.getJWT(global.signup.user))
				.send({
					status: 0,
				});
		}
		else if (round == 2) {
			response = await request(app)
				.put(`${userClockUrl}/${id}`)
				.set('access-token', testhelpers.getJWT(global.signup.user))
				.send({
					status: 2,
				});
		}

		expect(response.statusCode).to.eq(200);
		expect(response.body.status).to.eq(round == 2 ? 2 : 0);

		emails = await testhelpers.getEmails();
		console.log("RND:", round);
		expect(emails.length).to.eq(round == 0 || round == 2 ? 1 : 0);

		for (let ml of emails) {
			// expect(ml.replyTo).to.eq(round == 0 ? usr2.email : global.signup.user.email);
		}

		txt = emails.find(t => t.text != null && t.subject == null);
		eml = emails.find(e => e.html != null && e.subject != null);
		if (round == 0) {
			expect(txt).to.exist;
			expect(txt.bcc.length).to.eq(1);
			expect(txt.bcc[0]).to.eq(`${usr.phoneNumber}@mailinator.com`);
			expect(txt.text).to.contain('Approved');
			expect(eml).to.not.exist;
		}
		else if (round == 2) {
			expect(eml).to.exist;
			expect(eml.bcc.length).to.eq(1);
			expect(eml.bcc[0]).to.eq(usr.email);
			expect(eml.html).to.contain('Denied');
			expect(eml.subject).to.contain('Denied');
			expect(txt).to.not.exist;
		}
		else {
			expect(eml).to.not.exist;
			expect(txt).to.not.exist;
		}


		await testhelpers.deleteEmails();

		// RESET TO 0
		response = await request(app)
			.put(`${userClockUrl}/${id}`)
			.set('access-token', testhelpers.getJWT(usr))
			.send({
				status: 0,
				clockOutDate: new Date()
			});

		expect(response.statusCode).to.eq(200);
		expect(response.body.status).to.eq(1);

		emails = await testhelpers.getEmails();
		expect(emails.length).to.eq(2);
		for (let ml of emails) {
			// expect(ml.replyTo).to.eq(usr.email);
		}

		txt = emails.find(t => t.text != null && t.subject == null);
		eml = emails.find(e => e.html != null && e.subject != null);
		expect(txt).to.exist;
		expect(eml).to.exist;

		expect(txt.bcc.length).to.eq(2);
		expect(txt.bcc.indexOf(`${usr2.phoneNumber}@mailinator.com`)).to.be.above(-1);
		expect(txt.bcc.indexOf(`${usr4.phoneNumber}@mailinator.com`)).to.be.above(-1);

		expect(eml.bcc.length).to.eq(1);
		expect(eml.bcc[0]).to.eq(usr4.email);
	}

	it('create user clock approve as scheduler', async () => {
		await testUserClock(0);
	});

	it('create user clock approve as admin', async () => {
		await testUserClock(1);
	});

	it('create user clock deny as admin', async () => {
		await testUserClock(2);
	});

	it('delete my user clock', async () => {
		const usr = await testhelpers.createUser({ roles: [500] });
		const userClock = await testhelpers.createUserClock(usr.userId);
		response = await request(app)
			.delete(`${userClockUrl}/${userClock.userClockId}`)
			.set('access-token', testhelpers.getJWT(usr));
		expect(response.statusCode).to.eq(204);
	});

	it(`can't delete other user's user clock`, async () => {
		const usr = await testhelpers.createUser({ roles: [500] });
		const usr2 = await testhelpers.createUser({ roles: [500] });
		const userClock = await testhelpers.createUserClock(usr.userId);
		response = await request(app)
			.delete(`${userClockUrl}/${userClock.userClockId}`)
			.set('access-token', testhelpers.getJWT(usr2))
		expect(response.statusCode).to.eq(403);
	});

	it('admin delete user clock', async () => {
		const usr = await testhelpers.createUser({ roles: [500] });
		const userClock = await testhelpers.createUserClock(usr.userId);
		response = await request(app)
			.delete(`${userClockUrl}/${userClock.userClockId}`)
			.set('access-token', testhelpers.getJWT(global.signup.user))
		expect(response.statusCode).to.eq(204);
	});

	it('scheduler delete user clock', async () => {
		const usr = await testhelpers.createUser({});
		const usr2 = await testhelpers.createUser({ roles: [1000] });
		const userClock = await testhelpers.createUserClock(usr.userId);
		response = await request(app)
			.delete(`${userClockUrl}/${userClock.userClockId}`)
			.set('access-token', testhelpers.getJWT(usr2))
		expect(response.statusCode).to.eq(204);
	});
});