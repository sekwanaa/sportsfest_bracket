const express = require("express");
const router = express.Router();
const { requiresAuth } = require('express-openid-connect');

const data = require("../data/");
const teamsData = data.teamsData

router.get("/", requiresAuth(), async (req, res) => {

    res.render("partials/team_input", {title: "Team Input Form", shortcode: 'teamInput'});
});

router.post("/submitTeams", async (req, res) => {

    try {
        
        const teamName  = req.body.teamName;
        const district = req.body.district;
        const players = req.body.players;

        const teamId = await teamsData.addTeam(teamName, district, players);

        return res.json(teamId);
    }

    catch(e) {
        console.log(e);
    }

    return;

});

router.get("/allTeams", async (req, res) => {
    try {
        // console.log(await teamsData.getAllTeams());
        //new edit
        const teamName = await teamsData.getAllTeams()
        console.log(teamName[0].name);
        return res.json(teamName);
    }

    catch(e) {
        console.log(e);
    }
});

module.exports = router;