// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
const modelhelpers = require('../helpers/modelhelpers');

function defineModel(sequelize, DataTypes) {
	return sequelize.define('position_reports_to', {,
	},
	modelhelpers.getConfig());
}

function createAssociations(models) {
}

module.exports = {
	defineModel,
	createAssociations	
};