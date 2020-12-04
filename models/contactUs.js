// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
const modelhelpers = require('../helpers/modelhelpers');
function defineModel(sequelize, DataTypes) {
	return sequelize.define('contact_us', {
		'contactUsId': {
			type: DataTypes.UUID,
			field: 'contact_us_id',
			primaryKey: true,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
		},
		'message': {
			type: DataTypes.STRING,
			field: 'message',
			allowNull: false,
		},
		'userId': {
			type: DataTypes.UUID,
			field: 'user_id',
			allowNull: false,
		},
	},
	modelhelpers.getConfig(false, true));
}
function createAssociations(models) {
}
module.exports = {
	defineModel,
	createAssociations	
};