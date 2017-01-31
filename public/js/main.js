(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

window.kan = window.kan || {
  palette: ["#20171C", "#1E2A43", "#28377D", "#352747", "#F285A5", "#CA2E26", "#B84526", "#DA6C26", "#453121", "#916A47", "#EEB641", "#F6EB16", "#7F7D31", "#6EAD79", "#2A4621", "#F4EAE0"],
  currentColor: '#20171C',
  numPaths: 10,
  paths: []
};

paper.install(window);

var util = require('./util');
// require('paper-animate');

$(document).ready(function () {
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
  var runAnimations = false;
  var transparent = new Color(0, 0);

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
    $paletteColors.on('click tap touch', function () {
      var $svg = $(this).find('svg.palette-color');

      if (!$svg.hasClass(paletteSelectedClass)) {
        $('.' + paletteSelectedClass).removeClass(paletteSelectedClass).attr('width', paletteColorSize).attr('height', paletteColorSize).find('rect').attr('rx', 0).attr('ry', 0);

        $svg.addClass(paletteSelectedClass).attr('width', paletteSelectedColorSize).attr('height', paletteSelectedColorSize).find('rect').attr('rx', paletteSelectedColorSize / 2).attr('ry', paletteSelectedColorSize / 2);

        window.kan.currentColor = $svg.find('rect').attr('fill');
      }
    });
  }

  function initCanvasDraw() {

    paper.setup($canvas[0]);

    var middle = void 0,
        bounds = void 0;
    var past = void 0;
    var sizes = void 0;
    // let paths = getFreshPaths(window.kan.numPaths);
    var touch = false;
    var lastChild = void 0;

    function panStart(event) {
      paper.project.activeLayer.removeChildren(); // REMOVE
      drawCircle();

      sizes = [];

      if (pinching) return;
      if (!(event.changedPointers && event.changedPointers.length > 0)) return;
      if (event.changedPointers.length > 1) {
        console.log('event.changedPointers > 1');
      }

      var pointer = event.center;
      var point = new Point(pointer.x, pointer.y);

      bounds = new Path({
        strokeColor: window.kan.currentColor,
        fillColor: window.kan.currentColor,
        name: 'bounds'
      });

      middle = new Path({
        strokeColor: window.kan.currentColor,
        name: 'middle',
        strokeWidth: 1,
        visible: false
      });

      bounds.add(point);
      middle.add(point);
    }

    var min = 0;
    var max = 20;
    var alpha = 0.3;
    var memory = 10;
    var cumDistance = 0;
    var cumSize = void 0,
        avgSize = void 0;
    function panMove(event) {
      event.preventDefault();
      if (pinching) return;
      // console.log(event.overallVelocity);
      // let thisDist = parseInt(event.distance);
      // cumDistance += thisDist;
      //
      // if (cumDistance < 100) {
      //   console.log('ignoring');
      //   return;
      // } else {
      //   cumDistance = 0;
      //   console.log('not ignoring');
      // }

      var pointer = event.center;
      var point = new Point(pointer.x, pointer.y);

      while (sizes.length > memory) {
        sizes.shift();
      }

      var bottomX = void 0,
          bottomY = void 0,
          bottom = void 0,
          topX = void 0,
          topY = void 0,
          top = void 0,
          p0 = void 0,
          p1 = void 0,
          step = void 0,
          angle = void 0,
          dist = void 0,
          size = void 0;

      if (sizes.length > 0) {
        // not the first point, so we have others to compare to
        p0 = past;
        dist = util.delta(point, p0);
        size = dist * alpha;
        if (size >= max) size = max;
        // size = Math.max(Math.min(size, max), min); // clamp size to [min, max]
        // size = max - size;

        cumSize = 0;
        for (var j = 0; j < sizes.length; j++) {
          cumSize += sizes[j];
        }
        avgSize = Math.round((cumSize / sizes.length + size) / 2);
        // console.log(avgSize);

        angle = Math.atan2(point.y - p0.y, point.x - p0.x); // rad

        // Point(bottomX, bottomY) is bottom, Point(topX, topY) is top
        bottomX = point.x + Math.cos(angle + Math.PI / 2) * avgSize;
        bottomY = point.y + Math.sin(angle + Math.PI / 2) * avgSize;
        bottom = new Point(bottomX, bottomY);

        topX = point.x + Math.cos(angle - Math.PI / 2) * avgSize;
        topY = point.y + Math.sin(angle - Math.PI / 2) * avgSize;
        top = new Point(topX, topY);

        bounds.add(top);
        bounds.insert(0, bottom);
        // bounds.smooth();

        middle.add(point);
        // middle.smooth();
      } else {
        // don't have anything to compare to
        dist = 1;
        angle = 0;

        size = dist * alpha;
        size = Math.max(Math.min(size, max), min); // clamp size to [min, max]
      }

      paper.view.draw();

      past = point;
      sizes.push(size);
    }

    function panEnd(event) {
      elasticity = 1;
      if (pinching) return;

      var pointer = event.center;
      var point = new Point(pointer.x, pointer.y);

      var group = new Group([bounds, middle]);

      bounds.add(point);
      bounds.flatten(4);
      bounds.smooth();
      bounds.simplify();
      bounds.closed = true;

      middle.add(point);
      middle.flatten(4);
      middle.smooth();
      middle.simplify();

      // util.trueGroup(group);

      var intersections = middle.getCrossings();
      if (intersections.length > 0) {
        // we create a copy of the path because resolveCrossings() splits source path
        var pathCopy = new Path();
        pathCopy.copyContent(middle);
        pathCopy.visible = false;

        var dividedPath = pathCopy.resolveCrossings();
        dividedPath.visible = false;

        var enclosedLoops = util.findInteriorCurves(dividedPath);

        if (enclosedLoops) {
          for (var i = 0; i < enclosedLoops.length; i++) {
            enclosedLoops[i].visible = true;
            enclosedLoops[i].closed = true;
            enclosedLoops[i].fillColor = new Color(0, 0); // transparent
            enclosedLoops[i].data.interior = true;
            enclosedLoops[i].data.transparent = true;
            // enclosedLoops[i].blendMode = 'multiply';
            group.addChild(enclosedLoops[i]);
            enclosedLoops[i].sendToBack();
          }
        }
        pathCopy.remove();
      } else {
        // console.log('no intersections');
      }

      group.data.color = bounds.fillColor;
      // console.log(group.rotation);
      lastChild = group;
      console.log(group);

      // let unitedGroupIds = [paper.project.activeLayer.id, group.id];
      // group.children.map(function(el) {
      //   unitedGroupIds.push(el.id);
      // });
      // console.log('unitedGroupIds', unitedGroupIds);


      // let unitedGroup = group.children.reduce(function(a, b) {
      //   return a.unite(b);
      // }, new Path({
      //   fillColor: 'pink',
      //   strokeWidth: 1,
      //   strokeColor: 'pink',
      //   fillRule: 'evenodd'
      // }));
      // console.log('unitedGroup', unitedGroup);
      //
      // unitedGroup.selected = false;
      // unitedGroup.visible = false;
      // // group.selected = true;
      //
      // let neighbors = project.getItems({
      //   overlapping: unitedGroup.strokeBounds,
      //   match: function(el) {
      //     return unitedGroupIds.includes(el.id);
      //   }
      // });
      // if (neighbors.length > 0) {
      //   console.log('neighbors', neighbors);
      // } else {
      //   console.log('no neighbors');
      // }
      // let rect = new Path.Rectangle(group.strokeBounds);
      // rect.strokeColor = 'pink';
      // rect.strokeWidth = 2;

      MOVES.push({
        type: 'newGroup',
        id: group.id
      });

      if (runAnimations) {
        group.animate([{
          properties: {
            scale: 0.9
          },
          settings: {
            duration: 100,
            easing: "easeOut"
          }
        }, {
          properties: {
            scale: 1.11
          },
          settings: {
            duration: 100,
            easing: "easeIn"
          }
        }]);
      }
    }

    var pinching = void 0;
    var pinchedGroup = void 0,
        lastScale = void 0,
        lastRotation = void 0;
    var originalPosition = void 0,
        originalRotation = void 0;
    function pinchStart(event) {
      console.log('pinchstart', event);
      hammerManager.get('pan').set({ enable: false });
      var pointer = event.center,
          point = new Point(pointer.x, pointer.y),
          hitResult = paper.project.hitTest(point, hitOptions);

      if (hitResult) {
        pinching = true;
        pinchedGroup = hitResult.item.parent;
        lastScale = 1;
        lastRotation = pinchedGroup.rotation;

        originalPosition = pinchedGroup.position;
        originalRotation = pinchedGroup.rotation;

        console.log('pinchStart lastScale:', lastScale);
        if (runAnimations) {
          pinchedGroup.animate({
            properties: {
              scale: 1.25
            },
            settings: {
              duration: 100,
              easing: "easeOut"
            }
          });
        }
      } else {
        console.log('hit no item');
      }
    }

    function pinchMove(event) {
      if (pinchedGroup) {
        // console.log('pinchmove', event);
        // console.log(pinchedGroup);
        var currentScale = event.scale;
        var scaleDelta = currentScale / lastScale;
        // console.log(lastScale, currentScale, scaleDelta);
        lastScale = currentScale;

        var currentRotation = event.rotation;
        var rotationDelta = currentRotation - lastRotation;
        // console.log(lastRotation, currentRotation, rotationDelta);
        lastRotation = currentRotation;

        // console.log(`scaling by ${scaleDelta}`);
        // console.log(`rotating by ${rotationDelta}`);

        pinchedGroup.position = event.center;
        pinchedGroup.scale(scaleDelta);
        pinchedGroup.rotate(rotationDelta);
      }
    }

    function pinchEnd(event) {
      console.log('pinchend', event);
      // wait 250 ms to prevent mistaken pan readings
      if (pinchedGroup) {
        var move = {
          id: pinchedGroup.id,
          type: 'transform'
        };
        if (pinchedGroup.position != originalPosition) {
          move.position = originalPosition;
        }
        if (pinchedGroup.rotation != originalRotation) {
          move.rotation = originalRotation;
        }
        // if (pinchedGroup.scale != originalScale) {
        //   move.scale = originalScale;
        // }
        console.log('pushing move:', move);
        MOVES.push(move);
        if (runAnimations) {
          pinchedGroup.animate({
            properties: {
              scale: 0.8
            },
            settings: {
              duration: 100,
              easing: "easeOut"
            }
          });
        }
      }
      pinching = false;
      setTimeout(function () {
        hammerManager.get('pan').set({ enable: true });
      }, 250);
    }

    var hitOptions = {
      segments: false,
      stroke: true,
      fill: true,
      tolerance: 5
    };

    function singleTap(event) {
      var pointer = event.center,
          point = new Point(pointer.x, pointer.y),
          hitResult = paper.project.hitTest(point, hitOptions);

      if (hitResult) {
        var item = hitResult.item;
        item.selected = !item.selected;
      }
    }

    function doubleTap(event) {
      var pointer = event.center,
          point = new Point(pointer.x, pointer.y),
          hitResult = paper.project.hitTest(point, hitOptions);

      if (hitResult) {
        var item = hitResult.item;
        var parent = item.parent;

        if (item.data.interior) {
          console.log('interior');
          item.data.transparent = !item.data.transparent;

          if (item.data.transparent) {
            item.fillColor = transparent;
            item.strokeColor = transparent;
          } else {
            item.fillColor = parent.data.color;
            item.strokeColor = parent.data.color;
          }

          MOVES.push({
            type: 'fillChange',
            id: item.id,
            fill: parent.data.color,
            transparent: item.data.transparent
          });
        } else {
          console.log('not interior');
        }
      } else {
        console.log('hit no item');
      }
    }

    // var animationId;
    var elasticity = 0;

    function bounce(event) {

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
            segment.point.x += cos / divConst * elasticity;
            segment.point.y += sin / divConst * elasticity;
            // console.log(cos, sin, elasticity);
            elasticity -= 0.001;
          }
        }
      } else {
        // console.log('no children yet');
      }
    }

    // paper.view.onFrame = jiggle;

    var hammerManager = new Hammer.Manager($canvas[0]);

    hammerManager.add(new Hammer.Tap({ event: 'doubletap', taps: 2 }));
    hammerManager.add(new Hammer.Tap({ event: 'singletap' }));
    hammerManager.add(new Hammer.Pan({ direction: Hammer.DIRECTION_ALL }));
    hammerManager.add(new Hammer.Pinch());

    hammerManager.get('doubletap').recognizeWith('singletap');
    hammerManager.get('singletap').requireFailure('doubletap');
    hammerManager.get('pan').requireFailure('pinch');

    hammerManager.on('singletap', singleTap);
    hammerManager.on('doubletap', doubleTap);

    hammerManager.on('panstart', panStart);
    hammerManager.on('panmove', panMove);
    hammerManager.on('panend', panEnd);

    hammerManager.on('pinchstart', pinchStart);
    hammerManager.on('pinchmove', pinchMove);
    hammerManager.on('pinchend', pinchEnd);
    hammerManager.on('pinchcancel', function () {
      hammerManager.get('pan').set({ enable: true });
    }); // make sure it's reenabled
  }

  function newPressed() {
    console.log('new pressed');

    paper.project.activeLayer.removeChildren();
  }

  function undoPressed() {
    console.log('undo pressed');
    if (!(MOVES.length > 0)) {
      console.log('no moves yet');
      return;
    }

    var lastMove = MOVES.pop();
    var item = project.getItem({
      id: lastMove.id
    });

    if (item) {
      switch (lastMove.type) {
        case 'newGroup':
          console.log('removing group');
          item.remove();
          break;
        case 'fillChange':
          if (lastMove.transparent) {
            item.fillColor = lastMove.fill;
            item.strokeColor = lastMove.fill;
          } else {
            item.fillColor = transparent;
            item.strokeColor = transparent;
          }
        case 'transform':
          if (!!lastMove.position) {
            item.position = lastMove.position;
          }
          if (!!lastMove.rotation) {
            item.rotation = lastMove.rotation;
          }
          // if (!!lastMove.scale) {
          //   item.scale //???
          // }
          break;
        default:
          console.log('unknown case');
      }
    } else {
      console.log('could not find matching item');
    }

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

  function drawCircle() {
    new Path.Circle({
      center: [400, 400],
      radius: 100,
      strokeColor: 'green',
      fillColor: 'green'
    });
  }

  function main() {
    initControlPanel();
    drawCircle();
  }

  main();
});

},{"./util":2}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rad = rad;
exports.deg = deg;
exports.delta = delta;
exports.findInteriorCurves = findInteriorCurves;
exports.trueGroup = trueGroup;
exports.truePath = truePath;
// Converts from degrees to radians.
function rad(degrees) {
  return degrees * Math.PI / 180;
};

