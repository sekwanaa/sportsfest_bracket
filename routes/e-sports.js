const express = require('express');
const router = express.Router();
const data = require('../data');
const userData = data.usersData;
const poolsData = data.poolsData;

router.get('/', async (req, res) => {
	let userRole = '';
	let sports = ['League of Legends', 'Fortnite', 'Valorant', 'Super Smash'];

	if (req.oidc.isAuthenticated()) {
		const email = req.oidc.user.name;

		const user = await userData.getUserByEmail(email);
		userRole = user.user_metadata.role;
	}

	res.render('partials/e-sports', {
		title: 'E-Sports',
		shortcode: 'tournaments',
		isAuthenticated: req.oidc.isAuthenticated(),
		role: userRole,
		sports: sports,
	});
});

module.exports = router;
