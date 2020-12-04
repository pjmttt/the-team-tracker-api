// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
const modelhelpers = require('../helpers/modelhelpers');
function defineModel(sequelize, DataTypes) {
	return sequelize.define('schedule_template', {
		'companyId': {
			type: DataTypes.UUID,
			field: 'company_id',
			allowNull: false,
		},
		'scheduleTemplateId': {
			type: DataTypes.UUID,
			field: 'schedule_template_id',
			primaryKey: true,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
		},
		'templateName': {
			type: DataTypes.STRING,
			field: 'template_name',
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
	models.scheduleTemplate.hasMany(models.schedule, {
		as: 'schedules',
		foreignKey: {
			name: 'scheduleTemplateId',
			field: 'schedule_template_id'
		},
		targetKey: 'scheduleTemplateId'
	});
	models.scheduleTemplate.belongsTo(models.company, {
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