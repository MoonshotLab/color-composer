require('dotenv').config();

const express = require('express');
const app = express();

const path = require('path');

const config = require('./config');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));

const port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('Server running on port ' + port);
});

app.get('/', function (req, res) {
  res.render('index', {
    config: config
  });
});

app.get('/demo/:demo', function(req, res) {
  res.render(req.params.demo);
});
