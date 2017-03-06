const express = require('express');
const router = express.Router();
const validator = require('validator');
const fs = require('fs');
const path = require('path');

const db = require('./../lib/db');
const utils = require('./../lib/utils');

router.post('/', function(req, res) {
  console.log('received a text-message request for e-mail');

  console.log(req.body);

  const emailAddress = utils.extractEmailFromString(req.body.Body);

  if(emailAddress.length > 0 && validator.isEmail(emailAddress)) {
    const phoneNumber = req.body.From.replace('+', '');

    db.findRecordByPhoneNumber(phoneNumber).then(function(record){
      // check to see if the file exists, if not download it from S3
      // then e-mail it
      if (record) {
        const file = path.join(process.cwd(), 'tmp', record.s3Id + '.mp4');
        fs.stat(file, function(err, stat){
          console.log('found record, downloading and e-mailing to', emailAddress);
          if (err) {
            utils.asyncDownloadFilesFromS3(record.s3Id)
              .then(function() {
                utils.sendEmail(emailAddress, file);
              });
          } else {
            utils.sendEmail(emailAddress, file);
          }
        });
      } else {
        console.log('could not find a matching record for phone number:', phoneNumber);
      }
    }).catch(console.log);
  }

  res.send('');
});

module.exports = router;
