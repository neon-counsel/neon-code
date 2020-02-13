var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

//Verify a JWT
function verifyJWT(jwtString){
  var value = jwt.verify(jwtString, 'JWT successfully verified');
  return value;
}


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Neon Code' });
});

module.exports = router;
