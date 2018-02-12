const twilio = require('twilio')(
  process.env.TWILIO_SID,
  process.env.TWILIO_TOKEN
);

exports.sendURL = function(data) {
  const message = [
    'Here’s your Color Composer video!',
    `Visit ${data.url} or reply with your email to receive a downloadable file.`
  ].join(' ');

  twilio.messages.create(
    {
      body: message,
      from: process.env.TWILIO_NUMBER,
      to: data.phone
    },
    function(err, message) {
      if (err) console.log(err);
      else console.log('Sent SMS to', data.phone);
    }
  );
};
