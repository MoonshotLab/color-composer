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
  $body.addClass(videoPlayingClass);
  clearTimeout(window.kan.inactivityTimeout);
  $body.off(tapEvent, timing.preventInactivityTimeout);
  $body.on(tapEvent, exitTutorialMode);
  main.resetWindow();
  ui.resetCanvas();
}

export function exitTutorialMode() {
  console.log('exiting tutorial mode');

  $body.off(tapEvent, exitTutorialMode);
  $body.on(tapEvent, timing.preventInactivityTimeout);
  $body.removeClass(videoPlayingClass);
  clearTimeout(window.kan.inactivityTimeout);

  overlays.openOverlay('intro');

  window.kan.inactivityTimeout = setTimeout(() => {
    overlays.openOverlay('continue');
  }, timing.continueInactivityDelay);
}
