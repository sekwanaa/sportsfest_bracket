const mongoCollections = require("../config/mongoCollections");
const teams = mongoCollections.teams;
const playersData = mongoCollections.players;
const playerLink = mongoCollections.playerlink;

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

        if(teamObj.players[i].linked == false) {
            let playerLinkObj = {
                playerId: insertPlayerId,
                code: Math.floor(Math.random() * (100000 - 10000) + 10000),
            };

            const playerLinkCollection = await playerLink();
            const insertPlayerLink = await playerLinkCollection.insertOne(playerLinkObj);
        }
    }

    const insertTeam = await teamsCollection.insertOne(newTeam);
    const teamsId = insertTeam.insertedId.toString();
    
    return teamsId;
  },

  //method to check if a player/captain is currently on a team
  async hasTeam(userId) {
      const playersCollection = await playersData();

      const playerInfo = await playersCollection.findOne({userId: userId});

      if (playerInfo != null && playerInfo.hasTeam) {
          return true;
      }
      else {
          return false;
      }
  },

  //method to get team data by user ID
  async getTeam(userId) {
      const playersCollection = await playersData();

      const playerInfo = await playersCollection.findOne({userId: userId});
      const playerId = playerInfo._id.toString();

      const teamsCollection = await teams();
      const teamInfo = await teamsCollection.findOne({teamCaptain: playerId});

      const teamCaptainId = new ObjectId(teamInfo.teamCaptain);

      let teamCaptain = await playersCollection.findOne({_id: teamCaptainId});
      
      let teamObj = {
          name: teamInfo.name,
          teamCaptain: teamCaptain.name,
          players: [],
      }

      for(i=0; i < teamInfo.players.length; i++) {
          teamObj.players.push(await playersCollection.findOne({_id: new ObjectId(teamInfo.players[i])}));
      }

      return teamObj;
  },

  async getPlayerLinkCode(playerId) {
        const playerLinkCollection = await playerLink();

        const player = await playerLinkCollection.findOne({playerId: playerId});

        return player.code;
  },

  async linkPlayerCode(code, userId) {
    const playerLinkCollection = await playerLink();

    const player = await playerLinkCollection.findOne({code: code});
    console.log(code)

    const playersCollection = await playersData();

    playersCollection.findOneAndUpdate(
        {
            _id: new ObjectId(player.playerId)
        }, 
        {
            $set: 
                {
                    userId: userId,
                    linked: true,
                }
        });
    
    return;
},
}


module.exports = exportedMethods;