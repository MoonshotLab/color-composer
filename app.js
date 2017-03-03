const fs = require('fs');
if (fs.existsSync('.env')) {
  require('dotenv').config();
}

const express = require('express');
const app = express();

const path = require('path');
const git = require('git-rev');

const config = require('./config');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));

const port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('Server running on port ' + port);
});

app.get('/', function (req, res) {
  res.render('index', {
    config: config,
    range: require('array-range')
  });
});

app.get('/hash', function(req, res) {
  if (!!process.env.GIT_REV) {
    res.send(process.env.GIT_REV);
  } else {
    git.long(function(str) {
      res.send(str);
    });
  }
});

// ffmpeg -i ~/Downloads/blob.webm -i ~/Downloads/blob.wav -c:v mpeg4 -b:v 6400k -b:a 4800k -strict experimental /tmp/output.mp4
app.get('/process', function(req, res) {
  const cp = require('child-process-promise');
  const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

  const cwd = process.cwd();
  const mergedOutPath = `${cwd}/public/test/merged.mp4`;
  const mergedTsOutPath = `${cwd}/public/test/merged.ts`;
  const bumperTsPath = `${cwd}/public/test/bumper.ts`;
  const finalPath = `${cwd}/public/test/final.mp4`;

  const mergeAndResizeCommand = [
    ffmpegPath,
    `-i ${cwd}/public/test/output.mp4`,
    `-i ${cwd}/public/test/blob.wav`,
    '-c:v libx264',
    '-b:v 6400k',
    '-b:a 4800k',
    '-aspect 2:1',
    // '-vf scale=w=1980:h=990:force_original_aspect_ratio=decrease',
    // '-vf scale=1980x990,pad=1980:990:0:60:black',
    // '-vf pad=width=640:height=480:x=0:y=0:color=black',
    // `-vf scale="'if(gt(a,2/1),1980,-1)':'if(gt(a,2/1),-1,990)'"`,
    // '-vf "scale=1980:990"',
    // '-vf "scale=iw*min(1980/iw\,990/ih):ih*min(1980/iw\,990/ih),pad=1980:990:(1980-iw)/2:(990-ih)/2"',
    `-vf 'scale=1980:990:force_original_aspect_ratio=decrease,pad=1980:990:x=(1980-iw)/2:y=(990-ih)/2:color=black'`,
    '-strict experimental',
    mergedOutPath,
    '-y'
  ].join(' ');

  // https://trac.ffmpeg.org/wiki/Concatenate
  const makeIntoTransportStreamCommand = [
    ffmpegPath,
    `-i ${mergedOutPath}`,
    '-c copy',
    '-bsf:v h264_mp4toannexb',
    '-f mpegts',
    mergedTsOutPath,
    '-y'
  ].join(' ');

  const concatWithBumperCommand = [
    ffmpegPath,
    `-i "concat:${mergedTsOutPath}|${bumperTsPath}"`,
    '-c copy',
    '-bsf:a aac_adtstoasc',
    finalPath,
    '-y'
  ].join(' ');

  res.render('process');
  return;
  // console.log(mergeAndResizeCommand);
  cp.exec(mergeAndResizeCommand).then(function() {
    // slap on bumper
    // console.log('mergeAndResize done');
    // console.log(makeIntoTransportStreamCommand);
    cp.exec(makeIntoTransportStreamCommand).then(function() {
      // console.log('makeIntoTransportStream done');
      // console.log(concatWithBumperCommand);
      cp.exec(concatWithBumperCommand).then(function() {
        console.log('concatWithBumper done!!!');
      })
      .catch(function(err) {
        console.log('concatWithBumper err')
      })
    })
    .catch(function(err) {
      console.log('makeIntoTransportStream error');
    });
  })
  .catch(function(err) {
    console.error('mergeAndResize error', err);
  });
});
