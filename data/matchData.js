const mongoCollections = require("../config/mongoCollections");
const matches = mongoCollections.matches;
const teamData = require("./teamData");
const poolsData = require("./poolsData");

let exportedMethods = {

    async getAllMatches() {
        const matchesCollection = await matches();

        const allMatches = await matchesCollection.find({}).toArray();

        return allMatches;
    },

    async insertMatch(fieldNum, team1, team2, score1, score2, winner, loser, winnerPointDifferential, loserPointDifferential, year) {
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

        const completeMatch = await poolsData.completeMatch(fieldNum, team1, team2, winner, loser);

        return matchId;
    },

    async getTeamRecords(tournamentId, sportName) {

        const allTeams = []

        const poolInfo = await poolsData.getPoolInfo(tournamentId);
        const sportInfo = await poolsData.getSportInfo(poolInfo.sports, sportName);

        for(let i=0; i<sportInfo.teams.length; i++) {
            allTeams.push(await teamData.getAllTeamsByID(sportInfo.teams[i]));
        }
        
        const matchesCollection = await matches();

        let matchHistory = [];

        let matchObj = {};
        let winnerCount = "";
        let loserCount = "";
        let pointDiff = 0;
        let winnerMatches = null;
        let loserMatches = null;

        for(i=0; i < allTeams.length; i++) {
            winnerCount = await matchesCollection.count({
                "winner": allTeams[i].name
            });
            loserCount = await matchesCollection.count({
                "loser": allTeams[i].name
            });

            winnerMatches = await matchesCollection.find({"winner": allTeams[i].name}).toArray();
            loserMatches = await matchesCollection.find({"loser": allTeams[i].name}).toArray();

            for(j=0; j<winnerMatches.length; j++) {
                pointDiff += winnerMatches[j].winnerPointDifferential;
            }

            for(j=0; j<loserMatches.length; j++) {
                pointDiff += loserMatches[j].loserPointDifferential;
            }

            matchObj.name = allTeams[i].name;
            matchObj.winnerCount = winnerCount;
            matchObj.loserCount = loserCount;
            matchObj.pointDifferential = pointDiff;

            matchHistory.push(matchObj);
            matchObj = {};
            winnerCount = "";
            loserCount = "";
            pointDiff = 0;
        }

        matchHistory = this.sortMatchHistory(matchHistory);

        return matchHistory;
    },

    async sortMatchHistory(matchHistory) {

        let sortedMatchHistory = matchHistory.sort((a, b) => (a.winnerCount > b.winnerCount) ? -1 : (a.winnerCount < b.winnerCount) ? 1 : 0);

        sortedMatchHistory = sortedMatchHistory.sort((a,b) => 
        {
            if(a.winnerCount === b.winnerCount) {
                return a.pointDifferential > b.pointDifferential ? -1 : (a.pointDifferential < b.pointDifferential) ? 1 : 0
            }
            else {
                return a.pointDifferential < b.pointDifferential ? 1 : (a.pointDifferential < b.pointDifferential) ? -1 : 0
            }
        });

        return sortedMatchHistory;

    },
}

module.exports = exportedMethods;