const express = require("express");
const router = express.Router();
const data = require('../data')
const userData = data.usersData;
const teamsData = data.teamsData;

router.get("/", async (req, res) => {

    let email = "not authenticated";
    let loggedInUser = {};
    let userRole = "";
    let allUsers = [];
    let nickname = "";
    let name = "";

    if(req.oidc.isAuthenticated()) {
        email = req.oidc.user.name;
        const user = await userData.getUserByEmail(email);
        allUsers = await userData.getAllUsers();
        loggedInUser = user;
        nickname = loggedInUser.email
        userRole = loggedInUser.user_metadata.role;
        name = loggedInUser.user_metadata.name;
    }

    res.render("partials/player_dashboard", {
        title: "Profile", 
        shortcode: 'playerDashboard',
        isAuthenticated: req.oidc.isAuthenticated(),
        loggedInUser: loggedInUser,
        role: userRole,
        allUsers: allUsers,
        length: allUsers.length,
        nickname: nickname,
        name: name,
        hasTeam: false,
    });
});

router.post("/submitTeams", async (req, res) => {

    try {
        
        const teamName  = req.body.teamName;
        const district = req.body.district;
        const players = req.body.players;
        const teamCaptain = req.body.teamCaptain;

        let teamObj = {
            teamName: teamName,
            district: district,
            players: players,
            teamCaptain: teamCaptain,
        };

        const teamId = await teamsData.addTeam(teamObj);

        return res.json(teamId);
    }

    catch(e) {
        console.log(e);
    }

    return;

});

router.post("/", async (req, res) => {
    const personArray = req.body.personArray;

    for(i=0; i<personArray.length; i++) {
        const updateUser = await userData.updateUser(personArray[i].email, personArray[i].role);
    }
});

module.exports = router;