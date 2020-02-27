var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

//Verify a JWT
function verifyJWT(jwtString){
  var value = jwt.verify(jwtString, 'insertmessagehere');
  console.log(value);
  return value;
}


/* GET home page. */
router.get('/', function(req, res, next) {
  try {
    var jwtString = req.cookies.Authorization.split(" ");
    var profile = verifyJWT(jwtString[1]);
    if (profile) {
      res.render('index', { title: 'Neon Code', profile: profile });
    }
  } catch (err) {
    res.render('index', { title: 'Neon Code' });
  }
  
});

module.exports = router;
