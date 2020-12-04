// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
const modelhelpers = require('../helpers/modelhelpers');
function defineModel(sequelize, DataTypes) {
	return sequelize.define('pay_rate', {
		'companyId': {
			type: DataTypes.UUID,
			field: 'company_id',
			allowNull: false,
		},
		'description': {
			type: DataTypes.STRING,
			field: 'description',
			allowNull: false,
		},
		'payRateId': {
			type: DataTypes.UUID,
			field: 'pay_rate_id',
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
	models.payRate.hasMany(models.user, {
		as: 'users',
		foreignKey: {
			name: 'payRateId',
			field: 'pay_rate_id'
		},
		targetKey: 'payRateId'
	});
	models.payRate.belongsTo(models.company, {
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