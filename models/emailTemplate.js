// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
const modelhelpers = require('../helpers/modelhelpers');
function defineModel(sequelize, DataTypes) {
	return sequelize.define('email_template', {
		'body': {
			type: DataTypes.TEXT,
			field: 'body',
			allowNull: false,
		},
		'bodyText': {
			type: DataTypes.TEXT,
			field: 'body_text',
			allowNull: true,
		},
		'companyId': {
			type: DataTypes.UUID,
			field: 'company_id',
			allowNull: false,
		},
		'emailTemplateId': {
			type: DataTypes.UUID,
			field: 'email_template_id',
			primaryKey: true,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
		},
		'subject': {
			type: DataTypes.STRING,
			field: 'subject',
			allowNull: false,
		},
		'templateType': {
			type: DataTypes.INTEGER,
			field: 'template_type',
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
	models.emailTemplate.hasMany(models.status, {
		as: 'managerEmailTemplateStatuss',
		foreignKey: {
			name: 'managerEmailTemplateId',
			field: 'manager_email_template_id'
		},
		targetKey: 'emailTemplateId'
	});
	models.emailTemplate.belongsTo(models.company, {
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