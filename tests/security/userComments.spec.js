const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../server');
const testhelpers = require('../testhelpers');
const permissionshelper = require('./permissionshelper');

describe('UserComments security:', function () {
	it('get userComments', async () => {
		const url = `userComments`;
		await permissionshelper.testSecurity([], url, 'GET', null, 200);
		await permissionshelper.testSecurity([100, 500, 900, 1000], url, 'GET', null, 200);
		await permissionshelper.testSecurity([600], url, 'GET', null, 200);
	});

	it('post userComments', async () => {
		const user = await testhelpers.createUser({ roles: [] });
		let params = {
			comment: "test comment",
			commentDate: new Date(),
			userId: user.userId
		};

		const url = `userComments`;
		await permissionshelper.testSecurity([], url, 'POST', params, 201);
	});

	it('put userComments', async () => {
		const userComment = await testhelpers.createUserComment();

		let params = {};

		const url = `userComments/${userComment.userCommentId}`;
		await permissionshelper.testSecurity([], url, 'PUT', params, 403);
		await permissionshelper.testSecurity([100, 500, 900, 1000], url, 'PUT', params, 403);
		await permissionshelper.testSecurity([600], url, 'PUT', params, 200);
	});

	it('delete userComments', async () => {
		let userComment = await testhelpers.createUserComment();
		let url = `userComments/${userComment.userCommentId}`;
		await permissionshelper.testSecurity([], url, 'DELETE', null, 403);
		await permissionshelper.testSecurity([100, 500, 900, 1000], url, 'DELETE', null, 403);
		await permissionshelper.testSecurity([600], url, 'DELETE', null, 204);
	});
});