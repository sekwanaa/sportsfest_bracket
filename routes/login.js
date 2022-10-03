const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {

    res.render("partials/login", {title: "Login Page", shortcode: 'loginPage'});
});

module.exports = router;