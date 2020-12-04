const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../server');
const testhelpers = require('../testhelpers');

describe('Testing tasks', function () {
	it('get tasks for type 0', async () => {
		let res = await request(app).get(`/api/tasks`);
		expect(res.statusCode).to.eq(200);
		expect(res.body.data.length).to.be.above(0);
		for (let t of res.body.data) {
			expect(t.taskType).to.eq(0);
		}
	});

	it('get tasks for type 1', async () => {
		let res = await request(app).get(`/api/generalTasks`);
		expect(res.statusCode).to.eq(200);
		expect(res.body.data.length).to.be.above(0);
		for (let t of res.body.data) {
			expect(t.taskType).to.eq(1);
		}
	});
});