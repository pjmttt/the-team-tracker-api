const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../server');
const testhelpers = require('../testhelpers');
const models = require('../../models');

describe('Testing maintenance requests', function () {
	const url = '/api/maintenanceRequests'

	beforeEach(async () => {
		await models.maintenanceRequest.destroy({ truncate: true });
	});


	it('update maintenance request without images', async () => {
		const req = await testhelpers.createMaintenanceRequest(null, true);
		let res = await request(app).put(`${url}/${req.maintenanceRequestId}`).send({
			requestDescription: 'changed desc'
		});
		expect(res.statusCode).to.eq(200);
		res = await request(app).get(`${url}?includeImages=true`);
		expect(res.body.data[0].requestDescription).to.eq('changed desc');
		// expect(res.body.data[0].maintenanceRequestImages.length).to.be.above(0);

	});

	// it('update maintenance request with images', async () => {
	// 	const req = await testhelpers.createMaintenanceRequest(null, true);
	// 	let res = await testhelpers.sendRequest(`${url}/${req.maintenanceRequestId}`, "put", 200, {
	// 		maintenanceRequestImages: [
	// 			req.maintenanceRequestImages.find(i => i.imageType == 'jpeg'), {
	// 				image: 0,
	// 				imageType: 'gif'
	// 			}
	// 		]
	// 	});
		

	// 	res = await testhelpers.sendRequest(`${url}/${req.maintenanceRequestId}?includeImages=true`, "get", 200);
	// 	expect(res.body.maintenanceRequestImages.length).to.be.eq(2);
	// 	expect(res.body.maintenanceRequestImages.find(i => i.imageType == 'jpeg')).to.exist;
	// 	expect(res.body.maintenanceRequestImages.find(i => i.imageType == 'gif')).to.exist;
	// });
});