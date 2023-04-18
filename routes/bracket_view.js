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
            // team1Elim: false,
            team2: "team2",
            // team2Elim: false,
        };
        let playoffArr = [];
        let bracketDataIndex = 0;

        //this will always create the playoff games, even if bracketData is empty
        for(i=numOfSeeds-playOffTeamsCount; i<playOffTeamsCount; i++) {
            //if bracketData contains data, we can insert teams
            if(bracketData.length>0) {
                for(j=bracketDataIndex; j<bracketData.length; j++) {
                    playoffObj.team1 = bracketData[j].team1;
                    playoffObj.team2 = bracketData[j].team2;
                    bracketDataIndex++;

                    playoffArr.push(playoffObj);
            
                    playoffObj = {
                        team1: "team1",
                        team2: "team2",
                    }
                }
            }
            else {
                playoffArr.push(playoffObj);

                playoffObj = {
                    team1: "team1",
                    team2: "team2",
                }
            }
        }

        //top 1/3 of teams move onto quarters

        // quarters

        let quarterArr = await poolsData.getBracketData("quarters");
        eliminatedTeams = await poolsData.getAllSeeds("eliminated");
        eliminatedTeamsArr = [];

        // semis

        let semiArr = await poolsData.getBracketData("semis");

        // let semiObj = {
        //     team1: "team1",
        //     team2: "team2",
        // };

        // bracketDataIndex = 0;
        // let stopBracketDataIndex = 0;

        // for(i=0; i<(numOfSeeds-playOffTeamsCount)/2; i++) {
        //     if(bracketData.length>0 && bracketDataIndex<bracketData.length) {
        //         if(bracketDataIndex+2 <= bracketData.length) {
        //             stopBracketDataIndex = bracketDataIndex+2;
        //         }
        //         else {
        //             stopBracketDataIndex = bracketData.length - bracketDataIndex;
        //         }
        //         for(j=bracketDataIndex; j<stopBracketDataIndex; j++) {
        //             if((bracketData[j].seed%4 == 1 || bracketData[j].seed%4 == 3) && bracketData[j].currentPlacement == 3) {
        //                 //seed%4 == 1 for court 1
        //                 semiObj.team1 = bracketData[j].team;
        //                 //seed%4 == 3 for court 2
        //             }

        //             if ((bracketData[j].seed%4 == 2 || bracketData[j].seed%4 == 0) && bracketData[j].currentPlacement == 3) {
        //                 //seed%4 == 2 for court 1
                        
        //                 semiObj.team2 = bracketData[j].team;

        //                 //seed%4 == 4 for court 2
        //             }

        //             bracketDataIndex++;
        //         }
        //             semiArr.push(semiObj);
                    
        //             semiObj = {
        //                 team1: "team1",
        //                 team2: "team2",
        //             };               
        //     }
        //     else {
        //         semiArr.push(semiObj);

        //         semiObj = {
        //             team1: "team1",
        //             team2: "team2",
        //         };
        //     }
        // }

        // finals
        
        let finals = await poolsData.getFinals();

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
            // bracketData: bracketData,
            playoffArr: playoffArr,
            quarterArr: quarterArr,
            semiArr: semiArr,
            finals: finals,
            eliminatedTeamsArr: eliminatedTeams,
        });

        return;

    } catch (e) {
        return res.status(500).json({ error: e});
    }
});

router.post("/", async (req, res) => {

    try {
        let email = "not authenticated";
        let loggedInUser = {};
        let userRole = "";

        return res.json(await poolsData.getBracketData("quarters"));

    } catch (e) {
        return res.status(500).json({ error: e});
    }
});

module.exports = router;