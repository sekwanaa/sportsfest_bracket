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

			if (user._id.toString() == poolInfo.coordinator || email == "bhavin.mistry94@gmail.com" || email == "sekwanaa.chia@gmail.com") {
				tournamentCoordinator = true;
			}
		}

		const matchHistory = await matchesData.getTeamRecords(tournamentId, sportName);
		const seedsInfo = await poolsData.getAllSeeds(tournamentId, sportName, null);

		let isStage1 = true;

		if (seedsInfo != null && seedsInfo.length > 0) {
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
	const email = req.oidc.user.name

	const tournamentId = req.params.id;
	const sportName = req.params.sport;

	try {
		const poolInfo = await poolsData.getPoolInfo(tournamentId);
		const sportInfo = await poolsData.getSportInfo(poolInfo.sports, sportName);

		if (sportInfo.sport == sportName) {
			if (email == "bhavin.mistry94@gmail.com" || email == "sekwanaa.chia@gmail.com") {

			} else if (sportInfo.schedule.length !== sportInfo.matchHistory.length) {
				return res.json("You need to submit all scores first")
			}
		}

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

		const seedId = await poolsData.seedInsert(seeds, tournamentId, sportName);

		return res.json("success");
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

router.post('/:id/:sport/getDistricts', async (req, res) => {
	try {
		const tournamentId = req.params.id;
		const sportName = req.params.sport;
		// return res.json(await matchesData.getTeamRecords());
		const poolInfo = await poolsData.getPoolInfo(tournamentId);
		const sportInfo = await poolsData.getSportInfo(poolInfo.sports, sportName);

		let teamList = {}

		for (let i = 0; i < sportInfo.teams.length; i++) {
			let teamInfo = await teamsData.getAllTeamsByID(sportInfo.teams[i]);
			teamList[teamInfo.name] = teamInfo.district;
		}
		// let teamList = await Promise.all(sportInfo.teams.map(async function (team) {
		// 	const teamInfo = await teamsData.getAllTeamsByID(team)
		// 	if (teamInfo) {
		// 		return {
		// 			teamName: teamInfo.name,
		// 			district: teamInfo.district
		// 		}
		// 	}
		// }))
		return res.json(teamList)
	} catch (e) {
		return res.status(500).json({ error: e });
	}
});

router.post('/:id/:sport/update_team_rankings', async (req, res) => {
	const seedArray = req.body.seedArray;
	// console.log(seedArray);

	try {

		return res.json("here");
	} catch (e) {
		return res.status(500).json({ error: e });
	}
});

module.exports = router;
