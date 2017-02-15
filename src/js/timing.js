const overlays = require('./overlays');

export function init() {
  setPlayPrompt();
}

function setPlayPrompt() {
  const playDelay = 40 * 1000; // ms
  return setTimeout(() => {
    overlays.openOverlayPlay();
  }, playDelay);
}
