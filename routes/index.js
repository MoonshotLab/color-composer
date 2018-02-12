const express = require('express');
const router = express.Router();

const MobileDetect = require('mobile-detect');

const clientConfig = require('./../src/js/config');
const util = require('./../lib/util');

router.get('/', function(req, res) {
  const md = new MobileDetect(req.headers['user-agent']);
  const desktopVideoUrl =
    'https://s3.amazonaws.com/nelson-atkins/cc_intro_desktop_web.mp4';
  const galleryVideoUrl = 'https://s3.amazonaws.com/nelson-atkins/cc_intro.mp4';

  if (md.mobile() !== null) {
    // it's mobile!
    res.render('pages/mobile', {
      bodyClasses: 'mobile'
    });
  } else {
    let template, videoUrl;
    if (process.env.LOCATION === 'gallery') {
      template = 'gallery';
      videoUrl = galleryVideoUrl;
    } else {
      template = 'desktop';
      videoUrl = desktopVideoUrl;
    }

    res.render(`pages/${template}`, {
      config: clientConfig,
      range: require('array-range'),
      selectedColor: util.randomPickFromArray(clientConfig.palette.colors),
      location: process.env.LOCATION,
      bodyClasses: `video-playing ${process.env.LOCATION}`,
      bodyId: 'body',
      title: 'Color Composer',
      videoUrl: videoUrl
    });
  }
});

module.exports = router;