// Converts from radians to degrees.
function deg(radians) {
  return radians * 180 / Math.PI;
};

// distance between two points
function delta(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)); // pythagorean!
}

// returns an array of the interior curves of a given compound path
function findInteriorCurves(path) {
  var interiorCurves = [];
  if (!path || !path.children || !path.children.length) return;

  for (var i = 0; i < path.children.length; i++) {
    var child = path.children[i];

    if (child.closed) {
      interiorCurves.push(new Path(child.segments));
    }
  }

  path.remove();
  return interiorCurves;
}

function trueGroup(group) {
  var bounds = group._namedChildren.bounds[0],
      middle = group._namedChildren.middle[0];

  var middleCopy = new Path();
  middleCopy.copyContent(middle);
  middleCopy.visible = false;
  var dividedPath = middleCopy.resolveCrossings();
  dividedPath.visible = false;
  Base.each(dividedPath.children, function (child, i) {
    if (child.closed) {
      child.selected = false;
    } else {
      child.selected = true;
    }
    console.log(child, i);
  });
}

function truePath(path) {
  console.log(group);
  // if (path && path.children && path.children.length > 0 && path._namedChildren['middle']) {
  //   let pathCopy = new Path();
  //   console.log(path._namedChildren['middle']);
  //   pathCopy.copyContent(path._namedChildren['middle']);
  //   console.log(pathCopy);
  // }
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxPQUFPLEdBQVAsR0FBYSxPQUFPLEdBQVAsSUFBYztBQUN6QixXQUFTLENBQUMsU0FBRCxFQUFZLFNBQVosRUFBdUIsU0FBdkIsRUFBa0MsU0FBbEMsRUFBNkMsU0FBN0MsRUFBd0QsU0FBeEQsRUFBbUUsU0FBbkUsRUFBOEUsU0FBOUUsRUFBeUYsU0FBekYsRUFBb0csU0FBcEcsRUFBK0csU0FBL0csRUFBMEgsU0FBMUgsRUFBcUksU0FBckksRUFBZ0osU0FBaEosRUFBMkosU0FBM0osRUFBc0ssU0FBdEssQ0FEZ0I7QUFFekIsZ0JBQWMsU0FGVztBQUd6QixZQUFVLEVBSGU7QUFJekIsU0FBTztBQUprQixDQUEzQjs7QUFPQSxNQUFNLE9BQU4sQ0FBYyxNQUFkOztBQUVBLElBQU0sT0FBTyxRQUFRLFFBQVIsQ0FBYjtBQUNBOztBQUVBLEVBQUUsUUFBRixFQUFZLEtBQVosQ0FBa0IsWUFBVztBQUMzQixNQUFJLFFBQVEsRUFBWixDQUQyQixDQUNYO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxNQUFNLFVBQVUsRUFBRSxNQUFGLENBQWhCO0FBQ0EsTUFBTSxRQUFRLEVBQUUsTUFBRixDQUFkO0FBQ0EsTUFBTSxVQUFVLEVBQUUsbUJBQUYsQ0FBaEI7QUFDQSxNQUFNLGdCQUFnQixLQUF0QjtBQUNBLE1BQU0sY0FBYyxJQUFJLEtBQUosQ0FBVSxDQUFWLEVBQWEsQ0FBYixDQUFwQjs7QUFFQSxXQUFTLGdCQUFULEdBQTRCO0FBQzFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Q7O0FBRUQsV0FBUyxnQkFBVCxHQUE0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QUFDRDtBQUNELFlBQVEsR0FBUixDQUFZLEtBQVosRUFBbUIsQ0FBbkI7QUFDRCxHQVBEO0FBUUQ7O0FBRU0sU0FBUyxRQUFULENBQWtCLElBQWxCLEVBQXdCO0FBQzdCLFVBQVEsR0FBUixDQUFZLEtBQVo7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ3aW5kb3cua2FuID0gd2luZG93LmthbiB8fCB7XG4gIHBhbGV0dGU6IFtcIiMyMDE3MUNcIiwgXCIjMUUyQTQzXCIsIFwiIzI4Mzc3RFwiLCBcIiMzNTI3NDdcIiwgXCIjRjI4NUE1XCIsIFwiI0NBMkUyNlwiLCBcIiNCODQ1MjZcIiwgXCIjREE2QzI2XCIsIFwiIzQ1MzEyMVwiLCBcIiM5MTZBNDdcIiwgXCIjRUVCNjQxXCIsIFwiI0Y2RUIxNlwiLCBcIiM3RjdEMzFcIiwgXCIjNkVBRDc5XCIsIFwiIzJBNDYyMVwiLCBcIiNGNEVBRTBcIl0sXG4gIGN1cnJlbnRDb2xvcjogJyMyMDE3MUMnLFxuICBudW1QYXRoczogMTAsXG4gIHBhdGhzOiBbXSxcbn07XG5cbnBhcGVyLmluc3RhbGwod2luZG93KTtcblxuY29uc3QgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuLy8gcmVxdWlyZSgncGFwZXItYW5pbWF0ZScpO1xuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgbGV0IE1PVkVTID0gW107IC8vIHN0b3JlIGdsb2JhbCBtb3ZlcyBsaXN0XG4gIC8vIG1vdmVzID0gW1xuICAvLyAgIHtcbiAgLy8gICAgICd0eXBlJzogJ2NvbG9yQ2hhbmdlJyxcbiAgLy8gICAgICdvbGQnOiAnIzIwMTcxQycsXG4gIC8vICAgICAnbmV3JzogJyNGMjg1QTUnXG4gIC8vICAgfSxcbiAgLy8gICB7XG4gIC8vICAgICAndHlwZSc6ICduZXdQYXRoJyxcbiAgLy8gICAgICdyZWYnOiAnPz8/JyAvLyB1dWlkPyBkb20gcmVmZXJlbmNlP1xuICAvLyAgIH0sXG4gIC8vICAge1xuICAvLyAgICAgJ3R5cGUnOiAncGF0aFRyYW5zZm9ybScsXG4gIC8vICAgICAncmVmJzogJz8/PycsIC8vIHV1aWQ/IGRvbSByZWZlcmVuY2U/XG4gIC8vICAgICAnb2xkJzogJ3JvdGF0ZSg5MGRlZylzY2FsZSgxLjUpJywgLy8gPz8/XG4gIC8vICAgICAnbmV3JzogJ3JvdGF0ZSgxMjBkZWcpc2NhbGUoLTAuNSknIC8vID8/P1xuICAvLyAgIH0sXG4gIC8vICAgLy8gb3RoZXJzP1xuICAvLyBdXG5cbiAgY29uc3QgJHdpbmRvdyA9ICQod2luZG93KTtcbiAgY29uc3QgJGJvZHkgPSAkKCdib2R5Jyk7XG4gIGNvbnN0ICRjYW52YXMgPSAkKCdjYW52YXMjbWFpbkNhbnZhcycpO1xuICBjb25zdCBydW5BbmltYXRpb25zID0gZmFsc2U7XG4gIGNvbnN0IHRyYW5zcGFyZW50ID0gbmV3IENvbG9yKDAsIDApO1xuXG4gIGZ1bmN0aW9uIGluaXRDb250cm9sUGFuZWwoKSB7XG4gICAgaW5pdENvbG9yUGFsZXR0ZSgpO1xuICAgIGluaXRDYW52YXNEcmF3KCk7XG4gICAgaW5pdE5ldygpO1xuICAgIGluaXRVbmRvKCk7XG4gICAgaW5pdFBsYXkoKTtcbiAgICBpbml0VGlwcygpO1xuICAgIGluaXRTaGFyZSgpO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdENvbG9yUGFsZXR0ZSgpIHtcbiAgICBjb25zdCAkcGFsZXR0ZVdyYXAgPSAkKCd1bC5wYWxldHRlLWNvbG9ycycpO1xuICAgIGNvbnN0ICRwYWxldHRlQ29sb3JzID0gJHBhbGV0dGVXcmFwLmZpbmQoJ2xpJyk7XG4gICAgY29uc3QgcGFsZXR0ZUNvbG9yU2l6ZSA9IDIwO1xuICAgIGNvbnN0IHBhbGV0dGVTZWxlY3RlZENvbG9yU2l6ZSA9IDMwO1xuICAgIGNvbnN0IHBhbGV0dGVTZWxlY3RlZENsYXNzID0gJ3BhbGV0dGUtc2VsZWN0ZWQnO1xuXG4gICAgLy8gaG9vayB1cCBjbGlja1xuICAgICAgJHBhbGV0dGVDb2xvcnMub24oJ2NsaWNrIHRhcCB0b3VjaCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGxldCAkc3ZnID0gJCh0aGlzKS5maW5kKCdzdmcucGFsZXR0ZS1jb2xvcicpO1xuXG4gICAgICAgICAgaWYgKCEkc3ZnLmhhc0NsYXNzKHBhbGV0dGVTZWxlY3RlZENsYXNzKSkge1xuICAgICAgICAgICAgJCgnLicgKyBwYWxldHRlU2VsZWN0ZWRDbGFzcylcbiAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKHBhbGV0dGVTZWxlY3RlZENsYXNzKVxuICAgICAgICAgICAgICAuYXR0cignd2lkdGgnLCBwYWxldHRlQ29sb3JTaXplKVxuICAgICAgICAgICAgICAuYXR0cignaGVpZ2h0JywgcGFsZXR0ZUNvbG9yU2l6ZSlcbiAgICAgICAgICAgICAgLmZpbmQoJ3JlY3QnKVxuICAgICAgICAgICAgICAuYXR0cigncngnLCAwKVxuICAgICAgICAgICAgICAuYXR0cigncnknLCAwKTtcblxuICAgICAgICAgICAgJHN2Zy5hZGRDbGFzcyhwYWxldHRlU2VsZWN0ZWRDbGFzcylcbiAgICAgICAgICAgICAgLmF0dHIoJ3dpZHRoJywgcGFsZXR0ZVNlbGVjdGVkQ29sb3JTaXplKVxuICAgICAgICAgICAgICAuYXR0cignaGVpZ2h0JywgcGFsZXR0ZVNlbGVjdGVkQ29sb3JTaXplKVxuICAgICAgICAgICAgICAuZmluZCgncmVjdCcpXG4gICAgICAgICAgICAgIC5hdHRyKCdyeCcsIHBhbGV0dGVTZWxlY3RlZENvbG9yU2l6ZSAvIDIpXG4gICAgICAgICAgICAgIC5hdHRyKCdyeScsIHBhbGV0dGVTZWxlY3RlZENvbG9yU2l6ZSAvIDIpXG5cbiAgICAgICAgICAgIHdpbmRvdy5rYW4uY3VycmVudENvbG9yID0gJHN2Zy5maW5kKCdyZWN0JykuYXR0cignZmlsbCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0Q2FudmFzRHJhdygpIHtcblxuICAgIHBhcGVyLnNldHVwKCRjYW52YXNbMF0pO1xuXG4gICAgbGV0IG1pZGRsZSwgYm91bmRzO1xuICAgIGxldCBwYXN0O1xuICAgIGxldCBzaXplcztcbiAgICAvLyBsZXQgcGF0aHMgPSBnZXRGcmVzaFBhdGhzKHdpbmRvdy5rYW4ubnVtUGF0aHMpO1xuICAgIGxldCB0b3VjaCA9IGZhbHNlO1xuICAgIGxldCBsYXN0Q2hpbGQ7XG5cbiAgICBmdW5jdGlvbiBwYW5TdGFydChldmVudCkge1xuICAgICAgcGFwZXIucHJvamVjdC5hY3RpdmVMYXllci5yZW1vdmVDaGlsZHJlbigpOyAvLyBSRU1PVkVcbiAgICAgIGRyYXdDaXJjbGUoKTtcblxuICAgICAgc2l6ZXMgPSBbXTtcblxuICAgICAgaWYgKHBpbmNoaW5nKSByZXR1cm47XG4gICAgICBpZiAoIShldmVudC5jaGFuZ2VkUG9pbnRlcnMgJiYgZXZlbnQuY2hhbmdlZFBvaW50ZXJzLmxlbmd0aCA+IDApKSByZXR1cm47XG4gICAgICBpZiAoZXZlbnQuY2hhbmdlZFBvaW50ZXJzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2V2ZW50LmNoYW5nZWRQb2ludGVycyA+IDEnKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcG9pbnRlciA9IGV2ZW50LmNlbnRlcjtcbiAgICAgIGNvbnN0IHBvaW50ID0gbmV3IFBvaW50KHBvaW50ZXIueCwgcG9pbnRlci55KTtcblxuICAgICAgYm91bmRzID0gbmV3IFBhdGgoe1xuICAgICAgICBzdHJva2VDb2xvcjogd2luZG93Lmthbi5jdXJyZW50Q29sb3IsXG4gICAgICAgIGZpbGxDb2xvcjogd2luZG93Lmthbi5jdXJyZW50Q29sb3IsXG4gICAgICAgIG5hbWU6ICdib3VuZHMnLFxuICAgICAgfSk7XG5cbiAgICAgIG1pZGRsZSA9IG5ldyBQYXRoKHtcbiAgICAgICAgc3Ryb2tlQ29sb3I6IHdpbmRvdy5rYW4uY3VycmVudENvbG9yLFxuICAgICAgICBuYW1lOiAnbWlkZGxlJyxcbiAgICAgICAgc3Ryb2tlV2lkdGg6IDEsXG4gICAgICAgIHZpc2libGU6IGZhbHNlXG4gICAgICB9KTtcblxuICAgICAgYm91bmRzLmFkZChwb2ludCk7XG4gICAgICBtaWRkbGUuYWRkKHBvaW50KTtcbiAgICB9XG5cbiAgICBjb25zdCBtaW4gPSAwO1xuICAgIGNvbnN0IG1heCA9IDIwO1xuICAgIGNvbnN0IGFscGhhID0gMC4zO1xuICAgIGNvbnN0IG1lbW9yeSA9IDEwO1xuICAgIHZhciBjdW1EaXN0YW5jZSA9IDA7XG4gICAgbGV0IGN1bVNpemUsIGF2Z1NpemU7XG4gICAgZnVuY3Rpb24gcGFuTW92ZShldmVudCkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGlmIChwaW5jaGluZykgcmV0dXJuO1xuICAgICAgLy8gY29uc29sZS5sb2coZXZlbnQub3ZlcmFsbFZlbG9jaXR5KTtcbiAgICAgIC8vIGxldCB0aGlzRGlzdCA9IHBhcnNlSW50KGV2ZW50LmRpc3RhbmNlKTtcbiAgICAgIC8vIGN1bURpc3RhbmNlICs9IHRoaXNEaXN0O1xuICAgICAgLy9cbiAgICAgIC8vIGlmIChjdW1EaXN0YW5jZSA8IDEwMCkge1xuICAgICAgLy8gICBjb25zb2xlLmxvZygnaWdub3JpbmcnKTtcbiAgICAgIC8vICAgcmV0dXJuO1xuICAgICAgLy8gfSBlbHNlIHtcbiAgICAgIC8vICAgY3VtRGlzdGFuY2UgPSAwO1xuICAgICAgLy8gICBjb25zb2xlLmxvZygnbm90IGlnbm9yaW5nJyk7XG4gICAgICAvLyB9XG5cbiAgICAgIGNvbnN0IHBvaW50ZXIgPSBldmVudC5jZW50ZXI7XG4gICAgICBjb25zdCBwb2ludCA9IG5ldyBQb2ludChwb2ludGVyLngsIHBvaW50ZXIueSk7XG5cbiAgICAgIHdoaWxlIChzaXplcy5sZW5ndGggPiBtZW1vcnkpIHtcbiAgICAgICAgc2l6ZXMuc2hpZnQoKTtcbiAgICAgIH1cblxuICAgICAgbGV0IGJvdHRvbVgsIGJvdHRvbVksIGJvdHRvbSxcbiAgICAgICAgdG9wWCwgdG9wWSwgdG9wLFxuICAgICAgICBwMCwgcDEsXG4gICAgICAgIHN0ZXAsIGFuZ2xlLCBkaXN0LCBzaXplO1xuXG4gICAgICBpZiAoc2l6ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAvLyBub3QgdGhlIGZpcnN0IHBvaW50LCBzbyB3ZSBoYXZlIG90aGVycyB0byBjb21wYXJlIHRvXG4gICAgICAgIHAwID0gcGFzdDtcbiAgICAgICAgZGlzdCA9IHV0aWwuZGVsdGEocG9pbnQsIHAwKTtcbiAgICAgICAgc2l6ZSA9IGRpc3QgKiBhbHBoYTtcbiAgICAgICAgaWYgKHNpemUgPj0gbWF4KSBzaXplID0gbWF4O1xuICAgICAgICAvLyBzaXplID0gTWF0aC5tYXgoTWF0aC5taW4oc2l6ZSwgbWF4KSwgbWluKTsgLy8gY2xhbXAgc2l6ZSB0byBbbWluLCBtYXhdXG4gICAgICAgIC8vIHNpemUgPSBtYXggLSBzaXplO1xuXG4gICAgICAgIGN1bVNpemUgPSAwO1xuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHNpemVzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgY3VtU2l6ZSArPSBzaXplc1tqXTtcbiAgICAgICAgfVxuICAgICAgICBhdmdTaXplID0gTWF0aC5yb3VuZCgoKGN1bVNpemUgLyBzaXplcy5sZW5ndGgpICsgc2l6ZSkgLyAyKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coYXZnU2l6ZSk7XG5cbiAgICAgICAgYW5nbGUgPSBNYXRoLmF0YW4yKHBvaW50LnkgLSBwMC55LCBwb2ludC54IC0gcDAueCk7IC8vIHJhZFxuXG4gICAgICAgIC8vIFBvaW50KGJvdHRvbVgsIGJvdHRvbVkpIGlzIGJvdHRvbSwgUG9pbnQodG9wWCwgdG9wWSkgaXMgdG9wXG4gICAgICAgIGJvdHRvbVggPSBwb2ludC54ICsgTWF0aC5jb3MoYW5nbGUgKyBNYXRoLlBJLzIpICogYXZnU2l6ZTtcbiAgICAgICAgYm90dG9tWSA9IHBvaW50LnkgKyBNYXRoLnNpbihhbmdsZSArIE1hdGguUEkvMikgKiBhdmdTaXplO1xuICAgICAgICBib3R0b20gPSBuZXcgUG9pbnQoYm90dG9tWCwgYm90dG9tWSk7XG5cbiAgICAgICAgdG9wWCA9IHBvaW50LnggKyBNYXRoLmNvcyhhbmdsZSAtIE1hdGguUEkvMikgKiBhdmdTaXplO1xuICAgICAgICB0b3BZID0gcG9pbnQueSArIE1hdGguc2luKGFuZ2xlIC0gTWF0aC5QSS8yKSAqIGF2Z1NpemU7XG4gICAgICAgIHRvcCA9IG5ldyBQb2ludCh0b3BYLCB0b3BZKTtcblxuICAgICAgICBib3VuZHMuYWRkKHRvcCk7XG4gICAgICAgIGJvdW5kcy5pbnNlcnQoMCwgYm90dG9tKTtcbiAgICAgICAgLy8gYm91bmRzLnNtb290aCgpO1xuXG4gICAgICAgIG1pZGRsZS5hZGQocG9pbnQpO1xuICAgICAgICAvLyBtaWRkbGUuc21vb3RoKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBkb24ndCBoYXZlIGFueXRoaW5nIHRvIGNvbXBhcmUgdG9cbiAgICAgICAgZGlzdCA9IDE7XG4gICAgICAgIGFuZ2xlID0gMDtcblxuICAgICAgICBzaXplID0gZGlzdCAqIGFscGhhO1xuICAgICAgICBzaXplID0gTWF0aC5tYXgoTWF0aC5taW4oc2l6ZSwgbWF4KSwgbWluKTsgLy8gY2xhbXAgc2l6ZSB0byBbbWluLCBtYXhdXG4gICAgICB9XG5cbiAgICAgIHBhcGVyLnZpZXcuZHJhdygpO1xuXG4gICAgICBwYXN0ID0gcG9pbnQ7XG4gICAgICBzaXplcy5wdXNoKHNpemUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhbkVuZChldmVudCkge1xuICAgICAgZWxhc3RpY2l0eSA9IDE7XG4gICAgICBpZiAocGluY2hpbmcpIHJldHVybjtcblxuICAgICAgY29uc3QgcG9pbnRlciA9IGV2ZW50LmNlbnRlcjtcbiAgICAgIGNvbnN0IHBvaW50ID0gbmV3IFBvaW50KHBvaW50ZXIueCwgcG9pbnRlci55KTtcblxuICAgICAgY29uc3QgZ3JvdXAgPSBuZXcgR3JvdXAoW2JvdW5kcywgbWlkZGxlXSk7XG5cbiAgICAgIGJvdW5kcy5hZGQocG9pbnQpO1xuICAgICAgYm91bmRzLmZsYXR0ZW4oNCk7XG4gICAgICBib3VuZHMuc21vb3RoKCk7XG4gICAgICBib3VuZHMuc2ltcGxpZnkoKTtcbiAgICAgIGJvdW5kcy5jbG9zZWQgPSB0cnVlO1xuXG4gICAgICBtaWRkbGUuYWRkKHBvaW50KTtcbiAgICAgIG1pZGRsZS5mbGF0dGVuKDQpO1xuICAgICAgbWlkZGxlLnNtb290aCgpO1xuICAgICAgbWlkZGxlLnNpbXBsaWZ5KCk7XG5cbiAgICAgIC8vIHV0aWwudHJ1ZUdyb3VwKGdyb3VwKTtcblxuICAgICAgbGV0IGludGVyc2VjdGlvbnMgPSBtaWRkbGUuZ2V0Q3Jvc3NpbmdzKCk7XG4gICAgICBpZiAoaW50ZXJzZWN0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgIC8vIHdlIGNyZWF0ZSBhIGNvcHkgb2YgdGhlIHBhdGggYmVjYXVzZSByZXNvbHZlQ3Jvc3NpbmdzKCkgc3BsaXRzIHNvdXJjZSBwYXRoXG4gICAgICAgIGxldCBwYXRoQ29weSA9IG5ldyBQYXRoKCk7XG4gICAgICAgIHBhdGhDb3B5LmNvcHlDb250ZW50KG1pZGRsZSk7XG4gICAgICAgIHBhdGhDb3B5LnZpc2libGUgPSBmYWxzZTtcblxuICAgICAgICBsZXQgZGl2aWRlZFBhdGggPSBwYXRoQ29weS5yZXNvbHZlQ3Jvc3NpbmdzKCk7XG4gICAgICAgIGRpdmlkZWRQYXRoLnZpc2libGUgPSBmYWxzZTtcblxuXG4gICAgICAgIGxldCBlbmNsb3NlZExvb3BzID0gdXRpbC5maW5kSW50ZXJpb3JDdXJ2ZXMoZGl2aWRlZFBhdGgpO1xuXG4gICAgICAgIGlmIChlbmNsb3NlZExvb3BzKSB7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbmNsb3NlZExvb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBlbmNsb3NlZExvb3BzW2ldLnZpc2libGUgPSB0cnVlO1xuICAgICAgICAgICAgZW5jbG9zZWRMb29wc1tpXS5jbG9zZWQgPSB0cnVlO1xuICAgICAgICAgICAgZW5jbG9zZWRMb29wc1tpXS5maWxsQ29sb3IgPSBuZXcgQ29sb3IoMCwgMCk7IC8vIHRyYW5zcGFyZW50XG4gICAgICAgICAgICBlbmNsb3NlZExvb3BzW2ldLmRhdGEuaW50ZXJpb3IgPSB0cnVlO1xuICAgICAgICAgICAgZW5jbG9zZWRMb29wc1tpXS5kYXRhLnRyYW5zcGFyZW50ID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vIGVuY2xvc2VkTG9vcHNbaV0uYmxlbmRNb2RlID0gJ211bHRpcGx5JztcbiAgICAgICAgICAgIGdyb3VwLmFkZENoaWxkKGVuY2xvc2VkTG9vcHNbaV0pO1xuICAgICAgICAgICAgZW5jbG9zZWRMb29wc1tpXS5zZW5kVG9CYWNrKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHBhdGhDb3B5LnJlbW92ZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ25vIGludGVyc2VjdGlvbnMnKTtcbiAgICAgIH1cblxuICAgICAgZ3JvdXAuZGF0YS5jb2xvciA9IGJvdW5kcy5maWxsQ29sb3I7XG4gICAgICAvLyBjb25zb2xlLmxvZyhncm91cC5yb3RhdGlvbik7XG4gICAgICBsYXN0Q2hpbGQgPSBncm91cDtcbiAgICAgIGNvbnNvbGUubG9nKGdyb3VwKTtcblxuICAgICAgLy8gbGV0IHVuaXRlZEdyb3VwSWRzID0gW3BhcGVyLnByb2plY3QuYWN0aXZlTGF5ZXIuaWQsIGdyb3VwLmlkXTtcbiAgICAgIC8vIGdyb3VwLmNoaWxkcmVuLm1hcChmdW5jdGlvbihlbCkge1xuICAgICAgLy8gICB1bml0ZWRHcm91cElkcy5wdXNoKGVsLmlkKTtcbiAgICAgIC8vIH0pO1xuICAgICAgLy8gY29uc29sZS5sb2coJ3VuaXRlZEdyb3VwSWRzJywgdW5pdGVkR3JvdXBJZHMpO1xuXG5cbiAgICAgIC8vIGxldCB1bml0ZWRHcm91cCA9IGdyb3VwLmNoaWxkcmVuLnJlZHVjZShmdW5jdGlvbihhLCBiKSB7XG4gICAgICAvLyAgIHJldHVybiBhLnVuaXRlKGIpO1xuICAgICAgLy8gfSwgbmV3IFBhdGgoe1xuICAgICAgLy8gICBmaWxsQ29sb3I6ICdwaW5rJyxcbiAgICAgIC8vICAgc3Ryb2tlV2lkdGg6IDEsXG4gICAgICAvLyAgIHN0cm9rZUNvbG9yOiAncGluaycsXG4gICAgICAvLyAgIGZpbGxSdWxlOiAnZXZlbm9kZCdcbiAgICAgIC8vIH0pKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCd1bml0ZWRHcm91cCcsIHVuaXRlZEdyb3VwKTtcbiAgICAgIC8vXG4gICAgICAvLyB1bml0ZWRHcm91cC5zZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgLy8gdW5pdGVkR3JvdXAudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgLy8gLy8gZ3JvdXAuc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgLy9cbiAgICAgIC8vIGxldCBuZWlnaGJvcnMgPSBwcm9qZWN0LmdldEl0ZW1zKHtcbiAgICAgIC8vICAgb3ZlcmxhcHBpbmc6IHVuaXRlZEdyb3VwLnN0cm9rZUJvdW5kcyxcbiAgICAgIC8vICAgbWF0Y2g6IGZ1bmN0aW9uKGVsKSB7XG4gICAgICAvLyAgICAgcmV0dXJuIHVuaXRlZEdyb3VwSWRzLmluY2x1ZGVzKGVsLmlkKTtcbiAgICAgIC8vICAgfVxuICAgICAgLy8gfSk7XG4gICAgICAvLyBpZiAobmVpZ2hib3JzLmxlbmd0aCA+IDApIHtcbiAgICAgIC8vICAgY29uc29sZS5sb2coJ25laWdoYm9ycycsIG5laWdoYm9ycyk7XG4gICAgICAvLyB9IGVsc2Uge1xuICAgICAgLy8gICBjb25zb2xlLmxvZygnbm8gbmVpZ2hib3JzJyk7XG4gICAgICAvLyB9XG4gICAgICAvLyBsZXQgcmVjdCA9IG5ldyBQYXRoLlJlY3RhbmdsZShncm91cC5zdHJva2VCb3VuZHMpO1xuICAgICAgLy8gcmVjdC5zdHJva2VDb2xvciA9ICdwaW5rJztcbiAgICAgIC8vIHJlY3Quc3Ryb2tlV2lkdGggPSAyO1xuXG4gICAgICBNT1ZFUy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ25ld0dyb3VwJyxcbiAgICAgICAgaWQ6IGdyb3VwLmlkXG4gICAgICB9KTtcblxuICAgICAgaWYgKHJ1bkFuaW1hdGlvbnMpIHtcbiAgICAgICAgZ3JvdXAuYW5pbWF0ZShcbiAgICAgICAgICBbe1xuICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICBzY2FsZTogMC45XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgICAgICAgZHVyYXRpb246IDEwMCxcbiAgICAgICAgICAgICAgZWFzaW5nOiBcImVhc2VPdXRcIixcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgc2NhbGU6IDEuMTFcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXR0aW5nczoge1xuICAgICAgICAgICAgICBkdXJhdGlvbjogMTAwLFxuICAgICAgICAgICAgICBlYXNpbmc6IFwiZWFzZUluXCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxldCBwaW5jaGluZztcbiAgICBsZXQgcGluY2hlZEdyb3VwLCBsYXN0U2NhbGUsIGxhc3RSb3RhdGlvbjtcbiAgICBsZXQgb3JpZ2luYWxQb3NpdGlvbiwgb3JpZ2luYWxSb3RhdGlvbjtcbiAgICBmdW5jdGlvbiBwaW5jaFN0YXJ0KGV2ZW50KSB7XG4gICAgICBjb25zb2xlLmxvZygncGluY2hzdGFydCcsIGV2ZW50KTtcbiAgICAgIGhhbW1lck1hbmFnZXIuZ2V0KCdwYW4nKS5zZXQoe2VuYWJsZTogZmFsc2V9KTtcbiAgICAgIGNvbnN0IHBvaW50ZXIgPSBldmVudC5jZW50ZXIsXG4gICAgICAgICAgcG9pbnQgPSBuZXcgUG9pbnQocG9pbnRlci54LCBwb2ludGVyLnkpLFxuICAgICAgICAgIGhpdFJlc3VsdCA9IHBhcGVyLnByb2plY3QuaGl0VGVzdChwb2ludCwgaGl0T3B0aW9ucyk7XG5cbiAgICAgIGlmIChoaXRSZXN1bHQpIHtcbiAgICAgICAgcGluY2hpbmcgPSB0cnVlO1xuICAgICAgICBwaW5jaGVkR3JvdXAgPSBoaXRSZXN1bHQuaXRlbS5wYXJlbnQ7XG4gICAgICAgIGxhc3RTY2FsZSA9IDE7XG4gICAgICAgIGxhc3RSb3RhdGlvbiA9IHBpbmNoZWRHcm91cC5yb3RhdGlvbjtcblxuICAgICAgICBvcmlnaW5hbFBvc2l0aW9uID0gcGluY2hlZEdyb3VwLnBvc2l0aW9uO1xuICAgICAgICBvcmlnaW5hbFJvdGF0aW9uID0gcGluY2hlZEdyb3VwLnJvdGF0aW9uO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdwaW5jaFN0YXJ0IGxhc3RTY2FsZTonLCBsYXN0U2NhbGUpO1xuICAgICAgICBpZiAocnVuQW5pbWF0aW9ucykge1xuICAgICAgICAgIHBpbmNoZWRHcm91cC5hbmltYXRlKHtcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgc2NhbGU6IDEuMjVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXR0aW5nczoge1xuICAgICAgICAgICAgICBkdXJhdGlvbjogMTAwLFxuICAgICAgICAgICAgICBlYXNpbmc6IFwiZWFzZU91dFwiLFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZygnaGl0IG5vIGl0ZW0nKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwaW5jaE1vdmUoZXZlbnQpIHtcbiAgICAgIGlmIChwaW5jaGVkR3JvdXApIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ3BpbmNobW92ZScsIGV2ZW50KTtcbiAgICAgICAgLy8gY29uc29sZS5sb2cocGluY2hlZEdyb3VwKTtcbiAgICAgICAgbGV0IGN1cnJlbnRTY2FsZSA9IGV2ZW50LnNjYWxlO1xuICAgICAgICBsZXQgc2NhbGVEZWx0YSA9IGN1cnJlbnRTY2FsZSAvIGxhc3RTY2FsZTtcbiAgICAgICAgLy8gY29uc29sZS5sb2cobGFzdFNjYWxlLCBjdXJyZW50U2NhbGUsIHNjYWxlRGVsdGEpO1xuICAgICAgICBsYXN0U2NhbGUgPSBjdXJyZW50U2NhbGU7XG5cbiAgICAgICAgbGV0IGN1cnJlbnRSb3RhdGlvbiA9IGV2ZW50LnJvdGF0aW9uO1xuICAgICAgICBsZXQgcm90YXRpb25EZWx0YSA9IGN1cnJlbnRSb3RhdGlvbiAtIGxhc3RSb3RhdGlvbjtcbiAgICAgICAgLy8gY29uc29sZS5sb2cobGFzdFJvdGF0aW9uLCBjdXJyZW50Um90YXRpb24sIHJvdGF0aW9uRGVsdGEpO1xuICAgICAgICBsYXN0Um90YXRpb24gPSBjdXJyZW50Um90YXRpb247XG5cbiAgICAgICAgLy8gY29uc29sZS5sb2coYHNjYWxpbmcgYnkgJHtzY2FsZURlbHRhfWApO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhgcm90YXRpbmcgYnkgJHtyb3RhdGlvbkRlbHRhfWApO1xuXG4gICAgICAgIHBpbmNoZWRHcm91cC5wb3NpdGlvbiA9IGV2ZW50LmNlbnRlcjtcbiAgICAgICAgcGluY2hlZEdyb3VwLnNjYWxlKHNjYWxlRGVsdGEpO1xuICAgICAgICBwaW5jaGVkR3JvdXAucm90YXRlKHJvdGF0aW9uRGVsdGEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBpbmNoRW5kKGV2ZW50KSB7XG4gICAgICBjb25zb2xlLmxvZygncGluY2hlbmQnLCBldmVudCk7XG4gICAgICAvLyB3YWl0IDI1MCBtcyB0byBwcmV2ZW50IG1pc3Rha2VuIHBhbiByZWFkaW5nc1xuICAgICAgaWYgKHBpbmNoZWRHcm91cCkge1xuICAgICAgICBsZXQgbW92ZSA9IHtcbiAgICAgICAgICBpZDogcGluY2hlZEdyb3VwLmlkLFxuICAgICAgICAgIHR5cGU6ICd0cmFuc2Zvcm0nXG4gICAgICAgIH07XG4gICAgICAgIGlmIChwaW5jaGVkR3JvdXAucG9zaXRpb24gIT0gb3JpZ2luYWxQb3NpdGlvbikge1xuICAgICAgICAgIG1vdmUucG9zaXRpb24gPSBvcmlnaW5hbFBvc2l0aW9uO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwaW5jaGVkR3JvdXAucm90YXRpb24gIT0gb3JpZ2luYWxSb3RhdGlvbikge1xuICAgICAgICAgIG1vdmUucm90YXRpb24gPSBvcmlnaW5hbFJvdGF0aW9uO1xuICAgICAgICB9XG4gICAgICAgIC8vIGlmIChwaW5jaGVkR3JvdXAuc2NhbGUgIT0gb3JpZ2luYWxTY2FsZSkge1xuICAgICAgICAvLyAgIG1vdmUuc2NhbGUgPSBvcmlnaW5hbFNjYWxlO1xuICAgICAgICAvLyB9XG4gICAgICAgIGNvbnNvbGUubG9nKCdwdXNoaW5nIG1vdmU6JywgbW92ZSk7XG4gICAgICAgIE1PVkVTLnB1c2gobW92ZSk7XG4gICAgICAgIGlmIChydW5BbmltYXRpb25zKSB7XG4gICAgICAgICAgcGluY2hlZEdyb3VwLmFuaW1hdGUoe1xuICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICBzY2FsZTogMC44XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgICAgICAgZHVyYXRpb246IDEwMCxcbiAgICAgICAgICAgICAgZWFzaW5nOiBcImVhc2VPdXRcIixcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcGluY2hpbmcgPSBmYWxzZTtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIGhhbW1lck1hbmFnZXIuZ2V0KCdwYW4nKS5zZXQoe2VuYWJsZTogdHJ1ZX0pO1xuICAgICAgfSwgMjUwKTtcbiAgICB9XG5cbiAgICBjb25zdCBoaXRPcHRpb25zID0ge1xuICAgICAgc2VnbWVudHM6IGZhbHNlLFxuICAgICAgc3Ryb2tlOiB0cnVlLFxuICAgICAgZmlsbDogdHJ1ZSxcbiAgICAgIHRvbGVyYW5jZTogNVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBzaW5nbGVUYXAoZXZlbnQpIHtcbiAgICAgIGNvbnN0IHBvaW50ZXIgPSBldmVudC5jZW50ZXIsXG4gICAgICAgICAgcG9pbnQgPSBuZXcgUG9pbnQocG9pbnRlci54LCBwb2ludGVyLnkpLFxuICAgICAgICAgIGhpdFJlc3VsdCA9IHBhcGVyLnByb2plY3QuaGl0VGVzdChwb2ludCwgaGl0T3B0aW9ucyk7XG5cbiAgICAgIGlmIChoaXRSZXN1bHQpIHtcbiAgICAgICAgbGV0IGl0ZW0gPSBoaXRSZXN1bHQuaXRlbTtcbiAgICAgICAgaXRlbS5zZWxlY3RlZCA9ICFpdGVtLnNlbGVjdGVkO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRvdWJsZVRhcChldmVudCkge1xuICAgICAgY29uc3QgcG9pbnRlciA9IGV2ZW50LmNlbnRlcixcbiAgICAgICAgICBwb2ludCA9IG5ldyBQb2ludChwb2ludGVyLngsIHBvaW50ZXIueSksXG4gICAgICAgICAgaGl0UmVzdWx0ID0gcGFwZXIucHJvamVjdC5oaXRUZXN0KHBvaW50LCBoaXRPcHRpb25zKTtcblxuICAgICAgaWYgKGhpdFJlc3VsdCkge1xuICAgICAgICBsZXQgaXRlbSA9IGhpdFJlc3VsdC5pdGVtO1xuICAgICAgICBsZXQgcGFyZW50ID0gaXRlbS5wYXJlbnQ7XG5cbiAgICAgICAgaWYgKGl0ZW0uZGF0YS5pbnRlcmlvcikge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdpbnRlcmlvcicpO1xuICAgICAgICAgIGl0ZW0uZGF0YS50cmFuc3BhcmVudCA9ICFpdGVtLmRhdGEudHJhbnNwYXJlbnQ7XG5cbiAgICAgICAgICBpZiAoaXRlbS5kYXRhLnRyYW5zcGFyZW50KSB7XG4gICAgICAgICAgICBpdGVtLmZpbGxDb2xvciA9IHRyYW5zcGFyZW50O1xuICAgICAgICAgICAgaXRlbS5zdHJva2VDb2xvciA9IHRyYW5zcGFyZW50O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpdGVtLmZpbGxDb2xvciA9IHBhcmVudC5kYXRhLmNvbG9yO1xuICAgICAgICAgICAgaXRlbS5zdHJva2VDb2xvciA9IHBhcmVudC5kYXRhLmNvbG9yO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIE1PVkVTLnB1c2goe1xuICAgICAgICAgICAgdHlwZTogJ2ZpbGxDaGFuZ2UnLFxuICAgICAgICAgICAgaWQ6IGl0ZW0uaWQsXG4gICAgICAgICAgICBmaWxsOiBwYXJlbnQuZGF0YS5jb2xvcixcbiAgICAgICAgICAgIHRyYW5zcGFyZW50OiBpdGVtLmRhdGEudHJhbnNwYXJlbnRcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnbm90IGludGVyaW9yJylcbiAgICAgICAgfVxuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZygnaGl0IG5vIGl0ZW0nKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyB2YXIgYW5pbWF0aW9uSWQ7XG4gICAgbGV0IGVsYXN0aWNpdHkgPSAwO1xuXG4gICAgZnVuY3Rpb24gYm91bmNlKGV2ZW50KSB7XG5cbiAgICAgIC8vIGNvbnNvbGUubG9nKHBhcGVyLnByb2plY3QuYWN0aXZlTGF5ZXIuZmlyc3RDaGlsZCk7XG4gICAgICAvLyBwYXBlci5wcm9qZWN0LmFjdGl2ZUxheWVyLmZpcnN0Q2hpbGQucm90YXRlKDMpO1xuICAgICAgaWYgKCEhbGFzdENoaWxkKSB7XG4gICAgICAgIGlmIChlbGFzdGljaXR5ID4gMCkge1xuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGxhc3RDaGlsZCk7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsYXN0Q2hpbGQuc2VnbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHNlZ21lbnQgPSBsYXN0Q2hpbGQuc2VnbWVudHNbaV07XG4gICAgICAgICAgICBjb25zdCB0aW1lQ29uc3QgPSAxNjtcbiAgICAgICAgICAgIGNvbnN0IGRpdkNvbnN0ID0gMjtcbiAgICAgICAgICAgIGNvbnN0IGNvcyA9IE1hdGguY29zKGV2ZW50LnRpbWUgKiB0aW1lQ29uc3QgKyBpKTtcbiAgICAgICAgICAgIGNvbnN0IHNpbiA9IE1hdGguc2luKGV2ZW50LnRpbWUgKiB0aW1lQ29uc3QgKyBpKTtcbiAgICAgICAgICAgIHNlZ21lbnQucG9pbnQueCArPSAoY29zIC8gZGl2Q29uc3QpICogZWxhc3RpY2l0eTtcbiAgICAgICAgICAgIHNlZ21lbnQucG9pbnQueSArPSAoc2luIC8gZGl2Q29uc3QpICogZWxhc3RpY2l0eTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGNvcywgc2luLCBlbGFzdGljaXR5KTtcbiAgICAgICAgICAgIGVsYXN0aWNpdHkgLT0gMC4wMDE7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBjb25zb2xlLmxvZygnbm8gY2hpbGRyZW4geWV0Jyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gcGFwZXIudmlldy5vbkZyYW1lID0gamlnZ2xlO1xuXG4gICAgdmFyIGhhbW1lck1hbmFnZXIgPSBuZXcgSGFtbWVyLk1hbmFnZXIoJGNhbnZhc1swXSk7XG5cbiAgICBoYW1tZXJNYW5hZ2VyLmFkZChuZXcgSGFtbWVyLlRhcCh7IGV2ZW50OiAnZG91YmxldGFwJywgdGFwczogMiB9KSk7XG4gICAgaGFtbWVyTWFuYWdlci5hZGQobmV3IEhhbW1lci5UYXAoeyBldmVudDogJ3NpbmdsZXRhcCcgfSkpO1xuICAgIGhhbW1lck1hbmFnZXIuYWRkKG5ldyBIYW1tZXIuUGFuKHsgZGlyZWN0aW9uOiBIYW1tZXIuRElSRUNUSU9OX0FMTCB9KSk7XG4gICAgaGFtbWVyTWFuYWdlci5hZGQobmV3IEhhbW1lci5QaW5jaCgpKTtcblxuICAgIGhhbW1lck1hbmFnZXIuZ2V0KCdkb3VibGV0YXAnKS5yZWNvZ25pemVXaXRoKCdzaW5nbGV0YXAnKTtcbiAgICBoYW1tZXJNYW5hZ2VyLmdldCgnc2luZ2xldGFwJykucmVxdWlyZUZhaWx1cmUoJ2RvdWJsZXRhcCcpO1xuICAgIGhhbW1lck1hbmFnZXIuZ2V0KCdwYW4nKS5yZXF1aXJlRmFpbHVyZSgncGluY2gnKTtcblxuICAgIGhhbW1lck1hbmFnZXIub24oJ3NpbmdsZXRhcCcsIHNpbmdsZVRhcCk7XG4gICAgaGFtbWVyTWFuYWdlci5vbignZG91YmxldGFwJywgZG91YmxlVGFwKTtcblxuICAgIGhhbW1lck1hbmFnZXIub24oJ3BhbnN0YXJ0JywgcGFuU3RhcnQpO1xuICAgIGhhbW1lck1hbmFnZXIub24oJ3Bhbm1vdmUnLCBwYW5Nb3ZlKTtcbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdwYW5lbmQnLCBwYW5FbmQpO1xuXG4gICAgaGFtbWVyTWFuYWdlci5vbigncGluY2hzdGFydCcsIHBpbmNoU3RhcnQpO1xuICAgIGhhbW1lck1hbmFnZXIub24oJ3BpbmNobW92ZScsIHBpbmNoTW92ZSk7XG4gICAgaGFtbWVyTWFuYWdlci5vbigncGluY2hlbmQnLCBwaW5jaEVuZCk7XG4gICAgaGFtbWVyTWFuYWdlci5vbigncGluY2hjYW5jZWwnLCBmdW5jdGlvbigpIHsgaGFtbWVyTWFuYWdlci5nZXQoJ3BhbicpLnNldCh7ZW5hYmxlOiB0cnVlfSk7IH0pOyAvLyBtYWtlIHN1cmUgaXQncyByZWVuYWJsZWRcbiAgfVxuXG4gIGZ1bmN0aW9uIG5ld1ByZXNzZWQoKSB7XG4gICAgY29uc29sZS5sb2coJ25ldyBwcmVzc2VkJyk7XG5cbiAgICBwYXBlci5wcm9qZWN0LmFjdGl2ZUxheWVyLnJlbW92ZUNoaWxkcmVuKCk7XG4gIH1cblxuICBmdW5jdGlvbiB1bmRvUHJlc3NlZCgpIHtcbiAgICBjb25zb2xlLmxvZygndW5kbyBwcmVzc2VkJyk7XG4gICAgaWYgKCEoTU9WRVMubGVuZ3RoID4gMCkpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdubyBtb3ZlcyB5ZXQnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgbGFzdE1vdmUgPSBNT1ZFUy5wb3AoKTtcbiAgICBsZXQgaXRlbSA9IHByb2plY3QuZ2V0SXRlbSh7XG4gICAgICBpZDogbGFzdE1vdmUuaWRcbiAgICB9KTtcblxuICAgIGlmIChpdGVtKSB7XG4gICAgICBzd2l0Y2gobGFzdE1vdmUudHlwZSkge1xuICAgICAgICBjYXNlICduZXdHcm91cCc6XG4gICAgICAgICAgY29uc29sZS5sb2coJ3JlbW92aW5nIGdyb3VwJyk7XG4gICAgICAgICAgaXRlbS5yZW1vdmUoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZmlsbENoYW5nZSc6XG4gICAgICAgICAgaWYgKGxhc3RNb3ZlLnRyYW5zcGFyZW50KSB7XG4gICAgICAgICAgICBpdGVtLmZpbGxDb2xvciA9IGxhc3RNb3ZlLmZpbGw7XG4gICAgICAgICAgICBpdGVtLnN0cm9rZUNvbG9yID0gbGFzdE1vdmUuZmlsbDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaXRlbS5maWxsQ29sb3IgPSB0cmFuc3BhcmVudDtcbiAgICAgICAgICAgIGl0ZW0uc3Ryb2tlQ29sb3IgPSB0cmFuc3BhcmVudDtcbiAgICAgICAgICB9XG4gICAgICAgIGNhc2UgJ3RyYW5zZm9ybSc6XG4gICAgICAgICAgaWYgKCEhbGFzdE1vdmUucG9zaXRpb24pIHtcbiAgICAgICAgICAgIGl0ZW0ucG9zaXRpb24gPSBsYXN0TW92ZS5wb3NpdGlvblxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoISFsYXN0TW92ZS5yb3RhdGlvbikge1xuICAgICAgICAgICAgaXRlbS5yb3RhdGlvbiA9IGxhc3RNb3ZlLnJvdGF0aW9uO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBpZiAoISFsYXN0TW92ZS5zY2FsZSkge1xuICAgICAgICAgIC8vICAgaXRlbS5zY2FsZSAvLz8/P1xuICAgICAgICAgIC8vIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBjb25zb2xlLmxvZygndW5rbm93biBjYXNlJyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKCdjb3VsZCBub3QgZmluZCBtYXRjaGluZyBpdGVtJyk7XG4gICAgfVxuXG4gICAgLy8gZDMuc2VsZWN0QWxsKCdzdmcubWFpbiBwYXRoOmxhc3QtY2hpbGQnKS5yZW1vdmUoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBsYXlQcmVzc2VkKCkge1xuICAgIGNvbnNvbGUubG9nKCdwbGF5IHByZXNzZWQnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRpcHNQcmVzc2VkKCkge1xuICAgIGNvbnNvbGUubG9nKCd0aXBzIHByZXNzZWQnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNoYXJlUHJlc3NlZCgpIHtcbiAgICBjb25zb2xlLmxvZygnc2hhcmUgcHJlc3NlZCcpO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdE5ldygpIHtcbiAgICAkKCcubWFpbi1jb250cm9scyAubmV3Jykub24oJ2NsaWNrIHRhcCB0b3VjaCcsIG5ld1ByZXNzZWQpO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdFVuZG8oKSB7XG4gICAgJCgnLm1haW4tY29udHJvbHMgLnVuZG8nKS5vbignY2xpY2snLCB1bmRvUHJlc3NlZCk7XG4gIH1cbiAgZnVuY3Rpb24gaW5pdFBsYXkoKSB7XG4gICAgJCgnLm1haW4tY29udHJvbHMgLnBsYXknKS5vbignY2xpY2snLCBwbGF5UHJlc3NlZCk7XG4gIH1cbiAgZnVuY3Rpb24gaW5pdFRpcHMoKSB7XG4gICAgJCgnLmF1eC1jb250cm9scyAudGlwcycpLm9uKCdjbGljaycsIHRpcHNQcmVzc2VkKTtcbiAgfVxuICBmdW5jdGlvbiBpbml0U2hhcmUoKSB7XG4gICAgJCgnLmF1eC1jb250cm9scyAuc2hhcmUnKS5vbignY2xpY2snLCBzaGFyZVByZXNzZWQpO1xuICB9XG5cbiAgZnVuY3Rpb24gZHJhd0NpcmNsZSgpIHtcbiAgICBuZXcgUGF0aC5DaXJjbGUoe1xuICAgICAgY2VudGVyOiBbNDAwLCA0MDBdLFxuICAgICAgcmFkaXVzOiAxMDAsXG4gICAgICBzdHJva2VDb2xvcjogJ2dyZWVuJyxcbiAgICAgIGZpbGxDb2xvcjogJ2dyZWVuJ1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gbWFpbigpIHtcbiAgICBpbml0Q29udHJvbFBhbmVsKCk7XG4gICAgZHJhd0NpcmNsZSgpO1xuICB9XG5cbiAgbWFpbigpO1xufSk7XG4iLCIvLyBDb252ZXJ0cyBmcm9tIGRlZ3JlZXMgdG8gcmFkaWFucy5cbmV4cG9ydCBmdW5jdGlvbiByYWQoZGVncmVlcykge1xuICByZXR1cm4gZGVncmVlcyAqIE1hdGguUEkgLyAxODA7XG59O1xuXG4vLyBDb252ZXJ0cyBmcm9tIHJhZGlhbnMgdG8gZGVncmVlcy5cbmV4cG9ydCBmdW5jdGlvbiBkZWcocmFkaWFucykge1xuICByZXR1cm4gcmFkaWFucyAqIDE4MCAvIE1hdGguUEk7XG59O1xuXG4vLyBkaXN0YW5jZSBiZXR3ZWVuIHR3byBwb2ludHNcbmV4cG9ydCBmdW5jdGlvbiBkZWx0YShwMSwgcDIpIHtcbiAgcmV0dXJuIE1hdGguc3FydChNYXRoLnBvdyhwMS54IC0gcDIueCwgMikgKyBNYXRoLnBvdyhwMS55IC0gcDIueSwgMikpOyAvLyBweXRoYWdvcmVhbiFcbn1cblxuLy8gcmV0dXJucyBhbiBhcnJheSBvZiB0aGUgaW50ZXJpb3IgY3VydmVzIG9mIGEgZ2l2ZW4gY29tcG91bmQgcGF0aFxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRJbnRlcmlvckN1cnZlcyhwYXRoKSB7XG4gIGxldCBpbnRlcmlvckN1cnZlcyA9IFtdO1xuICBpZiAoIXBhdGggfHwgIXBhdGguY2hpbGRyZW4gfHwgIXBhdGguY2hpbGRyZW4ubGVuZ3RoKSByZXR1cm47XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXRoLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IGNoaWxkID0gcGF0aC5jaGlsZHJlbltpXTtcblxuICAgIGlmIChjaGlsZC5jbG9zZWQpe1xuICAgICAgaW50ZXJpb3JDdXJ2ZXMucHVzaChuZXcgUGF0aChjaGlsZC5zZWdtZW50cykpO1xuICAgIH1cbiAgfVxuXG4gIHBhdGgucmVtb3ZlKCk7XG4gIHJldHVybiBpbnRlcmlvckN1cnZlcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRydWVHcm91cChncm91cCkge1xuICBsZXQgYm91bmRzID0gZ3JvdXAuX25hbWVkQ2hpbGRyZW4uYm91bmRzWzBdLFxuICAgICAgbWlkZGxlID0gZ3JvdXAuX25hbWVkQ2hpbGRyZW4ubWlkZGxlWzBdO1xuXG4gIGxldCBtaWRkbGVDb3B5ID0gbmV3IFBhdGgoKTtcbiAgbWlkZGxlQ29weS5jb3B5Q29udGVudChtaWRkbGUpO1xuICBtaWRkbGVDb3B5LnZpc2libGUgPSBmYWxzZTtcbiAgbGV0IGRpdmlkZWRQYXRoID0gbWlkZGxlQ29weS5yZXNvbHZlQ3Jvc3NpbmdzKCk7XG4gIGRpdmlkZWRQYXRoLnZpc2libGUgPSBmYWxzZTtcbiAgQmFzZS5lYWNoKGRpdmlkZWRQYXRoLmNoaWxkcmVuLCBmdW5jdGlvbihjaGlsZCwgaSkge1xuICAgIGlmIChjaGlsZC5jbG9zZWQpIHtcbiAgICAgIGNoaWxkLnNlbGVjdGVkID0gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNoaWxkLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICB9XG4gICAgY29uc29sZS5sb2coY2hpbGQsIGkpO1xuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJ1ZVBhdGgocGF0aCkge1xuICBjb25zb2xlLmxvZyhncm91cCk7XG4gIC8vIGlmIChwYXRoICYmIHBhdGguY2hpbGRyZW4gJiYgcGF0aC5jaGlsZHJlbi5sZW5ndGggPiAwICYmIHBhdGguX25hbWVkQ2hpbGRyZW5bJ21pZGRsZSddKSB7XG4gIC8vICAgbGV0IHBhdGhDb3B5ID0gbmV3IFBhdGgoKTtcbiAgLy8gICBjb25zb2xlLmxvZyhwYXRoLl9uYW1lZENoaWxkcmVuWydtaWRkbGUnXSk7XG4gIC8vICAgcGF0aENvcHkuY29weUNvbnRlbnQocGF0aC5fbmFtZWRDaGlsZHJlblsnbWlkZGxlJ10pO1xuICAvLyAgIGNvbnNvbGUubG9nKHBhdGhDb3B5KTtcbiAgLy8gfVxufVxuIl19
