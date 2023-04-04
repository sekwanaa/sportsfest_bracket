const mongoCollections = require("../config/mongoCollections");
const matches = mongoCollections.matches;
const teamData = require("./teamData");

let exportedMethods = {

    async getAllMatches() {
        const matchesCollection = await matches();

        const allMatches = await matchesCollection.find({}).toArray();

        return allMatches;
    },

    async insertMatch(team1, team2, score1, score2, winner, loser, winnerPointDifferential, loserPointDifferential, year) {
        const matchesCollection = await matches();

        let newMatch = {
            team1: team1,
            team2: team2,
            score1: score1,
            score2: score2,
            winner: winner,
            loser: loser,
            winnerPointDifferential: winnerPointDifferential,
            loserPointDifferential: loserPointDifferential,
            year: year,
        };

        const insertMatch = await matchesCollection.insertOne(newMatch);
        const matchId = insertMatch.insertedId.toString();

        return matchId;
    },

    async getTeamRecords() {

        const allTeams = await teamData.getAllTeams();
        const matchesCollection = await matches();

        let matchHistory = [];

        let matchObj = {};
        let winnerCount = "";
        let loserCount = "";
        let pointDiff = 0;

        for(i=0; i<allTeams.length; i++) {
            winnerCount = await matchesCollection.count({
                "winner": allTeams[i].name
            });
            loserCount = await matchesCollection.count({
                "loser": allTeams[i].name
            });

            // let sumArray = await matchesCollection.aggregate([
            //     {$match: {"winner": allTeams[i].name}},
            //     {$group: {"winner": allTeams[i].name, tmpPointDiff: {$sum: "winnerPointDifferential"}}}
            // ])

            let winnerMatches = await matchesCollection.find({"winner": allTeams[i].name}).toArray();
            let loserMatches = await matchesCollection.find({"loser": allTeams[i].name}).toArray();

            for(i=0; i<winnerMatches.length; i++) {
                pointDiff += winnerMatches[i].winnerPointDifferential;
            }

            for(i=0; i<loserMatches.length; i++) {
                pointDiff += loserMatches[i].loserPointDifferential;
            }

            matchObj.name = allTeams[i].name;
            matchObj.winnerCount = winnerCount;
            matchObj.loserCount = loserCount;
            matchObj.pointDifferential = pointDiff;

            matchHistory.push(matchObj);
            matchObj = {};
            winnerCount = "";
            loserCount = "";
        }

        return matchHistory;
    },
}

module.exports = exportedMethods;