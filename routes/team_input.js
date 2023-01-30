const express = require("express");
const router = express.Router();
const { requiresAuth } = require('express-openid-connect');
const data = require('../data')
const userData = data.usersData;
const teamsData = data.teamsData;

router.get("/", requiresAuth(), async (req, res) => {

    let email = "not authenticated";
    let loggedInUser = {};
    let userRole = "";

    if(req.oidc.isAuthenticated()) {
        email = req.oidc.user.name;
        const user = await userData.getUserByEmail(email);
        loggedInUser = user;
        userRole = loggedInUser.user_metadata.role;
    }

    res.render("partials/team_input", {
        title: "Team Input Form", 
        shortcode: 'teamInput',
        isAuthenticated: req.oidc.isAuthenticated(),
        loggedInUser: loggedInUser,
        role: userRole,
    });
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