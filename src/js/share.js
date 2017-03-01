const config = require('./../../config');

const RecordRTC = require('recordrtc');

const ui = require('./ui');
const sound = require('./sound');

const canvas = document.getElementById(config.canvasId);
const canvasRecorder = RecordRTC(canvas, {
  type: 'canvas',
});

export function record() {
  startRecording();

  const now = new Date().getTime();

  sound.asyncPlayCompositionOnce().then(() => {
    stopRecording();
    // return sound.asyncPlayCompositionOnce().then(() => {
    //   stopRecording();
    // });
  }).error((e) => {
    stopRecording();
  });
}

function startRecording() {
  console.log('start recording');
  navigator.getUserMedia({ audio: true }, function(stream) {

    // recordAudio.startRecording();

  }, function(error) { console.log( JSON.stringify ( error ) ); });
  // canvasRecorder.startRecording();
}

function stopRecording() {
  console.log('stop recording');
  // canvasRecorder.stopRecording(function() {
  //   console.log('stopping recording');
  //   const blob = canvasRecorder.getBlob();
  //   download(blob, 'blob.webm');
  // });
}
