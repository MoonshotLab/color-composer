const path      = require('path');
const knox      = require('knox');
const async     = require('async');
const Promise = require('bluebird');

const s3Client  = knox.createClient({
  key     : config.S3_KEY,
  secret  : config.S3_SECRET,
  bucket  : config.S3_BUCKET
});

exports.remember = function(uuid, files){
  return new Promise(function(resolve, reject){
    async.eachSeries(files, function(file, next){
      var remoteFile = uuid + path.extname(file);
      s3Client.putFile(file, remoteFile, next);
    }, resolve);
  });
};
