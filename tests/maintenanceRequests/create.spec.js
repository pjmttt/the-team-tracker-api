const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../server');
const testhelpers = require('../testhelpers');
const models = require('../../models');

describe('Testing maintenance requests', function () {
	it('create maintenance request', async () => {
		const usr = await testhelpers.createUser({ roles: [100], enableEmailNotifications: true, enableTextNotifications: true });
		const usr2 = await testhelpers.createUser({ roles: [900, 600], enableTextNotifications: true });
		const usr3 = await testhelpers.createUser({ roles: [100, 500, 900], enableEmailNotifications: true });
		const usr4 = await testhelpers.createUser({ roles: [900, 600], enableEmailNotifications: true, enableTextNotifications: true });
		const usr5 = await testhelpers.createUser({ roles: [100, 500, 900] });
		const usr6 = await testhelpers.createUser({ roles: [100, 500, 900] });
		let res = await request(app)
			.post('/api/maintenanceRequests')
			.set('access-token', testhelpers.getJWT(usr))
			.send({
				requestDescription: 'test request',
				assignedToId: usr3.userId,
				requestDate: new Date(),
				requestedById: usr.userId,
			});
		expect(res.statusCode).to.eq(201);

		let emails = await testhelpers.getEmails();
		expect(emails.length).to.eq(2);
		for (let ml of emails) {
			// expect(ml.replyTo).to.eq(usr.email);
			expect(ml.parentId).to.eq(res.body.maintenanceRequestId);
		}

		let eml = emails.find(e => e.subject != null && e.html != null);
		expect(eml).to.exist;
		expect(eml.bcc.length).to.eq(2);
		expect(eml.bcc.indexOf(usr3.email)).to.be.above(-1);
		expect(eml.bcc.indexOf(usr4.email)).to.be.above(-1);

		let txt = emails.find(e => e.subject == null && e.text != null);
		expect(txt).to.exist;
		expect(txt.bcc.length).to.eq(2);
		expect(txt.bcc.indexOf(`${usr2.phoneNumber}@mailinator.com`)).to.be.above(-1);
		expect(txt.bcc.indexOf(`${usr4.phoneNumber}@mailinator.com`)).to.be.above(-1);
	});

	it('create maintenance request reply', async () => {
		const usr = await testhelpers.createUser({ roles: [], enableTextNotifications: true });
		const usr2 = await testhelpers.createUser({ roles: [900, 600], enableTextNotifications: true });
		const usr3 = await testhelpers.createUser({ roles: [100, 500, 900], enableEmailNotifications: true });
		const usr4 = await testhelpers.createUser({ roles: [900, 600], enableEmailNotifications: true, enableTextNotifications: true });
		const usr5 = await testhelpers.createUser({ roles: [100, 500, 900] });
		const usr6 = await testhelpers.createUser({ roles: [100, 500, 900] });
		const req = await testhelpers.createMaintenanceRequest(usr3.userId);

		await testhelpers.deleteEmails();

		let res = await request(app)
			.post('/api/maintenanceRequestReplys')
			.set('access-token', testhelpers.getJWT(usr3))
			.send({
				replyDate: new Date(),
				replyText: 'test reply',
				maintenanceRequestId: req.maintenanceRequestId,
			});
		expect(res.statusCode).to.eq(201);

		let emails = await testhelpers.getEmails();
		expect(emails.length).to.eq(2);
		for (let ml of emails) {
			// expect(ml.replyTo).to.eq(usr3.email);
		}

		let eml = emails.find(e => e.subject != null && e.html != null);
		expect(eml).to.exist;
		expect(eml.bcc.length).to.eq(1);
		expect(eml.bcc.indexOf(usr4.email)).to.be.above(-1);

		let txt = emails.find(e => e.subject == null && e.text != null);
		expect(txt).to.exist;
		expect(txt.bcc.length).to.eq(2);
		expect(txt.bcc.indexOf(`${usr2.phoneNumber}@mailinator.com`)).to.be.above(-1);
		expect(txt.bcc.indexOf(`${usr4.phoneNumber}@mailinator.com`)).to.be.above(-1);
	});

	// it('create maintenance request with images', async () => {
	// 	const usr = await testhelpers.createUser({ roles: [100, 500, 900], enableEmailNotifications: true, enableTextNotifications: true });

	// 	let res = await request(app)
	// 		.post('/api/maintenanceRequests')
	// 		.set('access-token', testhelpers.getJWT(usr))
	// 		.send({
	// 			requestDescription: 'test request',
	// 			assignedToId: usr.userId,
	// 			requestDate: new Date(),
	// 			requestedById: usr.userId,
	// 		});
	// 	expect(res.statusCode).to.eq(201);

	// 	const url = `/api/maintenanceRequestImage/${res.body.maintenanceRequestId}`;

	// 	res = await request(app)
	// 		.put(url)
	// 		.attach('file', 'tests/testimg.png')
	// 		.attach('file', 'tests/testimg.png');

	// 	expect(res.statusCode).to.eq(200);

	// 	const emls = await testhelpers.getEmails();
	// 	expect(emls.length).to.eq(2);

	// 	for (let eml of emls) {
	// 		expect(eml.emailQueueAttachments.length).to.eq(2);
	// 	}
	// });
});