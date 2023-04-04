const express = require("express");
const router = express.Router();
const data = require('../data')
const userData = data.usersData;
const matchesData = data.matchesData;
const courtviewData = data.courtviewData;
const poolsData = data.poolsData;

router.get("/", async (req, res) => {

    let email = "not authenticated";
    let loggedInUser = {};
    let userRole = "";

    if(req.oidc.isAuthenticated()) {
        email = req.oidc.user.name;
        const user = await userData.getUserByEmail(email);
        loggedInUser = user;
        userRole = loggedInUser.user_metadata.role;
    }

    let courtData = await courtviewData.getCurrentGameData(1);
    // console.log(courtData);

    res.render("partials/court_view", {
        title: 'Current Games by Court', 
        shortcode: 'courtView',
        isAuthenticated: req.oidc.isAuthenticated(),
        loggedInUser: loggedInUser,
        role: userRole,
        teamName1: courtData[0].team1, //need code here to take a team from court xyz 
        teamName2: courtData[0].team2, //need code here to take a team from court xyz 
        // might need more teamNames because there are 4 courts
    });
});




router.post("/", async (req, res) => {
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
        matchInfo.year = new Date().getFullYear().toString() // gets the current year, court view can only submit current year scores
    );

    const roundRobin = await poolsData.roundRobinCompleteMatch(fieldNum, matchInfo.team1, matchInfo.team2);

    return res.json(insertMatch);
});

router.post("/get_current_game", async (req, res) => {
    const fieldNum = req.body.fieldNum;

    const currentGame = await courtviewData.getCurrentGameData(fieldNum);
    
    return res.json(currentGame);
});

module.exports = router;