const MongoClient = require('mongodb').MongoClient;
const Promise = require('bluebird');

let database = null;

MongoClient.connect(process.env.DB_URI, function(err, db) {
  if(err) console.log('error connecting to db...', err);
  else console.log('connected to db...');

  database = db;
});


// s3Id   : the s3 id connecting the mp4, webm, and
// phone  : a phone number to use as text receiver
exports.remember = function(data){
  const collection = database.collection('compositions');

  return new Promise(function(resolve, reject) {
    collection.insert(data, function(err, res) {
      if(err) reject(err);
      else resolve(process.env.ROOT_URL + '/' + data.s3Id);
    });
  });
};


// phone : 181655512345
exports.findRecordByPhoneNumber = function(phone){
  const collection = database.collection('compositions');

  return new Promise(function(resolve, reject){
    collection.find({ phone : phone }).toArray(function(err, docs){
      if(err) reject(err);
      else resolve(docs[docs.length-1]);
    });
  });
};


exports.getMany = function(opts){
  const collection = database.collection('compositions');
  const options = {
    'limit' : 25,
    'sort'  : { 's3Id' : -1 },
    'skip'  : opts.offset
  };

  return new Promise(function(resolve, reject){
    collection.find({}, options).toArray(function(err, docs){
      if(err) reject(err);
      else resolve(docs);
    });
  });
};
