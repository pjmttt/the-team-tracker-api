// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
const modelhelpers = require('../helpers/modelhelpers');
function defineModel(sequelize, DataTypes) {
	return sequelize.define('demo_request', {
		'companyName': {
			type: DataTypes.STRING,
			field: 'company_name',
			allowNull: false,
		},
		'demoRequestId': {
			type: DataTypes.UUID,
			field: 'demo_request_id',
			primaryKey: true,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
		},
		'email': {
			type: DataTypes.STRING,
			field: 'email',
			allowNull: false,
		},
		'firstName': {
			type: DataTypes.STRING,
			field: 'first_name',
			allowNull: false,
		},
		'lastName': {
			type: DataTypes.STRING,
			field: 'last_name',
			allowNull: false,
		},
		'phoneNumber': {
			type: DataTypes.STRING,
			field: 'phone_number',
			allowNull: true,
		},
	},
	modelhelpers.getConfig(true, false));
}
function createAssociations(models) {
}
module.exports = {
	defineModel,
	createAssociations	
};