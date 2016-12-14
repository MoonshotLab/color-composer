require('dotenv').config();

const express = require('express');
const app = express();

const path = require('path');

app.use(express.static('public'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

const port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('Server running on port ' + port);
});

app.get('/', function (req, res) {
  res.render('index');
});
