const emailhelper = require('../../helpers/emailhelper');
const userhelper = require('../../helpers/userhelper');
const constants = require('../constants');
const h2p = require('html2plaintext');

async function created(reply, user, models, transaction) {
	await emailhelper.sendNotification(models, constants.ROLE.ADMIN, user,
		'Maintenance Request Reply',
		`
<html>
<body>
A reply has been sent by ${userhelper.getDisplayName(user)}:
<br /><br />
<p>${reply.replyText}</p>
</body>
</html>
	`,
	`A reply has been sent by ${userhelper.getDisplayName(user)}:
	${h2p(reply.replyText)}`
	);
}

// TODO: security
// function getWhere(req, res) {

// 	if (res.locals.user.maxRole < 1) {
// 		return { where: }
// 	}

// 	return {
// 		$and: and
// 	}
// }



module.exports = {
	created,
	includes: ['user']
}