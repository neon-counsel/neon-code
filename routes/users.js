var express = require('express');
var router = express.Router();
var User = require('../models./users');
var jwt = require('jsonwebtoken');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('register', function(req, res, next){
  var username = req.body.user_name;
  var password = req.body.password;
  //Check if account already exists
  User.findOne({'user_name' : username}, function(err, user){
    if(err)
      res.send(err);
    //Check to see if there's already a user with that email
    if(user){
      res.status(401).json({
        "status": "info",
        "body": "Username already taken"
      });
    } else{
      //If there is no user with that username, create the user
      var newUser = new User();
      //Set the user's local creditionals
      newUser.user_name = username;
      newUser.password = newUser.generateHash(password);
      newUser.access_token = createJWT({user_name:username});
      newUser.save(function(err, user){
        if(err)
          throw err;
        res.cookie('Authorisation', 'Bearer' + user.access_token);
        res.json({'Success' : 'Account created'});
      });
    }
  });
});

module.exports = router;
