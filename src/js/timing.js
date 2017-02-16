const overlays = require('./overlays');
const video = require('./video');

const $body = $('body');

export const drawInactivityDelay = 40 * 1000; // ms
export const continueInactivityDelay = 30 * 1000; // ms
export const playPromptDelay = 6 * 1000; // ms;

export function init() {
  if ( window.location.hash.length > 0 && window.location.hash == '#video' ) {
    video.enterTutorialMode();
  } else {
    video.exitTutorialMode();
  }
}

export function preventInactivityTimeout() {
  console.log('prevent timeout');

  clearTimeout(window.kan.inactivityTimeout);

  window.kan.inactivityTimeout = setTimeout(() => {
    overlays.openContinueModal();
  }, drawInactivityDelay);
}
