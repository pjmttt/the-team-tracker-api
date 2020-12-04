const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../server');
const testhelpers = require('../testhelpers');
const defaults = require('../../helpers/defaults');
const models = require('../../models');

describe('Testing email subtasks:', function () {
	this.timeout(10000);

	beforeEach(async () => {
		await models.entry.destroy({ truncate: true });
	});

	it('email subtasks strike', async () => {
		const lookups = (await request(app).get('/api/lookups?lookupType=0')).body;
		const tasks = await testhelpers.createTasks();
		const shifts = await testhelpers.createShifts();
		const strikeStatus = lookups.statuses.find(s => s.statusName == 'Strike');
		const subtask = tasks[0].subtasks[0];

		const usr1 = await testhelpers.createUser({ roles: [100] });
		const usr2 = await testhelpers.createUser({ roles: [] });
		const usr3 = await testhelpers.createUser({ roles: [100], enableEmailNotifications: true });
		const usr4 = await testhelpers.createUser({ roles: [100], enableTextNotifications: true });
		const usr5 = await testhelpers.createUser({ roles: [100], enableEmailNotifications: true, enableTextNotifications: true });
		const entries = [];
		entries.push(await testhelpers.createEntry({
			lookups,
			taskId: tasks[0].taskId,
			shiftId: shifts[0].shiftId,
			userId: usr1.userId,
			subtaskId: subtask.subtaskId,
			statusId: strikeStatus.statusId,
		}));

		entries.push(await testhelpers.createEntry({
			lookups,
			taskId: tasks[0].taskId,
			shiftId: shifts[0].shiftId,
			userId: usr2.userId,
			subtaskId: subtask.subtaskId,
			statusId: strikeStatus.statusId,
		}));

		entries.push(await testhelpers.createEntry({
			lookups,
			taskId: tasks[0].taskId,
			shiftId: shifts[1].shiftId,
			userId: usr2.userId,
			subtaskId: subtask.subtaskId,
			statusId: strikeStatus.statusId,
		}));

		entries.push(await testhelpers.createEntry({
			lookups,
			taskId: tasks[0].taskId,
			shiftId: shifts[2].shiftId,
			userId: usr2.userId,
			subtaskId: subtask.subtaskId,
			statusId: strikeStatus.statusId,
		}));

		let emails = await testhelpers.getEmails();
		expect(emails.length).to.eq(8);
		for (let ml of emails) {
			expect(ml.bcc.length).to.eq(2);
		}

		let txts = emails.filter(t => t.text != null && t.subject == null);
		let emls = emails.filter(e => e.html != null && e.subject != null);
		
		for (let txt of txts) {
			expect(txt.bcc.indexOf(`${usr4.phoneNumber}@mailinator.com`)).to.be.above(-1);
			expect(txt.bcc.indexOf(`${usr5.phoneNumber}@mailinator.com`)).to.be.above(-1);
		}

		for (let e of emls) {
			expect(e.bcc.indexOf(usr3.email)).to.be.above(-1);
			expect(e.bcc.indexOf(usr5.email)).to.be.above(-1);
		}
	});

	it('email subtasks incomplete', async () => {
		const lookups = (await request(app).get('/api/lookups?lookupType=0')).body;
		const tasks = await testhelpers.createTasks();
		const shifts = await testhelpers.createShifts();
		const status = lookups.statuses.find(s => s.statusName == 'Incomplete');
		const subtask = tasks[0].subtasks[0];

		const usr1 = await testhelpers.createUser({ roles: [100] });
		const usr2 = await testhelpers.createUser({ roles: [] });
		const usr3 = await testhelpers.createUser({ roles: [100], enableEmailNotifications: true });
		const usr4 = await testhelpers.createUser({ roles: [100], enableTextNotifications: true });
		const usr5 = await testhelpers.createUser({ roles: [100], enableEmailNotifications: true, enableTextNotifications: true });
		const entries = [];
		entries.push(await testhelpers.createEntry({
			lookups,
			taskId: tasks[0].taskId,
			shiftId: shifts[0].shiftId,
			userId: usr1.userId,
			subtaskId: subtask.subtaskId,
			statusId: status.statusId,
		}));

		entries.push(await testhelpers.createEntry({
			lookups,
			taskId: tasks[0].taskId,
			shiftId: shifts[0].shiftId,
			userId: usr2.userId,
			subtaskId: subtask.subtaskId,
			statusId: status.statusId,
		}));

		entries.push(await testhelpers.createEntry({
			lookups,
			taskId: tasks[0].taskId,
			shiftId: shifts[1].shiftId,
			userId: usr2.userId,
			subtaskId: subtask.subtaskId,
			statusId: status.statusId,
		}));

		entries.push(await testhelpers.createEntry({
			lookups,
			taskId: tasks[0].taskId,
			shiftId: shifts[2].shiftId,
			userId: usr2.userId,
			subtaskId: subtask.subtaskId,
			statusId: status.statusId,
		}));

		let emails = await testhelpers.getEmails();
		expect(emails.length).to.eq(2);
		for (let ml of emails) {
			expect(ml.bcc.length).to.eq(2);
		}

		let txts = emails.filter(t => t.text != null && t.subject == null);
		let emls = emails.filter(e => e.html != null && e.subject != null);
		
		for (let txt of txts) {
			expect(txt.bcc.indexOf(`${usr4.phoneNumber}@mailinator.com`)).to.be.above(-1);
			expect(txt.bcc.indexOf(`${usr5.phoneNumber}@mailinator.com`)).to.be.above(-1);
		}

		for (let e of emls) {
			expect(e.bcc.indexOf(usr3.email)).to.be.above(-1);
			expect(e.bcc.indexOf(usr5.email)).to.be.above(-1);
		}
	});
});