const config = require('./../../config');

const RecordRTC = require('recordrtc');

const ui = require('./ui');
const sound = require('./sound');

const drawCanvas = document.getElementById(config.canvasId);
const canvasRecorder = RecordRTC(drawCanvas, {
  type: 'canvas',
});

export function record() {
  let rec = new Recorder(Howler.masterGain, {
    workerPath: '/js/lib/recorderWorker.js'
  });

  canvasRecorder.startRecording();
  rec.record();

  sound.asyncPlayCompositionOnce().then(() => {
    rec.stop();
    rec.exportWAV(function(blob) {
      download(blob, 'blob.wav');
    });
    canvasRecorder.stopRecording(function() {
      var blob = canvasRecorder.getBlob();
      download(blob, 'blob.webm');
    });
  }).error((e) => {
    rec.stop();
    rec.exportWAV(function(blob) {
      download(blob, 'blob.wav');
    });
    canvasRecorder.stopRecording(function() {
      var blob = canvasRecorder.getBlob();
      download(blob, 'blob.webm');
    });
  });
}
