require("dotenv").config()
const express = require('express');
const app = express();
const static = express.static(__dirname + '/public');

const { auth } = require('express-openid-connect');
const config = {
    authRequired: false,
    auth0Logout: true,
    secret: 'a long, randomly-generated string stored in env',
    baseURL: 'http://localhost:3000',
    clientID: 'CmnHPslBTHdjgE08RMzwfjDM70F3ez7L',
    issuerBaseURL: 'https://dev-e6dfhqdzli1uevwb.us.auth0.com'
}
const { requiresAuth } = require('express-openid-connect');

app.get('/profile', requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
});

const configRoutes = require('./routes');

const exphbs = require('express-handlebars');

app.use('/public', static);
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(auth(config));
app.get('/', (req, res) => {
    res.send(req.oidc.isAuthenticated() ? '/landingPage' : 'Logged out');
});

app.engine('handlebars', exphbs.engine({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

configRoutes(app);

app.listen(3000, () => {
    console.log("we've now got a server!");
    console.log('Your routes will be running on http://localhost:3000');
})