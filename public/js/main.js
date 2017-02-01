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

  var viewWidth = void 0,
      viewHeight = void 0;

  function initViewVars() {
    viewWidth = paper.view.viewSize.width;
    viewHeight = paper.view.viewSize.height;
  }

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
      if (pinching) return;

      var pointer = event.center;
      var point = new Point(pointer.x, pointer.y);

      var group = new Group([bounds, middle]);
      group.data.color = bounds.fillColor;
      group.data.update = true;

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
      group.data.scale = 1; // init variable to track scale changes
      group.data.rotation = 0; // init variable to track rotation changes

      var children = group.getItems({
        match: function match(item) {
          return item.name !== 'middle';
        }
      });

      // console.log('-----');
      // console.log(group);
      // console.log(children);
      // group.selected = true;
      var unitedPath = new Path();
      if (children.length > 1) {
        var accumulator = new Path();
        accumulator.copyContent(children[0]);
        accumulator.visible = false;

        for (var _i = 1; _i < children.length; _i++) {
          var otherPath = new Path();
          otherPath.copyContent(children[_i]);
          otherPath.visible = false;

          unitedPath = accumulator.unite(otherPath);
          otherPath.remove();
          accumulator = unitedPath;
        }
      } else {
        // children[0] is united group
        unitedPath.copyContent(children[0]);
      }

      unitedPath.visible = false;
      unitedPath.data.name = 'mask';

      group.addChild(unitedPath);
      unitedPath.sendToBack();

      lastChild = group;

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
        originalRotation = void 0,
        originalScale = void 0;

    function pinchStart(event) {
      console.log('pinchStart', event.center);
      hammerManager.get('pan').set({ enable: false });
      var pointer = event.center,
          point = new Point(pointer.x, pointer.y),
          hitResult = paper.project.hitTest(point, hitOptions);

      if (hitResult) {
        pinching = true;
        pinchedGroup = hitResult.item.parent;
        lastScale = 1;
        lastRotation = event.rotation;

        originalPosition = pinchedGroup.position;
        // originalRotation = pinchedGroup.rotation;
        originalRotation = pinchedGroup.data.rotation;
        originalScale = pinchedGroup.data.scale;

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
        pinchedGroup = null;
        console.log('hit no item');
      }
    }

    function pinchMove(event) {
      console.log('pinchMove');
      if (!!pinchedGroup) {
        // console.log('pinchmove', event);
        // console.log(pinchedGroup);
        var currentScale = event.scale;
        var scaleDelta = currentScale / lastScale;
        // console.log(lastScale, currentScale, scaleDelta);
        lastScale = currentScale;

        var currentRotation = event.rotation;
        var rotationDelta = currentRotation - lastRotation;
        console.log(lastRotation, currentRotation, rotationDelta);
        lastRotation = currentRotation;

        // console.log(`scaling by ${scaleDelta}`);
        // console.log(`rotating by ${rotationDelta}`);

        pinchedGroup.position = event.center;
        pinchedGroup.scale(scaleDelta);
        pinchedGroup.rotate(rotationDelta);

        pinchedGroup.data.scale *= scaleDelta;
        pinchedGroup.data.rotation += rotationDelta;
      }
    }

    var lastEvent = void 0;
    function pinchEnd(event) {
      // wait 250 ms to prevent mistaken pan readings
      lastEvent = event;
      if (!!pinchedGroup) {
        pinchedGroup.data.update = true;
        var move = {
          id: pinchedGroup.id,
          type: 'transform'
        };
        if (pinchedGroup.position != originalPosition) {
          move.position = originalPosition;
        }

        if (pinchedGroup.data.rotation != originalRotation) {
          move.rotation = originalRotation - pinchedGroup.data.rotation;
        }

        if (pinchedGroup.data.scale != originalScale) {
          move.scale = originalScale / pinchedGroup.data.scale;
        }

        console.log('final scale', pinchedGroup.data.scale);
        console.log(move);

        MOVES.push(move);

        if (event.velocity > 1) {
          // dispose of group offscreen
          throwPinchedGroup();
        }

        // if (runAnimations) {
        //   pinchedGroup.animate({
        //     properties: {
        //       scale: 0.8
        //     },
        //     settings: {
        //       duration: 100,
        //       easing: "easeOut",
        //     }
        //   });
        // }
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
      return;
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
          // console.log('interior');
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
        pinchedGroup = null;
        console.log('hit no item');
      }
    }

    var velocityMultiplier = 25;
    function throwPinchedGroup() {
      console.log(pinchedGroup.position);
      if (pinchedGroup.position.x <= 0 - pinchedGroup.bounds.width || pinchedGroup.position.x >= viewWidth + pinchedGroup.bounds.width || pinchedGroup.position.y <= 0 - pinchedGroup.bounds.height || pinchedGroup.position.y >= viewHeight + pinchedGroup.bounds.height) {
        pinchedGroup.data.offScreen = true;
        pinchedGroup.visible = false;
        return;
      }
      requestAnimationFrame(throwPinchedGroup);
      pinchedGroup.position.x += lastEvent.velocityX * velocityMultiplier;
      pinchedGroup.position.y += lastEvent.velocityY * velocityMultiplier;
    }

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
      item.visible = true; // make sure
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
          if (!!lastMove.scale) {
            item.scale(lastMove.scale);
          }
          break;
        default:
          console.log('unknown case');
      }
    } else {
      console.log('could not find matching item');
    }
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
    var circle = new Path.Circle({
      center: [400, 400],
      radius: 100,
      strokeColor: 'green',
      fillColor: 'green'
    });
    var group = new Group(circle);
  }

  function main() {
    initControlPanel();
    drawCircle();
    initViewVars();
  }

  main();
});

},{"./util":2}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rad = rad;
exports.deg = deg;
exports.delta = delta;
exports.findInteriorCurves = findInteriorCurves;
exports.trueGroup = trueGroup;
exports.truePath = truePath;
exports.checkPops = checkPops;
exports.overlaps = overlaps;
exports.mergeOnePath = mergeOnePath;
exports.mergePaths = mergePaths;
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
    // console.log(child, i);
  });
}

function truePath(path) {
  // console.log(group);
  // if (path && path.children && path.children.length > 0 && path._namedChildren['middle']) {
  //   let pathCopy = new Path();
  //   console.log(path._namedChildren['middle']);
  //   pathCopy.copyContent(path._namedChildren['middle']);
  //   console.log(pathCopy);
  // }
}

function checkPops() {
  var groups = paper.project.getItems({
    className: 'Group',
    match: function match(el) {
      return !!el.data && el.data.update;
    }
  });
}

// https://groups.google.com/forum/#!topic/paperjs/UD8L0MTyReQ
function overlaps(path, other) {
  return !(path.getIntersections(other).length === 0);
}

// https://groups.google.com/forum/#!topic/paperjs/UD8L0MTyReQ
function mergeOnePath(path, others) {
  var i = void 0,
      merged = void 0,
      other = void 0,
      union = void 0,
      _i = void 0,
      _len = void 0,
      _ref = void 0;
  for (i = _i = 0, _len = others.length; _i < _len; i = ++_i) {
    other = others[i];
    if (overlaps(path, other)) {
      union = path.unite(other);
      merged = mergeOnePath(union, others.slice(i + 1));
      return (_ref = others.slice(0, i)).concat.apply(_ref, merged);
    }
  }
  return others.concat(path);
};

