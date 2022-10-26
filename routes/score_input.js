const express = require("express");
const router = express.Router();
const { requiresAuth } = require('express-openid-connect');
const data = require('../data')
const userData = data.usersData;

router.get("/", requiresAuth(), async (req, res) => {

    let email = "not authenticated";
    let loggedInUser = {};
    let userRole = "";

    if(req.oidc.isAuthenticated()) {
        email = req.oidc.user.name;
        const user = await userData.getUser(email);
        loggedInUser = user;
        userRole = loggedInUser.user_metadata.role;
    }

    res.render("partials/score_input", {
        title: "Input Scores", 
        shortcode: 'scoreInput',
        isAuthenticated: req.oidc.isAuthenticated(),
        loggedInUser: loggedInUser,
        role: userRole,
    });
});

module.exports = router;