const config = require('./config');

const validator = require('validator');

const touch = require('./touch');
const video = require('./video');
const timing = require('./timing');
const tutorial = require('./tutorial');
const util = require('./util');
const ui = require('./ui');

const hammerCanvas = touch.hammerCanvas;

const $body = $('body');
const tapEvent = 'click tap touch';

const $cardsWrap = $body.find('.overlay.tips .card-wrap');
const $cardItems = $cardsWrap.find('article');
const cardsCount = $cardItems.length;
const $footer = $body.find('.overlay.tips .footer');

const $sharePhone = $body.find('#phone');
const $shareKeypad = $body.find('.keypad');
const $shareSend = $shareKeypad.find('.send');
const $sharePhoneWrap = $('.share-phone .output');
const invalidPhoneNumberClass = 'invalid-number';

const allOverlays = ['intro', 'play-prompt', 'share-prompt', 'continue', 'tips', 'share', 'share-prepare', 'share-confirmation', 'window-too-small'];
const overlayOpenClasses = allOverlays.map((overlay) => `${overlay}-active`).join(' ');

const overlayActiveClass = 'overlay-active';

export function openOverlay(overlayName) {
  console.log('attempting to open overlay', overlayName);
  if (window.kan.overlays === false) return;
  if ($body.hasClass('window-too-small-active')) return; // don't open overlays if the window is too small
  if (allOverlays.includes(overlayName)) {
    if (window.kan.pinching === true || window.kan.panning === true) {
      if (overlayName === 'continue') {
        timing.preventInactivityTimeout();
      } else {
        // console.log('scheduling overlay', overlayName);
        window.kan.scheduledOverlay = overlayName;
      }
      return;
    }
    closeAndResetOverlays();
    tutorial.hideContextualTuts();
    $body.addClass(overlayActiveClass);
    $body.find('.overlay.closeable:not(.tips):not(.share-phone)').on(tapEvent, function() {
      closeAndResetOverlays();
    });

    switch (overlayName) {
      case 'intro':
        openIntroOverlay();
        break;
      case 'play-prompt':
        if (util.anyShapesOnCanvas()) {
          openPlayPromptOverlay();
        } else {
          window.kan.playPromptTimeout = setTimeout(function() {
            openOverlay('play-prompt');
          }, timing.playPromptDelay / 2);
        }
        break;
      case 'share-prompt':
        openSharePromptOverlay();
        break;
      case 'continue':
        openContinueOverlay();
        break;
      case 'tips':
        openTipsOverlay();
        break;
      case 'share':
        openShareOverlay();
        break;
      case 'share-prepare':
        openSharePrepareOverlay();
        break;
      case 'share-confirmation':
        openShareConfirmationOverlay();
        break;
      case 'window-too-small':
        openWindowTooSmallOverlay();
        break;
    }
  } else {
    // console.log('unable to open unknown overlay', overlayName);
  }
}

function openIntroOverlay() {
  $body.addClass('intro-active');
}

function openPlayPromptOverlay() {
  $body.addClass('play-prompt-active');
}

function openSharePromptOverlay() {
  $body.addClass('share-prompt-active');
}

export function resetContinueCountdown() {
  $('.overlay.continue .countdown-num').html(parseInt(timing.continueInactivityDelay / 1000));
  clearInterval(window.kan.continueCountdownInterval);
}

function openContinueOverlay() {
  $body.addClass('continue-active');

  resetContinueCountdown();
  clearTimeout(window.kan.inactivityTimeout);
  clearTimeout(window.kan.playPromptTimeout);

  window.kan.continueCountdownInterval = setInterval(function() {
    let $countdownNumWrap = $('.overlay.continue .countdown-num');
    let count = parseInt($countdownNumWrap.html());
    if (count > 1) {
      $countdownNumWrap.html(count - 1);
    }
  }, 1000);

  window.kan.inactivityTimeout = setTimeout(function() {
    video.enterTutorialMode();
    ui.selectRandomColorFromPalette();
  }, timing.continueInactivityDelay);
}

function openTipsOverlay() {
  $body.addClass('tips-active');
  activateTipsCards();
}

function openShareOverlay() {
  $body.addClass('share-active');
}

function openSharePrepareOverlay() {
  $body.addClass('share-prepare-active');
}

function openShareConfirmationOverlay() {
  $body.addClass('share-confirmation-active');
}

function openWindowTooSmallOverlay() {
  $body.addClass('window-too-small-active');
}

// card slider navigation
export function cardNavNext() {
  let $old = $body.find('.card-wrap .current');
  let $new = ($old.next().length) ? $old.next() : $cardItems.first();
  let $next = ($new.next().length) ? $new.next() : $cardItems.first();
  let $third = ($next.next().length) ? $next.next() : $cardItems.first().next();
  let slide = $new.index();
  $old.removeClass().addClass('remove');
  $new.removeClass().addClass('current');
  $next.removeClass().addClass('next');
  $third.removeClass().addClass('third');
  updateCardCounter(slide + 1, cardsCount);
  setTimeout(function() {
    $old.removeClass();
  }, 600);
}

