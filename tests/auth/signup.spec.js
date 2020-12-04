const expect = require('chai').expect;
const models = require('../../models');
const fs = require('fs-extra');
const resolve = require('path').resolve;
const testhelpers = require('../testhelpers');

describe('Testing login', function () {
	async function testData(jsonObjs, model, file) {
		if (file == "user.json") return;
		let include = null;
		let data = await model.findAll({ raw: true });
		if (file == "emailTemplate.json") {
			data = data.filter(d => d.templateType != 1);
		}
		// else if (file == "user.json") {
		// 	data = data.filter(d => d.lastName == '1');
		// }
		expect(data.length, file).to.eq(jsonObjs.length);
		// TODO: FKs
		// if (file == "inventoryItem.json") return;
		// for (let o of jsonObjs) {
		// 	let filtered = data.slice();
		// 	for (let f of Object.keys(o)) {
		// 		const oval = o[f];
		// 		console.log(f, oval);
		// 		if (!Array.isArray(oval) && typeof oval !== 'object')
		// 			filtered = filtered.filter(x => x[f] === o[f]);
		// 	}
		// 	if (filtered.length > 1)
		// 		console.log("F:", filtered);
		// 	expect(filtered.length, file).to.eq(1);
		// }
	}

	it('default data', async () => {
		await testhelpers.deleteData();
		global.signup = await testhelpers.signup(true);
		const dir = resolve(__dirname, "../../data");
		const files = fs.readdirSync(dir);
		for (let f of files) {
			const jsonObjs = require(resolve(dir, f));
			const model = models[f.replace(".json", "")];
			await testData(jsonObjs, model, f);
		}
	});

});