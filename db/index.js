var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/riley');

var db = mongoose.connection;

db.on('error', function() {
  console.log('mongoose connection error');
});

db.once('open', function() {
  console.log('mongoose connected successfully');
});

var userSchema = mongoose.Schema({
  email: String,
  accessToken: String,
  threads: String,
  watch: String
});

var User = mongoose.model('User', userSchema);

module.exports.User = User;
