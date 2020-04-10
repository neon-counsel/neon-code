var express = require('express');
var router = express.Router();
var User = require('../models/users');
var Project = require('../models/project');

var jwt = require('jsonwebtoken');

//Verify a JWT
function verifyJWT(jwtString) {
    var value = jwt.verify(jwtString, 'insertmessagehere');
    return value;
}
/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
    res.render('register', { title: 'Neon Code' });
});



router.post('/register', function(req, res, next) {
    var username = req.body.user_name;
    var password = req.body.password;
    var email = req.body.email;
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
            newUser.email = email;
            newUser.access_token = createJWT({user_name: username, vs_port: 8080 });
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
                user.access_token = createJWT({ user_id: user._id, user_name: username, vs_port: 8080});
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

router.get('/logout', function(req, res, next) {
    res.clearCookie("Authorization");
    res.redirect('/');
});

router.get('/:user', function(req, res, next) {
    var user = req.params.user;
    User.findOne({ 'user_name': user }, function(err, user) {
        if (err){
            res.status(404);
            return;
        }else{
            Project.find({user_id: user.user_name}, function(err, projects) {
                if(err) {
                    res.send(err);
                }else {
                    var totalStars = 0;
                projects.forEach(function(project){
                    totalStars += project.stars.length;
                });
                res.render('profile', { title: 'Neon Code', profile: user, projects: projects, stars: totalStars});
                }
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