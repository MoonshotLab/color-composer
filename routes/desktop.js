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
    const location = 'desktop';
    const template = location;

    res.render(`pages/${template}`, {
      config: clientConfig,
      range: require('array-range'),
      selectedColor: util.randomPickFromArray(clientConfig.palette.colors),
      location: location,
      bodyClasses: `video-playing ${location}`,
      bodyId: 'body',
      title: 'Color Composer'
    });
  }
});

module.exports = router;
