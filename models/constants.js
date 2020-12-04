const EMAIL_TEMPLATE_TYPE = {
	user: 0,
	manager: 1,
	forgotPassword: 2,
	maintenanceRequest: 3,
	invitation: 4,
	leaveRequest: 5,
	leaveRequestResult: 6,
	userAvailability: 7,
	userAvailabilityResult: 8,
	schedule: 9,
	scheduleTradePost: 10,
	scheduleTradeRequest: 11,
	scheduleTradeResponse: 12,
	scheduleTradePendingApproval: 13,
	scheduleTradeDeclined: 14,
	userClock: 15,
	late: 16,
	userClockResponse: 17,
	inventoryNeeded: 18,
	userAvailabilityDeleteRequest: 19,
	userAvailabilityDeleteResult: 20,
}

const ROLE = {
	MANAGER: {
		label: "Manager",
		value: 100,
		// legacy app support
		includes: [160, 300, 1700]
	},
	INVENTORY: {
		label: "Inventory",
		value: 500,
	},
	ADMIN: {
		label: "Admin",
		value: 600,
	},
	MAINTENANCE_REQUESTS: {
		label: "Maintenance Requests",
		value: 900,
	},
	SCHEDULING: {
		label: "Scheduling",
		value: 1000,
		includes: [1100, 1300, 1460]
	},
}


// copy from web
const NOTIFICATION = {
	DAILY_REPORT: {
		label: "Daily Report",
		value: 500
	},
	TRADE_REQUESTS: {
		label: "Trade Requests",
		value: 600
	},
	INVENTORY: {
		label: "Inventory Needed",
		value: 2000
	},
}

// copy from web
const TRADE_STATUS = {
	SUBMITTED: {
		label: "Submitted",
		value: 0
	},
	REQUESTED: {
		label: "Trade Requested",
		value: 1
	},
	PENDING_APPROVAL: {
		label: "Pending Approval",
		value: 2
	},
	APPROVED: {
		label: "Approved",
		value: 3
	},
	DENIED: {
		label: "Denied",
		value: 4
	},
}


const TRANSACTION_TYPE = {
	RESTOCK: 0,
	USAGE: 1,
	RECONCILIATION: 2
}

const MODULE = {
	DUTIES: {
		value: 0,
	},
	SCHEDULING: {
		value: 1,
	},
	INVENTORY: {
		value: 2,
	},
	MAINTENANCE_REQUESTS: {
		value: 3,
	},
}

const ENCRYPT_KEY = "!!P4$$WORD!!"

module.exports = {
	EMAIL_TEMPLATE_TYPE,
	ROLE,
	TRANSACTION_TYPE,
	NOTIFICATION,
	TRADE_STATUS,
	ENCRYPT_KEY,
	MODULE,
}