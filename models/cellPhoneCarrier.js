// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
const modelhelpers = require('../helpers/modelhelpers');
function defineModel(sequelize, DataTypes) {
	return sequelize.define('cell_phone_carrier', {
		'carrierName': {
			type: DataTypes.STRING,
			field: 'carrier_name',
			allowNull: false,
		},
		'cellPhoneCarrierId': {
			type: DataTypes.UUID,
			field: 'cell_phone_carrier_id',
			primaryKey: true,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
		},
		'companyId': {
			type: DataTypes.UUID,
			field: 'company_id',
			allowNull: false,
		},
		'domain': {
			type: DataTypes.STRING,
			field: 'domain',
			allowNull: false,
		},
		'updatedBy': {
			type: DataTypes.STRING,
			field: 'updated_by',
			allowNull: false,
		},
	},
	modelhelpers.getConfig(false, true));
}
function createAssociations(models) {
	models.cellPhoneCarrier.hasMany(models.user, {
		as: 'users',
		foreignKey: {
			name: 'cellPhoneCarrierId',
			field: 'cell_phone_carrier_id'
		},
		targetKey: 'cellPhoneCarrierId'
	});
	models.cellPhoneCarrier.belongsTo(models.company, {
		as: 'company',
		foreignKey: {
			name: 'companyId',
			field: 'company_id'
		},
		targetKey: 'companyId'
	});
}
module.exports = {
	defineModel,
	createAssociations	
};