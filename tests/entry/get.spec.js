const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../server');
const testhelpers = require('../testhelpers');

const url = '/api/entries';
const generalurl = '/api/generalentries';

describe('Testing entries:', function () {
	it('get entries', async () => {
		await testhelpers.createEntries();
		let res = await request(app).get(`${url}?start=2018-02-16&end=2080-02-16`);
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
	});

	it('get general tasks', async () => {
		await testhelpers.createEntries();
		let res = await request(app).get(`${generalurl}?&start=2018-02-16&end=2080-02-16`);
		expect(res.statusCode).to.eq(200);
		expect(res.body.data.length).to.be.above(0);
		for (let entry of res.body.data) {
			expect(entry.entryType).to.eq(1);
			expect(entry).to.not.have.property('shift');
			expect(entry).to.have.property('task');
			expect(entry).to.not.have.property('entrySubtasks');
			expect(entry).to.have.property('user');
			expect(entry).to.have.property('enteredBy');
		}
	});
});