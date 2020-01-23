var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
require('./util');

var usersSchema = new Schema({
  user_name: {type : String},
  password: {type : String},
  access_token: {type : String}
});

//Hash password for storage in DB
usersSchema.methods.generateHash = function(password){
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
};

//Compare passwords to determine if user is who they say they are
usersSchema.methods.validPassword = function(password){
  return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('User', usersSchema);
