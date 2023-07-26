const express = require('express');
const router = express.Router();
const data = require('../data');
const userData = data.usersData;
const poolsData = data.poolsData;
const teamsData = data.teamsData;

router.get('/:id/:sport', async (req, res) => {
	let tournamentId = req.params.id;
	let sportName = req.params.sport;
	let tournamentCoordinator = false;

	try {
		let userRole = '';
		let tournamentJoinedArray = [];

		const poolInfo = await poolsData.getPoolInfo(tournamentId);
		const sportInfo = await poolsData.getSportInfo(poolInfo.sports, sportName);
		let playoffArr = await poolsData.getPlayOffs(sportInfo.playoffs);

		




		// playoffs

		// let bracketData = await poolsData.getPlayOffTeams(numOfSeeds, byeTeamsCount, numOfSeeds, sportInfo.seeds);

		// quarters
		let quarterArr = [];
		// let quarterArr = await poolsData.getBracketData(tournamentId, sportName, 'quarters');
		let eliminatedTeams = await poolsData.getAllSeeds(tournamentId, sportName, 'eliminated');
		let eliminatedTeamsArr = [];

		// semis
		

		let semiArr = [];
		// let semiArr = await poolsData.getBracketData("semis");
		// let semiArr = await poolsData.getFinals('semis');

		// finals

		let finals = [];
		// let finals = await poolsData.getFinals('finals');

		

		if (req.oidc.isAuthenticated()) {
			const email = req.oidc.user.name;

			const user = await userData.getUserByEmail(email);
			userRole = user.user_metadata.role;
			const player = await teamsData.getPlayerByUserId(user._id.toString());
			tournamentJoinedArray = await poolsData.getTournamentJoinedByUser(player._id.toString());

			const poolInfo = await poolsData.getPoolInfo(tournamentId);

			if (user._id.toString() == poolInfo.coordinator) {
				tournamentCoordinator = true;
			}
		}

		res.render('partials/bracket_view', {
			title: 'View Bracket',
			shortcode: 'bracketView',
			isAuthenticated: req.oidc.isAuthenticated(),
			role: userRole,
			playoffArr: playoffArr,
			quarterArr: quarterArr,
			semiArr: semiArr,
			finals: finals,
			eliminatedTeamsArr: eliminatedTeams,
			tournamentId: tournamentId,
			sportName: sportName,
			tournamentCoordinator: tournamentCoordinator,
			tournamentJoinedArray: tournamentJoinedArray,
		});

		return;
	} catch (e) {
		return res.status(500).json({ error: e });
	}
});

module.exports = router;
