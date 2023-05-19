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

    try {
        let tournamentId = req.params.id;
        let sportName = req.params.sport;
    
        let email = "not authenticated"
        let userRole = "";
    
        let poolInfo = await poolsData.getPoolInfo(tournamentId);
    
        let sportId = "";
        let teamsArray = [];
        let sportIdCheck = null;

        for(let i = 0; i < poolInfo.sports.length; i++) {
            sportIdCheck = await poolsData.getSportDataById(poolInfo.sports[i]);
            if(sportIdCheck.sport == sportName) {
                sportId = poolInfo.sports[i];
                break;
            }
            else {
                sportIdCheck = null;
            }
        }

        if(sportIdCheck != null) {
            for(let i = 0; i<sportIdCheck.teams.length; i++) {
                let teamInfo = await teamData.getAllTeamsByID(sportIdCheck.teams[i]);
                teamsArray.push(teamInfo);
                teamInfo = null;
            }
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
    } catch (e) {
        return res.status(500).json({ error: e});
    }

});

// router.post("/", async (req, res) => {
//     const personArray = req.body.personArray;

//     for(i=0; i<personArray.length; i++) {
//         const updateUser = await userData.updateUser(personArray[i].email, personArray[i].role);
//     }
// });

router.post('/:id/:sport/modal_form_import_team', async (req, res) =>{
    
    let poolId = req.params.id;
    let sportName = req.params.sport;

    try{
        const modalTeamArray = req.body.teamArray;
        let teamId = await teamData.addTeam(modalTeamArray);
        let insertedTeamPool = await poolsData.insertTeam(poolId, sportName, teamId);
        res.json("form has been imported");
    }
    catch (e) {
        return res.status(500).json({ error: e});
    }
})

router.post("/:id/:sport/batch_import_team", async (req, res) => {
    let poolId = req.params.id;
    let sportName = req.params.sport;

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