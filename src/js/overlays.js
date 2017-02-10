const config = require('./../../config');
const $body = $('body');
const tapEvent = 'click tap touch';

// next card
function cardNavNext($card) {
  // animate out of view
  $card.addClass('leave-left');
  // reset
  setTimeout(() => {
    $card.addClass('hidden').removeClass('leave-left');
  }, 400);
};

function setupOverlays() {
  const $cards = $body.find('.overlay .card');
  const cardCount = $cards.length;

  // open
  $body.find('li.tips').on(tapEvent, e => {
    $body.toggleClass('overlay-active');
  });

  // card interactions
  $body.find('.overlay').on(tapEvent, e => {
    if ( e.target.className == 'overlay' || e.target.className == 'contents' ) {
      // outside elements, close everything and reset
      $body.removeClass('overlay-active');
      $cards.removeClass('hidden');
    } else {
      // directly on a card, navigate to the next one
      cardNavNext($(e.target).closest('.card'));
    }
  });

}

export function init() {
  setupOverlays();
}