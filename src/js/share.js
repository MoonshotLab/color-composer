const config = require('./client-config');

const Promise = require('bluebird');
const axios = require('axios');

const ui = require('./ui');
const sound = require('./sound');

const drawCanvas = document.getElementById(config.canvasId);

function asyncStopAudioRecordingAndExportBlob(recorder) {
  return new Promise(function(resolve, reject) {
    try {
      recorder.stop();
      recorder.exportWAV(function(blob) {
        resolve(blob);
      });
    } catch(e) {
      reject(e);
    }
  });
}

function asyncStopVideoRecordingAndExportBlob(recorder) {
  return new Promise(function(resolve, reject) {
    try {
      recorder.stopRecording(function() {
        let blob = recorder.getBlob();
        resolve(blob);
      });
    } catch(e) {
      reject(e);
    }
  });
}

export function asyncRecord() {
  return new Promise(function(resolve, reject) {
    try {
      const audioRecorder = new Recorder(Howler.masterGain, {
        workerPath: '/js/lib/recorderWorker.js'
      });
      const canvasRecorder = RecordRTC(drawCanvas, {
        type: 'canvas'
      });

      Howler.mute(false);
      canvasRecorder.startRecording();
      audioRecorder.record();

      sound.asyncPlayCompositionOnce().then(() => {
        return Promise.all([asyncStopAudioRecordingAndExportBlob(audioRecorder), asyncStopVideoRecordingAndExportBlob(canvasRecorder)])
          .then(function(values) {
            let [audioBlob, videoBlob] = values;
            console.log('audioBlob', audioBlob);
            console.log('videoBlob', videoBlob);

            console.log('sending files');

            const formData = new FormData();
            formData.append('audio', audioBlob);
            formData.append('video', videoBlob);

            axios.post('/process', formData)
              .then(function(resp) {
                const s3Id = resp.data;
                // fire share modal
                resolve(s3Id);
                // window.location.href = `/process?id=${videoId}`;
              })
              .catch(function(e) {
                // there was an error uploading!
                console.error(e);
                reject(e);
              });
          })
          .catch(function(e) {
            console.error(e);
            reject(e);
          });
      }).error((e) => {
        return Promise.all([asyncStopAudioRecordingAndExportBlob(audioRecorder), asyncStopVideoRecordingAndExportBlob(canvasRecorder)])
          .then(function(values) {
            console.log(values)
          })
          .catch(function(e) {
            console.error(e);
          })
          .finally(function() {
            reject(e);
          })
      });
    } catch(e) {
      reject(e);
    }
  })
}
