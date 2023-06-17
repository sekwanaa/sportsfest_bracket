const express = require('express');
const router = express.Router();
const data = require('../data');
const userData = data.usersData;
const poolsData = data.poolsData;

router.get('/:id', async (req, res) => {
	let tournamentId = req.params.id;
	let tournamentCoordinator = false;
	let tournamentName = 'No Name';

	let userRole = '';
	let sports = ['volleyball', 'frisbee', 'basketball', 'soccer'];

	if (req.oidc.isAuthenticated()) {
		const email = req.oidc.user.name;

		const user = await userData.getUserByEmail(email);
		userRole = user.user_metadata.role;

		const poolInfo = await poolsData.getPoolInfo(tournamentId);
		if (poolInfo.coordinator == user._id.toString()) {
			tournamentCoordinator = true;
		}
		tournamentName = poolInfo.tournamentName;
	}

	const tournamentInfo = await poolsData.getPoolInfo(tournamentId);

	res.render('partials/tournament_view', {
		title: 'sportsfest',
		shortcode: 'tournaments',
		isAuthenticated: req.oidc.isAuthenticated(),
		tournamentInfo: tournamentInfo,
		sports: sports,
		tournamentId: tournamentId,
		tournamentCoordinator: tournamentCoordinator,
		tournamentName: tournamentName,
	});
});

module.exports = router;
