const express = require("express");
const router = express.Router();
const data = require('../data')
const userData = data.usersData;
const poolsData = data.poolsData;
const teamsData = data.teamsData;

router.get("/", async (req, res) => {

    try {
        let email = "not authenticated";
        let loggedInUser = {};
        let userRole = "";

        const numOfTeams = await teamsData.getAllTeamsCount();
        let numOfSeeds = Math.floor(numOfTeams * 0.6); //60% of teams move on from the round robin
        let playOffTeamsCount = (numOfSeeds * 2) / 3; //2/3 of the qualified teams stay in playoffs
        let byeTeamsCount = numOfSeeds-playOffTeamsCount; //1/3 of the qualified teams get a bye

        // playoffs

        let bracketData = await poolsData.getPlayOffTeams(numOfSeeds, byeTeamsCount, numOfSeeds);

        let playoffObj = {
            team1: "team1",
            team2: "team2",
        };
        let playoffArr = [];
        
        for(i=0; i<bracketData.length; i++) { //bottom 2/3 of qualifiers are in playoffs
            playoffObj.team1 = bracketData[i].team1;
            playoffObj.team2 = bracketData[i].team2;

            playoffArr.push(playoffObj);
            
            playoffObj = {
                team1: "team1",
                team2: "team2",
            }
        }

        //update currentPlacement on remaining 4 teams (top 25% goes to semis rest go to quarters)

        for(i=Math.floor(byeTeamsCount*.25); i<byeTeamsCount; i++) {
            const updateTeamPlacement = await poolsData.updateCurrentPlacement(i+1, "quarters");
        }

        for(i=0; i<Math.floor(byeTeamsCount*.25); i++) {
            const updateTeamPlacement = await poolsData.updateCurrentPlacement(i+1, "semis");
        }

        // quarters

        bracketData = null;
        bracketData = await poolsData.getAllSeeds("quarters");

        let quarterObj = {
            team1: "team1",
            team2: "team2",
        };

        let quarterArr = [];

        for(i=0; i<bracketData.length; i++) {
            if(bracketData[i].seed <= byeTeamsCount && bracketData[i].currentPlacement == "quarters") {
                quarterObj.team1 = bracketData[i].team;
            } 

            if (bracketData[i].seed > byeTeamsCount && bracketData[i].currentPlacement == "quarters") {
                quarterObj.team2 = bracketData[i].team;
            } 

            quarterArr.push(quarterObj);
            quarterObj = {
                team1: "team1",
                team2: "team2",
            };
        }

        // semis

        bracketData = null;
        bracketData = await poolsData.getAllSeeds("semis");

        let semiArr = [];
        let semiObj = {
            team1: "team1",
            team2: "team2",
        };
        
        for(i=0; i<bracketData.length; i++) {
            if(bracketData[i].seed <= byeTeamsCount*.25 && bracketData[i].currentPlacement == "semis") {
                semiObj.team1 = bracketData[i].team;
            } 

            if (bracketData[i].seed > byeTeamsCount*.25 && bracketData[i].currentPlacement == "semis") {
                semiObj.team2 = bracketData[i].team;
            } 

            semiArr.push(semiObj);
            semiObj = {
                team1: "team1",
                team2: "team2",
            };
        }

        // finals

        let finalsObj = {
            team1: "team1",
            team2: "team2",
        }

        bracketData = await poolsData.getAllSeeds("finals");

        if(bracketData.length != 0) {
            finalsObj[0].team1 = bracketData.team;
            finalsObj[1].team2 = bracketData.team;
        }

        // const playOffWinner = await poolsData.getPlayOffWinners(playOffWinnersArray);
        // const quarterWinner = await poolsData.getquarterWinners(quarterWinnersArray);
        // const semiWinner = await poolsData.getSemiWinners(semiWinnersArray);
        // const finalWinner = await poolsData.getFinalsWinners(finalsWinnersArray);

        if(req.oidc.isAuthenticated()) {
            email = req.oidc.user.name;
            const user = await userData.getUserByEmail(email);
            loggedInUser = user;
            userRole = loggedInUser.user_metadata.role;
        }

        res.render("partials/bracket_view", {
            title: 'View Bracket', 
            shortcode: 'bracketView',
            isAuthenticated: req.oidc.isAuthenticated(),
            loggedInUser: loggedInUser,
            role: userRole,
            bracketData: bracketData,
            playoffArr: playoffArr,
            quarterArr: quarterArr,
            semiArr: semiArr,
            finalsObj: finalsObj,
        });

        return;

    } catch (e) {
        return res.status(500).json({ error: e});
    }
});

module.exports = router;