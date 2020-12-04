// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
const modelhelpers = require('../helpers/modelhelpers');
function defineModel(sequelize, DataTypes) {
	return sequelize.define('document', {
		'companyId': {
			type: DataTypes.UUID,
			field: 'company_id',
			allowNull: false,
		},
		'documentId': {
			type: DataTypes.UUID,
			field: 'document_id',
			primaryKey: true,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
		},
		'documentName': {
			type: DataTypes.STRING,
			field: 'document_name',
			allowNull: false,
		},
		'mimeType': {
			type: DataTypes.STRING,
			field: 'mime_type',
			allowNull: true,
		},
		'positions': {
			type: DataTypes.ARRAY(DataTypes.UUID),
			field: 'positions',
			allowNull: true,
		},
		'updatedBy': {
			type: DataTypes.STRING,
			field: 'updated_by',
			allowNull: false,
		},
	},
	modelhelpers.getConfig(false, false));
}
function createAssociations(models) {
	models.document.belongsTo(models.company, {
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