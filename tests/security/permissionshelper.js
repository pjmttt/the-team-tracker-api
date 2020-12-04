const expect = require('chai').expect;
const JWT_KEY = "!!TE4M_TRACK3R!!";
const jwt = require('jsonwebtoken');
const testhelpers = require('../testhelpers');
const request = require('supertest');
const app = require('../../server');
const guid = require('../../utils/guid');

async function getUserWithRolesJWT(roles) {
	const models = require('../../models');
	const usr = global.signup.user;
	const results = await request(app)
		.post('/api/users')
		.set('access-token', jwt.sign({ email: usr.email, rememberMe: true }, JWT_KEY))
		.send({
			email: `eml${guid()}`,
			firstName: 'test',
			lastName: 'user',
			companyId: usr.companyId,
			roles
		});

	expect(results.statusCode).to.eq(201);

	return Promise.resolve({ accessToken: jwt.sign({ email: results.body.email, rememberMe: true }, JWT_KEY), user: results.body });
}

async function testSecurity(roles, url, method, params, expectedResult) {
	let result = null;

	let func = null;
	switch (method) {
		case 'GET':
			func = request(app).get;
			break;
		case 'POST':
			func = request(app).post;
			break;
		case 'PUT':
			func = request(app).put;
			break;
		case 'DELETE':
			func = request(app).delete;
			break;
	}

	let jwtRoles = [];
	if (roles.length < 1) {
		jwtRoles.push({ jwt: await getUserWithRolesJWT([]), role: 'none' });
	}
	else {
		for (let r of roles) {
			jwtRoles.push({ jwt: await getUserWithRolesJWT([r]), role: r });
		}
	}
	for (let jwtRole of jwtRoles) {
		let promise = func(`/api/${url}`).set('access-token', jwtRole.jwt.accessToken);
		if (params) promise = promise.send(params);
		result = await promise;

		if (result.statusCode !== expectedResult)
			console.log(
				'=====> Unexpected status code',
				`Expected: ${expectedResult} | Real: ${result.statusCode}`,
				'Body: ',
				result.body
			);

		expect(result.statusCode, `URL: ${url} - ${method} - ${jwtRole.role}`).to.eq(expectedResult);
	}
	return result.body;
}

module.exports = {
	testSecurity,
	getUserWithRolesJWT,
}