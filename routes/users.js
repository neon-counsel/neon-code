var express = require('express');
var router = express.Router();
var User = require('../models/users');
var jwt = require('jsonwebtoken');

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.post('/register', function(req, res, next) {
    var username = req.body.user_name;
    var password = req.body.password;
    //Check if account already exists
    User.findOne({ 'user_name': username }, function(err, user) {
        if (err)
            res.send(err);
        //Check to see if there's already a user with that email
        if (user) {
            res.status(401).json({
                "status": "info",
                "body": "Username already taken"
            });
        } else {
            //If there is no user with that username, create the user
            var newUser = new User();
            //Set the user's local credentials
            newUser.user_name = username;
            newUser.password = newUser.generateHash(password);
            newUser.access_token = createJWT({ user_name: username });
            newUser.save(function(err, user) {
                if (err)
                    throw err;
                res.cookie('Authorization', 'Bearer ' + user.access_token);
                res.json({ 'Success': 'Account created' });
            });
        }
    });
});

router.get('/login', function(req, res, next) {
    res.render('login', { title: 'Neon Code' });
});


router.post('/login', function(req, res, next) {
    var username = req.body.user_name;
    var password = req.body.password;
    User.findOne({ 'user_name': username }, function(err, user) {
        //If there are any errors, return the error
        if (err)
            res.send(err);
        //If user account found then check the password
        if (user) {
            //Compare passwords
            if (user.validPassword(password)) {
                //Success: Assign new access tokens for the sessions
                user.access_token = createJWT({ user_name: username });
                user.save();
                res.cookie('Authorization', 'Bearer ' + user.access_token);
                res.json({ 'Success': 'Logged in' });
            } else {
                res.status(401).send({
                    "status": "error",
                    "body": "Email or password does not match"
                });
            }
        } else {
            res.status(401).send({
                "status": "error",
                "body": "Username not found"
            });
        }
    });
});

//Create a JWT
function createJWT(profile) {
    return jwt.sign(profile, 'insertmessagehere', {
        expiresIn: '10d'
    });
}

module.exports = router;