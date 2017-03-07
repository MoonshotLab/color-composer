const express = require('express');
const router = express.Router();
const clientConfig = require('./../src/js/config');
const util = require('./../lib/util');

router.get('/', function (req, res) {
  res.render('index', {
    config: clientConfig,
    range: require('array-range'),
    selectedColor: util.randomPickFromArray(clientConfig.palette.colors)
  });
});

module.exports = router;
