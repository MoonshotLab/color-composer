const MongoClient = require('mongodb').MongoClient;
const Promise = require('bluebird');

let database = null;
const collectionName = 'compositions';

MongoClient.connect(process.env.DB_URI, function(err, db) {
  if (err) console.log(`Error connecting to db at ${process.env.DB_URI}`, err);
  else console.log(`Connected to db at ${process.env.DB_URI}`);

  database = db;
});

// s3Id   : the s3 id connecting the mp4, webm, and
// phone  : a phone number to use as text receiver
exports.remember = function(data) {
  const collection = database.collection(collectionName);

  return new Promise(function(resolve, reject) {
    try {
      collection.insert(data, function(err, res) {
        if (err) reject(err);
        else resolve(process.env.ROOT_URL + '/' + data.s3Id);
      });
    } catch (e) {
      reject(e);
    }
  });
};

// phone : 181655512345
exports.findRecordByPhoneNumber = function(phone) {
  const collection = database.collection(collectionName);

  return new Promise(function(resolve, reject) {
    try {
      collection.find({ phone: phone }).toArray(function(err, docs) {
        if (err) reject(err);
        else resolve(docs[docs.length - 1]);
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.findRecordByS3Id = function(s3Id) {
  const collection = database.collection(collectionName);

  return new Promise(function(resolve, reject) {
    try {
      collection.find({ s3Id: s3Id }).toArray(function(err, docs) {
        if (err) reject(err);
        else resolve(docs[docs.length - 1]);
      });
    } catch (e) {
      reject(e);
    }
  });
};

exports.getMany = function(opts) {
  const collection = database.collection(collectionName);
  const options = {
    limit: 25,
    sort: { s3Id: -1 },
    skip: opts.offset
  };

  return new Promise(function(resolve, reject) {
    try {
      collection.find({}, options).toArray(function(err, docs) {
        if (err) reject(err);
        else resolve(docs);
      });
    } catch (e) {
      reject(e);
    }
  });
};
