const express = require('express');
const router = express.Router();

const MobileDetect = require('mobile-detect');

const clientConfig = require('./../src/js/config');
const util = require('./../lib/util');

router.get('/', function (req, res) {
  const md = new MobileDetect(req.headers['user-agent']);

  if (md.mobile() !== null) {
    // it's mobile!
    res.render('pages/mobile', {
      bodyClasses: 'mobile'
    });
  } else {
    const template = (process.env.LOCATION === 'gallery' ? 'gallery' : 'desktop');

    res.render(`pages/${template}`, {
      config: clientConfig,
      range: require('array-range'),
      selectedColor: util.randomPickFromArray(clientConfig.palette.colors),
      location: process.env.LOCATION,
      bodyClasses: `video-playing ${process.env.LOCATION}`,
      bodyId: 'body',
      title: 'Color Composer'
    });
  }
});

module.exports = router;
