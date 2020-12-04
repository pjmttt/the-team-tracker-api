'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('attendance_reason', {
			'attendance_reason_id': {
				type: Sequelize.UUID,
				field: 'attendance_reason_id',
				allowNull: false,
				defaultValue: Sequelize.literal('uuid_generate_v4()'),
			},
			'background_color': {
				type: Sequelize.STRING(50),
				field: 'background_color',
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
				allowNull: true,
			},
			'deleted_at': {
				type: Sequelize.DATE,
				field: 'deleted_at',
				allowNull: true,
			},
			'reason_name': {
				type: Sequelize.STRING(255),
				field: 'reason_name',
				allowNull: false,
			},
			'text_color': {
				type: Sequelize.STRING(50),
				field: 'text_color',
				allowNull: true,
			},
			'updated_at': {
				type: Sequelize.DATE,
				field: 'updated_at',
				allowNull: true,
			},
			'updated_by': {
				type: Sequelize.STRING(255),
				field: 'updated_by',
				allowNull: true,
			},
		});
		await queryInterface.addConstraint('attendance_reason', ['attendance_reason_id'], {
			type: 'primary key',
			name: 'PK_attendance_reason_id'
		});
	},
	
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('attendance_reason');
	}
};
			