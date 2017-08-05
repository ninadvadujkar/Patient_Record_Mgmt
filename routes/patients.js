'use strict';
const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const uuid = require('uuid');

const createdResp = {
	code: 201,
	message: "Added new patient"
};

const successResp = {
	code: 200,
	message: "Success!" 
};

const notFoundResp = {
	code: 404,
	message: "Not found"
};

const serviceUnavailableResp = {
	code: 503,
	message: "Service Unavailable"
};

router.use(function timeLogger(req, res, next){
	console.log("Time " + new Date().toLocaleString());
	next();
});

let baseEndPoint = router.route('/');

baseEndPoint.get((req, res) => {
	Patient.find({}, (err, patients) => {
		if(err) {
			console.log("Failed to get patients");
			return res.status(503).send(serviceUnavailableResp);
		}
		console.log("Got patient list");
		successResp.data = patients;
		return res.status(200).send(successResp);
	});
});
	
baseEndPoint.post((req, res) => {
	let {
		name,
		age,
		address,
		contact,
		next_appt,
		medication,
		medical_condition,
		details
	} = req.body;

	let nowGMT = new Date();
	let newPatient = new Patient({
		id: uuid.v4().split("-").join(""),
		name,
		age,
		address,
		contact,
		next_appt: new Date(next_appt),
		first_appt: nowGMT,
		medication,
		medical_condition,
		details,
		updated_at: nowGMT,
		created_at: nowGMT
	});
	newPatient.save((err) => {
		if(err) {
			console.log("Error in adding new patient", err);
			return res.status(503).send(serviceUnavailableResp);
		}
		console.log("Successfully added user");
		return res.status(200).send(createdResp);
	});
});




let idEndPoint = router.route('/:pId');
idEndPoint.get((req, res) => {
	Patient.findOne({ id: req.params.pId }, (err, patient) => {
		if(err) {
			console.log("Failed to get patient!", err);
			return res.status(404).send(notFoundResp);
		}
		if(!patient) {
			console.log("No such patient");
			return res.status(404).send(notFoundResp);
		}
		console.log("Got patient with id " + req.params.pId);
		successResp.data = patient;
		return res.status(200).send(successResp);
	});
});

idEndPoint.put((req, res) => {
	let {
		name,
		age,
		address,
		contact,
		next_appt,
		medication,
		medical_condition,
		details
	} = req.body;
	Patient.findOneAndUpdate({ id: req.params.pId }, 
	{name, age, address, contact, next_appt, medication, medical_condition, details, 
	updated_at: new Date()	
	},
	(err, patient) => {
		if(err) {
			console.log("Failed to updated patient", err);
			return res.status(503).send(serviceUnavailableResp);
		}
		if(!patient) {
			console.log("No such patient");
			return res.status(404).send(notFoundResp);
		}
		console.log("Updated patient with id " + req.params.pId);
		return res.status(200).send(successResp);
	});
});

idEndPoint.delete((req, res) => {
	Patient.findOneAndRemove({ id: req.params.pId }, (err) => {
		if(err) {
			console.log("Failed to delete patient", err);
			return res.status(503).send(serviceUnavailableResp);
		}
		console.log("Deleted patient with id " + req.params.pId);
		return res.status(200).send(successResp);
	});
});

module.exports = router;

