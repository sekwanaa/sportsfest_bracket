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
        const numOfTeams = await teamData.getAllTeamsCount();
        let numOfSeeds = Math.floor(0.6 * numOfTeams);
        let numOfPlayoffTeams = (numOfSeeds * 2)/3;

        let finalizedSeed = [];
        let matchObj = {};
        let gameNum = 1;
        let fieldCount = 0;

        const seedsCollection = await seeds();
        const playoffsCollection = await playoffs();

        let insertPlayOffGame = null;
        let playOffId = null;

        const seedData = await seedsCollection.find({}).sort({seed: 1}).limit(numOfSeeds).toArray();

        // console.log(seedData);
        for(i=seedData.length-numOfPlayoffTeams; i<(seedData.length-numOfPlayoffTeams)+(numOfPlayoffTeams/2); i++) {
            finalizedSeed.push(seedData[i]);
            finalizedSeed.push(seedData[i+seedData.length-numOfPlayoffTeams]);
            
            matchObj.gameNum = gameNum;
            matchObj.team1 = seedData[i].team;
            matchObj.team2 = seedData[i+seedData.length-numOfPlayoffTeams].team;
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

        //create playoff games for bye teams
        for (i=0; i<seedData.length-numOfPlayoffTeams; i++) {
            finalizedSeed.push(seedData[i]);

            let team2Seed = (i % 4) + 1;
            
            matchObj.gameNum = gameNum;
            matchObj.team1 = seedData[i].team;
            matchObj.team2 = team2Seed;
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

        matchObj = {
            gameNum: null,
            team1: [],
            team2: [],
            field: null,
            complete: false,
        }
        let seedTeamCount = 0;
        //creating semi finals games
        for(i=0; i<(seedData.length-numOfPlayoffTeams)/2; i++) {
            
            let team1Seed = (seedTeamCount % (numOfPlayoffTeams+1)) + 1;
            let team2Seed = (seedTeamCount % (numOfPlayoffTeams+1)) + 3;

            seedTeamCount+=(numOfPlayoffTeams/2);

            matchObj.team1.push(team1Seed);
            matchObj.team1.push(team1Seed+1);
            matchObj.team2.push(team2Seed);
            matchObj.team2.push(team2Seed+1);

            matchObj.gameNum = gameNum;
            // matchObj.team1 = [1,2];
            // matchObj.team2 = [3,4];
            matchObj.field = [fieldCount+1, fieldCount+2];
            matchObj.complete = false;

            insertPlayOffGame = await playoffsCollection.insertOne(matchObj);
            playOffId = insertPlayOffGame.insertedId.toString();
            
            fieldCount+=2;
            fieldCount = fieldCount%4;    
            if(fieldCount == 0) {
                gameNum++;
            }

            matchObj = {
                gameNum: null,
                team1: [],
                team2: [],
                field: null,
                complete: false,
            }
        }

        //creating finals games
        for(i=0; i<(seedData.length-numOfPlayoffTeams)/2; i++) {
            matchObj.gameNum = gameNum;
            matchObj.team1 = null;
            matchObj.team2 = null;
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

    async completeMatch(fieldNum, team1, team2, winner, loser) {

        const poolsCollection = await pools();

        // const stage = await poolsCollection.find({}, {stage: 1});
        
        const poolInfo = await poolsCollection.findOne({});

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
                    }
                }
            )
        }
        else if (stage == 2) {
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
                    }
                }
            )

            //for each team, update seed collection currentPlacement

            const seedsCollection = await seeds();
            const updateTeam1 = await seedsCollection.findOneAndUpdate(
                {
                    team: winner,
                },
                {
                    $inc: {
                        currentPlacement: 1,
                    }
                }
            )
            const updateTeam2 = await seedsCollection.findOneAndUpdate(
                {
                    team: loser,
                },
                {
                    $mul: {
                        currentPlacement: -1,
                    }
                }
            )

            //add winning team to next placement match

            let winnerSeedInfo = await seedsCollection.findOne({team: winner});
            let winnerSeedNum = winnerSeedInfo.seed;

            
            
            const playOffSeed = await playOffCollection.findOne({field: fieldNum, complete: false},{sort: {gameNum: 1}});
            // console.log(playOffSeed);

            //if else block for quarters
            if(playOffSeed.gameNum == 2) {
                const updateNextPlayOffWinner = await playOffCollection.findOneAndUpdate(
                    {
                        field: fieldNum, 
                        complete: false,
                    },
                    {
                        $set: {
                            team2: winner
                        }
                    }, 
                    {
                        sort: 
                        {
                            gameNum: 1
                        }
                    }
                )
            }
            //if else block for semis
            else if(playOffSeed.gameNum == 3) {
                if(winnerSeedNum%4 == 1 || winnerSeedNum%4 == 3) {
                    const updateNextPlayOffWinner = await playOffCollection.findOneAndUpdate(
                        {
                            field: fieldNum, 
                            complete: false,
                        },
                        {
                            $set: {
                                team1: winner
                            }
                        }, 
                        {
                            sort: 
                            {
                                gameNum: 1
                            }
                        }
                    )
                }
                else {
                    const updateNextPlayOffWinner = await playOffCollection.findOneAndUpdate(
                        {
                            field: fieldNum, 
                            complete: false,
                        },
                        {
                            $set: {
                                team2: winner
                            }
                        }, 
                        {
                            sort: 
                            {
                                gameNum: 1
                            }
                        }
                    )
                }
            }
            else if (playOffSeed.gameNum == 4){

            }

            else {

            }
        } else if (stage == 3) {
            
        }

        else {
            console.log("stage 3");
        }

        return stage;
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

        if(seedData.length > 0) {
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
        }

        return playOffTeamsArray;
    },

    async getAllSeeds(placement) {
        let currentPlacement = 0;

        const seedsCollection = await seeds();
        
        if (placement == "eliminated") {
            const seedData = await seedsCollection.find({currentPlacement: {$lt: 0}}).toArray();
            return seedData;
        }

        else {
            if(placement == "playoffs") {
                currentPlacement = 1;
            }
            else if (placement == "quarters") {
                currentPlacement = 2;
            }
            else if (placement == "semis") {
                currentPlacement = 3;
            }
            else if(placement == "finals") {
                currentPlacement = 4;
            }

            const seedData = await seedsCollection.find({currentPlacement: {$gte: currentPlacement}}).sort({seed: 1}).toArray();
            currentPlacement *= -1;
            const loserSeedData = await seedsCollection.find({currentPlacement: {$lte: currentPlacement}}).sort({seed: 1}).toArray();
            let allSeedData = [];

            for(i=0; i<seedData.length; i++) {
                allSeedData.push(seedData[i]);
            }
            for(i=0; i<loserSeedData.length; i++) {
                allSeedData.push(loserSeedData[i]);
            }

            allSeedData.sort((a,b) => (a.seed < b.seed) ? -1 : (a.seed < b.seed) ? 1 : 0);

            return allSeedData;
        }
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
                $inc: {
                    currentPlacement: 1,
                }
            }
        )

        return updatePlacement;
    },

  }
  
  module.exports = exportedMethods;