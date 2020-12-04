// const models = require('../models');
// const moment = require('moment');

// (async function() {
// 	const outs = await models.userClock.findAll({
// 		where: {
// 			clockOutDate: null
// 		}
// 	});

// 	let userDates = [];
// 	for (let out of outs) {
// 		const allClocks = await models.userClock.findAll({
// 			where: {
// 				userId: out.userId,
// 				$and: [
// 					{ clockInDate: { $gte: 
// 				]
				
// 			}
// 		})
// 	}
// })();