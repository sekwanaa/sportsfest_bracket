const reportBugRoutes = require('./report_bugs');
const bracketViewRoutes = require('./bracket_view');
const courtViewRoutes = require('./court_view');
const scoreInputRoutes = require('./score_input');
const playerDashboardRoutes = require('./player_dashboard');
const teamListRoutes = require('./team_list');
const roundRobinRoutes = require('./round_robin');
const seedingTableRoutes = require('./seeding_table');
const tournamentRoutes = require('./tournament_view');

const data = require('../data');
const userData = data.usersData;
const poolsData = data.poolsData;
const teamsData = data.teamsData;

const constructorMethod = app => {
	app.get('/', async (req, res) => {
		let email = 'not authenticated';
		let userRole = '';
		let tournamentJoinedArray = [];
		// let tournaments = await poolData //going to pull each tournament name from the pool name I assume.

		if (req.oidc.isAuthenticated()) {
			email = req.oidc.user.name;

			const user = await userData.getUserByEmail(email);
			userRole = user.user_metadata.role;
			const player = await teamsData.getPlayerByUserId(user._id.toString());
			if(player != null) {
				tournamentJoinedArray = await poolsData.getTournamentJoinedByUser(player._id.toString());
			}
		}

		res.render('partials/landingPage', {
			title: 'Sportsfest Bracket Generator',
			shortcode: 'landingPage',
			isAuthenticated: req.oidc.isAuthenticated(),
			role: userRole,
			tournamentJoinedArray: tournamentJoinedArray,
		});
	});

	app.use('/report_bug', reportBugRoutes);
	app.use('/bracket_view', bracketViewRoutes);
	app.use('/court_view', courtViewRoutes);
	app.use('/score_input', scoreInputRoutes);
	app.use('/player_dashboard', playerDashboardRoutes);
	app.use('/round_robin', roundRobinRoutes);
	app.use('/team_list', teamListRoutes);
	app.use('/seeding_table', seedingTableRoutes);
	app.use('/tournament', tournamentRoutes);

	app.use('*', (req, res) => {
		res.status(404).json({ error: 'Not found' });
	});
};

module.exports = constructorMethod;
