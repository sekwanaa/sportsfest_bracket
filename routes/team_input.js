const express = require("express");
const router = express.Router();

const data = require("../data/");
const teamsData = data.teamsData

router.get("/", async (req, res) => {

    res.render("partials/team_input", {title: "Team Input Form", shortcode: 'teamInput'});
});

router.post("/submitTeams", async (req, res) => {

    try {
        
        const teamName  = req.body.teamName;
        const district = req.body.district;
        const players = req.body.players;

        console.log("Team Name: " + teamName);
        console.log("District: " + district);
        console.log("Players: " + players);

        const count = 1;
        playersArray = [];

        for(i = 0; i < count; i++) {
            playersArray.push(players)    
        }

        console.log(playersArray);
        
        for(i=0; i < playersArray.length; i++) {
            console.log("player: " + playersArray[i])
            console.log("player: " + playersArray[i])
        }



        // const insertTeam = teamsData.addTeam(teamName, district, players)
    }

    catch(e) {
        console.log(e);
    }


    return {test: "this"};
});

router.get("/allTeams", async (req, res) => {
    try {
        // console.log(await teamsData.getAllTeams());
        //new edit
        const teamName = await teamsData.getAllTeams()
        console.log(teamName[0].name);
        return res.json(teamName);
    }

    catch(e) {
        console.log(e);
    }
});

module.exports = router;