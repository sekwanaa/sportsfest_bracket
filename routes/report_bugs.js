const express = require('express');
const router = express.Router();
const data = require('../data');
const userData = data.usersData;
const teamsData = data.teamsData;
const poolsData = data.poolsData;

router.get('/', async (req, res) => {
	let email = 'not authenticated';
	let loggedInUser = {};
	let userRole = '';
	let tournamentJoinedArray = [];

	if (req.oidc.isAuthenticated()) {
		const email = req.oidc.user.name;

		const user = await userData.getUserByEmail(email);
		userRole = user.user_metadata.role;
		const player = await teamsData.getPlayerByUserId(user._id.toString());
		tournamentJoinedArray = await poolsData.getTournamentJoinedByUser(player._id.toString());
	}

	res.render('partials/report_bug', {
		title: 'Report Bugs',
		shortcode: 'reportBug',
		isAuthenticated: req.oidc.isAuthenticated(),
		role: userRole,
		tournamentJoinedArray: tournamentJoinedArray,
	});
});

module.exports = router;
