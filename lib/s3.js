const path      = require('path');
const knox      = require('knox');
const async     = require('async');
const Promise = require('bluebird');

const s3Config = {
  key: process.env.S3_KEY,
  secret: process.env.S3_SECRET,
  bucket: process.env.S3_BUCKET
};
const s3Client  = knox.createClient(s3Config);

exports.asyncRemember = function(uuid, files) {
  return new Promise(function(resolve, reject) {
    async.eachSeries(files, function(file, next) {
      const remoteFile = uuid + path.extname(file);
      console.log('uploading', remoteFile);
      s3Client.putFile(file, remoteFile, next);
    }, function() {
      console.log('s3 done uploading');
      resolve('asyncRemember done');
    });
  });
}
