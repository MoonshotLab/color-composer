const throttle = require('throttleit');

require('airbnb-js-shims');

const touch = require('./touch');
const ui = require('./ui');
const overlays = require('./overlays');
const video = require('./video');
const timing = require('./timing');
const util = require('./util');
const sound = require('./sound');
const shape = require('./shape');
const socket = require('./socket');

export function resetWindow() {
  let clientId = null;
  if (!!window.kan && !!window.kan.uuid && window.kan.uuid !== null) {
    clientId = window.kan.uuid; // preserve if already set
  }

  window.kan = {
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
    },
    inactivityTimeout: null,
    playPromptTimeout: null,
    sharePromptTimeout: null,
    userHasDrawnFirstShape: false,
    firstTimePlaying: true,
    shapesSinceTut: 0,
    refreshCheckInterval: null,
    sha: null,
    scheduledOverlay: null,
    continueCountdownInterval: null,
    shapeSounds: null,
    location: $('body').hasClass('gallery') ? 'gallery' : 'desktop',
    resizeCanvasTimeout: null,
    stopTimeouts: false,
    uuid: clientId,
    ie: false,
    safari: false,
    edge: false
  };
}

$(window).on('load', function() {
  function run() {
    resetWindow();
    util.setSha();
    util.setUuid();
    socket.init();
    ui.init();
    overlays.init();
    timing.init();
    shape.init();
    sound.init()
      .then(function() {
        // sound.init() is async because it loads in the sound files
        touch.init();
      })
      .fail(function(e) {
        console.error('error initting shape sounds:', e);
        location.reload();
      })
  }

  try {
    run();
  } catch(e) {
    console.error(e);
    // setTimeout(function() {
    //   // wait 5 seconds then reload
    //   location.reload();
    // }, 5 * 1000);
  }
});

window.onresize = throttle(function() {
  clearTimeout(window.kan.resizeCanvasTimeout);

  ui.verifyBrowserWidth();
  window.kan.resizeCanvasTimeout = setTimeout(function() {
    ui.fixCanvasSize();
    ui.fixTutorialVideoSize();
  }, timing.browserWidthCheckDelay * 2);
}, timing.browserWidthCheckDelay);
