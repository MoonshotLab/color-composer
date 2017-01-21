window.kan = window.kan || {
  palette: ["#20171C", "#1E2A43", "#28377D", "#352747", "#F285A5", "#CA2E26", "#B84526", "#DA6C26", "#453121", "#916A47", "#EEB641", "#F6EB16", "#7F7D31", "#6EAD79", "#2A4621", "#F4EAE0"],
  currentColor: '#20171C',
  numPaths: 10,
  paths: [],
};

paper.install(window);

// Converts from degrees to radians.
Math.rad = function(degrees) {
  return degrees * Math.PI / 180;
};

// Converts from radians to degrees.
Math.deg = function(radians) {
  return radians * 180 / Math.PI;
};

$(document).ready(function() {
  // window.kan.currentColor = window.kan.palette[0];
  var MOVES = []; // store global moves list
  // moves = [
  //   {
  //     'type': 'colorChange',
  //     'old': '#20171C',
  //     'new': '#F285A5'
  //   },
  //   {
  //     'type': 'newPath',
  //     'ref': '???' // uuid? dom reference?
  //   },
  //   {
  //     'type': 'pathTransform',
  //     'ref': '???', // uuid? dom reference?
  //     'old': 'rotate(90deg)scale(1.5)', // ???
  //     'new': 'rotate(120deg)scale(-0.5)' // ???
  //   },
  //   // others?
  // ]

  var $window = $(window);
  var $body = $('body');
  var $canvas = $('canvas#mainCanvas');

  // $(document).on('mousedown', touchStart);
  // $(document).on('mousemove', touchMove);
  // $(document).on('mouseup', touchEnd);


  function initControlPanel() {
    initColorPalette();
    initCanvasDraw();
    initNew();
    initUndo();
    initPlay();
    initTips();
    initShare();
  }

  function initColorPalette() {
    var $paletteWrap = $('ul.palette-colors');
    var $paletteColors = $paletteWrap.find('li');
    var paletteColorSize = 20;
    var paletteSelectedColorSize = 30;
    var paletteSelectedClass = 'palette-selected';

    // hook up click
      $paletteColors.on('click tap touch', function() {
          var $svg = $(this).find('svg.palette-color');

          if (!$svg.hasClass(paletteSelectedClass)) {
            $('.' + paletteSelectedClass)
              .removeClass(paletteSelectedClass)
              .attr('width', paletteColorSize)
              .attr('height', paletteColorSize)
              .find('rect')
              .attr('rx', 0)
              .attr('ry', 0);

            $svg.addClass(paletteSelectedClass)
              .attr('width', paletteSelectedColorSize)
              .attr('height', paletteSelectedColorSize)
              .find('rect')
              .attr('rx', paletteSelectedColorSize / 2)
              .attr('ry', paletteSelectedColorSize / 2)

            window.kan.currentColor = $svg.find('rect').attr('fill');
          }
        });
  }

  function initCanvasDraw() {

    paper.setup($canvas[0]);

    var path;
    var past;
    var pasts = [];
    var sizes;
    // var paths = getFreshPaths(window.kan.numPaths);
    var touch = false;
    var lastChild;

    function panStart(event) {
      sizes = [];

      console.log(event.gesture);

      if (!(event.gesture.changedPointers && event.gesture.changedPointers.length > 0)) return;
      if (event.gesture.changedPointers.length > 1) {
        console.log('event.gesture.changedPointers > 1');
      }

      var pointer = event.gesture.center;
      var point = new Point(pointer.x, pointer.y);

      path = new Path({
        strokeColor: window.kan.currentColor,
        fillColor: window.kan.currentColor
      });

      path.add(point);

      // if (!touch) {
      //   touch = true;
      //   for (var i = 0; i < ev.touches.length; i++) {
      //     paths[i].strokeColor = window.kan.currentColor;
      //     // paths[i].fillColor = window.kan.currentColor;
      //     paths[i].add(new Point(ev.touches[i].pageX, ev.touches[i].pageY));
      //
      //     // for (var j = 0; j < paths[i].children.length; j++) {
      //     //   // start all paths on the same point
      //     //   paths[i].children[j].add(new Point(ev.touches[i].pageX, ev.touches[i].pageY));
      //     // }
      //   }
      //
      //   // console.log(ev.touches[0]);
      //   //
      //   // var hitResult = paper.project.hitTest(new Point(ev.touches[0].pageX, ev.touches[0].pageY), hitOptions);
      //   //
      //   // console.log(hitResult);
      //   //
      //   // if (hitResult) {
      //   //   var path = hitResult.item;
      //   //   path.selected = true;
      //   // }
      // } else {
      //   console.log('still being touched; ignoring');
      // }
    }

    var threshold = 20;
    var alpha = 0.3;
    var memory = 10;
    var cumSize, avgSize;
    function panMove(event) {
      event.preventDefault();

      var pointer = event.gesture.center;
      var point = new Point(pointer.x, pointer.y);

      while (sizes.length > memory) {
        sizes.shift();
      }

      var bottomX, bottomY, bottom,
        topX, topY, top,
        p0, p1,
        step, angle, dist, size;

      if (sizes.length > 0) {
        // not the first point, so we have others to compare to
        p0 = past;
        dist = delta(point, p0);
        size = dist * alpha;
        if (size >= threshold) size = threshold;

        cumSize = 0;
        for (var j = 0; j < sizes.length; j++) {
          cumSize += sizes[j];
        }
        avgSize = Math.round(((cumSize / sizes.length) + size) / 2);
        // console.log(avgSize);

        angle = Math.atan2(point.y - p0.y, point.x - p0.x); // rad
        // angle = Math.rad(event.gesture.angle);

        // Point(bottomX, bottomY) is bottom, Point(topX, topY) is top
        bottomX = point.x + Math.cos(angle + Math.PI/2) * avgSize;
        bottomY = point.y + Math.sin(angle + Math.PI/2) * avgSize;
        bottom = new Point(bottomX, bottomY);

        topX = point.x + Math.cos(angle - Math.PI/2) * avgSize;
        topY = point.y + Math.sin(angle - Math.PI/2) * avgSize;
        top = new Point(topX, topY);

        path.add(top);
        path.insert(0, bottom);
        // paths[i].add(point);

        path.smooth();
      } else {
        // don't have anything to compare to
        dist = 1;
        angle = 0;

        size = dist * alpha;
        if (size >= threshold) size = threshold;
      }

      paper.view.draw();

      past = point;
      sizes.push(size);
    }

    function panEnd(event) {
      elasticity = 1;

      var pointer = event.gesture.center;
      var point = new Point(pointer.x, pointer.y);

      path.add(point);
      path.smooth();
      path.simplify(0);
      path.closed = true;
      lastChild = path;

      var intersections = path.getCrossings();
      if (intersections && intersections.length > 0) {
        for (var i = 0; i < intersections.length; i++) {
          // console.log('----------------');
          var intersection = intersections[i];
          // console.log(intersection);
          var circle = new Path.Circle({
              center: intersection.point,
              radius: 3,
              fillColor: 'pink'
          });
        }
      }

      // // for (var i = 0; i < paths.length; i++) {
      //   if (paths[i].segments.length > 0) {
      //     // console.log(paths[i].segments.length);
      //     // if (paths[i].get(paths[i])) {
      //     //   console.log('self intersection');
      //     // } else {
      //     //   console.log('no intersection');
      //     // }
      //     var intersections = paths[i].getCrossings();
      //     if (intersections && intersections.length > 0) {
      //       for (var j = 0; j < intersections.length; j++) {
      //         console.log('----------------');
      //         var intersection = intersections[j];
      //         console.log(intersection);
      //         var circle = new Path.Circle({
      //             center: intersection.point,
      //             radius: 3,
      //             fillColor: 'pink'
      //         });
      //         console.log('----------------');
      //         // var segment = new paper.Segment(intersection.point, intersection.segment1, intersection.segment2, {
      //         //   strokeColor: 'pink',
      //         //   fillColor: 'pink'
      //         // })
      //
      //         // var intersectionPath = new paper.Path(intersection.segments, {
      //         //   strokeColor: 'pink',
      //         //   fillColor: 'pink',
      //         //   strokeWidth: 5
      //         // });
      //         // break;
      //         // var interior = false;
      //         // var interiorPaths = [];
      //         // for (var k = 0; k < paths[i].segments.length; k++) {
      //         //   if (paths[i].segments[k].point.isClose(intersection.point, 1)) {
      //         //     if (!interior) {
      //         //       console.log('start');
      //         //       interiorPaths.push(new paper.Path({
      //         //         strokeColor: '#eeeeee',
      //         //         fillColor: '#eeeeee'
      //         //       }))
      //         //       interior = true;
      //         //     } else {
      //         //       console.log('end');
      //         //       interiorPaths[interiorPaths.length - 1].closed = true;
      //         //       interior = false;
      //         //     }
      //         //   } else {
      //         //     if (interior) {
      //         //       console.log('interior');
      //         //       interiorPaths[interiorPaths.length - 1].add(paths[i].segments[k].point);
      //         //     }
      //         //     // console.log(paths[i].segments[k].point, intersection.point);
      //         //   }
      //         // }
      //         // console.log(intersections[j]);
      //         // console.log(paths[i].getLocationOf(intersections[j].point));
      //         // var intersectionPath = new paper.Curve(intersection.curve, {
      //         //   strokeColor: '#eeeeee',
      //         //   strokeFill: '#eeeeee'
      //         // });
      //         // console.log(intersectionPath);
      //         // var offset = paths[i].getOffsetOf(intersections[j].point);
      //         // var point = paths[i].getPointAt(offset);
      //         // console.log(offset);
      //         // console.log(paths[i]);
      //         // var circle = new Path.Circle({
      //         //     center: point,
      //         //     radius: 3,
      //         //     fillColor: 'pink'
      //         // });
      //         console.log('----------------');
      //       }
      //       // console.log(intersections);
      //
      //     }
      //
      //     paths[i].smooth();
      //     paths[i].simplify(0);
      //     // console.log(paths[i].segments.length);
      //     lastChild = paths[i];
      //
      //     // for (var j = 0; j < paths[i].segments.length; j++) {
      //     //   console.log(paths[i].segments[j].point.x, paths[i].segments[j].point.y);
      //     // }
      //     // console.log(lastChild);
      //   } else {
      //     paths[i].remove();
      //   }
      // }

      // reset paths
      // var path;

      // if (ev.touches.length === 0) {
      //   touch = false;
      //   // console.log('no touches')
      //   paths = getFreshPaths(window.kan.numPaths);
      //   pasts = [];
      //   sizes = [];
      // } else {
      //   // console.log('still touching');
      // }
    }

    var hitOptions = {
      segments: false,
      stroke: true,
      fill: true,
      tolerance: 5
    };

    function tap(event) {
      var pointer = event.gesture.center,
          point = new Point(pointer.x, pointer.y),
          hitResult = paper.project.hitTest(point, hitOptions);

      if (hitResult) {
        hitResult.item.selected = !hitResult.item.selected;
      }
    }

    // var animationId;
    var elasticity = 0;

    function jiggle(event) {

      // console.log(paper.project.activeLayer.firstChild);
      // paper.project.activeLayer.firstChild.rotate(3);
      if (!!lastChild) {
        if (elasticity > 0) {
          // console.log(lastChild);
          for (var i = 0; i < lastChild.segments.length; i++) {
            var segment = lastChild.segments[i];
            var timeConst = 16;
            var divConst = 2;
            var cos = Math.cos(event.time * timeConst + i);
            var sin = Math.sin(event.time * timeConst + i);
            segment.point.x += (cos / divConst) * elasticity;
            segment.point.y += (sin / divConst) * elasticity;
            // console.log(cos, sin, elasticity);
            elasticity -= 0.001;
          }
        }
      } else {
        // console.log('no children yet');
      }
    }

    // paper.view.onFrame = jiggle;

    $canvas.hammer()
      .on('panstart', panStart)
      .on('panmove', panMove)
      .on('panend', panEnd)
      .on('tap', tap);

    $canvas.data('hammer').get('pan').set({ direction: Hammer.DIRECTION_ALL });
  }

  function delta(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)); // pythagorean!
  }

  function newPressed() {
    console.log('new pressed');

    moves = [];
    paper.project.activeLayer.removeChildren();
  }

  function undoPressed() {
    console.log('undo pressed');
    // d3.selectAll('svg.main path:last-child').remove();
  }

  function playPressed() {
    console.log('play pressed');
  }

  function tipsPressed() {
    console.log('tips pressed');
  }

  function sharePressed() {
    console.log('share pressed');
  }

  function initNew() {
    $('.main-controls .new').on('click tap touch', newPressed);
  }

  function initUndo() {
    $('.main-controls .undo').on('click', undoPressed);
  }
  function initPlay() {
    $('.main-controls .play').on('click', playPressed);
  }
  function initTips() {
    $('.aux-controls .tips').on('click', tipsPressed);
  }
  function initShare() {
    $('.aux-controls .share').on('click', sharePressed);
  }

  function main() {
    initControlPanel();
  }

  main();
});
