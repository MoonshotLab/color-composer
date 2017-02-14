const config = require('./../../config');

const touch = require('./touch');
const hammerManager = touch.hammerManager;

const $body = $('body');
const tapEvent = 'click tap touch';

function playVideo() {
  $body.addClass('play-video');
}

export function init() {
  if ( window.location.hash.length > 0 && window.location.hash == '#video' ) {
    playVideo();
  }
}
