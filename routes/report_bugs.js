const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {

    res.render("partials/report_bug", {
        title: "Report Bugs", 
        shortcode: 'reportBug',
        isAuthenticated: req.oidc.isAuthenticated(),
    });
});

module.exports = router;