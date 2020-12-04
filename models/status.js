// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
const modelhelpers = require('../helpers/modelhelpers');
function defineModel(sequelize, DataTypes) {
	return sequelize.define('status', {
		'abbreviation': {
			type: DataTypes.STRING,
			field: 'abbreviation',
			allowNull: false,
		},
		'backgroundColor': {
			type: DataTypes.STRING,
			field: 'background_color',
			allowNull: true,
		},
		'companyId': {
			type: DataTypes.UUID,
			field: 'company_id',
			allowNull: false,
		},
		'managerEmailTemplateId': {
			type: DataTypes.UUID,
			field: 'manager_email_template_id',
			allowNull: true,
		},
		'notifyManagerAfter': {
			type: DataTypes.INTEGER,
			field: 'notify_manager_after',
			allowNull: true,
		},
		'statusId': {
			type: DataTypes.UUID,
			field: 'status_id',
			primaryKey: true,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
		},
		'statusName': {
			type: DataTypes.STRING,
			field: 'status_name',
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
			allowNull: true,
		},
	},
	modelhelpers.getConfig(false, true));
}
function createAssociations(models) {
	models.status.hasMany(models.entrySubtask, {
		as: 'entrySubtasks',
		foreignKey: {
			name: 'statusId',
			field: 'status_id'
		},
		targetKey: 'statusId'
	});
	models.status.hasMany(models.userSubtask, {
		as: 'userSubtasks',
		foreignKey: {
			name: 'statusId',
			field: 'status_id'
		},
		targetKey: 'statusId'
	});
	models.status.belongsTo(models.company, {
		as: 'company',
		foreignKey: {
			name: 'companyId',
			field: 'company_id'
		},
		targetKey: 'companyId'
	});
	models.status.belongsTo(models.emailTemplate, {
		as: 'managerEmailTemplate',
		foreignKey: {
			name: 'managerEmailTemplateId',
			field: 'manager_email_template_id'
		},
		targetKey: 'emailTemplateId'
	});
}
module.exports = {
	defineModel,
	createAssociations	
};