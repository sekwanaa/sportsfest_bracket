const express = require('express');
const router = express.Router();
const { requiresAuth } = require('express-openid-connect');
const data = require('../data');
const userData = data.usersData;
const matchesData = data.matchesData;

router.get('/', requiresAuth(), async (req, res) => {
	let email = 'not authenticated';
	let loggedInUser = {};
	let userRole = '';

	if (req.oidc.isAuthenticated()) {
		const email = req.oidc.user.name;

		const user = await userData.getUserByEmail(email);
		userRole = user.user_metadata.role;
	}

	res.render('partials/score_input', {
		title: 'Input Scores',
		shortcode: 'scoreInput',
		isAuthenticated: req.oidc.isAuthenticated(),
		role: userRole,
		year: '2023',
		teamName1: 'NJ A',
		teamName2: 'NJ X',
	});
});

router.post('/', requiresAuth(), async (req, res) => {
	const matchInfo = req.body;

	const insertMatch = await matchesData.insertMatch(
		matchInfo.team1,
		matchInfo.team2,
		matchInfo.score1,
		matchInfo.score2,
		matchInfo.year
	);

	return res.json(insertMatch);
});

module.exports = router;
