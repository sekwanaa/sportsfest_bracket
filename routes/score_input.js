const express = require("express");
const router = express.Router();
const { requiresAuth } = require('express-openid-connect');

router.get("/", requiresAuth(), async (req, res) => {

    res.render("partials/score_input", {title: "Input Scores", shortcode: 'scoreInput'});
});

module.exports = router;