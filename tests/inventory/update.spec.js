const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../server');
const testhelpers = require('../testhelpers');
const models = require('../../models');

describe('Testing inventory requests', function () {
	const url = '/api/inventoryItems';

	it('update inventory items', async () => {
		const usr1 = await testhelpers.createUser({ roles: [600], emailNotifications: [2000] });
		const usr2 = await testhelpers.createUser({ roles: [], enableEmailNotifications: true, enableTextNotifications: true });
		const usr3 = await testhelpers.createUser({ roles: [500], enableEmailNotifications: true, emailNotifications: [2000], textNotifications: [2000] });
		const usr4 = await testhelpers.createUser({ roles: [600], enableTextNotifications: true, textNotifications: [2000] });
		const usr5 = await testhelpers.createUser({ roles: [500, 600], enableEmailNotifications: true, enableTextNotifications: true, emailNotifications: [2000], textNotifications: [2000] });
		const usr6 = await testhelpers.createUser({ emailNotifications: [], textNotifications: [], roles: [500, 600], enableEmailNotifications: true, enableTextNotifications: true });

		const invItem = await testhelpers.createInventoryItem();

		let res = await request(app).put(`${url}/${invItem.inventoryItemId}`).send({ inventoryItemName: `${invItem.inventoryItemName} change`, minimumQuantity: 10 });
		expect(res.statusCode).to.eq(200);

		const found = await models.inventoryItem.findById(invItem.inventoryItemId);
		expect(found.inventoryItemName).to.eq(`${invItem.inventoryItemName} change`);

		let emails = await testhelpers.getEmails();
		expect(emails.length).to.eq(0);

		res = await request(app).put(`${url}/${invItem.inventoryItemId}`).send({ quantityOnHand: 9 });
		expect(res.statusCode).to.eq(200);

		emails = await testhelpers.getEmails();
		expect(emails.length).to.eq(0);

		res = await request(app).put(`${url}/${invItem.inventoryItemId}`).send({ quantityOnHand: 10 });
		expect(res.statusCode).to.eq(200);

		emails = await testhelpers.getEmails();
		expect(emails.length).to.eq(0);

		res = await request(app).put(`${url}/${invItem.inventoryItemId}`).send({ quantityOnHand: 5 });
		expect(res.statusCode).to.eq(200);

		emails = await testhelpers.getEmails();
		expect(emails.length).to.eq(2);

		const txt = emails.find(e => !e.subject);
		expect(txt.bcc.length).to.eq(2);
		expect(txt.bcc.indexOf(`${usr4.phoneNumber}@mailinator.com`)).to.be.above(-1);
		expect(txt.bcc.indexOf(`${usr5.phoneNumber}@mailinator.com`)).to.be.above(-1);
		expect(txt.body).to.contain(invItem.inventoryItemName);
		expect(txt.body).to.contain('In Stock: 5');
		expect(txt.body).to.contain('Min Qty: 10');
		
		const eml = emails.find(e => e.subject);
		expect(eml.bcc.length).to.eq(2);
		expect(eml.bcc.indexOf(usr3.email)).to.be.above(-1);
		expect(eml.bcc.indexOf(usr5.email)).to.be.above(-1);
		expect(eml.subject).to.eq(`Inventory Needed - ${invItem.inventoryItemName} change`);
		expect(eml.body).to.contain('In Stock: 5');
		expect(eml.body).to.contain('Min Qty: 10');
		expect(eml.body).to.contain(invItem.inventoryItemName);

		await testhelpers.deleteEmails();
		res = await request(app).put(`${url}/${invItem.inventoryItemId}`).send({ quantityOnHand: 6 });
		expect(res.statusCode).to.eq(200);

		emails = await testhelpers.getEmails();
		expect(emails.length).to.eq(0);
	});
});