var canvas;
var paths = [];
var numPaths = 10;

paper.install(window);

$(document).ready(function() {
  var $body = $('body');
  var $canvas = $('canvas#foo');

  $body.css('width', '100%').css('height', '100%');
  $('html').css('width', '100%').css('height', '100%');

  canvas = $canvas[0];
  paper.setup(canvas);

  var path;
  for (var i = 0; i < numPaths; i++) {
    path = new paper.Path();
    path.strokeColor = '#000';
    path.strokeWidth = 2;
    paths.push(path);
  }

  var touch = false;
  function touchStart() {
    touch = true;
  }

  function touchEnd() {
    touch = false;

    var path;
    paths = [];
    for (var i = 0; i < numPaths; i++) {
      path = new paper.Path();
      path.strokeColor = '#000';
      path.strokeWidth = 2;
      paths.push(path);
    }
  }

  function touchMove(ev) {
    ev.preventDefault();
    console.log(paths);

    if (!touch) return;

    for (var i = 0; i < ev.touches.length; i++) {
      var x1, y1;
      x1 = ev.touches[i].pageX;
      y1 = ev.touches[i].pageY;

      paths[i].add(new Point(x1, y1));
      paper.view.draw();
    }
  }

  $body.on('touchstart', touchStart);
  $body.on('touchmove', touchMove);
  $body.on('touchend', touchEnd);
})
