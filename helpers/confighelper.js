const sequelize = require('sequelize');
const encrypter = require('./encrypter');
const modelhelpers = require('./modelhelpers');

const encryptpw = '!!LUCK4_$MTP!!';

async function updateEmailTemplates(templates, req, res) {
	const models = require('../models');
	const results = [];
	for (let t of templates) {
		const curr = await models.emailTemplate.findOne({
			where: {
				templateType: t.templateType,
				companyId: res.locals.user.companyId
			}
		});

		if (curr) {
			const result = await models.emailTemplate.update({
				subject: t.subject,
				body: t.body
			}, {
					where: { templateType: t.templateType, updatedBy: res.locals.user.email },
					fields: ['subject', 'body', 'updatedBy'],
					returning: true,
				});
			results.push(modelhelpers.getFormattedResult(result[1][0], models.emailTemplate, req, res));
		}
		else {
			const result = await models.emailTemplate.create({
				companyId: res.locals.user.companyId,
				subject: t.subject,
				body: t.body,
				updatedBy: res.locals.user.email,
				templateType: t.templateType,
			});
			results.push(modelhelpers.getFormattedResult(result, models.emailTemplate, req, res));
		}
	}
	return Promise.resolve(results);
}

function getDecryptedSMTPPassword(encrypted) {
	return encrypter.decrypt(encryptpw, encrypted);
}

module.exports = {
	getDecryptedSMTPPassword,
	updateEmailTemplates,
}