const config = require('./config');

const main = require('./main');
const overlays = require('./overlays');
const timing = require('./timing');
const ui = require('./ui');
const sound = require('./sound');

const $body = $('body');
const tapEvent = 'click tap touch';

export const videoPlayingClass = 'video-playing';

const $videoWrapper = $body.find('#video-wrap');
const $video = $videoWrapper.find('video');

export function enterTutorialMode() {
  try {
    ga('send', {
      hitType: 'pageView',
      page: 'tutorial',
      title: 'Color Composer'
    });
  } catch(e) {
    console.error(e);
  }
  console.log('entering tutorial mode');
  playVideo();
  $body.addClass(videoPlayingClass);
  clearTimeout(window.kan.inactivityTimeout);
  clearInterval(window.kan.continueCountdownInterval);
  $body.off(tapEvent, timing.preventInactivityTimeout);
  $body.on(tapEvent, exitTutorialMode);
  main.resetWindow();
  ui.resetCanvas();
  window.kan.refreshCheckInterval = setInterval(function() {
    $.get('/hash')
      .done(function(res) {
        if (res !== window.kan.hash) {
          console.log('different hash, reloading');
          location.reload();
        }
      })
      .fail(function(e) {
        console.error('error getting hash:', e);
      });
  }, timing.refreshCheckDelay);
}

export function exitTutorialMode() {
  try {
    ga('send', {
      hitType: 'pageView',
      page: 'draw',
      title: 'Color Composer'
    });
  } catch(e) {
    console.error(e);
  }
  console.log('exiting tutorial mode');
  sound.reinitShapeSounds()
    .then(function() {
      clearInterval(window.kan.refreshCheckInterval);
      Howler.mute(false);
      pauseVideo();
      $body.off(tapEvent, exitTutorialMode);
      $body.on(tapEvent, timing.preventInactivityTimeout);
      $body.removeClass(videoPlayingClass);
      clearTimeout(window.kan.inactivityTimeout);
      clearInterval(window.kan.continueCountdownInterval);

      ui.verifyBrowserWidth();

      if ($body.hasClass('window-too-small-active') !== true && window.kan.location !== 'desktop') {
        overlays.openOverlay('intro');

        window.kan.inactivityTimeout = setTimeout(function() {
          overlays.openOverlay('continue');
        }, timing.continueInactivityDelay);
      }

    })
  .fail(function(e) {
    console.error('error initting shape sounds:', e);
    location.reload();
  });
}

export function pauseVideo() {
  $video.get(0).pause();
}

export function playVideo() {
  $video.get(0).play();
}