// https://groups.google.com/forum/#!topic/paperjs/UD8L0MTyReQ
function mergePaths(paths) {
  var path, result, _i, _len;
  result = [];
  for (_i = 0, _len = paths.length; _i < _len; _i++) {
    path = paths[_i];
    result = mergeOnePath(path, result);
  }
  return result;
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxPQUFPLEdBQVAsR0FBYSxPQUFPLEdBQVAsSUFBYztBQUN6QixXQUFTLENBQUMsU0FBRCxFQUFZLFNBQVosRUFBdUIsU0FBdkIsRUFBa0MsU0FBbEMsRUFBNkMsU0FBN0MsRUFBd0QsU0FBeEQsRUFBbUUsU0FBbkUsRUFBOEUsU0FBOUUsRUFBeUYsU0FBekYsRUFBb0csU0FBcEcsRUFBK0csU0FBL0csRUFBMEgsU0FBMUgsRUFBcUksU0FBckksRUFBZ0osU0FBaEosRUFBMkosU0FBM0osRUFBc0ssU0FBdEssQ0FEZ0I7QUFFekIsZ0JBQWMsU0FGVztBQUd6QixZQUFVLEVBSGU7QUFJekIsU0FBTztBQUprQixDQUEzQjs7QUFPQSxNQUFNLE9BQU4sQ0FBYyxNQUFkOztBQUVBLElBQU0sT0FBTyxRQUFRLFFBQVIsQ0FBYjtBQUNBOztBQUVBLEVBQUUsUUFBRixFQUFZLEtBQVosQ0FBa0IsWUFBVztBQUMzQixNQUFJLFFBQVEsRUFBWixDQUQyQixDQUNYO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxNQUFNLFVBQVUsRUFBRSxNQUFGLENBQWhCO0FBQ0EsTUFBTSxRQUFRLEVBQUUsTUFBRixDQUFkO0FBQ0EsTUFBTSxVQUFVLEVBQUUsbUJBQUYsQ0FBaEI7QUFDQSxNQUFNLGdCQUFnQixLQUF0QjtBQUNBLE1BQU0sY0FBYyxJQUFJLEtBQUosQ0FBVSxDQUFWLEVBQWEsQ0FBYixDQUFwQjs7QUFFQSxNQUFJLGtCQUFKO0FBQUEsTUFBZSxtQkFBZjs7QUFFQSxXQUFTLFlBQVQsR0FBd0I7QUFDdEIsZ0JBQVksTUFBTSxJQUFOLENBQVcsUUFB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bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ3aW5kb3cua2FuID0gd2luZG93LmthbiB8fCB7XG4gIHBhbGV0dGU6IFtcIiMyMDE3MUNcIiwgXCIjMUUyQTQzXCIsIFwiIzI4Mzc3RFwiLCBcIiMzNTI3NDdcIiwgXCIjRjI4NUE1XCIsIFwiI0NBMkUyNlwiLCBcIiNCODQ1MjZcIiwgXCIjREE2QzI2XCIsIFwiIzQ1MzEyMVwiLCBcIiM5MTZBNDdcIiwgXCIjRUVCNjQxXCIsIFwiI0Y2RUIxNlwiLCBcIiM3RjdEMzFcIiwgXCIjNkVBRDc5XCIsIFwiIzJBNDYyMVwiLCBcIiNGNEVBRTBcIl0sXG4gIGN1cnJlbnRDb2xvcjogJyMyMDE3MUMnLFxuICBudW1QYXRoczogMTAsXG4gIHBhdGhzOiBbXSxcbn07XG5cbnBhcGVyLmluc3RhbGwod2luZG93KTtcblxuY29uc3QgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuLy8gcmVxdWlyZSgncGFwZXItYW5pbWF0ZScpO1xuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgbGV0IE1PVkVTID0gW107IC8vIHN0b3JlIGdsb2JhbCBtb3ZlcyBsaXN0XG4gIC8vIG1vdmVzID0gW1xuICAvLyAgIHtcbiAgLy8gICAgICd0eXBlJzogJ2NvbG9yQ2hhbmdlJyxcbiAgLy8gICAgICdvbGQnOiAnIzIwMTcxQycsXG4gIC8vICAgICAnbmV3JzogJyNGMjg1QTUnXG4gIC8vICAgfSxcbiAgLy8gICB7XG4gIC8vICAgICAndHlwZSc6ICduZXdQYXRoJyxcbiAgLy8gICAgICdyZWYnOiAnPz8/JyAvLyB1dWlkPyBkb20gcmVmZXJlbmNlP1xuICAvLyAgIH0sXG4gIC8vICAge1xuICAvLyAgICAgJ3R5cGUnOiAncGF0aFRyYW5zZm9ybScsXG4gIC8vICAgICAncmVmJzogJz8/PycsIC8vIHV1aWQ/IGRvbSByZWZlcmVuY2U/XG4gIC8vICAgICAnb2xkJzogJ3JvdGF0ZSg5MGRlZylzY2FsZSgxLjUpJywgLy8gPz8/XG4gIC8vICAgICAnbmV3JzogJ3JvdGF0ZSgxMjBkZWcpc2NhbGUoLTAuNSknIC8vID8/P1xuICAvLyAgIH0sXG4gIC8vICAgLy8gb3RoZXJzP1xuICAvLyBdXG5cbiAgY29uc3QgJHdpbmRvdyA9ICQod2luZG93KTtcbiAgY29uc3QgJGJvZHkgPSAkKCdib2R5Jyk7XG4gIGNvbnN0ICRjYW52YXMgPSAkKCdjYW52YXMjbWFpbkNhbnZhcycpO1xuICBjb25zdCBydW5BbmltYXRpb25zID0gZmFsc2U7XG4gIGNvbnN0IHRyYW5zcGFyZW50ID0gbmV3IENvbG9yKDAsIDApO1xuXG4gIGxldCB2aWV3V2lkdGgsIHZpZXdIZWlnaHQ7XG5cbiAgZnVuY3Rpb24gaW5pdFZpZXdWYXJzKCkge1xuICAgIHZpZXdXaWR0aCA9IHBhcGVyLnZpZXcudmlld1NpemUud2lkdGg7XG4gICAgdmlld0hlaWdodCA9IHBhcGVyLnZpZXcudmlld1NpemUuaGVpZ2h0O1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdENvbnRyb2xQYW5lbCgpIHtcbiAgICBpbml0Q29sb3JQYWxldHRlKCk7XG4gICAgaW5pdENhbnZhc0RyYXcoKTtcbiAgICBpbml0TmV3KCk7XG4gICAgaW5pdFVuZG8oKTtcbiAgICBpbml0UGxheSgpO1xuICAgIGluaXRUaXBzKCk7XG4gICAgaW5pdFNoYXJlKCk7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0Q29sb3JQYWxldHRlKCkge1xuICAgIGNvbnN0ICRwYWxldHRlV3JhcCA9ICQoJ3VsLnBhbGV0dGUtY29sb3JzJyk7XG4gICAgY29uc3QgJHBhbGV0dGVDb2xvcnMgPSAkcGFsZXR0ZVdyYXAuZmluZCgnbGknKTtcbiAgICBjb25zdCBwYWxldHRlQ29sb3JTaXplID0gMjA7XG4gICAgY29uc3QgcGFsZXR0ZVNlbGVjdGVkQ29sb3JTaXplID0gMzA7XG4gICAgY29uc3QgcGFsZXR0ZVNlbGVjdGVkQ2xhc3MgPSAncGFsZXR0ZS1zZWxlY3RlZCc7XG5cbiAgICAvLyBob29rIHVwIGNsaWNrXG4gICAgICAkcGFsZXR0ZUNvbG9ycy5vbignY2xpY2sgdGFwIHRvdWNoJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgbGV0ICRzdmcgPSAkKHRoaXMpLmZpbmQoJ3N2Zy5wYWxldHRlLWNvbG9yJyk7XG5cbiAgICAgICAgICBpZiAoISRzdmcuaGFzQ2xhc3MocGFsZXR0ZVNlbGVjdGVkQ2xhc3MpKSB7XG4gICAgICAgICAgICAkKCcuJyArIHBhbGV0dGVTZWxlY3RlZENsYXNzKVxuICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MocGFsZXR0ZVNlbGVjdGVkQ2xhc3MpXG4gICAgICAgICAgICAgIC5hdHRyKCd3aWR0aCcsIHBhbGV0dGVDb2xvclNpemUpXG4gICAgICAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCBwYWxldHRlQ29sb3JTaXplKVxuICAgICAgICAgICAgICAuZmluZCgncmVjdCcpXG4gICAgICAgICAgICAgIC5hdHRyKCdyeCcsIDApXG4gICAgICAgICAgICAgIC5hdHRyKCdyeScsIDApO1xuXG4gICAgICAgICAgICAkc3ZnLmFkZENsYXNzKHBhbGV0dGVTZWxlY3RlZENsYXNzKVxuICAgICAgICAgICAgICAuYXR0cignd2lkdGgnLCBwYWxldHRlU2VsZWN0ZWRDb2xvclNpemUpXG4gICAgICAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCBwYWxldHRlU2VsZWN0ZWRDb2xvclNpemUpXG4gICAgICAgICAgICAgIC5maW5kKCdyZWN0JylcbiAgICAgICAgICAgICAgLmF0dHIoJ3J4JywgcGFsZXR0ZVNlbGVjdGVkQ29sb3JTaXplIC8gMilcbiAgICAgICAgICAgICAgLmF0dHIoJ3J5JywgcGFsZXR0ZVNlbGVjdGVkQ29sb3JTaXplIC8gMilcblxuICAgICAgICAgICAgd2luZG93Lmthbi5jdXJyZW50Q29sb3IgPSAkc3ZnLmZpbmQoJ3JlY3QnKS5hdHRyKCdmaWxsJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRDYW52YXNEcmF3KCkge1xuXG4gICAgcGFwZXIuc2V0dXAoJGNhbnZhc1swXSk7XG5cbiAgICBsZXQgbWlkZGxlLCBib3VuZHM7XG4gICAgbGV0IHBhc3Q7XG4gICAgbGV0IHNpemVzO1xuICAgIC8vIGxldCBwYXRocyA9IGdldEZyZXNoUGF0aHMod2luZG93Lmthbi5udW1QYXRocyk7XG4gICAgbGV0IHRvdWNoID0gZmFsc2U7XG4gICAgbGV0IGxhc3RDaGlsZDtcblxuICAgIGZ1bmN0aW9uIHBhblN0YXJ0KGV2ZW50KSB7XG4gICAgICBwYXBlci5wcm9qZWN0LmFjdGl2ZUxheWVyLnJlbW92ZUNoaWxkcmVuKCk7IC8vIFJFTU9WRVxuICAgICAgZHJhd0NpcmNsZSgpO1xuXG4gICAgICBzaXplcyA9IFtdO1xuXG4gICAgICBpZiAocGluY2hpbmcpIHJldHVybjtcbiAgICAgIGlmICghKGV2ZW50LmNoYW5nZWRQb2ludGVycyAmJiBldmVudC5jaGFuZ2VkUG9pbnRlcnMubGVuZ3RoID4gMCkpIHJldHVybjtcbiAgICAgIGlmIChldmVudC5jaGFuZ2VkUG9pbnRlcnMubGVuZ3RoID4gMSkge1xuICAgICAgICBjb25zb2xlLmxvZygnZXZlbnQuY2hhbmdlZFBvaW50ZXJzID4gMScpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBwb2ludGVyID0gZXZlbnQuY2VudGVyO1xuICAgICAgY29uc3QgcG9pbnQgPSBuZXcgUG9pbnQocG9pbnRlci54LCBwb2ludGVyLnkpO1xuXG4gICAgICBib3VuZHMgPSBuZXcgUGF0aCh7XG4gICAgICAgIHN0cm9rZUNvbG9yOiB3aW5kb3cua2FuLmN1cnJlbnRDb2xvcixcbiAgICAgICAgZmlsbENvbG9yOiB3aW5kb3cua2FuLmN1cnJlbnRDb2xvcixcbiAgICAgICAgbmFtZTogJ2JvdW5kcycsXG4gICAgICB9KTtcblxuICAgICAgbWlkZGxlID0gbmV3IFBhdGgoe1xuICAgICAgICBzdHJva2VDb2xvcjogd2luZG93Lmthbi5jdXJyZW50Q29sb3IsXG4gICAgICAgIG5hbWU6ICdtaWRkbGUnLFxuICAgICAgICBzdHJva2VXaWR0aDogMSxcbiAgICAgICAgdmlzaWJsZTogZmFsc2VcbiAgICAgIH0pO1xuXG4gICAgICBib3VuZHMuYWRkKHBvaW50KTtcbiAgICAgIG1pZGRsZS5hZGQocG9pbnQpO1xuICAgIH1cblxuICAgIGNvbnN0IG1pbiA9IDA7XG4gICAgY29uc3QgbWF4ID0gMjA7XG4gICAgY29uc3QgYWxwaGEgPSAwLjM7XG4gICAgY29uc3QgbWVtb3J5ID0gMTA7XG4gICAgdmFyIGN1bURpc3RhbmNlID0gMDtcbiAgICBsZXQgY3VtU2l6ZSwgYXZnU2l6ZTtcbiAgICBmdW5jdGlvbiBwYW5Nb3ZlKGV2ZW50KSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgaWYgKHBpbmNoaW5nKSByZXR1cm47XG4gICAgICAvLyBjb25zb2xlLmxvZyhldmVudC5vdmVyYWxsVmVsb2NpdHkpO1xuICAgICAgLy8gbGV0IHRoaXNEaXN0ID0gcGFyc2VJbnQoZXZlbnQuZGlzdGFuY2UpO1xuICAgICAgLy8gY3VtRGlzdGFuY2UgKz0gdGhpc0Rpc3Q7XG4gICAgICAvL1xuICAgICAgLy8gaWYgKGN1bURpc3RhbmNlIDwgMTAwKSB7XG4gICAgICAvLyAgIGNvbnNvbGUubG9nKCdpZ25vcmluZycpO1xuICAgICAgLy8gICByZXR1cm47XG4gICAgICAvLyB9IGVsc2Uge1xuICAgICAgLy8gICBjdW1EaXN0YW5jZSA9IDA7XG4gICAgICAvLyAgIGNvbnNvbGUubG9nKCdub3QgaWdub3JpbmcnKTtcbiAgICAgIC8vIH1cblxuICAgICAgY29uc3QgcG9pbnRlciA9IGV2ZW50LmNlbnRlcjtcbiAgICAgIGNvbnN0IHBvaW50ID0gbmV3IFBvaW50KHBvaW50ZXIueCwgcG9pbnRlci55KTtcblxuICAgICAgd2hpbGUgKHNpemVzLmxlbmd0aCA+IG1lbW9yeSkge1xuICAgICAgICBzaXplcy5zaGlmdCgpO1xuICAgICAgfVxuXG4gICAgICBsZXQgYm90dG9tWCwgYm90dG9tWSwgYm90dG9tLFxuICAgICAgICB0b3BYLCB0b3BZLCB0b3AsXG4gICAgICAgIHAwLCBwMSxcbiAgICAgICAgc3RlcCwgYW5nbGUsIGRpc3QsIHNpemU7XG5cbiAgICAgIGlmIChzaXplcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIC8vIG5vdCB0aGUgZmlyc3QgcG9pbnQsIHNvIHdlIGhhdmUgb3RoZXJzIHRvIGNvbXBhcmUgdG9cbiAgICAgICAgcDAgPSBwYXN0O1xuICAgICAgICBkaXN0ID0gdXRpbC5kZWx0YShwb2ludCwgcDApO1xuICAgICAgICBzaXplID0gZGlzdCAqIGFscGhhO1xuICAgICAgICBpZiAoc2l6ZSA+PSBtYXgpIHNpemUgPSBtYXg7XG4gICAgICAgIC8vIHNpemUgPSBNYXRoLm1heChNYXRoLm1pbihzaXplLCBtYXgpLCBtaW4pOyAvLyBjbGFtcCBzaXplIHRvIFttaW4sIG1heF1cbiAgICAgICAgLy8gc2l6ZSA9IG1heCAtIHNpemU7XG5cbiAgICAgICAgY3VtU2l6ZSA9IDA7XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgc2l6ZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICBjdW1TaXplICs9IHNpemVzW2pdO1xuICAgICAgICB9XG4gICAgICAgIGF2Z1NpemUgPSBNYXRoLnJvdW5kKCgoY3VtU2l6ZSAvIHNpemVzLmxlbmd0aCkgKyBzaXplKSAvIDIpO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhhdmdTaXplKTtcblxuICAgICAgICBhbmdsZSA9IE1hdGguYXRhbjIocG9pbnQueSAtIHAwLnksIHBvaW50LnggLSBwMC54KTsgLy8gcmFkXG5cbiAgICAgICAgLy8gUG9pbnQoYm90dG9tWCwgYm90dG9tWSkgaXMgYm90dG9tLCBQb2ludCh0b3BYLCB0b3BZKSBpcyB0b3BcbiAgICAgICAgYm90dG9tWCA9IHBvaW50LnggKyBNYXRoLmNvcyhhbmdsZSArIE1hdGguUEkvMikgKiBhdmdTaXplO1xuICAgICAgICBib3R0b21ZID0gcG9pbnQueSArIE1hdGguc2luKGFuZ2xlICsgTWF0aC5QSS8yKSAqIGF2Z1NpemU7XG4gICAgICAgIGJvdHRvbSA9IG5ldyBQb2ludChib3R0b21YLCBib3R0b21ZKTtcblxuICAgICAgICB0b3BYID0gcG9pbnQueCArIE1hdGguY29zKGFuZ2xlIC0gTWF0aC5QSS8yKSAqIGF2Z1NpemU7XG4gICAgICAgIHRvcFkgPSBwb2ludC55ICsgTWF0aC5zaW4oYW5nbGUgLSBNYXRoLlBJLzIpICogYXZnU2l6ZTtcbiAgICAgICAgdG9wID0gbmV3IFBvaW50KHRvcFgsIHRvcFkpO1xuXG4gICAgICAgIGJvdW5kcy5hZGQodG9wKTtcbiAgICAgICAgYm91bmRzLmluc2VydCgwLCBib3R0b20pO1xuICAgICAgICAvLyBib3VuZHMuc21vb3RoKCk7XG5cbiAgICAgICAgbWlkZGxlLmFkZChwb2ludCk7XG4gICAgICAgIC8vIG1pZGRsZS5zbW9vdGgoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGRvbid0IGhhdmUgYW55dGhpbmcgdG8gY29tcGFyZSB0b1xuICAgICAgICBkaXN0ID0gMTtcbiAgICAgICAgYW5nbGUgPSAwO1xuXG4gICAgICAgIHNpemUgPSBkaXN0ICogYWxwaGE7XG4gICAgICAgIHNpemUgPSBNYXRoLm1heChNYXRoLm1pbihzaXplLCBtYXgpLCBtaW4pOyAvLyBjbGFtcCBzaXplIHRvIFttaW4sIG1heF1cbiAgICAgIH1cblxuICAgICAgcGFwZXIudmlldy5kcmF3KCk7XG5cbiAgICAgIHBhc3QgPSBwb2ludDtcbiAgICAgIHNpemVzLnB1c2goc2l6ZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGFuRW5kKGV2ZW50KSB7XG4gICAgICBpZiAocGluY2hpbmcpIHJldHVybjtcblxuICAgICAgY29uc3QgcG9pbnRlciA9IGV2ZW50LmNlbnRlcjtcbiAgICAgIGNvbnN0IHBvaW50ID0gbmV3IFBvaW50KHBvaW50ZXIueCwgcG9pbnRlci55KTtcblxuICAgICAgY29uc3QgZ3JvdXAgPSBuZXcgR3JvdXAoW2JvdW5kcywgbWlkZGxlXSk7XG4gICAgICBncm91cC5kYXRhLmNvbG9yID0gYm91bmRzLmZpbGxDb2xvcjtcbiAgICAgIGdyb3VwLmRhdGEudXBkYXRlID0gdHJ1ZTtcblxuICAgICAgYm91bmRzLmFkZChwb2ludCk7XG4gICAgICBib3VuZHMuZmxhdHRlbig0KTtcbiAgICAgIGJvdW5kcy5zbW9vdGgoKTtcbiAgICAgIGJvdW5kcy5zaW1wbGlmeSgpO1xuICAgICAgYm91bmRzLmNsb3NlZCA9IHRydWU7XG5cbiAgICAgIG1pZGRsZS5hZGQocG9pbnQpO1xuICAgICAgbWlkZGxlLmZsYXR0ZW4oNCk7XG4gICAgICBtaWRkbGUuc21vb3RoKCk7XG4gICAgICBtaWRkbGUuc2ltcGxpZnkoKTtcblxuICAgICAgLy8gdXRpbC50cnVlR3JvdXAoZ3JvdXApO1xuXG4gICAgICBsZXQgaW50ZXJzZWN0aW9ucyA9IG1pZGRsZS5nZXRDcm9zc2luZ3MoKTtcbiAgICAgIGlmIChpbnRlcnNlY3Rpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLy8gd2UgY3JlYXRlIGEgY29weSBvZiB0aGUgcGF0aCBiZWNhdXNlIHJlc29sdmVDcm9zc2luZ3MoKSBzcGxpdHMgc291cmNlIHBhdGhcbiAgICAgICAgbGV0IHBhdGhDb3B5ID0gbmV3IFBhdGgoKTtcbiAgICAgICAgcGF0aENvcHkuY29weUNvbnRlbnQobWlkZGxlKTtcbiAgICAgICAgcGF0aENvcHkudmlzaWJsZSA9IGZhbHNlO1xuXG4gICAgICAgIGxldCBkaXZpZGVkUGF0aCA9IHBhdGhDb3B5LnJlc29sdmVDcm9zc2luZ3MoKTtcbiAgICAgICAgZGl2aWRlZFBhdGgudmlzaWJsZSA9IGZhbHNlO1xuXG5cbiAgICAgICAgbGV0IGVuY2xvc2VkTG9vcHMgPSB1dGlsLmZpbmRJbnRlcmlvckN1cnZlcyhkaXZpZGVkUGF0aCk7XG5cbiAgICAgICAgaWYgKGVuY2xvc2VkTG9vcHMpIHtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVuY2xvc2VkTG9vcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGVuY2xvc2VkTG9vcHNbaV0udmlzaWJsZSA9IHRydWU7XG4gICAgICAgICAgICBlbmNsb3NlZExvb3BzW2ldLmNsb3NlZCA9IHRydWU7XG4gICAgICAgICAgICBlbmNsb3NlZExvb3BzW2ldLmZpbGxDb2xvciA9IG5ldyBDb2xvcigwLCAwKTsgLy8gdHJhbnNwYXJlbnRcbiAgICAgICAgICAgIGVuY2xvc2VkTG9vcHNbaV0uZGF0YS5pbnRlcmlvciA9IHRydWU7XG4gICAgICAgICAgICBlbmNsb3NlZExvb3BzW2ldLmRhdGEudHJhbnNwYXJlbnQgPSB0cnVlO1xuICAgICAgICAgICAgLy8gZW5jbG9zZWRMb29wc1tpXS5ibGVuZE1vZGUgPSAnbXVsdGlwbHknO1xuICAgICAgICAgICAgZ3JvdXAuYWRkQ2hpbGQoZW5jbG9zZWRMb29wc1tpXSk7XG4gICAgICAgICAgICBlbmNsb3NlZExvb3BzW2ldLnNlbmRUb0JhY2soKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcGF0aENvcHkucmVtb3ZlKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBjb25zb2xlLmxvZygnbm8gaW50ZXJzZWN0aW9ucycpO1xuICAgICAgfVxuXG4gICAgICBncm91cC5kYXRhLmNvbG9yID0gYm91bmRzLmZpbGxDb2xvcjtcbiAgICAgIGdyb3VwLmRhdGEuc2NhbGUgPSAxOyAvLyBpbml0IHZhcmlhYmxlIHRvIHRyYWNrIHNjYWxlIGNoYW5nZXNcbiAgICAgIGdyb3VwLmRhdGEucm90YXRpb24gPSAwOyAvLyBpbml0IHZhcmlhYmxlIHRvIHRyYWNrIHJvdGF0aW9uIGNoYW5nZXNcblxuICAgICAgbGV0IGNoaWxkcmVuID0gZ3JvdXAuZ2V0SXRlbXMoe1xuICAgICAgICBtYXRjaDogZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgIHJldHVybiBpdGVtLm5hbWUgIT09ICdtaWRkbGUnXG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBjb25zb2xlLmxvZygnLS0tLS0nKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKGdyb3VwKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKGNoaWxkcmVuKTtcbiAgICAgIC8vIGdyb3VwLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgIGxldCB1bml0ZWRQYXRoID0gbmV3IFBhdGgoKTtcbiAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGggPiAxKSB7XG4gICAgICAgIGxldCBhY2N1bXVsYXRvciA9IG5ldyBQYXRoKCk7XG4gICAgICAgIGFjY3VtdWxhdG9yLmNvcHlDb250ZW50KGNoaWxkcmVuWzBdKTtcbiAgICAgICAgYWNjdW11bGF0b3IudmlzaWJsZSA9IGZhbHNlO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBsZXQgb3RoZXJQYXRoID0gbmV3IFBhdGgoKTtcbiAgICAgICAgICBvdGhlclBhdGguY29weUNvbnRlbnQoY2hpbGRyZW5baV0pO1xuICAgICAgICAgIG90aGVyUGF0aC52aXNpYmxlID0gZmFsc2U7XG5cbiAgICAgICAgICB1bml0ZWRQYXRoID0gYWNjdW11bGF0b3IudW5pdGUob3RoZXJQYXRoKTtcbiAgICAgICAgICBvdGhlclBhdGgucmVtb3ZlKCk7XG4gICAgICAgICAgYWNjdW11bGF0b3IgPSB1bml0ZWRQYXRoO1xuICAgICAgICB9XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGNoaWxkcmVuWzBdIGlzIHVuaXRlZCBncm91cFxuICAgICAgICB1bml0ZWRQYXRoLmNvcHlDb250ZW50KGNoaWxkcmVuWzBdKTtcbiAgICAgIH1cblxuICAgICAgdW5pdGVkUGF0aC52aXNpYmxlID0gZmFsc2U7XG4gICAgICB1bml0ZWRQYXRoLmRhdGEubmFtZSA9ICdtYXNrJztcblxuICAgICAgZ3JvdXAuYWRkQ2hpbGQodW5pdGVkUGF0aCk7XG4gICAgICB1bml0ZWRQYXRoLnNlbmRUb0JhY2soKTtcblxuICAgICAgbGFzdENoaWxkID0gZ3JvdXA7XG5cbiAgICAgIE1PVkVTLnB1c2goe1xuICAgICAgICB0eXBlOiAnbmV3R3JvdXAnLFxuICAgICAgICBpZDogZ3JvdXAuaWRcbiAgICAgIH0pO1xuXG4gICAgICBpZiAocnVuQW5pbWF0aW9ucykge1xuICAgICAgICBncm91cC5hbmltYXRlKFxuICAgICAgICAgIFt7XG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgIHNjYWxlOiAwLjlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXR0aW5nczoge1xuICAgICAgICAgICAgICBkdXJhdGlvbjogMTAwLFxuICAgICAgICAgICAgICBlYXNpbmc6IFwiZWFzZU91dFwiLFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICBzY2FsZTogMS4xMVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldHRpbmdzOiB7XG4gICAgICAgICAgICAgIGR1cmF0aW9uOiAxMDAsXG4gICAgICAgICAgICAgIGVhc2luZzogXCJlYXNlSW5cIlxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1dXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IHBpbmNoaW5nO1xuICAgIGxldCBwaW5jaGVkR3JvdXAsIGxhc3RTY2FsZSwgbGFzdFJvdGF0aW9uO1xuICAgIGxldCBvcmlnaW5hbFBvc2l0aW9uLCBvcmlnaW5hbFJvdGF0aW9uLCBvcmlnaW5hbFNjYWxlO1xuXG4gICAgZnVuY3Rpb24gcGluY2hTdGFydChldmVudCkge1xuICAgICAgY29uc29sZS5sb2coJ3BpbmNoU3RhcnQnLCBldmVudC5jZW50ZXIpO1xuICAgICAgaGFtbWVyTWFuYWdlci5nZXQoJ3BhbicpLnNldCh7ZW5hYmxlOiBmYWxzZX0pO1xuICAgICAgY29uc3QgcG9pbnRlciA9IGV2ZW50LmNlbnRlcixcbiAgICAgICAgICBwb2ludCA9IG5ldyBQb2ludChwb2ludGVyLngsIHBvaW50ZXIueSksXG4gICAgICAgICAgaGl0UmVzdWx0ID0gcGFwZXIucHJvamVjdC5oaXRUZXN0KHBvaW50LCBoaXRPcHRpb25zKTtcblxuICAgICAgaWYgKGhpdFJlc3VsdCkge1xuICAgICAgICBwaW5jaGluZyA9IHRydWU7XG4gICAgICAgIHBpbmNoZWRHcm91cCA9IGhpdFJlc3VsdC5pdGVtLnBhcmVudDtcbiAgICAgICAgbGFzdFNjYWxlID0gMTtcbiAgICAgICAgbGFzdFJvdGF0aW9uID0gZXZlbnQucm90YXRpb247XG5cbiAgICAgICAgb3JpZ2luYWxQb3NpdGlvbiA9IHBpbmNoZWRHcm91cC5wb3NpdGlvbjtcbiAgICAgICAgLy8gb3JpZ2luYWxSb3RhdGlvbiA9IHBpbmNoZWRHcm91cC5yb3RhdGlvbjtcbiAgICAgICAgb3JpZ2luYWxSb3RhdGlvbiA9IHBpbmNoZWRHcm91cC5kYXRhLnJvdGF0aW9uO1xuICAgICAgICBvcmlnaW5hbFNjYWxlID0gcGluY2hlZEdyb3VwLmRhdGEuc2NhbGU7XG5cbiAgICAgICAgaWYgKHJ1bkFuaW1hdGlvbnMpIHtcbiAgICAgICAgICBwaW5jaGVkR3JvdXAuYW5pbWF0ZSh7XG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgIHNjYWxlOiAxLjI1XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgICAgICAgZHVyYXRpb246IDEwMCxcbiAgICAgICAgICAgICAgZWFzaW5nOiBcImVhc2VPdXRcIixcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGluY2hlZEdyb3VwID0gbnVsbDtcbiAgICAgICAgY29uc29sZS5sb2coJ2hpdCBubyBpdGVtJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGluY2hNb3ZlKGV2ZW50KSB7XG4gICAgICBjb25zb2xlLmxvZygncGluY2hNb3ZlJyk7XG4gICAgICBpZiAoISFwaW5jaGVkR3JvdXApIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ3BpbmNobW92ZScsIGV2ZW50KTtcbiAgICAgICAgLy8gY29uc29sZS5sb2cocGluY2hlZEdyb3VwKTtcbiAgICAgICAgbGV0IGN1cnJlbnRTY2FsZSA9IGV2ZW50LnNjYWxlO1xuICAgICAgICBsZXQgc2NhbGVEZWx0YSA9IGN1cnJlbnRTY2FsZSAvIGxhc3RTY2FsZTtcbiAgICAgICAgLy8gY29uc29sZS5sb2cobGFzdFNjYWxlLCBjdXJyZW50U2NhbGUsIHNjYWxlRGVsdGEpO1xuICAgICAgICBsYXN0U2NhbGUgPSBjdXJyZW50U2NhbGU7XG5cbiAgICAgICAgbGV0IGN1cnJlbnRSb3RhdGlvbiA9IGV2ZW50LnJvdGF0aW9uO1xuICAgICAgICBsZXQgcm90YXRpb25EZWx0YSA9IGN1cnJlbnRSb3RhdGlvbiAtIGxhc3RSb3RhdGlvbjtcbiAgICAgICAgY29uc29sZS5sb2cobGFzdFJvdGF0aW9uLCBjdXJyZW50Um90YXRpb24sIHJvdGF0aW9uRGVsdGEpO1xuICAgICAgICBsYXN0Um90YXRpb24gPSBjdXJyZW50Um90YXRpb247XG5cbiAgICAgICAgLy8gY29uc29sZS5sb2coYHNjYWxpbmcgYnkgJHtzY2FsZURlbHRhfWApO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhgcm90YXRpbmcgYnkgJHtyb3RhdGlvbkRlbHRhfWApO1xuXG4gICAgICAgIHBpbmNoZWRHcm91cC5wb3NpdGlvbiA9IGV2ZW50LmNlbnRlcjtcbiAgICAgICAgcGluY2hlZEdyb3VwLnNjYWxlKHNjYWxlRGVsdGEpO1xuICAgICAgICBwaW5jaGVkR3JvdXAucm90YXRlKHJvdGF0aW9uRGVsdGEpO1xuXG4gICAgICAgIHBpbmNoZWRHcm91cC5kYXRhLnNjYWxlICo9IHNjYWxlRGVsdGE7XG4gICAgICAgIHBpbmNoZWRHcm91cC5kYXRhLnJvdGF0aW9uICs9IHJvdGF0aW9uRGVsdGE7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IGxhc3RFdmVudDtcbiAgICBmdW5jdGlvbiBwaW5jaEVuZChldmVudCkge1xuICAgICAgLy8gd2FpdCAyNTAgbXMgdG8gcHJldmVudCBtaXN0YWtlbiBwYW4gcmVhZGluZ3NcbiAgICAgIGxhc3RFdmVudCA9IGV2ZW50O1xuICAgICAgaWYgKCEhcGluY2hlZEdyb3VwKSB7XG4gICAgICAgIHBpbmNoZWRHcm91cC5kYXRhLnVwZGF0ZSA9IHRydWU7XG4gICAgICAgIGxldCBtb3ZlID0ge1xuICAgICAgICAgIGlkOiBwaW5jaGVkR3JvdXAuaWQsXG4gICAgICAgICAgdHlwZTogJ3RyYW5zZm9ybSdcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHBpbmNoZWRHcm91cC5wb3NpdGlvbiAhPSBvcmlnaW5hbFBvc2l0aW9uKSB7XG4gICAgICAgICAgbW92ZS5wb3NpdGlvbiA9IG9yaWdpbmFsUG9zaXRpb247XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGluY2hlZEdyb3VwLmRhdGEucm90YXRpb24gIT0gb3JpZ2luYWxSb3RhdGlvbikge1xuICAgICAgICAgIG1vdmUucm90YXRpb24gPSBvcmlnaW5hbFJvdGF0aW9uIC0gcGluY2hlZEdyb3VwLmRhdGEucm90YXRpb247XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGluY2hlZEdyb3VwLmRhdGEuc2NhbGUgIT0gb3JpZ2luYWxTY2FsZSkge1xuICAgICAgICAgIG1vdmUuc2NhbGUgPSBvcmlnaW5hbFNjYWxlIC8gcGluY2hlZEdyb3VwLmRhdGEuc2NhbGU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zb2xlLmxvZygnZmluYWwgc2NhbGUnLCBwaW5jaGVkR3JvdXAuZGF0YS5zY2FsZSk7XG4gICAgICAgIGNvbnNvbGUubG9nKG1vdmUpO1xuXG4gICAgICAgIE1PVkVTLnB1c2gobW92ZSk7XG5cbiAgICAgICAgaWYgKGV2ZW50LnZlbG9jaXR5ID4gMSkge1xuICAgICAgICAgIC8vIGRpc3Bvc2Ugb2YgZ3JvdXAgb2Zmc2NyZWVuXG4gICAgICAgICAgdGhyb3dQaW5jaGVkR3JvdXAoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIChydW5BbmltYXRpb25zKSB7XG4gICAgICAgIC8vICAgcGluY2hlZEdyb3VwLmFuaW1hdGUoe1xuICAgICAgICAvLyAgICAgcHJvcGVydGllczoge1xuICAgICAgICAvLyAgICAgICBzY2FsZTogMC44XG4gICAgICAgIC8vICAgICB9LFxuICAgICAgICAvLyAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgLy8gICAgICAgZHVyYXRpb246IDEwMCxcbiAgICAgICAgLy8gICAgICAgZWFzaW5nOiBcImVhc2VPdXRcIixcbiAgICAgICAgLy8gICAgIH1cbiAgICAgICAgLy8gICB9KTtcbiAgICAgICAgLy8gfVxuICAgICAgfVxuICAgICAgcGluY2hpbmcgPSBmYWxzZTtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIGhhbW1lck1hbmFnZXIuZ2V0KCdwYW4nKS5zZXQoe2VuYWJsZTogdHJ1ZX0pO1xuICAgICAgfSwgMjUwKTtcbiAgICB9XG5cbiAgICBjb25zdCBoaXRPcHRpb25zID0ge1xuICAgICAgc2VnbWVudHM6IGZhbHNlLFxuICAgICAgc3Ryb2tlOiB0cnVlLFxuICAgICAgZmlsbDogdHJ1ZSxcbiAgICAgIHRvbGVyYW5jZTogNVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBzaW5nbGVUYXAoZXZlbnQpIHtcbiAgICAgIHJldHVybjtcbiAgICAgIGNvbnN0IHBvaW50ZXIgPSBldmVudC5jZW50ZXIsXG4gICAgICAgICAgcG9pbnQgPSBuZXcgUG9pbnQocG9pbnRlci54LCBwb2ludGVyLnkpLFxuICAgICAgICAgIGhpdFJlc3VsdCA9IHBhcGVyLnByb2plY3QuaGl0VGVzdChwb2ludCwgaGl0T3B0aW9ucyk7XG5cbiAgICAgIGlmIChoaXRSZXN1bHQpIHtcbiAgICAgICAgbGV0IGl0ZW0gPSBoaXRSZXN1bHQuaXRlbTtcbiAgICAgICAgaXRlbS5zZWxlY3RlZCA9ICFpdGVtLnNlbGVjdGVkO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRvdWJsZVRhcChldmVudCkge1xuICAgICAgY29uc3QgcG9pbnRlciA9IGV2ZW50LmNlbnRlcixcbiAgICAgICAgICBwb2ludCA9IG5ldyBQb2ludChwb2ludGVyLngsIHBvaW50ZXIueSksXG4gICAgICAgICAgaGl0UmVzdWx0ID0gcGFwZXIucHJvamVjdC5oaXRUZXN0KHBvaW50LCBoaXRPcHRpb25zKTtcblxuICAgICAgaWYgKGhpdFJlc3VsdCkge1xuICAgICAgICBsZXQgaXRlbSA9IGhpdFJlc3VsdC5pdGVtO1xuICAgICAgICBsZXQgcGFyZW50ID0gaXRlbS5wYXJlbnQ7XG5cbiAgICAgICAgaWYgKGl0ZW0uZGF0YS5pbnRlcmlvcikge1xuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdpbnRlcmlvcicpO1xuICAgICAgICAgIGl0ZW0uZGF0YS50cmFuc3BhcmVudCA9ICFpdGVtLmRhdGEudHJhbnNwYXJlbnQ7XG5cbiAgICAgICAgICBpZiAoaXRlbS5kYXRhLnRyYW5zcGFyZW50KSB7XG4gICAgICAgICAgICBpdGVtLmZpbGxDb2xvciA9IHRyYW5zcGFyZW50O1xuICAgICAgICAgICAgaXRlbS5zdHJva2VDb2xvciA9IHRyYW5zcGFyZW50O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpdGVtLmZpbGxDb2xvciA9IHBhcmVudC5kYXRhLmNvbG9yO1xuICAgICAgICAgICAgaXRlbS5zdHJva2VDb2xvciA9IHBhcmVudC5kYXRhLmNvbG9yO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIE1PVkVTLnB1c2goe1xuICAgICAgICAgICAgdHlwZTogJ2ZpbGxDaGFuZ2UnLFxuICAgICAgICAgICAgaWQ6IGl0ZW0uaWQsXG4gICAgICAgICAgICBmaWxsOiBwYXJlbnQuZGF0YS5jb2xvcixcbiAgICAgICAgICAgIHRyYW5zcGFyZW50OiBpdGVtLmRhdGEudHJhbnNwYXJlbnRcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnbm90IGludGVyaW9yJylcbiAgICAgICAgfVxuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwaW5jaGVkR3JvdXAgPSBudWxsO1xuICAgICAgICBjb25zb2xlLmxvZygnaGl0IG5vIGl0ZW0nKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCB2ZWxvY2l0eU11bHRpcGxpZXIgPSAyNTtcbiAgICBmdW5jdGlvbiB0aHJvd1BpbmNoZWRHcm91cCgpIHtcbiAgICAgIGNvbnNvbGUubG9nKHBpbmNoZWRHcm91cC5wb3NpdGlvbik7XG4gICAgICBpZiAocGluY2hlZEdyb3VwLnBvc2l0aW9uLnggPD0gMCAtIHBpbmNoZWRHcm91cC5ib3VuZHMud2lkdGggfHxcbiAgICAgICAgICBwaW5jaGVkR3JvdXAucG9zaXRpb24ueCA+PSB2aWV3V2lkdGggKyBwaW5jaGVkR3JvdXAuYm91bmRzLndpZHRoIHx8XG4gICAgICAgICAgcGluY2hlZEdyb3VwLnBvc2l0aW9uLnkgPD0gMCAtIHBpbmNoZWRHcm91cC5ib3VuZHMuaGVpZ2h0IHx8XG4gICAgICAgICAgcGluY2hlZEdyb3VwLnBvc2l0aW9uLnkgPj0gdmlld0hlaWdodCArIHBpbmNoZWRHcm91cC5ib3VuZHMuaGVpZ2h0KSB7XG4gICAgICAgICAgICBwaW5jaGVkR3JvdXAuZGF0YS5vZmZTY3JlZW4gPSB0cnVlO1xuICAgICAgICAgICAgcGluY2hlZEdyb3VwLnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRocm93UGluY2hlZEdyb3VwKTtcbiAgICAgIHBpbmNoZWRHcm91cC5wb3NpdGlvbi54ICs9IGxhc3RFdmVudC52ZWxvY2l0eVggKiB2ZWxvY2l0eU11bHRpcGxpZXI7XG4gICAgICBwaW5jaGVkR3JvdXAucG9zaXRpb24ueSArPSBsYXN0RXZlbnQudmVsb2NpdHlZICogdmVsb2NpdHlNdWx0aXBsaWVyO1xuICAgIH1cblxuICAgIHZhciBoYW1tZXJNYW5hZ2VyID0gbmV3IEhhbW1lci5NYW5hZ2VyKCRjYW52YXNbMF0pO1xuXG4gICAgaGFtbWVyTWFuYWdlci5hZGQobmV3IEhhbW1lci5UYXAoeyBldmVudDogJ2RvdWJsZXRhcCcsIHRhcHM6IDIgfSkpO1xuICAgIGhhbW1lck1hbmFnZXIuYWRkKG5ldyBIYW1tZXIuVGFwKHsgZXZlbnQ6ICdzaW5nbGV0YXAnIH0pKTtcbiAgICBoYW1tZXJNYW5hZ2VyLmFkZChuZXcgSGFtbWVyLlBhbih7IGRpcmVjdGlvbjogSGFtbWVyLkRJUkVDVElPTl9BTEwgfSkpO1xuICAgIGhhbW1lck1hbmFnZXIuYWRkKG5ldyBIYW1tZXIuUGluY2goKSk7XG5cbiAgICBoYW1tZXJNYW5hZ2VyLmdldCgnZG91YmxldGFwJykucmVjb2duaXplV2l0aCgnc2luZ2xldGFwJyk7XG4gICAgaGFtbWVyTWFuYWdlci5nZXQoJ3NpbmdsZXRhcCcpLnJlcXVpcmVGYWlsdXJlKCdkb3VibGV0YXAnKTtcbiAgICBoYW1tZXJNYW5hZ2VyLmdldCgncGFuJykucmVxdWlyZUZhaWx1cmUoJ3BpbmNoJyk7XG5cbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdzaW5nbGV0YXAnLCBzaW5nbGVUYXApO1xuICAgIGhhbW1lck1hbmFnZXIub24oJ2RvdWJsZXRhcCcsIGRvdWJsZVRhcCk7XG5cbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdwYW5zdGFydCcsIHBhblN0YXJ0KTtcbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdwYW5tb3ZlJywgcGFuTW92ZSk7XG4gICAgaGFtbWVyTWFuYWdlci5vbigncGFuZW5kJywgcGFuRW5kKTtcblxuICAgIGhhbW1lck1hbmFnZXIub24oJ3BpbmNoc3RhcnQnLCBwaW5jaFN0YXJ0KTtcbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdwaW5jaG1vdmUnLCBwaW5jaE1vdmUpO1xuICAgIGhhbW1lck1hbmFnZXIub24oJ3BpbmNoZW5kJywgcGluY2hFbmQpO1xuICAgIGhhbW1lck1hbmFnZXIub24oJ3BpbmNoY2FuY2VsJywgZnVuY3Rpb24oKSB7IGhhbW1lck1hbmFnZXIuZ2V0KCdwYW4nKS5zZXQoe2VuYWJsZTogdHJ1ZX0pOyB9KTsgLy8gbWFrZSBzdXJlIGl0J3MgcmVlbmFibGVkXG4gIH1cblxuICBmdW5jdGlvbiBuZXdQcmVzc2VkKCkge1xuICAgIGNvbnNvbGUubG9nKCduZXcgcHJlc3NlZCcpO1xuXG4gICAgcGFwZXIucHJvamVjdC5hY3RpdmVMYXllci5yZW1vdmVDaGlsZHJlbigpO1xuICB9XG5cbiAgZnVuY3Rpb24gdW5kb1ByZXNzZWQoKSB7XG4gICAgY29uc29sZS5sb2coJ3VuZG8gcHJlc3NlZCcpO1xuICAgIGlmICghKE1PVkVTLmxlbmd0aCA+IDApKSB7XG4gICAgICBjb25zb2xlLmxvZygnbm8gbW92ZXMgeWV0Jyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IGxhc3RNb3ZlID0gTU9WRVMucG9wKCk7XG4gICAgbGV0IGl0ZW0gPSBwcm9qZWN0LmdldEl0ZW0oe1xuICAgICAgaWQ6IGxhc3RNb3ZlLmlkXG4gICAgfSk7XG5cbiAgICBpZiAoaXRlbSkge1xuICAgICAgaXRlbS52aXNpYmxlID0gdHJ1ZTsgLy8gbWFrZSBzdXJlXG4gICAgICBzd2l0Y2gobGFzdE1vdmUudHlwZSkge1xuICAgICAgICBjYXNlICduZXdHcm91cCc6XG4gICAgICAgICAgY29uc29sZS5sb2coJ3JlbW92aW5nIGdyb3VwJyk7XG4gICAgICAgICAgaXRlbS5yZW1vdmUoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZmlsbENoYW5nZSc6XG4gICAgICAgICAgaWYgKGxhc3RNb3ZlLnRyYW5zcGFyZW50KSB7XG4gICAgICAgICAgICBpdGVtLmZpbGxDb2xvciA9IGxhc3RNb3ZlLmZpbGw7XG4gICAgICAgICAgICBpdGVtLnN0cm9rZUNvbG9yID0gbGFzdE1vdmUuZmlsbDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaXRlbS5maWxsQ29sb3IgPSB0cmFuc3BhcmVudDtcbiAgICAgICAgICAgIGl0ZW0uc3Ryb2tlQ29sb3IgPSB0cmFuc3BhcmVudDtcbiAgICAgICAgICB9XG4gICAgICAgIGNhc2UgJ3RyYW5zZm9ybSc6XG4gICAgICAgICAgaWYgKCEhbGFzdE1vdmUucG9zaXRpb24pIHtcbiAgICAgICAgICAgIGl0ZW0ucG9zaXRpb24gPSBsYXN0TW92ZS5wb3NpdGlvblxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoISFsYXN0TW92ZS5yb3RhdGlvbikge1xuICAgICAgICAgICAgaXRlbS5yb3RhdGlvbiA9IGxhc3RNb3ZlLnJvdGF0aW9uO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoISFsYXN0TW92ZS5zY2FsZSkge1xuICAgICAgICAgICAgaXRlbS5zY2FsZShsYXN0TW92ZS5zY2FsZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGNvbnNvbGUubG9nKCd1bmtub3duIGNhc2UnKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coJ2NvdWxkIG5vdCBmaW5kIG1hdGNoaW5nIGl0ZW0nKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBwbGF5UHJlc3NlZCgpIHtcbiAgICBjb25zb2xlLmxvZygncGxheSBwcmVzc2VkJyk7XG4gIH1cblxuICBmdW5jdGlvbiB0aXBzUHJlc3NlZCgpIHtcbiAgICBjb25zb2xlLmxvZygndGlwcyBwcmVzc2VkJyk7XG4gIH1cblxuICBmdW5jdGlvbiBzaGFyZVByZXNzZWQoKSB7XG4gICAgY29uc29sZS5sb2coJ3NoYXJlIHByZXNzZWQnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXROZXcoKSB7XG4gICAgJCgnLm1haW4tY29udHJvbHMgLm5ldycpLm9uKCdjbGljayB0YXAgdG91Y2gnLCBuZXdQcmVzc2VkKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRVbmRvKCkge1xuICAgICQoJy5tYWluLWNvbnRyb2xzIC51bmRvJykub24oJ2NsaWNrJywgdW5kb1ByZXNzZWQpO1xuICB9XG4gIGZ1bmN0aW9uIGluaXRQbGF5KCkge1xuICAgICQoJy5tYWluLWNvbnRyb2xzIC5wbGF5Jykub24oJ2NsaWNrJywgcGxheVByZXNzZWQpO1xuICB9XG4gIGZ1bmN0aW9uIGluaXRUaXBzKCkge1xuICAgICQoJy5hdXgtY29udHJvbHMgLnRpcHMnKS5vbignY2xpY2snLCB0aXBzUHJlc3NlZCk7XG4gIH1cbiAgZnVuY3Rpb24gaW5pdFNoYXJlKCkge1xuICAgICQoJy5hdXgtY29udHJvbHMgLnNoYXJlJykub24oJ2NsaWNrJywgc2hhcmVQcmVzc2VkKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRyYXdDaXJjbGUoKSB7XG4gICAgbGV0IGNpcmNsZSA9IG5ldyBQYXRoLkNpcmNsZSh7XG4gICAgICBjZW50ZXI6IFs0MDAsIDQwMF0sXG4gICAgICByYWRpdXM6IDEwMCxcbiAgICAgIHN0cm9rZUNvbG9yOiAnZ3JlZW4nLFxuICAgICAgZmlsbENvbG9yOiAnZ3JlZW4nXG4gICAgfSk7XG4gICAgbGV0IGdyb3VwID0gbmV3IEdyb3VwKGNpcmNsZSk7XG4gIH1cblxuICBmdW5jdGlvbiBtYWluKCkge1xuICAgIGluaXRDb250cm9sUGFuZWwoKTtcbiAgICBkcmF3Q2lyY2xlKCk7XG4gICAgaW5pdFZpZXdWYXJzKCk7XG4gIH1cblxuICBtYWluKCk7XG59KTtcbiIsIi8vIENvbnZlcnRzIGZyb20gZGVncmVlcyB0byByYWRpYW5zLlxuZXhwb3J0IGZ1bmN0aW9uIHJhZChkZWdyZWVzKSB7XG4gIHJldHVybiBkZWdyZWVzICogTWF0aC5QSSAvIDE4MDtcbn07XG5cbi8vIENvbnZlcnRzIGZyb20gcmFkaWFucyB0byBkZWdyZWVzLlxuZXhwb3J0IGZ1bmN0aW9uIGRlZyhyYWRpYW5zKSB7XG4gIHJldHVybiByYWRpYW5zICogMTgwIC8gTWF0aC5QSTtcbn07XG5cbi8vIGRpc3RhbmNlIGJldHdlZW4gdHdvIHBvaW50c1xuZXhwb3J0IGZ1bmN0aW9uIGRlbHRhKHAxLCBwMikge1xuICByZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KHAxLnggLSBwMi54LCAyKSArIE1hdGgucG93KHAxLnkgLSBwMi55LCAyKSk7IC8vIHB5dGhhZ29yZWFuIVxufVxuXG4vLyByZXR1cm5zIGFuIGFycmF5IG9mIHRoZSBpbnRlcmlvciBjdXJ2ZXMgb2YgYSBnaXZlbiBjb21wb3VuZCBwYXRoXG5leHBvcnQgZnVuY3Rpb24gZmluZEludGVyaW9yQ3VydmVzKHBhdGgpIHtcbiAgbGV0IGludGVyaW9yQ3VydmVzID0gW107XG4gIGlmICghcGF0aCB8fCAhcGF0aC5jaGlsZHJlbiB8fCAhcGF0aC5jaGlsZHJlbi5sZW5ndGgpIHJldHVybjtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHBhdGguY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICBsZXQgY2hpbGQgPSBwYXRoLmNoaWxkcmVuW2ldO1xuXG4gICAgaWYgKGNoaWxkLmNsb3NlZCl7XG4gICAgICBpbnRlcmlvckN1cnZlcy5wdXNoKG5ldyBQYXRoKGNoaWxkLnNlZ21lbnRzKSk7XG4gICAgfVxuICB9XG5cbiAgcGF0aC5yZW1vdmUoKTtcbiAgcmV0dXJuIGludGVyaW9yQ3VydmVzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJ1ZUdyb3VwKGdyb3VwKSB7XG4gIGxldCBib3VuZHMgPSBncm91cC5fbmFtZWRDaGlsZHJlbi5ib3VuZHNbMF0sXG4gICAgICBtaWRkbGUgPSBncm91cC5fbmFtZWRDaGlsZHJlbi5taWRkbGVbMF07XG5cbiAgbGV0IG1pZGRsZUNvcHkgPSBuZXcgUGF0aCgpO1xuICBtaWRkbGVDb3B5LmNvcHlDb250ZW50KG1pZGRsZSk7XG4gIG1pZGRsZUNvcHkudmlzaWJsZSA9IGZhbHNlO1xuICBsZXQgZGl2aWRlZFBhdGggPSBtaWRkbGVDb3B5LnJlc29sdmVDcm9zc2luZ3MoKTtcbiAgZGl2aWRlZFBhdGgudmlzaWJsZSA9IGZhbHNlO1xuICBCYXNlLmVhY2goZGl2aWRlZFBhdGguY2hpbGRyZW4sIGZ1bmN0aW9uKGNoaWxkLCBpKSB7XG4gICAgaWYgKGNoaWxkLmNsb3NlZCkge1xuICAgICAgY2hpbGQuc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2hpbGQuc2VsZWN0ZWQgPSB0cnVlO1xuICAgIH1cbiAgICAvLyBjb25zb2xlLmxvZyhjaGlsZCwgaSk7XG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cnVlUGF0aChwYXRoKSB7XG4gIC8vIGNvbnNvbGUubG9nKGdyb3VwKTtcbiAgLy8gaWYgKHBhdGggJiYgcGF0aC5jaGlsZHJlbiAmJiBwYXRoLmNoaWxkcmVuLmxlbmd0aCA+IDAgJiYgcGF0aC5fbmFtZWRDaGlsZHJlblsnbWlkZGxlJ10pIHtcbiAgLy8gICBsZXQgcGF0aENvcHkgPSBuZXcgUGF0aCgpO1xuICAvLyAgIGNvbnNvbGUubG9nKHBhdGguX25hbWVkQ2hpbGRyZW5bJ21pZGRsZSddKTtcbiAgLy8gICBwYXRoQ29weS5jb3B5Q29udGVudChwYXRoLl9uYW1lZENoaWxkcmVuWydtaWRkbGUnXSk7XG4gIC8vICAgY29uc29sZS5sb2cocGF0aENvcHkpO1xuICAvLyB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjaGVja1BvcHMoKSB7XG4gIGxldCBncm91cHMgPSBwYXBlci5wcm9qZWN0LmdldEl0ZW1zKHtcbiAgICBjbGFzc05hbWU6ICdHcm91cCcsXG4gICAgbWF0Y2g6IGZ1bmN0aW9uKGVsKSB7XG4gICAgICByZXR1cm4gKCEhZWwuZGF0YSAmJiBlbC5kYXRhLnVwZGF0ZSk7XG4gICAgfVxuICB9KTtcbn1cblxuLy8gaHR0cHM6Ly9ncm91cHMuZ29vZ2xlLmNvbS9mb3J1bS8jIXRvcGljL3BhcGVyanMvVUQ4TDBNVHlSZVFcbmV4cG9ydCBmdW5jdGlvbiBvdmVybGFwcyhwYXRoLCBvdGhlcikge1xuICByZXR1cm4gIShwYXRoLmdldEludGVyc2VjdGlvbnMob3RoZXIpLmxlbmd0aCA9PT0gMCk7XG59XG5cbi8vIGh0dHBzOi8vZ3JvdXBzLmdvb2dsZS5jb20vZm9ydW0vIyF0b3BpYy9wYXBlcmpzL1VEOEwwTVR5UmVRXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VPbmVQYXRoKHBhdGgsIG90aGVycykge1xuICBsZXQgaSwgbWVyZ2VkLCBvdGhlciwgdW5pb24sIF9pLCBfbGVuLCBfcmVmO1xuICBmb3IgKGkgPSBfaSA9IDAsIF9sZW4gPSBvdGhlcnMubGVuZ3RoOyBfaSA8IF9sZW47IGkgPSArK19pKSB7XG4gICAgb3RoZXIgPSBvdGhlcnNbaV07XG4gICAgaWYgKG92ZXJsYXBzKHBhdGgsIG90aGVyKSkge1xuICAgICAgdW5pb24gPSBwYXRoLnVuaXRlKG90aGVyKTtcbiAgICAgIG1lcmdlZCA9IG1lcmdlT25lUGF0aCh1bmlvbiwgb3RoZXJzLnNsaWNlKGkgKyAxKSk7XG4gICAgICByZXR1cm4gKF9yZWYgPSBvdGhlcnMuc2xpY2UoMCwgaSkpLmNvbmNhdC5hcHBseShfcmVmLCBtZXJnZWQpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gb3RoZXJzLmNvbmNhdChwYXRoKTtcbn07XG5cbi8vIGh0dHBzOi8vZ3JvdXBzLmdvb2dsZS5jb20vZm9ydW0vIyF0b3BpYy9wYXBlcmpzL1VEOEwwTVR5UmVRXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VQYXRocyhwYXRocykge1xuICB2YXIgcGF0aCwgcmVzdWx0LCBfaSwgX2xlbjtcbiAgcmVzdWx0ID0gW107XG4gIGZvciAoX2kgPSAwLCBfbGVuID0gcGF0aHMubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICBwYXRoID0gcGF0aHNbX2ldO1xuICAgIHJlc3VsdCA9IG1lcmdlT25lUGF0aChwYXRoLCByZXN1bHQpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59O1xuIl19
