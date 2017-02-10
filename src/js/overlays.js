const $body = $('body');
const tapEvent = 'click tap touch';

function setupOverlays() {
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
    $(e.currentTarget).parent().addClass('hidden');
  });

}

export function init() {
  setupOverlays();
}