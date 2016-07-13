var mongoose = require('mongoose');

var Schema = new mongoose.Schema({
	username : String,
	salt : String,
	hash : String
});


var user = mongoose.model('Users' , Schema , 'UsersList');

module.exports = user;