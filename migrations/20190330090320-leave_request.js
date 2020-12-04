'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('leave_request', {
			'approved_denied_by_id': {
				type: Sequelize.UUID,
				field: 'approved_denied_by_id',
				allowNull: true,
			},
			'approved_denied_date': {
				type: Sequelize.DATEONLY,
				field: 'approved_denied_date',
				allowNull: true,
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
			'end_date': {
				type: Sequelize.DATE,
				field: 'end_date',
				allowNull: true,
			},
			'leave_request_id': {
				type: Sequelize.UUID,
				field: 'leave_request_id',
				allowNull: false,
				defaultValue: Sequelize.literal('uuid_generate_v4()'),
			},
			'reason': {
				type: Sequelize.STRING(1000),
				field: 'reason',
				allowNull: true,
			},
			'start_date': {
				type: Sequelize.DATE,
				field: 'start_date',
				allowNull: false,
			},
			'status': {
				type: Sequelize.INTEGER,
				field: 'status',
				allowNull: false,
				defaultValue: 0,
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
				allowNull: false,
			},
		});
		await queryInterface.addConstraint('leave_request', ['leave_request_id'], {
			type: 'primary key',
			name: 'PK_leave_request_id'
		});
	},
	
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('leave_request');
	}
};
			