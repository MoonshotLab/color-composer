const config = require('./../../config');

const ui = require('./ui');
const sound = require('./sound');

const drawCanvas = document.getElementById(config.canvasId);
const canvasRecorder = RecordRTC(drawCanvas, {
  type: 'canvas'
});

export function record() {
  let audioRecorder = new Recorder(Howler.masterGain, {
    workerPath: '/js/lib/recorderWorker.js'
  });

  canvasRecorder.startRecording();
  audioRecorder.record();

  sound.asyncPlayCompositionOnce().then(() => {
    audioRecorder.stop();
    audioRecorder.exportWAV(function(blob) {
      download(blob, 'blob.wav');
    });
    canvasRecorder.stopRecording(function() {
      var blob = canvasRecorder.getBlob();
      download(blob, 'blob.webm');
    });
  }).error((e) => {
    audioRecorder.stop();
    audioRecorder.exportWAV(function(blob) {
      download(blob, 'blob.wav');
    });
    canvasRecorder.stopRecording(function() {
      var blob = canvasRecorder.getBlob();
      download(blob, 'blob.webm');
    });
  });
}
