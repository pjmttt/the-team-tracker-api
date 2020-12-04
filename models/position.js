// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
const modelhelpers = require('../helpers/modelhelpers');
function defineModel(sequelize, DataTypes) {
	return sequelize.define('position', {
		'companyId': {
			type: DataTypes.UUID,
			field: 'company_id',
			allowNull: false,
		},
		'positionId': {
			type: DataTypes.UUID,
			field: 'position_id',
			primaryKey: true,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
		},
		'positionName': {
			type: DataTypes.STRING,
			field: 'position_name',
			allowNull: false,
		},
		'textColor': {
			type: DataTypes.STRING,
			field: 'text_color',
			allowNull: true,
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
	models.position.hasMany(models.user, {
		as: 'users',
		foreignKey: {
			name: 'positionId',
			field: 'position_id'
		},
		targetKey: 'positionId'
	});
	models.position.belongsTo(models.company, {
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