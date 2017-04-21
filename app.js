const fs = require('fs');
if (fs.existsSync('.env')) {
  require('dotenv').config();
}

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
exports.io = io;

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
http.listen(port, function() {
  console.log('Server running on port ' + port);
});

io.sockets.on('connection', function (socket) {
  socket.on('join', function (data) {
    if (process.env.LOCATION === 'gallery') {
      if (!!data.uuid) {
        console.log(`gallery connected (${data.uuid})`);
      } else {
        console.log('gallery connected');
      }
    } else {
      console.log(`client ${data.uuid} connected`);
    }
    socket.join(data.uuid); // join client room to transmit data to
  });
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
