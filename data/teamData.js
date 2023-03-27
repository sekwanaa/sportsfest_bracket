const mongoCollections = require("../config/mongoCollections");
const teams = mongoCollections.teams;
const playersData = mongoCollections.players;

const { ObjectId } = require("mongodb");

let exportedMethods = {

  //method to get all teams information
  async getAllTeams() {
    const teamsCollection = await teams();

    const allTeams = await teamsCollection.find({}).toArray();

    return allTeams;
  },

  //method to insert team data information
  async addTeam(teamName, district, players) {

    let newTeam = {
      name: teamName,
      district: district,
      players: []
    };

    const teamsCollection = await teams();
    const playersCollection = await playersData();

    for(i = 0; i < players.length; i++) {
      const insertPlayer = await playersCollection.insertOne(players[i]);
      const insertPlayerId = insertPlayer.insertedId.toString();
      newTeam.players.push(insertPlayerId);
    }

    const insertTeam = await teamsCollection.insertOne(newTeam);
    const teamsId = insertTeam.insertedId.toString();
    
    return teamsId;
  },
}


module.exports = exportedMethods;