const express = require("express");
const router = express.Router();
const data = require('../data')
const userData = data.usersData;
const poolsData = data.poolsData;

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

    res.render("partials/create_pool", {
        title: "Create Pool", 
        shortcode: 'createPool',
        isAuthenticated: req.oidc.isAuthenticated(),
        loggedInUser: loggedInUser,
        role: userRole,
        allUsers: allUsers,
        length: allUsers.length
    });
});

router.post("/", async (req, res) => {
    const poolInfo = req.body;
    
    const insertPool = await poolsData.insertPool
    (
        poolInfo.seedingGames, 
        poolInfo.numOfTeams, 
        poolInfo.numOfFields, 
        poolInfo.numOfPlayOffTeams
    );

    return res.json(insertPool);
});

module.exports = router;