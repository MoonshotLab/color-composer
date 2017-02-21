const config = require('./../../config');

const main = require('./main');
const overlays = require('./overlays');
const timing = require('./timing');
const ui = require('./ui');

const $body = $('body');
const tapEvent = 'click tap touch';

export const videoPlayingClass = 'video-playing';

const $videoWrapper = $body.find('#video-wrap');
const $video = $videoWrapper.find('video');

export function enterTutorialMode() {
  console.log('entering tutorial mode');
  playVideo();
  $body.addClass(videoPlayingClass);
  clearTimeout(window.kan.inactivityTimeout);
  $body.off(tapEvent, timing.preventInactivityTimeout);
  $body.on(tapEvent, exitTutorialMode);
  main.resetWindow();
  ui.resetCanvas();
  window.kan.refreshCheckInterval = setInterval(() => {
    $.get('/hash')
      .done(function(res) {
        if (res !== window.kan.hash) {
          console.log('different hash, restarting');
          setTimeout(() => {
            // wait 5 seconds then reload
            location.reload();
          }, 5 * 1000);
        } else {
          console.log('same hash');
        }
      })
      .fail(function(e) {
        console.error('error getting hash:', e);
      });
  }, timing.refreshCheckDelay);
}

export function exitTutorialMode() {
  console.log('exiting tutorial mode');
  clearInterval(window.kan.refreshCheckInterval);

  pauseVideo();
  $body.off(tapEvent, exitTutorialMode);
  $body.on(tapEvent, timing.preventInactivityTimeout);
  $body.removeClass(videoPlayingClass);
  clearTimeout(window.kan.inactivityTimeout);

  overlays.openOverlay('intro');

  window.kan.inactivityTimeout = setTimeout(() => {
    overlays.openOverlay('continue');
  }, timing.continueInactivityDelay);
}

export function pauseVideo() {
  $video.get(0).pause();
}

export function playVideo() {
  $video.get(0).play();
}
