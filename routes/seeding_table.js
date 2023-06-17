const express = require('express');
const router = express.Router();
const data = require('../data');
const userData = data.usersData;
const matchesData = data.matchesData;
const teamsData = data.teamsData;
const poolsData = data.poolsData;

router.get('/', async (req, res) => {
	try {
		let userRole = '';
		let tournamentJoinedArray = [];

		if (req.oidc.isAuthenticated()) {
			const email = req.oidc.user.name;

			const user = await userData.getUserByEmail(email);
			userRole = user.user_metadata.role;
			const player = await teamsData.getPlayerByUserId(user._id.toString());
			tournamentJoinedArray = await poolsData.getTournamentJoinedByUser(player._id.toString());
		}

		const matchHistory = await matchesData.getTeamRecords();
		const seedsInfo = await poolsData.getAllSeeds();

		let isStage1 = true;
		if (seedsInfo.length > 0) {
			isStage1 = false;
		}

		res.render('partials/seeding_table', {
			title: 'Seeding Table',
			shortcode: 'seedingTable',
			isAuthenticated: req.oidc.isAuthenticated(),
			role: userRole,
			matches: matchHistory,
			stage1: isStage1,
			tournamentJoinedArray: tournamentJoinedArray,
		});
	} catch (e) {
		return res.status(500).json({ error: e });
	}
});

router.get('/:id/:sport', async (req, res) => {
	let tournamentId = req.params.id;
	let sportName = req.params.sport;
	let tournamentCoordinator = false;
	let tournamentJoinedArray = [];

	try {
		let userRole = '';

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

		const matchHistory = await matchesData.getTeamRecords();
		const seedsInfo = await poolsData.getAllSeeds();

		let isStage1 = true;
		if (seedsInfo.length > 0) {
			isStage1 = false;
		}

		const poolInfo = await poolsData.getPoolInfo(tournamentId);

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

router.get('/seedCount', async (req, res) => {
	try {
		return res.json(await matchesData.getTeamRecords());
	} catch (e) {
		return res.status(500).json({ error: e });
	}
});

router.post('/insertSeeds', async (req, res) => {
	try {
		const poolInfo = await poolsData.getPoolInfo();
		let numOfSeeds = Math.floor(poolInfo.numOfTeams * 0.6);
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

		const seedId = await poolsData.seedInsert(seeds);

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