// tips card interactions
function cardInteractions() {
  let timeOfLastInteraction = 0;

  $body.find('.overlay.closeable').on(tapEvent, function(e) {
    const currentTime = Date.now();
    if (timeOfLastInteraction > (currentTime - 250)) {
      return;
    }
    timeOfLastInteraction = currentTime;

    if ( $(e.target).closest('.card-wrap').length == 1 ) {
      // directly on a card, navigate to the next one
      // console.log('hi');
      cardNavNext();
    } else {
      // console.log('no');
      // outside elements, close everything and reset
      closeAndResetOverlays();
    }
  });
}

function resetTips() {
  $cardItems.removeClass();
  $sharePhone.html('');
}

// close and reset tips
export function closeAndResetOverlays() {
  $body.removeClass('overlay-active');
  $body.removeClass(overlayOpenClasses);
  $sharePhoneWrap.removeClass(invalidPhoneNumberClass);
  resetTips();
}

export function asyncCloseOverlaysAfterDuration(duration) {
  return new Promise(function(resolve, reject) {
    let closeOverlayTimeout = null;
    try {
      closeOverlayTimeout = setTimeout(function() {
        closeAndResetOverlays();
        resolve('asyncCloseOverlaysAfterDuration done');
      }, duration);
    } catch(e) {
      clearTimeout(closeOverlayTimeout);
      reject(e);
    }
  })
}

// deal a fresh stack of cards
function activateTipsCards() {
  let $new = $cardItems.first();
  let $next = ($new.next().length) ? $new.next() : $cardItems.first();
  let $third = ($next.next().length) ? $next.next() : $cardItems.first().next();
  $cardItems.removeClass();
  $new.removeClass().addClass('current');
  $next.removeClass().addClass('next');
  $third.removeClass().addClass('third');
  updateCardCounter(1, cardsCount);
}

// counting cards
function updateCardCounter(current, total) {
  $footer.find('.current').html(current);
  $footer.find('.next').html(total);
}

export function asyncWaitForWellFormedPhoneNumber(s3Id) {
  return new Promise(function(resolve, reject) {
    // normal inactivity timeout is disabled, start an alternate one
    let inactivityTimeout = setTimeout(function() {
      if ($body.hasClass('share-active')) {
        reject('timeout');
      } else {
        reject('share-closed');
      }
    }, timing.continueInactivityDelay);

    $shareKeypad.on(tapEvent, function(e) {
      clearTimeout(inactivityTimeout);
      inactivityTimeout = setTimeout(function() {
        if ($body.hasClass('share-active')) {
          reject('timeout');
        } else {
          reject('share-closed');
        }
      }, timing.continueInactivityDelay);
    });

    $shareSend.on(tapEvent, function(e) {
      const phoneNumWithHyphens = $sharePhone.text();
      let phoneNumRaw = phoneNumWithHyphens.replace(/\D/g,'');

      if (validator.isMobilePhone(phoneNumRaw, 'en-US')) {
        $sharePhoneWrap.removeClass(invalidPhoneNumberClass);
        if(phoneNumRaw.length == 10) phoneNumRaw = '1' + phoneNumRaw;
        clearTimeout(inactivityTimeout);
        resolve({
          phone: phoneNumRaw,
          s3Id: s3Id
        });
      } else {
        $sharePhoneWrap.addClass(invalidPhoneNumberClass);
      }
    });
  })
}

// phone inputs
function phoneNumberInputs() {
  // mask the output
  $sharePhone.mask('000-000-0000');
  // get interactions from the keypad
  $shareKeypad.find('.num').on(tapEvent, function(e) {
    let phoneNumber = $sharePhone.html().toString() + $(e.target).html().toString();
    phoneNumber = $sharePhone.masked(phoneNumber);
    $sharePhone.html(phoneNumber);
  });
  // clear the display
  $shareKeypad.find('.clear').on(tapEvent, function(e) {
    $sharePhone.html('');
  });

  // $('body.share-active').on(tapEvent, function(e) {
  //   if ($(e.target).closest(''))
  // })
}

// "randomly" place fiddly bits on the cards
function randomCardGraphics() {
  $body.find('.card-wrap article').each(function(i, el) {
    const numBg = 6; // 6 different bgs specified in css
    $(el).attr('data-bg', i % numBg);
  });
}

function initTips() {
  cardInteractions();
}

function initShare() {
  phoneNumberInputs();
  randomCardGraphics();
}

export function init() {
  initTips();
  initShare();
}
