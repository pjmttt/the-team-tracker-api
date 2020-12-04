const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../server');
const testhelpers = require('../testhelpers');
const models = require('../../models');

describe('Testing user messages', function () {
	it('get only mine', async () => {
		const usr = await testhelpers.createUser({ roles: [100], enableEmailNotifications: true, enableTextNotifications: true });
		const usr2 = await testhelpers.createUser({ roles: [900], enableTextNotifications: true });
		const usr3 = await testhelpers.createUser({ roles: [100, 500, 900], enableEmailNotifications: true });
		const usr4 = await testhelpers.createUser({ roles: [900], enableEmailNotifications: true, enableTextNotifications: true });
		const usr5 = await testhelpers.createUser({ roles: [100, 500, 900] });
		const usr6 = await testhelpers.createUser({ roles: [100, 500, 900] });
		let res = await request(app)
			.post('/api/userComments')
			.set('access-token', testhelpers.getJWT(usr))
			.send({
				comment: 'Test comment 1',
				subject: 'Test subj 1',
				commentDate: new Date(),
				sendText: true,
				sendEmail: true,
			});

		const firstComment = res.body;
		res = await request(app)
			.post('/api/userComments')
			.set('access-token', testhelpers.getJWT(usr))
			.send({
				comment: 'Test comment 2',
				subject: 'Test subj 2',
				commentDate: new Date(),
				sendText: true,
				sendEmail: true,
				userIds: [usr5.userId, usr6.userId]
			});

		const id = res.body.userCommentId;

		res = await request(app)
			.get('/api/userComments')
			.set('access-token', testhelpers.getJWT(global.signup.user));
		expect(res.statusCode).to.eq(200);
		expect(res.body.data.length).to.eq(2);

		res = await request(app)
			.get('/api/userComments')
			.set('access-token', testhelpers.getJWT(usr));
		expect(res.statusCode).to.eq(200);
		expect(res.body.data.length).to.eq(2);

		res = await request(app)
			.get('/api/userComments')
			.set('access-token', testhelpers.getJWT(usr2));
		expect(res.statusCode).to.eq(200);
		expect(res.body.data.length).to.eq(1);
		expect(res.body.data.find(d => d.userCommentId == firstComment.userCommentId)).to.exist;

		res = await request(app)
			.get('/api/userComments')
			.set('access-token', testhelpers.getJWT(usr3));
		expect(res.statusCode).to.eq(200);
		expect(res.body.data.length).to.eq(1);
		expect(res.body.data.find(d => d.userCommentId == firstComment.userCommentId)).to.exist;

		res = await request(app)
			.get('/api/userComments')
			.set('access-token', testhelpers.getJWT(usr4));
		expect(res.statusCode).to.eq(200);
		expect(res.body.data.length).to.eq(1);
		expect(res.body.data.find(d => d.userCommentId == firstComment.userCommentId)).to.exist;

		res = await request(app)
			.get('/api/userComments')
			.set('access-token', testhelpers.getJWT(usr5));
		expect(res.statusCode).to.eq(200);
		expect(res.body.data.length).to.eq(2);

		res = await request(app)
			.get('/api/userComments')
			.set('access-token', testhelpers.getJWT(usr6));
		expect(res.statusCode).to.eq(200);
		expect(res.body.data.length).to.eq(2);

		await testhelpers.deleteEmails();

	});

	it('send to only some users', async () => {
		const usr = await testhelpers.createUser({ roles: [100], enableEmailNotifications: true, enableTextNotifications: true });
		const usr2 = await testhelpers.createUser({ roles: [900, 600], enableTextNotifications: true });
		const usr3 = await testhelpers.createUser({ roles: [100, 500, 900], enableEmailNotifications: true });
		const usr4 = await testhelpers.createUser({ roles: [900, 600], enableEmailNotifications: true, enableTextNotifications: true });
		const usr5 = await testhelpers.createUser({ roles: [100, 500, 900] });
		const usr6 = await testhelpers.createUser({ roles: [100, 500, 900] });
		let res = await request(app)
			.post('/api/userComments')
			.set('access-token', testhelpers.getJWT(usr))
			.send({
				comment: 'Test comment',
				subject: 'Test subj',
				commentDate: new Date(),
				sendText: true,
				sendEmail: true,
				userIds: [usr5.userId, usr6.userId]
			});
		expect(res.statusCode).to.eq(201);
		const id = res.body.userCommentId;

		let emails = await testhelpers.getEmails();
		expect(emails.length).to.eq(2);

		let eml = emails.find(e => e.subject != null && e.html != null);
		expect(eml).to.exist;
		expect(eml.bcc.length).to.eq(2);
		expect(eml.bcc.indexOf(usr.email)).to.be.eq(-1);
		expect(eml.bcc.indexOf(usr2.email)).to.be.eq(-1);
		expect(eml.bcc.indexOf(usr3.email)).to.be.eq(-1);
		expect(eml.bcc.indexOf(usr4.email)).to.be.eq(-1);
		expect(eml.bcc.indexOf(usr5.email)).to.be.above(-1);
		expect(eml.bcc.indexOf(usr6.email)).to.be.above(-1);
		expect(eml.html).to.contain('Test comment');
		expect(eml.html).to.contain(`Sent by ${usr.firstName}`);

		let txt = emails.find(e => e.subject == null && e.text != null);
		expect(txt).to.exist;
		expect(txt.bcc.length).to.eq(2);
		expect(txt.bcc.indexOf(`${usr.phoneNumber}@mailinator.com`)).to.be.eq(-1);
		expect(txt.bcc.indexOf(`${usr2.phoneNumber}@mailinator.com`)).to.be.eq(-1);
		expect(txt.bcc.indexOf(`${usr3.phoneNumber}@mailinator.com`)).to.be.eq(-1);
		expect(txt.bcc.indexOf(`${usr4.phoneNumber}@mailinator.com`)).to.be.eq(-1);
		expect(txt.bcc.indexOf(`${usr5.phoneNumber}@mailinator.com`)).to.be.above(-1);
		expect(txt.bcc.indexOf(`${usr6.phoneNumber}@mailinator.com`)).to.be.above(-1);
		expect(txt.text).to.contain('Test comment');
		expect(txt.text).to.contain(`Sent by ${usr.firstName}`);

		await testhelpers.deleteEmails();

		res = await request(app)
			.post('/api/userCommentReplys')
			.set('access-token', testhelpers.getJWT(usr5))
			.send({
				replyText: 'test reply',
				replyDate: new Date(),
				userCommentId: id
			});
		expect(res.statusCode).to.eq(201);

		emails = await testhelpers.getEmails();
		expect(emails.length).to.eq(2);
		eml = emails.find(e => e.subject != null && e.html != null);
		expect(eml).to.exist;
		expect(eml.bcc.length).to.eq(2);
		expect(eml.bcc.indexOf(usr.email)).to.be.above(-1);
		expect(eml.bcc.indexOf(usr2.email)).to.be.eq(-1);
		expect(eml.bcc.indexOf(usr3.email)).to.be.eq(-1);
		expect(eml.bcc.indexOf(usr4.email)).to.be.eq(-1);
		expect(eml.bcc.indexOf(usr5.email)).to.be.eq(-1);
		expect(eml.bcc.indexOf(usr6.email)).to.be.above(-1);

		expect(eml.subject).to.eq('RE: Test subj');
		expect(eml.html).to.contain('Test comment');
		expect(eml.html).to.contain(`Sent by ${usr5.firstName}`);
		expect(eml.html).to.contain('test reply');

		txt = emails.find(e => e.subject == null && e.text != null);
		expect(txt).to.exist;
		expect(txt.bcc.length).to.eq(2);
		expect(txt.bcc.indexOf(`${usr.phoneNumber}@mailinator.com`)).to.be.above(-1);
		expect(txt.bcc.indexOf(`${usr2.phoneNumber}@mailinator.com`)).to.be.eq(-1);
		expect(txt.bcc.indexOf(`${usr3.phoneNumber}@mailinator.com`)).to.be.eq(-1);
		expect(txt.bcc.indexOf(`${usr4.phoneNumber}@mailinator.com`)).to.be.eq(-1);
		expect(txt.bcc.indexOf(`${usr5.phoneNumber}@mailinator.com`)).to.be.eq(-1);
		expect(txt.bcc.indexOf(`${usr6.phoneNumber}@mailinator.com`)).to.be.above(-1);

		expect(txt.text).to.contain('Test comment');
		expect(txt.text).to.contain(`Sent by ${usr5.firstName}`);
		expect(txt.text).to.contain('test reply');
	});

	it('create comment', async () => {
		const usr = await testhelpers.createUser({ roles: [100], enableEmailNotifications: true, enableTextNotifications: true });
		const usr2 = await testhelpers.createUser({ roles: [900, 600], enableTextNotifications: true });
		const usr3 = await testhelpers.createUser({ roles: [100, 500, 900], enableEmailNotifications: true });
		const usr4 = await testhelpers.createUser({ roles: [900, 600], enableEmailNotifications: true, enableTextNotifications: true });
		const usr5 = await testhelpers.createUser({ roles: [100, 500, 900] });
		const usr6 = await testhelpers.createUser({ roles: [100, 500, 900] });
		let res = await request(app)
			.post('/api/userComments')
			.set('access-token', testhelpers.getJWT(usr))
			.send({
				comment: 'Test comment',
				subject: 'Test subj',
				commentDate: new Date(),
				sendText: true,
				sendEmail: true,
			});
		expect(res.statusCode).to.eq(201);
		const id = res.body.userCommentId;

		let emails = await testhelpers.getEmails();
		expect(emails.length).to.eq(2);

		let eml = emails.find(e => e.subject != null && e.html != null);
		expect(eml).to.exist;
		expect(eml.bcc.length).to.eq(6);
		expect(eml.bcc.indexOf(usr.email)).to.be.eq(-1);
		expect(eml.bcc.indexOf(usr2.email)).to.be.above(-1);
		expect(eml.bcc.indexOf(usr3.email)).to.be.above(-1);
		expect(eml.bcc.indexOf(usr4.email)).to.be.above(-1);
		expect(eml.bcc.indexOf(usr5.email)).to.be.above(-1);
		expect(eml.bcc.indexOf(usr6.email)).to.be.above(-1);
		expect(eml.html).to.contain('Test comment');
		expect(eml.html).to.contain(`Sent by ${usr.firstName}`);

		let txt = emails.find(e => e.subject == null && e.text != null);
		expect(txt).to.exist;
		expect(txt.bcc.length).to.eq(5);
		expect(txt.bcc.indexOf(`${usr.phoneNumber}@mailinator.com`)).to.be.eq(-1);
		expect(txt.bcc.indexOf(`${usr2.phoneNumber}@mailinator.com`)).to.be.above(-1);
		expect(txt.bcc.indexOf(`${usr3.phoneNumber}@mailinator.com`)).to.be.above(-1);
		expect(txt.bcc.indexOf(`${usr4.phoneNumber}@mailinator.com`)).to.be.above(-1);
		expect(txt.bcc.indexOf(`${usr5.phoneNumber}@mailinator.com`)).to.be.above(-1);
		expect(txt.bcc.indexOf(`${usr6.phoneNumber}@mailinator.com`)).to.be.above(-1);
		expect(txt.text).to.contain('Test comment');
		expect(txt.text).to.contain(`Sent by ${usr.firstName}`);

		await testhelpers.deleteEmails();

		res = await request(app)
			.post('/api/userCommentReplys')
			.set('access-token', testhelpers.getJWT(usr2))
			.send({
				replyText: 'test reply',
				replyDate: new Date(),
				userCommentId: id
			});
		expect(res.statusCode).to.eq(201);

		emails = await testhelpers.getEmails();
		expect(emails.length).to.eq(2);
		eml = emails.find(e => e.subject != null && e.html != null);
		expect(eml).to.exist;
		expect(eml.bcc.length).to.eq(6);
		// expect(eml.bcc.indexOf(usr.email)).to.be.above(-1);
		expect(eml.bcc.indexOf(usr2.email)).to.be.eq(-1);
		expect(eml.bcc.indexOf(usr.email)).to.be.above(-1);
		expect(eml.bcc.indexOf(usr3.email)).to.be.above(-1);
		expect(eml.bcc.indexOf(usr4.email)).to.be.above(-1);
		expect(eml.bcc.indexOf(usr5.email)).to.be.above(-1);
		expect(eml.bcc.indexOf(usr6.email)).to.be.above(-1);

		expect(eml.subject).to.eq('RE: Test subj');
		expect(eml.html).to.contain('Test comment');
		expect(eml.html).to.contain(`Sent by ${usr2.firstName}`);
		expect(eml.html).to.contain('test reply');

		txt = emails.find(e => e.subject == null && e.text != null);
		expect(txt).to.exist;
		expect(txt.bcc.length).to.eq(5);
		// expect(txt.bcc.indexOf(`${usr.phoneNumber}@mailinator.com`)).to.be.above(-1);
		expect(txt.bcc.indexOf(`${usr2.phoneNumber}@mailinator.com`)).to.be.eq(-1);
		expect(txt.bcc.indexOf(`${usr.phoneNumber}@mailinator.com`)).to.be.above(-1);
		expect(txt.bcc.indexOf(`${usr3.phoneNumber}@mailinator.com`)).to.be.above(-1);
		expect(txt.bcc.indexOf(`${usr4.phoneNumber}@mailinator.com`)).to.be.above(-1);
		expect(txt.bcc.indexOf(`${usr5.phoneNumber}@mailinator.com`)).to.be.above(-1);
		expect(txt.bcc.indexOf(`${usr6.phoneNumber}@mailinator.com`)).to.be.above(-1);

		expect(txt.text).to.contain('Test comment');
		expect(txt.text).to.contain(`Sent by ${usr2.firstName}`);
		expect(txt.text).to.contain('test reply');
	});
});