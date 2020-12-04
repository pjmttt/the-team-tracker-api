// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
const modelhelpers = require('../helpers/modelhelpers');
function defineModel(sequelize, DataTypes) {
	return sequelize.define('inventory_item', {
		'companyId': {
			type: DataTypes.UUID,
			field: 'company_id',
			allowNull: false,
		},
		'costOnHand': {
			type: DataTypes.NUMERIC,
			field: 'cost_on_hand',
			allowNull: true,
		},
		'expirationDate': {
			type: DataTypes.DATEONLY,
			field: 'expiration_date',
			allowNull: true,
		},
		'inventoryCategoryId': {
			type: DataTypes.UUID,
			field: 'inventory_category_id',
			allowNull: false,
		},
		'inventoryItemId': {
			type: DataTypes.UUID,
			field: 'inventory_item_id',
			primaryKey: true,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
		},
		'inventoryItemName': {
			type: DataTypes.STRING,
			field: 'inventory_item_name',
			allowNull: false,
		},
		'lastUpdated': {
			type: DataTypes.DATE,
			field: 'last_updated',
			allowNull: true,
		},
		'minimumQuantity': {
			type: DataTypes.INTEGER,
			field: 'minimum_quantity',
			allowNull: true,
		},
		'notes': {
			type: DataTypes.STRING,
			field: 'notes',
			allowNull: true,
		},
		'quantityOnHand': {
			type: DataTypes.INTEGER,
			field: 'quantity_on_hand',
			allowNull: true,
		},
		'unitCost': {
			type: DataTypes.NUMERIC,
			field: 'unit_cost',
			allowNull: true,
		},
		'vendorId': {
			type: DataTypes.UUID,
			field: 'vendor_id',
			allowNull: true,
		},
	},
	modelhelpers.getConfig(false, true));
}
function createAssociations(models) {
	models.inventoryItem.hasMany(models.inventoryTransaction, {
		as: 'inventoryTransactions',
		foreignKey: {
			name: 'inventoryItemId',
			field: 'inventory_item_id'
		},
		targetKey: 'inventoryItemId'
	});
	models.inventoryItem.belongsTo(models.company, {
		as: 'company',
		foreignKey: {
			name: 'companyId',
			field: 'company_id'
		},
		targetKey: 'companyId'
	});
	models.inventoryItem.belongsTo(models.inventoryCategory, {
		as: 'inventoryCategory',
		foreignKey: {
			name: 'inventoryCategoryId',
			field: 'inventory_category_id'
		},
		targetKey: 'inventoryCategoryId'
	});
	models.inventoryItem.belongsTo(models.vendor, {
		as: 'vendor',
		foreignKey: {
			name: 'vendorId',
			field: 'vendor_id'
		},
		targetKey: 'vendorId'
	});
}
module.exports = {
	defineModel,
	createAssociations	
};