const express = require('express');
const router = express.Router();
const data = require('../data');
const userData = data.usersData;
const matchesData = data.matchesData;
const courtviewData = data.courtviewData;
const poolsData = data.poolsData;
const teamsData = data.teamsData;

router.get('/:id/:sport', async (req, res) => {
	let tournamentId = req.params.id;
	let sportName = req.params.sport;
	let tournamentCoordinator = false;

	try {
		let userRole = '';
		let tournamentJoinedArray = [];

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

		let numOfFields = null;

		let poolInfo = await poolsData.getPoolInfo(tournamentId);

		let sportInfo = null;

		for (let i = 0; i < poolInfo.sports.length; i++) {
			sportInfo = await poolsData.getSportDataById(poolInfo.sports[i]);
			if (sportInfo.sport == sportName) {
				numOfFields = sportInfo.numOfFields;
				break;
			}
		}

		let courtArray = [];
		let courtObj = {};
		let courtData = '';

		for (i = 0; i < numOfFields; i++) {
			let fieldNum = i + 1;
			courtData = await courtviewData.getCurrentGameData(sportInfo, fieldNum);

			if (courtData != null) {
				courtObj.gameNum = courtData.gameNum;
				courtObj.numOfFields = i + 1;
				courtObj.teamName1 = courtData.team1;
				courtObj.teamName2 = courtData.team2;
				courtObj.ref1 = courtData.ref1;
				courtObj.ref2 = courtData.ref2;
				courtArray.push(courtObj);
				courtObj = {};
				courtData = '';
			} else {
				courtObj.numOfFields = i + 1;
				courtObj.teamName1 = 'No team scheduled';
				courtObj.teamName2 = 'No team scheduled';
				courtObj.gamesFinished = true;
				courtArray.push(courtObj);
				courtObj = {};
				courtData = '';
			}
		}

		res.render('partials/court_view', {
			title: 'Current Games by Court',
			shortcode: 'courtView',
			isAuthenticated: req.oidc.isAuthenticated(),
			role: userRole,
			courtArray: courtArray,
			tournamentId: tournamentId,
			sportName: sportName,
			tournamentJoinedArray: tournamentJoinedArray,
			tournamentCoordinator: tournamentCoordinator,
		});
	} catch (e) {
		return res.status(500).json({ error: e });
	}
});

router.post('/:id/:sport/', async (req, res) => {
	const tournamentId = req.params.id;
	const sportName = req.params.sport;
	const matchInfo = req.body;

	try {
		const checkIfMatchIsCompleted = await matchesData.checkIfMatchIsCompleted(tournamentId, sportName, matchInfo);
		if (checkIfMatchIsCompleted == true) {
			return res.json("match already submitted");
		}
		else {
			matchInfo.month = new Date().getMonth() + 1;
			matchInfo.day = new Date().getDate();
			matchInfo.year = new Date().getFullYear(); // gets the current year, court view can only submit current year scores
			matchInfo.submitted = true

			const insertMatch = await matchesData.insertMatch(matchInfo, tournamentId, sportName);
			return res.json(insertMatch);
		}
	} catch (e) {
		return res.status(500).json({ error: e });
	}
});

router.post('/:id/:sport/get_current_game', async (req, res) => {
	const fieldNum = req.body.fieldNum;

	const currentGame = await courtviewData.getCurrentGameData(fieldNum);

	return res.json(currentGame);
});

router.post('/:id/:sport/playoff', async (req, res) => {
	const matchInfo = req.body;
	const fieldNum = matchInfo.fieldNum;

	const insertMatch = await matchesData.insertMatch(
		matchInfo.team1,
		matchInfo.team2,
		matchInfo.score1,
		matchInfo.score2,
		matchInfo.winner,
		matchInfo.loser,
		matchInfo.winnerPointDifferential,
		matchInfo.loserPointDifferential,
		(matchInfo.year = new Date().getFullYear().toString()) // gets the current year, court view can only submit current year scores
	);

	const roundRobin = await poolsData.roundRobinCompleteMatch(
		fieldNum,
		matchInfo.team1,
		matchInfo.team2
	);

	return res.json(insertMatch);
});

module.exports = router;
