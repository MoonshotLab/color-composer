const touch = require('./touch');
const ui = require('./ui');
const overlays = require('./overlays');
const video = require('./video');
const timing = require('./timing');

export function resetWindow() {
  window.kan = {
    currentColor: '#2B5E2E',
    composition: [],
    compositionInterval: null,
    compositionTimeout: null,
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
    shapesSinceTut: 0
  };
}

$(document).ready(function() {
  function run() {
    resetWindow();
    ui.init();
    touch.init();
    overlays.init();
    timing.init();
  }

  run();
});
