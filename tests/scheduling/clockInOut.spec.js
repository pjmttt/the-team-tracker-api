const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../server');
const testhelpers = require('../testhelpers');
const models = require('../../models');

describe('Testing clock in out', function () {
	this.timeout(60000);

	async function getIpAddress() {
		return (await request(app).get('/api/ipaddress')).body;
	}

	it('cant clock someone else in', async () => {
		const usr = await testhelpers.createUser({ roles: [] });
		const jwt = await testhelpers.getJWT(usr);

		let result = await request(app)
			.post('/api/clockInOutById')
			.set('access-token', jwt)
			.send({
				userId: global.signup.user.userId
			});

		expect(result.statusCode).to.eq(409);
		expect(result.body.message).to.eq('You do not have permission to clock anyone else in/out.')
	});

	it('should not clock user fired', async () => {
		await models.user.update({
			isFired: true,
		}, {
				where: { userId: global.signup.user.userId },
				fields: ['isFired']
			});

		let result = await request(app)
			.post('/api/clockInOutById')
			.send({
				userId: global.signup.user.userId
			});

		expect(result.statusCode).to.eq(403);
		expect(result.body.message).to.eq('Access Denied!')

		await models.user.update({
			isFired: false,
		}, {
				where: { userId: global.signup.user.userId },
				fields: ['isFired']
			});
	});

	it('should not clock user no company info', async () => {
		await models.company.update({
			ipAddress: null,
			geoLocation: null
		}, {
				where: { companyId: global.signup.user.companyId },
				fields: ['ipAddress', 'geoLocation']
			});

		let result = await request(app)
			.post('/api/clockInOutById')
			.send({
				userId: global.signup.user.userId
			});

		expect(result.statusCode).to.eq(409);
		expect(result.body.message).to.eq('Clock in/out is disabled due to missing company info!')
	});

	it('should not clock user wrong ip and missing geo', async () => {
		await models.company.update({
			ipAddress: '123.45.67.89',
			geoLocation: '35.4456096,-120.8974328',
		}, {
				where: { companyId: global.signup.user.companyId },
				fields: ['ipAddress', 'geoLocation']
			});

		let result = await request(app)
			.post('/api/clockInOutById')
			.send({
				userId: global.signup.user.userId
			});

		expect(result.statusCode).to.eq(409);
		expect(result.body.message).to.eq('Sorry, you can not clock in/out from this location! If clocking in from your mobile device, ensure location services are turned on.')
	});

	it('should not clock user wrong ip and no geo', async () => {
		await models.company.update({
			ipAddress: '123.45.67.89',
			geoLocation: null,
		}, {
				where: { companyId: global.signup.user.companyId },
				fields: ['ipAddress', 'geoLocation']
			});

		let result = await request(app)
			.post('/api/clockInOutById')
			.send({
				userId: global.signup.user.userId
			});

		expect(result.statusCode).to.eq(409);
		expect(result.body.message).to.eq('Sorry, you can not clock in/out from this location!')
	});

	it('should not clock user out, already clocked out', async () => {
		await models.company.update({
			ipAddress: await getIpAddress(),
			geoLocation: '35.4456096,-120.8974328',
		}, {
				where: { companyId: global.signup.user.companyId },
				fields: ['ipAddress', 'geoLocation']
			});

		await models.user.update({
			clockedIn: false,
		}, {
				where: { userId: global.signup.user.userId },
				fields: ['clockedIn']
			})

		let result = await request(app)
			.post('/api/clockInOutById')
			.send({
				userId: global.signup.user.userId,
				clockIn: false,
			});

		expect(result.statusCode).to.eq(409);
		expect(result.body.message).to.eq(`${global.signup.user.displayName}, is already clocked out, did you forget to clock in?`)
	});

	it('should clock user in by ip', async () => {
		await models.company.update({
			ipAddress: await getIpAddress(),
			geoLocation: '35.4456096,-120.8974328',
		}, {
				where: { companyId: global.signup.user.companyId },
				fields: ['ipAddress', 'geoLocation']
			});

		await models.user.update({
			clockedIn: false,
		}, {
				where: {
					userId: global.signup.user.userId
				},
				fields: ['clockedIn']
			});

		let result = await request(app)
			.post('/api/clockInOutById')
			.send({
				userId: global.signup.user.userId,
			});

		expect(result.statusCode).to.eq(200);
		expect(result.body.message).to.eq(`${global.signup.user.displayName}, has been clocked in.`)
	});

	it('should clock user in by geo', async () => {
		await models.company.update({
			ipAddress: null,
			geoLocation: '35.4456096,-120.8974328',
		}, {
				where: { companyId: global.signup.user.companyId },
				fields: ['ipAddress']
			});

		await models.user.update({
			clockedIn: false,
		}, {
				where: {
					userId: global.signup.user.userId
				},
				fields: ['clockedIn']
			});

		const split = global.signup.user.company.geoLocation.split(',');
		let result = await request(app)
			.post('/api/clockInOutById')
			.send({
				userId: global.signup.user.userId,
				geoLocation: {
					latitude: split[0],
					longitude: split[1]
				}
			});

		expect(result.statusCode).to.eq(200);
		expect(result.body.message).to.eq(`${global.signup.user.displayName}, has been clocked in.`);
	});

	it('should clock user in by either', async () => {
		await models.company.update({
			ipAddress: await getIpAddress(),
			geoLocation: '35.4456096,-120.8974328',
		}, {
				where: { companyId: global.signup.user.companyId },
				fields: ['ipAddress', 'geoLocation']
			});

		await models.user.update({
			clockedIn: false,
		}, {
				where: {
					userId: global.signup.user.userId
				},
				fields: ['clockedIn']
			});

		const split = global.signup.user.company.geoLocation.split(',');
		let result = await request(app)
			.post('/api/clockInOutById')
			.send({
				userId: global.signup.user.userId,
				geoLocation: {
					latitude: split[0],
					longitude: split[1]
				}
			});

		expect(result.statusCode).to.eq(200);
		expect(result.body.message).to.eq(`${global.signup.user.displayName}, has been clocked in.`)
	});

	it('should clock user multiple ip', async () => {
		await models.company.update({
			ipAddress: (await getIpAddress()) + ',fakeip',
		}, {
				where: { companyId: global.signup.user.companyId },
				fields: ['ipAddress', 'geoLocation']
			});

		await models.user.update({
			clockedIn: false,
		}, {
				where: {
					userId: global.signup.user.userId
				},
				fields: ['clockedIn']
			});

		const split = global.signup.user.company.geoLocation.split(',');
		let result = await request(app)
			.post('/api/clockInOutById')
			.send({
				userId: global.signup.user.userId,
			});

		expect(result.statusCode).to.eq(200);
		expect(result.body.message).to.eq(`${global.signup.user.displayName}, has been clocked in.`)
	});


	it('should not clock user, wrong creds', async () => {

		let result = await request(app)
			.post('/api/clockOut')
			.send({
				email: global.signup.user.email,
				password: '123456'
			});

		expect(result.statusCode).to.eq(403);
		expect(result.body.message).to.eq('Email or Password invalid!');
	});

	it('should not clock user out, already clocked out', async () => {
		await models.company.update({
			ipAddress: await getIpAddress(),
			geoLocation: '35.4456096,-120.8974328',
		}, {
				where: { companyId: global.signup.user.companyId },
				fields: ['ipAddress', 'geoLocation']
			});

		await models.user.update({
			clockedIn: false,
		}, {
				where: {
					userId: global.signup.user.userId
				},
				fields: ['clockedIn']
			});


		await models.userClock.destroy({ truncate: true });

		let result = await request(app)
			.post('/api/clockOut')
			.send({
				email: global.signup.user.email,
				password: '12345'
			});

		expect(result.statusCode).to.eq(409);
		expect(result.body.message).to.eq(`${global.signup.user.displayName}, is already clocked out, did you forget to clock in?`)
	});

	it('should not clock user in, already clocked in', async () => {
		await models.company.update({
			ipAddress: await getIpAddress(),
			geoLocation: '35.4456096,-120.8974328',
		}, {
				where: { companyId: global.signup.user.companyId },
				fields: ['ipAddress', 'geoLocation']
			});


		await models.user.update({
			clockedIn: true
		}, {
				where: { userId: global.signup.user.userId },
				fields: ['clockedIn']
			});

		let result = await request(app)
			.post('/api/clockIn')
			.send({
				email: global.signup.user.email,
				password: '12345'
			});

		expect(result.statusCode).to.eq(409);
		expect(result.body.message).to.eq(`${global.signup.user.displayName}, is already clocked in, did you forget to clock out?`)
	});

	it('should clock user out', async () => {
		await models.company.update({
			ipAddress: await getIpAddress(),
			geoLocation: '35.4456096,-120.8974328',
		}, {
				where: { companyId: global.signup.user.companyId },
				fields: ['ipAddress', 'geoLocation']
			});

		await models.user.update({
			clockedIn: true
		}, {
				where: { userId: global.signup.user.userId },
				fields: ['clockedIn']
			});

		let result = await request(app)
			.post('/api/clockOut')
			.send({
				email: global.signup.user.email,
				password: '12345'
			});

		expect(result.statusCode).to.eq(200);
		expect(result.body.message).to.eq(`${global.signup.user.displayName}, has been clocked out.`)
	});

	it('should clock user in', async () => {
		await models.company.update({
			ipAddress: await getIpAddress(),
			geoLocation: '35.4456096,-120.8974328',
		}, {
				where: { companyId: global.signup.user.companyId },
				fields: ['ipAddress', 'geoLocation']
			});

		await models.user.update({
			clockedIn: false,
		}, {
				where: {
					userId: global.signup.user.userId
				},
				fields: ['clockedIn']
			});

		let result = await request(app)
			.post('/api/clockIn')
			.send({
				email: global.signup.user.email,
				password: '12345'
			});

		expect(result.statusCode).to.eq(200);
		expect(result.body.message).to.eq(`${global.signup.user.displayName}, has been clocked in.`)
	});

	it('create in to out', async () => {
		await models.user.update({
			clockedIn: true,
		}, {
				where: {
					userId: global.signup.user.userId
				}
			});

		await models.userClock.destroy({ truncate: true });
		let result = await request(app)
			.post('/api/userClocks')
			.send({
				userId: global.signup.user.userId,
				clockInDate: new Date(),
				clockOutDate: new Date()
			});

		expect(result.statusCode).to.eq(201);

		const user = await models.user.findById(global.signup.user.userId);
		expect(user.clockedIn).to.eq(false);
	});

	it('create out to out', async () => {
		await models.user.update({
			clockedIn: false,
		}, {
				where: {
					userId: global.signup.user.userId
				}
			});

		await models.userClock.destroy({ truncate: true });
		let result = await request(app)
			.post('/api/userClocks')
			.send({
				userId: global.signup.user.userId,
				clockInDate: new Date(),
				clockOutDate: new Date()
			});

		expect(result.statusCode).to.eq(201);

		const user = await models.user.findById(global.signup.user.userId);
		expect(user.clockedIn).to.eq(false);
	});

	it('create in to in', async () => {
		await models.user.update({
			clockedIn: true,
		}, {
				where: {
					userId: global.signup.user.userId
				}
			});

		let result = await request(app)
			.post('/api/userClocks')
			.send({
				userId: global.signup.user.userId,
				clockInDate: new Date(),
			});

		expect(result.statusCode).to.eq(201);

		const user = await models.user.findById(global.signup.user.userId);
		expect(user.clockedIn).to.eq(true);
	});

	it('create out to in', async () => {
		await models.user.update({
			clockedIn: false,
		}, {
				where: {
					userId: global.signup.user.userId
				}
			});

		let result = await request(app)
			.post('/api/userClocks')
			.send({
				userId: global.signup.user.userId,
				clockInDate: new Date(),
			});

		expect(result.statusCode).to.eq(201);

		const user = await models.user.findById(global.signup.user.userId);
		expect(user.clockedIn).to.eq(true);
	});

	it('update in to out', async () => {
		await models.user.update({
			clockedIn: true,
		}, {
				where: {
					userId: global.signup.user.userId
				}
			});

		await models.userClock.destroy({ truncate: true });
		const curr = await models.userClock.create({
			userId: global.signup.user.userId,
			clockInDate: new Date(),
		})

		let result = await request(app)
			.put(`/api/userClocks/${curr.userClockId}`)
			.send({
				clockOutDate: new Date()
			});

		expect(result.statusCode).to.eq(200);

		const user = await models.user.findById(global.signup.user.userId);
		expect(user.clockedIn).to.eq(false);
	});

	it('update out to out', async () => {
		await models.user.update({
			clockedIn: false,
		}, {
				where: {
					userId: global.signup.user.userId
				}
			});

		await models.userClock.destroy({ truncate: true });
		const curr = await models.userClock.create({
			userId: global.signup.user.userId,
			clockInDate: new Date(),
		})

		let result = await request(app)
			.put(`/api/userClocks/${curr.userClockId}`)
			.send({
				clockOutDate: new Date()
			});

		expect(result.statusCode).to.eq(200);

		const user = await models.user.findById(global.signup.user.userId);
		expect(user.clockedIn).to.eq(false);
	});

	it('update in to in', async () => {
		await models.user.update({
			clockedIn: true,
		}, {
				where: {
					userId: global.signup.user.userId
				}
			});

		const curr = await models.userClock.create({
			userId: global.signup.user.userId,
			clockInDate: new Date(),
		})

		let result = await request(app)
			.put(`/api/userClocks/${curr.userClockId}`)
			.send({
				notes: 'test'
			});

		expect(result.statusCode).to.eq(200);

		const user = await models.user.findById(global.signup.user.userId);
		expect(user.clockedIn).to.eq(true);
	});

	it('update out to in', async () => {
		await models.user.update({
			clockedIn: false,
		}, {
				where: {
					userId: global.signup.user.userId
				}
			});

		const curr = await models.userClock.create({
			userId: global.signup.user.userId,
			clockInDate: new Date(),
		})

		let result = await request(app)
			.put(`/api/userClocks/${curr.userClockId}`)
			.send({
				notes: 'test'
			});

		expect(result.statusCode).to.eq(200);

		const user = await models.user.findById(global.signup.user.userId);
		expect(user.clockedIn).to.eq(true);
	});

	it('delete in to out', async () => {
		await models.user.update({
			clockedIn: true,
		}, {
				where: {
					userId: global.signup.user.userId
				}
			});
		await models.userClock.destroy({ truncate: true });

		const curr = await models.userClock.create({
			userId: global.signup.user.userId,
			clockInDate: new Date(),
		})

		let result = await request(app).delete(`/api/userClocks/${curr.userClockId}`)
		expect(result.statusCode).to.eq(204);

		const user = await models.user.findById(global.signup.user.userId);
		expect(user.clockedIn).to.eq(false);
	});

	it('delete out to out', async () => {
		await models.user.update({
			clockedIn: false,
		}, {
				where: {
					userId: global.signup.user.userId
				}
			});

		await models.userClock.destroy({ truncate: true });
		await models.userClock.create({
			userId: global.signup.user.userId,
			clockInDate: new Date(),
			clockOutDate: new Date(),
		});

		const curr = await models.userClock.create({
			userId: global.signup.user.userId,
			clockInDate: new Date(),
		})

		let result = await request(app).delete(`/api/userClocks/${curr.userClockId}`);
		expect(result.statusCode).to.eq(204);

		const user = await models.user.findById(global.signup.user.userId);
		expect(user.clockedIn).to.eq(false);
	});

	it('delete in to in', async () => {
		await models.user.update({
			clockedIn: true,
		}, {
				where: {
					userId: global.signup.user.userId
				}
			});

		await models.userClock.create({
			userId: global.signup.user.userId,
			clockInDate: new Date(),
		})

		const curr = await models.userClock.create({
			userId: global.signup.user.userId,
			clockInDate: new Date(),
		})

		let result = await request(app).delete(`/api/userClocks/${curr.userClockId}`);
		expect(result.statusCode).to.eq(204);

		const user = await models.user.findById(global.signup.user.userId);
		expect(user.clockedIn).to.eq(true);
	});

	it('delete out to in', async () => {
		await models.user.update({
			clockedIn: false,
		}, {
				where: {
					userId: global.signup.user.userId
				}
			});

		await models.userClock.create({
			userId: global.signup.user.userId,
			clockInDate: new Date(),
			clockOutDate: new Date(),
		})

		await models.userClock.create({
			userId: global.signup.user.userId,
			clockInDate: new Date(),
		});

		const curr = await models.userClock.create({
			userId: global.signup.user.userId,
			clockInDate: new Date(),
			clockOutDate: new Date()
		})

		let result = await request(app).delete(`/api/userClocks/${curr.userClockId}`)
		expect(result.statusCode).to.eq(204);

		const user = await models.user.findById(global.signup.user.userId);
		expect(user.clockedIn).to.eq(true);
	});


});