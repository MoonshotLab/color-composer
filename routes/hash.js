const express = require('express');
const router = express.Router();
const git = require('git-rev');

router.get('/', function(req, res) {
  console.log('process.env.GIT_REV', process.env.GIT_REV);
  git.long(function(str) {
    console.log('git.long', str);
  });
  
  if (!!process.env.GIT_REV) {
    res.send(process.env.GIT_REV);
  } else {
    git.long(function(str) {
      res.send(str);
    });
  }
});

module.exports = router;
