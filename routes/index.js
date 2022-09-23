const aboutRoutes = require("./about");
const reportBugRoutes = require("./report_bugs");
const teamInputRoutes = require("./team_input");
const bracketViewRoutes = require("./bracket_view");
const path = require('path');

const constructorMethod = app => {
    app.get('/', (req, res) => {

        res.render('partials/landingPage', {title: 'Bracket Generator', shortcode: 'landingPage'})
        //res.sendFile(path.resolve('static/report_bug.html'));
    });


    app.use("/about", aboutRoutes);
    app.use("/report_bug", reportBugRoutes);
    app.use("/team_input", teamInputRoutes);
    app.use("/bracket_view", bracketViewRoutes);

    app.use("*", (req, res) => {
        res.status(404).json({error: "Not found"});
    });
};

module.exports = constructorMethod;