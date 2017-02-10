const config = require('./../../config');
const $body = $('body');
const tapEvent = 'click tap touch';

// next card
function cardNavNext(card) {
  // animate out of view
  $(card).parent().addClass('leave-left');
  // reset
  setTimeout(() => {
    $(card).parent().addClass('hidden').removeClass('leave-left');
  }, 400);
};

function setupOverlays(hammerManager) {
  const $cards = $body.find('.overlay .card');
  const cardCount = $cards.length;

  // open
  $body.find('li.tips').on(tapEvent, e => {
    $body.find('main').addClass('overlay-active');
  });

  // close
  $body.find('.overlay').on(tapEvent, e => {
    if ( !$(e.target).closest('.contents, .card, button').length ) {
      $body.find('main').removeClass('overlay-active');
      $cards.removeClass('hidden');
    }
  });

  // navigate
  $body.find('.overlay .next').on(tapEvent, e => {
    cardNavNext(e.currentTarget);
  });

  console.log(hammerManager);

}

export function init(hammerManager) {
  setupOverlays(hammerManager);
}