const config = require('./../../config');

const touch = require('./touch');
const video = require('./video');

const hammerManager = touch.hammerManager;

const $body = $('body');
const tapEvent = 'click tap touch';

const $cardsWrap = $body.find('.overlay.tips .card-wrap');
const $cardItems = $cardsWrap.find('article');
const cardsCount = $cardItems.length;
const $footer = $body.find('.overlay.tips .footer');

const $sharePhone = $body.find('#phone');
const $shareKeypad = $body.find('.keypad');

export function openOverlay(overlayName) {
  closeAndResetOverlays();

  switch (overlayName) {
    case 'tips':
      break;
    case 'play-info':
      break;
    case 'share-info':
      break;
    case 'inactivity':
      break;
    default:
      console.log('could not find overlay:', overlayName);
  }
}

// card slider navigation
function cardNavNext() {
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

export function openContinueModal() {
  const tutorialDelay = 30 * 1000; // ms

  console.log('continue modal');
  clearTimeout(window.kan.inactivityTimeout);

  window.kan.inactivityTimeout = setTimeout(() => {
    video.enterTutorialMode();
  }, tutorialDelay);
}

// open the tips
function openOverlayTips() {
  $body.find('li.tips').on(tapEvent, e => {
    if ( $body.hasClass('overlay-active') ) {
      closeAndResetOverlays();
    } else {
      activateTipsCards();
      setTimeout(() => {
        $body.addClass('overlay-active tips-active');
      }, 150);
    }
  });
}

// open sharing
function openOverlayShare() {
  $body.find('li.share').on(tapEvent, e => {
    if ( $body.hasClass('overlay-active') ) {
      closeAndResetOverlays();
    } else {
      setTimeout(() => {
        $body.addClass('overlay-active share-active');
      }, 150);
    }
  });
}

// open play
export function openOverlayPlay() {
  if ( $body.hasClass('overlay-active') ) {
    closeAndResetOverlays();
  } else {
    setTimeout(() => {
      $body.addClass('overlay-active play-tip-active');
    }, 150);
  }
}

// tipcs card interactions
function cardInteractions() {
  $body.find('.overlay').on(tapEvent, e => {
    if ( $(e.target).closest('.card-wrap').length == 1 ) {
      // directly on a card, navigate to the next one
      cardNavNext();
    } else {
      // outside elements, close everything and reset
      closeAndResetOverlays();
    }
  });
}

// close and reset tips
export function closeAndResetOverlays() {
  $body.removeClass();
  $cardItems.removeClass();
  $sharePhone.html('');
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

export function init() {
  openOverlayTips();
  openOverlayShare();
  cardInteractions();
  phoneNumberInputs();
  randomCardGraphics();
}
