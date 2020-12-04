'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addConstraint('user_comment_reply', ['user_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_user_comment_reply_user',
			references: {
				table: 'user',
				field: 'user_id',
			},
		});
		await queryInterface.addConstraint('user_comment_reply', ['user_comment_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_user_comment_reply_user_comment',
			references: {
				table: 'user_comment',
				field: 'user_comment_id',
			},
		});

	},
	down: async (queryInterface, Sequelize) => {
			await queryInterface.removeConstraint('user_comment_reply', 'FK_user_comment_reply_user');
			await queryInterface.removeConstraint('user_comment_reply', 'FK_user_comment_reply_user_comment');
	}
}