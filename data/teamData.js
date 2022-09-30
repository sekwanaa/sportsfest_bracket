const mongoCollections = require("../config/mongoCollections");
const teams = mongoCollections.teams;

const { ObjectId } = require("mongodb");

let exportedMethods = {
    async getAllTeams() {
        const teamsCollection = await teams();
    
        const allTeams = await teamsCollection.find({}).toArray();

        return allTeams;
      },
}

module.exports = exportedMethods;