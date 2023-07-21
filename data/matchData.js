const mongoCollections = require("../config/mongoCollections");
const matches = mongoCollections.matches;
const roundrobin = mongoCollections.roundrobin;
const teamData = require("./teamData");
const poolsData = require("./poolsData");

const { ObjectId } = require('mongodb');

let exportedMethods = {

    async getAllMatches() {
        const matchesCollection = await matches();

        const allMatches = await matchesCollection.find({}).toArray();

        return allMatches;
    },

    async insertMatch(newMatch, tournamentId, sportName) {
        const matchesCollection = await matches();

        const insertMatch = await matchesCollection.insertOne(newMatch);
        const matchId = insertMatch.insertedId.toString();

        const poolInfo = await poolsData.getPoolInfo(tournamentId);
        for(let i=0; i<poolInfo.sports.length; i++) {
            let sportData = await poolsData.getSportDataById(poolInfo.sports[i]);
            if(sportData.sport == sportName) {
                let insertIntoSportMatchHistory = await poolsData.insertIntoSportMatchHistory(matchId, sportData._id);
            }
        }

        const completeMatch = await poolsData.completeMatch(newMatch.fieldNum, newMatch.team1, newMatch.team2, newMatch.winner, newMatch.loser, tournamentId, sportName);

        return matchId;
    },

    async checkIfMatchIsCompleted(tournamentId, sportName, matchInfo) {
        const poolInfo = await poolsData.getPoolInfo(tournamentId);
        const sportInfo = await poolsData.getSportInfo(poolInfo.sports, sportName);

        const roundRobinCollection = await roundrobin();
        const playoffCollection = await mongoCollections.playoffs();

        const poolStage = poolInfo.stage;

        let matchArray = [];

        if(poolStage == 1) {
            for(let i=0; i<sportInfo.schedule.length; i++) {
                const match = await roundRobinCollection.findOne({_id: new ObjectId(sportInfo.schedule[i])});
                matchArray.push(match);
            }
        }

        else {
            for(let i=0; i<sportInfo.schedule.length; i++) {
                const match = await playoffCollection.findOne({_id: new ObjectId(sportInfo.playoffs[i])});
                matchArray.push(match);
            }
        }


        let isMatchComplete = null;

        for(let i=0; i<matchArray.length; i++) {
            if(
                matchArray[i].team1 == matchInfo.team1 &&
                matchArray[i].team2 == matchInfo.team2 &&
                matchArray[i].field == matchInfo.fieldNum
            ) {
                isMatchComplete = matchArray[i].complete;
                // console.log(isMatchComplete);
                break;
            }
        }
        return isMatchComplete;
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