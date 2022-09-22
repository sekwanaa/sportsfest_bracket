const aboutRoutes = require("./about");
const reportBugRoutes = require("./report_bugs");
const path = require('path');

const constructorMethod = app => {
    app.get('/', (req, res) => {

        res.render('partials/landingPage')
        //res.sendFile(path.resolve('static/report_bug.html'));
    });


    app.use("/about", aboutRoutes);
    app.use("/report_bug", reportBugRoutes);

    app.use("*", (req, res) => {
        res.status(404).json({error: "Not found"});
    });
};

module.exports = constructorMethod;