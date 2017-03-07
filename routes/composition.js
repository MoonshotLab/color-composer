const express = require('express');
const router = express.Router();

const db = require('./../lib/db');
const texter = require('./../lib/texter');

router.get('/:id', function(req, res) {
  res.render('composition', {
    rootUrl : process.env.ROOT_URL,
    uuid    : req.params.id,
    s3Path  : 'https://s3.amazonaws.com/' + process.env.S3_BUCKET
  });
});

router.post('/new', function(req, res) {
  console.log('received info, making record for', req.query.phone, 'at', req.query.s3Id);
  if (req.query.postKey == process.env.SECRET_KEY) {
    let phone = req.query.phone;
    if (phone.length === 10) phone = '1' + phone;
    db.findRecordByS3Id(req.query.s3Id)
      .then(function(record) {
        if (record) {
          if (record.texted !== true) {
            return db.remember({
              phone : req.query.phone,
              s3Id  : req.query.s3Id,
              texted: true
            })
            .then(function() {
              texter.sendURL({
                phone : req.query.phone,
                url   : process.env.ROOT_URL + '/composition/' + req.query.s3Id
              });
            })
          }
        } else {
          // add it, but don't text
          return db.remember({
            phone : req.query.phone,
            s3Id  : req.query.s3Id,
            texted: false
          })
        }
      })
    .then(function(){
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
});

module.exports = router;
