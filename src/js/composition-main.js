const throttle = require('throttleit');

require('airbnb-js-shims');

const validator = require('validator');
const axios = require('axios');
const Promise = require('bluebird');
const qs = require('qs');

const invalidEmailClass = 'invalid-email';
const tapEvent = 'click tap touch';

const resizeDelay = 250; // ms

const overlayActiveClass = 'overlay-active';
const emailShareOverlayActiveClasses =
  'share-email-active' + ' ' + overlayActiveClass;
const emailShareConfirmationActiveClasses =
  'share-confirmation-active' + ' ' + overlayActiveClass;

const $body = $('body');

function fixCanvasSize() {
  const $frame = $('.framed-content').eq(0);
  const containerWidth = $frame.width();
  const containerHeight = containerWidth / 2 + 130;

  const $overlays = $('.overlay');
  $overlays.css('height', containerWidth / 2);
}

function asyncMakeEmailShareRequest(email, s3Id) {
  return new Promise(function(resolve, reject) {
    try {
      const queryString = qs.stringify({
        email: email,
        s3Id: s3Id
      });

      axios.post('/composition/send-email?' + queryString).then(function(resp) {
        resolve('email sent');
      });
    } catch (e) {
      reject(e);
    }
  });
}

function closeOverlay() {
  $body.removeClass(emailShareOverlayActiveClasses);
  $body.removeClass(emailShareConfirmationActiveClasses);
}

function hookUpEmailShareButton() {
  const $emailShareButton = $('.share-item#email');
  $emailShareButton.on(tapEvent, openEmailOverlay);
}

function hookUpEmailSendButton() {
  const $emailSend = $('.share-email button.send');
  const $emailInputWrap = $('.email-input-wrap');
  const $emailInput = $('#email-input');
  const $emailForm = $('form.email-container');

  $body.find('.overlay.closeable').on(tapEvent, function(e) {
    if ($(e.target).closest('.card-wrap').length !== 1) {
      closeOverlay();
    }
  });

  $emailForm.submit(function(e) {
    e.preventDefault();

    const email = $emailInput.val();
    const s3Id = window.kan.s3Id || $('#composition-video').attr('data-s3Id');

    if (validator.isEmail(email)) {
      // submit!
      $emailInputWrap.removeClass(invalidEmailClass);
      asyncMakeEmailShareRequest(email, s3Id);
      closeOverlay();
      $body.addClass(emailShareConfirmationActiveClasses);
      setTimeout(closeOverlay, 1000 * 3);
    } else {
      $emailInputWrap.addClass(invalidEmailClass);
    }
  });
}

function initCompositionAnalytics() {
  $('.share-item#facebook').on(tapEvent, function(e) {
    try {
      ga('send', 'event', 'share', 'facebookShare');
    } catch (e) {
      console.error(e);
    }
  });

  $('.share-item#twitter').on(tapEvent, function(e) {
    try {
      ga('send', 'event', 'share', 'twitterShare');
    } catch (e) {
      console.error(e);
    }
  });

  $('.share-item#download').on(tapEvent, function(e) {
    try {
      ga('send', 'event', 'share', 'downloadVideo');
    } catch (e) {
      console.error(e);
    }
  });
}

function openEmailOverlay() {
  $body.addClass(emailShareOverlayActiveClasses);
}

function hookUpRandomOverlayGraphics() {
  $body.find('.card-wrap article').each(function(i, el) {
    const numBg = 6; // 6 different bgs specified in css
    $(el).attr('data-bg', i % numBg);
  });
}

function run() {
  initCompositionAnalytics();
  hookUpEmailShareButton();
  hookUpEmailSendButton();
  hookUpRandomOverlayGraphics();
  fixCanvasSize();
}

run();

window.onresize = throttle(function() {
  window.kan.resizeCanvasTimeout = setTimeout(function() {
    fixCanvasSize();
  }, resizeDelay * 2);
}, resizeDelay);
