'use strict';
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const config = require('../config/config');
const redis = require('redis');
const client = redis.createClient();

const unauthorisedMsg = {
	code: 401,
	message: "Not authenticated!"
};

const successMsg = {
	code: 200,
	message: "Login successful!"
};

router.post('/login', (req, res) => {
	if(!req.body.username || !req.body.passwd) {
		return res.status(401).send(unauthorisedMsg);
	}
	User.findOne({ username: req.body.username }, (err, user) => {
		if(err || !user) {
			console.log("Could not find user");
			return res.status(401).send(unauthorisedMsg);
		}
		if(bcrypt.compareSync(req.body.passwd, user.passwd)) {
			console.log("Verified user credentials!");
			// Here we've verified that user is valid
			// Let us send him an access token
			let expiry = 60 * 60;
	        var token = jwt.sign(user, config.secret, {
	          expiresIn: expiry // expires in 1 hours
	        });
	        let key = "patient::" + req.body.username;
	        client.setex(key, expiry, token, (err, resp) => {
	        	if(err) {
	        		console.log("Failed to set token in redis");
	        		return res.status(503).send({
	        			code: 503,
	        			message: "Failed tom set token in redis"
	        		});
	        	}
	        	console.log("Added token to redis!");
				successMsg.token = token;
				return res.send(successMsg);
	        });
		} else {
			console.log("Password incorrect");
			return res.status(401).send(unauthorisedMsg);
		}
	});
});

router.post('/logout', (req, res) => {
	User.findOne({ username: req.body.username }, (err, user) => {
		if(err) {
			console.log("Error in finding user!", err);
			return res.status(503).send({
				code: 503,
				message: "Error in finding user"
			});
		}
		if(!user) {
			console.log("User not found");
			return res.status(404).send({
				code: 404,
				message: "User not found"
			});
		}
		let key = "patient::" + req.body.username;
		redis.del(key, (err, resp) => {
			if(err) {
				console.log("Failed to delete key");
				return res.status(500).send({
					code: 500,
					message: "Failed to logout user!"
				});
			}
			res.send({
				code: 200,
				message: 'Logout successful!'
			});		
		});	
	});
});

module.exports = router;