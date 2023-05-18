const express = require("express");
const router = express.Router();
const data = require('../data')
const userData = data.usersData;
const poolsData = data.poolsData;
const teamsData = data.teamsData;

router.get("/", async (req, res) => {

    try {
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

        // let semiArr = await poolsData.getBracketData("semis");
        let semiArr = await poolsData.getFinals("semis");

        // finals
        
        let finals = await poolsData.getFinals("finals");

        if(req.oidc.isAuthenticated()) {
            let filterObj = {
                email: req.oidc.user.name
            };
            let projectionObj = {
                "user_metadata.role": 1,
            };

            const user = await userData.getUserByEmail(filterObj, projectionObj);
            userRole = user.user_metadata.role;
        }

        res.render("partials/bracket_view", {
            title: 'View Bracket', 
            shortcode: 'bracketView',
            isAuthenticated: req.oidc.isAuthenticated(),
            role: userRole,
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

router.get("/:id", async (req, res) => {

    try {
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

        // let semiArr = await poolsData.getBracketData("semis");
        let semiArr = await poolsData.getFinals("semis");

        // finals
        
        let finals = await poolsData.getFinals("finals");

        if(req.oidc.isAuthenticated()) {
            let filterObj = {
                email: req.oidc.user.name
            };
            let projectionObj = {
                "user_metadata.role": 1,
            };

            const user = await userData.getUserByEmail(filterObj, projectionObj);
            userRole = user.user_metadata.role;
        }

        res.render("partials/bracket_view", {
            title: 'View Bracket', 
            shortcode: 'bracketView',
            isAuthenticated: req.oidc.isAuthenticated(),
            role: userRole,
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

module.exports = router;