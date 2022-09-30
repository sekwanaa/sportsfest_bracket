const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {

    res.render("partials/score_input", {title: "Input Scores", shortcode: 'scoreInput'});
});

module.exports = router;