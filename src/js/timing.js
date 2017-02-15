const overlays = require('./overlays');
const video = require('./video');

const $body = $('body');

export function init() {
  setPlayPrompt();
}

function setPlayPrompt() {
  const playDelay = 40 * 1000; // ms
  return setTimeout(() => {
    overlays.openOverlayPlay();
  }, playDelay);
}

// export function preventVideoTimeout() {
//   if (window.kan.inactivityTimeout !== null) {
//     clearTimeout(window.kan.inactivityTimeout);
//   }

//   window.kan.inactivityTimeout = setTimeout(() => {
//     $body.addClass(videoPlayingClass)
//   }, )
// }

export function preventInactivityTimeout() {
  const inactivityThreshold = 30 * 1000; // ms

  if (window.kan.inactivityTimeout !== null) {
    clearTimeout(window.kan.inactivityTimeout);
  }

  window.kan.inactivityTimeout = setTimeout(() => {
    console.log('')
  }, inactivityThreshold);
}
