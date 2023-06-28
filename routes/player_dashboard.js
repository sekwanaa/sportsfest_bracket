const express = require('express');
const router = express.Router();
const data = require('../data');
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
		fileSize: 10 * 1024 * 1024, // 10 MB
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
	},
});

router.get('/', async (req, res) => {
	try {
		let userRole = '';
		let allUsers = [];
		let nickname = '';
		let name = '';
		let hasTeam = false;
		let teamCaptain = null;
		let district = null;
		let teamMembers = null;
		let teamName = null;
		let userId = null;
		let profilePic = '../public/images/R.png';
		let shirt_number = null;
		let position = null;
		let sportList = await poolsData.getSportsList();
		let tournamentArray = [];
		let tournamentJoinedArray = [];

		if (req.oidc.isAuthenticated()) {
			const email = req.oidc.user.name;

			const user = await userData.getUserByEmail(email);
			userId = user._id.toString();

			//check if user exists in player collection, create a player for user if not
			const playerExists = await teamsData.checkPlayerExists(userId);
			if (playerExists == false) {
				let playerObj = {
					name: user.user_metadata.name,
					shirtNum: 'N/A',
					userId: userId,
					hasTeam: false,
					linked: false,
				};

				const newPlayer = await teamsData.createPlayer(playerObj);
			}

			const player = await teamsData.getPlayerByUserId(userId);
			allUsers = await userData.getAllUsers();
			hasTeam = await teamsData.hasTeam(userId);
			nickname = user.email;
			userRole = user.user_metadata.role;
			name = user.user_metadata.name;

			if (user.user_metadata.profilePic) {
				profilePic = '../.' + user.user_metadata.profilePic;
			}

			shirt_number = player.shirtNum;
			position = player.position;

			if (hasTeam) {
				let team = await teamsData.getTeam(userId);

				teamCaptain = team.teamCaptain;
				district = team.district;
				teamMembers = [];
				teamName = team.name;
				let teamMember = {};

				for (i = 0; i < team.players.length; i++) {
					teamMember.name = team.players[i].name;
					if (team.players[i].linked == false) {
						teamMember.code = await teamsData.getPlayerLinkCode(team.players[i]._id.toString());
					}
					teamMembers.push(teamMember);
					teamMember = {};
				}
			}

			//get id's of tournaments created by user
			tournamentArray = await poolsData.getTournamentsCreatedByUser(userId);

			//get id's of tournaments joined by the user
			let tmpTournamentJoinedArray = await poolsData.getTournamentJoinedByUser(player._id.toString());

			//populate tournamentJoinedArray for the Your Current Team Card
			let tournamentObj = {
				_id: null,
				sports: [],
			};
			for(let i=0; i < tmpTournamentJoinedArray.length; i++) {
				tournamentObj._id = tmpTournamentJoinedArray[i]._id;
				tournamentObj.tournamentName = tmpTournamentJoinedArray[i].tournamentName;
				for(let j=0; j < tmpTournamentJoinedArray[i].sports.length; j++) {
					const sportData = await poolsData.getSportDataById(tmpTournamentJoinedArray[i].sports[j]);
					tournamentObj.sports.push(sportData);
				}
				tournamentJoinedArray.push(tournamentObj);
				tournamentObj = {
					_id: null,
					sports: [],
				};
			}
		}

		res.render('partials/player_dashboard', {
			title: 'Profile',
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
			sportList: sportList,
			tournamentArray: tournamentArray,
			tournamentJoinedArray: tournamentJoinedArray,
		});
	} catch (e) {
		return res.status(500).json({ error: e });
	}
});

router.post('/submitTeams', async (req, res) => {
	let userId;

	if (req.oidc.isAuthenticated()) {
		const email = req.oidc.user.name;

		const user = await userData.getUserByEmail(email);
		userId = user._id.toString();
	}

	try {
		const teamName = req.body.teamName;
		const district = req.body.district;
		const players = req.body.players;
		const teamCaptain = req.body.teamCaptain;

		if (teamCaptain) {
			teamCaptain.userId = userId;
		} else {
		}

		let teamObj = {
			teamName: teamName,
			district: district,
			players: players,
			teamCaptain: teamCaptain,
		};

		const teamId = await teamsData.addTeam(teamObj);

		const sportId = req.body.sportId;
		const insertTeamToSport = await teamsData.addTeamToSport(teamId, sportId);

		return res.json(teamId);
	} catch (e) {
		console.log(e);
	}

	return;
});

router.post('/', async (req, res) => {
	const personArray = req.body.personArray;

	try {
		for (i = 0; i < personArray.length; i++) {
			const updateUserRole = await userData.updateUserRole(
				personArray[i].email,
				personArray[i].role
			);
		}

		return res.json('done');
	} catch {
		return res.status(500).json({ error: e });
	}
});

