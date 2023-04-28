const express = require("express");
const router = express.Router();
const data = require('../data')
const userData = data.usersData;
const poolsData = data.poolsData;

router.get("/", async (req, res) => {

    let userRole = "";
    let sports = [
        "volleyball", "frisbee", "basketball", "soccer"
    ]

    if(req.oidc.isAuthenticated()) {
        let filterObj = {
            email: req.oidc.user.name
        };
        let projectionObj = {
            "user_metadata.role": 1,
        };

        const user = await userData.getUserByEmail(filterObj, projectionObj);
        userRole = user.user_metadata.role;
    }

    res.render("partials/sportsfest", {
        title: "sportsfest", 
        shortcode: 'tournaments',
        isAuthenticated: req.oidc.isAuthenticated(),
        role: userRole,
        sports: sports,
    });
});

module.exports = router;