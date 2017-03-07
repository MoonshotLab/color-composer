const express = require('express');
const router = express.Router();
const clientConfig = require('./../src/js/config');

router.get('/', function (req, res) {
  res.render('index', {
    config: clientConfig,
    range: require('array-range')
  });
});

module.exports = router;
