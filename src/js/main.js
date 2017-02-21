const touch = require('./touch');
const ui = require('./ui');
const overlays = require('./overlays');
const video = require('./video');
const timing = require('./timing');
const util = require('./util');

export function resetWindow() {
  window.kan = {
    currentColor: '#2B5E2E',
    composition: [],
    compositionInterval: null,
    compositionTimeout: null,
    soundTimeouts: [],
    lastEvent: null,
    interaction: false,
    moves: [],
    playing: false,
    pinching: false,
    pinchedGroup: null,
    pinchedTut: null,
    pathData: {},
    shapePath: null,
    prevAngle: null,
    sides: [],
    side: [],
    corners: [],
    lastScale: 1,
    lastRotation: 0,
    originalPosition: null,
    tutorialCompletion: {
      "fill": false,
      "pinch": false,
      "swipe": false
    },
    inactivityTimeout: null,
    playPromptTimeout: null,
    userHasDrawnFirstShape: false,
    firstTimePlaying: true,
    shapesSinceTut: 0,
    refreshCheckInterval: null,
    sha: null,
    scheduledOverlay: null,
  };
}

$(document).ready(function() {
  function run() {
    resetWindow();
    util.setSha();
    ui.init();
    touch.init();
    overlays.init();
    timing.init();
  }

  try {
    run();
  } catch(e) {
    console.error(e);
    setTimeout(() => {
      // wait 5 seconds then reload
      location.reload();
    }, 5 * 1000);
  }
});
