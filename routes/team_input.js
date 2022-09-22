const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {

    res.render("partials/team_input");
});

module.exports = router;