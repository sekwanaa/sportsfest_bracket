const express = require("express");
const router = express.Router();
const data = require('../data');
const userData = data.usersData;
const matchesData = data.matchesData;
const courtviewData = data.courtviewData;
const poolsData = data.poolsData;

router.get("/", async (req, res) => {
    try {
        let email = "not authenticated";
        let loggedInUser = {};
        let userRole = "";
    
        if(req.oidc.isAuthenticated()) {
            email = req.oidc.user.name;
            const user = await userData.getUserByEmail(email);
            loggedInUser = user;
            userRole = loggedInUser.user_metadata.role;
        }
    
        let numOfCourts = await poolsData.getPoolInfo();
        let courtArray = [];
        let courtObj = {};
        let courtData = "";
    
        for (i=0; i<numOfCourts.numOfFields; i++) {
            courtData = await courtviewData.getCurrentGameData(i+1)
            if(courtData.length > 0) {
                courtObj.numOfFields = i+1;
                courtObj.teamName1 = courtData[0].team1;
                courtObj.teamName2 = courtData[0].team2;
                courtArray.push(courtObj);
                courtObj = {};
                courtData = "";
            }
            else {
                courtObj.numOfFields = i+1;
                courtObj.teamName1 = "No team scheduled";
                courtObj.teamName2 = "No team scheduled";
                courtObj.gamesFinished = true;
                courtArray.push(courtObj);
                courtObj = {};
                courtData = "";
            }
        }

        res.render("partials/court_view", {
            title: 'Current Games by Court', 
            shortcode: 'courtView',
            isAuthenticated: req.oidc.isAuthenticated(),
            loggedInUser: loggedInUser,
            role: userRole,
            courtArray: courtArray,
        });
    } catch (e) {
        return res.status(500).json({ error: e});
    }
});




router.post("/", async (req, res) => {
    const matchInfo = req.body;
    const fieldNum = matchInfo.fieldNum;
    
    const insertMatch = await matchesData.insertMatch
    (
        matchInfo.fieldNum,
        matchInfo.team1, 
        matchInfo.team2, 
        matchInfo.score1, 
        matchInfo.score2,
        matchInfo.winner,
        matchInfo.loser, 
        matchInfo.winnerPointDifferential,
        matchInfo.loserPointDifferential,
        matchInfo.year = new Date().getFullYear().toString() // gets the current year, court view can only submit current year scores
    );

    const roundRobin = await poolsData.completeMatch(fieldNum, matchInfo.team1, matchInfo.team2);

    return res.json(insertMatch);
});

router.post("/get_current_game", async (req, res) => {
    const fieldNum = req.body.fieldNum;

    const currentGame = await courtviewData.getCurrentGameData(fieldNum);
    
    return res.json(currentGame);
});

router.post("/playoff", async (req, res) => {
    const matchInfo = req.body;
    const fieldNum = matchInfo.fieldNum;
    
    const insertMatch = await matchesData.insertMatch
    (
        matchInfo.team1, 
        matchInfo.team2, 
        matchInfo.score1, 
        matchInfo.score2,
        matchInfo.winner,
        matchInfo.loser, 
        matchInfo.winnerPointDifferential,
        matchInfo.loserPointDifferential,
        matchInfo.year = new Date().getFullYear().toString(), // gets the current year, court view can only submit current year scores
    );

    const roundRobin = await poolsData.roundRobinCompleteMatch(fieldNum, matchInfo.team1, matchInfo.team2);

    return res.json(insertMatch);
});

module.exports = router;