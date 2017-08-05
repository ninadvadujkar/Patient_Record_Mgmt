'use strict';
const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');

const serviceUnavailableResp = {
	code: 503,
	message: "Service Unavailable"
};

let basePath = router.route('/:date');

basePath.get((req, res) => {
	Patient.find({ next_appt_date: req.params.date }, (err, pList) => {
		if(err) {
			console.log("Failed to get list", err);
			return res.status(503).send(serviceUnavailableResp);
		}
		console.log("Got list of appointments");
		return res.status(200).send({
			code: 200,
			message: "OK",
			data: pList
		});
	});
});

module.exports = router;