// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
const modelhelpers = require('../helpers/modelhelpers');
function defineModel(sequelize, DataTypes) {
	return sequelize.define('shift', {
		'companyId': {
			type: DataTypes.UUID,
			field: 'company_id',
			allowNull: false,
		},
		'endTime': {
			type: DataTypes.DATE,
			field: 'end_time',
			allowNull: true,
		},
		'lunchDuration': {
			type: DataTypes.REAL,
			field: 'lunch_duration',
			allowNull: false,
			defaultValue: 0,
		},
		'shiftId': {
			type: DataTypes.UUID,
			field: 'shift_id',
			primaryKey: true,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
		},
		'shiftName': {
			type: DataTypes.STRING,
			field: 'shift_name',
			allowNull: false,
		},
		'startTime': {
			type: DataTypes.DATE,
			field: 'start_time',
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
	models.shift.hasMany(models.entry, {
		as: 'entrys',
		foreignKey: {
			name: 'shiftId',
			field: 'shift_id'
		},
		targetKey: 'shiftId'
	});
	models.shift.hasMany(models.schedule, {
		as: 'schedules',
		foreignKey: {
			name: 'shiftId',
			field: 'shift_id'
		},
		targetKey: 'shiftId'
	});
	models.shift.belongsTo(models.company, {
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