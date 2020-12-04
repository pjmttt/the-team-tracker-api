// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
const modelhelpers = require('../helpers/modelhelpers');
function defineModel(sequelize, DataTypes) {
	return sequelize.define('user_clock', {
		'clockInDate': {
			type: DataTypes.DATE,
			field: 'clock_in_date',
			allowNull: false,
		},
		'clockOutDate': {
			type: DataTypes.DATE,
			field: 'clock_out_date',
			allowNull: true,
		},
		'notes': {
			type: DataTypes.STRING,
			field: 'notes',
			allowNull: true,
		},
		'status': {
			type: DataTypes.INTEGER,
			field: 'status',
			allowNull: true,
			defaultValue: 0,
		},
		'userClockId': {
			type: DataTypes.UUID,
			field: 'user_clock_id',
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
	models.userClock.belongsTo(models.user, {
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