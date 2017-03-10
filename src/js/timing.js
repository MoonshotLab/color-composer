const overlays = require('./overlays');
const video = require('./video');
const util = require('./util');

const $body = $('body');

export const drawInactivityDelay = 40 * 1000; // ms
export const continueInactivityDelay = 30 * 1000; // ms
export const playPromptDelay = 60 * 1000; // ms;
export const inputDelay = 100; // ms
export const refreshCheckDelay = 60 * 1000; // ms
export const overlayDelay = 1000; // ms

export function init() {
  console.log('firing');
  if (window.location.hash.length > 0 && window.location.hash == '#dev') {
    window.kan.overlays = false;
    video.pauseVideo();
    video.exitTutorialMode();
  } else {
    let location;
    if (window.location.hash.length > 0 && window.location.hash == '#gallery') {
      location = 'gallery';
    } else {
      location = 'home';
    }
    ga('set', 'dimension1', location);
    video.enterTutorialMode();
  }
}

export function preventInactivityTimeout() {
  console.log(`prevent timeout: ${util.getTime()}`);

  clearTimeout(window.kan.inactivityTimeout);
  clearInterval(window.kan.continueCountdownInterval);

  window.kan.inactivityTimeout = setTimeout(function() {
    overlays.openOverlay('continue');
  }, drawInactivityDelay);
}
