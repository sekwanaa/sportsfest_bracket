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
                team1Elim: false,
                team2: "team2",
                team2Elim: false,
            }
        }

        //top 1/3 of teams move onto quarters !!need to fix this so it doesn't apply this every time the page loads

        for(i=0; i<byeTeamsCount; i++) {
            const updateTeamPlacement = await poolsData.updateCurrentPlacement(i+1, "quarters");
        }

        // for(i=Math.floor(byeTeamsCount*.25); i<byeTeamsCount; i++) {
        //     const updateTeamPlacement = await poolsData.updateCurrentPlacement(i+1, "quarters");
        // }

        // for(i=0; i<Math.floor(byeTeamsCount*.25); i++) {
        //     const updateTeamPlacement = await poolsData.updateCurrentPlacement(i+1, "semis");
        // }

        // quarters

        bracketData = null;
        bracketData = await poolsData.getAllSeeds("quarters");
        eliminatedTeams = await poolsData.getAllSeeds("eliminated");
        eliminatedTeamsArr = [];

        let quarterObj = {
            team1: "team1",
            team2: "team2",
        };

        let quarterArr = [];

        for(i=0; i<playOffTeamsCount/2; i++) {
            if(bracketData[i].seed <= byeTeamsCount && bracketData[i].currentPlacement == "quarters") {
                quarterObj.team1 = bracketData[i].team;
            } 

            for(j=0; j<bracketData.length; j++) {
                if (((bracketData[j].seed == byeTeamsCount + bracketData[i].seed) || (bracketData[j].seed == (2*byeTeamsCount + bracketData[i].seed))) && bracketData[j].currentPlacement == "quarters") {
                    quarterObj.team2 = bracketData[j].team;
                }
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

        // eliminated teams get a strikethrough in bracket view

        for (i=0; i<eliminatedTeams.length; i++) {
            eliminatedTeamsArr.push(eliminatedTeams[i].team)
        };

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
            eliminatedTeamsArr: eliminatedTeamsArr,
        });

        return;

    } catch (e) {
        return res.status(500).json({ error: e});
    }
});

module.exports = router;