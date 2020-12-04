async function deleting(id, user, models) {
	const inventoryItem = await models.inventoryItem.findOne({
		where: {
			inventoryCategoryId: id
		}
	})

	if (inventoryItem) {
		throw new Error('_409_Category is in use by one or more inventory items.');
	}
}

module.exports = {
	deleting,
}