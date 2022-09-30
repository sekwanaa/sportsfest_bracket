const express = require("express");
const router = express.Router();

const data = require("../data/");
const teamsData = data.teamsData

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

router.get("/allTeams", async (req, res) => {
    try {
        // console.log(await teamsData.getAllTeams());

        const teamName = await teamsData.getAllTeams()
        console.log(teamName[0].name);
        return res.json(teamName);
    }

    catch(e) {
        console.log(e);
    }
})

module.exports = router;