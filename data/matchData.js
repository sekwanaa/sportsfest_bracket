const mongoCollections = require("../config/mongoCollections");
const matches = mongoCollections.matches;

let exportedMethods = {

    async getAllMatches() {
        const matchesCollection = await matches();

        const allMatches = await matchesCollection.find({}).toArray();

        return allMatches;
    },

    async insertMatch(team1, team2, score1, score2, year) {
        const matchesCollection = await matches();

        let newMatch = {
            team1: team1,
            team2: team2,
            score1: score1,
            score2, score2,
            year: year,
        };

        const insertMatch = await matchesCollection.insertOne(newMatch);
        const matchId = insertMatch.insertedId.toString();

        return matchId;
    },

}

module.exports = exportedMethods;