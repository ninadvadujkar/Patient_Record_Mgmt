'use strict';
const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let UserSchema = new Schema({
	username: String,
	passwd: String
});

let User = mongoose.model('User', UserSchema);

module.exports = User;