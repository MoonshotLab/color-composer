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
  var runAnimations = true;
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
      // paper.project.activeLayer.removeChildren(); // REMOVE

      sizes = [];

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
        strokeWidth: 1
      });

      bounds.add(point);
      middle.add(point);
    }

    var threshold = 20;
    var alpha = 0.3;
    var memory = 10;
    var cumDistance = 0;
    var cumSize = void 0,
        avgSize = void 0;
    function panMove(event) {
      event.preventDefault();
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
        if (size >= threshold) size = threshold;
        // size = threshold - size;

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
        if (size >= threshold) size = threshold;
      }

      paper.view.draw();

      past = point;
      sizes.push(size);
    }

    function panEnd(event) {
      elasticity = 1;

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
      }

      group.data.color = bounds.fillColor;
      lastChild = group;
      // group.selected = true;

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

    var hitOptions = {
      segments: false,
      stroke: true,
      fill: true,
      tolerance: 5
    };

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
            type: 'fillChanged',
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

    hammerManager.add(new Hammer.Pan({ direction: Hammer.DIRECTION_ALL }));
    hammerManager.add(new Hammer.Tap({ event: 'doubletap', taps: 2 }));
    hammerManager.add(new Hammer.Tap({ event: 'singletap' }));

    hammerManager.on('panstart', panStart);
    hammerManager.on('panmove', panMove);
    hammerManager.on('panend', panEnd);

    hammerManager.get('doubletap').recognizeWith('singletap');
    hammerManager.get('singletap').requireFailure('doubletap');

    hammerManager.on('singletap', function () {
      console.log('singleTap');
    });

    hammerManager.on('doubletap', doubleTap);
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

    switch (lastMove.type) {
      case 'newGroup':
        var group = project.getItem({
          id: lastMove.id
        });
        if (group) {
          console.log('removing group');
          group.remove();
        } else {
          console.log('could not find matching group');
        }
        break;
      case 'fillChanged':
        var item = project.getItem({
          id: lastMove.id
        });

        if (lastMove.transparent) {
          item.fillColor = lastMove.fill;
          item.strokeColor = lastMove.fill;
        } else {
          item.fillColor = transparent;
          item.strokeColor = transparent;
        }

        break;
      default:
        console.log('unknown case');
    }
    console.log(lastMove);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxPQUFPLEdBQVAsR0FBYSxPQUFPLEdBQVAsSUFBYztBQUN6QixXQUFTLENBQUMsU0FBRCxFQUFZLFNBQVosRUFBdUIsU0FBdkIsRUFBa0MsU0FBbEMsRUFBNkMsU0FBN0MsRUFBd0QsU0FBeEQsRUFBbUUsU0FBbkUsRUFBOEUsU0FBOUUsRUFBeUYsU0FBekYsRUFBb0csU0FBcEcsRUFBK0csU0FBL0csRUFBMEgsU0FBMUgsRUFBcUksU0FBckksRUFBZ0osU0FBaEosRUFBMkosU0FBM0osRUFBc0ssU0FBdEssQ0FEZ0I7QUFFekIsZ0JBQWMsU0FGVztBQUd6QixZQUFVLEVBSGU7QUFJekIsU0FBTztBQUprQixDQUEzQjs7QUFPQSxNQUFNLE9BQU4sQ0FBYyxNQUFkOztBQUVBLElBQU0sT0FBTyxRQUFRLFFBQVIsQ0FBYjtBQUNBOztBQUVBLEVBQUUsUUFBRixFQUFZLEtBQVosQ0FBa0IsWUFBVztBQUMzQixNQUFJLFFBQVEsRUFBWixDQUQyQixDQUNYO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxNQUFNLFVBQVUsRUFBRSxNQUFGLENBQWhCO0FBQ0EsTUFBTSxRQUFRLEVBQUUsTUFBRixDQUFkO0FBQ0EsTUFBTSxVQUFVLEVBQUUsbUJBQUYsQ0FBaEI7QUFDQSxNQUFNLGdCQUFnQixJQUF0QjtBQUNBLE1BQU0sY0FBYyxJQUFJLEtBQUosQ0FBVSxDQUFWLEVBQWEsQ0FBYixDQUFwQjs7QUFFQSxXQUFTLGdCQUFULEdBQTRCO0FBQzFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Q7O0FBRUQsV0FBUyxnQkFBVCxHQUE0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QUFkLENBQVo7O0FBRUEsUUFBSSxNQUFNLE1BQVYsRUFBaUI7QUFDZixxQkFBZSxJQUFmLENBQW9CLElBQUksSUFBSixDQUFTLE1BQU0sUUFBZixDQUFwQjtBQUNEO0FBQ0Y7O0FBRUQsT0FBSyxNQUFMO0FBQ0EsU0FBTyxjQUFQO0FBQ0Q7O0FBRU0sU0FBUyxTQUFULENBQW1CLEtBQW5CLEVBQTBCO0FBQy9CLE1BQUksU0FBUyxNQUFNLGNBQU4sQ0FBcUIsTUFBckIsQ0FBNEIsQ0FBNUIsQ0FBYjtBQUFBLE1BQ0ksU0FBUyxNQUFNLGNBQU4sQ0FBcUIsTUFBckIsQ0FBNEIsQ0FBNUIsQ0FEYjs7QUFHQSxNQUFJLGFBQWEsSUFBSSxJQUFKLEVBQWpCO0FBQ0EsYUFBVyxXQUFYLENBQXVCLE1BQXZCO0FBQ0EsYUFBVyxPQUFYLEdBQXFCLEtBQXJCO0FBQ0EsTUFBSSxjQUFjLFdBQVcsZ0JBQVgsRUFBbEI7QUFDQSxjQUFZLE9BQVosR0FBc0IsS0FBdEI7QUFDQSxPQUFLLElBQUwsQ0FBVSxZQUFZLFFBQXRCLEVBQWdDLFVBQVMsS0FBVCxFQUFnQixDQUFoQixFQUFtQjtBQUNqRCxRQUFJLE1BQU0sTUFBVixFQUFrQjtBQUNoQixZQUFNLFFBQU4sR0FBaUIsS0FBakI7QUFDRCxLQUZELE1BRU87QUFDTCxZQUFNLFFBQU4sR0FBaUIsSUFBakI7QUFDRDtBQUNELFlBQVEsR0FBUixDQUFZLEtBQVosRUFBbUIsQ0FBbkI7QUFDRCxHQVBEO0FBUUQ7O0FBRU0sU0FBUyxRQUFULENBQWtCLElBQWxCLEVBQXdCO0FBQzdCLFVBQVEsR0FBUixDQUFZLEtBQVo7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ3aW5kb3cua2FuID0gd2luZG93LmthbiB8fCB7XG4gIHBhbGV0dGU6IFtcIiMyMDE3MUNcIiwgXCIjMUUyQTQzXCIsIFwiIzI4Mzc3RFwiLCBcIiMzNTI3NDdcIiwgXCIjRjI4NUE1XCIsIFwiI0NBMkUyNlwiLCBcIiNCODQ1MjZcIiwgXCIjREE2QzI2XCIsIFwiIzQ1MzEyMVwiLCBcIiM5MTZBNDdcIiwgXCIjRUVCNjQxXCIsIFwiI0Y2RUIxNlwiLCBcIiM3RjdEMzFcIiwgXCIjNkVBRDc5XCIsIFwiIzJBNDYyMVwiLCBcIiNGNEVBRTBcIl0sXG4gIGN1cnJlbnRDb2xvcjogJyMyMDE3MUMnLFxuICBudW1QYXRoczogMTAsXG4gIHBhdGhzOiBbXSxcbn07XG5cbnBhcGVyLmluc3RhbGwod2luZG93KTtcblxuY29uc3QgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuLy8gcmVxdWlyZSgncGFwZXItYW5pbWF0ZScpO1xuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgbGV0IE1PVkVTID0gW107IC8vIHN0b3JlIGdsb2JhbCBtb3ZlcyBsaXN0XG4gIC8vIG1vdmVzID0gW1xuICAvLyAgIHtcbiAgLy8gICAgICd0eXBlJzogJ2NvbG9yQ2hhbmdlJyxcbiAgLy8gICAgICdvbGQnOiAnIzIwMTcxQycsXG4gIC8vICAgICAnbmV3JzogJyNGMjg1QTUnXG4gIC8vICAgfSxcbiAgLy8gICB7XG4gIC8vICAgICAndHlwZSc6ICduZXdQYXRoJyxcbiAgLy8gICAgICdyZWYnOiAnPz8/JyAvLyB1dWlkPyBkb20gcmVmZXJlbmNlP1xuICAvLyAgIH0sXG4gIC8vICAge1xuICAvLyAgICAgJ3R5cGUnOiAncGF0aFRyYW5zZm9ybScsXG4gIC8vICAgICAncmVmJzogJz8/PycsIC8vIHV1aWQ/IGRvbSByZWZlcmVuY2U/XG4gIC8vICAgICAnb2xkJzogJ3JvdGF0ZSg5MGRlZylzY2FsZSgxLjUpJywgLy8gPz8/XG4gIC8vICAgICAnbmV3JzogJ3JvdGF0ZSgxMjBkZWcpc2NhbGUoLTAuNSknIC8vID8/P1xuICAvLyAgIH0sXG4gIC8vICAgLy8gb3RoZXJzP1xuICAvLyBdXG5cbiAgY29uc3QgJHdpbmRvdyA9ICQod2luZG93KTtcbiAgY29uc3QgJGJvZHkgPSAkKCdib2R5Jyk7XG4gIGNvbnN0ICRjYW52YXMgPSAkKCdjYW52YXMjbWFpbkNhbnZhcycpO1xuICBjb25zdCBydW5BbmltYXRpb25zID0gdHJ1ZTtcbiAgY29uc3QgdHJhbnNwYXJlbnQgPSBuZXcgQ29sb3IoMCwgMCk7XG5cbiAgZnVuY3Rpb24gaW5pdENvbnRyb2xQYW5lbCgpIHtcbiAgICBpbml0Q29sb3JQYWxldHRlKCk7XG4gICAgaW5pdENhbnZhc0RyYXcoKTtcbiAgICBpbml0TmV3KCk7XG4gICAgaW5pdFVuZG8oKTtcbiAgICBpbml0UGxheSgpO1xuICAgIGluaXRUaXBzKCk7XG4gICAgaW5pdFNoYXJlKCk7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0Q29sb3JQYWxldHRlKCkge1xuICAgIGNvbnN0ICRwYWxldHRlV3JhcCA9ICQoJ3VsLnBhbGV0dGUtY29sb3JzJyk7XG4gICAgY29uc3QgJHBhbGV0dGVDb2xvcnMgPSAkcGFsZXR0ZVdyYXAuZmluZCgnbGknKTtcbiAgICBjb25zdCBwYWxldHRlQ29sb3JTaXplID0gMjA7XG4gICAgY29uc3QgcGFsZXR0ZVNlbGVjdGVkQ29sb3JTaXplID0gMzA7XG4gICAgY29uc3QgcGFsZXR0ZVNlbGVjdGVkQ2xhc3MgPSAncGFsZXR0ZS1zZWxlY3RlZCc7XG5cbiAgICAvLyBob29rIHVwIGNsaWNrXG4gICAgICAkcGFsZXR0ZUNvbG9ycy5vbignY2xpY2sgdGFwIHRvdWNoJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgbGV0ICRzdmcgPSAkKHRoaXMpLmZpbmQoJ3N2Zy5wYWxldHRlLWNvbG9yJyk7XG5cbiAgICAgICAgICBpZiAoISRzdmcuaGFzQ2xhc3MocGFsZXR0ZVNlbGVjdGVkQ2xhc3MpKSB7XG4gICAgICAgICAgICAkKCcuJyArIHBhbGV0dGVTZWxlY3RlZENsYXNzKVxuICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MocGFsZXR0ZVNlbGVjdGVkQ2xhc3MpXG4gICAgICAgICAgICAgIC5hdHRyKCd3aWR0aCcsIHBhbGV0dGVDb2xvclNpemUpXG4gICAgICAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCBwYWxldHRlQ29sb3JTaXplKVxuICAgICAgICAgICAgICAuZmluZCgncmVjdCcpXG4gICAgICAgICAgICAgIC5hdHRyKCdyeCcsIDApXG4gICAgICAgICAgICAgIC5hdHRyKCdyeScsIDApO1xuXG4gICAgICAgICAgICAkc3ZnLmFkZENsYXNzKHBhbGV0dGVTZWxlY3RlZENsYXNzKVxuICAgICAgICAgICAgICAuYXR0cignd2lkdGgnLCBwYWxldHRlU2VsZWN0ZWRDb2xvclNpemUpXG4gICAgICAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCBwYWxldHRlU2VsZWN0ZWRDb2xvclNpemUpXG4gICAgICAgICAgICAgIC5maW5kKCdyZWN0JylcbiAgICAgICAgICAgICAgLmF0dHIoJ3J4JywgcGFsZXR0ZVNlbGVjdGVkQ29sb3JTaXplIC8gMilcbiAgICAgICAgICAgICAgLmF0dHIoJ3J5JywgcGFsZXR0ZVNlbGVjdGVkQ29sb3JTaXplIC8gMilcblxuICAgICAgICAgICAgd2luZG93Lmthbi5jdXJyZW50Q29sb3IgPSAkc3ZnLmZpbmQoJ3JlY3QnKS5hdHRyKCdmaWxsJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRDYW52YXNEcmF3KCkge1xuXG4gICAgcGFwZXIuc2V0dXAoJGNhbnZhc1swXSk7XG5cbiAgICBsZXQgbWlkZGxlLCBib3VuZHM7XG4gICAgbGV0IHBhc3Q7XG4gICAgbGV0IHNpemVzO1xuICAgIC8vIGxldCBwYXRocyA9IGdldEZyZXNoUGF0aHMod2luZG93Lmthbi5udW1QYXRocyk7XG4gICAgbGV0IHRvdWNoID0gZmFsc2U7XG4gICAgbGV0IGxhc3RDaGlsZDtcblxuICAgIGZ1bmN0aW9uIHBhblN0YXJ0KGV2ZW50KSB7XG4gICAgICAvLyBwYXBlci5wcm9qZWN0LmFjdGl2ZUxheWVyLnJlbW92ZUNoaWxkcmVuKCk7IC8vIFJFTU9WRVxuXG4gICAgICBzaXplcyA9IFtdO1xuXG4gICAgICBpZiAoIShldmVudC5jaGFuZ2VkUG9pbnRlcnMgJiYgZXZlbnQuY2hhbmdlZFBvaW50ZXJzLmxlbmd0aCA+IDApKSByZXR1cm47XG4gICAgICBpZiAoZXZlbnQuY2hhbmdlZFBvaW50ZXJzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2V2ZW50LmNoYW5nZWRQb2ludGVycyA+IDEnKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcG9pbnRlciA9IGV2ZW50LmNlbnRlcjtcbiAgICAgIGNvbnN0IHBvaW50ID0gbmV3IFBvaW50KHBvaW50ZXIueCwgcG9pbnRlci55KTtcblxuICAgICAgYm91bmRzID0gbmV3IFBhdGgoe1xuICAgICAgICBzdHJva2VDb2xvcjogd2luZG93Lmthbi5jdXJyZW50Q29sb3IsXG4gICAgICAgIGZpbGxDb2xvcjogd2luZG93Lmthbi5jdXJyZW50Q29sb3IsXG4gICAgICAgIG5hbWU6ICdib3VuZHMnXG4gICAgICB9KTtcblxuICAgICAgbWlkZGxlID0gbmV3IFBhdGgoe1xuICAgICAgICBzdHJva2VDb2xvcjogd2luZG93Lmthbi5jdXJyZW50Q29sb3IsXG4gICAgICAgIG5hbWU6ICdtaWRkbGUnLFxuICAgICAgICBzdHJva2VXaWR0aDogMVxuICAgICAgfSk7XG5cbiAgICAgIGJvdW5kcy5hZGQocG9pbnQpO1xuICAgICAgbWlkZGxlLmFkZChwb2ludCk7XG4gICAgfVxuXG4gICAgY29uc3QgdGhyZXNob2xkID0gMjA7XG4gICAgY29uc3QgYWxwaGEgPSAwLjM7XG4gICAgY29uc3QgbWVtb3J5ID0gMTA7XG4gICAgdmFyIGN1bURpc3RhbmNlID0gMDtcbiAgICBsZXQgY3VtU2l6ZSwgYXZnU2l6ZTtcbiAgICBmdW5jdGlvbiBwYW5Nb3ZlKGV2ZW50KSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgLy8gY29uc29sZS5sb2coZXZlbnQub3ZlcmFsbFZlbG9jaXR5KTtcbiAgICAgIC8vIGxldCB0aGlzRGlzdCA9IHBhcnNlSW50KGV2ZW50LmRpc3RhbmNlKTtcbiAgICAgIC8vIGN1bURpc3RhbmNlICs9IHRoaXNEaXN0O1xuICAgICAgLy9cbiAgICAgIC8vIGlmIChjdW1EaXN0YW5jZSA8IDEwMCkge1xuICAgICAgLy8gICBjb25zb2xlLmxvZygnaWdub3JpbmcnKTtcbiAgICAgIC8vICAgcmV0dXJuO1xuICAgICAgLy8gfSBlbHNlIHtcbiAgICAgIC8vICAgY3VtRGlzdGFuY2UgPSAwO1xuICAgICAgLy8gICBjb25zb2xlLmxvZygnbm90IGlnbm9yaW5nJyk7XG4gICAgICAvLyB9XG5cbiAgICAgIGNvbnN0IHBvaW50ZXIgPSBldmVudC5jZW50ZXI7XG4gICAgICBjb25zdCBwb2ludCA9IG5ldyBQb2ludChwb2ludGVyLngsIHBvaW50ZXIueSk7XG5cbiAgICAgIHdoaWxlIChzaXplcy5sZW5ndGggPiBtZW1vcnkpIHtcbiAgICAgICAgc2l6ZXMuc2hpZnQoKTtcbiAgICAgIH1cblxuICAgICAgbGV0IGJvdHRvbVgsIGJvdHRvbVksIGJvdHRvbSxcbiAgICAgICAgdG9wWCwgdG9wWSwgdG9wLFxuICAgICAgICBwMCwgcDEsXG4gICAgICAgIHN0ZXAsIGFuZ2xlLCBkaXN0LCBzaXplO1xuXG4gICAgICBpZiAoc2l6ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAvLyBub3QgdGhlIGZpcnN0IHBvaW50LCBzbyB3ZSBoYXZlIG90aGVycyB0byBjb21wYXJlIHRvXG4gICAgICAgIHAwID0gcGFzdDtcbiAgICAgICAgZGlzdCA9IHV0aWwuZGVsdGEocG9pbnQsIHAwKTtcbiAgICAgICAgc2l6ZSA9IGRpc3QgKiBhbHBoYTtcbiAgICAgICAgaWYgKHNpemUgPj0gdGhyZXNob2xkKSBzaXplID0gdGhyZXNob2xkO1xuICAgICAgICAvLyBzaXplID0gdGhyZXNob2xkIC0gc2l6ZTtcblxuICAgICAgICBjdW1TaXplID0gMDtcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBzaXplcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgIGN1bVNpemUgKz0gc2l6ZXNbal07XG4gICAgICAgIH1cbiAgICAgICAgYXZnU2l6ZSA9IE1hdGgucm91bmQoKChjdW1TaXplIC8gc2l6ZXMubGVuZ3RoKSArIHNpemUpIC8gMik7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGF2Z1NpemUpO1xuXG4gICAgICAgIGFuZ2xlID0gTWF0aC5hdGFuMihwb2ludC55IC0gcDAueSwgcG9pbnQueCAtIHAwLngpOyAvLyByYWRcblxuICAgICAgICAvLyBQb2ludChib3R0b21YLCBib3R0b21ZKSBpcyBib3R0b20sIFBvaW50KHRvcFgsIHRvcFkpIGlzIHRvcFxuICAgICAgICBib3R0b21YID0gcG9pbnQueCArIE1hdGguY29zKGFuZ2xlICsgTWF0aC5QSS8yKSAqIGF2Z1NpemU7XG4gICAgICAgIGJvdHRvbVkgPSBwb2ludC55ICsgTWF0aC5zaW4oYW5nbGUgKyBNYXRoLlBJLzIpICogYXZnU2l6ZTtcbiAgICAgICAgYm90dG9tID0gbmV3IFBvaW50KGJvdHRvbVgsIGJvdHRvbVkpO1xuXG4gICAgICAgIHRvcFggPSBwb2ludC54ICsgTWF0aC5jb3MoYW5nbGUgLSBNYXRoLlBJLzIpICogYXZnU2l6ZTtcbiAgICAgICAgdG9wWSA9IHBvaW50LnkgKyBNYXRoLnNpbihhbmdsZSAtIE1hdGguUEkvMikgKiBhdmdTaXplO1xuICAgICAgICB0b3AgPSBuZXcgUG9pbnQodG9wWCwgdG9wWSk7XG5cbiAgICAgICAgYm91bmRzLmFkZCh0b3ApO1xuICAgICAgICBib3VuZHMuaW5zZXJ0KDAsIGJvdHRvbSk7XG4gICAgICAgIC8vIGJvdW5kcy5zbW9vdGgoKTtcblxuICAgICAgICBtaWRkbGUuYWRkKHBvaW50KTtcbiAgICAgICAgLy8gbWlkZGxlLnNtb290aCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZG9uJ3QgaGF2ZSBhbnl0aGluZyB0byBjb21wYXJlIHRvXG4gICAgICAgIGRpc3QgPSAxO1xuICAgICAgICBhbmdsZSA9IDA7XG5cbiAgICAgICAgc2l6ZSA9IGRpc3QgKiBhbHBoYTtcbiAgICAgICAgaWYgKHNpemUgPj0gdGhyZXNob2xkKSBzaXplID0gdGhyZXNob2xkO1xuICAgICAgfVxuXG4gICAgICBwYXBlci52aWV3LmRyYXcoKTtcblxuICAgICAgcGFzdCA9IHBvaW50O1xuICAgICAgc2l6ZXMucHVzaChzaXplKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYW5FbmQoZXZlbnQpIHtcbiAgICAgIGVsYXN0aWNpdHkgPSAxO1xuXG4gICAgICBjb25zdCBwb2ludGVyID0gZXZlbnQuY2VudGVyO1xuICAgICAgY29uc3QgcG9pbnQgPSBuZXcgUG9pbnQocG9pbnRlci54LCBwb2ludGVyLnkpO1xuXG4gICAgICBjb25zdCBncm91cCA9IG5ldyBHcm91cChbYm91bmRzLCBtaWRkbGVdKTtcblxuICAgICAgYm91bmRzLmFkZChwb2ludCk7XG4gICAgICBib3VuZHMuZmxhdHRlbig0KTtcbiAgICAgIGJvdW5kcy5zbW9vdGgoKTtcbiAgICAgIGJvdW5kcy5zaW1wbGlmeSgpO1xuICAgICAgYm91bmRzLmNsb3NlZCA9IHRydWU7XG5cbiAgICAgIG1pZGRsZS5hZGQocG9pbnQpO1xuICAgICAgbWlkZGxlLmZsYXR0ZW4oNCk7XG4gICAgICBtaWRkbGUuc21vb3RoKCk7XG4gICAgICBtaWRkbGUuc2ltcGxpZnkoKTtcblxuICAgICAgLy8gdXRpbC50cnVlR3JvdXAoZ3JvdXApO1xuXG4gICAgICBsZXQgaW50ZXJzZWN0aW9ucyA9IG1pZGRsZS5nZXRDcm9zc2luZ3MoKTtcbiAgICAgIGlmIChpbnRlcnNlY3Rpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLy8gd2UgY3JlYXRlIGEgY29weSBvZiB0aGUgcGF0aCBiZWNhdXNlIHJlc29sdmVDcm9zc2luZ3MoKSBzcGxpdHMgc291cmNlIHBhdGhcbiAgICAgICAgbGV0IHBhdGhDb3B5ID0gbmV3IFBhdGgoKTtcbiAgICAgICAgcGF0aENvcHkuY29weUNvbnRlbnQobWlkZGxlKTtcbiAgICAgICAgcGF0aENvcHkudmlzaWJsZSA9IGZhbHNlO1xuXG4gICAgICAgIGxldCBkaXZpZGVkUGF0aCA9IHBhdGhDb3B5LnJlc29sdmVDcm9zc2luZ3MoKTtcbiAgICAgICAgZGl2aWRlZFBhdGgudmlzaWJsZSA9IGZhbHNlO1xuXG5cbiAgICAgICAgbGV0IGVuY2xvc2VkTG9vcHMgPSB1dGlsLmZpbmRJbnRlcmlvckN1cnZlcyhkaXZpZGVkUGF0aCk7XG5cbiAgICAgICAgaWYgKGVuY2xvc2VkTG9vcHMpIHtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVuY2xvc2VkTG9vcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGVuY2xvc2VkTG9vcHNbaV0udmlzaWJsZSA9IHRydWU7XG4gICAgICAgICAgICBlbmNsb3NlZExvb3BzW2ldLmNsb3NlZCA9IHRydWU7XG4gICAgICAgICAgICBlbmNsb3NlZExvb3BzW2ldLmZpbGxDb2xvciA9IG5ldyBDb2xvcigwLCAwKTsgLy8gdHJhbnNwYXJlbnRcbiAgICAgICAgICAgIGVuY2xvc2VkTG9vcHNbaV0uZGF0YS5pbnRlcmlvciA9IHRydWU7XG4gICAgICAgICAgICBlbmNsb3NlZExvb3BzW2ldLmRhdGEudHJhbnNwYXJlbnQgPSB0cnVlO1xuICAgICAgICAgICAgLy8gZW5jbG9zZWRMb29wc1tpXS5ibGVuZE1vZGUgPSAnbXVsdGlwbHknO1xuICAgICAgICAgICAgZ3JvdXAuYWRkQ2hpbGQoZW5jbG9zZWRMb29wc1tpXSk7XG4gICAgICAgICAgICBlbmNsb3NlZExvb3BzW2ldLnNlbmRUb0JhY2soKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcGF0aENvcHkucmVtb3ZlKCk7XG4gICAgICB9XG5cbiAgICAgIGdyb3VwLmRhdGEuY29sb3IgPSBib3VuZHMuZmlsbENvbG9yO1xuICAgICAgbGFzdENoaWxkID0gZ3JvdXA7XG4gICAgICAvLyBncm91cC5zZWxlY3RlZCA9IHRydWU7XG5cbiAgICAgIE1PVkVTLnB1c2goe1xuICAgICAgICB0eXBlOiAnbmV3R3JvdXAnLFxuICAgICAgICBpZDogZ3JvdXAuaWRcbiAgICAgIH0pO1xuXG4gICAgICBpZiAocnVuQW5pbWF0aW9ucykge1xuICAgICAgICBncm91cC5hbmltYXRlKFxuICAgICAgICAgIFt7XG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgIHNjYWxlOiAwLjlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXR0aW5nczoge1xuICAgICAgICAgICAgICBkdXJhdGlvbjogMTAwLFxuICAgICAgICAgICAgICBlYXNpbmc6IFwiZWFzZU91dFwiLFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICBzY2FsZTogMS4xMVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldHRpbmdzOiB7XG4gICAgICAgICAgICAgIGR1cmF0aW9uOiAxMDAsXG4gICAgICAgICAgICAgIGVhc2luZzogXCJlYXNlSW5cIlxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1dXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgaGl0T3B0aW9ucyA9IHtcbiAgICAgIHNlZ21lbnRzOiBmYWxzZSxcbiAgICAgIHN0cm9rZTogdHJ1ZSxcbiAgICAgIGZpbGw6IHRydWUsXG4gICAgICB0b2xlcmFuY2U6IDVcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZG91YmxlVGFwKGV2ZW50KSB7XG4gICAgICBjb25zdCBwb2ludGVyID0gZXZlbnQuY2VudGVyLFxuICAgICAgICAgIHBvaW50ID0gbmV3IFBvaW50KHBvaW50ZXIueCwgcG9pbnRlci55KSxcbiAgICAgICAgICBoaXRSZXN1bHQgPSBwYXBlci5wcm9qZWN0LmhpdFRlc3QocG9pbnQsIGhpdE9wdGlvbnMpO1xuXG4gICAgICBpZiAoaGl0UmVzdWx0KSB7XG4gICAgICAgIGxldCBpdGVtID0gaGl0UmVzdWx0Lml0ZW07XG4gICAgICAgIGxldCBwYXJlbnQgPSBpdGVtLnBhcmVudDtcblxuICAgICAgICBpZiAoaXRlbS5kYXRhLmludGVyaW9yKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ2ludGVyaW9yJyk7XG4gICAgICAgICAgaXRlbS5kYXRhLnRyYW5zcGFyZW50ID0gIWl0ZW0uZGF0YS50cmFuc3BhcmVudDtcblxuICAgICAgICAgIGlmIChpdGVtLmRhdGEudHJhbnNwYXJlbnQpIHtcbiAgICAgICAgICAgIGl0ZW0uZmlsbENvbG9yID0gdHJhbnNwYXJlbnQ7XG4gICAgICAgICAgICBpdGVtLnN0cm9rZUNvbG9yID0gdHJhbnNwYXJlbnQ7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGl0ZW0uZmlsbENvbG9yID0gcGFyZW50LmRhdGEuY29sb3I7XG4gICAgICAgICAgICBpdGVtLnN0cm9rZUNvbG9yID0gcGFyZW50LmRhdGEuY29sb3I7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgTU9WRVMucHVzaCh7XG4gICAgICAgICAgICB0eXBlOiAnZmlsbENoYW5nZWQnLFxuICAgICAgICAgICAgaWQ6IGl0ZW0uaWQsXG4gICAgICAgICAgICBmaWxsOiBwYXJlbnQuZGF0YS5jb2xvcixcbiAgICAgICAgICAgIHRyYW5zcGFyZW50OiBpdGVtLmRhdGEudHJhbnNwYXJlbnRcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnbm90IGludGVyaW9yJylcbiAgICAgICAgfVxuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZygnaGl0IG5vIGl0ZW0nKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyB2YXIgYW5pbWF0aW9uSWQ7XG4gICAgbGV0IGVsYXN0aWNpdHkgPSAwO1xuXG4gICAgZnVuY3Rpb24gYm91bmNlKGV2ZW50KSB7XG5cbiAgICAgIC8vIGNvbnNvbGUubG9nKHBhcGVyLnByb2plY3QuYWN0aXZlTGF5ZXIuZmlyc3RDaGlsZCk7XG4gICAgICAvLyBwYXBlci5wcm9qZWN0LmFjdGl2ZUxheWVyLmZpcnN0Q2hpbGQucm90YXRlKDMpO1xuICAgICAgaWYgKCEhbGFzdENoaWxkKSB7XG4gICAgICAgIGlmIChlbGFzdGljaXR5ID4gMCkge1xuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGxhc3RDaGlsZCk7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsYXN0Q2hpbGQuc2VnbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHNlZ21lbnQgPSBsYXN0Q2hpbGQuc2VnbWVudHNbaV07XG4gICAgICAgICAgICBjb25zdCB0aW1lQ29uc3QgPSAxNjtcbiAgICAgICAgICAgIGNvbnN0IGRpdkNvbnN0ID0gMjtcbiAgICAgICAgICAgIGNvbnN0IGNvcyA9IE1hdGguY29zKGV2ZW50LnRpbWUgKiB0aW1lQ29uc3QgKyBpKTtcbiAgICAgICAgICAgIGNvbnN0IHNpbiA9IE1hdGguc2luKGV2ZW50LnRpbWUgKiB0aW1lQ29uc3QgKyBpKTtcbiAgICAgICAgICAgIHNlZ21lbnQucG9pbnQueCArPSAoY29zIC8gZGl2Q29uc3QpICogZWxhc3RpY2l0eTtcbiAgICAgICAgICAgIHNlZ21lbnQucG9pbnQueSArPSAoc2luIC8gZGl2Q29uc3QpICogZWxhc3RpY2l0eTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGNvcywgc2luLCBlbGFzdGljaXR5KTtcbiAgICAgICAgICAgIGVsYXN0aWNpdHkgLT0gMC4wMDE7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBjb25zb2xlLmxvZygnbm8gY2hpbGRyZW4geWV0Jyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gcGFwZXIudmlldy5vbkZyYW1lID0gamlnZ2xlO1xuXG4gICAgdmFyIGhhbW1lck1hbmFnZXIgPSBuZXcgSGFtbWVyLk1hbmFnZXIoJGNhbnZhc1swXSk7XG5cbiAgICBoYW1tZXJNYW5hZ2VyLmFkZChuZXcgSGFtbWVyLlBhbih7IGRpcmVjdGlvbjogSGFtbWVyLkRJUkVDVElPTl9BTEwgfSkpO1xuICAgIGhhbW1lck1hbmFnZXIuYWRkKG5ldyBIYW1tZXIuVGFwKHsgZXZlbnQ6ICdkb3VibGV0YXAnLCB0YXBzOiAyIH0pKTtcbiAgICBoYW1tZXJNYW5hZ2VyLmFkZChuZXcgSGFtbWVyLlRhcCh7IGV2ZW50OiAnc2luZ2xldGFwJyB9KSk7XG5cbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdwYW5zdGFydCcsIHBhblN0YXJ0KTtcbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdwYW5tb3ZlJywgcGFuTW92ZSk7XG4gICAgaGFtbWVyTWFuYWdlci5vbigncGFuZW5kJywgcGFuRW5kKTtcblxuICAgIGhhbW1lck1hbmFnZXIuZ2V0KCdkb3VibGV0YXAnKS5yZWNvZ25pemVXaXRoKCdzaW5nbGV0YXAnKTtcbiAgICBoYW1tZXJNYW5hZ2VyLmdldCgnc2luZ2xldGFwJykucmVxdWlyZUZhaWx1cmUoJ2RvdWJsZXRhcCcpO1xuXG4gICAgaGFtbWVyTWFuYWdlci5vbignc2luZ2xldGFwJywgZnVuY3Rpb24oKSB7XG4gICAgICBjb25zb2xlLmxvZygnc2luZ2xlVGFwJyk7XG4gICAgfSk7XG5cbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdkb3VibGV0YXAnLCBkb3VibGVUYXApO1xuICB9XG5cbiAgZnVuY3Rpb24gbmV3UHJlc3NlZCgpIHtcbiAgICBjb25zb2xlLmxvZygnbmV3IHByZXNzZWQnKTtcblxuICAgIHBhcGVyLnByb2plY3QuYWN0aXZlTGF5ZXIucmVtb3ZlQ2hpbGRyZW4oKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVuZG9QcmVzc2VkKCkge1xuICAgIGNvbnNvbGUubG9nKCd1bmRvIHByZXNzZWQnKTtcbiAgICBpZiAoIShNT1ZFUy5sZW5ndGggPiAwKSkge1xuICAgICAgY29uc29sZS5sb2coJ25vIG1vdmVzIHlldCcpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBsYXN0TW92ZSA9IE1PVkVTLnBvcCgpO1xuXG4gICAgc3dpdGNoKGxhc3RNb3ZlLnR5cGUpIHtcbiAgICAgIGNhc2UgJ25ld0dyb3VwJzpcbiAgICAgICAgbGV0IGdyb3VwID0gcHJvamVjdC5nZXRJdGVtKHtcbiAgICAgICAgICBpZDogbGFzdE1vdmUuaWRcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChncm91cCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdyZW1vdmluZyBncm91cCcpO1xuICAgICAgICAgIGdyb3VwLnJlbW92ZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdjb3VsZCBub3QgZmluZCBtYXRjaGluZyBncm91cCcpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZmlsbENoYW5nZWQnOlxuICAgICAgICBsZXQgaXRlbSA9IHByb2plY3QuZ2V0SXRlbSh7XG4gICAgICAgICAgaWQ6IGxhc3RNb3ZlLmlkXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChsYXN0TW92ZS50cmFuc3BhcmVudCkge1xuICAgICAgICAgIGl0ZW0uZmlsbENvbG9yID0gbGFzdE1vdmUuZmlsbDtcbiAgICAgICAgICBpdGVtLnN0cm9rZUNvbG9yID0gbGFzdE1vdmUuZmlsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtLmZpbGxDb2xvciA9IHRyYW5zcGFyZW50O1xuICAgICAgICAgIGl0ZW0uc3Ryb2tlQ29sb3IgPSB0cmFuc3BhcmVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgY29uc29sZS5sb2coJ3Vua25vd24gY2FzZScpO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZyhsYXN0TW92ZSk7XG4gICAgLy8gZDMuc2VsZWN0QWxsKCdzdmcubWFpbiBwYXRoOmxhc3QtY2hpbGQnKS5yZW1vdmUoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBsYXlQcmVzc2VkKCkge1xuICAgIGNvbnNvbGUubG9nKCdwbGF5IHByZXNzZWQnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRpcHNQcmVzc2VkKCkge1xuICAgIGNvbnNvbGUubG9nKCd0aXBzIHByZXNzZWQnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNoYXJlUHJlc3NlZCgpIHtcbiAgICBjb25zb2xlLmxvZygnc2hhcmUgcHJlc3NlZCcpO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdE5ldygpIHtcbiAgICAkKCcubWFpbi1jb250cm9scyAubmV3Jykub24oJ2NsaWNrIHRhcCB0b3VjaCcsIG5ld1ByZXNzZWQpO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdFVuZG8oKSB7XG4gICAgJCgnLm1haW4tY29udHJvbHMgLnVuZG8nKS5vbignY2xpY2snLCB1bmRvUHJlc3NlZCk7XG4gIH1cbiAgZnVuY3Rpb24gaW5pdFBsYXkoKSB7XG4gICAgJCgnLm1haW4tY29udHJvbHMgLnBsYXknKS5vbignY2xpY2snLCBwbGF5UHJlc3NlZCk7XG4gIH1cbiAgZnVuY3Rpb24gaW5pdFRpcHMoKSB7XG4gICAgJCgnLmF1eC1jb250cm9scyAudGlwcycpLm9uKCdjbGljaycsIHRpcHNQcmVzc2VkKTtcbiAgfVxuICBmdW5jdGlvbiBpbml0U2hhcmUoKSB7XG4gICAgJCgnLmF1eC1jb250cm9scyAuc2hhcmUnKS5vbignY2xpY2snLCBzaGFyZVByZXNzZWQpO1xuICB9XG5cbiAgZnVuY3Rpb24gbWFpbigpIHtcbiAgICBpbml0Q29udHJvbFBhbmVsKCk7XG4gIH1cblxuICBtYWluKCk7XG59KTtcbiIsIi8vIENvbnZlcnRzIGZyb20gZGVncmVlcyB0byByYWRpYW5zLlxuZXhwb3J0IGZ1bmN0aW9uIHJhZChkZWdyZWVzKSB7XG4gIHJldHVybiBkZWdyZWVzICogTWF0aC5QSSAvIDE4MDtcbn07XG5cbi8vIENvbnZlcnRzIGZyb20gcmFkaWFucyB0byBkZWdyZWVzLlxuZXhwb3J0IGZ1bmN0aW9uIGRlZyhyYWRpYW5zKSB7XG4gIHJldHVybiByYWRpYW5zICogMTgwIC8gTWF0aC5QSTtcbn07XG5cbi8vIGRpc3RhbmNlIGJldHdlZW4gdHdvIHBvaW50c1xuZXhwb3J0IGZ1bmN0aW9uIGRlbHRhKHAxLCBwMikge1xuICByZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KHAxLnggLSBwMi54LCAyKSArIE1hdGgucG93KHAxLnkgLSBwMi55LCAyKSk7IC8vIHB5dGhhZ29yZWFuIVxufVxuXG4vLyByZXR1cm5zIGFuIGFycmF5IG9mIHRoZSBpbnRlcmlvciBjdXJ2ZXMgb2YgYSBnaXZlbiBjb21wb3VuZCBwYXRoXG5leHBvcnQgZnVuY3Rpb24gZmluZEludGVyaW9yQ3VydmVzKHBhdGgpIHtcbiAgbGV0IGludGVyaW9yQ3VydmVzID0gW107XG4gIGlmICghcGF0aCB8fCAhcGF0aC5jaGlsZHJlbiB8fCAhcGF0aC5jaGlsZHJlbi5sZW5ndGgpIHJldHVybjtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHBhdGguY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICBsZXQgY2hpbGQgPSBwYXRoLmNoaWxkcmVuW2ldO1xuXG4gICAgaWYgKGNoaWxkLmNsb3NlZCl7XG4gICAgICBpbnRlcmlvckN1cnZlcy5wdXNoKG5ldyBQYXRoKGNoaWxkLnNlZ21lbnRzKSk7XG4gICAgfVxuICB9XG5cbiAgcGF0aC5yZW1vdmUoKTtcbiAgcmV0dXJuIGludGVyaW9yQ3VydmVzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJ1ZUdyb3VwKGdyb3VwKSB7XG4gIGxldCBib3VuZHMgPSBncm91cC5fbmFtZWRDaGlsZHJlbi5ib3VuZHNbMF0sXG4gICAgICBtaWRkbGUgPSBncm91cC5fbmFtZWRDaGlsZHJlbi5taWRkbGVbMF07XG5cbiAgbGV0IG1pZGRsZUNvcHkgPSBuZXcgUGF0aCgpO1xuICBtaWRkbGVDb3B5LmNvcHlDb250ZW50KG1pZGRsZSk7XG4gIG1pZGRsZUNvcHkudmlzaWJsZSA9IGZhbHNlO1xuICBsZXQgZGl2aWRlZFBhdGggPSBtaWRkbGVDb3B5LnJlc29sdmVDcm9zc2luZ3MoKTtcbiAgZGl2aWRlZFBhdGgudmlzaWJsZSA9IGZhbHNlO1xuICBCYXNlLmVhY2goZGl2aWRlZFBhdGguY2hpbGRyZW4sIGZ1bmN0aW9uKGNoaWxkLCBpKSB7XG4gICAgaWYgKGNoaWxkLmNsb3NlZCkge1xuICAgICAgY2hpbGQuc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2hpbGQuc2VsZWN0ZWQgPSB0cnVlO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZyhjaGlsZCwgaSk7XG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cnVlUGF0aChwYXRoKSB7XG4gIGNvbnNvbGUubG9nKGdyb3VwKTtcbiAgLy8gaWYgKHBhdGggJiYgcGF0aC5jaGlsZHJlbiAmJiBwYXRoLmNoaWxkcmVuLmxlbmd0aCA+IDAgJiYgcGF0aC5fbmFtZWRDaGlsZHJlblsnbWlkZGxlJ10pIHtcbiAgLy8gICBsZXQgcGF0aENvcHkgPSBuZXcgUGF0aCgpO1xuICAvLyAgIGNvbnNvbGUubG9nKHBhdGguX25hbWVkQ2hpbGRyZW5bJ21pZGRsZSddKTtcbiAgLy8gICBwYXRoQ29weS5jb3B5Q29udGVudChwYXRoLl9uYW1lZENoaWxkcmVuWydtaWRkbGUnXSk7XG4gIC8vICAgY29uc29sZS5sb2cocGF0aENvcHkpO1xuICAvLyB9XG59XG4iXX0=
