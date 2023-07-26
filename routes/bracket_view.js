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

		//create arrays equal to highest gameNum in playoffArr for each section (finals, semis, quarters, etc)

		const numOfArraysToCreate = playoffArr[playoffArr.length-1].gameNum;
		let bracketSections = [];
		for(let i=0; i<numOfArraysToCreate; i++) {
			bracketSections.push([]);
		}

		for(let i=0; i<playoffArr.length; i++) {
			let section = playoffArr[i].gameNum-1;
			bracketSections[section].push(playoffArr[i]);
		}

		let eliminatedTeams = await poolsData.getAllSeeds(tournamentId, sportName, 'eliminated');
		let eliminatedTeamsArr = [];		

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
			// playoffArr: playoffArr,
			// quarterArr: quarterArr,
			// semiArr: semiArr,
			// finals: finals,
			eliminatedTeamsArr: eliminatedTeams,
			tournamentId: tournamentId,
			sportName: sportName,
			tournamentCoordinator: tournamentCoordinator,
			tournamentJoinedArray: tournamentJoinedArray,
			bracketSections: bracketSections,
		});

		return;
	} catch (e) {
		return res.status(500).json({ error: e });
	}
});

module.exports = router;
