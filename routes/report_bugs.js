const express = require("express");
const router = express.Router();
const { requiresAuth } = require('express-openid-connect');

router.get("/", requiresAuth(), async (req, res) => {

    res.render("partials/report_bug", {title: "Report Bugs", shortcode: 'reportBug'});
});

module.exports = router;