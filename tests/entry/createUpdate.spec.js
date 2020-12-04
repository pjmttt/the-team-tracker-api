const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../server');
const testhelpers = require('../testhelpers');

const url = '/api/entries';
const lookupsUrl = '/api/lookups';

describe('Testing creating entries:', function () {
	function checkEmail(params, email) {
		// TODO
	}
	it('create all with statuses', async () => {
		const lookups = (await request(app).get(lookupsUrl)).body;

		const usr = await testhelpers.createUser({ enableTextNotifications: true });
		const task = lookups.tasks[Math.floor(Math.random() * lookups.tasks.length)];
		let status = lookups.statuses.find(s => s.statusName == 'Complete');

		const params = {
			entryDate: new Date(),
			taskId: task.taskId,
			shiftId: lookups.shifts[Math.floor(Math.random() * lookups.shifts.length)].shiftId,
			userId: usr.userId,
			enteredById: lookups.users[Math.floor(Math.random() * lookups.users.length)].userId,
			comments: 'Test entry comments',
			entrySubtasks: [],
		};

		for (let st of task.subtasks) {
			params.entrySubtasks.push({
				statusId: status.statusId,
				subtaskId: st.subtaskId
			});
		}

		let res = await request(app).post(url).send(params);
		expect(res.statusCode).to.eq(201);

		let emails = await testhelpers.getEmails();
		expect(emails.length).to.eq(0);
		// expect(emails.length).to.eq(1);
		// checkEmail(params, emails[0]);

		// await testhelpers.deleteEmails();

		const id = res.body.entryId;

		let entry = (await request(app).get(`${url}/${id}`)).body;
		for (let es of entry.entrySubtasks) {
			es.addressed = true;
		}

		res = await request(app).put(`${url}/${id}`).send(entry);
		expect(res.statusCode).to.eq(200);

		emails = await testhelpers.getEmails();
		expect(emails.length).to.eq(0);

		entry = (await request(app).get(`${url}/${id}`)).body;

		status = await testhelpers.createStatus();
		for (let es of entry.entrySubtasks) {
			es.statusId = status.statusId
		}

		res = await request(app).put(`${url}/${id}`).send(entry);
		expect(res.statusCode).to.eq(200);

		emails = await testhelpers.getEmails();
		expect(emails.length).to.eq(0);
		// expect(emails.length).to.eq(1);
		// checkEmail(params, emails[0]);

		// await testhelpers.deleteEmails();

		for (let es of entry.entrySubtasks) {
			es.comments = 'test';
		}

		res = await request(app).put(`${url}/${id}`).send(entry);
		expect(res.statusCode).to.eq(200);

		emails = await testhelpers.getEmails();
		expect(emails.length).to.eq(0);
		// expect(emails.length).to.eq(1);
		// checkEmail(params, emails[0]);

	});

	it('create with some statuses then update', async () => {
		const lookups = (await request(app).get(lookupsUrl)).body;

		const usr = await testhelpers.createUser({ enableEmailNotifications: true, enableTextNotifications: true });
		const task = lookups.tasks[Math.floor(Math.random() * lookups.tasks.length)];
		let status = lookups.statuses.find(s => s.statusName == 'Complete');

		const params = {
			entryDate: new Date(),
			taskId: task.taskId,
			shiftId: lookups.shifts[Math.floor(Math.random() * lookups.shifts.length)].shiftId,
			userId: usr.userId,
			enteredById: lookups.users[Math.floor(Math.random() * lookups.users.length)].userId,
			comments: 'Test entry comments',
			entrySubtasks: [],
		};

		for (let i = 0; i < task.subtasks.length; i++) {
			params.entrySubtasks.push({
				statusId: i == 0 ? null : status.statusId,
				subtaskId: task.subtasks[i].subtaskId
			});
		}

		let res = await request(app).post(url).send(params);
		expect(res.statusCode).to.eq(201);

		let emails = await testhelpers.getEmails();
		expect(emails.length).to.eq(0);

		const id = res.body.entryId;
		let entry = (await request(app).get(`${url}/${id}`)).body;
		expect((entry.entrySubtasks).length).to.eq(task.subtasks.length);


		let entrySubtasks = entry.entrySubtasks.slice();
		entrySubtasks.sort((es) => {
			if (!es.status) return 1;
			return 0;
		});
		for (let i = 0; i < 3; i++) {
			entrySubtasks[i].statusId = lookups.statuses[Math.floor(Math.random() * lookups.statuses.length)].statusId;
		}
		res = await request(app).put(`${url}/${id}`).send({
			entrySubtasks
		});
		expect(res.statusCode).to.eq(200);

		emails = await testhelpers.getEmails();
		expect(emails.length).to.eq(0);

		entry = (await request(app).get(`${url}/${id}`)).body;
		expect((entry.entrySubtasks).length).to.eq(task.subtasks.length);

		entrySubtasks[3].statusId = lookups.statuses[Math.floor(Math.random() * lookups.statuses.length)].statusId;
		res = await request(app).put(`${url}/${id}`).send({
			entrySubtasks: entrySubtasks.slice(0, 3)
		});
		expect(res.statusCode).to.eq(200);

		emails = await testhelpers.getEmails();
		expect(emails.length).to.eq(0);

		entry = (await request(app).get(`${url}/${id}`)).body;
		expect((entry.entrySubtasks).length).to.eq(task.subtasks.length);

		for (let es of entrySubtasks) {
			es.statusId = status.statusId;
		}

		res = await request(app).put(`${url}/${id}`).send({
			entrySubtasks
		});
		expect(res.statusCode).to.eq(200);

		emails = await testhelpers.getEmails();
		expect(emails.length).to.eq(0);
		// expect(emails.length).to.eq(2);
		// checkEmail(params, emails[0]);
		// checkEmail(params, emails[1]);

		entry = (await request(app).get(`${url}/${id}`)).body;
		expect((entry.entrySubtasks).length).to.eq(task.subtasks.length);
	});
});