const tapEvent = 'click tap touch';

$('.share-item#facebook').on(tapEvent, function(e) {
  ga('send', 'event', 'share', 'facebookShare');
});

$('.share-item#twitter').on(tapEvent, function(e) {
  ga('send', 'event', 'share', 'twitterShare');
});

$('.share-item#download').on(tapEvent, function(e) {
  ga('send', 'event', 'share', 'downloadVideo');
});
