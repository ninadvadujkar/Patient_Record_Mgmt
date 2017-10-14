'use strict';
const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const redis = require('redis');

const config = require('./config/config');
const client = redis.createClient(config.redis);
let secret = config.secret;
mongoose.connect(config.mongodb);

// Require routes
const patients = require('./routes/patients');
const auth = require('./routes/auth');
const appointments = require('./routes/appointments');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(morgan('combined'));

app.use(express.static('public'));

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,x-access-token');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.use('/api/auth', auth);
app.use(authMiddleware);
app.use('/api/patients', patients);
app.use('/api/appointments', appointments);

//Test route
// app.get('/', (req, res) => {
// 	res.send({
// 		code: 200,
// 		message: 'OK'
// 	});
// });


function authMiddleware(req, res, next) {
	if(req.method !== "OPTIONS") {
		// Check for token and username in body or query or headers
		let token = req.body.token || req.query.token || req.headers['x-access-token'];
		let username = req.body.username || req.query.username;
		console.log(token, username);
		if(token && username) {
			//verify token
			jwt.verify(token, secret, function(err, decoded) {
				if(err) {
					console.log("Failed to verify token", err);
					return res.status(401).send({
						code: 401,
						message: "Failed to verify token"
					});
				}
				client.get("patient::" + username, (err, resp) => {
					if(err) {
						console.log("Failed to connect to redis");
						return res.status(503).send({
							code: 503,
							message: "Failed to connect to redis"
						});
					}
					if(!resp) {
						console.log("Token not valid anymore!");
						return res.status(401).send({
							code: 401,
							message: "Token not valid anymore!. Login again!"
						});
					}
					req.decoded = decoded;
					next();
				});
			});
		} else {
			if(!token) {
				// No token passed by user.
				// Return error.
				return res.status(403).send({
					code: 403,
					message: 'No token provided. Token required'
				});
			} else {
				// username not provided by user.
				// Return error.
				return res.status(403).send({
					code: 403,
					message: 'No username provided. Username required'
				});			
			}
		}		
	} else {
		console.log("OPTIONS request");
		next();
	}
}

app.listen(8081, () => {
	console.log("Server listening at port 8081");
});