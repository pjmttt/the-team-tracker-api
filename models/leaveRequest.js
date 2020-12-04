// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
const modelhelpers = require('../helpers/modelhelpers');
function defineModel(sequelize, DataTypes) {
	return sequelize.define('leave_request', {
		'approvedDeniedById': {
			type: DataTypes.UUID,
			field: 'approved_denied_by_id',
			allowNull: true,
		},
		'approvedDeniedDate': {
			type: DataTypes.DATEONLY,
			field: 'approved_denied_date',
			allowNull: true,
		},
		'endDate': {
			type: DataTypes.DATE,
			field: 'end_date',
			allowNull: true,
		},
		'leaveRequestId': {
			type: DataTypes.UUID,
			field: 'leave_request_id',
			primaryKey: true,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
		},
		'reason': {
			type: DataTypes.STRING,
			field: 'reason',
			allowNull: true,
		},
		'startDate': {
			type: DataTypes.DATE,
			field: 'start_date',
			allowNull: false,
		},
		'status': {
			type: DataTypes.INTEGER,
			field: 'status',
			allowNull: false,
			defaultValue: 0,
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
	models.leaveRequest.belongsTo(models.user, {
		as: 'user',
		foreignKey: {
			name: 'userId',
			field: 'user_id'
		},
		targetKey: 'userId'
	});
	models.leaveRequest.belongsTo(models.user, {
		as: 'approvedDeniedBy',
		foreignKey: {
			name: 'approvedDeniedById',
			field: 'approved_denied_by_id'
		},
		targetKey: 'userId'
	});
}
module.exports = {
	defineModel,
	createAssociations	
};