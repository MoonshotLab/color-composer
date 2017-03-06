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

const s3 = require('./../lib/s3');

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

function getUuid() {
  return new Date().getTime().toString();
}

function asyncMakeDirectory(outPath) {
  return new Promise(function(resolve, reject) {
    fs.mkdir(outPath, function() {
      resolve('directory created');
    });
  });
}

function asyncMergeAndResize(outPath, videoPath, audioPath) {
  return new Promise(function(resolve, reject) {
    try {
      const fullVideoPath = path.join(cwd, videoPath);
      const fullAudioPath = path.join(cwd, audioPath);
      const mergedOutPath = path.join(outPath, 'merged.mp4');
      const command = [
        ffmpegPath,
        `-i ${fullVideoPath}`,
        `-i ${fullAudioPath}`,
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

function asyncConcatWithBumper(outPath, uuid) {
  return new Promise(function(resolve, reject) {
    try {
      const mergedTsOutPath = path.join(outPath, 'merged.ts');
      const finalOutPath = path.join(outPath, `${uuid}.mp4`);
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

function asyncMakeWebMFromMp4(outPath, uuid) {
  return new Promise(function(resolve, reject) {
    try {
      const mp4Path = path.join(outPath, `${uuid}.mp4`);
      const webMPath = path.join(outPath, `${uuid}.webm`);
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

function asyncGenerateThumbnail(outPath, uuid) {
  return new Promise(function(resolve, reject) {
    try {
      const finalVideoPath = path.join(outPath, `${uuid}.mp4`);
      const thumbnailOutPath = path.join(outPath, `${uuid}.jpg`);
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

function asyncCleanDirPreUpload(outPath, uuid) {
  return new Promise(function(resolve, reject) {
    try {
      const mergedTsPath = path.join(outPath, 'merged.ts');
      const mergedMp4Path = path.join(outPath, 'merged.mp4');

      Promise.all([asyncRemoveFile(mergedTsPath), asyncRemoveFile(mergedMp4Path)])
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

function asyncUploadToS3(outPath, uuid) {
  return new Promise(function(resolve, reject) {
    try {
      fs.readdir(outPath, function(err, res) {
        if (err) reject(err);

        let files = [];
        res.forEach(function(file) {
          files.push(path.join(outPath, file));
        });

        s3.asyncRemember(uuid, files)
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
    const uuid = getUuid();
    const outPath = path.join(cwd, 'tmp', uuid);

    const videoBlob = req.files.video[0];
    const audioBlob = req.files.audio[0];

    console.log(`processing ${uuid} at ${outPath}`);
    console.log('makeDirectory');
    asyncMakeDirectory(outPath)
      .then(function() {
        console.log('mergeAndResize');
        return asyncMergeAndResize(outPath, videoBlob.path, audioBlob.path);
      })
      .then(function() {
        res.send(uuid);
        console.log('makeIntoTransportStream');
        return asyncMakeIntoTransportStream(outPath);
      })
      .then(function() {
        console.log('concatWithBumper');
        return asyncConcatWithBumper(outPath, uuid);
      })
      .then(function() {
        console.log('generateThumbnail');
        return asyncGenerateThumbnail(outPath, uuid);
      })
      .then(function() {
        console.log('makeWebm');
        return asyncMakeWebMFromMp4(outPath, uuid);
      })
      .then(function() {
        console.log('cleanDirPreUpload');
        return asyncCleanDirPreUpload(outPath, uuid);
      })
      .then(function() {
        console.log('uploadToS3');
        return asyncUploadToS3(outPath, uuid);
      })
      .then(function() {
        console.log('destropTmpDir');
        return asyncDestroyTmpDir(outPath);
      })
      .then(function() {
        console.log('video processed successfully');
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
