const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../server');
const testhelpers = require('../testhelpers');
const models = require('../../models');

describe('Testing inventory requests', function () {
	const url = '/api/inventoryItems';

	it('get inventory items', async () => {
		const cat = await testhelpers.createInventoryCategory();
		const currCount = await models.inventoryItem.count();
		const notNeeded = [];
		for (let i = 0; i < 10; i++) {
			let res = await request(app).post(url).send({
				inventoryItemName: `not needed ${i}`,
				inventoryCategoryId: cat.inventoryCategoryId,
				quantityOnHand: 10,
				minimumQuantity: 5,
			});
			expect(res.statusCode).to.eq(201);
			notNeeded.push(res.body);
		}

		const needed = [];
		for (let i = 0; i < 10; i++) {
			let res = await request(app).post(url).send({
				inventoryItemName: `needed ${i}`,
				inventoryCategoryId: cat.inventoryCategoryId,
				quantityOnHand: 1,
				minimumQuantity: 5,
			});
			expect(res.statusCode).to.eq(201);
			needed.push(res.body);
		}

		let res = await request(app).get(url);
		expect(res.body.count).to.eq(currCount + 20);
		expect(res.body.data.length).to.eq(currCount + 20);
		for (let i = 0; i < 10; i++) {
			expect(res.body.data.find(ii => ii.inventoryItemName == `not needed ${i}`)).to.exist;
			expect(res.body.data.find(ii => ii.inventoryItemName == `needed ${i}`)).to.exist;
		}

		res = await request(app).get(`${url}?neededOnly=true`);
		expect(res.body.count).to.eq(10);
		expect(res.body.data.length).to.eq(10);
		for (let i = 0; i < 10; i++) {
			expect(res.body.data.find(ii => ii.inventoryItemName == `needed ${i}`)).to.exist;
		}

		res = await request(app).get(`${url}?neededOnly=true&orderBy=inventoryItemName&limit=5`);
		expect(res.body.count).to.eq(10);
		expect(res.body.data.length).to.eq(5);
		for (let i = 0; i < 5; i++) {
			expect(res.body.data.find(ii => ii.inventoryItemName == `needed ${i}`)).to.exist;
		}

		res = await request(app).get(`${url}?neededOnly=true&orderBy=inventoryItemName desc&limit=5&offset=2`);
		expect(res.body.count).to.eq(10);
		expect(res.body.data.length).to.eq(5);
		for (let i = 3; i < 8; i++) {
			expect(res.body.data.find(ii => ii.inventoryItemName == `needed ${i}`)).to.exist;
		}

		res = await request(app).get(`${url}?where=inventoryItemName like %25needed%25`);
		expect(res.body.count).to.eq(20);
		expect(res.body.data.length).to.eq(20);
		for (let i = 0; i < 10; i++) {
			expect(res.body.data.find(ii => ii.inventoryItemName == `not needed ${i}`)).to.exist;
			expect(res.body.data.find(ii => ii.inventoryItemName == `needed ${i}`)).to.exist;
		}

		res = await request(app).get(`${url}?where=inventoryCategoryId in ${cat.inventoryCategoryId}`);
		expect(res.body.count).to.eq(20);
		expect(res.body.data.length).to.eq(20);
		for (let i = 0; i < 10; i++) {
			expect(res.body.data.find(ii => ii.inventoryItemName == `not needed ${i}`)).to.exist;
			expect(res.body.data.find(ii => ii.inventoryItemName == `needed ${i}`)).to.exist;
		}
	});
});