'use strict';
const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let patientSchema = new Schema({
	id: String,
	name: String,
	age: String,	
	address: String,
	contact: String,
	next_appt: Date,
	first_appt: Date,
	medication: String,
	medical_condition: String,
	details: String,
	updated_at: Date,
	created_at: Date
});

let Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;