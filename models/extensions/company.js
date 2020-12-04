const tryUpdateGeo = require('../../utils/location').tryUpdateGeo;
const guid = require('../../utils/guid');
const ROLE = require('../constants').ROLE;
const moment = require('moment');

function deleteSubscriptionInfo(company) {
	delete company.subscriptionRequestNumber;
	delete company.subscriptionTransactionNumber;
	delete company.expirationDate;
}

async function creating(company, user, models, transaction, req, res) {
	throw '_409_Create companies through signup';
}

async function updating(id, prev, item, user, models, transaction, req, res) {
	deleteSubscriptionInfo(item);
	await tryUpdateGeo(item, req);
}

async function requestSubscription(modules, models, res) {
	if (res.locals.user.roles.indexOf(ROLE.ADMIN.value) < 0) {
		throw new Error('_403_Unauthorized!');
	}
	const co = await models.company.findById(res.locals.user.companyId, {
		include: {
			model: models.user,
			as: 'users',
			where: { isFired: false }
		}
	});
	let moduleNumbers = [];
	if (modules.all) {
		moduleNumbers = [0,1,2,3];
	}
	else {
		if (modules.duties) moduleNumbers.push(0);
		if (modules.scheduling) moduleNumbers.push(1);
		if (modules.inventory) moduleNumbers.push(2);
		if (modules.maintenance) moduleNumbers.push(3);
	}
	const subscriptionRequestNumber = guid();
	const results = await models.company.update({
		subscriptionRequestNumber,
		modules: moduleNumbers,
	}, {
			where: { companyId: res.locals.user.companyId },
			fields: ['subscriptionRequestNumber', 'modules', 'subscriptionTransactionNumber'],
			returning: true,
		});
	return results[1][0];
}

async function processPayment(subscriptionRequestNumber, subscriptionTransactionNumber, models, res) {
	const co = await models.company.findOne({
		where: {
			companyId: res.locals.user.companyId,
			subscriptionRequestNumber
		}
	});
	let expDate = moment(co.expirationDate);
	const now = moment();
	if (expDate.isBefore(now))
		expDate = now;
	expDate = expDate.add(co.subscriptionDuration, 'months');

	const updated = await models.company.update({
		subscriptionRequestNumber: null,
		subscriptionTransactionNumber,
		expirationDate: expDate.toDate(),
	}, {
			where: { companyId: res.locals.user.companyId, subscriptionRequestNumber },
			fields: ['subscriptionRequestNumber', 'subscriptionTransactionNumber', 'expirationDate'],
			returning: true,
		});
	return updated[1][0];
}

module.exports = {
	creating,
	updating,
	requestSubscription,
	processPayment,
	deleteSubscriptionInfo,
}