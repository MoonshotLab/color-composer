const config = require('./../../config');

const touch = require('./touch');
const video = require('./video');
const timing = require('./timing');
const tutorial = require('./tutorial');
const util = require('./util');

const hammerCanvas = touch.hammerCanvas;

const $body = $('body');
const tapEvent = 'click tap touch';

const $cardsWrap = $body.find('.overlay.tips .card-wrap');
const $cardItems = $cardsWrap.find('article');
const cardsCount = $cardItems.length;
const $footer = $body.find('.overlay.tips .footer');

const $sharePhone = $body.find('#phone');
const $shareKeypad = $body.find('.keypad');

const allOverlays = ['intro', 'play-prompt', 'share-prompt', 'continue', 'tips', 'share'];
const overlayOpenClasses = allOverlays.map((overlay) => `${overlay}-active`).join(' ');

const overlayActiveClass = 'overlay-active';

export function openOverlay(overlayName) {
  if (window.kan.overlays === false) return;
  if (allOverlays.includes(overlayName)) {
    closeAndResetOverlays();
    tutorial.hideContextualTuts();
    $body.addClass(overlayActiveClass);
    $body.find('.overlay:not(.tips)').on(tapEvent, () => {
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
          window.kan.playPromptTimeout = setTimeout(() => {
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
    }
  } else {
    console.log('unable to open unknown overlay', overlayName);
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

function openContinueOverlay() {
  $body.addClass('continue-active');

  clearTimeout(window.kan.inactivityTimeout);
  clearTimeout(window.kan.playPromptTimeout);

  window.kan.inactivityTimeout = setTimeout(() => {
    video.enterTutorialMode();
  }, timing.continueInactivityDelay);
}

function openTipsOverlay() {
  $body.addClass('tips-active');
  activateTipsCards();
}

function openShareOverlay() {
  $body.addClass('share-active');
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
  setTimeout(() => {
    $old.removeClass();
  }, 600);
}

// tips card interactions
function cardInteractions() {
  let timeOfLastInteraction = 0;
  
  $body.find('.overlay').on(tapEvent, e => {
    const currentTime = Date.now();
    if (timeOfLastInteraction > (currentTime - 250)) {
      return;
    }
    timeOfLastInteraction = currentTime;

    if ( $(e.target).closest('.card-wrap').length == 1 ) {
      // directly on a card, navigate to the next one
      cardNavNext();
    } else {
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
  resetTips();
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

// phone inputs
function phoneNumberInputs() {
  // mask the output
  $sharePhone.mask('000-000-0000');
  // get interactions from the keypad
  $shareKeypad.find('.num').on(tapEvent, e => {
    let phoneNumber = $sharePhone.html().toString() + $(e.target).html().toString();
    phoneNumber = $sharePhone.masked(phoneNumber);
    $sharePhone.html(phoneNumber);
  });
  // clear the display
  $shareKeypad.find('.clear').on(tapEvent, e => {
    $sharePhone.html('');
  });
  // FIXME: send sms
  // $shareKeypad.find('.send').on(tapEvent, e => {});
}

// "randomly" place fiddly bits on the cards
function randomCardGraphics() {
  $body.find('.card-wrap article').each((i, el) => {
    $(el).attr('data-bg', i);
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
