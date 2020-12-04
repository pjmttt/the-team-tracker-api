async function creating(entry, user) {
	entry.enteredById = user.userId;
}

function format(invTrans) {
	if (invTrans.cost) {
		invTrans.cost = parseFloat(invTrans.cost);
	}
	return invTrans;
}


async function created(inventoryTransaction, user, models, transaction) {
	const inventoryItem = await models.inventoryItem.findById(inventoryTransaction.inventoryItemId, { raw: true });
	inventoryItem.quantityOnHand = parseFloat(inventoryItem.quantityOnHand || 0);
	inventoryItem.costOnHand = parseFloat(inventoryItem.costOnHand || 0);
	const avgCost = inventoryItem.quantityOnHand == 0 ? 0 : inventoryItem.costOnHand / inventoryItem.quantityOnHand;
	inventoryItem.quantityOnHand += parseFloat(inventoryTransaction.quantity);
	if (inventoryItem.quantityOnHand < 0) {
		inventoryItem.quantityOnHand = 0;
		inventoryItem.costOnHand = 0;
		await models.inventoryTransaction.update({
			quantityRemaining: 0
		}, {
				where: { inventoryItemId: inventoryItem.inventoryItemId },
				fields: ['quantityRemaining'],
				transaction
			})
	}
	else if (inventoryTransaction.quantity < 0) {
		// TODO: FIFO?
		// const unconsumed = await models.inventoryTransaction.findAll({
		// 	where: {
		// 		inventoryItemId: inventoryTransaction.inventoryItemId,
		// 		quantityRemaining: { $gt: 0 }
		// 	},
		// 	order: [
		// 		['transaction_date', 'ASC']
		// 	],
		// 	transaction
		// });
		// const qtyToDeduct = -1 * parseFloat(inventoryTransaction.quantity);
		// for (let c of unconsumed) {
		// 	const deduct = Math.min(parseFloat(c.quantity), qtyToDeduct);
		// 	const deductCost = deduct * parseFloat(c.costPer || 0);
		// 	inventoryItem.costOnHand -= deductCost;
		// 	qtyToDeduct -= deduct;
		// 	await models.inventoryTransaction.update({
		// 		quantityRemaining: parseFloat(c.quantity) - deduct
		// 	}, {
		// 			where: { inventoryTransactionId: c.inventoryTransactionId },
		// 			fields: ['quantityRemaining'],
		// 			transaction
		// 		});
		// 	if (qtyToDeduct <= 0) {
		// 		break;
		// 	}
		// }
		inventoryItem.costOnHand -= (avgCost * Math.abs(parseFloat(inventoryTransaction.quantity || 0)));
	}
	else {
		inventoryItem.costOnHand += parseFloat(inventoryTransaction.quantity) * parseFloat(inventoryTransaction.costPer || 0);
	}
	result = await models.inventoryItem.update({
		quantityOnHand: inventoryItem.quantityOnHand,
		costOnHand: inventoryItem.costOnHand,
		updatedBy: user.email
	}, {
			where: { inventoryItemId: inventoryItem.inventoryItemId },
			fields: ['quantityOnHand', 'costOnHand', 'updatedBy'],
			transaction
		});
}

module.exports = {
	created,
	format
}