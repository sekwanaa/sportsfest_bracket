const express = require("express");
const router = express.Router();
const data = require('../data')
const userData = data.usersData;
const teamData = data.teamsData;

router.get("/", async (req, res) => {

    let email = "not authenticated";
    let loggedInUser = {};
    let userRole = "";
    let allUsers = [];
    let allTeams = [];
    let nickname = "";
    let name = "";

    if(req.oidc.isAuthenticated()) {
        email = req.oidc.user.name;
        const user = await userData.getUserByEmail(email);
        allUsers = await userData.getAllUsers();
        allTeams = await teamData.getAllTeams();
        loggedInUser = user;
        nickname = loggedInUser.email
        userRole = loggedInUser.user_metadata.role;
        name = loggedInUser.user_metadata.name;
    }

    res.render("partials/team_list", {
        title: "Team List", 
        shortcode: 'teamList',
        isAuthenticated: req.oidc.isAuthenticated(),
        loggedInUser: loggedInUser,
        role: userRole,
        allUsers: allUsers,
        allTeams: allTeams,
        length: allUsers.length,
        nickname: nickname,
        name: name,
        hasTeam: false,
    });
});

router.post("/", async (req, res) => {
    const personArray = req.body.personArray;

    for(i=0; i<personArray.length; i++) {
        const updateUser = await userData.updateUser(personArray[i].email, personArray[i].role);
    }
});

router.post("/edit_power_ranking", async (req, res) => {
    try {
        const newPowerRank = req.body.teamRankObjArr;

        for(i=0; i<newPowerRank.length; i++) {
            // console.log(newPowerRank[i].teamName, newPowerRank[i].district, newPowerRank[i].newPowerRank)
            const updatePowerRank = await teamData.updatePowerRanking(newPowerRank[i].teamName, newPowerRank[i].district, newPowerRank[i].newPowerRank);
        }

        return res.json("")
    } catch (error) {
        return res.status(500).json({ error: error});
    }
});

module.exports = router;