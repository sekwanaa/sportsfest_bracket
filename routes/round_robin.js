const express = require('express');
const router = express.Router();
const data = require('../data');
const userData = data.usersData;
const poolsData = data.poolsData;
const teamsData = data.teamsData;

router.get('/:id/:sport', async (req, res) => {
	let userRole = '';
	let name = '';
	let rounds;
	let isRounds = false;
	let isStage1 = true;
	let tournamentId = req.params.id;
	let tournamentCoordinator = false;
	let sportName = req.params.sport;
	let tournamentJoinedArray = [];

	try {
		if (req.oidc.isAuthenticated()) {
			const email = req.oidc.user.name;

			const user = await userData.getUserByEmail(email);
			userRole = user.user_metadata.role;
			name = user.user_metadata.name;
			const player = await teamsData.getPlayerByUserId(user._id.toString());
			tournamentJoinedArray = await poolsData.getTournamentJoinedByUser(player._id.toString());

			rounds = await poolsData.getRoundRobinSchedule(tournamentId, sportName);

			if (rounds.length > 0) {
				isRounds = true;
			} else {
				isRounds = false;
			}

			let poolInfo = await poolsData.getPoolInfo(tournamentId);

			if (poolInfo.stage > 1) {
				isStage1 = false;
			}

			if (user._id.toString() == poolInfo.coordinator) {
				tournamentCoordinator = true;
			}
		}

		res.render('partials/round_robin', {
			title: 'Round-Robin',
			shortcode: 'roundRobin',
			isAuthenticated: req.oidc.isAuthenticated(),
			role: userRole,
			rounds: rounds,
			isRounds: isRounds,
			isStage1: isStage1,
			tournamentId: tournamentId,
			sportName: sportName,
			tournamentCoordinator: tournamentCoordinator,
			tournamentJoinedArray: tournamentJoinedArray,
		});
	} catch (e) {
		return res.status(500).json({ error: e });
	}
});

router.post('/:id/:sport/', async (req, res) => {
	let tournamentId = req.params.id;
	let sportName = req.params.sport;

	try {
		let schedule = null;

		if (req.body.selection == 'roundRobin') {
			schedule = await poolsData.roundRobinSelection(tournamentId, sportName);
		} else {
			schedule = await poolsData.createPoolPlay(tournamentId, sportName);
		}
		return res.json(schedule);
	} catch (e) {
		console.log(e);
		return res.json(e);
		// return res.status(500).json({ error: e });
	}
});

router.post('/:id/:sport/round_robin_schedule/', async (req, res) => {
	let tournamentId = req.params.id;
	let sportName = req.params.sport;

	let roundRobinInfo = req.body.roundRobinMatches;
	let scheduleType = req.body.scheduleType;

	try {
		//insert scheduleType into Tournament
		const insertScheduleType = await poolsData.updateSportScheduleType(tournamentId, sportName, scheduleType);

		for (let i = 0; i < roundRobinInfo.length; i++) {
			let gameNum = roundRobinInfo[i].gameNum;
			let team1 = roundRobinInfo[i].team1;
			let team2 = roundRobinInfo[i].team2;
			let field = roundRobinInfo[i].field;
			let complete = roundRobinInfo[i].complete;
			let ref1 = roundRobinInfo[i].ref1;
			let ref2 = roundRobinInfo[i].ref2;

			const roundRobinId = await poolsData.insertRoundRobin(
				gameNum,
				team1,
				team2,
				field,
				complete,
				ref1,
				ref2
			);

			const insertRoundRobinIdIntoSport = await poolsData.addRoundRobinToSport(tournamentId, sportName, roundRobinId);

		}

		return res.json("done");
	} catch (e) {
		return res.status(500).json({ error: e });
	}
});

router.post('/:id/:sport/round_robin_complete/', async (req, res) => {

	let tournamentId = req.params.id;
	let sportName = req.params.sport;

	try {
		const poolInfo = await poolsData.getPoolInfo(tournamentId);
		const sportInfo = await poolsData.getSportInfo(poolInfo.sports, sportName);

		if (sportInfo.seeds.length == 0) {
			return res.json("You need to submit seeds first")
		}
	} catch (e) {
		return res.status(500).json({ error: e });
	}

	try {
		const roundRobinComplete = await poolsData.completeRoundRobin(tournamentId, sportName);
		return res.json("success");
	} catch (e) {
		return res.status(500).json({ error: e });
	}
});

router.post('/:id/:sport/create_pool_play/', async (req, res) => {
	const tournamentId = req.params.id;
	const sportname = req.params.sport;

	try {
		const poolPlaySchedule = await poolsData.createPoolPlay(tournamentId, sportName);
		return res.json(poolPlaySchedule);
	} catch (e) {
		return res.status(500).json({ error: e });
	}
});

//testing new method
router.post('/:id/:sport/round_robin_complete_test/', async (req, res) => {

	let tournamentId = req.params.id;
	let sportName = req.params.sport;

	try {
		const playOffmatches = await poolsData.insertPlayoffNew(tournamentId, sportName);
		// const insertPlayoffMatches = 
		return res.json(roundRobinComplete);
	} catch (e) {
		return res.status(500).json({ error: e });
	}
});
//end testing

module.exports = router;
