const express = require("express");
const router = express.Router();
const data = require('../data')
const userData = data.usersData;
const poolsData = data.poolsData;

router.get("/", async (req, res) => {

    let email = "not authenticated";
    let userRole = "";
    let name = "";
    let rounds;
    let isRounds = false;
    let isStage1 = true;

    try {
        if(req.oidc.isAuthenticated()) {
            let filterObj = {
                email: req.oidc.user.name
            };
            let projectionObj = {
                "user_metadata.role": 1,
                "user_metadata.name": 1,
            };

            const user = await userData.getUserByEmail(filterObj, projectionObj);
            userRole = user.user_metadata.role;
            name = user.user_metadata.name;
        
            rounds = await poolsData.getRoundRobinSchedule();

            if(rounds.length > 0) {
                isRounds = true;
            }
            else {
                isRounds = false;
            }

            filterObj = {
                numOfFields: 1,
            }

            projectionObj = {
                projection: {
                    _id: 0,
                    stage: 1,
                }
            }

            let poolInfo = await poolsData.getPoolInfo(filterObj, projectionObj);

            if(poolInfo.stage > 1) {
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
        let schedule = null;
        
        if(req.body.selection == "roundRobin") {
            schedule = await poolsData.roundRobinSelection();
        } 
        else {
            schedule = await poolsData.createGoldSilverPool();
        }
        return res.json(schedule);
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
    let ref1 = roundRobinInfo.ref1;
    let ref2 = roundRobinInfo.ref2;
    
    try {
        const roundRobinId = await poolsData.insertRoundRobin(gameNum, team1, team2, field, complete, ref1, ref2);

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

router.post("/goldsilver_schedule", async (req, res) => {
    
    try{
        const goldsilver_schedule = await poolsData.createGoldSilverPool();
        return res.json(goldsilver_schedule);
    } catch (e) {
        return res.status(500).json({ error: e});
    }
});

module.exports = router;
