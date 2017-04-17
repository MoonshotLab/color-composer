const fs = require('fs');
if (fs.existsSync('.env')) {
  require('dotenv').config();
}

const express = require('express');
const app = express();
const bodyParser= require('body-parser');
const autoReap  = require('multer-autoreap');

const path = require('path');

const index = require('./routes/index');
const gallery = require('./routes/gallery'); // TODO: REMOVE
const desktop = require('./routes/desktop'); // TODO: REMOVE
const hash = require('./routes/hash');
const processVideo = require('./routes/process');
const composition = require('./routes/composition');
const textMessage = require('./routes/text-message');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(autoReap); // automatically clean uploads
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('Server running on port ' + port);
});

app.use('/hash', hash);
app.use('/process', processVideo);
app.use('/composition', composition);
app.use('/text-message', textMessage);
app.use('/gallery', gallery); // TODO: REMOVE
app.use('/desktop', desktop); // TODO: REMOVE
app.use('/', index);
app.use('*', function(req, res) {
  res.redirect('/');
});

module.exports = app;
