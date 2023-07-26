const express = require('express');
const router = express.Router();
const mongoCollection = require('../config/mongoCollections')
const sportslist = mongoCollection.sportslist
const data = require('../data');
const { ObjectId } = require('mongodb');
const userData = data.usersData;
const poolsData = data.poolsData;
const teamsData = data.teamsData;

router.get('/:id', async (req, res) => {
	let tournamentId = req.params.id;
	let tournamentCoordinator = false;
	let tournamentName = 'No Name';
	let tournamentJoinedArray = [];

	let userRole = '';
	let tournamentData = await poolsData.getPoolInfo(tournamentId)
	let sportsIds = tournamentData.sports
	let sportsData = await Promise.all(sportsIds.map(async (id) => {
		const sportsData = await poolsData.getSportDataById(id)
		return sportsData
	}))
	let sports = sportsData.map(sport => sport.sport)

	if (req.oidc.isAuthenticated()) {
		const email = req.oidc.user.name;

		const user = await userData.getUserByEmail(email);
		userRole = user.user_metadata.role;
		const player = await teamsData.getPlayerByUserId(user._id.toString());
		tournamentJoinedArray = await poolsData.getTournamentJoinedByUser(player._id.toString());

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
		tournamentJoinedArray: tournamentJoinedArray,
	});
});

module.exports = router;
