'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('user_note', {
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
			'note': {
				type: Sequelize.STRING(1000),
				field: 'note',
				allowNull: false,
			},
			'note_date': {
				type: Sequelize.DATE,
				field: 'note_date',
				allowNull: false,
			},
			'updated_at': {
				type: Sequelize.DATE,
				field: 'updated_at',
				allowNull: false,
			},
			'user_id': {
				type: Sequelize.UUID,
				field: 'user_id',
				allowNull: true,
			},
			'user_note_id': {
				type: Sequelize.UUID,
				field: 'user_note_id',
				allowNull: false,
				defaultValue: Sequelize.literal('uuid_generate_v4()'),
			},
		});
		await queryInterface.addConstraint('user_note', ['user_note_id'], {
			type: 'primary key',
			name: 'PK_user_note_id'
		});
	},
	
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('user_note');
	}
};
			