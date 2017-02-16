const config = require('./../../config');

const overlays = require('./overlays');
const timing = require('./timing');

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
}

export function exitTutorialMode() {
  console.log('exiting tutorial mode');

  $body.off(tapEvent, exitTutorialMode);
  $body.on(tapEvent, timing.preventInactivityTimeout);
  $body.removeClass(videoPlayingClass);
  clearTimeout(window.kan.inactivityTimeout);

  $body.addClass('overlay-active intro-active');

  window.kan.inactivityTimeout = setTimeout(() => {
    overlays.openContinueModal();
  }, timing.continueInactivityDelay);
}
