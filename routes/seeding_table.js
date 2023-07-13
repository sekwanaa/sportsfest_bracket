const express = require('express');
const router = express.Router();
const data = require('../data');
const userData = data.usersData;
const matchesData = data.matchesData;
const teamsData = data.teamsData;
const poolsData = data.poolsData;

router.get('/:id/:sport', async (req, res) => {
	let tournamentId = req.params.id;
	let sportName = req.params.sport;
	let tournamentCoordinator = false;
	let tournamentJoinedArray = [];

	try {
		let userRole = '';
		let user = null;

		const poolInfo = await poolsData.getPoolInfo(tournamentId);

		if (req.oidc.isAuthenticated()) {
			const email = req.oidc.user.name;

			user = await userData.getUserByEmail(email);
			userRole = user.user_metadata.role;
			const player = await teamsData.getPlayerByUserId(user._id.toString());
			tournamentJoinedArray = await poolsData.getTournamentJoinedByUser(player._id.toString());

			if (user._id.toString() == poolInfo.coordinator) {
				tournamentCoordinator = true;
			}
		}

		const matchHistory = await matchesData.getTeamRecords(tournamentId, sportName);
		const seedsInfo = await poolsData.getAllSeeds();

		let isStage1 = true;

		if (seedsInfo!=null && seedsInfo.length > 0) {
			isStage1 = false;
		}

		if (user._id.toString() == poolInfo.coordinator) {
			tournamentCoordinator = true;
		}
		
		res.render('partials/seeding_table', {
			title: 'Seeding Table',
			shortcode: 'seedingTable',
			isAuthenticated: req.oidc.isAuthenticated(),
			role: userRole,
			matches: matchHistory,
			stage1: isStage1,
			tournamentId: tournamentId,
			sportName: sportName,
			tournamentCoordinator: tournamentCoordinator,
			tournamentJoinedArray: tournamentJoinedArray,
		});
	} catch (e) {
		return res.status(500).json({ error: e });
	}
});

router.get('/:id/:sport/seedCount', async (req, res) => {
	const tournamentId = req.params.id;
	const sportName = req.params.sport;

	try {
		return res.json(await matchesData.getTeamRecords(tournamentId, sportName));
	} catch (e) {
		return res.status(500).json({ error: e });
	}
});

router.post('/:id/:sport/insertSeeds', async (req, res) => {

	const tournamentId = req.params.id;
	const sportName = req.params.sport;

	try {
		const poolInfo = await poolsData.getPoolInfo(tournamentId);
		const sportInfo = await poolsData.getSportInfo(poolInfo.sports, sportName);

		let numOfSeeds = Math.floor(sportInfo.teams.length * 0.6);
		let numOfPlayoffTeams = Math.floor((numOfSeeds * 2) / 3);
		let seeds = req.body.seedsArray;

		for (i = 0; i < seeds.length; i++) {
			//made it to quarters - gets a bye
			if (i < numOfSeeds - numOfPlayoffTeams) {
				seeds[i].currentPlacement = 2;
			}
			//eliminated - does not move on to playoffs
			else if (i >= numOfSeeds) {
				seeds[i].currentPlacement = 0;
			}
			//made it to playoffs
			else {
				seeds[i].currentPlacement = 1;
			}
		}

		const seedId = await poolsData.seedInsert(seeds,tournamentId, sportName);

		return res.json(seedId);
	} catch (e) {
		return res.status(500).json({ error: e });
	}
});

router.post('/seeds', async (req, res) => {
	try {
		return res.json(await matchesData.getTeamRecords());
	} catch (e) {
		return res.status(500).json({ error: e });
	}
});

module.exports = router;
