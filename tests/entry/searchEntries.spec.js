const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../server');
const testhelpers = require('../testhelpers');
const models = require('../../models');
const url = '/api/entries';

describe('Search entries:', function () {
	this.timeout(60000);

	beforeEach(async () => {
		await models.entry.destroy({ truncate: true });
	});

	async function searchEntries(lookups, searchParams) {
		const userId1 = searchParams.users ? searchParams.users[0] : (await testhelpers.createUser({ roles: [] })).userId;
		const usr2 = await testhelpers.createUser({ roles: [] });
		const usr3 = await testhelpers.createUser({ roles: [] });
		await testhelpers.createEntry({
			lookups,
			taskId: lookups.tasks[0].taskId,
			shiftId: lookups.shifts[0].shiftId,
			userId: userId1
		});

		await testhelpers.createEntry({
			lookups,
			taskId: lookups.tasks[0].taskId,
			shiftId: lookups.shifts[1].shiftId,
			userId: userId1
		});

		await testhelpers.createEntry({
			lookups,
			taskId: lookups.tasks[0].taskId,
			shiftId: lookups.shifts[2].shiftId,
			userId: usr2.userId
		});

		await testhelpers.createEntry({
			taskId: lookups.tasks[1].taskId,
			shiftId: lookups.shifts[0].shiftId,
			userId: userId1
		});

		await testhelpers.createEntry({
			lookups,
			taskId: lookups.tasks[1].taskId,
			shiftId: lookups.shifts[1].shiftId,
			userId: userId1
		});

		await testhelpers.createEntry({
			lookups,
			taskId: lookups.tasks[1].taskId,
			shiftId: lookups.shifts[2].shiftId,
			userId: usr2.userId
		});

		await testhelpers.createEntry({
			lookups,
			taskId: lookups.tasks[2].taskId,
			shiftId: lookups.shifts[0].shiftId,
			userId: usr3.userId
		});

		await testhelpers.createEntry({
			lookups,
			taskId: lookups.tasks[2].taskId,
			shiftId: lookups.shifts[1].shiftId,
			userId: userId1
		});

		await testhelpers.createEntry({
			lookups,
			taskId: lookups.tasks[2].taskId,
			shiftId: lookups.shifts[2].shiftId,
			userId: usr2.userId
		});

		await testhelpers.createEntry({
			lookups,
			taskId: lookups.tasks[3].taskId,
			shiftId: lookups.shifts[0].shiftId,
			userId: userId1
		});

		await testhelpers.createEntry({
			lookups,
			taskId: lookups.tasks[3].taskId,
			shiftId: lookups.shifts[1].shiftId,
			userId: usr2.userId
		});

		await testhelpers.createEntry({
			lookups,
			taskId: lookups.tasks[3].taskId,
			shiftId: lookups.shifts[2].shiftId,
			userId: usr3.userId
		});

		let res = await request(app).post('/api/searchEntries').send(searchParams);
		expect(res.statusCode).to.eq(200);
		expect(res.body.data.length).to.be.above(0);
		for (let entry of res.body.data) {
			expect(entry.entryType).to.eq(0);
			expect(entry).to.have.property('shift');
			expect(entry).to.have.property('task');
			expect(entry).to.have.property('entrySubtasks');
			expect(entry).to.have.property('user');
			expect(entry).to.have.property('enteredBy');
			for (let est of entry.entrySubtasks) {
				expect(est).to.have.property('status');
			}
		}
		return res.body.data;
	}

	it('search entries by task', async () => {
		const lookups = (await request(app).get('/api/lookups')).body;
		const entries = await searchEntries(lookups, {
			tasks: [lookups.tasks[0].taskId]
		});

		expect(entries.length).to.eq(3);
		for (let e of entries) {
			expect(e.taskId).to.eq(lookups.tasks[0].taskId);
		}
	});

	it('search entries by task, shift', async () => {
		const lookups = (await request(app).get('/api/lookups')).body;
		const shifts = [lookups.shifts[0].shiftId, lookups.shifts[1].shiftId];
		const entries = await searchEntries(lookups, {
			tasks: [lookups.tasks[1].taskId],
			shifts
		});

		expect(entries.length).to.eq(2);
		for (let e of entries) {
			expect(e.taskId).to.eq(lookups.tasks[1].taskId);
			expect(shifts).to.include(e.shiftId);
		}
	});

	it('search entries by task, shift, user', async () => {
		const lookups = (await request(app).get('/api/lookups')).body;
		const shifts = [lookups.shifts[0].shiftId, lookups.shifts[1].shiftId];
		const usr1 = await testhelpers.createUser({ roles: [] });
		const entries = await searchEntries(lookups, {
			tasks: [lookups.tasks[1].taskId],
			users: [usr1.userId],
			shifts
		});

		expect(entries.length).to.eq(2);
		for (let e of entries) {
			expect(e.taskId).to.eq(lookups.tasks[1].taskId);
			expect(e.userId).to.eq(usr1.userId);
			expect(shifts).to.include(e.shiftId);
		}
	});
});