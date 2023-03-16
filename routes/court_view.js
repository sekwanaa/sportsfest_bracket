const express = require("express");
const router = express.Router();
const data = require('../data')
const userData = data.usersData;

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
    });
});

module.exports = router;