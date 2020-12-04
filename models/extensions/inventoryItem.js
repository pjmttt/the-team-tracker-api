const emailhelper = require('../../helpers/emailhelper');
const constants = require('../constants');
const sequelize = require('sequelize');
const defaults = require('../../helpers/defaults');
const h2p = require('html2plaintext');

function format(inventoryItem) {
	if (inventoryItem.costOnHand) {
		inventoryItem.costOnHand = parseFloat(inventoryItem.costOnHand);
	}
	return inventoryItem;
}

async function created(inventoryItem, user, models, transaction) {
	if (inventoryItem.quantityOnHand) {
		const invTrans = {
			transactionDate: new Date(),
			transactionType: constants.TRANSACTION_TYPE.RECONCILIATION,
			quantity: inventoryItem.quantityOnHand,
			inventoryItemId: inventoryItem.inventoryItemId,
			updatedBy: user.email,
		}
		await models.inventoryTransaction.create(invTrans, { transaction });
	}
}

async function updating(id, prev, item, user, models, transaction, req, res) {
	if (item.quantityOnHand != prev.quantityOnHand) {
		item.lastUpdated = new Date();
	}
}

function replaceTemplate(template, inventoryItem) {
	return template
		.replace(/\[InventoryItemName\]/g, inventoryItem.inventoryItemName)
		.replace(/\[QuantityOnHand\]/g, inventoryItem.quantityOnHand)
		.replace(/\[MinimumQuantity\]/g, inventoryItem.minimumQuantity)
		;
}

async function updated(id, inventoryItem, previous, user, models, transaction) {
	// TODO: adjust cost?
	const currOnHand = inventoryItem.quantityOnHand || 0;
	const prevOnHand = previous.quantityOnHand || 0;
	const diff = currOnHand - prevOnHand;
	if (diff != 0) {
		const invTrans = {
			transactionDate: new Date(),
			transactionType: constants.TRANSACTION_TYPE.RECONCILIATION,
			quantity: diff,
			inventoryItemId: inventoryItem.inventoryItemId,
			updatedBy: user.email,
		}
		await models.inventoryTransaction.create(invTrans, { transaction });

		if (inventoryItem.minimumQuantity && prevOnHand >= inventoryItem.minimumQuantity && currOnHand < inventoryItem.minimumQuantity) {
			const emailTemplate = await defaults.getEmailTemplate(models, constants.EMAIL_TEMPLATE_TYPE.inventoryNeeded, user.companyId, user.userId);

			const toNotify = await models.user.findAll({
				include: {
					model: models.cellPhoneCarrier, as: 'cellPhoneCarrier'
				},
				where: {
					[sequelize.Op.or]: [
						{ roles: { [sequelize.Op.contains]: [constants.ROLE.INVENTORY.value] } },
						{ roles: { [sequelize.Op.contains]: [constants.ROLE.ADMIN.value] } },
					],
					companyId: user.companyId,
					isFired: false,
				}
			});

			const subject = replaceTemplate(emailTemplate.subject, inventoryItem);
			const body = replaceTemplate(emailTemplate.body, inventoryItem);
			const textBody = replaceTemplate(emailTemplate.bodyText || h2p(emailTemplate.body), inventoryItem);

			const emailNotify = toNotify.filter(n => n.enableEmailNotifications
				&& n.emailNotifications.indexOf(constants.NOTIFICATION.INVENTORY.value) >= 0);
			if (emailNotify.length) {
				await emailhelper.sendEmail(emailNotify.map(n => n.email),
					subject, body, user.email, true, false, null, inventoryItem.inventoryItemId);
			}

			const textNotify = toNotify.filter(n => n.enableTextNotifications
				&& n.phoneNumber && n.cellPhoneCarrier && n.textNotifications.indexOf(constants.NOTIFICATION.INVENTORY.value) >= 0);
			if (textNotify.length > 0) {
				await emailhelper.sendEmail(textNotify.map(n => `${n.phoneNumber.replace(/\D/g, '')}@${n.cellPhoneCarrier.domain}`), null,
					(textBody || h2p(body)), user.email, true, true, null, inventoryItem.inventoryItemId);
			}
		}
	}
}

function getWhere(req, res) {
	let where = {};

	if (req.query.neededOnly) {
		where.quantityOnHand = { [sequelize.Op.lt]: sequelize.col('minimum_quantity') };
	}

	return where;
}

module.exports = {
	includes: ['vendor'],
	updating,
	updated,
	created,
	format,
	getWhere,
}