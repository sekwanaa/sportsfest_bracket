const express = require("express");
const router = express.Router();
const data = require('../data')
const userData = data.usersData;
const poolsData = data.poolsData;

router.get("/", async (req, res) => {

    let email = "not authenticated";
    let loggedInUser = {};
    let userRole = "";
    let allUsers = [];
    let nickname = "";
    let name = "";
    let rounds;
    let isRounds = false;
    let isStage1 = true;

    try {
        if(req.oidc.isAuthenticated()) {
            email = req.oidc.user.name;
            const user = await userData.getUserByEmail(email);
            allUsers = await userData.getAllUsers();
            loggedInUser = user;
            nickname = loggedInUser.email
            userRole = loggedInUser.user_metadata.role;
            name = loggedInUser.user_metadata.name;
        
            rounds = await poolsData.getRoundRobinSchedule();
            if(rounds.length > 0) {
                isRounds = true;
            }
            else {
                isRounds = false;                
            }
            let poolInfo = await poolsData.getPoolInfo();
            let currentStage = poolInfo.stage;

            if(currentStage > 1) {
                isStage1 = false;
            }
        }
    
        res.render("partials/round_robin", {
            title: "Round-Robin", 
            shortcode: 'roundRobin',
            isAuthenticated: req.oidc.isAuthenticated(),
            role: userRole,
            rounds: rounds,
            isRounds: isRounds,
            isStage1: isStage1,
        });
    } catch (e) {
        return res.status(500).json({ error: e});
    }

});

router.post("/", async (req, res) => {
    
    try{
        const roundRobin = await poolsData.roundRobinSelection();
        return res.json(roundRobin);
    } catch (e) {
        return res.status(500).json({ error: e});
    }
});

router.post("/round_robin_schedule", async (req, res) => {
    let roundRobinInfo = req.body.roundRobinMatches;
    
    let gameNum = roundRobinInfo.gameNum;
    let team1 = roundRobinInfo.team1;
    let team2 = roundRobinInfo.team2;
    let field = roundRobinInfo.field;
    let complete = roundRobinInfo.complete;
    
    try {
        const roundRobinId = await poolsData.insertRoundRobin(gameNum, team1, team2, field, complete);

        return res.json(roundRobinId);
    } catch (e) {
        return res.status(500).json({ error: e});
    }
});

router.post("/round_robin_complete", async (req, res) => {
    
    try{
        const roundRobinComplete = await poolsData.completeRoundRobin();
        return res.json(roundRobinComplete);
    } catch (e) {
        return res.status(500).json({ error: e});
    }
});

module.exports = router;
