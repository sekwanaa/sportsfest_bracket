const express = require("express");
const { requiresAuth } = require("express-openid-connect");
const router = express.Router();

const data = require("../data/");


router.get("/", requiresAuth(), async (req, res) => {

    const allMatches = await data.matchesData.getAllMatches();

    res.render("partials/match_insert", {
        allMatches: allMatches,
    });
});

router.post("/", async (req, res) => {
    const matchInfo = req.body;
    
    const insertMatch = await data.matchesData.insertMatch
    (
        matchInfo.team1, 
        matchInfo.team2, 
        matchInfo.score1, 
        matchInfo.score2, 
        matchInfo.year
    );

    return res.json(insertMatch);
});


module.exports = router;