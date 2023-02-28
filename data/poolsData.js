const mongoCollections = require("../config/mongoCollections");
const { all } = require("../routes/about");

const teamData = require("./teamData");

const pools = mongoCollections.pools;
const teams = mongoCollections.teams;

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
            teamObj.teamName = allTeams[i].name;
            teamObj.district = allTeams[i].district;
            teamObj.players = allTeams[i].players;
            teamObj.gamesSet = 0;
            teamObj.matchAgainst = [];
            roundRobinTeamList.push(teamObj);
            console.log(allTeams[i]);
        }

        console.log(roundRobinTeamList);

        return roundRobinTeamList;
    },


  }
  
  module.exports = exportedMethods;