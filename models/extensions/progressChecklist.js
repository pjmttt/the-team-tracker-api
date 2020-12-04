async function deleting(id, user, models) {
	const progressChecklists = await models.userProgressChecklist.findOne({
		where: {
			progressChecklistId: id
		}
	})

	if (progressChecklists) {
		throw new Error('_409_Progress checklist in use and cannot be deleted.');
	}
}

function getIncludes(models) {
	return {
		model: models.progressItem,
		as: 'progressItems',
		separate: true,
	};
}

module.exports = {
	deleting,
	getIncludes,
	saveChildren: ['progressItems'],
	deleteChildren: ['progressItems'],
}