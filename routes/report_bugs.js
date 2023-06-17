const express = require('express');
const router = express.Router();
const data = require('../data');
const userData = data.usersData;

router.get('/', async (req, res) => {
	let email = 'not authenticated';
	let loggedInUser = {};
	let userRole = '';

	if (req.oidc.isAuthenticated()) {
		const email = req.oidc.user.name;

		const user = await userData.getUserByEmail(email);
		userRole = user.user_metadata.role;
	}

	res.render('partials/report_bug', {
		title: 'Report Bugs',
		shortcode: 'reportBug',
		isAuthenticated: req.oidc.isAuthenticated(),
		role: userRole,
	});
});

module.exports = router;
