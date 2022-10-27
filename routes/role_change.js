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

    res.render("partials/role_change", {
        title: "Role Change", 
        shortcode: 'roleChange',
        isAuthenticated: req.oidc.isAuthenticated(),
        loggedInUser: loggedInUser,
        role: userRole,
        allUsers: allUsers,
        length: allUsers.length
    });
});

router.post("/", async (req, res) => {
    const personArray = req.body.personArray;

    for(i=0; i<personArray.length; i++) {
        const updateUser = await userData.updateUser(personArray[i].email, personArray[i].role);
    }
});

module.exports = router;