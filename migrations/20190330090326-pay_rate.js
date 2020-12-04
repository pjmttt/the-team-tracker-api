'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('pay_rate', {
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
			'description': {
				type: Sequelize.STRING(50),
				field: 'description',
				allowNull: false,
			},
			'pay_rate_id': {
				type: Sequelize.UUID,
				field: 'pay_rate_id',
				allowNull: false,
				defaultValue: Sequelize.literal('uuid_generate_v4()'),
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
		});
		await queryInterface.addConstraint('pay_rate', ['pay_rate_id'], {
			type: 'primary key',
			name: 'PK_pay_rate_id'
		});
	},
	
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('pay_rate');
	}
};
			