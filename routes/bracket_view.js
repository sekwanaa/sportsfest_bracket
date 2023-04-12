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
        let team1 = {
            name: "team1",
            winner: true,
        };
        let team2 = {
            name: "team2",
            winner: false,
        };
        let team3 = {
            name: "team2",
            winner: true,
        };
        let team4 = {
            name: "team2",
            winner: false,
        };
        let team5 = {
            name: "team2",
            winner: true,
        };
        let team6 = {
            name: "team2",
            winner: false,
        };
        let team7 = {
            name: "team2",
            winner: true,
        };
        let team8 = {
            name: "team2",
            winner: false,
        };
        let team9 = {
            name: "team2",
            winner: true,
        };
        let team10 = {
            name: "team2",
            winner: false,
        };
        let team11 = {
            name: "team2",
            winner: true,
        };
        let team12 = {
            name: "team2",
            winner: false,
        };
        let qteam1 = {
            name: "",
            winner: false,
        };
        let qteam2 = {
            name: "",
            wnner: false
        };
        let qteam3 = {
            name: "",
            winner: false,
        };
        let qteam4 = {
            name: "",
            wnner: false
        };
        let qteam5 = {
            name: "",
            winner: false,
        };
        let qteam6 = {
            name: "",
            wnner: false
        };
        let qteam7 = {
            name: "",
            winner: false,
        };
        let qteam8 = {
            name: "",
            wnner: false
        };
        let steam1 = {
            name: "",
            winner: false,
        };
        let steam2 = {
            name: "",
            wnner: false
        };
        let fteam1 = {
            name: "",
            winner: false,
        };
        let fteam2 = {
            name: "",
            winner: false,
        };
        let numOfSeeds = 12;

        const bracketData = await poolsData.getPlayOffTeams(numOfSeeds);
        
        team1.name = bracketData[0].team;
        team2.name = bracketData[1].team;
        team3.name = bracketData[2].team;
        team4.name = bracketData[3].team;
        team5.name = bracketData[4].team;
        team6.name = bracketData[5].team;
        team7.name = bracketData[6].team;
        team8.name = bracketData[7].team;
        team9.name = bracketData[8].team;
        team10.name = bracketData[9].team;
        team11.name = bracketData[10].team;
        team12.name = bracketData[11].team;

        // const playOffWinner = await poolsData.getPlayOffWinners(playOffWinnersArray);
        // const quarterWinner = await poolsData.getquarterWinners(quarterWinnersArray);
        // const semiWinner = await poolsData.getSemiWinners(semiWinnersArray);
        // const finalWinner = await poolsData.getFinalsWinners(finalsWinnersArray);

        // qteam1.name = playOffWinner[0];
        // qteam2.name = playOffWinner[1];
        // qteam3.name = playOffWinner[2];
        // qteam4.name = playOffWinner[3];
        // qteam5.name = playOffWinner[4];
        // qteam6.name = playOffWinner[5];
        // steam1.name = quarterWinner[0];
        // steam2.name = quarterWinner[1];
        // steam3.name = quarterWinner[2];
        // steam4.name = quarterWinner[3];

        if (team1.winner | team3.winner | team5.winner | team7.winner |team9.winner | team11.winner == true) {
            qteam1.name = team1.name;
            team2.name = team2.name;
            qteam2.name = team3.name;
            qteam3.name = team5.name;
            qteam4.name = team7.name;
            qteam5.name = team9.name;
            qteam6.name = team11.name;
        } else {
            qteam1.name = team2.name;
            qteam2.name = team4.name;
            qteam3.name = team6.name;
            qteam4.name = team8.name;
            qteam5.name = team10.name;
            qteam6.name = team12.name;
        };

        if(req.oidc.isAuthenticated()) {
            email = req.oidc.user.name;
            const user = await userData.getUserByEmail(email);
            loggedInUser = user;
            userRole = loggedInUser.user_metadata.role;
        }

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
            qteam1: qteam1,
            qteam2: qteam2,
            qteam3: qteam3,
            qteam4: qteam4,
            qteam5: qteam5,
            qteam6: qteam6,
            steam1: steam1,
            steam2: steam2,
            fteam1: fteam1,
            fteam2: fteam2,
        });

        return;

    } catch (e) {
        return res.status(500).json({ error: e});
    }
});

module.exports = router;