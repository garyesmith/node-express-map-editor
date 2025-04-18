var express = require('express');
var router = express.Router();
const fs = require('node:fs');

var x=0;
var y=0;

/* GET home page. */
router.get('/', function(req, res, next) {
  var locations=fs.readFileSync('public/data/map.json', 'utf8');
  locations=JSON.parse(locations); // convert string to JSON object
  res.render('index', {title: 'Island Escape'});
});

module.exports = router;
