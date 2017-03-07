const path = require('path');
const fs = require('fs');
const axios = require('axios');
const mailgun = require('mailgun-js')({
  apiKey  : process.env.MAILGUN_KEY,
  domain  : process.env.MAILGUN_DOMAIN
});

exports.extractEmailFromString = function(str){
  if (str) {
    const parsedStr = str.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
    if (parsedStr !== null && parsedStr.length > 0) {
      return parsedStr[0];
    }
  }

  console.log(`ignoring invalid email response via text, '${str}'`);

  return [];
};

exports.asyncDownloadFilesFromS3 = function(s3Id) {
  return new Promise(function(resolve, reject) {
    try {
      const outPath = path.join(process.cwd(), 'tmp');
      const outFile = fs.createWriteStream(path.join(outPath, s3Id + '.mp4'));
      const url     = 'https://s3.amazonaws.com/' + process.env.S3_BUCKET + '/' + s3Id + '.mp4';

      axios.get(url, {responseType: 'stream'})
        .then(function(res) {
          if (!!res && !!res.data) {
            res.data.pipe(outFile);
            resolve('files successfully downloaded')
          } else {
            reject();
          }
        })
        .catch(function(e) {
          reject(e);
        })
    } catch(e) {
      reject(e);
    }
  })
};

exports.sendEmail = function(emailAddress, filePath){
  const email = {
    from        : process.env.MAILGUN_SENDER,
    to          : emailAddress,
    subject     : 'Your Synesthetic Masterpiece',
    text        : 'Here’s your Color Composer video! Share using #BlochGalleriesKC.',
    attachment  : filePath
  };

  mailgun.messages().send(email, function(err, body){
    if(err) console.log(err);
    else {
      console.log('sent an email to', email);
    }
  });
};
