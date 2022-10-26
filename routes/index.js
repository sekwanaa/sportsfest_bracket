const aboutRoutes = require("./about");
const reportBugRoutes = require("./report_bugs");
const teamInputRoutes = require("./team_input");
const bracketViewRoutes = require("./bracket_view");
const scoreInputRoutes = require("./score_input");
const matchInsertRoutes = require("./match_insert");
// const path = require('path');
const data = require('../data')
const userData = data.usersData;
// const userRoleData = userData.getAllUsers()

const constructorMethod = app => {
    app.get('/', async (req, res) => {
        //console.log(req.oidc.user)
        let email = "not authenticated";
        let loggedInUser = {};
        let userRole = "";

        if(req.oidc.isAuthenticated()) {
            email = req.oidc.user.name;
            const user = await userData.getUser(email);
            loggedInUser = user;
            userRole = loggedInUser.user_metadata.role;
        }


        res.render('partials/landingPage', {
            title: 'Bracket Generator',
            shortcode: 'landingPage',
            isAuthenticated: req.oidc.isAuthenticated(),
            loggedInUser: loggedInUser,
            role: userRole,
        })
        //res.sendFile(path.resolve('static/report_bug.html'));
    });


    app.use("/about", aboutRoutes);
    app.use("/report_bug", reportBugRoutes);
    app.use("/team_input", teamInputRoutes);
    app.use("/bracket_view", bracketViewRoutes);
    app.use("/score_input", scoreInputRoutes);
    app.use("/match_insert", matchInsertRoutes);

    app.use("*", (req, res) => {
        res.status(404).json({error: "Not found"});
    });
};

module.exports = constructorMethod;