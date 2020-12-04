// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
const modelhelpers = require('../helpers/modelhelpers');
function defineModel(sequelize, DataTypes) {
	return sequelize.define('attendance_reason', {
		'attendanceReasonId': {
			type: DataTypes.UUID,
			field: 'attendance_reason_id',
			primaryKey: true,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
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
		'reasonName': {
			type: DataTypes.STRING,
			field: 'reason_name',
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
	models.attendanceReason.hasMany(models.attendance, {
		as: 'attendances',
		foreignKey: {
			name: 'attendanceReasonId',
			field: 'attendance_reason_id'
		},
		targetKey: 'attendanceReasonId'
	});
	models.attendanceReason.belongsTo(models.company, {
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