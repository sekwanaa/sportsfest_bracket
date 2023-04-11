const express = require("express");
const router = express.Router();
const data = require('../data')
const userData = data.usersData;
const poolsData = data.poolsData;

router.get("/", async (req, res) => {

    try {
        let email = "not authenticated";
        let loggedInUser = {};
        let userRole = "";
        let team1 = "team 1";
        let team2 = "team 2";
        let team3 = "team 3";
        let team4 = "team 4";
        let team5 = "team 5";
        let team6 = "team 6";
        let team7 = "team 7";
        let team8 = "team 8";
        let team9 = "team 9";
        let team10 = "team 10";
        let team11 = "team 11";
        let team12 = "team 12";
        let numOfSeeds = 12;
    
        if(req.oidc.isAuthenticated()) {
            email = req.oidc.user.name;
            const user = await userData.getUserByEmail(email);
            loggedInUser = user;
            userRole = loggedInUser.user_metadata.role;
        }
    
        const bracketData = await poolsData.getPlayOffTeams(numOfSeeds);
        
        team1 = bracketData[0].team,
        team2 = bracketData[1].team,
        team3 = bracketData[2].team,
        team4 = bracketData[3].team,
        team5 = bracketData[4].team,
        team6 = bracketData[5].team,
        team7 = bracketData[6].team,
        team8 = bracketData[7].team,
        team9 = bracketData[8].team,
        team10 = bracketData[9].team,
        team11 = bracketData[10].team,
        team12 = bracketData[11].team,

        res.render("partials/bracket_view", {
            title: 'View Bracket', 
            shortcode: 'bracketView',
            isAuthenticated: req.oidc.isAuthenticated(),
            loggedInUser: loggedInUser,
            role: userRole,
            team1: team1,
            team2: team2,
            team3: team3,
            team4: team4,
            team5: team5,
            team6: team6,
            team7: team7,
            team8: team8,
            team9: team9,
            team10: team10,
            team11: team11,
            team12: team12,
        });

        return;

    } catch (e) {
        return res.status(500).json({ error: e});
    }
});

module.exports = router;