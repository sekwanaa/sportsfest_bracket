const express = require("express");
const router = express.Router();
const data = require('../data')
const userData = data.usersData;
const teamsData = data.teamsData;
const poolsData = data.poolsData;
const fs = require('fs');
const sharp = require('sharp');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png'];
        if (!allowedMimes.includes(file.mimetype)) {
            const err = new Error('Invalid file type. Only JPEG and PNG images are allowed.');
            err.status = 400;
            return cb(err);
        }
        if (file.mimetype === 'image/heic') {
            console.log('HEIC file detected');
            const err = new Error('HEIC file type is not allowed.');
            err.status = 400;
            return cb(err);
        }
        cb(null, true);
    },
    destination: (req, file, cb) => {
        cb(null, './public/images');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

router.get("/", async (req, res) => {

    let userRole = "";
    let allUsers = [];
    let nickname = "";
    let name = "";
    let hasTeam = false;
    let teamCaptain = null;
    let district = null;
    let teamMembers = null;
    let teamName = null;
    let userId = null;
    let profilePic = "../../public/images/R.png";
    let shirt_number = null;
    let position = null;

    if(req.oidc.isAuthenticated()) {
        let filterObj = {
            email: req.oidc.user.name
        };
        let projectionObj = {
            _id: 1,
            email: 1,
            "user_metadata.role": 1,
            "user_metadata.name": 1,
            "user_metadata.profilePic": 1,
        };

        const user = await userData.getUserByEmail(filterObj, projectionObj);
        userId = user._id.toString()
        const player = await teamsData.getPlayerByUserId(userId);
        allUsers = await userData.getAllUsers();
        hasTeam = await teamsData.hasTeam(userId);
        nickname = user.email
        userRole = user.user_metadata.role
        name = user.user_metadata.name

        if(user.user_metadata.profilePic) {
            profilePic = "../." + user.user_metadata.profilePic;
        }

        if (hasTeam) {
            let team = await teamsData.getTeam(userId);
            
            shirt_number = player.shirtNum;
            position = player.position;
            teamCaptain = team.teamCaptain;
            district = team.district;
            teamMembers = [];
            teamName = team.name;
            let teamMember = {};

            for(i=0; i < team.players.length; i++) {                
                teamMember.name = team.players[i].name;
                if(team.players[i].linked == false) {
                    teamMember.code = await teamsData.getPlayerLinkCode(team.players[i]._id.toString());
                }
                teamMembers.push(teamMember);
                teamMember = {};
            }
        }
    }

    res.render("partials/player_dashboard", {
        title: "Profile", 
        shortcode: 'playerDashboard',
        isAuthenticated: req.oidc.isAuthenticated(),
        role: userRole,
        allUsers: allUsers,
        length: allUsers.length,
        nickname: nickname,
        name: name,
        hasTeam: hasTeam,
        teamCaptain: teamCaptain,
        district: district,
        teamMembers: teamMembers,
        teamName: teamName,
        profilePic: profilePic,
        shirt_number: shirt_number,
        position: position,
    });
});

router.post("/submitTeams", async (req, res) => {

    let userId;

    if(req.oidc.isAuthenticated()) {
        email = req.oidc.user.name;
        const user = await userData.getUserByEmail(email);
        userId = user._id.toString();
    }

    try {
        
        const teamName  = req.body.teamName;
        const district = req.body.district;
        const players = req.body.players;
        const teamCaptain = req.body.teamCaptain;

        teamCaptain.userId = userId;

        let teamObj = {
            teamName: teamName,
            district: district,
            players: players,
            teamCaptain: teamCaptain,
        };

        const teamId = await teamsData.addTeam(teamObj);

        return res.json(teamId);
    }

    catch(e) {
        console.log(e);
    }

    return;

});

router.post("/", async (req, res) => {
    const personArray = req.body.personArray;

    for(i=0; i<personArray.length; i++) {
        const updateUserRole = await userData.updateUserRole(personArray[i].email, personArray[i].role);
    }

    return res.json("done");
});

router.post("/join_team", async (req, res) => {
    const code = req.body.code;

    let userId;

    if(req.oidc.isAuthenticated()) {
        email = req.oidc.user.name;
        const user = await userData.getUserByEmail(email);
        userId = user._id.toString();
    }

    const playerId = await teamsData.linkPlayerCode(code, userId);

    return;
});

router.post("/submitProfile", async (req, res) => {
    const userInfo = req.body;
    const name = userInfo.name;
    const shirtNum = userInfo.shirtNum;
    const position = userInfo.position;
    let userId = userInfo.userId;

    if(req.oidc.isAuthenticated()) {
        email = req.oidc.user.name;
        const user = await userData.getUserByEmail(email);
        userId = user._id.toString();
    }

    const userUpdate = await userData.updateProfileInfo(userId, name, shirtNum, position);

    return res.json(userUpdate);
});

router.post("/editTeam", async (req, res) => {
    const teamInfo = req.body;
    let userId = null;

    if(req.oidc.isAuthenticated()) {
        email = req.oidc.user.name;
        const user = await userData.getUserByEmail(email);
        userId = user._id.toString();
    }

    const teamObj = {
        name: teamInfo.name,
        district: teamInfo.district,
        players: teamInfo.players,
        teamCaptain: teamInfo.teamCaptain,
        userId: userId,
    };

    const updateTeamInfo = await teamsData.updateTeamInfo(teamObj);
    return res.json(updateTeamInfo);
});

router.post('/upload-image', upload.single('user-image'), async (req, res) => {

        let newImageName = null;
        let previousImagePath = null;
        //get user email from session oidc
        if(req.oidc.isAuthenticated()) {
            email = req.oidc.user.name;
            const user = await userData.getUserByEmail(email);
            userId = user._id.toString();
            newImageName = userId;
            if(user.user_metadata.profilePic) {
                previousImagePath = user.user_metadata.profilePic;
                //delete previous image
                try {
                    fs.unlink(previousImagePath, (err) => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                    });
                } 
                catch (e) {
                    return;
                }
                //end delete previous image
            }
        }

        let imageNameSplit = req.file.originalname.split(".");

        newImageName = newImageName + "." + imageNameSplit[1];

        //set new image name to user email
        
        try {
            let imageBuffer = req.file.buffer;

            // Resize and compress the image using Sharp
            const data = await sharp(imageBuffer)
                .resize(800, 800)
                .jpeg({ quality: 80 })
                .toBuffer();

            // Save the resized and compressed image to './public/images'
            const imagePath = './public/images/profilePic/' + newImageName;

            fs.writeFile(imagePath, data, async (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('An error occurred while saving the image.');
                } else {
                    // Send the URL of the saved image as the response
                    const imageUrl = req.protocol + '://' + req.get('host') + '/images/profilePic/' + newImageName;

                    const insertProfile = await userData.updateProfilePic(req.oidc.user.name, imagePath);
                    return res.status(200).send({ url: imageUrl });
                }
            });
        } catch (err) {
            
            return res.status(500).send('An error occurred while processing the image.');
        }
});

router.post("/create_pool", async (req, res) => {
    const poolInfo = req.body;
    
    const insertPool = await poolsData.insertPool
    (
        poolInfo.seedingGames,
        poolInfo.numOfFields, 
        poolInfo.numOfPlayOffTeams,
    );

    return res.json(insertPool);
});


module.exports = router;