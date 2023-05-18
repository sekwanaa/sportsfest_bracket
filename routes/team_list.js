const express = require("express");
const router = express.Router();
const data = require('../data')
const userData = data.usersData;
const teamData = data.teamsData;
const poolsData = data.poolsData;

router.get("/", async (req, res) => {

    let email="not authenticated"
    let userRole = "";
    let allTeams = [];
    allTeams = await teamData.getAllTeams();

    if(req.oidc.isAuthenticated()) {
        let filterObj = {
            email: req.oidc.user.name
        };
        let projectionObj = {
            "user_metadata.role": 1,
        };

        const user = await userData.getUserByEmail(filterObj, projectionObj);
        userRole = user.user_metadata.role;
    }

    res.render("partials/team_list", {
        title: "Team List", 
        shortcode: 'teamList',
        isAuthenticated: req.oidc.isAuthenticated(),
        role: userRole,
        allTeams: allTeams,
    });
});

router.get("/:id/:sport", async (req, res) => {

    let tournamentId = req.params.id;
    let sportName = req.params.sport;

    let email = "not authenticated"
    let userRole = "";

    let poolInfo = await poolsData.getPoolInfo(tournamentId);
    // allTeams = await teamData.getAllTeams();

    let teamsArray = [];
    //6463f6d7eb8e9590fae2a0c3
    for(let i = 0; i < poolInfo.sports[sportName].teams.length; i++) {
        let teamInfo = await teamData.getAllTeamsByID(poolInfo.sports[sportName].teams[i]);
        teamsArray.push(teamInfo);
        teamInfo = null;
    }

    if(req.oidc.isAuthenticated()) {
        let filterObj = {
            email: req.oidc.user.name
        };
        let projectionObj = {
            "user_metadata.role": 1,
        };

        const user = await userData.getUserByEmail(filterObj, projectionObj);
        userRole = user.user_metadata.role;
    }

    res.render("partials/team_list", {
        title: "Team List", 
        shortcode: 'teamList',
        isAuthenticated: req.oidc.isAuthenticated(),
        role: userRole,
        allTeams: teamsArray,
        tournamentId: tournamentId,
        sportName: sportName,
    });
});

// router.post("/", async (req, res) => {
//     const personArray = req.body.personArray;

//     for(i=0; i<personArray.length; i++) {
//         const updateUser = await userData.updateUser(personArray[i].email, personArray[i].role);
//     }
// });

router.post('/modal_form_import_team', async (req, res) =>{
    try{
        const modalTeamArray = req.body.teamArray;
        await teamData.addTeam(modalTeamArray);
        res.json("form has been imported")
    }
    catch (e) {
        return res.status(500).json({ error: e});
    }
})

router.post("/batch_import_team", async (req, res) => {
    
    try {
        const teamArray = req.body.teamArray;

        let insertTeam = null;

        let insertTeamArr = [];
        let teamObj = {
            teamName: null,
            district: null,
            players: [],
            teamCaptain: {
                name: "blank",
            },
            powerRanking: null,
        }

        for(i=0; i<teamArray.length; i++) {
            teamObj.teamName = teamArray[i].teamName;
            teamObj.district = teamArray[i].district;
            teamObj.players = teamArray[i].players;
            teamObj.teamCaptain = teamArray[i].teamCaptain;
            teamObj.powerRanking = teamArray[i].powerRanking;
            
            insertTeamArr.push(teamObj);
            teamObj = {
                teamName: null,
                district: null,
                players: [],
                teamCaptain: {
                    name: "blank",
                },
                powerRanking: null,
            }
        }

        for(j=0; j<insertTeamArr.length; j++) {
            insertTeam = await teamData.addTeam(teamArray[j]);
            insertTeam = null;
        }
        
        return res.json("insertTeam");
    }

    catch (e) {
        return res.status(500).json({ error: e});
    }
});

router.post("/edit_power_ranking", async (req, res) => {
    try {
        const newPowerRank = req.body.teamRankObjArr;

        for(i=0; i<newPowerRank.length; i++) {
           const updatePowerRank = await teamData.updatePowerRanking(newPowerRank[i].teamName, newPowerRank[i].district, newPowerRank[i].newPowerRank);
        }

        return res.json("")
    } catch (error) {
        return res.status(500).json({ error: error});
    }
});

module.exports = router;