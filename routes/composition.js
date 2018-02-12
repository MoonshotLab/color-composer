const express = require('express');
const router = express.Router();

const db = require('./../lib/db');
const texter = require('./../lib/texter');
const util = require('./../lib/util');

router.get('/:id', function(req, res) {
  res.render('pages/composition', {
    rootUrl: process.env.ROOT_URL,
    uuid: req.params.id,
    s3Path: 'https://s3.amazonaws.com/' + process.env.S3_BUCKET,
    bodyId: 'composition-detail',
    title: 'My Kandinsky-inspired Soundscape'
  });
});

router.post('/new', function(req, res) {
  if (req.query.location === 'desktop') {
    console.log('received info, making desktop record at', req.query.s3Id);
    if (req.query.postKey == process.env.SECRET_KEY) {
      return db
        .remember({
          s3Id: req.query.s3Id,
          texted: false,
          location: 'desktop'
        })
        .then(function() {
          res.sendStatus(200);
        })
        .catch(function(e) {
          console.error('error:', e);
          res.sendStatus(401);
        });
    } else {
      console.error('incorrect secret key');
      res.sendStatus(401);
    }
  } else {
    console.log(
      'received info, making gallery record for',
      req.query.phone,
      'at',
      req.query.s3Id
    );
    if (req.query.postKey == process.env.SECRET_KEY) {
      let phone = req.query.phone;
      if (phone.length === 10) phone = '1' + phone;
      db
        .findRecordByS3Id(req.query.s3Id)
        .then(function(record) {
          if (record) {
            if (record.texted !== true) {
              return db
                .remember({
                  phone: req.query.phone,
                  s3Id: req.query.s3Id,
                  texted: true,
                  location: 'gallery'
                })
                .then(function() {
                  texter.sendURL({
                    phone: req.query.phone,
                    url:
                      process.env.ROOT_URL_WWW +
                      '/composition/' +
                      req.query.s3Id
                  });
                });
            }
          } else {
            // add it, but don't text
            return db.remember({
              phone: req.query.phone,
              s3Id: req.query.s3Id,
              texted: false,
              location: 'gallery'
            });
          }
        })
        .then(function() {
          res.sendStatus(200);
        })
        .catch(function(e) {
          console.error('error:', e);
          res.sendStatus(401);
        });
    } else {
      console.error('incorrect secret key');
      res.sendStatus(401);
    }
  }
});

router.post('/send-email', function(req, res) {
  if (!!req.query && !!req.query.email && !!req.query.s3Id) {
    try {
      const email = req.query.email;
      const s3Id = req.query.s3Id;

      console.log(`Emailing composition ${s3Id} to ${email}`);

      util
        .asyncDownloadFilesFromS3(s3Id)
        .then(function(stream) {
          return util.asyncSendEmailWithAttachment(email, stream);
        })
        .then(function() {
          res.sendStatus(200);
        })
        .catch(function(e) {
          console.error(e);
          res.sendStatus(401);
        });
    } catch (e) {
      console.error(e);
      res.sendStatus(401);
    }
  } else {
    console.error('malformed request to share via email');
    res.sendStatus(401);
  }
});

module.exports = router;
