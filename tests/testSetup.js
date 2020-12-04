const models = require('../models');
const testhelpers = require('./testhelpers');

beforeEach(async () => {
	await testhelpers.deleteEmails();
})

before(async () => {
	await testhelpers.deleteData();
	global.signup = await testhelpers.signup(true);
})

afterEach(async () => {
	await models.user.destroy({
		where: {
			companyId: global.signup.user.companyId,
			lastName: { $ne: '1' },
			userId: { $ne: global.signup.user.userId }
		}
	})
})

after(async () => {
	await testhelpers.deleteData();
	setTimeout(() =>
		process.exit(), 1000);
});
