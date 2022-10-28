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
    clientID: process.env.clientID,
    issuerBaseURL: 'https://dev-e6dfhqdzli1uevwb.us.auth0.com'
}

const configRoutes = require('./routes');

const exphbs = require('express-handlebars');

app.use('/public', static);
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(auth(config));

app.engine('handlebars', exphbs.engine({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

var hbs = exphbs.create({});

// register new function
hbs.handlebars.registerHelper('compareRole', function(handlebarRole, userRole, options) {
    // console.log(handlebarRole)
    // console.log(userRole)
    if(handlebarRole == userRole) {
        return options.fn(this)
    }
    else { 
        return options.inverse(this);
    }
});


configRoutes(app);

app.listen(3000, () => {
    console.log("we've now got a server!");
    console.log('Your routes will be running on http://localhost:3000');
})