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
    const template = 'desktop';
    const location = template;
    const videoUrl = 'https://s3.amazonaws.com/nelson-atkins/cc_intro_desktop_web.mp4';

    res.render(`pages/${template}`, {
      config: clientConfig,
      range: require('array-range'),
      selectedColor: util.randomPickFromArray(clientConfig.palette.colors),
      location: location,
      bodyClasses: `video-playing ${location}`,
      bodyId: 'body',
      title: 'Color Composer',
      videoUrl: videoUrl
    });
  }
});

module.exports = router;
