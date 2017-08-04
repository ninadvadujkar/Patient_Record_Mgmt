'use strict';
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const patients = require('./routes/patients');

mongoose.connect('mongodb://localhost/prm');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(morgan('combined'));

//Test route
app.get('/', (req, res) => {
	res.send({
		code: 200,
		message: 'OK'
	});
});

app.use('/patients', patients);

app.listen(8081, () => {
	console.log("Server listening at port 8081");
});