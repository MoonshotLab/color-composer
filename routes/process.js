const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'tmp/' });

const cp = require('child-process-promise');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

const cwd = process.cwd();

const mergedOutPath = `${cwd}/tmp/merged.mp4`;
const mergedTsOutPath = `${cwd}/tmp/merged.ts`;
const bumperTsPath = `${cwd}/public/video/bumper.ts`;
const finalPath = `${cwd}/tmp/final.mp4`;

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

function getMergeAndResizeCommand(videoPath, audioPath) {
  return [
    ffmpegPath,
    `-i ${cwd}/${videoPath}`,
    `-i ${cwd}/${audioPath}`,
    '-c:v libx264',
    '-b:v 6400k',
    '-b:a 4800k',
    `-aspect ${parseInt(outWidth / outHeight)}:1`,
    `-vf 'scale=${outWidth}:${outHeight}:force_original_aspect_ratio=decrease,pad=${outWidth}:${outHeight}:x=(${outWidth}-iw)/2:y=(${outHeight}-ih)/2:color=black'`,
    '-strict experimental',
    mergedOutPath,
    '-y'
  ].join(' ');
}

function getMakeIntoTransportStreamCommand() {
  // https://trac.ffmpeg.org/wiki/Concatenate
  return [
    ffmpegPath,
    `-i ${mergedOutPath}`,
    '-c copy',
    '-bsf:v h264_mp4toannexb',
    '-f mpegts',
    mergedTsOutPath,
    '-y'
  ].join(' ');
}

function getConcatWithBumperCommand() {
  return [
    ffmpegPath,
    `-i "concat:${mergedTsOutPath}|${mergedTsOutPath}|${bumperTsPath}"`,
    '-c copy',
    '-bsf:a aac_adtstoasc',
    finalPath,
    '-y'
  ].join(' ');
}

router.get('/', function(req, res) {
  res.render('process');
})

router.post('/', upload.fields(uploadFieldsSpec), function(req, res, next) {
  console.log('got a post!');
  console.log(req.files);
  if ('video' in req.files && 'audio' in req.files) {
    const videoBlob = req.files.video[0];
    const audioBlob = req.files.audio[0];

    const mergeAndResizeCommand = getMergeAndResizeCommand(videoBlob.path, audioBlob.path);
    const makeIntoTransportStreamCommand = getMakeIntoTransportStreamCommand();
    const concatWithBumperCommand = getConcatWithBumperCommand();

    cp.exec(mergeAndResizeCommand).then(function() {
      cp.exec(makeIntoTransportStreamCommand).then(function() {
        cp.exec(concatWithBumperCommand).then(function() {
          console.log('concatWithBumper done!!!');
          res.send('success');
        })
        .catch(function(err) {
          console.log('concatWithBumper err', err)
          res.send('error');
        })
      })
      .catch(function(err) {
        console.log('makeIntoTransportStream error', err);
        res.send('error');
      });
    })
    .catch(function(err) {
      console.error('mergeAndResize error', err);
      res.send('error');
    });
  } else {
    res.send('invalid data');
  }
});

module.exports = router;
