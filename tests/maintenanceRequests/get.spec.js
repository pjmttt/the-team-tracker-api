const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../server');
const testhelpers = require('../testhelpers');
const models = require('../../models');

describe('Testing maintenance requests', function () {
	const url = '/api/maintenanceRequests';
		
	it('get maintenance request with images', async () => {
		const req = await testhelpers.createMaintenanceRequest(null, true);
		let res = await request(app).get(`${url}`);
		expect(res.statusCode).to.eq(200);
		expect(res.body.data[0].requestDescription).to.eq(req.requestDescription);
		expect(res.body.data[0].maintenanceRequestImages).to.exist;
		// expect(res.body.data[0].maintenanceRequestImages.length).to.be.above(0);
		// for (let img of res.body.data[0].maintenanceRequestImages) {
		// 	expect(img.image).to.not.exist;
		// 	expect(img.imageBase64).to.eq('MA==');
		// }

		res = await request(app).get(`${url}/${req.maintenanceRequestId}`);
		expect(res.statusCode).to.eq(200);
		expect(res.body.requestDescription).to.eq(req.requestDescription);
		expect(res.body.maintenanceRequestImages).to.exist;
		// expect(res.body.maintenanceRequestImages.length).to.be.above(0);
		// for (let img of res.body.maintenanceRequestImages) {
		// 	expect(img.image).to.not.exist;
		// 	expect(img.imageBase64).to.eq('MA==');
		// }
	});
});