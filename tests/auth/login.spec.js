const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../server');
const testhelpers = require('../testhelpers');
const models = require('../../models');

describe('Testing login', function () {
	it('invalid email', async () => {
		let res = await request(app)
			.post(`/api/login`)
			.send({ email: 'bogus email', password: '12345' })
			;
		expect(res.statusCode).to.eq(401);
	});

	it('invalid pw', async () => {
		let res = await request(app)
			.post(`/api/login`)
			.send({ email: global.signup.user.email, password: '123456' })
			;
		expect(res.statusCode).to.eq(401);
	});

	it('should log signed up user in', async () => {
		let res = await request(app)
			.post(`/api/login`)
			.send({ email: global.signup.user.email, password: '12345' })
			;
		expect(res.statusCode).to.eq(200);
		expect(res.body.user.roles).to.exist;
		for (let r of [100, 160, 300, 1700, 500, 600, 900, 1000, 1100, 1300, 1460]) {
			expect(res.body.user.roles.indexOf(r)).to.be.above(-1);
		}
	});

	it('should log basic user in', async () => {
		const usr = await testhelpers.createUser({ roles: [] });
		let res = await request(app)
			.post(`/api/login`)
			.send({ email: usr.email, password: '12345' })
			;
		expect(res.statusCode).to.eq(200);
		expect(res.body.user.roles).to.exist;
		for (let r of [100, 160, 300, 1700, 500, 600, 900, 1000, 1100, 1300, 1460]) {
			expect(res.body.user.roles.indexOf(r)).to.be.below(0);
		}
	});

	it('should log manager user in', async () => {
		const usr = await testhelpers.createUser({ roles: [100] });
		let res = await request(app)
			.post(`/api/login`)
			.send({ email: usr.email, password: '12345' })
			;
		expect(res.statusCode).to.eq(200);
		expect(res.body.user.roles).to.exist;
		for (let r of [100, 160, 300, 1700]) {
			expect(res.body.user.roles.indexOf(r)).to.be.above(-1);
		}

		for (let r of [500, 600, 900, 1000, 1100, 1300, 1460]) {
			expect(res.body.user.roles.indexOf(r)).to.be.below(0);
		}
	});

	it('should log inventory user in', async () => {
		const usr = await testhelpers.createUser({ roles: [500] });
		let res = await request(app)
			.post(`/api/login`)
			.send({ email: usr.email, password: '12345' })
			;
		expect(res.statusCode).to.eq(200);
		expect(res.body.user.roles).to.exist;
		for (let r of [500]) {
			expect(res.body.user.roles.indexOf(r)).to.be.above(-1);
		}

		for (let r of [100, 160, 300, 1700, 600, 900, 1000, 1100, 1300, 1460]) {
			expect(res.body.user.roles.indexOf(r)).to.be.below(0);
		}
	});

	it('should log admin user in', async () => {
		const usr = await testhelpers.createUser({ roles: [600] });
		let res = await request(app)
			.post(`/api/login`)
			.send({ email: usr.email, password: '12345' })
			;
		expect(res.statusCode).to.eq(200);
		expect(res.body.user.roles).to.exist;
		for (let r of [100, 160, 300, 1700, 500, 600, 900, 1000, 1100, 1300, 1460]) {
			expect(res.body.user.roles.indexOf(r)).to.be.above(-1);
		}
	});

	it('should log maintenance user in', async () => {
		const usr = await testhelpers.createUser({ roles: [900] });
		let res = await request(app)
			.post(`/api/login`)
			.send({ email: usr.email, password: '12345' })
			;
		expect(res.statusCode).to.eq(200);
		expect(res.body.user.roles).to.exist;
		for (let r of [900]) {
			expect(res.body.user.roles.indexOf(r)).to.be.above(-1);
		}

		for (let r of [100, 160, 300, 1700, 500, 600, 1000, 1100, 1300, 1460]) {
			expect(res.body.user.roles.indexOf(r)).to.be.below(0);
		}
	});

	it('should log scheduling user in', async () => {
		const usr = await testhelpers.createUser({ roles: [1000] });
		let res = await request(app)
			.post(`/api/login`)
			.send({ email: usr.email, password: '12345' })
			;
		expect(res.statusCode).to.eq(200);
		expect(res.body.user.roles).to.exist;
		for (let r of [1000, 1100, 1300, 1460]) {
			expect(res.body.user.roles.indexOf(r)).to.be.above(-1);
		}

		for (let r of [100, 160, 300, 1700, 500, 600, 900]) {
			expect(res.body.user.roles.indexOf(r)).to.be.below(0);
		}
	});

	it('token expired', async () => {
		const usr = await testhelpers.createUser({ roles: [600] });
		const jwt = await testhelpers.getJWT(usr, true);
		let res = await request(app)
			.get('/api/inventoryItems')
			.set('access-token', jwt);
			
		expect(res.statusCode).to.eq(401);
		expect(res.body).to.eq('Token expired!');
	});

	it('user fired', async () => {
		const usr = await testhelpers.createUser({ roles: [600] });
		await models.user.update({
			isFired: true
		}, {
			where: {
				userId: usr.userId
			},
			fields: ['isFired']
		})
		const jwt = await testhelpers.getJWT(usr);
		let res = await request(app)
			.get('/api/inventoryItems')
			.set('access-token', jwt);
			
		expect(res.statusCode).to.eq(401);
		expect(res.body).to.eq('Access Denied!');
	});
});