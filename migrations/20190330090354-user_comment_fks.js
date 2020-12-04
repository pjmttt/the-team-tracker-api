'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addConstraint('user_comment', ['company_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_user_comment_company',
			references: {
				table: 'company',
				field: 'company_id',
			},
		});
		await queryInterface.addConstraint('user_comment', ['user_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_user_comment_user',
			references: {
				table: 'user',
				field: 'user_id',
			},
		});

	},
	down: async (queryInterface, Sequelize) => {
			await queryInterface.removeConstraint('user_comment', 'FK_user_comment_company');
			await queryInterface.removeConstraint('user_comment', 'FK_user_comment_user');
	}
}