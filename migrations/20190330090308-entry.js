'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('entry', {
			'comments': {
				type: Sequelize.STRING(1000),
				field: 'comments',
				allowNull: true,
			},
			'company_id': {
				type: Sequelize.UUID,
				field: 'company_id',
				allowNull: false,
			},
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
			'entered_by_id': {
				type: Sequelize.UUID,
				field: 'entered_by_id',
				allowNull: false,
			},
			'entry_date': {
				type: Sequelize.DATEONLY,
				field: 'entry_date',
				allowNull: true,
			},
			'entry_id': {
				type: Sequelize.UUID,
				field: 'entry_id',
				allowNull: false,
				defaultValue: Sequelize.literal('uuid_generate_v4()'),
			},
			'entry_type': {
				type: Sequelize.INTEGER,
				field: 'entry_type',
				allowNull: true,
				defaultValue: 0,
			},
			'notes': {
				type: Sequelize.STRING(1000),
				field: 'notes',
				allowNull: true,
			},
			'rating': {
				type: Sequelize.INTEGER,
				field: 'rating',
				allowNull: true,
			},
			'shift_id': {
				type: Sequelize.UUID,
				field: 'shift_id',
				allowNull: true,
			},
			'task_id': {
				type: Sequelize.UUID,
				field: 'task_id',
				allowNull: false,
			},
			'updated_at': {
				type: Sequelize.DATE,
				field: 'updated_at',
				allowNull: false,
			},
			'updated_by': {
				type: Sequelize.STRING(50),
				field: 'updated_by',
				allowNull: false,
			},
			'user_id': {
				type: Sequelize.UUID,
				field: 'user_id',
				allowNull: true,
			},
		});
		await queryInterface.addConstraint('entry', ['entry_id'], {
			type: 'primary key',
			name: 'PK_entry_id'
		});
	},
	
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('entry');
	}
};
			