const { ObjectId } = require('mongodb');
const mongoCollections = require('../config/mongoCollections');
const teamData = require('./teamData');

const pools = mongoCollections.pools;
const roundrobin = mongoCollections.roundrobin;
const seeds = mongoCollections.seeds;
const playoffs = mongoCollections.playoffs;
const sports = mongoCollections.sports;
const sportslist = mongoCollections.sportslist;

let exportedMethods = {
	//method to insert pool data information
	async insertPool(poolObj) {
		const poolsCollection = await pools();

		let code = null;

		while (code == null) {
			let tempCode = Math.floor(Math.random() * (100000 - 10000) + 10000);
			let checkCode = await poolsCollection.findOne({ code: tempCode });

			if (checkCode != null) {
				tempCode = Math.floor(Math.random() * (100000 - 10000) + 10000);
			} else {
				code = tempCode;
			}
		}

		poolObj.tournamentCode = code;

		const insertPool = await poolsCollection.insertOne(poolObj);
		const poolId = insertPool.insertedId.toString();

		return poolId;
	},

	async incrementStage(tournamentId) {
		const poolsCollection = await pools();
		const incrementPoolStage = await poolsCollection.findOneAndUpdate({_id: new ObjectId(tournamentId)}, { $inc: { stage: 1 } });

		return;
	},

	async getPoolInfo(tournamentId) {
		const poolCollection = await pools();

		const poolInfo = await poolCollection.findOne({
			_id: new ObjectId(tournamentId),
		});

		return poolInfo;
	},

	async getCurrentPoolStage() {
		const poolCollection = await pools();

		const poolInfo = await poolCollection.findOne({}, { projection: { _id: 0, stage: 1 } });

		return poolInfo.stage;
	},

	//method to create a potential round robin schedule
	async roundRobinSelection(tournamentId, sportName) {
		let roundRobinTeamList = [];
		let teamObj = {};

		const poolsInfo = await this.getPoolInfo(tournamentId);

		let teamsId = [];
		let sportInfo = null;

		//get sport Info
		for(let i=0; i<poolsInfo.sports.length; i++) {
			sportInfo = await this.getSportDataById(poolsInfo.sports[i]);
			if(sportInfo.sport == sportName) {
				teamsId = sportInfo.teams;
				break;
			}
		}

		let allTeams = [];

		for(let i=0; i<teamsId.length; i++) {
			teamInfo = await teamData.getAllTeamsByID(teamsId[i]);
			allTeams.push(teamInfo);
		}

		let numOfFields = sportInfo.numOfFields;
		let numOfRoundRobinGames = sportInfo.numOfSeedingGames;
		let numOfTeams = allTeams.length;

		let numOfRefs = sportInfo.numOfRefs;
		let numOfPlayingTeams = 2;

		//create an array of team Objects
		for (i = 0; i < allTeams.length; i++) {
			teamObj.id = i + 1;
			teamObj.teamName = allTeams[i].name;
			teamObj.district = allTeams[i].district;
			teamObj.players = allTeams[i].players;
			teamObj.gamesSet = 0;
			teamObj.gameNum = 0;
			teamObj.matchAgainst = [];
			roundRobinTeamList.push(teamObj);
			teamObj = {};
		}

		let pool = [];
		let possibleGames = [];
		let gameObj = {};

		//create a matchup for every team against every team
		for (i = 0; i < roundRobinTeamList.length; i++) {
			//match team with every other team
			team = roundRobinTeamList[i];
			for (j = 0; j < roundRobinTeamList.length; j++) {
				if (team.id == roundRobinTeamList[j].id) {
					continue;
				}
				gameObj = {};
				gameObj.team1 = team;
				gameObj.team2 = roundRobinTeamList[j];
				possibleGames.push(gameObj);
			}
		}

		let rounds = [];
		let match;
		let gameIndex = null;

		while (possibleGames.length > 1) {
			//set gameIndex to a random number less than the length of the array of the possible games
			gameIndex = Math.floor(Math.random() * possibleGames.length);

			//select the match inside of possible games at index: gameIndex
			match = possibleGames[gameIndex];

			//check whether team1 or team2 in the teamObj are already scheduled for the number of games they should play in round robin
			//if either team has more than the limit, take the object out of the array and repeat while loop

			if (
				match.team1.gamesSet >= numOfRoundRobinGames ||
				match.team2.gamesSet >= numOfRoundRobinGames
			) {
				possibleGames.splice(gameIndex, 1);
				continue;
			}

			//if either team already played each other, take the object out of the array and repeat while loop
			if (
				match.team1.matchAgainst.includes(match.team2.teamName) ||
				match.team2.matchAgainst.includes(match.team1.teamName)
			) {
				possibleGames.splice(gameIndex, 1);
				continue;
			}

			//add the match to the schedule and take the obj out of the possible games array
			rounds.push(match);
			possibleGames.splice(gameIndex, 1);

			//increment the number of games played for both teams in the object
			match.team1.gamesSet++;
			match.team2.gamesSet++;

			//add respective teams to matchAgainst to each team to show that they already had a match against each other
			match.team1.matchAgainst.push(match.team2.teamName);
			match.team2.matchAgainst.push(match.team1.teamName);
		}

		let fields = 0;
		let gameNum = 1;
		let finalRounds = [];
		let count = 1000;

		//breakCount is used to determine the number of breaks a team has before their next game
		let breakCount = 0;

		let teamsOnCourt = numOfRefs * numOfPlayingTeams;

		let numOfTeamsOnBreak = numOfTeams % (numOfFields * teamsOnCourt);

		while (numOfTeamsOnBreak - teamsOnCourt > teamsOnCourt) {
			numOfTeamsOnBreak -= teamsOnCourt;
			breakCount--;
		}

		while (rounds.length > 1 && count > 1) {
			gameIndex = Math.floor(Math.random() * rounds.length);
			match = rounds[gameIndex];
			if (
				(rounds[gameIndex].team1.gameNum - gameNum <= breakCount &&
					rounds[gameIndex].team2.gameNum - gameNum <= breakCount) ||
				(rounds[gameIndex].team1.gameNum == 0 && rounds[gameIndex].team2.gameNum == 0)
			) {
				match.field = fields + 1;
				match.gameNum = gameNum;
				match.team1.gameNum = gameNum;
				match.team2.gameNum = gameNum;
				match.ref1 = gameNum + 1;
				match.ref2 = gameNum + 1;
				fields++;
				fields = fields % numOfFields;
				if (fields == 0) {
					gameNum++;
				}
				finalRounds.push(match);
				rounds.splice(gameIndex, 1);
				count = 1000;
			} else {
				count--;
			}
		}

		for (i = 0; i < finalRounds.length; i++) {
			for (j = 0; j < finalRounds.length; j++) {
				if (
					finalRounds[i].ref1 % (finalRounds[finalRounds.length - 1].ref1 - 1) ==
						finalRounds[j].gameNum &&
					finalRounds[i].field == finalRounds[j].field
				) {
					finalRounds[i].ref1 = finalRounds[j].team1.teamName;
					finalRounds[i].ref2 = finalRounds[j].team2.teamName;
				}
			}
		}

		return finalRounds;
	},

	//method to insert finalized round robin schedule
	async insertRoundRobin(gameNum, team1, team2, field, complete, ref1, ref2) {
		
		gameNum = parseInt(gameNum, 10);

		let newRoundRobin = {
			gameNum: gameNum,
			team1: team1,
			team2: team2,
			field: field,
			complete: complete,
			ref1: ref1,
			ref2: ref2,
		};

		const roundRobinCollection = await roundrobin();
		const insertRoundRobin = await roundRobinCollection.insertOne(newRoundRobin);
		const roundRobinId = insertRoundRobin.insertedId.toString();

		// console.log(roundRobinId)

		return roundRobinId;
	},

	//method to insert roundRobin Id into respective sport collection
	async addRoundRobinToSport(tournamentId, sportName, roundRobinId) {
		const sportsCollection = await sports();

		const poolInfo = await this.getPoolInfo(tournamentId);

		for(let i = 0; i<poolInfo.sports.length; i++) {
			let sportInfo = await this.getSportDataById(poolInfo.sports[i]);
			if(sportInfo.sport == sportName) {
				const insertScheduleType = await sportsCollection.findOneAndUpdate(
					{
						_id: sportInfo._id
					},
					{
						$push: {
							schedule: roundRobinId,
						}
					}
				);
				return
			}
		}

		return;
	},

	async insertIntoSportPlayOffs(sportId, playOffId) {
		const sportsCollection = await sports();

		const insertIntoSport = await sportsCollection.findOneAndUpdate(
			{
				_id: sportId,
			},
			{
				$push: {
					playoffs: playOffId,
				}
			}
		)
		
		return;
	},

	//method to insert finalized playoff schedule
	async insertPlayOff(tournamentId, sportName) {

		const poolInfo = await this.getPoolInfo(tournamentId);
		const sportInfo = await this.getSportInfo(poolInfo.sports, sportName);
		
		const numOfFields = sportInfo.numOfFields;
		const numOfTeams = await sportInfo.teams.length;

		let numOfSeeds = Math.floor(0.6 * numOfTeams);
		let numOfPlayoffTeams = sportInfo.numOfPlayoffTeams;

		let finalizedSeed = [];
		let matchObj = {};
		let gameNum = 1;
		let fieldCount = 0;
		let gamesCount = 0;

		// const seedsCollection = await seeds();
		const playoffsCollection = await playoffs();

		let insertPlayOffGame = null;
		let playOffId = null;


		const seedData = await this.returnSeeds(sportInfo.seeds);

		// console.log(seedData);
		// const seedData = await seedsCollection.find({}).sort({ seed: 1 }).limit(numOfSeeds).toArray();

		for (
			let i = seedData.length - numOfPlayoffTeams;
			i < seedData.length - numOfPlayoffTeams + numOfPlayoffTeams / 2;
			i++
		) {
			finalizedSeed.push(seedData[i]);
			finalizedSeed.push(seedData[i + seedData.length - numOfPlayoffTeams]);

			matchObj.gameNum = gameNum;
			matchObj.team1 = seedData[i].team;
			matchObj.team2 = seedData[i + seedData.length - numOfPlayoffTeams].team;
			matchObj.field = fieldCount + 1;
			matchObj.complete = false;

			insertPlayOffGame = await playoffsCollection.insertOne(matchObj);
			playOffId = insertPlayOffGame.insertedId.toString();

			const insertPlayOffGameId = await this.insertIntoSportPlayOffs(sportInfo._id, playOffId);

			fieldCount++;
			fieldCount = fieldCount % numOfFields;

			gamesCount++;

			if (gamesCount == numOfPlayoffTeams / 2) {
				gameNum++;
			}

			matchObj = {};
		}

		//create playoff games for bye teams

		gamesCount = 0;
		fieldCount = 0;
		let startTeam2Seed = [];

		for (i = 0; i < seedData.length - numOfPlayoffTeams; i++) {
			finalizedSeed.push(seedData[i]);

			startTeam2Seed.push(seedData[i].seed + (seedData.length - numOfPlayoffTeams));
			startTeam2Seed.push(seedData[i].seed + (seedData.length - numOfPlayoffTeams) * 2);

			//for seed 1 ---> seed 5 + seed 9

			matchObj.gameNum = gameNum;
			matchObj.team1 = seedData[i].team;
			(matchObj.team2 = 'TBD'), (matchObj.nextTeam2 = startTeam2Seed);
			matchObj.field = fieldCount + 1;
			matchObj.complete = false;

			insertPlayOffGame = await playoffsCollection.insertOne(matchObj);
			playOffId = insertPlayOffGame.insertedId.toString();

			const insertPlayOffGameId = await this.insertIntoSportPlayOffs(sportInfo._id, playOffId);

			fieldCount++;
			fieldCount = fieldCount % numOfFields;

			gamesCount++;

			if (gamesCount == numOfPlayoffTeams / 2) {
				gameNum++;
			}

			startTeam2Seed = [];
			matchObj = {};
		}

		matchObj = {
			gameNum: null,
			team1: 'TBD',
			team2: 'TBD',
			nextTeam1: [],
			nextTeam2: [],
			field: null,
			complete: false,
		};
		let seedTeamCount = 0;

		//creating semi finals games

		gamesCount = 0;
		fieldCount = 0;
		let seedTeams = 1;

		for (i = 0; i < (seedData.length - numOfPlayoffTeams) / 2; i++) {
			seedTeamCount += numOfPlayoffTeams / 2;

			matchObj.team1 = 'TBD';
			matchObj.nextTeam1.push(seedTeams);
			matchObj.nextTeam1.push(seedTeams + (seedData.length - numOfPlayoffTeams));
			matchObj.nextTeam1.push(seedTeams + (seedData.length - numOfPlayoffTeams) * 2);

			matchObj.team2 = 'TBD';
			matchObj.nextTeam2.push(seedTeams + 1);
			matchObj.nextTeam2.push(seedTeams + 1 + (seedData.length - numOfPlayoffTeams));
			matchObj.nextTeam2.push(seedTeams + 1 + (seedData.length - numOfPlayoffTeams) * 2);

			seedTeams += 2;

			matchObj.gameNum = gameNum;
			matchObj.field = fieldCount + 1;
			matchObj.complete = false;

			insertPlayOffGame = await playoffsCollection.insertOne(matchObj);
			playOffId = insertPlayOffGame.insertedId.toString();

			const insertPlayOffGameId = await this.insertIntoSportPlayOffs(sportInfo._id, playOffId);

			fieldCount += 1;
			fieldCount = fieldCount % numOfFields;

			gamesCount++;

			if (gamesCount == 2) {
				gameNum++;
			}

			matchObj = {
				gameNum: null,
				team1: 'TBD',
				team2: 'TBD',
				nextTeam1: [],
				nextTeam2: [],
				field: null,
				complete: false,
			};
		}

		//creating finals games

		gamesCount = 0;
		fieldCount = 0;

		for (i = 0; i < (seedData.length - numOfPlayoffTeams) / 2; i++) {
			matchObj.gameNum = gameNum;
			matchObj.team1 = 'TBD';
			matchObj.team2 = 'TBD';
			matchObj.nextTeam1 = [];
			matchObj.nextTeam2 = [];
			matchObj.field = fieldCount + 1;
			matchObj.complete = false;

			if (i == 0) {
				for (j = 0; j < (seedData.length - numOfPlayoffTeams) / 2; j++) {
					matchObj.team1 = 'TBD';
					matchObj.nextTeam1.push(j + 1);
					matchObj.nextTeam1.push(j + 1 + (seedData.length - numOfPlayoffTeams));
					matchObj.nextTeam1.push(j + 1 + (seedData.length - numOfPlayoffTeams) * 2);

					matchObj.team2 = 'TBD';
					matchObj.nextTeam2.push(j + 3);
					matchObj.nextTeam2.push(j + 3 + (seedData.length - numOfPlayoffTeams));
					matchObj.nextTeam2.push(j + 3 + (seedData.length - numOfPlayoffTeams) * 2);
				}
			} else {
				for (j = 0; j < (seedData.length - numOfPlayoffTeams) / 2; j++) {
					matchObj.team1 = 'TBD';
					matchObj.nextTeam1.push(j + 3);
					matchObj.nextTeam1.push(j + 3 + (seedData.length - numOfPlayoffTeams));
					matchObj.nextTeam1.push(j + 3 + (seedData.length - numOfPlayoffTeams) * 2);

					matchObj.team2 = 'TBD';
					matchObj.nextTeam2.push(j + 1);
					matchObj.nextTeam2.push(j + 1 + (seedData.length - numOfPlayoffTeams));
					matchObj.nextTeam2.push(j + 1 + (seedData.length - numOfPlayoffTeams) * 2);
				}
			}

			insertPlayOffGame = await playoffsCollection.insertOne(matchObj);
			playOffId = insertPlayOffGame.insertedId.toString();

			const insertPlayOffGameId = await this.insertIntoSportPlayOffs(sportInfo._id, playOffId);

			fieldCount += 1;
			fieldCount = fieldCount % numOfFields;
			// if(fieldCount == 0) {
			//     gameNum++;
			// }

			gamesCount++;

			if (gamesCount == 2) {
				gameNum++;
			}

			matchObj = {};
		}

		return finalizedSeed;
	},

	async completeMatch(fieldNum, team1, team2, winner, loser, tournamentId, sportName) {
		const poolsCollection = await pools();

		// const stage = await poolsCollection.find({}, {stage: 1});

		const poolInfo = await poolsCollection.findOne({_id: new ObjectId(tournamentId)});

		const stage = parseInt(poolInfo.stage);

		// const stage = await poolsCollection.aggregate( [ { $project : { _id: 0, stage : 1 } } ] );

		//if current stage is round robin
		if (stage == 1) {
			const roundRobinCollection = await roundrobin();

			const updateRoundRobin = await roundRobinCollection.findOneAndUpdate(
				{
					field: fieldNum,
					team1: team1,
					team2: team2,
				},
				{
					$set: {
						complete: true,
					},
				}
			);
		} else if (stage == 2) {
			const playOffCollection = await playoffs();
			const updatePlayOffs = await playOffCollection.findOneAndUpdate(
				{
					field: fieldNum,
					team1: team1,
					team2: team2,
				},
				{
					$set: {
						complete: true,
					},
				}
			);

			//for each team, update seed collection currentPlacement

			const seedsCollection = await seeds();
			const updateTeam1 = await seedsCollection.findOneAndUpdate(
				{
					team: winner,
				},
				{
					$inc: {
						currentPlacement: 1,
					},
				}
			);
			const updateTeam2 = await seedsCollection.findOneAndUpdate(
				{
					team: loser,
				},
				{
					$mul: {
						currentPlacement: -1,
					},
				}
			);

			//add winning team to next placement match

			let winnerSeedInfo = await seedsCollection.findOne({ team: winner });
			let loserSeedInfo = await seedsCollection.findOne({ team: loser });

			let winnerSeedNum = winnerSeedInfo.seed;
			let winnerCurrentPlacement = winnerSeedInfo.currentPlacement;

			let loserSeedNum = loserSeedInfo.seed;
			let loserCurrentPlacement = loserSeedInfo.currentPlacement;

			if (winnerCurrentPlacement >= 4) {
				return;
			}

			const playOffSeed = await playOffCollection.findOne(
				{ gameNum: winnerCurrentPlacement, complete: false },
				{ sort: { gameNum: 1 } }
			);

			//if else block for quarters
			if (playOffSeed.gameNum == 2) {
				const updateNextPlayOffWinner = await playOffCollection.findOneAndUpdate(
					{
						gameNum: 2,
						nextTeam2: winnerSeedNum,
						complete: false,
					},
					{
						$set: {
							team2: winner,
						},
					},
					{
						sort: {
							gameNum: 1,
						},
					}
				);
			}
			//if else block for semis
			else if (playOffSeed.gameNum == 3) {
				if (winnerSeedNum % 4 == 1 || winnerSeedNum % 4 == 3) {
					const updateNextPlayOffWinner = await playOffCollection.findOneAndUpdate(
						{
							gameNum: 3,
							nextTeam1: winnerSeedNum,
							complete: false,
						},
						{
							$set: {
								team1: winner,
							},
						},
						{
							sort: {
								gameNum: 1,
							},
						}
					);
				} else {
					const updateNextPlayOffWinner = await playOffCollection.findOneAndUpdate(
						{
							gameNum: 3,
							nextTeam2: winnerSeedNum,
							complete: false,
						},
						{
							$set: {
								team2: winner,
							},
						},
						{
							sort: {
								gameNum: 1,
							},
						}
					);
				}
			} else if (playOffSeed.gameNum == 4) {
				if (loserSeedNum % 4 < 3 && loserSeedNum % 4 != 0) {
					const updateNextPlayOffLoser = await playOffCollection.findOneAndUpdate(
						{
							gameNum: 4,
							nextTeam2: loserSeedNum,
							complete: false,
						},
						{
							$set: {
								team2: loser,
							},
						},
						{
							sort: {
								gameNum: 1,
							},
						}
					);

					const updateNextPlayOffWinner = await playOffCollection.findOneAndUpdate(
						{
							gameNum: 4,
							nextTeam1: winnerSeedNum,
							complete: false,
						},
						{
							$set: {
								team1: winner,
							},
						},
						{
							sort: {
								gameNum: 1,
							},
						}
					);
				} else {
					const updateNextPlayOffLoser = await playOffCollection.findOneAndUpdate(
						{
							gameNum: 4,
							nextTeam1: loserSeedNum,
							complete: false,
						},
						{
							$set: {
								team1: loser,
							},
						},
						{
							sort: {
								gameNum: 1,
							},
						}
					);

					const updateNextPlayOffWinner = await playOffCollection.findOneAndUpdate(
						{
							gameNum: 4,
							nextTeam2: winnerSeedNum,
							complete: false,
						},
						{
							$set: {
								team2: winner,
							},
						},
						{
							sort: {
								gameNum: 1,
							},
						}
					);
				}
			} else {
			}
		} else if (stage == 3) {
		} else {
			// console.log('stage 3');
		}

		return stage;
	},

	async getRoundRobinSchedule(tournamentId, sportName) {
		
		const poolInfo = await this.getPoolInfo(tournamentId);
		let sportInfo = null;
		let roundRobinIds = [];

		for(let i=0; i < poolInfo.sports.length; i++) {
			sportInfo = await this.getSportDataById(poolInfo.sports[i]);
			if(sportInfo.sport == sportName) {
				roundRobinIds = sportInfo.schedule;
				break;
			}
		}

		const roundRobinCollection = await roundrobin();

		let roundRobinSchedule = [];

		for(let i=0; i<roundRobinIds.length; i++) {
			const roundRobinGameInfo = await roundRobinCollection.findOne(
				{
					_id: new ObjectId(roundRobinIds[i]),
				},
			)
			roundRobinSchedule.push(roundRobinGameInfo);
		}

		return roundRobinSchedule;
	},

	async returnSeeds(seedIdArray) {

		const seedsCollection = await seeds();

		let tmpSeeds = [];
		for(let i=0; i<seedIdArray.length; i++) {
			const tmpSeed = await seedsCollection.findOne({_id: new ObjectId(seedIdArray[i])});
			tmpSeeds.push(tmpSeed);
		}

		tmpSeeds = tmpSeeds.sort((a, b) => (a.seed > b.seed) ? 1 : (a.seed < b.seed) ? -1 : 0)
		
		return tmpSeeds;
	},

	async getPlayOffTeams(numOfSeeds, startSeed, endSeed, seedIdArray) {
		let playOffTeamsArray = [];
		let playOffGame = {};

		const seedsCollection = await seeds();

		const seedData = await this.returnSeeds(seedIdArray);

		// const seedData = await seedsCollection.find({}).sort({ seed: 1 }).limit(numOfSeeds).toArray();

		if (seedData.length > 0) {
			for (i = startSeed; i < startSeed + (endSeed - startSeed) / 2; i++) {
				playOffGame.team1 = seedData[i].team;
				playOffGame.team1Placement = seedData[i].currentPlacement;
				playOffGame.team2 = seedData[i + startSeed].team;
				playOffGame.team2Placement = seedData[i + startSeed].currentPlacement;
				playOffTeamsArray.push(playOffGame);
				playOffGame = {};

				// playOffTeamsArray.push(seedData[i]);
				// playOffTeamsArray.push(seedData[(seedData.length/2)+i]);
			}
		}

		return playOffTeamsArray;
	},

	async getAllSeeds(placement) {
		let currentPlacement = 0;

		

		const seedsCollection = await seeds();

		if (placement == 'eliminated') {
			const seedData = await seedsCollection.find({ currentPlacement: { $lt: 0 } }).toArray();
			return seedData;
		} 
		
		else {
			if (placement == 'playoffs') {
				currentPlacement = 1;
			} 
			else if (placement == 'quarters') {
				currentPlacement = 2;
			} 
			else if (placement == 'semis') {
				currentPlacement = 3;
			} 
			else if (placement == 'finals') {
				currentPlacement = 4;
			}
			else {
				currentPlacement = currentPlacement;
			}

			const seedData = await seedsCollection
				.find({ currentPlacement: { $gte: currentPlacement } })
				.sort({ seed: 1 })
				.toArray();
			currentPlacement *= -1;

			const loserSeedData = await seedsCollection
				.find({ currentPlacement: { $lte: currentPlacement } })
				.sort({ seed: 1 })
				.toArray();
			let allSeedData = [];

			for (i = 0; i < seedData.length; i++) {
				allSeedData.push(seedData[i]);
			}
			for (i = 0; i < loserSeedData.length; i++) {
				allSeedData.push(loserSeedData[i]);
			}

			allSeedData.sort((a, b) => (a.seed < b.seed ? -1 : a.seed < b.seed ? 1 : 0));

			return allSeedData;
		}
	},

	async seedInsert(seedsArray, tournamentId, sportName) {
		const seedsCollection = await seeds();
		let seedsIdArray = [];

		for (i = 0; i < seedsArray.length; i++) {
			let insertSeed = await seedsCollection.insertOne(seedsArray[i]);
			let seedId = insertSeed.insertedId.toString();

			const insertSeedIntoSport = await this.insertSeedIntoSport(seedId, tournamentId, sportName);
			seedsIdArray.push(seedId);
		}

		return seedsIdArray;
	},

	async insertSeedIntoSport(seedId, tournamentId, sportName) {
		const poolInfo = await this.getPoolInfo(tournamentId);
		const sportInfo = await this.getSportInfo(poolInfo.sports, sportName);

		const sportsCollection = await sports();

		const insertSeedId = await sportsCollection.findOneAndUpdate(
			{
				_id: sportInfo._id,
			},
			{
				$push:
					{
						seeds: seedId,
					}
			}
		)

		return insertSeedId;
	},

	async completeRoundRobin(tournamentId, sportName) {

		const poolInfo = await this.getPoolInfo(tournamentId);
		let sportSchedule = [];

		for(let i = 0; i<poolInfo.sports.length; i++) {
			const sportInfo = await this.getSportDataById(poolInfo.sports[i]);
			if(sportInfo.sport == sportName) {
				sportSchedule = sportInfo.schedule;
				break;
			}
		}

		const roundRobinCollection = await roundrobin();

		for(let i=0; i<sportSchedule.length; i++) {
			const completeRoundRobinGame = roundRobinCollection.findOneAndUpdate(
				{
					_id: new ObjectId(sportSchedule[i]),
					complete: false,
				},
				{
					$set: {
						complete: true,
					}
				}
			)
		}

		// const completeRoundRobinGames = await roundRobinCollection.updateMany(
		// 	{ complete: false },
		// 	{ $set: { complete: true } }
		// );


		//FIX: COME BACK AND FIX THIS

		const createPlayoffs = await this.insertPlayOff(tournamentId, sportName);

		//END FIX

		const incrementStage = await this.incrementStage(tournamentId);
		
		return "completeRoundRobinGames";
	},

	async updateCurrentPlacement(seedNum, placement) {
		const seedsCollection = await seeds();

		const updatePlacement = await seedsCollection.findOneAndUpdate(
			{
				seed: seedNum,
			},
			{
				$inc: {
					currentPlacement: 1,
				},
			}
		);

		return updatePlacement;
	},

	//getBracketData will take a string input, that will determine the round - playoffs, quarters, semis, etc
	//returns an array of objects with team data
	async getBracketData(round) {
		let completedArray = [];
		let finishedTeams = [];

		let gameNum = null;
		if (round == 'playoffs') {
			gameNum = 1;
		} else if (round == 'quarters') {
			gameNum = 2;
		} else if (round == 'semis') {
			gameNum = 3;
		} else if (round == 'finals') {
			gameNum = 4;
		}

		const playoffsCollection = await playoffs();

		const getAllSeedsArray = await this.getAllSeeds(round);

		let currentPlacement = null;
		let teamName = null;
		let seed = null;
		let opponent = null;
		let playOffInfo = null;

		let playOffObj = {
			team1: 'TBD',
			team2: 'TBD',
		};

		for (i = 0; i < getAllSeedsArray.length; i++) {
			currentPlacement = getAllSeedsArray[i].currentPlacement;
			teamName = getAllSeedsArray[i].team;
			seed = getAllSeedsArray[i].seed;
			opponent = null;

			if (finishedTeams.includes(teamName)) {
				continue;
			} else {
				finishedTeams.push(teamName);
				playOffObj.team1 = getAllSeedsArray[i].team;
			}

			playOffInfo = await playoffsCollection.findOne({ gameNum: gameNum, team1: teamName });

			if (playOffInfo == null) {
				playOffInfo = await playoffsCollection.findOne({ gameNum: gameNum, team2: teamName });
				opponent = playOffInfo.team1;
			} else {
				opponent = playOffInfo.team2;
			}

			for (j = 0; j < getAllSeedsArray.length; j++) {
				if (getAllSeedsArray[j].team == opponent) {
					playOffObj.team2 = getAllSeedsArray[j].team;
					finishedTeams.push(getAllSeedsArray[j].team);
					break;
				}
			}
			currentPlacement = null;
			teamName = null;
			seed = null;
			opponent = null;

			completedArray.push(playOffObj);
			playOffObj = {
				team1: 'TBD',
				team2: 'TBD',
			};
		}

		return completedArray;
	},

	async getFinals(round) {
		const playOffCollection = await playoffs();
		let gameNum = null;

		if (round == 'semis') {
			gameNum = 3;
		} else {
			gameNum = 4;
		}

		const finals = playOffCollection.find({ gameNum: gameNum }).sort({ fieldNum: 1 }).toArray();

		return finals;
	},

	async createPoolPlay(tournamentId, sportName) {
		const poolInfo = await this.getPoolInfo(tournamentId);
		const sportInfo = await this.getSportInfo(poolInfo.sports, sportName);

		const numOfFields = sportInfo.numOfFields;

		let poolsArray = [];

		let poolsObj = {
			field: null,
			teams: [],
			games: [],
		};

		// for each court, create 1 pool
		let field = 1;

		for (i = 0; i < numOfFields; i++) {
			poolsObj.field = field;
			poolsArray.push(poolsObj);
			field++;
			poolsObj = {
				field: 'null',
				teams: [],
				games: [],
			};
		}

		const teams = await teamData.getAllTeamsByPowerRanking(sportInfo.teams);

		let teamsPerPool = Math.floor(teams.length / numOfFields);

		/* add numOfTeams/numOfCourts to each pool randomly
        let teamIndex = Math.floor(Math.random()*teams.length);
        let tmpTeamArray = teams;
        field = 1;

        for(i=0; i<poolsArray.length; i++) {
            for(j=0; j<teamsPerPool; j++) {
                poolsArray[i].teams.push(tmpTeamArray[teamIndex]);
                tmpTeamArray.splice(teamIndex, 1);    
                teamIndex = Math.floor(Math.random()*tmpTeamArray.length);
                if(tmpTeamArray.length == 0) {
                    break;
                }
            }
        }

        */

		// add numOfTeams/numOfCourts to each pool by powerranking

		for (i = 0; i < teams.length; i++) {
			poolsArray[i % numOfFields].teams.push(teams[i]);
		}

		//end numOfTeams/numOfCourts to each pool by powerranking

		// teamMatchAgainstCount = 0;

		// each teams plays each other #? of times

		let team1Name = null;
		let gameNum = 0;

		let matchObj = {
			gameNum: null,
			team1: 'TBD',
			team2: 'TBD',
			field: null,
			complete: false,
			ref1: null,
			ref2: null,
		};


		
		let totalGamesArray = [];
		for(let i=0; i<poolsArray.length; i++) {
			//create matchups for each pool of teams
			let gameMatchUps = await this.createMatchUps(poolsArray[i].teams);
			
			//sort games so that teams do not play back to back
			let sortedGameArray = await this.sortMatchUps(gameMatchUps);
		}

		// for each pool
		for (i = 0; i < poolsArray.length; i++) {
			gameNum = 1;

			//create matchup where every team plays every other team
			for (j = 0; j < poolsArray[i].teams.length; j++) {
				for (k = j; k < poolsArray[i].teams.length; k++) {
					if (poolsArray[i].teams[j].name != poolsArray[i].teams[k].name) {
						matchObj.gameNum = gameNum;
						matchObj.team1 = poolsArray[i].teams[j].name;
						matchObj.team2 = poolsArray[i].teams[k].name;
						matchObj.field = i + 1;
						matchObj.ref1 = gameNum + 1;
						matchObj.ref2 = gameNum + 1;
						poolsArray[i].games.push(matchObj);

						matchObj = {
							gameNum: gameNum,
							team1: team1Name,
							team2: null,
							complete: false,
							ref1: null,
							ref2: null,
						};
						gameNum++;
					}
				}
			}
			// delete poolsArray[i].teams;
		}

		//reorganize gameNum so teams do not play back to back if unnecessary
		let gamePool = [];
		let previousGameTeams = [];
		let matchAgainstObj = {};

		// poolsArray[i].teams.length

		for (i = 0; i < poolsArray.length; i++) {
			gameNum = 1;
			gamePool.push(poolsArray[i].games);
			poolsArray[i].games = [];

			gameIndex = 0;
			poolsArray[i].games.push(gamePool[0][gameIndex]);
			gameNum++;

			previousGameTeams = [];
			previousGameTeams.push(gamePool[0][gameIndex].team1);
			previousGameTeams.push(gamePool[0][gameIndex].team2);

			if (matchAgainstObj[gamePool[0][gameIndex].team1]) {
				matchAgainstObj[gamePool[0][gameIndex].team1] += 1;
			} else {
				matchAgainstObj[gamePool[0][gameIndex].team1] = 1;
			}

			if (matchAgainstObj[gamePool[0][gameIndex].team2]) {
				matchAgainstObj[gamePool[0][gameIndex].team2] += 1;
			} else {
				matchAgainstObj[gamePool[0][gameIndex].team2] = 1;
			}

			gamePool[0].splice(gameIndex, 1);
			gameIndex = Math.floor(Math.random() * gamePool[0].length);

			let stuckCount = 0;

			while (gamePool[0].length > 0) {
				if (matchAgainstObj[gamePool[0][gameIndex].team1] == null) {
					matchAgainstObj[gamePool[0][gameIndex].team1] = 0;
				}
				if (matchAgainstObj[gamePool[0][gameIndex].team2] == null) {
					matchAgainstObj[gamePool[0][gameIndex].team2] = 0;
				}
				// (matchAgainstObj[gamePool[0][gameIndex].team1] - gameNum >= -1 || matchAgainstObj[gamePool[0][gameIndex].team2] - gameNum >= -1) &&
				if (
					stuckCount < 1000 &&
					(previousGameTeams.includes(gamePool[0][gameIndex].team1) ||
						previousGameTeams.includes(gamePool[0][gameIndex].team2))
				) {
					gameIndex = Math.floor(Math.random() * gamePool[0].length);
					// console.log(stuckCount);
					stuckCount++;
				} else {
					if (matchAgainstObj[gamePool[0][gameIndex].team1] != null) {
						matchAgainstObj[gamePool[0][gameIndex].team1] += 1;
					} else {
						matchAgainstObj[gamePool[0][gameIndex].team1] = 1;
					}

					if (matchAgainstObj[gamePool[0][gameIndex].team2] != null) {
						matchAgainstObj[gamePool[0][gameIndex].team2] += 1;
					} else {
						matchAgainstObj[gamePool[0][gameIndex].team2] = 1;
					}

					stuckCount = 0;
					gamePool[0][gameIndex].gameNum = gameNum;
					gamePool[0][gameIndex].ref1 = gameNum + 1;
					gamePool[0][gameIndex].ref2 = gameNum + 1;
					gameNum++;

					poolsArray[i].games.push(gamePool[0][gameIndex]);

					previousGameTeams = [];
					previousGameTeams.push(gamePool[0][gameIndex].team1);
					previousGameTeams.push(gamePool[0][gameIndex].team2);
					gamePool[0].splice(gameIndex, 1);

					if (gamePool[0].length > 0) {
						gameIndex = Math.floor(Math.random() * gamePool[0].length);
					}
				}
			}
			gamePool = [];
			// console.log(matchAgainstObj);
			matchAgainstObj = {};
			delete poolsArray[i].teams;
		}

		// add refs to each game
		// for(i=0; i<poolsArray.length; i++) {
		//     for(j=0; j<poolsArray[i].games.length-1; j++) {
		//         if(poolsArray[i].games[j].ref1 == poolsArray[i].games[j+1].gameNum) {
		//             poolsArray[i].games[j].ref1 = poolsArray[i].games[j+1].team1;
		//             poolsArray[i].games[j].ref2 = poolsArray[i].games[j+1].team2;
		//         }
		//     }
		// }

		// top half move to gold
		// bot half move to silver

		// submit seeds, go to playoffs

		// 2 brackets, 1 for gold, 1 for silver
		let finalPoolsArray = [];
		// let finalPoolObj = {
		//     gameNum: gameNum,
		//     team1: team1,
		//     team2: team2,
		//     field: field,
		//     ref1: null,
		//     ref2: null,
		// }

		for (i = 0; i < poolsArray.length; i++) {
			for (j = 0; j < poolsArray[i].games.length; j++) {
				let finalPoolObj = {
					gameNum: poolsArray[i].games[j].gameNum,
					team1: {
						teamName: poolsArray[i].games[j].team1,
					},
					team2: {
						teamName: poolsArray[i].games[j].team2,
					},
					field: poolsArray[i].games[j].field,
					ref1: poolsArray[i].games[j].ref1,
					ref2: poolsArray[i].games[j].ref2,
				};

				finalPoolsArray.push(finalPoolObj);
			}
		}

		finalPoolsArray = finalPoolsArray.sort((a, b) =>
			a.gameNum < b.gameNum ? -1 : a.gameNum > b.gameNum ? 1 : 0
		);

		return finalPoolsArray;
	},

	async createMatchUps(teamsArray) {
		let array = [];

		for(let i=0; i<teamsArray.length; i++) {
			array.push(teamsArray[i]);
		}

		let gamesArray = [];
		let gameNum = 1;

		//create matchups for every team, so every team plays each other once in the pool
		for(let i=0; i<array.length-1; i++) {
			let team1 = array[i];
			// array.splice(i, 1);
			for(let j=i+1; j<array.length; j++) {
				let newMatch = new matchObj(gameNum, team1.name, array[j].name, gameNum+1, gameNum+1);
				gamesArray.push(newMatch)
				gameNum++;
			}
			array = [];
			for(let index=0; index<teamsArray.length; index++) {
				array.push(teamsArray[index]);
			}
		}

		return gamesArray;
	},

	async sortMatchUps(array) {
		let tmpArray = [];
		for(let i=0; i<array.length; i++) {
			tmpArray.push(array[i]);
		}
		let sortedMatches = [];
		
		let gameNum = 1;
		let index = randomNum(tmpArray.length);
		tmpArray[index].gameNum = gameNum;
		tmpArray[index].ref1 = (gameNum)%(array.length)+1;
		tmpArray[index].ref2 = (gameNum)%(array.length)+1;
		gameNum++;
		sortedMatches.push(tmpArray[index]);
		tmpArray.splice(index, 1);
		let count = 0;

		while(tmpArray.length > 0) {
			index = randomNum(tmpArray.length);
			let teamNames = [tmpArray[index].team1, tmpArray[index].team2]
			if(teamNames.includes(sortedMatches[sortedMatches.length-1].team1)  || teamNames.includes(sortedMatches[sortedMatches.length-1].team2)) {
				if(count > 1000) {
					tmpArray[index].gameNum = gameNum;
					tmpArray[index].ref1 = (gameNum)%(array.length)+1;
					tmpArray[index].ref2 = (gameNum)%(array.length)+1;
					gameNum++;
					sortedMatches.push(tmpArray[index]);
					tmpArray.splice(index, 1);	
				}
				else {
					// console.log("goNext")
					count++;
				}
			}
			else {
				//push if criteria is met
				tmpArray[index].gameNum = gameNum;
				tmpArray[index].ref1 = (gameNum)%(array.length)+1;
				tmpArray[index].ref2 = (gameNum)%(array.length)+1;
				gameNum++;
				sortedMatches.push(tmpArray[index]);
				tmpArray.splice(index, 1);
				count = 0;
			}
		}

		function randomNum(num) {
			return (Math.floor(Math.random() * num));
		}

		return sortedMatches;
	},

	async tournamentPrivacy(tournamentID, privacySetting) {
		const poolsCollection = await pools();

		const pool = await poolsCollection.findOneAndUpdate(
			{
				_id: tournamentID,
			},
			{
				$set: {
					privacy: privacySetting,
				},
			}
		);

		return pool;
	},

	async insertSportIntoPool(poolId, sportObj) {
		const poolsCollection = await pools();
		const sportsCollection = await sports();

		const insertSport = await sportsCollection.insertOne(sportObj);
		const insertedId = insertSport.insertedId.toString();

		const insertIntoSportPool = await poolsCollection.findOneAndUpdate(
			{
				_id: new ObjectId(poolId),
			},
			{
				$push: {
					sports: insertedId,
				},
			}
		);
		return;
	},

	async insertTeam(poolId, sportName, teamId) {
		const sportsCollection = await sports();

		const poolInfo = await this.getPoolInfo(poolId);

		for (let i = 0; i < poolInfo.sports.length; i++) {
			let sportInfo = await sportsCollection.findOne({
				_id: new ObjectId(poolInfo.sports[i]),
				sport: sportName,
			});

			if (sportInfo != null) {
				await sportsCollection.findOneAndUpdate(
					{
						_id: new ObjectId(poolInfo.sports[i]),
						sport: sportName,
					},
					{
						$push: {
							teams: teamId,
						},
					}
				);
				break;
			}
		}

		return;
	},

	async getSportDataById(sportId) {
		const sportsCollection = await sports();

		const sportData = await sportsCollection.findOne({ _id: new ObjectId(sportId) });

		return sportData;
	},

	async getSportsList() {
		const sportslistcollection = await sportslist();

		const sportList = await sportslistcollection.find({}).toArray();

		return sportList;
	},

	async addSportToList(sportName) {
		const sportslistcollection = await sportslist();

		const insertSport = await sportslistcollection.insertOne(sportName);
		const insertedSportId = insertSport.insertedId.toString();

		return insertedSportId;
	},

	async getTournamentsCreatedByUser(userId) {
		const poolsCollection = await pools();
		return await poolsCollection
			.find({ coordinator: userId })
			.sort({ tournamentName: 1 })
			.toArray();
	},

	async getTournamentJoinedByUser(playerId) {
		const poolsCollection = await pools();
		return await poolsCollection.find({ players: playerId }).sort({ tournamentName: 1 }).toArray();
	},

	async addPlayerToTournament(playerId, tournamentCode) {
		const poolsCollection = await pools();

		try {
			const insertPlayerInTournament = await poolsCollection.findOneAndUpdate(
				{
					tournamentCode: tournamentCode,
				},
				{
					$push: {
						players: playerId,
					},
				}
			);
				
			if (insertPlayerInTournament.value == null) {
				return "Could not find tournament."
			} else {
				return "success";
			}
		} catch (error) {
			return error	
		}
		
	},

	async updateSportScheduleType(tournamentId, sportName, scheduleType) {
		const sportsCollection = await sports();

		const poolInfo = await this.getPoolInfo(tournamentId);
		
		for(let i = 0; i<poolInfo.sports.length; i++) {
			let sportInfo = await this.getSportDataById(poolInfo.sports[i]);
			if(sportInfo.sport == sportName) {
				const insertScheduleType = await sportsCollection.findOneAndUpdate(
					{
						_id: sportInfo._id
					},
					{
						$set: {
							scheduleType: scheduleType,
						}
					}
				);
				return
			}
		}

		return;
	},

	async getSportInfo(sportsArray, sportName) {
		for(let i=0; i<sportsArray.length; i++) {
			const sportData = await this.getSportDataById(sportsArray[i]);
			if(sportData.sport == sportName) {
				return sportData;
			}
		}

		return null;
	},

	async insertIntoSportMatchHistory(matchId, sportId) {
		const sportsCollection = await sports();

		const insertMatchIntoHistory = await sportsCollection.findOneAndUpdate(
			{
				_id: sportId,
			},
			{
				$push: {
					matchHistory: matchId,
				}
			}
		)

		return;
	},
};

class matchObj {
	constructor(gameNum, team1, team2, ref1, ref2) {
		this.gameNum = gameNum;
		this.team1 = team1;
		this.team2 = team2;
		this.complete = false;
		this.ref1 = ref1;
		this.ref2 = ref2;
	}
}

module.exports = exportedMethods;
