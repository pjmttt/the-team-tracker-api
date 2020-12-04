'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('attendance', {
			'attendance_date': {
				type: Sequelize.DATEONLY,
				field: 'attendance_date',
				allowNull: false,
			},
			'attendance_id': {
				type: Sequelize.UUID,
				field: 'attendance_id',
				allowNull: false,
				defaultValue: Sequelize.literal('uuid_generate_v4()'),
			},
			'attendance_reason_id': {
				type: Sequelize.UUID,
				field: 'attendance_reason_id',
				allowNull: false,
			},
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
		await queryInterface.addConstraint('attendance', ['attendance_id'], {
			type: 'primary key',
			name: 'PK_attendance_id'
		});
	},
	
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('attendance');
	}
};
			