router.post('/join_team', async (req, res) => {
	const code = req.body.code;

	let userId;

	try {
		if (req.oidc.isAuthenticated()) {
			const email = req.oidc.user.name;

			const user = await userData.getUserByEmail(email);
			userId = user._id.toString();
		}

		const playerId = await teamsData.linkPlayerCode(code, userId);

		return;
	} catch {
		return res.status(500).json({ error: e });
	}
});

router.post('/submitProfile', async (req, res) => {
	const userInfo = req.body;
	const name = userInfo.name;
	const shirtNum = userInfo.shirtNum;
	const position = userInfo.position;
	let userId = userInfo.userId;

	try {
		if (req.oidc.isAuthenticated()) {
			const email = req.oidc.user.name;
			const user = await userData.getUserByEmail(email);
			userId = user._id.toString();
		}

		const userUpdate = await userData.updateProfileInfo(userId, name, shirtNum, position);

		return res.json(userUpdate);
	} catch {
		return res.status(500).json({ error: e });
	}
});

router.post('/editTeam', async (req, res) => {
	const teamInfo = req.body;
	let userId = null;

	try {
		if (req.oidc.isAuthenticated()) {
			const email = req.oidc.user.name;
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
	} catch (e) {
		return res.status(500).json({ error: e });
	}
});

router.post('/upload-image', async (req, res) => {
	let newImageName = null;
	let previousImagePath = null;

	//check if image was uploaded, if not, return
	if (req.file == null) {
		return res.status(200).send({});
	}

	upload.single('user-image');

	//get user email from session oidc
	if (req.oidc.isAuthenticated()) {
		const email = req.oidc.user.name;

		const user = await userData.getUserByEmail(email);
		const userId = user._id.toString();
		newImageName = userId;
		if (user.user_metadata.profilePic) {
			previousImagePath = user.user_metadata.profilePic;
			//delete previous image
			try {
				fs.unlink(previousImagePath, err => {
					if (err) {
						console.error(err);
						return;
					}
				});
			} catch (e) {
				return;
			}
			//end delete previous image
		}
	}

	let imageNameSplit = req.file.originalname.split('.');

	newImageName = newImageName + '.' + imageNameSplit[1];

	//set new image name to user email

	try {
		let imageBuffer = req.file.buffer;

		// Resize and compress the image using Sharp
		const data = await sharp(imageBuffer).resize(800, 800).jpeg({ quality: 80 }).toBuffer();

		// Save the resized and compressed image to './public/images'
		const imagePath = './public/images/profilePic/' + newImageName;

		fs.writeFile(imagePath, data, async err => {
			if (err) {
				console.error(err);
				return res.status(500).send('An error occurred while saving the image.');
			} else {
				// Send the URL of the saved image as the response
				const imageUrl =
					req.protocol + '://' + req.get('host') + '/images/profilePic/' + newImageName;

				const insertProfile = await userData.updateProfilePic(req.oidc.user.name, imagePath);
				return res.status(200).send({ url: imageUrl });
			}
		});
	} catch (err) {
		return res.status(500).send('An error occurred while processing the image.');
	}
});

router.post('/create_pool', async (req, res) => {
	let poolObj = req.body.poolObj;
	let sportsPool = req.body.sportsPool;

	try {
		if (req.oidc.isAuthenticated()) {
			const email = req.oidc.user.name;

			const user = await userData.getUserByEmail(email);
			let userId = user._id.toString();
			poolObj.coordinator = userId;
			const player = await teamsData.getPlayerByUserId(userId);
			poolObj.players.push(player._id.toString());
		}

		const insertPool = await poolsData.insertPool(poolObj);

		for (let i = 0; i < sportsPool.length; i++) {
			const insertSport = await poolsData.insertSportIntoPool(insertPool, sportsPool[i]);
		}

		return res.json(insertPool);
	} catch (e) {
		return res.status(500).json({ error: e });
	}
});

//route for adding sports info to pool
router.post('/submit_sport', async (req, res) => {
	const sportInfo = req.body;

	try {
		const insertSport = await poolsData.insertSportIntoPool(sportInfo.poolId, sportInfo.sportObj);

		return res.json(insertSport);
	} catch (e) {
		return res.status(500).json({ error: e });
	}
});

router.post('/add_sport', async (req, res) => {
	let sportName = {
		sportName: req.body.sportName,
	};

	try {
		const insertSportName = await poolsData.addSportToList(sportName);

		return res.json(insertSportName);
	} catch (e) {
		return res.status(500).json({ error: e });
	}
});

router.post('/join_tournament', async (req, res) => {
	let userId = null;

	try {
		if (req.oidc.isAuthenticated()) {
			const email = req.oidc.user.name;

			const user = await userData.getUserByEmail(email);
			userId = user._id.toString();
		}
		const tournamentCode = req.body.tournamentCode;
		const player = await teamsData.getPlayerByUserId(userId);

		const joinTournament = await poolsData.addPlayerToTournament(
			player._id.toString(),
			tournamentCode
		);

		return res.json(joinTournament);
	} catch (e) {
		return res.status(500).json({ error: e });
	}
});

module.exports = router;
