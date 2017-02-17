const overlays = require('./overlays');
const video = require('./video');
const util = require('./util');

const $body = $('body');

export const drawInactivityDelay = 40 * 1000; // ms
export const continueInactivityDelay = 30 * 1000; // ms
export const playPromptDelay = 60 * 1000; // ms;

export function init() {
  if (window.location.hash.length > 0 && window.location.hash == '#dev') {
    window.kan.overlays = false;
    video.pauseVideo();
    video.exitTutorialMode();
  } else if (window.location.hash.length > 0 && window.location.hash == '#video') {
    video.enterTutorialMode();
  } else {
    video.exitTutorialMode();
  }
}

export function preventInactivityTimeout() {
  console.log(`prevent timeout: ${util.getTime()}`);

  clearTimeout(window.kan.inactivityTimeout);

  window.kan.inactivityTimeout = setTimeout(() => {
    overlays.openOverlay('continue');
  }, drawInactivityDelay);
}
