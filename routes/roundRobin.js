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

    if(req.oidc.isAuthenticated()) {
        email = req.oidc.user.name;
        const user = await userData.getUserByEmail(email);
        allUsers = await userData.getAllUsers();
        loggedInUser = user;
        nickname = loggedInUser.email
        userRole = loggedInUser.user_metadata.role;
        name = loggedInUser.user_metadata.name;
        rounds = await poolsData.roundRobinSelection();        
    }

    res.render("partials/round_robin", {
        title: "Round-Robin", 
        shortcode: 'roundRobin',
        isAuthenticated: req.oidc.isAuthenticated(),
        rounds: rounds,
    });
});

router.post("/", async (req, res) => {
    const roundRobin = await poolsData.roundRobinSelection();

    return res.json(roundRobin);
});

module.exports = router;