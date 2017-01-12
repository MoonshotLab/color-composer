var canvas;
var paths = [];
var numPaths = 10;

paper.install(window);

function getFreshPaths() {
  var paths = [];

  for (var i = 0; i < numPaths; i++) {
    var compound = new paper.CompoundPath({
      children: [
        new paper.Path({
          // strokeColor: '#000',
          // strokeWidth: 2
        }),
        new paper.Path({
          // strokeColor: '#000',
          // strokeWidth: 2
        }),
        new paper.Path({
          // strokeColor: '#000',
          // strokeWidth: 2
        })
      ]
    }); // [bottom, middle, top]

    compound.strokeColor = '#000';
    compound.strokeWidth = 1;
    paths.push(compound);
  }

  return paths;
}

$(document).ready(function() {
  var $body = $('body');
  var $canvas = $('canvas#foo');

  $body.css('width', '100%').css('height', '100%');
  $('html').css('width', '100%').css('height', '100%');

  canvas = $canvas[0];
  paper.setup(canvas);

  var path;
  paths = getFreshPaths();
  // var paths = [];
  //
  // for (var i = 0; i < numPaths; i++) {
  //   var compound = new paper.CompoundPath({
  //     children: [
  //       new paper.Path({
  //         strokeColor: '#000',
  //         strokeWidth: 2
  //       }),
  //       new paper.Path({
  //         strokeColor: '#000',
  //         strokeWidth: 2
  //       }),
  //       new paper.Path({
  //         strokeColor: '#000',
  //         strokeWidth: 2
  //       })
  //     ]
  //   }); // [bottom, middle, top]
  //
  //   compound.strokeColor = '#000';
  //   compound.strokeWidth = 2;
  //   paths.push(compound);
  // }

  var touch = false;
  function touchStart() {
    touch = true;
  }

  function touchEnd() {
    touch = false;

    var path;
    paths = getFreshPaths();
    // var paths = [];
    //
    // for (var i = 0; i < numPaths; i++) {
    //   var compound = new paper.CompoundPath({
    //     children: [
    //       new paper.Path({
    //         strokeColor: '#000',
    //         strokeWidth: 2
    //       }),
    //       new paper.Path({
    //         strokeColor: '#000',
    //         strokeWidth: 2
    //       }),
    //       new paper.Path({
    //         strokeColor: '#000',
    //         strokeWidth: 2
    //       })
    //     ]
    //   }); // [bottom, middle, top]
    //
    //   paths.push(compound);
    // }
  }

  function touchMove(ev) {
    ev.preventDefault();
    // console.log(ev);
    console.log(paths);

    if (!touch) return;

    for (var i = 0; i < ev.touches.length; i++) {
      var x1, y1;
      x1 = ev.touches[i].pageX;
      y1 = ev.touches[i].pageY;
      var offset = 5;

      // iterate
      for (var j = 0; j < paths[i].children.length; j++) {
        paths[i].children[j].add(new Point(x1 + (offset * j), y1 + (offset * j)));
      }

      paper.view.draw();
    }
  }

  $body.on('touchstart', touchStart);
  $body.on('touchmove', touchMove);
  $body.on('touchend', touchEnd);
})
