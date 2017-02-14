const touch = require('./touch');
const ui = require('./ui');
const overlays = require('./overlays');
const video = require('./video');

window.kan = {
  currentColor: '#20171C',
  composition: [],
  compositionInterval: null,
  lastEvent: null,
  moves: [],
  playing: false,
  pinching: false,
  pinchedGroup: null,
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
};

$(document).ready(function() {
  function run() {
    ui.init();
    touch.init();
    overlays.init();
    // video.init();
  }

  run();
});
