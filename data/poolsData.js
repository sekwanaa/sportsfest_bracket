const mongoCollections = require("../config/mongoCollections");
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
  }
  
  module.exports = exportedMethods;