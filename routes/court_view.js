const express = require('express');
const router = express.Router();
const data = require('../data');
const userData = data.usersData;
const matchesData = data.matchesData;
const courtviewData = data.courtviewData;
const poolsData = data.poolsData;
const teamsData = data.teamsData;

// router.get('/', async (req, res) => {
// 	try {
// 		let tournamentId = req.params.id;
// 		let userRole = '';
// 		let tournamentJoinedArray = [];

// 		if (req.oidc.isAuthenticated()) {
// 			const email = req.oidc.user.name;

// 			const user = await userData.getUserByEmail(email);
// 			userRole = user.user_metadata.role;
// 			const player = await teamsData.getPlayerByUserId(user._id.toString());
// 			tournamentJoinedArray = await poolsData.getTournamentJoinedByUser(player._id.toString());
// 		}

// 		let poolInfo = await poolsData.getPoolInfo(tournamentId);
// 		let numOfFields = poolInfo.numOfFields;
// 		let courtArray = [];
// 		let courtObj = {};
// 		let courtData = '';

// 		for (i = 0; i < numOfFields; i++) {
// 			let fieldNum = i + 1;
// 			courtData = await courtviewData.getCurrentGameData(fieldNum);

// 			if (courtData != null) {
// 				courtObj.gameNum = courtData.gameNum;
// 				courtObj.numOfFields = i + 1;
// 				courtObj.teamName1 = courtData.team1;
// 				courtObj.teamName2 = courtData.team2;
// 				courtObj.ref1 = courtData.ref1;
// 				courtObj.ref2 = courtData.ref2;
// 				courtArray.push(courtObj);
// 				courtObj = {};
// 				courtData = '';
// 			} else {
// 				courtObj.numOfFields = i + 1;
// 				courtObj.teamName1 = 'No team scheduled';
// 				courtObj.teamName2 = 'No team scheduled';
// 				courtObj.gamesFinished = true;
// 				courtArray.push(courtObj);
// 				courtObj = {};
// 				courtData = '';
// 			}
// 		}

// 		res.render('partials/court_view', {
// 			title: 'Current Games by Court',
// 			shortcode: 'courtView',
// 			isAuthenticated: req.oidc.isAuthenticated(),
// 			role: userRole,
// 			courtArray: courtArray,
// 			tournamentJoinedArray: tournamentJoinedArray,
// 		});
// 	} catch (e) {
// 		return res.status(500).json({ error: e });
// 	}
// });

router.get('/:id/:sport', async (req, res) => {
	let tournamentId = req.params.id;
	let sportName = req.params.sport;

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

		let numOfFields = null;

		let poolInfo = await poolsData.getPoolInfo(tournamentId);

		for(let i=0; i<poolInfo.sports.length; i++) {
			const sportInfo = await poolsData.getSportDataById(poolInfo.sports[i]);
			if(sportInfo.sport == sportName) {
				numOfFields = sportInfo.numOfFields;
				break;
			}
		}
		
		let courtArray = [];
		let courtObj = {};
		let courtData = '';

		for (i = 0; i < numOfFields; i++) {
			let fieldNum = i + 1;
			courtData = await courtviewData.getCurrentGameData(fieldNum);

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
		});
	} catch (e) {
		return res.status(500).json({ error: e });
	}
});

router.post('/', async (req, res) => {
	const matchInfo = req.body;

	const insertMatch = await matchesData.insertMatch(
		matchInfo.fieldNum,
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

	return res.json(insertMatch);
});

router.post('/get_current_game', async (req, res) => {
	const fieldNum = req.body.fieldNum;

	const currentGame = await courtviewData.getCurrentGameData(fieldNum);

	return res.json(currentGame);
});

router.post('/playoff', async (req, res) => {
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
