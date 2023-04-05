const express = require("express");
const router = express.Router();
const data = require('../data')
const userData = data.usersData;
const matchesData = data.matchesData;
const teamsData = data.teamsData;

router.get("/", async (req, res) => {

    let email = "not authenticated";
    let loggedInUser = {};
    let userRole = "";
    let allUsers = []
    let matches = null;

    if(req.oidc.isAuthenticated()) {
        email = req.oidc.user.name;
        const user = await userData.getUserByEmail(email);
        allUsers = await userData.getAllUsers();
        loggedInUser = user;
        nickname = loggedInUser.nickname
        userRole = loggedInUser.user_metadata.role;
    }

    const matchHistory = await matchesData.getTeamRecords();

    res.render("partials/seeding_table", {
        title: "Seeding Table", 
        shortcode: 'seedingTable',
        isAuthenticated: req.oidc.isAuthenticated(),
        loggedInUser: loggedInUser,
        role: userRole,
        allUsers: allUsers,
        length: allUsers.length,
        matches: matchHistory,
        seedNumber: 0,
    });
});

router.get("/seedCount", async (req, res) => {

    return res.json(await matchesData.getTeamRecords());
});

module.exports = router;