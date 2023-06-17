const express = require('express');
const router = express.Router();
const data = require('../data');
const userData = data.usersData;
const poolsData = data.poolsData;

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

			rounds = await poolsData.getRoundRobinSchedule();

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

router.post('/', async (req, res) => {
	let tournamentId = req.body.id;
	let sportName = req.body.sport;

	try {
		let schedule = null;

		if (req.body.selection == 'roundRobin') {
			schedule = await poolsData.roundRobinSelection(tournamentId, sportName);
		} else {
			schedule = await poolsData.createPoolPlay(tournamentId, sportName);
		}
		return res.json(schedule);
	} catch (e) {
		return res.status(500).json({ error: e });
	}
});

router.post('/round_robin_schedule/', async (req, res) => {
	let roundRobinInfo = req.body.roundRobinMatches;

	let gameNum = roundRobinInfo.gameNum;
	let team1 = roundRobinInfo.team1;
	let team2 = roundRobinInfo.team2;
	let field = roundRobinInfo.field;
	let complete = roundRobinInfo.complete;
	let ref1 = roundRobinInfo.ref1;
	let ref2 = roundRobinInfo.ref2;

	try {
		const roundRobinId = await poolsData.insertRoundRobin(
			gameNum,
			team1,
			team2,
			field,
			complete,
			ref1,
			ref2
		);

		return res.json(roundRobinId);
	} catch (e) {
		return res.status(500).json({ error: e });
	}
});

router.post('/round_robin_complete/', async (req, res) => {
	try {
		const roundRobinComplete = await poolsData.completeRoundRobin();
		return res.json(roundRobinComplete);
	} catch (e) {
		return res.status(500).json({ error: e });
	}
});

router.post('/goldsilver_schedule/', async (req, res) => {
	try {
		const goldsilver_schedule = await poolsData.createGoldSilverPool();
		return res.json(goldsilver_schedule);
	} catch (e) {
		return res.status(500).json({ error: e });
	}
});

module.exports = router;
