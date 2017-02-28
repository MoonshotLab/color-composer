const config = require('./../../config');

const RecordRTC = require('recordrtc');

const ui = require('./ui');
const sound = require('./sound');

const canvas = document.getElementById(config.canvasId);
const recorder = RecordRTC(canvas, {
  type: 'canvas',
});

export function record() {
  console.log('starting recording');
  sound.playComposition();
  // recorder.startRecording();
  // setTimeout(stopRecording, 5000);
}

function stopRecording() {
  recorder.stopRecording(function() {
    console.log('stopping recording');
    const blob = recorder.getBlob();
    download(blob, 'blob.webm');
  });
}
