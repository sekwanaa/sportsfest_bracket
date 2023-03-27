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
  async addTeam(teamObj) {

    let newTeam = {
      name: teamObj.teamName,
      district: teamObj.district,
      players: [],
      teamCaptain: null,
    };

    const teamsCollection = await teams();
    const playersCollection = await playersData();

    const insertTeamCaptain = await playersCollection.insertOne(teamObj.teamCaptain);
    const insertTeamCaptainId = insertTeamCaptain.insertedId.toString();
    newTeam.teamCaptain = insertTeamCaptainId;

    for(i = 0; i < teamObj.players.length; i++) {
      const insertPlayer = await playersCollection.insertOne(teamObj.players[i]);
      const insertPlayerId = insertPlayer.insertedId.toString();
      newTeam.players.push(insertPlayerId);
    }

    const insertTeam = await teamsCollection.insertOne(newTeam);
    const teamsId = insertTeam.insertedId.toString();
    
    return teamsId;
  },
}


module.exports = exportedMethods;