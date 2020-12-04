// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
const modelhelpers = require('../helpers/modelhelpers');
function defineModel(sequelize, DataTypes) {
	return sequelize.define('user_entry_queue', {
		'entryId': {
			type: DataTypes.UUID,
			field: 'entry_id',
			allowNull: false,
		},
		'userEntryQueueId': {
			type: DataTypes.UUID,
			field: 'user_entry_queue_id',
			primaryKey: true,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
		},
	},
	modelhelpers.getConfig(false, true));
}
function createAssociations(models) {
	models.userEntryQueue.belongsTo(models.entry, {
		as: 'entry',
		foreignKey: {
			name: 'entryId',
			field: 'entry_id'
		},
		targetKey: 'entryId'
	});
}
module.exports = {
	defineModel,
	createAssociations	
};