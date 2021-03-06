'use strict';
const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const uuid = require('uuid');

const createdResp = {
	code: 201,
	message: "Added new patient"
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
		if(patients.length === 0) {
			console.log("Empty patient list");
			return res.status(204).send();
		}
		console.log("Got patient list");
		return res.status(200).send({
			code: 200,
			message: "OK",
			data: patients
		});
	});
});
	
baseEndPoint.post((req, res) => {
	let {
		name,
		birthdate,
		address,
		contact,
		next_appt_date,
		next_appt_time,
		medication,
		medical_condition,
		details
	} = req.body;

	let nowGMT = new Date();
	let newPatient = new Patient({
		id: uuid.v4().split("-").join(""),
		name,
		birthdate,
		address,
		contact,
		next_appt_date,
		next_appt_time,
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
		return res.status(200).send({
			code: 200,
			message: "OK",
			data: patient
		});
	});
});

idEndPoint.put((req, res) => {
	let {
		name,
		birthdate,
		address,
		contact,
		next_appt_date,
		next_appt_time,
		medication,
		medical_condition,
		details
	} = req.body;
	Patient.findOneAndUpdate({ id: req.params.pId }, 
	{
		name, birthdate, address, contact, next_appt_date,
		next_appt_time, medication, medical_condition, details, 
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
		return res.status(200).send({
			code: 200,
			message: "OK"
		});
	});
});

idEndPoint.delete((req, res) => {
	Patient.findOneAndRemove({ id: req.params.pId }, (err) => {
		if(err) {
			console.log("Failed to delete patient", err);
			return res.status(503).send(serviceUnavailableResp);
		}
		console.log("Deleted patient with id " + req.params.pId);
		return res.status(200).send({
			code: 200,
			message: "OK"
		});
	});
});

module.exports = router;

