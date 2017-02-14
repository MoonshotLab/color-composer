const config = require('./../../config');

const touch = require('./touch');
const hammerManager = touch.hammerManager;

const $body = $('body');
const tapEvent = 'click tap touch';

function playVideo() {
  console.log('asdf');
}

export function init() {
  playVideo();
}
