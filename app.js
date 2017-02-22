const fs = require('fs');
if (fs.existsSync('.env')) {
  require('dotenv').config();
}

const express = require('express');
const app = express();

const path = require('path');
const git = require('git-rev');

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
    config: config,
    range: require('array-range')
  });
});


app.get('/pops', function (req, res) {
  res.render('pops', {
    config: config,
    range: require('array-range')
  });
});

app.get('/hash', function(req, res) {
  if (!!process.env.GIT_REV) {
    res.send(process.env.GIT_REV);
  } else {
    git.long(function(str) {
      res.send(str);
    });
  }
})
