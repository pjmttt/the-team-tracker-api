const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../server');
const testhelpers = require('../testhelpers');

const lookupsUrl = '/api/lookups';

describe('Testing inventory transaction:', function () {
	async function runTestsForZero(lookups) {
		expect(lookups.shifts.length).to.be.above(0);
		expect(lookups.tasks.length).to.be.above(0);
		for (let t of lookups.tasks) {
			expect(t.taskType).to.eq(0);
			expect(t.subtasks.length).to.be.above(0);
			for (let st of t.subtasks) {
				expect(st.taskId).to.eq(t.taskId);
			}
		}

		expect(lookups.statuses.length).to.be.above(0);
		expect(lookups.positions.length).to.be.above(0);
		expect(lookups.users.length).to.be.above(0);
	}

	it('get lookups for entries', async () => {
		const created = await testhelpers.createLookups();
		const lookups = (await request(app).get(lookupsUrl)).body;
		await runTestsForZero(lookups);
		const models = require('../../models');
		await models.shift.destroy({ where: { shiftId: { $in: created.shifts.map(s => s.shiftId) } } });
		await models.subtask.destroy({ where: { taskId: { $in: created.tasks.map(s => s.taskId) } } });
		await models.subtask.destroy({ where: { taskId: { $in: created.generalTasks.map(s => s.taskId) } } });
		await models.task.destroy({ where: { taskId: { $in: created.tasks.map(s => s.taskId) } } });
		await models.task.destroy({ where: { taskId: { $in: created.generalTasks.map(s => s.taskId) } } });
		await models.status.destroy({ where: { statusId: { $in: created.statuses.map(s => s.status) } } });
		await models.progressChecklist.destroy({ where: { progressChecklistId: { $in: created.progressChecklists.map(s => s.progressChecklistId) } } });
		await models.user.destroy({ where: { userId: { $in: created.users.map(s => s.userId) } } });
		await models.position.destroy({ where: { positionId: { $in: created.positions.map(s => s.positionId) } } });
		await models.attendanceReason.destroy({ where: { attendanceReasonId: { $in: created.attendanceReasons.map(s => s.attendanceReasonId) } } });
	});

	it('get lookups for entries type 0', async () => {
		const lookups = (await request(app).get(`${lookupsUrl}?lookupType=0`)).body;
		await runTestsForZero(lookups);
	});

	it('get lookups for general tasks', async () => {
		const lookups = (await request(app).get(`${lookupsUrl}?lookupType=1`)).body;
		expect(lookups.shifts).to.be.an('undefined');
		expect(lookups.tasks.length).to.be.above(0);
		for (let t of lookups.tasks) {
			expect(t.taskType).to.be.eq(1);
			expect(t.subtasks).to.be.an('undefined');
		}
		expect(lookups.statuses).to.be.an('undefined');
		expect(lookups.positions).to.be.an('undefined');
		expect(lookups.users.length).to.be.above(0);
	});

	it('get lookups for maintenance requests', async () => {
		const lookups = (await request(app).get(`${lookupsUrl}?lookupType=2`)).body;
		expect(lookups.shifts).to.be.an('undefined');
		expect(lookups.tasks).to.be.an('undefined');
		expect(lookups.statuses).to.be.an('undefined');
		expect(lookups.positions).to.be.an('undefined');
		expect(lookups.users.length).to.be.above(0);
	});
});