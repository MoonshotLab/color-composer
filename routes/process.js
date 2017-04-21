const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'tmp/' });
const Promise = require('bluebird');
const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf'); // rm -rf
const cp = require('child-process-promise');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

const io = require('./../app').io;

const db = require('./../lib/db');
const s3 = require('./../lib/s3');
const texter = require('./../lib/texter');

const cwd = process.cwd();
const bumperTsPath = path.join(cwd, 'public', 'video', 'bumper.ts');

const outWidth = 1980;
const outHeight = 990;

const uploadFieldsSpec = [
  {
    name: 'video',
    maxCount: 1
  },
  {
    name: 'audio',
    maxCount: 1
  }
];

function getTimeBasedIdentifier() {
  return new Date().getTime().toString();
}

function asyncMakeDirectory(outPath) {
  return new Promise(function(resolve, reject) {
    fs.mkdir(outPath, function() {
      resolve('directory created');
    });
  });
}

function asyncMoveFile(inPath, outPath) {
  return new Promise(function(resolve, reject) {
    try {
      fs.rename(inPath, outPath, function() {
        resolve(`file ${inPath} moved to ${outPath}`);
      });
    } catch(e) {
      reject(e);
    }
  });
}

function asyncMoveUploadedFilesToDirectory(outPath, videoBlob, audioBlob) {
  return new Promise(function(resolve, reject) {
    try {
      const videoBlobPath = path.join(outPath, 'videoblob');
      const audioBlobPath = path.join(outPath, 'audioblob');
      Promise.all([asyncMoveFile(videoBlob.path, videoBlobPath), asyncMoveFile(audioBlob.path, audioBlobPath)])
        .then(function() {
          resolve({
            videoBlobPath: videoBlobPath,
            audioBlobPath: audioBlobPath
          });
        })
        .catch(function(e) {
          reject(e);
        })
    } catch(e) {
      reject(e);
    }
  })
}

function asyncMergeAndResize(outPath) {
  return new Promise(function(resolve, reject) {
    try {
      const mergedOutPath = path.join(outPath, 'merged.mp4');
      const videoPath = path.join(outPath, 'videoblob');
      const audioPath = path.join(outPath, 'audioblob');
      const command = [
        ffmpegPath,
        `-i ${videoPath}`,
        `-i ${audioPath}`,
        '-c:v libx264',
        '-b:v 6400k',
        '-b:a 4800k',
        `-aspect ${parseInt(outWidth / outHeight)}:1`,
        `-vf 'scale=${outWidth}:${outHeight}:force_original_aspect_ratio=decrease,pad=${outWidth}:${outHeight}:x=(${outWidth}-iw)/2:y=(${outHeight}-ih)/2:color=black'`,
        '-strict experimental',
        mergedOutPath,
        '-y'
      ].join(' ');

      cp.exec(command)
        .then(function() {
          resolve('asyncMergeAndResize successful');
        })
        .catch(function(e) {
          reject(e);
        });
    } catch(e) {
      reject(e);
    }
  });
}

function asyncMakeIntoTransportStream(outPath) {
  return new Promise(function(resolve, reject) {
    try {
      const mergedOutPath = path.join(outPath, 'merged.mp4');
      const mergedTsOutPath = path.join(outPath, 'merged.ts');
      const command = [
        ffmpegPath,
        `-i ${mergedOutPath}`,
        '-c copy',
        '-bsf:v h264_mp4toannexb',
        '-f mpegts',
        mergedTsOutPath,
        '-y'
      ].join(' ');

      cp.exec(command)
        .then(function() {
          resolve('makeIntoTransportStream successful');
        })
        .catch(function(e) {
          reject(e);
        });
    } catch(e) {
      reject(e);
    }
  })
}

function asyncConcatWithBumper(outPath, compositionId) {
  return new Promise(function(resolve, reject) {
    try {
      const mergedTsOutPath = path.join(outPath, 'merged.ts');
      const finalOutPath = path.join(outPath, `${compositionId}.mp4`);
      const command = [
        ffmpegPath,
        `-i "concat:${mergedTsOutPath}|${mergedTsOutPath}|${bumperTsPath}"`,
        '-c copy',
        '-bsf:a aac_adtstoasc',
        finalOutPath,
        '-y'
      ].join(' ');

      cp.exec(command)
        .then(function() {
          resolve('concatWithBumper successful');
        })
        .catch(function(e) {
          reject(e);
        });
    } catch(e) {
      reject(e);
    }
  })
}

function asyncMakeWebMFromMp4(outPath, compositionId) {
  return new Promise(function(resolve, reject) {
    try {
      const mp4Path = path.join(outPath, `${compositionId}.mp4`);
      const webMPath = path.join(outPath, `${compositionId}.webm`);
      const command = [
        ffmpegPath,
        `-i ${mp4Path}`,
        '-c:v libvpx',
        '-crf 10',
        '-b:v 1M',
        '-c:a libvorbis',
        webMPath,
        '-y'
      ].join(' ');

      cp.exec(command)
        .then(function() {
          resolve('makeWebm successful')
        })
        .catch(function(e) {
          reject(e);
        });
    } catch(e) {
      reject(e);
    }
  })
}

