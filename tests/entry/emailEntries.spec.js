const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../server');
const testhelpers = require('../testhelpers');

describe('Testing email entries:', function () {
	it('email entries', async () => {
		const lookups = (await request(app).get('/api/lookups')).body;
		const usr1 = await testhelpers.createUser({ roles: [], enableTextNotifications: true });
		const usr2 = await testhelpers.createUser({ roles: [], emailNotifications: [500], textNotifications: [], enableEmailNotifications: true, enableTextNotifications: true });
		const usr3 = await testhelpers.createUser({ roles: [], enableEmailNotifications: true, textNotifications: [500], emailNotifications:[] });
		const entries = [];
		entries.push(await testhelpers.createEntry({
			lookups,
			taskId: lookups.tasks[0].taskId,
			shiftId: lookups.shifts[0].shiftId,
			userId: usr1.userId
		}));

		entries.push(await testhelpers.createEntry({
			lookups,
			taskId: lookups.tasks[0].taskId,
			shiftId: lookups.shifts[1].shiftId,
			userId: usr1.userId
		}));

		entries.push(await testhelpers.createEntry({
			lookups,
			taskId: lookups.tasks[0].taskId,
			shiftId: lookups.shifts[2].shiftId,
			userId: usr2.userId
		}));

		entries.push(await testhelpers.createEntry({
			lookups,
			taskId: lookups.tasks[0].taskId,
			shiftId: lookups.shifts[2].shiftId,
			userId: usr3.userId
		}));

		await testhelpers.deleteEmails();

		const res = await request(app).post(`/api/sendEntries`).send({
			entryIds: entries.map(e => e.entryId)
		});
		expect(res.statusCode).to.eq(200);

		let emails = await testhelpers.getEmails();
		expect(emails.length).to.eq(2);
		for (let ml of emails) {
			expect(ml.bcc.length).to.eq(1);
		}

		let txt = emails.find(t => t.text != null && t.subject == null && t.bcc[0] == `${usr1.phoneNumber}@mailinator.com`);
		let eml = emails.find(e => e.html != null && e.subject != null && e.bcc[0] == usr1.email);
		expect(txt).to.exist;
		expect(eml).to.not.exist;

		txt = emails.find(t => t.text != null && t.subject == null && t.bcc[0] == `${usr2.phoneNumber}@mailinator.com`);
		eml = emails.find(e => e.html != null && e.subject != null && e.bcc[0] == usr2.email);
		expect(txt).to.not.exist;
		expect(eml).to.exist;
	});
});