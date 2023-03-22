const express = require("express");
const router = express.Router();
const data = require('../data')
const userData = data.usersData;
const matchesData = data.matchesData;

router.get("/", async (req, res) => {

    let email = "not authenticated";
    let loggedInUser = {};
    let userRole = "";

    if(req.oidc.isAuthenticated()) {
        email = req.oidc.user.name;
        const user = await userData.getUserByEmail(email);
        loggedInUser = user;
        userRole = loggedInUser.user_metadata.role;
    }

    res.render("partials/court_view", {
        title: 'Current Games by Court', 
        shortcode: 'courtView',
        isAuthenticated: req.oidc.isAuthenticated(),
        loggedInUser: loggedInUser,
        role: userRole,
        year: "2023",
        teamName1: "NJ A", //need code here to take a team from court xyz 
        teamName2: "NJ X", //need code here to take a team from court xyz 
        // might need more teamNames because there are 4 courts
    });
});

// Need a post here
router.post("/", async (req, res) => {
    const matchInfo = req.body;
    
    const insertMatch = await matchesData.insertMatch
    (
        matchInfo.team1, 
        matchInfo.team2, 
        matchInfo.score1, 
        matchInfo.score2, 
        matchInfo.DateObject.getFullYear()
    );

    return res.json(insertMatch);
});

module.exports = router;