const mongoCollections = require("../config/mongoCollections");
const teamData = require("./teamData");
const pools = mongoCollections.pools;

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

        //console.log(roundRobinTeamList);

        let pool = [];
        let possibleGames = [];
        let gameObj = {};

        //create a matchup for every team against every team
        for(i=0; i<roundRobinTeamList.length; i++) {
            //match team with every other team
            team = roundRobinTeamList[i];
            // console.log(team);
            //console.log(pool);
            for (j=0; j<roundRobinTeamList.length; j++) {
                if(team.id == roundRobinTeamList[j].id) {
                    // console.log(team);
                    continue;
                }
                gameObj = {};
                gameObj.team1 = team;
                gameObj.team2 = roundRobinTeamList[j];
                possibleGames.push(gameObj);
                //console.log(possibleGames);
                
                // console.log(team.teamName + " vs "+ j.teamName)
            }
        }

        let numOfGamesToPlay = 12;

        let gameSelection = 0;
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

            // console.log(possibleGames.length);
        }

        let fields = 0;
        let gameNum = 1;
        let finalRounds = [];
        let count = 1000;
        let gameCount = -1;

        while (rounds.length > 1 && count > 1) {                        
            gameIndex = Math.floor((Math.random())*rounds.length);
            match = rounds[gameIndex];
            // console.log(gameIndex);
            // console.log(match);
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
                console.log("gameNum: " + gameNum);
            }
            else {
                console.log(rounds[gameIndex].team1.gameNum);
                console.log(rounds[gameIndex].team2.gameNum);                
                console.log("gameNum: " + gameNum);
                // console.log("rounds length: " + rounds.length);
                count--;
                // console.log(count);
            }
        }

        return finalRounds;
    },


  }
  
  module.exports = exportedMethods;