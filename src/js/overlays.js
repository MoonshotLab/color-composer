const config = require('./../../config');
const $body = $('body');
const tapEvent = 'click tap touch';

export function init(hammerManager) {
  const $cardsWrap = $body.find('.card-wrap');
  const $cardItems = $cardsWrap.find('article');
  const cardsCount = $cardItems.length;
  const $footer = $body.find('.overlay.tips .footer');

  // card slider navigation
  let cardNavNext = () => {
    let $old = $body.find('.card-wrap .current');
    let $new = ($old.next().length) ? $old.next() : $cardItems.first();
    let $next = ($new.next().length) ? $new.next() : $cardItems.first();
    let $third = ($next.next().length) ? $next.next() : $cardItems.first().next();
    let slide = $new.index();
    $old.removeClass().addClass('remove');
    $new.removeClass().addClass('current');
    $next.removeClass().addClass('next');
    $third.removeClass().addClass('third');
    $footer.find('.current').html(slide + 1);
    $footer.find('.next').html(cardsCount);
    setTimeout(() => {
      $old.removeClass();
    }, 600);
  };

  // open
  $body.find('li.tips').on(tapEvent, e => {
    let $new = $cardItems.first();
    let $next = ($new.next().length) ? $new.next() : $cardItems.first();
    let $third = ($next.next().length) ? $next.next() : $cardItems.first().next();
    $cardItems.removeClass();
    $new.removeClass().addClass('current');
    $next.removeClass().addClass('next');
    $third.removeClass().addClass('third');
    $body.toggleClass('overlay-active tips-active');
  });

  // card interactions
  $body.find('.overlay').on(tapEvent, e => {
    if ( $(e.target).closest('.contents').length == 1 ) {
      // directly on a card, navigate to the next one
      cardNavNext();
    } else {
      // outside elements, close everything and reset
      $body.removeClass('overlay-active tips-active');
      $cardItems.removeClass();
    }
  });

}