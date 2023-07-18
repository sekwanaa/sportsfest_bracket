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

	async getAllTeamsByPowerRanking(teamArray) {
		const teamsCollection = await teams();

		const allTeams = []
		
		//find all teamObjs in the array and push them to allTeams
		for(let i=0; i<teamArray.length; i++) {
			let team = await teamsCollection.findOne({_id: new ObjectId(teamArray[i])});
			allTeams.push(team);
		}

		//sort allTeams by powerRanking
		allTeams.sort((a,b) => (a.powerRanking > b.powerRanking)? 1 : (a.powerRanking < b.powerRanking) ? -1 : 0);

		return allTeams;
	},

	async getAllTeamsCount() {
		const teamsCollection = await teams();

		const allTeams = await teamsCollection.countDocuments();

		return allTeams;
	},

	//method to check if team already exists for batch import
	async checkIfTeamExists(currentTeamsArray, teamObj) {		
		const teamsCollection = await teams();

		const team = await teamsCollection.find(
			{
				name: teamObj.teamName,
				district: teamObj.district,
			},
		).toArray();

		//if the returned teamId exists in the current pool, we return false
		if(team.length > 0) {

			for(let i=0; i<team.length; i++) {
				if(currentTeamsArray.includes(team[i]._id.toString())) {
					return false;
				}
			}
			return true;
		}

		//if no teams exists, we return true
		else {
			return true;
		}
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
		// const playersCollection = await playersData();

		//get teamCaptain Id
		// let teamCaptainId = "";
		let teamCaptain = await this.getPlayerByPlayerId(teamObj.teamCaptain.playerId);
		// let teamCaptain = await playersCollection.findOne({_id: new ObjectId(teamObj.teamCaptain.playerId)});

		if(teamCaptain != null) {
			newTeam.teamCaptain = teamCaptain._id.toString()
		}
		else {
			// const insertTeamCaptain = await playersCollection.insertOne(teamObj.teamCaptain);
			 const playerId = await this.createPlayer(teamObj.teamCaptain);
			 newTeam.teamCaptain = playerId;
			 const playerLinkId = await this.createPlayerLink(playerId);

			// teamCaptainId = insertTeamCaptain.insertedId.toString();
		}
		
		// newTeam.teamCaptain = teamCaptainId;

		for (i = 0; i < teamObj.players.length; i++) {
			const insertPlayerId = await this.createPlayer(teamObj.players[i]);
			// const insertPlayer = await playersCollection.insertOne(teamObj.players[i]);
			// const insertPlayerId = insertPlayer.insertedId.toString();
			newTeam.players.push(insertPlayerId);
			const playerLinkId = await this.createPlayerLink(insertPlayerId);
		}

		const insertTeam = await teamsCollection.insertOne(newTeam);
		const teamsId = insertTeam.insertedId.toString();

		return teamsId;
	},

	//method to check if a player/captain is currently on a team
	// async hasTeam(userId) {
	// 	const playersCollection = await playersData();

	// 	const playerInfo = await playersCollection.findOne({ userId: userId });

	// 	if (playerInfo != null && playerInfo.hasTeam) {
	// 		return true;
	// 	} else {
	// 		return false;
	// 	}
	// },

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
		if (player == null) return null

		return player.code;
	},

	async linkPlayerCode(code, playerId, sportId) {
		const playerLinkCollection = await playerLink();

		const tmpPlayer = await playerLinkCollection.findOne({ code: code });
		const tmpPlayerObjId = tmpPlayer.playerId;

		const playersCollection = await playersData();
		const sportsCollection = await sports();

		const sportData = await sportsCollection.findOne({_id: new ObjectId(sportId)});

		//delete the playerLinkObj in playerLink Collection
		const deletePlayerLink = await playerLinkCollection.deleteOne({ _id: tmpPlayer._id });

		//replace temp player object Id on team with real player id
		for(let i=0; i<sportData.teams.length; i++) {
			const team = await this.getAllTeamsByID(sportData.teams[i]);
			if(team.players.includes(tmpPlayerObjId)) {
				const removePlayerFromTeam = await this.removePlayerFromTeam(team._id.toString(), tmpPlayerObjId, false);
				const addPlayerToTeam = await this.addPlayerToTeam(team._id.toString(), playerId, false);
				break;
			}
			if(team.teamCaptain == tmpPlayerObjId) {
				const removePlayerFromTeam = await this.removePlayerFromTeam(team._id.toString(), tmpPlayerObjId, true);
				const addPlayerToTeam = await this.addPlayerToTeam(team._id.toString(), playerId, true);
				break;
			}
		}
		//delete temp player object
		const tempPlayerDelete = await playersCollection.deleteOne({_id: new ObjectId(tmpPlayerObjId)});

		return;
	},

	async getPlayerByUserId(userId) {
		const playersCollection = await playersData();

		const player = await playersCollection.findOne({ userId: userId });

		return player;
	},

	//creates a player object in player collection and returns the ID
	async createPlayer(playerObj) {
		const playersCollection = await playersData();

		const player = await playersCollection.insertOne(playerObj);
		const playerId = player.insertedId.toString();

		return playerId;
	},

	//creates a playerLink object in playerlink collection and returns the ID
	async createPlayerLink(playerId) {
		const playerLinkCollection = await playerLink();

		let check = true;
		let tempCode = null;

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
			playerId: playerId,
			code: tempCode,
		};

		const insertPlayerLink = await playerLinkCollection.insertOne(playerLinkObj);

		const playerLinkId = insertPlayerLink.insertedId.toString();

		return playerLinkId;
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
			if (player == teamInfo?.players[i]?.name) {
				newPlayersArray.push(teamInfo.players[i]._id.toString());
				continue;
			} else {
				try {
					const insertPlayer = await playersCollection.insertOne({
						name: player,
						shirtNumber: null,
						userId: null,
						// hasTeam: true,
						// linked: false,
					});
					const insertPlayerId = insertPlayer.insertedId.toString();
					newPlayersArray.push(insertPlayerId);
	
					let playerLinkObj = {
						playerId: insertPlayerId,
						code: Math.floor(Math.random() * (100000 - 10000) + 10000),
					};
	
					const insertPlayerLink = await playerLinkCollection.insertOne(playerLinkObj);
				} catch (error) {
					console.log(error)
				}
			}
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

	async updatePowerRanking(teamName, district, newPowerRanking, tournamentId, sportId) {
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

	async getPlayerNameByPlayerId(playerId) {
		const playersCollection = await playersData();

		const player = await playersCollection.findOne({_id: new ObjectId(playerId)});

		return player.name;
	},

	async getPlayerByPlayerId(playerId) {
		const playersCollection = await playersData();

		const player = await playersCollection.findOne({_id: new ObjectId(playerId)});

		return player;
	},

	async removePlayerFromTeam(teamId, playerId, isCaptain) {
		const teamsCollection = await teams();
		
		if(isCaptain == false) {
			const teamRemove = await teamsCollection.findOneAndUpdate(
				{
					_id: new ObjectId(teamId),
				}, 
				{
					$pull: {
						players: playerId,
					},
				}
			)
		}
		else {
			const teamRemove = await teamsCollection.findOneAndUpdate(
				{
					_id: new ObjectId(teamId),
				}, 
				{
					$set: {
						teamCaptain: null,
					},
				}
			)
		}

		return;
	},

	async addPlayerToTeam(teamId, playerId, isCaptain) {
		const teamsCollection = await teams();
		
		if(isCaptain == false) {
			const teamAdd = await teamsCollection.findOneAndUpdate(
				{
					_id: new ObjectId(teamId),
				}, 
				{
					$push: {
						players: playerId,
					},
				}
			)
		}
		else {
			const teamAdd = await teamsCollection.findOneAndUpdate(
				{
					_id: new ObjectId(teamId),
				}, 
				{
					$set: {
						teamCaptain: playerId,
					},
				}
			)
		}

		return;
	},
};

module.exports = exportedMethods;
