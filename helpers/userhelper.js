function getDisplayName(user) {
	if (!user) return '';
	return `${user.firstName}${user.middleName ? ` ${user.middleName}` : ''} ${user.lastName}`;
}

module.exports = {
	getDisplayName
}