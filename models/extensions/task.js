function getWhere(req, res) {
	return {
		taskType: req.url.indexOf('general') >= 0 ? 1 : 0
	};
}

function getIncludes(models) {
	return {
		model: models.subtask,
		as: 'subtasks',
		separate: true,
	};
}

module.exports = {
	getIncludes,
	saveChildren: ['subtasks'],
	deleteChildren: ['subtasks'],
	getWhere,
}