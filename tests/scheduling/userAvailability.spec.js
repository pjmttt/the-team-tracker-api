const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../server');
const testhelpers = require('../testhelpers');
const models = require('../../models');

const userAvailabilityUrl = '/api/userAvailability';

describe('Testing user availability', function () {
	this.timeout(60000);

	it('cant submit user availability for someone else', async () => {
		const usr = await testhelpers.createUser({ roles: [] });
		const usr2 = await testhelpers.createUser({ roles: [] });
		let response = await request(app)
			.post(userAvailabilityUrl)
			.set('access-token', testhelpers.getJWT(usr))
			.send({
				userId: usr2.userId,
				dayOfWeek: 0,
				allDay: true,
			});
		expect(response.statusCode).to.eq(403);
	});

	it('submit user availability as scheduler', async () => {
		const usr = await testhelpers.createUser({ roles: [1000] });
		const usr2 = await testhelpers.createUser({ roles: [], enableTextNotifications: true });
		let response = await request(app)
			.post(userAvailabilityUrl)
			.set('access-token', testhelpers.getJWT(usr))
			.send({
				userId: usr2.userId,
				dayOfWeek: 0,
				allDay: true,
				status: 1,
				approvedDeniedById: usr.userId,
				approvedDeniedDate: new Date()
			});
		expect(response.statusCode).to.eq(201);

		const emails = await testhelpers.getEmails();
		expect(emails.length).to.eq(1);
		for (let ml of emails) {
			// expect(ml.replyTo).to.eq(usr.email);
		}

		const txt = emails.find(t => t.text != null && t.subject == null);
		const eml = emails.find(e => e.html != null && e.subject != null);
		expect(txt).to.exist;
		expect(eml).to.not.exist;

		expect(txt.bcc.length).to.eq(1);
		expect(txt.bcc[0]).to.eq(`${usr2.phoneNumber}@mailinator.com`);
	});

	it('submit user availability for self', async () => {
		const usr = await testhelpers.createUser({ roles: [1000], enableTextNotifications: true, enableEmailNotifications: true });
		let response = await request(app)
			.post(userAvailabilityUrl)
			.set('access-token', testhelpers.getJWT(usr))
			.send({
				userId: usr.userId,
				dayOfWeek: 0,
				allDay: true,
				status: 1,
				approvedDeniedById: usr.userId,
				approvedDeniedDate: new Date()
			});
		expect(response.statusCode).to.eq(201);

		const emails = await testhelpers.getEmails();
		expect(emails.length).to.eq(0);
	});

	it('submit user availability as admin', async () => {
		const usr2 = await testhelpers.createUser({ roles: [], enableEmailNotifications: true });
		let response = await request(app)
			.post(userAvailabilityUrl)
			.set('access-token', testhelpers.getJWT(global.signup.user))
			.send({
				userId: usr2.userId,
				dayOfWeek: 0,
				allDay: true,
				status: 1,
				approvedDeniedById: global.signup.user.userId,
				approvedDeniedDate: new Date()
			});
		expect(response.statusCode).to.eq(201);

		const emails = await testhelpers.getEmails();
		expect(emails.length).to.eq(1);
		for (let ml of emails) {
			// expect(ml.replyTo).to.eq(global.signup.user.email);
		}

		const txt = emails.find(t => t.text != null && t.subject == null);
		const eml = emails.find(e => e.html != null && e.subject != null);
		expect(txt).to.not.exist;
		expect(eml).to.exist;
		expect(eml.bcc.length).to.eq(1);
		expect(eml.bcc[0]).to.eq(usr2.email);
	});

	async function testuserAvailability(round) {
		const usr = await testhelpers.createUser({ roles: [], enableEmailNotifications: round == 0, enableTextNotifications: round == 2 });
		const usr2 = await testhelpers.createUser({ roles: [1000] });
		const usr3 = await testhelpers.createUser({ roles: [100, 500, 900] });
		const usr4 = await testhelpers.createUser({ roles: [1000], enableEmailNotifications: true });
		const usr5 = await testhelpers.createUser({ roles: [1000], enableTextNotifications: true });
		const usr6 = await testhelpers.createUser({ roles: [1000], enableTextNotifications: true, enableEmailNotifications: true });
		const params = {
			userId: usr.userId,
			dayOfWeek: 0,
			allDay: round > 0,
			startTime: round > 0 ? null : new Date(),
			endTime: round > 0 ? null : new Date(),
		}
		if (round == 0) {
			params.status = 1;
			params.approvedDeniedById = global.signup.user.userId;
			params.approvedDeniedDate = new Date();
		}
		let response = await request(app)
			.post(userAvailabilityUrl)
			.set('access-token', testhelpers.getJWT(usr))
			.send(params);
		expect(response.statusCode).to.eq(201);
		expect(response.body.status).to.eq(0);
		expect(response.body.approvedDeniedById).to.eq(null);
		expect(response.body.approvedDeniedDate).to.eq(null);

		let emails = await testhelpers.getEmails();
		expect(emails.length).to.eq(2);
		for (let ml of emails) {
			// expect(ml.replyTo).to.eq(usr.email);
		}

		let txt = emails.find(t => t.text != null && t.subject == null);
		let eml = emails.find(e => e.html != null && e.subject != null);
		expect(txt).to.exist;
		expect(eml).to.exist;

		if (round > 0) {
			expect(txt.text).to.contain('All Day');
			expect(eml.html).to.contain('All Day');
		}
		else {
			expect(txt.text).to.not.contain('All Day');
			expect(eml.html).to.not.contain('All Day');
		}

		expect(txt.bcc.length).to.eq(2);
		expect(txt.bcc.indexOf(`${usr5.phoneNumber}@mailinator.com`)).to.be.above(-1);
		expect(txt.bcc.indexOf(`${usr6.phoneNumber}@mailinator.com`)).to.be.above(-1);

		expect(eml.bcc.length).to.eq(2);
		expect(eml.bcc.indexOf(usr4.email)).to.be.above(-1);
		expect(eml.bcc.indexOf(usr6.email)).to.be.above(-1);

		await testhelpers.deleteEmails();

		const id = response.body.userAvailabilityId;
		response = await request(app)
			.put(`${userAvailabilityUrl}/${id}`)
			.set('access-token', testhelpers.getJWT(usr3))
			.send({
				status: 1,
				approvedDeniedById: usr3.userId,
				approvedDeniedDate: new Date()
			});

		expect(response.statusCode).to.eq(403);

		// approve
		if (round == 0) {
			response = await request(app)
				.put(`${userAvailabilityUrl}/${id}`)
				.set('access-token', testhelpers.getJWT(usr2))
				.send({
					status: 1,
					approvedDeniedById: usr2.userId,
					approvedDeniedDate: new Date()
				});
		}
		else if (round == 1) {
			response = await request(app)
				.put(`${userAvailabilityUrl}/${id}`)
				.set('access-token', testhelpers.getJWT(global.signup.user))
				.send({
					status: 1,
					approvedDeniedById: global.signup.user.userId,
					approvedDeniedDate: new Date()
				});
		}
		else if (round == 2) {
			response = await request(app)
				.put(`${userAvailabilityUrl}/${id}`)
				.set('access-token', testhelpers.getJWT(global.signup.user))
				.send({
					status: 2,
					approvedDeniedById: global.signup.user.userId,
					approvedDeniedDate: new Date()
				});
		}

		expect(response.statusCode).to.eq(200);
		expect(response.body.status).to.eq(round == 2 ? 2 : 1);
		expect(response.body.approvedDeniedById).to.eq(round == 0 ? usr2.userId : global.signup.user.userId);

		emails = await testhelpers.getEmails();
		expect(emails.length).to.eq(round == 0 || round == 2 ? 1 : 0);
		for (let ml of emails) {
			// expect(ml.replyTo).to.eq(round == 0 ? usr2.email : global.signup.user.email);
		}

		txt = emails.find(t => t.text != null && t.subject == null);
		eml = emails.find(e => e.html != null && e.subject != null);
		if (round == 0) {
			expect(txt).to.not.exist;
			expect(eml).to.exist;
			expect(eml.bcc.length).to.eq(1);
			expect(eml.bcc[0]).to.eq(usr.email);
			expect(eml.subject).to.contain('Approved');
			expect(eml.html).to.contain('Approved');
		}
		else if (round == 2) {
			expect(eml).to.not.exist;
			expect(txt).to.exist;
			expect(txt.bcc.length).to.eq(1);
			expect(txt.bcc[0]).to.eq(`${usr.phoneNumber}@mailinator.com`);
			expect(txt.text).to.contain('Denied');
		}

		await testhelpers.deleteEmails();

		// RESET TO 0
		response = await request(app)
			.put(`${userAvailabilityUrl}/${id}`)
			.set('access-token', testhelpers.getJWT(usr))
			.send({
				status: 1,
				approvedDeniedById: global.signup.user.userId,
				approvedDeniedDate: new Date()
			});

		expect(response.statusCode).to.eq(200);
		expect(response.body.status).to.eq(0);
		expect(response.body.approvedDeniedById).to.eq(null);

		emails = await testhelpers.getEmails();
		expect(emails.length).to.eq(2);
		for (let ml of emails) {
			// expect(ml.replyTo).to.eq(usr.email);
		}

		txt = emails.find(t => t.text != null && t.subject == null);
		eml = emails.find(e => e.html != null && e.subject != null);
		expect(txt).to.exist;
		expect(eml).to.exist;

		if (round > 0) {
			expect(txt.text).to.contain('All Day');
			expect(eml.html).to.contain('All Day');
		}
		else {
			expect(txt.text).to.not.contain('All Day');
			expect(eml.html).to.not.contain('All Day');
		}

		expect(txt.bcc.length).to.eq(2);
		expect(txt.bcc.indexOf(`${usr5.phoneNumber}@mailinator.com`)).to.be.above(-1);
		expect(txt.bcc.indexOf(`${usr6.phoneNumber}@mailinator.com`)).to.be.above(-1);

		expect(eml.bcc.length).to.eq(2);
		expect(eml.bcc.indexOf(usr4.email)).to.be.above(-1);
		expect(eml.bcc.indexOf(usr6.email)).to.be.above(-1);
	}

	it('create user availability approve as scheduler', async () => {
		await testuserAvailability(0);
	});

	it('create user availability approve as admin', async () => {
		await testuserAvailability(1);
	});

	it('create user availability deny as admin', async () => {
		await testuserAvailability(2);
	});

	async function testDeleteUserAvailability(round) {
		const usr = await testhelpers.createUser({ roles: [], enableEmailNotifications: round == 0, enableTextNotifications: round == 2 });
		const usr2 = await testhelpers.createUser({ roles: [1000] });
		const usr3 = await testhelpers.createUser({ roles: [100, 500, 900] });
		const usr4 = await testhelpers.createUser({ roles: [1000], enableEmailNotifications: true });
		const usr5 = await testhelpers.createUser({ roles: [1000], enableTextNotifications: true });
		const usr6 = await testhelpers.createUser({ roles: [1000], enableTextNotifications: true, enableEmailNotifications: true });

		let u = null;
		switch (round) {
			case 0:
				u = usr2;
				break;
			case 1:
			case 2:
				u = global.signup.user;
				break;
		}

		const userAvailability = await testhelpers.createUserAvailability(usr.userId);
		response = await request(app)
			.delete(`${userAvailabilityUrl}/${userAvailability.userAvailabilityId}`)
			.set('access-token', testhelpers.getJWT(usr));

		expect(response.statusCode).to.eq(200);

		await testhelpers.deleteEmails();

		response = await request(app)
			.put(`${userAvailabilityUrl}/${userAvailability.userAvailabilityId}`)
			.set('access-token', testhelpers.getJWT(u))
			.send({
				status: round < 2 ? 1 : 2,
				approvedDeniedById: global.signup.user.userId,
				approvedDeniedDate: new Date()
			});

		expect(response.statusCode).to.eq(200);
		const found = await models.userAvailability.findById(userAvailability.userAvailabilityId);
		if (round < 2) {
			expect(found).to.not.exist;
		}
		else {
			expect(found).to.exist;
			expect(found.status).to.eq(0);
			expect(found.markedForDelete).to.eq(false);
		}
		emails = await testhelpers.getEmails();
		expect(emails.length).to.eq(round == 0 || round == 2 ? 1 : 0);
		if (emails.length) {
			for (let ml of emails) {
				// expect(ml.replyTo).to.eq(round == 0 ? usr2.email : global.signup.user.email, round.toString());
			}

			txt = emails.find(t => t.text != null && t.subject == null);
			eml = emails.find(e => e.html != null && e.subject != null);
			if (round == 0) {
				expect(txt).to.not.exist;
				expect(eml).to.exist;
				expect(eml.bcc.length).to.eq(1);
				expect(eml.bcc[0]).to.eq(usr.email);
				expect(eml.subject).to.contain('Approved');
				expect(eml.html).to.contain('Approved');
			}
			else if (round == 2) {
				expect(eml).to.not.exist;
				expect(txt).to.exist;
				expect(txt.bcc.length).to.eq(1);
				expect(txt.bcc[0]).to.eq(`${usr.phoneNumber}@mailinator.com`);
				expect(txt.text).to.contain('Denied');
			}
		}

		await testhelpers.deleteEmails();
	}

	it('delete user availability approve as scheduler', async () => {
		await testDeleteUserAvailability(0);
	});

	it('delete user availability approve as admin', async () => {
		await testDeleteUserAvailability(1);
	});

	it('delete user availability deny as admin', async () => {
		await testDeleteUserAvailability(2);
	});

	it('delete user availability', async () => {
		const usr = await testhelpers.createUser({ roles: [], enableEmailNotifications: false, enableTextNotifications: true });
		const usr2 = await testhelpers.createUser({ roles: [1000] });
		const usr3 = await testhelpers.createUser({ roles: [100, 500, 900] });
		const usr4 = await testhelpers.createUser({ roles: [1000], enableEmailNotifications: true });
		const usr5 = await testhelpers.createUser({ roles: [1000], enableTextNotifications: true });
		const usr6 = await testhelpers.createUser({ roles: [1000], enableTextNotifications: true, enableEmailNotifications: true });

		const userAvailability = await testhelpers.createUserAvailability(usr.userId);

		await testhelpers.deleteEmails();

		response = await request(app)
			.delete(`${userAvailabilityUrl}/${userAvailability.userAvailabilityId}`)
			.set('access-token', testhelpers.getJWT(usr));

		expect(response.statusCode).to.eq(200);
		let found = await models.userAvailability.findById(userAvailability.userAvailabilityId);
		expect(found).to.exist;
		expect(found.status).to.eq(0);
		expect(found.markedForDelete).to.eq(true);

		const emails = await testhelpers.getEmails();
		expect(emails.length).to.eq(2);
		for (let ml of emails) {
			// expect(ml.replyTo).to.eq(usr.email);
		}

		txt = emails.find(t => t.text != null && t.subject == null);
		eml = emails.find(e => e.html != null && e.subject != null);
		expect(txt).to.exist;
		expect(eml).to.exist;
		expect(txt.bcc.length).to.eq(2);
		expect(txt.bcc.indexOf(`${usr5.phoneNumber}@mailinator.com`)).to.be.above(-1);
		expect(txt.bcc.indexOf(`${usr6.phoneNumber}@mailinator.com`)).to.be.above(-1);

		expect(eml.bcc.length).to.eq(2);
		expect(eml.bcc.indexOf(usr4.email)).to.be.above(-1);
		expect(eml.bcc.indexOf(usr6.email)).to.be.above(-1);

		expect(txt.text).to.contain(`${usr.firstName} ${usr.lastName} has requested to delete the following availability`);
		expect(eml.html).to.contain(`${usr.firstName} ${usr.lastName} has requested to delete the following availability`);

		await testhelpers.deleteEmails();

		// RESET TO 0
		response = await request(app)
			.put(`${userAvailabilityUrl}/${userAvailability.userAvailabilityId}`)
			.set('access-token', testhelpers.getJWT(usr))
			.send({
				status: 1,
				approvedDeniedById: global.signup.user.userId,
				approvedDeniedDate: new Date()
			});

		found = await models.userAvailability.findById(userAvailability.userAvailabilityId);
		expect(found.status).to.eq(0);
		expect(found.markedForDelete).to.eq(true);

		await testhelpers.deleteEmails();
	});

	it(`can't delete other user's user availability`, async () => {
		const usr = await testhelpers.createUser({ roles: [500] });
		const usr2 = await testhelpers.createUser({ roles: [500] });
		const userAvailability = await testhelpers.createUserAvailability(usr.userId);
		response = await request(app)
			.delete(`${userAvailabilityUrl}/${userAvailability.userAvailabilityId}`)
			.set('access-token', testhelpers.getJWT(usr2))
		expect(response.statusCode).to.eq(403);
	});

	it('admin delete user availability', async () => {
		const usr = await testhelpers.createUser({ roles: [500] });
		const userAvailability = await testhelpers.createUserAvailability(usr.userId);
		response = await request(app)
			.delete(`${userAvailabilityUrl}/${userAvailability.userAvailabilityId}`)
			.set('access-token', testhelpers.getJWT(global.signup.user))
		expect(response.statusCode).to.eq(204);
	});

	it('scheduler delete user availability', async () => {
		const usr = await testhelpers.createUser({});
		const usr2 = await testhelpers.createUser({ roles: [1000] });
		const userAvailability = await testhelpers.createUserAvailability(usr.userId);
		response = await request(app)
			.delete(`${userAvailabilityUrl}/${userAvailability.userAvailabilityId}`)
			.set('access-token', testhelpers.getJWT(usr2))
		expect(response.statusCode).to.eq(204);
	});

	it('update user availability for delete', async () => {
		const usr = await testhelpers.createUser({ roles: [], enableEmailNotifications: false, enableTextNotifications: true });
		const usr2 = await testhelpers.createUser({ roles: [1000] });
		const usr3 = await testhelpers.createUser({ roles: [100, 500, 900] });
		const usr4 = await testhelpers.createUser({ roles: [1000], enableEmailNotifications: true });
		const usr5 = await testhelpers.createUser({ roles: [1000], enableTextNotifications: true });
		const usr6 = await testhelpers.createUser({ roles: [1000], enableTextNotifications: true, enableEmailNotifications: true });

		const userAvailability = await testhelpers.createUserAvailability(usr.userId);

		await testhelpers.deleteEmails();

		// RESET TO 0
		response = await request(app)
			.put(`${userAvailabilityUrl}/${userAvailability.userAvailabilityId}`)
			.set('access-token', testhelpers.getJWT(usr))
			.send({
				markedForDelete: true,
				status: 1,
				approvedDeniedById: global.signup.user.userId,
				approvedDeniedDate: new Date()
			});

		expect(response.statusCode).to.eq(200);

		let found = await models.userAvailability.findById(userAvailability.userAvailabilityId);
		expect(found).to.exist;
		expect(found.status).to.eq(0);
		expect(found.markedForDelete).to.eq(true);
		expect(found.approvedDeniedById).to.eq(null);
		expect(found.approvedDeniedDate).to.eq(null);

		const emails = await testhelpers.getEmails();
		expect(emails.length).to.eq(2);
		for (let ml of emails) {
			// expect(ml.replyTo).to.eq(usr.email);
		}

		txt = emails.find(t => t.text != null && t.subject == null);
		eml = emails.find(e => e.html != null && e.subject != null);
		expect(txt).to.exist;
		expect(eml).to.exist;
		expect(txt.bcc.length).to.eq(2);
		expect(txt.bcc.indexOf(`${usr5.phoneNumber}@mailinator.com`)).to.be.above(-1);
		expect(txt.bcc.indexOf(`${usr6.phoneNumber}@mailinator.com`)).to.be.above(-1);

		expect(eml.bcc.length).to.eq(2);
		expect(eml.bcc.indexOf(usr4.email)).to.be.above(-1);
		expect(eml.bcc.indexOf(usr6.email)).to.be.above(-1);

		expect(txt.text).to.contain(`${usr.firstName} ${usr.lastName} has requested to delete the following availability`);
		expect(eml.html).to.contain(`${usr.firstName} ${usr.lastName} has requested to delete the following availability`);

		await testhelpers.deleteEmails();

		// RESET TO 0
		response = await request(app)
			.put(`${userAvailabilityUrl}/${userAvailability.userAvailabilityId}`)
			.set('access-token', testhelpers.getJWT(usr))
			.send({
				status: 1,
				approvedDeniedById: global.signup.user.userId,
				approvedDeniedDate: new Date()
			});

		found = await models.userAvailability.findById(userAvailability.userAvailabilityId);
		expect(found.status).to.eq(0);
		expect(found.markedForDelete).to.eq(true);

		await testhelpers.deleteEmails();
	});
});