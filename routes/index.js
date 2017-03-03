const express = require('express');
const router = express.Router();
const config = require('./../config');

router.get('/', function (req, res) {
  res.render('index', {
    config: config,
    range: require('array-range')
  });
});

module.exports = router;
