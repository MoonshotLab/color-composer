const validator = require('validator');
const axios = require('axios');
const Promise = require('bluebird');
const qs = require('qs');

const invalidEmailClass = 'invalid-email';
const tapEvent = 'click tap touch';

const overlayActiveClass = 'overlay-active';
const emailShareOverlayActiveClasses = 'share-email-active' + ' ' + overlayActiveClass;
const emailShareConfirmationActiveClasses = 'share-confirmation-active' + ' ' + overlayActiveClass;

const $body = $('body');

function asyncMakeEmailShareRequest(email, s3Id) {
  return new Promise(function(resolve, reject) {
    try {

      const queryString = qs.stringify({
        email: email,
        s3Id: s3Id
      });

      axios.post('/composition/send-email?' + queryString)
        .then(function(resp) {
          resolve('email sent');
        })
    } catch(e) {
      reject(e);
    }
  })
}

function closeOverlay() {
  $body.removeClass(emailShareOverlayActiveClasses);
  $body.removeClass(emailShareConfirmationActiveClasses);
}

function hookUpEmailSendButton() {
  const $emailSend = $('.share-email button.send');
  const $emailInputWrap = $('.email-input-wrap');
  const $emailInput = $('#email');
  const $emailForm = $('form.email-container');

  $body.find('.overlay.closeable').on(tapEvent, function(e) {
    if ( $(e.target).closest('.card-wrap').length !== 1 ) {
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
      asyncMakeEmailShareRequest(email, s3Id)
        .then(function(resp) {
          closeOverlay();
          $body.addClass(emailShareConfirmationActiveClasses);
          setTimeout(closeOverlay, 1000 * 3);
        })
        .catch(function(e) {
          console.error(e);
        });
    } else {
      $emailInputWrap.addClass(invalidEmailClass);
    }

  })
}

function initCompositionAnalytics() {
  $('.share-item#facebook').on(tapEvent, function(e) {
    ga('send', 'event', 'share', 'facebookShare');
  });

  $('.share-item#twitter').on(tapEvent, function(e) {
    ga('send', 'event', 'share', 'twitterShare');
  });

  $('.share-item#download').on(tapEvent, function(e) {
    ga('send', 'event', 'share', 'downloadVideo');
  });
}

function openEmailOverlay() {
  $body.addClass(emailShareOverlayActiveClasses);
}

function run() {
  initCompositionAnalytics();
  hookUpEmailSendButton();
  openEmailOverlay();
}

run();
