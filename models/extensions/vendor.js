async function deleting(id, user, models) {
	const inventoryItem = await models.inventoryItem.findOne({
		where: {
			vendorId: id
		}
	})

	if (inventoryItem) {
		throw new Error('_409_Vendor is in use by one or more inventory items.');
	}
}

module.exports = {
	deleting,
}