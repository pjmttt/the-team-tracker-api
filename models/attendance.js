// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
const modelhelpers = require('../helpers/modelhelpers');
function defineModel(sequelize, DataTypes) {
	return sequelize.define('attendance', {
		'attendanceDate': {
			type: DataTypes.DATEONLY,
			field: 'attendance_date',
			allowNull: false,
		},
		'attendanceId': {
			type: DataTypes.UUID,
			field: 'attendance_id',
			primaryKey: true,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
		},
		'attendanceReasonId': {
			type: DataTypes.UUID,
			field: 'attendance_reason_id',
			allowNull: false,
		},
		'comments': {
			type: DataTypes.STRING,
			field: 'comments',
			allowNull: true,
		},
		'companyId': {
			type: DataTypes.UUID,
			field: 'company_id',
			allowNull: false,
		},
		'updatedBy': {
			type: DataTypes.STRING,
			field: 'updated_by',
			allowNull: false,
		},
		'userId': {
			type: DataTypes.UUID,
			field: 'user_id',
			allowNull: false,
		},
	},
	modelhelpers.getConfig(false, true));
}
function createAssociations(models) {
	models.attendance.belongsTo(models.attendanceReason, {
		as: 'attendanceReason',
		foreignKey: {
			name: 'attendanceReasonId',
			field: 'attendance_reason_id'
		},
		targetKey: 'attendanceReasonId'
	});
	models.attendance.belongsTo(models.company, {
		as: 'company',
		foreignKey: {
			name: 'companyId',
			field: 'company_id'
		},
		targetKey: 'companyId'
	});
	models.attendance.belongsTo(models.user, {
		as: 'user',
		foreignKey: {
			name: 'userId',
			field: 'user_id'
		},
		targetKey: 'userId'
	});
}
module.exports = {
	defineModel,
	createAssociations	
};