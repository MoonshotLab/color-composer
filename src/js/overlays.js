const config = require('./../../config');

const touch = require('./touch');
const hammerManager = touch.hammerManager;

const $body = $('body');
const tapEvent = 'click tap touch';

const $cardsWrap = $body.find('.card-wrap');
const $cardItems = $cardsWrap.find('article');
const cardsCount = $cardItems.length;
const $footer = $body.find('.overlay.tips .footer');

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
function closeAndResetOverlays() {
  $body.removeClass();
  $cardItems.removeClass();
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

export function init() {
  openOverlayTips();
  openOverlayShare();
  cardInteractions();
}
