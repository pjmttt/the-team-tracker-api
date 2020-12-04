// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
const modelhelpers = require('../helpers/modelhelpers');
function defineModel(sequelize, DataTypes) {
	return sequelize.define('inventory_transaction', {
		'comments': {
			type: DataTypes.STRING,
			field: 'comments',
			allowNull: true,
		},
		'costPer': {
			type: DataTypes.NUMERIC,
			field: 'cost_per',
			allowNull: true,
		},
		'enteredById': {
			type: DataTypes.UUID,
			field: 'entered_by_id',
			allowNull: true,
		},
		'inventoryItemId': {
			type: DataTypes.UUID,
			field: 'inventory_item_id',
			allowNull: false,
		},
		'inventoryTransactionId': {
			type: DataTypes.UUID,
			field: 'inventory_transaction_id',
			primaryKey: true,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
		},
		'quantity': {
			type: DataTypes.INTEGER,
			field: 'quantity',
			allowNull: false,
		},
		'quantityRemaining': {
			type: DataTypes.NUMERIC,
			field: 'quantity_remaining',
			allowNull: false,
			defaultValue: 0,
		},
		'transactionDate': {
			type: DataTypes.DATE,
			field: 'transaction_date',
			allowNull: false,
		},
		'transactionType': {
			type: DataTypes.INTEGER,
			field: 'transaction_type',
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
			allowNull: true,
		},
	},
	modelhelpers.getConfig(false, true));
}
function createAssociations(models) {
	models.inventoryTransaction.belongsTo(models.inventoryItem, {
		as: 'inventoryItem',
		foreignKey: {
			name: 'inventoryItemId',
			field: 'inventory_item_id'
		},
		targetKey: 'inventoryItemId'
	});
	models.inventoryTransaction.belongsTo(models.user, {
		as: 'enteredBy',
		foreignKey: {
			name: 'enteredById',
			field: 'entered_by_id'
		},
		targetKey: 'userId'
	});
	models.inventoryTransaction.belongsTo(models.vendor, {
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