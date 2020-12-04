// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
const modelhelpers = require('../helpers/modelhelpers');
function defineModel(sequelize, DataTypes) {
	return sequelize.define('inventory_category', {
		'categoryName': {
			type: DataTypes.STRING,
			field: 'category_name',
			allowNull: false,
		},
		'companyId': {
			type: DataTypes.UUID,
			field: 'company_id',
			allowNull: false,
		},
		'inventoryCategoryId': {
			type: DataTypes.UUID,
			field: 'inventory_category_id',
			primaryKey: true,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
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
	models.inventoryCategory.hasMany(models.inventoryItem, {
		as: 'inventoryItems',
		foreignKey: {
			name: 'inventoryCategoryId',
			field: 'inventory_category_id'
		},
		targetKey: 'inventoryCategoryId'
	});
	models.inventoryCategory.belongsTo(models.company, {
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