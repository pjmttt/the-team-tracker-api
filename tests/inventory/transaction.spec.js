// var expect = require('chai').expect;
// var request = require('supertest');
// const app = require('../../server');

// const iicurl = '/api/inventoryCategories';
// const iiurl = '/api/inventoryItems';
// const iturl = '/api/inventoryTransactions';
// const vurl = '/api/vendors';

// describe('Testing inventory transaction:', function () {
// 	async function createInventoryTransaction(quantity, inventoryItemId, vendorId, costPer) {
// 		const res = await request(app).post(iturl).send({
// 			quantity,
// 			vendorId,
// 			inventoryItemId,
// 			costPer,
// 			transactionDate: new Date(),
// 			transactionType: quantity < 0 ? 0 : 1
// 		});
// 		expect(res.statusCode).to.eq(201);
// 	}
// 	it('calculate quantities start at zero', async () => {
// 		let res = await request(app).post(iicurl).send({
// 			categoryName: 'Test category'
// 		});
// 		expect(res.statusCode).to.be.equal(201);
// 		let res2 = await request(app).post(iiurl).send({
// 			inventoryItemName: 'Dummy',
// 			minimumQuantity: 0,
// 			quantityOnHand: 0,
// 			inventoryCategoryId: res.body.inventoryCategoryId
// 		});
// 		expect(res2.statusCode).to.be.equal(201);

// 		const dummy = res2.body;

// 		res = await request(app).post(iiurl).send({
// 			inventoryItemName: 'Test inventory',
// 			minimumQuantity: 0,
// 			quantityOnHand: 0,
// 			inventoryCategoryId: res.body.inventoryCategoryId
// 		});
// 		expect(res.statusCode).to.be.equal(201);
// 		let invItem = res.body;
// 		res = await request(app).post(vurl).send({
// 			vendorName: 'Test Vendor'
// 		});
// 		expect(res.statusCode).to.be.equal(201);
// 		const vendorId = res.body.vendorId;

// 		await createInventoryTransaction(20, invItem.inventoryItemId, vendorId);

// 		res = await request(app).get(`${iiurl}/${invItem.inventoryItemId}`);
// 		expect(res.statusCode).to.be.equal(200);
// 		invItem = res.body;
// 		expect(invItem.quantityOnHand).to.eq(20);
// 		expect(invItem.costOnHand).to.eq(0);

// 		await createInventoryTransaction(30, invItem.inventoryItemId, vendorId, 20);

// 		res = await request(app).get(`${iiurl}/${invItem.inventoryItemId}`);
// 		expect(res.statusCode).to.be.equal(200);
// 		invItem = res.body;
// 		expect(invItem.quantityOnHand).to.eq(50);
// 		expect(invItem.costOnHand).to.eq(600);

// 		await createInventoryTransaction(10, invItem.inventoryItemId, vendorId, 15);

// 		res = await request(app).get(`${iiurl}/${invItem.inventoryItemId}`);
// 		expect(res.statusCode).to.be.equal(200);
// 		invItem = res.body;
// 		expect(invItem.quantityOnHand).to.eq(60);
// 		expect(invItem.costOnHand).to.eq(750);

// 		res = await request(app).put(`${iiurl}/${invItem.inventoryItemId}`).send({
// 			quantityOnHand: 70
// 		});
// 		expect(res.statusCode).to.eq(200);

// 		res = await request(app).get(iturl);
// 		expect(res.statusCode).to.eq(200);
// 		let its = res.body.data;
// 		its.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
// 		expect(its[0].quantity).to.eq(10);
// 		expect(its[0].transactionType).to.eq(2);

// 		await createInventoryTransaction(30, invItem.inventoryItemId, vendorId, 25);

// 		res = await request(app).get(`${iiurl}/${invItem.inventoryItemId}`);
// 		expect(res.statusCode).to.be.equal(200);
// 		invItem = res.body;
// 		expect(invItem.quantityOnHand).to.eq(100);
// 		expect(invItem.costOnHand).to.eq(1500);

// 		await createInventoryTransaction(200, dummy.inventoryItemId, vendorId, 100);

// 		res = await request(app).get(`${iiurl}/${invItem.inventoryItemId}`);
// 		expect(res.statusCode).to.be.equal(200);
// 		invItem = res.body;
// 		expect(invItem.quantityOnHand).to.eq(100);
// 		expect(invItem.costOnHand).to.eq(1500);

// 		await createInventoryTransaction(-30, invItem.inventoryItemId);

// 		res = await request(app).get(`${iiurl}/${invItem.inventoryItemId}`);
// 		expect(res.statusCode).to.be.equal(200);
// 		invItem = res.body;
// 		expect(invItem.quantityOnHand).to.eq(70);
// 		expect(invItem.costOnHand).to.eq(1050);

// 		res = await request(app).put(`${iiurl}/${invItem.inventoryItemId}`).send({
// 			quantityOnHand: 50
// 		});
// 		expect(res.statusCode).to.eq(200);

// 		res = await request(app).get(iturl);
// 		expect(res.statusCode).to.eq(200);
// 		its = res.body.data;
// 		its.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
// 		expect(its[0].quantity).to.eq(-20);
// 		expect(its[0].transactionType).to.eq(2);

// 		res = await request(app).get(`${iiurl}/${invItem.inventoryItemId}`);
// 		expect(res.statusCode).to.be.equal(200);
// 		invItem = res.body;
// 		expect(invItem.quantityOnHand).to.eq(50);
// 		expect(invItem.costOnHand).to.eq(1050);

// 	});
// });