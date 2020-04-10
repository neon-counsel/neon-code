var express = require('express');
var router = express.Router();
var Project = require('../models/project');
var jwt = require('jsonwebtoken');

//Verify a JWT
function verifyJWT(jwtString){
  var value = jwt.verify(jwtString, 'insertmessagehere');
  return value;
}

/* GET home page. */
router.get('/', function(req, res, next) {
  try {
    var jwtString = req.cookies.Authorization.split(" ");
    var profile = verifyJWT(jwtString[1]);
    if (profile) {
      Project.find({user_id: profile.user_name}, function(err, projects) {
        Project.find({stars: {$gt: 0}}).sort({"stars":-1}).limit(10).exec(function(err, popular) {
          res.render('index', { title: 'Neon Code', profile: profile, projects: projects, project_cards: popular});

        });
      });
    }
  } catch (err) {
    res.redirect("/users/register");
  }
  
});

module.exports = router;
