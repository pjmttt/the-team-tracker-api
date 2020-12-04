// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
const modelhelpers = require('../helpers/modelhelpers');
function defineModel(sequelize, DataTypes) {
	return sequelize.define('entry', {
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
		'enteredById': {
			type: DataTypes.UUID,
			field: 'entered_by_id',
			allowNull: false,
		},
		'entryDate': {
			type: DataTypes.DATEONLY,
			field: 'entry_date',
			allowNull: true,
		},
		'entryId': {
			type: DataTypes.UUID,
			field: 'entry_id',
			primaryKey: true,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
		},
		'entryType': {
			type: DataTypes.INTEGER,
			field: 'entry_type',
			allowNull: true,
			defaultValue: 0,
		},
		'notes': {
			type: DataTypes.STRING,
			field: 'notes',
			allowNull: true,
		},
		'rating': {
			type: DataTypes.INTEGER,
			field: 'rating',
			allowNull: true,
		},
		'shiftId': {
			type: DataTypes.UUID,
			field: 'shift_id',
			allowNull: true,
		},
		'taskId': {
			type: DataTypes.UUID,
			field: 'task_id',
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
			allowNull: true,
		},
	},
	modelhelpers.getConfig(false, true));
}
function createAssociations(models) {
	models.entry.hasMany(models.entrySubtask, {
		as: 'entrySubtasks',
		foreignKey: {
			name: 'entryId',
			field: 'entry_id'
		},
		targetKey: 'entryId'
	});
	models.entry.hasMany(models.userEntryQueue, {
		as: 'userEntryQueues',
		foreignKey: {
			name: 'entryId',
			field: 'entry_id'
		},
		targetKey: 'entryId'
	});
	models.entry.belongsTo(models.company, {
		as: 'company',
		foreignKey: {
			name: 'companyId',
			field: 'company_id'
		},
		targetKey: 'companyId'
	});
	models.entry.belongsTo(models.shift, {
		as: 'shift',
		foreignKey: {
			name: 'shiftId',
			field: 'shift_id'
		},
		targetKey: 'shiftId'
	});
	models.entry.belongsTo(models.task, {
		as: 'task',
		foreignKey: {
			name: 'taskId',
			field: 'task_id'
		},
		targetKey: 'taskId'
	});
	models.entry.belongsTo(models.user, {
		as: 'user',
		foreignKey: {
			name: 'userId',
			field: 'user_id'
		},
		targetKey: 'userId'
	});
	models.entry.belongsTo(models.user, {
		as: 'enteredBy',
		foreignKey: {
			name: 'enteredById',
			field: 'entered_by_id'
		},
		targetKey: 'userId'
	});
}
module.exports = {
	defineModel,
	createAssociations	
};