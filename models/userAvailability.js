// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
const modelhelpers = require('../helpers/modelhelpers');
function defineModel(sequelize, DataTypes) {
	return sequelize.define('user_availability', {
		'allDay': {
			type: DataTypes.BOOLEAN,
			field: 'all_day',
			allowNull: true,
			defaultValue: false,
		},
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
		'dayOfWeek': {
			type: DataTypes.INTEGER,
			field: 'day_of_week',
			allowNull: false,
		},
		'endTime': {
			type: DataTypes.DATE,
			field: 'end_time',
			allowNull: true,
		},
		'markedForDelete': {
			type: DataTypes.BOOLEAN,
			field: 'marked_for_delete',
			allowNull: false,
			defaultValue: false,
		},
		'startTime': {
			type: DataTypes.DATE,
			field: 'start_time',
			allowNull: true,
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
		'userAvailabilityId': {
			type: DataTypes.UUID,
			field: 'user_availability_id',
			primaryKey: true,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
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
	models.userAvailability.belongsTo(models.user, {
		as: 'user',
		foreignKey: {
			name: 'userId',
			field: 'user_id'
		},
		targetKey: 'userId'
	});
	models.userAvailability.belongsTo(models.user, {
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