function asyncGenerateThumbnail(outPath, compositionId) {
  return new Promise(function(resolve, reject) {
    try {
      const finalVideoPath = path.join(outPath, `${compositionId}.mp4`);
      const thumbnailOutPath = path.join(outPath, `${compositionId}.jpg`);
      const command = [
        ffmpegPath,
        `-i ${finalVideoPath}`,
        '-ss 0',
        '-vframes 1',
        thumbnailOutPath,
        '-y'
      ].join(' ');

      cp.exec(command)
        .then(function() {
          resolve('generateThumbnail successful');
        })
        .catch(function(e) {
          reject(e);
        });
    } catch(e) {
      reject(e);
    }
  })
}

function asyncRemoveFile(filePath) {
  return new Promise(function(resolve, reject) {
    try {
      fs.unlink(filePath, function() {
        resolve(`${filePath} removed`);
      });
    } catch(e) {
      reject(e);
    }
  })
}

function asyncCleanDirPreUpload(outPath, compositionId) {
  return new Promise(function(resolve, reject) {
    try {
      const mergedTsPath = path.join(outPath, 'merged.ts');
      const mergedMp4Path = path.join(outPath, 'merged.mp4');
      const videoBlobPath = path.join(outPath, 'videoblob');
      const audioBlobPath = path.join(outPath, 'audioblob');

      // there has to be a more elegant way to build this list. list comprehensions??
      Promise.all([asyncRemoveFile(mergedTsPath), asyncRemoveFile(mergedMp4Path), asyncRemoveFile(videoBlobPath), asyncRemoveFile(audioBlobPath)])
        .then(function() {
          resolve('directory cleaned')
        })
        .catch(function(e) {
          reject(e);
        });
    } catch(e) {
      reject(e);
    }
  });
}

function asyncUploadToS3(outPath, compositionId) {
  return new Promise(function(resolve, reject) {
    try {
      fs.readdir(outPath, function(err, res) {
        if (err) reject(err);

        let files = [];
        res.forEach(function(file) {
          files.push(path.join(outPath, file));
        });

        s3.asyncRemember(compositionId, files)
          .then(function() {
            resolve('uploaded to s3');
          })
          .catch(function(e) {
            reject(e);
          })
      })
    } catch(e) {
      reject(e);
    }
  })
}

function asyncDestroyTmpDir(outPath) {
  return new Promise(function(resolve, reject) {
    try {
      rimraf(outPath, function() {
        resolve('directory destroyed');
      });
    } catch(e) {
      reject(e);
    }
  });
}

router.get('/', function(req, res) {
  res.render('process', {
    videoId: req.query.id
  });
})

router.post('/', upload.fields(uploadFieldsSpec), function(req, res, next) {
  if ('video' in req.files && 'audio' in req.files) {
    const compositionId = getTimeBasedIdentifier();
    const outPath = path.join(cwd, 'tmp', compositionId);

    const videoBlob = req.files.video[0];
    const audioBlob = req.files.audio[0];
    let clientId = null;

    if (!!req.body && !!req.body.uuid) {
      clientId = req.body.uuid;
    }

    let identifier = null;
    if (clientId !== null && process.env.LOCATION === 'desktop') {
      identifier = clientId;
    } else {
      identifier = 'gallery';
    }

    console.log(`${identifier}: processing ${compositionId} at ${outPath}`);
    console.log(`${identifier}: makeDirectory`);
    asyncMakeDirectory(outPath)
      .then(function() {
        console.log(`${identifier}: movingBlobFiles`);
        return asyncMoveUploadedFilesToDirectory(outPath, videoBlob, audioBlob)
      })
      .then(function(resp) {
        res.send(compositionId);
        console.log(`${identifier}: mergeAndResize`);
        return asyncMergeAndResize(outPath, resp.videoBlobPath, resp.audioBlobPath);
      })
      .then(function() {
        console.log(`${identifier}: makeIntoTransportStream`);
        return asyncMakeIntoTransportStream(outPath);
      })
      .then(function() {
        console.log(`${identifier}: concatWithBumper`);
        return asyncConcatWithBumper(outPath, compositionId);
      })
      .then(function() {
        console.log(`${identifier}: generateThumbnail`);
        return asyncGenerateThumbnail(outPath, compositionId);
      })
      .then(function() {
        console.log(`${identifier}: makeWebm`);
        return asyncMakeWebMFromMp4(outPath, compositionId);
      })
      .then(function() {
        console.log(`${identifier}: cleanDirPreUpload`);
        return asyncCleanDirPreUpload(outPath, compositionId);
      })
      .then(function() {
        console.log(`${identifier}: uploadToS3`);
        return asyncUploadToS3(outPath, compositionId);
      })
      .then(function() {
        console.log(`${identifier}: destropTmpDir`);
        return asyncDestroyTmpDir(outPath);
      })
      .then(function() {
        console.log(`${identifier}: video processed successfully`);
        if (process.env.LOCATION === 'desktop') {
          // desktop, notify client socket connection
          console.log(`${identifier}: notifying client`);
          io.sockets.in(clientId).emit('new_msg', {msg: 'video_done_processing'});
        } else {
          // gallery, text phone number
          // see if compositionId is already in db
          db.findRecordByS3Id(compositionId)
            .then(function(record) {
              console.log(`${identifier}: texting link if record exists`);
              if (record) {
                texter.sendURL({
                  phone : record.phone,
                  url   : process.env.ROOT_URL_WWW + '/composition/' + record.s3Id
                });
              } else {
                console.log(`${identifier}: record does not exist, adding for future texting`);
                return db.remember({
                  s3Id: compositionId,
                  texted: false,
                  emailed: false
                })
              }
            })
        }
      })
      .catch(function(err) {
        console.error(err);
      });
  } else {
    console.log('improper post');
    res.send('invalid data');
  }
});

module.exports = router;
