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
  const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
  const ffmpeg = require('fluent-ffmpeg');
  ffmpeg.setFfmpegPath(ffmpegPath);
  let command = ffmpeg()
    .input('public/test/blob.webm')
    .input('public/test/blob.wav')
    // .videoCodec('mpeg4')
    .videoCodec('libx264')
    .videoBitrate('6400k')
    .audioBitrate('4800k')
    .on('end', function() {
      console.log('Done processing');
    });
    // .addOption('-strict', 'experimental')
    // .outputOptions('-strict -2')
    // .size('640x480')
    // .format('mp4');
  command.save('public/test/output.mp4');

  res.render('process');
})
