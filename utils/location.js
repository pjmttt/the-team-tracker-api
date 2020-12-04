const axios = require('axios');

function getIpAddress(req) {
	let addr = req.headers['x-forwarded-for'] ||
		req.connection.remoteAddress ||
		req.socket.remoteAddress ||
		(req.connection.socket ? req.connection.socket.remoteAddress : null);
	if (addr && addr.indexOf('::ffff:') == 0) {
		addr = addr.replace('::ffff:', '');
	}
	return addr;
}

async function tryUpdateGeo(company, req) {
	if (process.env.NODE_ENV != 'test' && company.streetAddress1 && company.city) {
		const search = encodeURIComponent(`${company.streetAddress1}, ${company.city}, ${company.stateProvince || ''}, ${company.postalCode || ''}, ${company.country || ''}`);
		const url = `${process.env.GEO_URL}${search}`;
		try {
			const response = await axios.get(url);
			if (response.status == 200) {
				const loc = response.data.results[0].geometry.location;
				company.geoLocation = `${loc.lat},${loc.lng}`;
			}
		}
		catch (e) {
			// TODO:
		}
	}

	try {
		if (!company.ipAddress) {
			company.ipAddress = getIpAddress(req);
		}
	}
	catch (e) {

	}
}

module.exports = {
	getIpAddress,
	tryUpdateGeo,
}