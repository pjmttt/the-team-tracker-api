
function getConfig(noTimestamps, paranoid) {
	let config = {};
	config.freezeTableName = true;
	config.underscored = true;
	if (noTimestamps) {
		config.timestamps = false;
	}
	config.paranoid = paranoid;
	return config;
}

function getFormattedResult(result, model, req, res, includeDeleted) {
	if (!result) return result;
	let val = result.get ? result.get() : result;
	if (model.format)
		val = model.format(val, req, res, model);
	delete val.created_at;
	delete val.updated_at;
	if (includeDeleted)
		val.inactive = val.deleted_at != null;
	delete val.deleted_at;
	delete val.updatedBy;
	if (model.includes) {
		for (let i of model.includes) {
			if (val[i]) {
				const targetModel = Object.keys(model.associations).find(k => model.associations[k].as == i);
				val[i] = getFormattedResult(val[i], model.associations[targetModel].target, req, res);
			}
		}
	}
	return val;
}

module.exports = {
	getConfig,
	getFormattedResult,
}