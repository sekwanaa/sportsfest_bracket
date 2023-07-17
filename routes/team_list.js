const express = require('express');
const router = express.Router();
const data = require('../data');
const userData = data.usersData;
const teamData = data.teamsData;
const poolsData = data.poolsData;

// router.get("/", async (req, res) => {

//     let email="not authenticated"
//     let userRole = "";
//     let allTeams = [];
//     allTeams = await teamData.getAllTeams();

//     if(req.oidc.isAuthenticated()) {
//         let filterObj = {
//             email: req.oidc.user.name
//         };
//         let projectionObj = {
//             "user_metadata.role": 1,
//         };

//         const user = await userData.getUserByEmail(filterObj, projectionObj);
//         userRole = user.user_metadata.role;
//     }

//     res.render("partials/team_list", {
//         title: "Team List",
//         shortcode: 'teamList',
//         isAuthenticated: req.oidc.isAuthenticated(),
//         role: userRole,
//         allTeams: allTeams,
//     });
// });

router.get('/:id/:sport', async (req, res) => {
	try {
		let tournamentId = req.params.id;
		let sportName = req.params.sport;
		let tournamentCoordinator = false;

		let email = 'not authenticated';
		let userRole = '';
		let tournamentJoinedArray = [];

		let poolInfo = await poolsData.getPoolInfo(tournamentId);

		let sportId = '';
		let teamsArray = [];
		let sportIdCheck = null;

		for (let i = 0; i < poolInfo.sports.length; i++) {
			sportIdCheck = await poolsData.getSportDataById(poolInfo.sports[i]);
			if (sportIdCheck.sport == sportName) {
				sportId = poolInfo.sports[i];
				break;
			} else {
				sportIdCheck = null;
			}
		}

		if (sportIdCheck != null) {
			for (let i = 0; i < sportIdCheck.teams.length; i++) {
				let teamInfo = await teamData.getAllTeamsByID(sportIdCheck.teams[i]);
				teamsArray.push(teamInfo);
				teamInfo = null;
			}
		}

		if (req.oidc.isAuthenticated()) {
			email = req.oidc.user.name;

			const user = await userData.getUserByEmail(email);
			userRole = user.user_metadata.role;
			const player = await teamData.getPlayerByUserId(user._id.toString());
			tournamentJoinedArray = await poolsData.getTournamentJoinedByUser(player._id.toString());

			if (user._id.toString() == poolInfo.coordinator) {
				tournamentCoordinator = true;
			}
		}

		res.render('partials/team_list', {
			title: 'Team List',
			shortcode: 'teamList',
			isAuthenticated: req.oidc.isAuthenticated(),
			role: userRole,
			allTeams: teamsArray,
			tournamentId: tournamentId,
			sportName: sportName,
			tournamentCoordinator: tournamentCoordinator,
			tournamentJoinedArray: tournamentJoinedArray,
		});
	} catch (e) {
		return res.status(500).json({ error: e });
	}
});

router.post('/:id/:sport/modal_form_import_team', async (req, res) => {
	let poolId = req.params.id;
	let sportName = req.params.sport;

	try {
		const modalTeamArray = req.body.teamArray;
		let teamId = await teamData.addTeam(modalTeamArray);
		let insertedTeamPool = await poolsData.insertTeam(poolId, sportName, teamId);
		return res.json('form has been imported');
	} catch (e) {
		return res.status(500).json({ error: e });
	}
});

router.post('/:id/:sport/batch_import_team', async (req, res) => {
	let poolId = req.params.id;
	let sportName = req.params.sport;

	try {
		const teamArray = req.body.teamArray;

		for (let i = 0; i < teamArray.length; i++) {
			if(await teamData.checkIfTeamExists(teamArray[i])) {
				let teamId = await teamData.addTeam(teamArray[i]);
				let insertTeam = await poolsData.insertTeam(poolId, sportName, teamId);
			}
		}

		return res.json('insertTeam');
	} catch (e) {
		return res.status(500).json({ error: e });
	}
});

router.post('/:id/:sport/edit_power_ranking', async (req, res) => {

	const tournamentId = req.params.id;
	const sportId = req.params.sport;

	try {
		const newPowerRank = req.body.teamRankObjArr;
		// console.log(newPowerRank)

		for (i = 0; i < newPowerRank.length; i++) {
			const updatePowerRank = await teamData.updatePowerRanking(
				newPowerRank[i].teamName,
				newPowerRank[i].district,
				newPowerRank[i].newPowerRank,
				tournamentId,
				sportId,
			);
		}

		return res.json('');
	} catch (error) {
		return res.status(500).json({ error: error });
	}
});

module.exports = router;
