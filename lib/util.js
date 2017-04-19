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
            // res.data.pipe(outFile);
            resolve(res.data)
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

exports.sendEmail = function(emailAddress, file){
  const email = {
    from        : `Color Composer <${process.env.MAILGUN_SENDER}>`,
    to          : emailAddress,
    subject     : 'Your Kandinsky-inspired Soundscape',
    text        : 'Here’s your Color Composer video! Share using #BlochGalleriesKC.',
    attachment  : file
  };

  mailgun.messages().send(email, function(err, body){
    if(err) console.log(err);
    else {
      console.log('sent an email to', email);
    }
  });
};

exports.asyncSendEmailWithAttachment = function(emailAddress, file) {
  return new Promise(function(resolve, reject) {
    try {
      const email = {
        from        : `Color Composer <${process.env.MAILGUN_SENDER}>`,
        to          : emailAddress,
        subject     : 'Your Kandinsky-inspired Soundscape',
        text        : 'Here’s your Color Composer video! Share using #BlochGalleriesKC.',
        attachment  : file
      };

      mailgun.messages().send(email, function(err, body){
        if(err) {
          reject(err);
        } else {
          resolve(`successfully sent email to ${emailAddress}`);
        }
      });
    } catch(e) {
      reject(e);
    }
  })
}


exports.randomPickFromArray = function(a) {
  if (!!a && a.length > 0) {
    return a[Math.floor(Math.random() * a.length)];
  }

  return null;
}
