'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('user_entry_queue', {
			'created_at': {
				type: Sequelize.DATE,
				field: 'created_at',
				allowNull: false,
			},
			'deleted_at': {
				type: Sequelize.DATE,
				field: 'deleted_at',
				allowNull: true,
			},
			'entry_id': {
				type: Sequelize.UUID,
				field: 'entry_id',
				allowNull: false,
			},
			'updated_at': {
				type: Sequelize.DATE,
				field: 'updated_at',
				allowNull: false,
			},
			'user_entry_queue_id': {
				type: Sequelize.UUID,
				field: 'user_entry_queue_id',
				allowNull: false,
				defaultValue: Sequelize.literal('uuid_generate_v4()'),
			},
		});
		await queryInterface.addConstraint('user_entry_queue', ['user_entry_queue_id'], {
			type: 'primary key',
			name: 'PK_user_entry_queue_id'
		});
	},
	
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('user_entry_queue');
	}
};
			