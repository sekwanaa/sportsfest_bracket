const dotEnv = require("dotenv").config().parsed;
const express = require('express');
const app = express();
const static = express.static(__dirname + '/public');

const { auth } = require('express-openid-connect');
const config = {
    authRequired: false,
    auth0Logout: true,
    secret: dotEnv.secret,
    baseURL: dotEnv.baseURL,
    clientID: dotEnv.clientID,
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

//register helper functions from helper.js file
const helpers = require("./helpers/helpers");
hbs.handlebars.registerHelper(helpers);

configRoutes(app);

app.listen(dotEnv.httpPort, () => {
    console.log("we've now got a server!");
    console.log('Your routes will be running on http://localhost:' + dotEnv.httpPort);
})

if(dotEnv.liveServer == "true") {
    var https = require('https');
    var fs = require('fs');
    
    var options = {
        key: fs.readFileSync(dotEnv.serverKey),
        cert: fs.readFileSync(dotEnv.serverCert),
        requestCert: false,
        rejectUnauthorized: false
    };
    
    var server = https.createServer(options, app).listen(dotEnv.httpsPort, function(){
        console.log("server started at port " + dotEnv.httpsPort);
    });
}
