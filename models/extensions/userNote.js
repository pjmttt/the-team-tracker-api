// const constants = require('../constants');
// const userhelper = require('../../helpers/userhelper');

// function format(userNote, req, res) {
// 	if (userNote.user) {
// 		if (userNote.user.get) userNote.user = userNote.user.get();
// 		delete userNote.user.password;
// 		delete userNote.user.forgotPassword;
// 		userNote.user.displayName = userhelper.getDisplayName(userNote.user);
// 	}
// 	return availability;
// }

// module.exports = {
// 	format,
// 	getIncludes: function (models) {
// 		return {
// 			model: models.user, as: 'user', paranoid: false, include:
// 				{ model: models.position, as: 'position', paranoid: false },
// 		}
// 	},
// }