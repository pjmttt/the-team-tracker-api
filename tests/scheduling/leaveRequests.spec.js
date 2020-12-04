const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../server');
const testhelpers = require('../testhelpers');
const models = require('../../models');

const leaveRequestUrl = '/api/leaveRequests';

describe('Testing leave requests', function () {
	this.timeout(60000);

	it('cant submit leave request for someone else', async () => {
		const usr = await testhelpers.createUser({ roles: [] });
		const usr2 = await testhelpers.createUser({ roles: [] });
		let response = await request(app)
			.post(leaveRequestUrl)
			.set('access-token', testhelpers.getJWT(usr))
			.send({
				userId: usr2.userId,
				startDate: new Date()
			});
		expect(response.statusCode).to.eq(403);
	});

	it('submit leave request as scheduler', async () => {
		const usr = await testhelpers.createUser({ roles: [1000] });
		const usr2 = await testhelpers.createUser({ roles: [] });
		let response = await request(app)
			.post(leaveRequestUrl)
			.set('access-token', testhelpers.getJWT(usr))
			.send({
				userId: usr2.userId,
				startDate: new Date(),
				status: 1,
				approvedDeniedById: usr.userId,
				approvedDeniedDate: new Date()
			});
		expect(response.statusCode).to.eq(201);

		const emails = await testhelpers.getEmails();
		expect(emails.length).to.eq(0);
	});

	it('submit leave request as admin', async () => {
		const usr2 = await testhelpers.createUser({ roles: [], enableTextNotifications: true, enableEmailNotifications: true });
		let response = await request(app)
			.post(leaveRequestUrl)
			.set('access-token', testhelpers.getJWT(global.signup.user))
			.send({
				userId: usr2.userId,
				startDate: new Date(),
				status: 1,
				approvedDeniedById: global.signup.user.userId,
				approvedDeniedDate: new Date()
			});
		expect(response.statusCode).to.eq(201);

		const emails = await testhelpers.getEmails();
		expect(emails.length).to.eq(2);
		for (let ml of emails) {
			// expect(ml.replyTo).to.eq(global.signup.user.email);
		}

		const txt = emails.find(t => t.text != null && t.subject == null);
		const eml = emails.find(e => e.html != null && e.subject != null);
		expect(txt).to.exist;
		expect(eml).to.exist;

		expect(txt.bcc.length).to.eq(1);
		expect(txt.bcc[0]).to.eq(`${usr2.phoneNumber}@mailinator.com`);

		expect(eml.bcc.length).to.eq(1);
		expect(eml.bcc[0]).to.eq(usr2.email);
	});

	it('submit leave request for self', async () => {
		const usr = await testhelpers.createUser({ roles: [1000], enableTextNotifications: true, enableEmailNotifications: true });
		let response = await request(app)
			.post(leaveRequestUrl)
			.set('access-token', testhelpers.getJWT(usr))
			.send({
				userId: usr.userId,
				startDate: new Date(),
				status: 1,
				approvedDeniedById: usr.userId,
				approvedDeniedDate: new Date()
			});
		expect(response.statusCode).to.eq(201);

		const emails = await testhelpers.getEmails();
		expect(emails.length).to.eq(0);
	});

	async function testLeaveRequest(round) {
		const usr = await testhelpers.createUser({ roles: [], enableEmailNotifications: round == 0, enableTextNotifications: round == 2 });
		const usr2 = await testhelpers.createUser({ roles: [1000] });
		const usr3 = await testhelpers.createUser({ roles: [100, 500, 900] });
		const usr4 = await testhelpers.createUser({ roles: [1000], enableEmailNotifications: true });
		const usr5 = await testhelpers.createUser({ roles: [1000], enableTextNotifications: true });
		const usr6 = await testhelpers.createUser({ roles: [1000], enableTextNotifications: true, enableEmailNotifications: true });

		const params = {
			userId: usr.userId,
			startDate: new Date()
		}
		if (round == 0) {
			params.status = 1;
			params.approvedDeniedById = global.signup.user.userId;
			params.approvedDeniedDate = new Date();
		}
		let response = await request(app)
			.post(leaveRequestUrl)
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

		expect(txt.bcc.length).to.eq(2);
		expect(txt.bcc.indexOf(`${usr5.phoneNumber}@mailinator.com`)).to.be.above(-1);
		expect(txt.bcc.indexOf(`${usr6.phoneNumber}@mailinator.com`)).to.be.above(-1);

		expect(eml.bcc.length).to.eq(2);
		expect(eml.bcc.indexOf(usr4.email)).to.be.above(-1);
		expect(eml.bcc.indexOf(usr6.email)).to.be.above(-1);

		await testhelpers.deleteEmails();

		const id = response.body.leaveRequestId;
		response = await request(app)
			.put(`${leaveRequestUrl}/${id}`)
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
				.put(`${leaveRequestUrl}/${id}`)
				.set('access-token', testhelpers.getJWT(usr2))
				.send({
					status: 1,
					approvedDeniedById: usr2.userId,
					approvedDeniedDate: new Date()
				});
		}
		else if (round == 1) {
			response = await request(app)
				.put(`${leaveRequestUrl}/${id}`)
				.set('access-token', testhelpers.getJWT(global.signup.user))
				.send({
					status: 1,
					approvedDeniedById: global.signup.user.userId,
					approvedDeniedDate: new Date()
				});
		}
		else if (round == 2) {
			response = await request(app)
				.put(`${leaveRequestUrl}/${id}`)
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
			.put(`${leaveRequestUrl}/${id}`)
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

		expect(txt.bcc.length).to.eq(2);
		expect(txt.bcc.indexOf(`${usr5.phoneNumber}@mailinator.com`)).to.be.above(-1);
		expect(txt.bcc.indexOf(`${usr6.phoneNumber}@mailinator.com`)).to.be.above(-1);

		expect(eml.bcc.length).to.eq(2);
		expect(eml.bcc.indexOf(usr4.email)).to.be.above(-1);
		expect(eml.bcc.indexOf(usr6.email)).to.be.above(-1);
	}

	it('create leave request approve as scheduler', async () => {
		await testLeaveRequest(0);
	});

	it('create leave request approve as admin', async () => {
		await testLeaveRequest(1);
	});

	it('create leave request deny as admin', async () => {
		await testLeaveRequest(2);
	});

	it('delete my leave request', async () => {
		const usr = await testhelpers.createUser({ roles: [500] });
		const leaveRequest = await testhelpers.createLeaveRequest(usr.userId);
		response = await request(app)
			.delete(`${leaveRequestUrl}/${leaveRequest.leaveRequestId}`)
			.set('access-token', testhelpers.getJWT(usr));
		expect(response.statusCode).to.eq(204);
	});

	it(`can't delete other user's leave request`, async () => {
		const usr = await testhelpers.createUser({ roles: [500] });
		const usr2 = await testhelpers.createUser({ roles: [500] });
		const leaveRequest = await testhelpers.createLeaveRequest(usr.userId);
		response = await request(app)
			.delete(`${leaveRequestUrl}/${leaveRequest.leaveRequestId}`)
			.set('access-token', testhelpers.getJWT(usr2))
		expect(response.statusCode).to.eq(403);
	});

	it('admin delete leave request', async () => {
		const usr = await testhelpers.createUser({ roles: [500] });
		const leaveRequest = await testhelpers.createLeaveRequest(usr.userId);
		response = await request(app)
			.delete(`${leaveRequestUrl}/${leaveRequest.leaveRequestId}`)
			.set('access-token', testhelpers.getJWT(global.signup.user))
		expect(response.statusCode).to.eq(204);
	});

	it('scheduler delete leave request', async () => {
		const usr = await testhelpers.createUser({ });
		const usr2 = await testhelpers.createUser({ roles: [1000] });
		const leaveRequest = await testhelpers.createLeaveRequest(usr.userId);
		response = await request(app)
			.delete(`${leaveRequestUrl}/${leaveRequest.leaveRequestId}`)
			.set('access-token', testhelpers.getJWT(usr2))
		expect(response.statusCode).to.eq(204);
	});
});