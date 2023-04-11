const mongoCollections = require("../config/mongoCollections");
const teamData = require("./teamData");
const pools = mongoCollections.pools;
const roundrobin = mongoCollections.roundrobin;
const seeds = mongoCollections.seeds;

let exportedMethods = {
  
    //method to insert pool data information
    async insertPool(seedingGames, numOfTeams, numOfFields, numOfPlayoffTeams) {
  
      let newPool = {
          seedingGames: seedingGames,
          numOfTeams: numOfTeams,
          numOfFields: numOfFields,
          numOfPlayoffTeams: numOfPlayoffTeams
      };
  
      const poolsCollection = await pools();
      const insertPool = await poolsCollection.insertOne(newPool);
      const poolId = insertPool.insertedId.toString();
      
      return poolId;
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
    },

    async getRoundRobinSchedule() {
        const roundRobinCollection = await roundrobin();

        const roundRobinSchedule = await roundRobinCollection.find({}).toArray();

        return roundRobinSchedule;
    },

    async getPlayOffTeams(numOfSeeds) {
        let finalizedSeed = [];
        const seedsCollection = await seeds();

        const seedData = await seedsCollection.find({}).sort({seed: 1}).limit(numOfSeeds).toArray();

        for(i=0; i<seedData.length/2; i++) {
            finalizedSeed.push(seedData[i]);
            finalizedSeed.push(seedData[(seedData.length/2+i)]);
        }

        return finalizedSeed;
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

  }
  
  module.exports = exportedMethods;