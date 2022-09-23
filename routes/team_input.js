const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {

    res.render("partials/team_input", {title: "Team Input Form", shortcode: 'teamInput'});
});

router.post("/submitTeams", async (req, res) => {
    const reqBody = req.body;

    try {
        console.log("reqBody: " + reqBody.teamName + " " + reqBody.teamMember1);
        console.log(reqBody)
        const teamName  = req.body.teamName
        const teamMember1 = req.body.teamMember1;
        // console.log(teamMember1)
        // console.log(teamName)
    }

    catch(e) {
        console.log("failed");
    }


    return {test: "this"};
});

module.exports = router;