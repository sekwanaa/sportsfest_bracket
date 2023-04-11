const express = require("express");
const router = express.Router();
const data = require('../data')
const userData = data.usersData;
const matchesData = data.matchesData;
const teamsData = data.teamsData;
const poolsData = data.poolsData;

router.get("/", async (req, res) => {

    try {
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
    } catch (e) {

        return res.status(500).json({ error: e});
    }
});

router.get("/seedCount", async (req, res) => {

    try {
        return res.json(await matchesData.getTeamRecords());
    } catch (e) {
        return res.status(500).json({ error: e});
    }
});

router.post("/insertSeeds", async (req, res) => {

    try {
        const seeds = req.body.seedsArray;

        // let seedsObj = {
        //     teamName: seeds.teamName,
        //     seed: seeds.seed,
        //     currentPlacement: null,
        // };

        // console.log(seeds);

        const seedId = await poolsData.seedInsert(seeds);

        return res.json(seedId);
    } catch (e) {
        return res.status(500).json({ error: e});
    }
});

module.exports = router;