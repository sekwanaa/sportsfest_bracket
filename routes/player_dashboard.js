const express = require("express");
const router = express.Router();
const data = require('../data')
const userData = data.usersData;

router.get("/", async (req, res) => {

    let email = "not authenticated";
    let loggedInUser = {};
    let userRole = "";
    let allUsers = []

    if(req.oidc.isAuthenticated()) {
        email = req.oidc.user.name;
        const user = await userData.getUserByEmail(email);
        allUsers = await userData.getAllUsers();
        loggedInUser = user;
        nickname = loggedInUser.nickname
        userRole = loggedInUser.user_metadata.role;
    }

    res.render("partials/player_dashboard", {
        title: "Player Dashboard", 
        shortcode: 'playerDashboard',
        isAuthenticated: req.oidc.isAuthenticated(),
        loggedInUser: loggedInUser,
        role: userRole,
        allUsers: allUsers,
        length: allUsers.length
    });
});

module.exports = router;