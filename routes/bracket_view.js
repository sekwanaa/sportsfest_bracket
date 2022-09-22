const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {

    res.render("partials/bracket_view");
});

module.exports = router;