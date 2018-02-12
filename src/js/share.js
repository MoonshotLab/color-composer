const config = require('./config');

const Promise = require('bluebird');
const axios = require('axios');
const qs = require('qs');

const ui = require('./ui');
const timing = require('./timing');
const overlays = require('./overlays');
const sound = require('./sound');
const video = require('./video');
const util = require('./util');

const socket = require('./socket').socket;

const drawCanvas = document.getElementById(config.canvasId);

function asyncStopAudioRecordingAndExportBlob(recorder) {
  return new Promise(function(resolve, reject) {
    try {
      recorder.stop();
      recorder.exportWAV(function(blob) {
        resolve(blob);
      });
    } catch (e) {
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
    } catch (e) {
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

      sound
        .asyncPlayCompositionOnce()
        .then(function() {
          return Promise.all([
            asyncStopAudioRecordingAndExportBlob(audioRecorder),
            asyncStopVideoRecordingAndExportBlob(canvasRecorder)
          ])
            .then(function(values) {
              let [audioBlob, videoBlob] = values;
              // console.log('audioBlob', audioBlob);
              // console.log('videoBlob', videoBlob);

              // console.log('sending files');

              const formData = new FormData();
              formData.append('audio', audioBlob);
              formData.append('video', videoBlob);
              formData.append('uuid', window.kan.uuid);

              axios
                .post('/process', formData)
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
        })
        .error(function(e) {
          return Promise.all([
            asyncStopAudioRecordingAndExportBlob(audioRecorder),
            asyncStopVideoRecordingAndExportBlob(canvasRecorder)
          ])
            .then(function(values) {
              // console.log(values)
            })
            .catch(function(e) {
              // console.error(e);
            })
            .finally(function() {
              reject(e);
            });
        });
    } catch (e) {
      reject(e);
    }
  });
}

export function asyncAddCompositionToDb(data) {
  return new Promise(function(resolve, reject) {
    try {
      const s3Id = data.s3Id;
      const phone = data.phone;
      const queryString = qs.stringify({
        s3Id: s3Id,
        phone: phone,
        postKey: config.postKey,
        location: 'gallery'
      });

      return axios
        .post('/composition/new?' + queryString)
        .then(function() {
          resolve('composition successfully posted');
        })
        .catch(function(e) {
          reject(e);
        });
    } catch (e) {
      reject(e);
    }
  });
}

function asyncAddDesktopCompositionToDb(s3Id) {
  return new Promise(function(resolve, reject) {
    try {
      const queryString = qs.stringify({
        s3Id: s3Id,
        postKey: config.postKey,
        location: 'desktop'
      });

      return axios
        .post('/composition/new?' + queryString)
        .then(function() {
          resolve('composition successfully posted');
        })
        .catch(function(e) {
          reject(e);
        });
    } catch (e) {
      reject(e);
    }
  });
}

function asyncWaitForDesktopCompositionToFinishProcessing() {
  return new Promise(function(resolve, reject) {
    try {
      socket.on('new_msg', function(data) {
        console.log('data!', data);
        resolve(data.msg);
      });

      setTimeout(function() {
        reject();
      }, 5 * 60 * 1000); // reject after 5 minutes
    } catch (e) {
      reject(e);
    }
  });
}

export function handleSharePressed() {
  clearTimeout(window.kan.sharePromptTimeout);
  clearTimeout(window.kan.playPromptTimeout);

  if (util.anyShapesOnCanvas() !== true) {
    // console.log('nope');
    return;
  }

  try {
    ga('send', 'event', 'share', 'modalFired');
  } catch (e) {
    console.error(e);
  }

  if (window.kan.location === 'gallery') {
    handleGallerySharePressed();
  } else {
    handleDesktopSharePressed();
  }
}

function handleGallerySharePressed() {
  overlays.openOverlay('share-prepare');
  // clearInterval(window.kan.inactivityTimeout);
  ui.enterShareMode();
  overlays
    .asyncCloseOverlaysAfterDuration(1000 * 1)
    .then(function() {
      return asyncRecord();
    })
    .then(function(s3Id) {
      // console.log('recording done');
      ui.exitShareMode();
      overlays.openOverlay('share');
      return overlays.asyncWaitForWellFormedPhoneNumber(s3Id);
    })
    .then(function(resp) {
      // console.log('received well formed phone number');
      return asyncAddCompositionToDb(resp);
    })
    .then(function() {
      // close overlay
      overlays.openOverlay('share-confirmation');
      try {
        ga('send', 'event', 'share', 'mobileLinkSent');
      } catch (e) {
        console.error(e);
      }
      setTimeout(function() {
        video.enterTutorialMode();
      }, 1000 * 4);
      // console.log('close overlay, done!');
    })
    .catch(function(e) {
      ui.exitShareMode(); // make sure
      if (e === 'timeout') {
        console.log('error in share mode, going into tutorial');
        video.enterTutorialMode();
      } else {
        // continue, share modal did not time out, reject silently
        console.log('error in share mode,', e);
      }
    });
}

function handleDesktopSharePressed() {
  if (
    window.kan.ie === true ||
    window.kan.safari === true ||
    window.kan.edge === true
  ) {
    overlays.openOverlay('share-bad-browser');
  } else {
    ui.showDesktopSharePrepNotice();
    ui.enterShareMode();
    timing.clearTimeouts();
    window.kan.overlays = false; // make sure no overlays pop up
    let s3Id = null;

    asyncRecord()
      .then(function(id) {
        s3Id = id;
        return asyncAddDesktopCompositionToDb(s3Id);
        // console.log('recording done');
      })
      .then(function() {
        return asyncWaitForDesktopCompositionToFinishProcessing();
      })
      .then(function() {
        try {
          ga('send', 'event', 'share', 'desktopCompositionRedirect');
        } catch (e) {
          console.error(e);
        }

        // redirect to composition
        window.location.href = `https://color-composer.net/composition/${s3Id}`;
      })
      .catch(function(e) {
        ui.exitShareMode(); // make sure
        window.kan.overlays = true;
        if (e === 'timeout') {
          console.log('error in share mode, going into tutorial');
          video.enterTutorialMode();
        } else {
          // continue, share modal did not time out, reject silently
          console.log('error in share mode,', e);
        }
      });
  }
}
