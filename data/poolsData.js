const mongoCollections = require("../config/mongoCollections");
const teamData = require("./teamData");
const pools = mongoCollections.pools;
const roundrobin = mongoCollections.roundrobin;
const seeds = mongoCollections.seeds;
const playoffs = mongoCollections.playoffs;

let exportedMethods = {
  
    //method to insert pool data information
    async insertPool(seedingGames, numOfTeams, numOfFields, numOfPlayoffTeams) {
  
      let newPool = {
          seedingGames: seedingGames,
          numOfTeams: numOfTeams,
          numOfFields: numOfFields,
          numOfPlayoffTeams: numOfPlayoffTeams,
          stage: 1,
      };
  
      const poolsCollection = await pools();
      const insertPool = await poolsCollection.insertOne(newPool);
      const poolId = insertPool.insertedId.toString();
      
      return poolId;
    },

    async incrementStage() {
        const poolsCollection = await pools();
        const incrementPoolStage = await poolsCollection.findOneAndUpdate({},{$inc: {stage: 1}});

        return;
    },

    async getPoolInfo () {
        const poolCollection = await pools();

        const poolInfo = await poolCollection.findOne({});

        return poolInfo;
    },

    //method to create a potential round robin schedule
    async roundRobinSelection() {
        let roundRobinTeamList = [];
        let teamObj = {};

        const allTeams = await teamData.getAllTeams();

        //create a collection of teams 
        for(i=0; i < allTeams.length; i++) {
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
        for(i=0; i<roundRobinTeamList.length; i++) {
            //match team with every other team
            team = roundRobinTeamList[i];
            for (j=0; j<roundRobinTeamList.length; j++) {
                if(team.id == roundRobinTeamList[j].id) {
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

        while(possibleGames.length > 1) {
            gameIndex = Math.floor((Math.random())*possibleGames.length);
            match = possibleGames[gameIndex];
            if(match.team1.gamesSet > 11 || match.team2.gamesSet > 11) {
                possibleGames.splice(gameIndex, 1);
                continue;
            }
            if(match.team1.matchAgainst.includes(match.team2.teamName) || match.team2.matchAgainst.includes(match.team1.teamName)) {
                possibleGames.splice(gameIndex, 1);                
                continue;
            }

            rounds.push(match);
            possibleGames.splice(gameIndex, 1);
            match.team1.gamesSet++;
            match.team2.gamesSet++;
            match.team1.matchAgainst.push(match.team2.teamName)
            match.team2.matchAgainst.push(match.team1.teamName)
        }

        let fields = 0;
        let gameNum = 1;
        let finalRounds = [];
        let count = 1000;
        let gameCount = -1;

        while (rounds.length > 1 && count > 1) {                        
            gameIndex = Math.floor((Math.random())*rounds.length);
            match = rounds[gameIndex];
            if((rounds[gameIndex].team1.gameNum-gameNum <= gameCount && rounds[gameIndex].team2.gameNum-gameNum <= gameCount) || (rounds[gameIndex].team1.gameNum == 0 && rounds[gameIndex].team2.gameNum == 0)) {
                match.field = fields+1;
                match.gameNum = gameNum;
                match.team1.gameNum = gameNum;
                match.team2.gameNum = gameNum;
                fields++;
                fields = fields%4;            
                if(fields == 0) {
                    gameNum++;
                }
                finalRounds.push(match);  
                rounds.splice(gameIndex, 1);
                count = 1000;
            }
            else {
                count--;                
            }
        }

        return finalRounds;
    },

    //method to insert finalized round robin schedule
    async insertRoundRobin(gameNum, team1, team2, field, complete) {

        gameNum = parseInt(gameNum, 10);

        let newRoundRobin = {
            gameNum: gameNum,
            team1: team1,
            team2: team2,
            field: field,
            complete: complete,
        };
    
        const roundRobinCollection = await roundrobin();
        const insertRoundRobin = await roundRobinCollection.insertOne(newRoundRobin);
        const roundRobinId = insertRoundRobin.insertedId.toString();
        
        return roundRobinId;
    },

    //method to insert finalized playoff schedule
    async insertPlayOff() {
        let finalizedSeed = [];
        let matchObj = {};
        let gameNum = 1;
        let fieldCount = 0;

        const seedsCollection = await seeds();
        const playoffsCollection = await playoffs();

        let insertPlayOffGame = null;
        let playOffId = null;

        const seedData = await seedsCollection.find({}).sort({seed: 1}).limit(12).toArray();

        for(i=0; i<seedData.length/2; i++) {
            finalizedSeed.push(seedData[i]);
            finalizedSeed.push(seedData[(seedData.length/2)+i]);
            
            matchObj.gameNum = gameNum;
            matchObj.team1 = seedData[i].team;
            matchObj.team2 = seedData[(seedData.length/2)+i].team;
            matchObj.field = fieldCount+1; 
            matchObj.complete = false;

            insertPlayOffGame = await playoffsCollection.insertOne(matchObj);
            playOffId = insertPlayOffGame.insertedId.toString();
            
            fieldCount++;
            fieldCount = fieldCount%4;            
            if(fieldCount == 0) {
                gameNum++;
            }

            matchObj = {};
        }

        return finalizedSeed;
    },

    async roundRobinCompleteMatch(fieldNum, team1, team2) {
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
                }
            }
        )

        return;
    },

    async playOffsCompleteMatch(fieldNum, team1, team2) {
        const playoffsCollection = await playoffs();

        const updateRoundRobin = await playoffsCollection.findOneAndUpdate(
            {
                field: fieldNum,
                team1: team1,
                team2: team2,
            },
            {
                $set: {
                    complete: true,
                }
            }
        )

        return;
    },

    async getRoundRobinSchedule() {
        const roundRobinCollection = await roundrobin();

        const roundRobinSchedule = await roundRobinCollection.find({}).toArray();

        return roundRobinSchedule;
    },

    async getPlayOffTeams(numOfSeeds, startSeed, endSeed) {
        let playOffTeamsArray = [];
        let playOffGame = {};

        const seedsCollection = await seeds();

        const seedData = await seedsCollection.find({}).sort({seed: 1}).limit(numOfSeeds).toArray();

        for(i=startSeed; i<(startSeed+(endSeed-startSeed)/2); i++) {
            playOffGame.team1 = seedData[i].team;
            playOffGame.team1Placement = seedData[i].currentPlacement;
            playOffGame.team2 = seedData[i+startSeed].team;
            playOffGame.team2Placement = seedData[i+startSeed].currentPlacement;
            playOffTeamsArray.push(playOffGame);
            playOffGame = {};

            // playOffTeamsArray.push(seedData[i]);
            // playOffTeamsArray.push(seedData[(seedData.length/2)+i]);
        }

        // console.log(playOffTeamsArray);

        return playOffTeamsArray;
    },

    async getAllSeeds(placement) {
        const seedsCollection = await seeds();

        const seedData = await seedsCollection.find({currentPlacement: placement}).toArray();

        return seedData;
    },

    async seedInsert(seedsArray) {

        const seedsCollection = await seeds();
        let seedsIdArray = [];

        for(i=0; i<seedsArray.length; i++) {
            let insertSeed = await seedsCollection.insertOne(seedsArray[i]);
            let seedId = insertSeed.insertedId.toString();

            seedsIdArray.push(seedId);
        }

        return seedsIdArray;
    },

    async completeRoundRobin() {
        const roundRobinCollection = await roundrobin();

        const completeRoundRobinGames = await roundRobinCollection.updateMany({complete: false},{$set: {complete: true}});

        const createPlayoffs = await this.insertPlayOff();

        console.log(createPlayoffs);

        const incrementStage = await this.incrementStage();

        return completeRoundRobinGames;
    },

    async updateCurrentPlacement(seedNum, placement) {

        const seedsCollection = await seeds();

        const updatePlacement = await seedsCollection.findOneAndUpdate(
            {
                seed: seedNum,
            },
            {
                $set: {
                    currentPlacement: placement,
                }
            }
        )

        // console.log(seedNum);

        return updatePlacement;
    },

  }
  
  module.exports = exportedMethods;