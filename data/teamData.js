const mongoCollections = require('../config/mongoCollections');
const teams = mongoCollections.teams;
const playersData = mongoCollections.players;
const playerLink = mongoCollections.playerlink;
const sports = mongoCollections.sports;

const { ObjectId } = require('mongodb');

let exportedMethods = {
	//method to get all teams information
	async getAllTeams() {
		const teamsCollection = await teams();

		const allTeams = await teamsCollection.find({}).toArray();

		return allTeams;
	},

	//method to get all teams information by ID
	async getAllTeamsByID(teamId) {
		const teamsCollection = await teams();

		const team = await teamsCollection.findOne({
			_id: new ObjectId(teamId),
		});

		return team;
	},

	async getAllTeamsByPowerRanking() {
		const teamsCollection = await teams();

		const allTeams = await teamsCollection.find({}).sort({ powerRanking: 1 }).toArray();

		return allTeams;
	},

	async getAllTeamsCount() {
		const teamsCollection = await teams();

		const allTeams = await teamsCollection.countDocuments();

		return allTeams;
	},

	//method to insert team data information
	async addTeam(teamObj) {
		let newTeam = {
			name: teamObj.teamName,
			district: teamObj.district,
			players: [],
			teamCaptain: null,
			powerRanking: teamObj.powerRanking,
		};

		const teamsCollection = await teams();
		const playersCollection = await playersData();

		const insertTeamCaptain = await playersCollection.insertOne(teamObj.teamCaptain);
		const insertTeamCaptainId = insertTeamCaptain.insertedId.toString();
		newTeam.teamCaptain = insertTeamCaptainId;

		for (i = 0; i < teamObj.players.length; i++) {
			const insertPlayer = await playersCollection.insertOne(teamObj.players[i]);
			const insertPlayerId = insertPlayer.insertedId.toString();
			newTeam.players.push(insertPlayerId);
			let check = true;
			let tempCode = null;

			if (teamObj.players[i].linked == false) {
				const playerLinkCollection = await playerLink();
				while (check == true) {
					tempCode = Math.floor(Math.random() * (100000 - 10000) + 10000);

					let checkCode = await playerLinkCollection.findOne({ code: tempCode });
					if (checkCode != null) {
						tempCode = Math.floor(Math.random() * (100000 - 10000) + 10000);
					} else {
						check = false;
					}
				}
				let playerLinkObj = {
					playerId: insertPlayerId,
					code: Math.floor(Math.random() * (100000 - 10000) + 10000),
				};

				const insertPlayerLink = await playerLinkCollection.insertOne(playerLinkObj);
			}
		}

		const insertTeam = await teamsCollection.insertOne(newTeam);
		const teamsId = insertTeam.insertedId.toString();

		return teamsId;
	},

	//method to check if a player/captain is currently on a team
	async hasTeam(userId) {
		const playersCollection = await playersData();

		const playerInfo = await playersCollection.findOne({ userId: userId });

		if (playerInfo != null && playerInfo.hasTeam) {
			return true;
		} else {
			return false;
		}
	},

	//method to get team data by user ID
	async getTeam(userId) {
		const playersCollection = await playersData();

		const playerInfo = await playersCollection.findOne({ userId: userId });
		const playerId = playerInfo._id.toString();

		const teamsCollection = await teams();
		let teamInfo = await teamsCollection.findOne({ teamCaptain: playerId });

		if (teamInfo == null) {
			teamInfo = await teamsCollection.findOne({ players: { $in: [playerId] } });
		}

		const teamCaptainId = new ObjectId(teamInfo.teamCaptain);

		let teamCaptain = await playersCollection.findOne({ _id: teamCaptainId });

		let teamObj = {
			name: teamInfo.name,
			district: teamInfo.district,
			teamCaptain: teamCaptain.name,
			players: [],
		};

		for (i = 0; i < teamInfo.players.length; i++) {
			teamObj.players.push(
				await playersCollection.findOne({ _id: new ObjectId(teamInfo.players[i]) })
			);
		}

		return teamObj;
	},

	async getPlayerLinkCode(playerId) {
		const playerLinkCollection = await playerLink();

		const player = await playerLinkCollection.findOne({ playerId: playerId });

		return player.code;
	},

	async linkPlayerCode(code, userId) {
		const playerLinkCollection = await playerLink();

		const player = await playerLinkCollection.findOne({ code: code });

		const playersCollection = await playersData();

		const playerUpdate = playersCollection.findOneAndUpdate(
			{
				_id: new ObjectId(player.playerId),
			},
			{
				$set: {
					userId: userId,
					linked: true,
				},
			}
		);

		const deletePlayerLink = playerLinkCollection.deleteOne({ playerId: player.playerId });

		return;
	},

	async getPlayerByUserId(userId) {
		const playersCollection = await playersData();

		const player = await playersCollection.findOne({ userId: userId });

		return player;
	},

	async createPlayer(playerObj) {
		const playersCollection = await playersData();

		const player = await playersCollection.insertOne(playerObj);

		return player;
	},

	async checkPlayerExists(userId) {
		const playersCollection = await playersData();

		const player = await playersCollection.findOne({ userId: userId });

		if (player == null) {
			return false;
		} else {
			return true;
		}
	},

	async updateTeamInfo(teamObj) {
		const teamsCollection = await teams();
		const playersCollection = await playersData();
		const playerLinkCollection = await playerLink();

		let teamCaptainInfo = await this.getPlayerByUserId(teamObj.userId);

		const updateTeam = await teamsCollection.findOneAndUpdate(
			{
				teamCaptain: teamCaptainInfo._id.toString(),
			},
			{
				$set: {
					name: teamObj.name,
					district: teamObj.district,
				},
			}
		);

		let teamInfo = await this.getTeam(teamObj.userId);

		let newPlayersArray = [];

		for (i = 0; i < teamObj.players.length; i++) {
			let player = teamObj.players[i];
			for (j = 0; j < teamInfo.players.length; j++) {
				if (player == teamInfo.players[j].name) {
					newPlayersArray.push(teamInfo.players[j]._id.toString());
					break;
				}
				if (j == teamInfo.players.length - 1) {
					const insertPlayer = await playersCollection.insertOne({
						name: player,
						shirtNumber: null,
						userId: null,
						hasTeam: true,
						linked: false,
					});
					const insertPlayerId = insertPlayer.insertedId.toString();
					newPlayersArray.push(insertPlayerId);

					let playerLinkObj = {
						playerId: insertPlayerId,
						code: Math.floor(Math.random() * (100000 - 10000) + 10000),
					};

					const insertPlayerLink = await playerLinkCollection.insertOne(playerLinkObj);
				}
			}
			player = null;
		}

		const updateTeamPlayers = await teamsCollection.findOneAndUpdate(
			{
				teamCaptain: teamCaptainInfo._id.toString(),
			},
			{
				$set: {
					players: newPlayersArray,
				},
			}
		);
		return updateTeamPlayers;
	},

	async updatePowerRanking(teamName, district, newPowerRanking) {
		const teamsCollection = await teams();

		//find team by team name and district and update their power ranking
		const updatePowerRanking = await teamsCollection.findOneAndUpdate(
			{
				name: teamName,
				district: district,
			},
			{
				$set: {
					powerRanking: newPowerRanking,
				},
			}
		);
		return updatePowerRanking;
	},

	async addTeamToSport(teamId, sportId) {
		
		//insert teamId into sport collection
		const sportsCollection = await sports();

		const insertTeamIntoSport = sportsCollection.findOneAndUpdate({_id: new ObjectId(sportId)},{$push: {teams: teamId}});

		return;
	},

	async getTeamByTournament(tournamentId, sportId, playerId) {

		const poolsCollection = await pools();
		const sportsCollection = await sports();
		const teamsCollection = await teams();

		const tournament = await poolsCollection.find({_id: new ObjectId(tournamentId)});

		//iterate through each sport
		for(let i = 0; i < tournament.sports.length; i++) {

			let tournamentSportId = tournament.sports[i];
			let tournamentSportInfo = await sportsCollection.findOne({_id: new ObjectId(tournamentSportId)});

			//iterate through each team
			for(let j = 0; j < tournamentSportInfo.teams.length; j++) {
				let team = await teamsCollection.findOne({_id: new ObjectId(tournamentSportInfo.teams[j])});
				if(team.players.includes(playerId) || team.teamCaptain == playerId) {
					return team;
				}
			}
		}
		
		return null;
	},

	async displayCurrentTeam(sportId, playerId) {

		const sportsCollection = await sports();
		const teamsCollection = await teams();

		const sportInfo = await sportsCollection.findOne({_id: new ObjectId(sportId)});

		for(let i = 0; i < sportInfo.teams.length; i++) {
			let teamInfo = await teamsCollection.findOne({_id: new ObjectId(sportInfo.teams[i])});
			if(teamInfo.players.includes(playerId) || teamInfo.teamCaptain == playerId) {
				return teamInfo;
			}
		}

		return null;
	},
};

module.exports = exportedMethods;
