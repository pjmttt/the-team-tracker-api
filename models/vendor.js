// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
const modelhelpers = require('../helpers/modelhelpers');
function defineModel(sequelize, DataTypes) {
	return sequelize.define('vendor', {
		'companyId': {
			type: DataTypes.UUID,
			field: 'company_id',
			allowNull: false,
		},
		'updatedBy': {
			type: DataTypes.STRING,
			field: 'updated_by',
			allowNull: false,
		},
		'vendorId': {
			type: DataTypes.UUID,
			field: 'vendor_id',
			primaryKey: true,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
		},
		'vendorName': {
			type: DataTypes.STRING,
			field: 'vendor_name',
			allowNull: false,
		},
	},
	modelhelpers.getConfig(false, true));
}
function createAssociations(models) {
	models.vendor.hasMany(models.inventoryItem, {
		as: 'inventoryItems',
		foreignKey: {
			name: 'vendorId',
			field: 'vendor_id'
		},
		targetKey: 'vendorId'
	});
	models.vendor.hasMany(models.inventoryTransaction, {
		as: 'inventoryTransactions',
		foreignKey: {
			name: 'vendorId',
			field: 'vendor_id'
		},
		targetKey: 'vendorId'
	});
	models.vendor.belongsTo(models.company, {
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