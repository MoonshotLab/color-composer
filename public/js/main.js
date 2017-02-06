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

  function hitTestBounds(point) {
    return util.hitTestBounds(point, paper.project.activeLayer.children);
  }

  function hitTestGroupBounds(point) {
    var groups = paper.project.getItems({
      className: 'Group'
    });
    return util.hitTestBounds(point, groups);
  }

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
      // drawCircle();

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
        name: 'bounds',
        visible: false
      });

      middle = new Path({
        strokeColor: window.kan.currentColor,
        name: 'middle',
        strokeWidth: 1,
        visible: true
      });

      bounds.add(point);
      middle.add(point);
    }

    var min = 1;
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
        // if (size >= max) size = max;
        size = Math.max(Math.min(size, max), min); // clamp size to [min, max]
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

      group.replaceWith(util.trueGroup(group));
      return;

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
          hitResult = hitTestGroupBounds(point);

      if (hitResult) {
        pinching = true;
        // pinchedGroup = hitResult.item.parent;
        pinchedGroup = hitResult;
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

        if (Math.abs(event.velocity) > 1) {
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
      var pointer = event.center,
          point = new Point(pointer.x, pointer.y),
          hitResult = paper.project.hitTest(point, hitOptions);

      if (hitResult) {
        var item = hitResult.item;
        item.selected = !item.selected;
        console.log(item);
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
    // drawCircle();
    initViewVars();
  }

  main();
});

},{"./util":2}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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
exports.hitTestBounds = hitTestBounds;
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

  // let groupCopy = new Group();
  // groupCopy.copyContent(group);

  try {
    var _ret = function () {
      var middleCopy = new Path();
      middleCopy.copyContent(middle);
      var totalLength = middleCopy.length;

      var intersections = middleCopy.getIntersections();
      var dividedPath = middleCopy.resolveCrossings();

      // we want to remove all closed loops from the path, since these are necessarily interior and not first or last
      Base.each(dividedPath.children, function (child, i) {
        if (child.closed) {
          console.log('subtracting closed child');
          dividedPath = dividedPath.subtract(child);
        } else {
          // dividedPath = dividedPath.unite(child);
        }
      });

      console.log(dividedPath);

      if (!!dividedPath.children && dividedPath.children.length > 1) {
        (function () {
          // divided path is a compound path
          var unitedDividedPath = new Path();
          // unitedDividedPath.copyAttributes(dividedPath);
          console.log('before', unitedDividedPath);
          Base.each(dividedPath.children, function (child, i) {
            if (!child.closed) {
              unitedDividedPath = unitedDividedPath.unite(child);
            }
          });
          dividedPath = unitedDividedPath;
          // console.log('after', unitedDividedPath);
          // return;
        })();
      } else {
          // console.log('dividedPath has one child');
        }

      if (intersections.length > 0) {
        // we have to get the nearest location because the exact intersection point has already been removed as a part of resolveCrossings()
        var firstIntersection = dividedPath.getNearestLocation(intersections[0].point);
        // console.log(dividedPath);
        var rest = dividedPath.splitAt(firstIntersection); // dividedPath is now the first segment
        var firstSegment = dividedPath;
        var lastSegment = void 0;

        // firstSegment.strokeColor = 'pink';

        // let circleOne = new Path.Circle({
        //   center: firstIntersection.point,
        //   radius: 5,
        //   strokeColor: 'red'
        // });

        // console.log(intersections);
        if (intersections.length > 1) {
          // console.log('foo');
          // rest.reverse(); // start from end
          var lastIntersection = rest.getNearestLocation(intersections[intersections.length - 1].point);
          // let circleTwo = new Path.Circle({
          //   center: lastIntersection.point,
          //   radius: 5,
          //   strokeColor: 'green'
          // });
          lastSegment = rest.splitAt(lastIntersection); // rest is now everything BUT the first and last segments
          if (!lastSegment || !lastSegment.length) lastSegment = rest;
          rest.reverse();
        } else {
          lastSegment = rest;
        }
        // lastSegment.strokeColor = 'green';

        if (firstSegment.length <= 0.1 * totalLength) {
          middleCopy.subtract(firstSegment);
        }

        if (lastSegment.length <= 0.1 * totalLength) {
          middleCopy.subtract(lastSegment);
        }
      }
      // middleCopy.fullySelected = true;
      // middleCopy.strokeColor = 'pink';
      // middleCopy.visible = true;
      // group._namedChildren.middle[0].replaceWith(middleCopy);
      return {
        v: group
      };
    }();

    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
  } catch (e) {
    console.log('error trueing groups', e);
    return group;
  }
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

function hitTestBounds(point, children) {
  if (!point) return null;

  for (var i = children.length - 1; i >= 0; i--) {
    var child = children[i];
    var bounds = child.strokeBounds;
    if (point.isInside(child.strokeBounds)) {
      return child;
    }
  }

  return null;
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxPQUFPLEdBQVAsR0FBYSxPQUFPLEdBQVAsSUFBYztBQUN6QixXQUFTLENBQUMsU0FBRCxFQUFZLFNBQVosRUFBdUIsU0FBdkIsRUFBa0MsU0FBbEMsRUFBNkMsU0FBN0MsRUFBd0QsU0FBeEQsRUFBbUUsU0FBbkUsRUFBOEUsU0FBOUUsRUFBeUYsU0FBekYsRUFBb0csU0FBcEcsRUFBK0csU0FBL0csRUFBMEgsU0FBMUgsRUFBcUksU0FBckksRUFBZ0osU0FBaEosRUFBMkosU0FBM0osRUFBc0ssU0FBdEssQ0FEZ0I7QUFFekIsZ0JBQWMsU0FGVztBQUd6QixZQUFVLEVBSGU7QUFJekIsU0FBTztBQUprQixDQUEzQjs7QUFPQSxNQUFNLE9BQU4sQ0FBYyxNQUFkOztBQUVBLElBQU0sT0FBTyxRQUFRLFFBQVIsQ0FBYjtBQUNBOztBQUVBLEVBQUUsUUFBRixFQUFZLEtBQVosQ0FBa0IsWUFBVztBQUMzQixNQUFJLFFBQVEsRUFBWixDQUQyQixDQUNYO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxNQUFNLFVBQVUsRUFBRSxNQUFGLENBQWhCO0FBQ0EsTUFBTSxRQUFRLEVBQUUsTUFBRixDQUFkO0FBQ0EsTUFBTSxVQUFVLEVBQUUsbUJBQUYsQ0FBaEI7QUFDQSxNQUFNLGdCQUFnQixLQUF0QjtBQUNBLE1BQU0sY0FBYyxJQUFJLEtBQUosQ0FBVSxDQUFWLEVBQWEsQ0FBYixDQUFwQjs7QUFFQSxNQUFJLGtCQUFKO0FBQUEsTUFBZSxtQkFBZjs7QUFFQSxXQUFTLGFBQVQsQ0FBdUIsS0FBdkIsRUFBOEI7QUFDNUIsV0FBTyxLQUFLLGFB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QyxHQUExQyxFQUErQztBQUM3QyxRQUFJLFFBQVEsU0FBUyxDQUFULENBQVo7QUFDQSxRQUFJLFNBQVMsTUFBTSxZQUFuQjtBQUNBLFFBQUksTUFBTSxRQUFOLENBQWUsTUFBTSxZQUFyQixDQUFKLEVBQXdDO0FBQ3RDLGFBQU8sS0FBUDtBQUNEO0FBQ0Y7O0FBRUQsU0FBTyxJQUFQO0FBQ0QiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwid2luZG93LmthbiA9IHdpbmRvdy5rYW4gfHwge1xuICBwYWxldHRlOiBbXCIjMjAxNzFDXCIsIFwiIzFFMkE0M1wiLCBcIiMyODM3N0RcIiwgXCIjMzUyNzQ3XCIsIFwiI0YyODVBNVwiLCBcIiNDQTJFMjZcIiwgXCIjQjg0NTI2XCIsIFwiI0RBNkMyNlwiLCBcIiM0NTMxMjFcIiwgXCIjOTE2QTQ3XCIsIFwiI0VFQjY0MVwiLCBcIiNGNkVCMTZcIiwgXCIjN0Y3RDMxXCIsIFwiIzZFQUQ3OVwiLCBcIiMyQTQ2MjFcIiwgXCIjRjRFQUUwXCJdLFxuICBjdXJyZW50Q29sb3I6ICcjMjAxNzFDJyxcbiAgbnVtUGF0aHM6IDEwLFxuICBwYXRoczogW10sXG59O1xuXG5wYXBlci5pbnN0YWxsKHdpbmRvdyk7XG5cbmNvbnN0IHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcbi8vIHJlcXVpcmUoJ3BhcGVyLWFuaW1hdGUnKTtcblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gIGxldCBNT1ZFUyA9IFtdOyAvLyBzdG9yZSBnbG9iYWwgbW92ZXMgbGlzdFxuICAvLyBtb3ZlcyA9IFtcbiAgLy8gICB7XG4gIC8vICAgICAndHlwZSc6ICdjb2xvckNoYW5nZScsXG4gIC8vICAgICAnb2xkJzogJyMyMDE3MUMnLFxuICAvLyAgICAgJ25ldyc6ICcjRjI4NUE1J1xuICAvLyAgIH0sXG4gIC8vICAge1xuICAvLyAgICAgJ3R5cGUnOiAnbmV3UGF0aCcsXG4gIC8vICAgICAncmVmJzogJz8/PycgLy8gdXVpZD8gZG9tIHJlZmVyZW5jZT9cbiAgLy8gICB9LFxuICAvLyAgIHtcbiAgLy8gICAgICd0eXBlJzogJ3BhdGhUcmFuc2Zvcm0nLFxuICAvLyAgICAgJ3JlZic6ICc/Pz8nLCAvLyB1dWlkPyBkb20gcmVmZXJlbmNlP1xuICAvLyAgICAgJ29sZCc6ICdyb3RhdGUoOTBkZWcpc2NhbGUoMS41KScsIC8vID8/P1xuICAvLyAgICAgJ25ldyc6ICdyb3RhdGUoMTIwZGVnKXNjYWxlKC0wLjUpJyAvLyA/Pz9cbiAgLy8gICB9LFxuICAvLyAgIC8vIG90aGVycz9cbiAgLy8gXVxuXG4gIGNvbnN0ICR3aW5kb3cgPSAkKHdpbmRvdyk7XG4gIGNvbnN0ICRib2R5ID0gJCgnYm9keScpO1xuICBjb25zdCAkY2FudmFzID0gJCgnY2FudmFzI21haW5DYW52YXMnKTtcbiAgY29uc3QgcnVuQW5pbWF0aW9ucyA9IGZhbHNlO1xuICBjb25zdCB0cmFuc3BhcmVudCA9IG5ldyBDb2xvcigwLCAwKTtcblxuICBsZXQgdmlld1dpZHRoLCB2aWV3SGVpZ2h0O1xuXG4gIGZ1bmN0aW9uIGhpdFRlc3RCb3VuZHMocG9pbnQpIHtcbiAgICByZXR1cm4gdXRpbC5oaXRUZXN0Qm91bmRzKHBvaW50LCBwYXBlci5wcm9qZWN0LmFjdGl2ZUxheWVyLmNoaWxkcmVuKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhpdFRlc3RHcm91cEJvdW5kcyhwb2ludCkge1xuICAgIGxldCBncm91cHMgPSBwYXBlci5wcm9qZWN0LmdldEl0ZW1zKHtcbiAgICAgIGNsYXNzTmFtZTogJ0dyb3VwJ1xuICAgIH0pO1xuICAgIHJldHVybiB1dGlsLmhpdFRlc3RCb3VuZHMocG9pbnQsIGdyb3Vwcyk7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0Vmlld1ZhcnMoKSB7XG4gICAgdmlld1dpZHRoID0gcGFwZXIudmlldy52aWV3U2l6ZS53aWR0aDtcbiAgICB2aWV3SGVpZ2h0ID0gcGFwZXIudmlldy52aWV3U2l6ZS5oZWlnaHQ7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0Q29udHJvbFBhbmVsKCkge1xuICAgIGluaXRDb2xvclBhbGV0dGUoKTtcbiAgICBpbml0Q2FudmFzRHJhdygpO1xuICAgIGluaXROZXcoKTtcbiAgICBpbml0VW5kbygpO1xuICAgIGluaXRQbGF5KCk7XG4gICAgaW5pdFRpcHMoKTtcbiAgICBpbml0U2hhcmUoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRDb2xvclBhbGV0dGUoKSB7XG4gICAgY29uc3QgJHBhbGV0dGVXcmFwID0gJCgndWwucGFsZXR0ZS1jb2xvcnMnKTtcbiAgICBjb25zdCAkcGFsZXR0ZUNvbG9ycyA9ICRwYWxldHRlV3JhcC5maW5kKCdsaScpO1xuICAgIGNvbnN0IHBhbGV0dGVDb2xvclNpemUgPSAyMDtcbiAgICBjb25zdCBwYWxldHRlU2VsZWN0ZWRDb2xvclNpemUgPSAzMDtcbiAgICBjb25zdCBwYWxldHRlU2VsZWN0ZWRDbGFzcyA9ICdwYWxldHRlLXNlbGVjdGVkJztcblxuICAgIC8vIGhvb2sgdXAgY2xpY2tcbiAgICAgICRwYWxldHRlQ29sb3JzLm9uKCdjbGljayB0YXAgdG91Y2gnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBsZXQgJHN2ZyA9ICQodGhpcykuZmluZCgnc3ZnLnBhbGV0dGUtY29sb3InKTtcblxuICAgICAgICAgIGlmICghJHN2Zy5oYXNDbGFzcyhwYWxldHRlU2VsZWN0ZWRDbGFzcykpIHtcbiAgICAgICAgICAgICQoJy4nICsgcGFsZXR0ZVNlbGVjdGVkQ2xhc3MpXG4gICAgICAgICAgICAgIC5yZW1vdmVDbGFzcyhwYWxldHRlU2VsZWN0ZWRDbGFzcylcbiAgICAgICAgICAgICAgLmF0dHIoJ3dpZHRoJywgcGFsZXR0ZUNvbG9yU2l6ZSlcbiAgICAgICAgICAgICAgLmF0dHIoJ2hlaWdodCcsIHBhbGV0dGVDb2xvclNpemUpXG4gICAgICAgICAgICAgIC5maW5kKCdyZWN0JylcbiAgICAgICAgICAgICAgLmF0dHIoJ3J4JywgMClcbiAgICAgICAgICAgICAgLmF0dHIoJ3J5JywgMCk7XG5cbiAgICAgICAgICAgICRzdmcuYWRkQ2xhc3MocGFsZXR0ZVNlbGVjdGVkQ2xhc3MpXG4gICAgICAgICAgICAgIC5hdHRyKCd3aWR0aCcsIHBhbGV0dGVTZWxlY3RlZENvbG9yU2l6ZSlcbiAgICAgICAgICAgICAgLmF0dHIoJ2hlaWdodCcsIHBhbGV0dGVTZWxlY3RlZENvbG9yU2l6ZSlcbiAgICAgICAgICAgICAgLmZpbmQoJ3JlY3QnKVxuICAgICAgICAgICAgICAuYXR0cigncngnLCBwYWxldHRlU2VsZWN0ZWRDb2xvclNpemUgLyAyKVxuICAgICAgICAgICAgICAuYXR0cigncnknLCBwYWxldHRlU2VsZWN0ZWRDb2xvclNpemUgLyAyKVxuXG4gICAgICAgICAgICB3aW5kb3cua2FuLmN1cnJlbnRDb2xvciA9ICRzdmcuZmluZCgncmVjdCcpLmF0dHIoJ2ZpbGwnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdENhbnZhc0RyYXcoKSB7XG5cbiAgICBwYXBlci5zZXR1cCgkY2FudmFzWzBdKTtcblxuICAgIGxldCBtaWRkbGUsIGJvdW5kcztcbiAgICBsZXQgcGFzdDtcbiAgICBsZXQgc2l6ZXM7XG4gICAgLy8gbGV0IHBhdGhzID0gZ2V0RnJlc2hQYXRocyh3aW5kb3cua2FuLm51bVBhdGhzKTtcbiAgICBsZXQgdG91Y2ggPSBmYWxzZTtcbiAgICBsZXQgbGFzdENoaWxkO1xuXG4gICAgZnVuY3Rpb24gcGFuU3RhcnQoZXZlbnQpIHtcbiAgICAgIHBhcGVyLnByb2plY3QuYWN0aXZlTGF5ZXIucmVtb3ZlQ2hpbGRyZW4oKTsgLy8gUkVNT1ZFXG4gICAgICAvLyBkcmF3Q2lyY2xlKCk7XG5cbiAgICAgIHNpemVzID0gW107XG5cbiAgICAgIGlmIChwaW5jaGluZykgcmV0dXJuO1xuICAgICAgaWYgKCEoZXZlbnQuY2hhbmdlZFBvaW50ZXJzICYmIGV2ZW50LmNoYW5nZWRQb2ludGVycy5sZW5ndGggPiAwKSkgcmV0dXJuO1xuICAgICAgaWYgKGV2ZW50LmNoYW5nZWRQb2ludGVycy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdldmVudC5jaGFuZ2VkUG9pbnRlcnMgPiAxJyk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHBvaW50ZXIgPSBldmVudC5jZW50ZXI7XG4gICAgICBjb25zdCBwb2ludCA9IG5ldyBQb2ludChwb2ludGVyLngsIHBvaW50ZXIueSk7XG5cbiAgICAgIGJvdW5kcyA9IG5ldyBQYXRoKHtcbiAgICAgICAgc3Ryb2tlQ29sb3I6IHdpbmRvdy5rYW4uY3VycmVudENvbG9yLFxuICAgICAgICBmaWxsQ29sb3I6IHdpbmRvdy5rYW4uY3VycmVudENvbG9yLFxuICAgICAgICBuYW1lOiAnYm91bmRzJyxcbiAgICAgICAgdmlzaWJsZTogZmFsc2VcbiAgICAgIH0pO1xuXG4gICAgICBtaWRkbGUgPSBuZXcgUGF0aCh7XG4gICAgICAgIHN0cm9rZUNvbG9yOiB3aW5kb3cua2FuLmN1cnJlbnRDb2xvcixcbiAgICAgICAgbmFtZTogJ21pZGRsZScsXG4gICAgICAgIHN0cm9rZVdpZHRoOiAxLFxuICAgICAgICB2aXNpYmxlOiB0cnVlXG4gICAgICB9KTtcblxuICAgICAgYm91bmRzLmFkZChwb2ludCk7XG4gICAgICBtaWRkbGUuYWRkKHBvaW50KTtcbiAgICB9XG5cbiAgICBjb25zdCBtaW4gPSAxO1xuICAgIGNvbnN0IG1heCA9IDIwO1xuICAgIGNvbnN0IGFscGhhID0gMC4zO1xuICAgIGNvbnN0IG1lbW9yeSA9IDEwO1xuICAgIHZhciBjdW1EaXN0YW5jZSA9IDA7XG4gICAgbGV0IGN1bVNpemUsIGF2Z1NpemU7XG4gICAgZnVuY3Rpb24gcGFuTW92ZShldmVudCkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGlmIChwaW5jaGluZykgcmV0dXJuO1xuICAgICAgLy8gY29uc29sZS5sb2coZXZlbnQub3ZlcmFsbFZlbG9jaXR5KTtcbiAgICAgIC8vIGxldCB0aGlzRGlzdCA9IHBhcnNlSW50KGV2ZW50LmRpc3RhbmNlKTtcbiAgICAgIC8vIGN1bURpc3RhbmNlICs9IHRoaXNEaXN0O1xuICAgICAgLy9cbiAgICAgIC8vIGlmIChjdW1EaXN0YW5jZSA8IDEwMCkge1xuICAgICAgLy8gICBjb25zb2xlLmxvZygnaWdub3JpbmcnKTtcbiAgICAgIC8vICAgcmV0dXJuO1xuICAgICAgLy8gfSBlbHNlIHtcbiAgICAgIC8vICAgY3VtRGlzdGFuY2UgPSAwO1xuICAgICAgLy8gICBjb25zb2xlLmxvZygnbm90IGlnbm9yaW5nJyk7XG4gICAgICAvLyB9XG5cbiAgICAgIGNvbnN0IHBvaW50ZXIgPSBldmVudC5jZW50ZXI7XG4gICAgICBjb25zdCBwb2ludCA9IG5ldyBQb2ludChwb2ludGVyLngsIHBvaW50ZXIueSk7XG5cbiAgICAgIHdoaWxlIChzaXplcy5sZW5ndGggPiBtZW1vcnkpIHtcbiAgICAgICAgc2l6ZXMuc2hpZnQoKTtcbiAgICAgIH1cblxuICAgICAgbGV0IGJvdHRvbVgsIGJvdHRvbVksIGJvdHRvbSxcbiAgICAgICAgdG9wWCwgdG9wWSwgdG9wLFxuICAgICAgICBwMCwgcDEsXG4gICAgICAgIHN0ZXAsIGFuZ2xlLCBkaXN0LCBzaXplO1xuXG4gICAgICBpZiAoc2l6ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAvLyBub3QgdGhlIGZpcnN0IHBvaW50LCBzbyB3ZSBoYXZlIG90aGVycyB0byBjb21wYXJlIHRvXG4gICAgICAgIHAwID0gcGFzdDtcbiAgICAgICAgZGlzdCA9IHV0aWwuZGVsdGEocG9pbnQsIHAwKTtcbiAgICAgICAgc2l6ZSA9IGRpc3QgKiBhbHBoYTtcbiAgICAgICAgLy8gaWYgKHNpemUgPj0gbWF4KSBzaXplID0gbWF4O1xuICAgICAgICBzaXplID0gTWF0aC5tYXgoTWF0aC5taW4oc2l6ZSwgbWF4KSwgbWluKTsgLy8gY2xhbXAgc2l6ZSB0byBbbWluLCBtYXhdXG4gICAgICAgIC8vIHNpemUgPSBtYXggLSBzaXplO1xuXG4gICAgICAgIGN1bVNpemUgPSAwO1xuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHNpemVzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgY3VtU2l6ZSArPSBzaXplc1tqXTtcbiAgICAgICAgfVxuICAgICAgICBhdmdTaXplID0gTWF0aC5yb3VuZCgoKGN1bVNpemUgLyBzaXplcy5sZW5ndGgpICsgc2l6ZSkgLyAyKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coYXZnU2l6ZSk7XG5cbiAgICAgICAgYW5nbGUgPSBNYXRoLmF0YW4yKHBvaW50LnkgLSBwMC55LCBwb2ludC54IC0gcDAueCk7IC8vIHJhZFxuXG4gICAgICAgIC8vIFBvaW50KGJvdHRvbVgsIGJvdHRvbVkpIGlzIGJvdHRvbSwgUG9pbnQodG9wWCwgdG9wWSkgaXMgdG9wXG4gICAgICAgIGJvdHRvbVggPSBwb2ludC54ICsgTWF0aC5jb3MoYW5nbGUgKyBNYXRoLlBJLzIpICogYXZnU2l6ZTtcbiAgICAgICAgYm90dG9tWSA9IHBvaW50LnkgKyBNYXRoLnNpbihhbmdsZSArIE1hdGguUEkvMikgKiBhdmdTaXplO1xuICAgICAgICBib3R0b20gPSBuZXcgUG9pbnQoYm90dG9tWCwgYm90dG9tWSk7XG5cbiAgICAgICAgdG9wWCA9IHBvaW50LnggKyBNYXRoLmNvcyhhbmdsZSAtIE1hdGguUEkvMikgKiBhdmdTaXplO1xuICAgICAgICB0b3BZID0gcG9pbnQueSArIE1hdGguc2luKGFuZ2xlIC0gTWF0aC5QSS8yKSAqIGF2Z1NpemU7XG4gICAgICAgIHRvcCA9IG5ldyBQb2ludCh0b3BYLCB0b3BZKTtcblxuICAgICAgICBib3VuZHMuYWRkKHRvcCk7XG4gICAgICAgIGJvdW5kcy5pbnNlcnQoMCwgYm90dG9tKTtcbiAgICAgICAgLy8gYm91bmRzLnNtb290aCgpO1xuXG4gICAgICAgIG1pZGRsZS5hZGQocG9pbnQpO1xuICAgICAgICAvLyBtaWRkbGUuc21vb3RoKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBkb24ndCBoYXZlIGFueXRoaW5nIHRvIGNvbXBhcmUgdG9cbiAgICAgICAgZGlzdCA9IDE7XG4gICAgICAgIGFuZ2xlID0gMDtcblxuICAgICAgICBzaXplID0gZGlzdCAqIGFscGhhO1xuICAgICAgICBzaXplID0gTWF0aC5tYXgoTWF0aC5taW4oc2l6ZSwgbWF4KSwgbWluKTsgLy8gY2xhbXAgc2l6ZSB0byBbbWluLCBtYXhdXG4gICAgICB9XG5cbiAgICAgIHBhcGVyLnZpZXcuZHJhdygpO1xuXG4gICAgICBwYXN0ID0gcG9pbnQ7XG4gICAgICBzaXplcy5wdXNoKHNpemUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhbkVuZChldmVudCkge1xuICAgICAgaWYgKHBpbmNoaW5nKSByZXR1cm47XG5cbiAgICAgIGNvbnN0IHBvaW50ZXIgPSBldmVudC5jZW50ZXI7XG4gICAgICBjb25zdCBwb2ludCA9IG5ldyBQb2ludChwb2ludGVyLngsIHBvaW50ZXIueSk7XG5cbiAgICAgIGNvbnN0IGdyb3VwID0gbmV3IEdyb3VwKFtib3VuZHMsIG1pZGRsZV0pO1xuICAgICAgZ3JvdXAuZGF0YS5jb2xvciA9IGJvdW5kcy5maWxsQ29sb3I7XG4gICAgICBncm91cC5kYXRhLnVwZGF0ZSA9IHRydWU7XG5cbiAgICAgIGJvdW5kcy5hZGQocG9pbnQpO1xuICAgICAgYm91bmRzLmZsYXR0ZW4oNCk7XG4gICAgICBib3VuZHMuc21vb3RoKCk7XG4gICAgICBib3VuZHMuc2ltcGxpZnkoKTtcbiAgICAgIGJvdW5kcy5jbG9zZWQgPSB0cnVlO1xuXG4gICAgICBtaWRkbGUuYWRkKHBvaW50KTtcbiAgICAgIG1pZGRsZS5mbGF0dGVuKDQpO1xuICAgICAgbWlkZGxlLnNtb290aCgpO1xuICAgICAgbWlkZGxlLnNpbXBsaWZ5KCk7XG5cbiAgICAgIGdyb3VwLnJlcGxhY2VXaXRoKHV0aWwudHJ1ZUdyb3VwKGdyb3VwKSk7XG4gICAgICByZXR1cm47XG5cbiAgICAgIGxldCBpbnRlcnNlY3Rpb25zID0gbWlkZGxlLmdldENyb3NzaW5ncygpO1xuICAgICAgaWYgKGludGVyc2VjdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAvLyB3ZSBjcmVhdGUgYSBjb3B5IG9mIHRoZSBwYXRoIGJlY2F1c2UgcmVzb2x2ZUNyb3NzaW5ncygpIHNwbGl0cyBzb3VyY2UgcGF0aFxuICAgICAgICBsZXQgcGF0aENvcHkgPSBuZXcgUGF0aCgpO1xuICAgICAgICBwYXRoQ29weS5jb3B5Q29udGVudChtaWRkbGUpO1xuICAgICAgICBwYXRoQ29weS52aXNpYmxlID0gZmFsc2U7XG5cbiAgICAgICAgbGV0IGRpdmlkZWRQYXRoID0gcGF0aENvcHkucmVzb2x2ZUNyb3NzaW5ncygpO1xuICAgICAgICBkaXZpZGVkUGF0aC52aXNpYmxlID0gZmFsc2U7XG5cblxuICAgICAgICBsZXQgZW5jbG9zZWRMb29wcyA9IHV0aWwuZmluZEludGVyaW9yQ3VydmVzKGRpdmlkZWRQYXRoKTtcblxuICAgICAgICBpZiAoZW5jbG9zZWRMb29wcykge1xuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZW5jbG9zZWRMb29wcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZW5jbG9zZWRMb29wc1tpXS52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgIGVuY2xvc2VkTG9vcHNbaV0uY2xvc2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIGVuY2xvc2VkTG9vcHNbaV0uZmlsbENvbG9yID0gbmV3IENvbG9yKDAsIDApOyAvLyB0cmFuc3BhcmVudFxuICAgICAgICAgICAgZW5jbG9zZWRMb29wc1tpXS5kYXRhLmludGVyaW9yID0gdHJ1ZTtcbiAgICAgICAgICAgIGVuY2xvc2VkTG9vcHNbaV0uZGF0YS50cmFuc3BhcmVudCA9IHRydWU7XG4gICAgICAgICAgICAvLyBlbmNsb3NlZExvb3BzW2ldLmJsZW5kTW9kZSA9ICdtdWx0aXBseSc7XG4gICAgICAgICAgICBncm91cC5hZGRDaGlsZChlbmNsb3NlZExvb3BzW2ldKTtcbiAgICAgICAgICAgIGVuY2xvc2VkTG9vcHNbaV0uc2VuZFRvQmFjaygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBwYXRoQ29weS5yZW1vdmUoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdubyBpbnRlcnNlY3Rpb25zJyk7XG4gICAgICB9XG5cbiAgICAgIGdyb3VwLmRhdGEuY29sb3IgPSBib3VuZHMuZmlsbENvbG9yO1xuICAgICAgZ3JvdXAuZGF0YS5zY2FsZSA9IDE7IC8vIGluaXQgdmFyaWFibGUgdG8gdHJhY2sgc2NhbGUgY2hhbmdlc1xuICAgICAgZ3JvdXAuZGF0YS5yb3RhdGlvbiA9IDA7IC8vIGluaXQgdmFyaWFibGUgdG8gdHJhY2sgcm90YXRpb24gY2hhbmdlc1xuXG4gICAgICBsZXQgY2hpbGRyZW4gPSBncm91cC5nZXRJdGVtcyh7XG4gICAgICAgIG1hdGNoOiBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgcmV0dXJuIGl0ZW0ubmFtZSAhPT0gJ21pZGRsZSdcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIGNvbnNvbGUubG9nKCctLS0tLScpO1xuICAgICAgLy8gY29uc29sZS5sb2coZ3JvdXApO1xuICAgICAgLy8gY29uc29sZS5sb2coY2hpbGRyZW4pO1xuICAgICAgLy8gZ3JvdXAuc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgbGV0IHVuaXRlZFBhdGggPSBuZXcgUGF0aCgpO1xuICAgICAgaWYgKGNoaWxkcmVuLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgbGV0IGFjY3VtdWxhdG9yID0gbmV3IFBhdGgoKTtcbiAgICAgICAgYWNjdW11bGF0b3IuY29weUNvbnRlbnQoY2hpbGRyZW5bMF0pO1xuICAgICAgICBhY2N1bXVsYXRvci52aXNpYmxlID0gZmFsc2U7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGxldCBvdGhlclBhdGggPSBuZXcgUGF0aCgpO1xuICAgICAgICAgIG90aGVyUGF0aC5jb3B5Q29udGVudChjaGlsZHJlbltpXSk7XG4gICAgICAgICAgb3RoZXJQYXRoLnZpc2libGUgPSBmYWxzZTtcblxuICAgICAgICAgIHVuaXRlZFBhdGggPSBhY2N1bXVsYXRvci51bml0ZShvdGhlclBhdGgpO1xuICAgICAgICAgIG90aGVyUGF0aC5yZW1vdmUoKTtcbiAgICAgICAgICBhY2N1bXVsYXRvciA9IHVuaXRlZFBhdGg7XG4gICAgICAgIH1cblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gY2hpbGRyZW5bMF0gaXMgdW5pdGVkIGdyb3VwXG4gICAgICAgIHVuaXRlZFBhdGguY29weUNvbnRlbnQoY2hpbGRyZW5bMF0pO1xuICAgICAgfVxuXG4gICAgICB1bml0ZWRQYXRoLnZpc2libGUgPSBmYWxzZTtcbiAgICAgIHVuaXRlZFBhdGguZGF0YS5uYW1lID0gJ21hc2snO1xuXG4gICAgICBncm91cC5hZGRDaGlsZCh1bml0ZWRQYXRoKTtcbiAgICAgIHVuaXRlZFBhdGguc2VuZFRvQmFjaygpO1xuXG4gICAgICBsYXN0Q2hpbGQgPSBncm91cDtcblxuICAgICAgTU9WRVMucHVzaCh7XG4gICAgICAgIHR5cGU6ICduZXdHcm91cCcsXG4gICAgICAgIGlkOiBncm91cC5pZFxuICAgICAgfSk7XG5cbiAgICAgIGlmIChydW5BbmltYXRpb25zKSB7XG4gICAgICAgIGdyb3VwLmFuaW1hdGUoXG4gICAgICAgICAgW3tcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgc2NhbGU6IDAuOVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldHRpbmdzOiB7XG4gICAgICAgICAgICAgIGR1cmF0aW9uOiAxMDAsXG4gICAgICAgICAgICAgIGVhc2luZzogXCJlYXNlT3V0XCIsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgIHNjYWxlOiAxLjExXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgICAgICAgZHVyYXRpb246IDEwMCxcbiAgICAgICAgICAgICAgZWFzaW5nOiBcImVhc2VJblwiXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfV1cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgcGluY2hpbmc7XG4gICAgbGV0IHBpbmNoZWRHcm91cCwgbGFzdFNjYWxlLCBsYXN0Um90YXRpb247XG4gICAgbGV0IG9yaWdpbmFsUG9zaXRpb24sIG9yaWdpbmFsUm90YXRpb24sIG9yaWdpbmFsU2NhbGU7XG5cbiAgICBmdW5jdGlvbiBwaW5jaFN0YXJ0KGV2ZW50KSB7XG4gICAgICBjb25zb2xlLmxvZygncGluY2hTdGFydCcsIGV2ZW50LmNlbnRlcik7XG4gICAgICBoYW1tZXJNYW5hZ2VyLmdldCgncGFuJykuc2V0KHtlbmFibGU6IGZhbHNlfSk7XG4gICAgICBjb25zdCBwb2ludGVyID0gZXZlbnQuY2VudGVyLFxuICAgICAgICAgIHBvaW50ID0gbmV3IFBvaW50KHBvaW50ZXIueCwgcG9pbnRlci55KSxcbiAgICAgICAgICBoaXRSZXN1bHQgPSBoaXRUZXN0R3JvdXBCb3VuZHMocG9pbnQpO1xuXG4gICAgICBpZiAoaGl0UmVzdWx0KSB7XG4gICAgICAgIHBpbmNoaW5nID0gdHJ1ZTtcbiAgICAgICAgLy8gcGluY2hlZEdyb3VwID0gaGl0UmVzdWx0Lml0ZW0ucGFyZW50O1xuICAgICAgICBwaW5jaGVkR3JvdXAgPSBoaXRSZXN1bHQ7XG4gICAgICAgIGxhc3RTY2FsZSA9IDE7XG4gICAgICAgIGxhc3RSb3RhdGlvbiA9IGV2ZW50LnJvdGF0aW9uO1xuXG4gICAgICAgIG9yaWdpbmFsUG9zaXRpb24gPSBwaW5jaGVkR3JvdXAucG9zaXRpb247XG4gICAgICAgIC8vIG9yaWdpbmFsUm90YXRpb24gPSBwaW5jaGVkR3JvdXAucm90YXRpb247XG4gICAgICAgIG9yaWdpbmFsUm90YXRpb24gPSBwaW5jaGVkR3JvdXAuZGF0YS5yb3RhdGlvbjtcbiAgICAgICAgb3JpZ2luYWxTY2FsZSA9IHBpbmNoZWRHcm91cC5kYXRhLnNjYWxlO1xuXG4gICAgICAgIGlmIChydW5BbmltYXRpb25zKSB7XG4gICAgICAgICAgcGluY2hlZEdyb3VwLmFuaW1hdGUoe1xuICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICBzY2FsZTogMS4yNVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldHRpbmdzOiB7XG4gICAgICAgICAgICAgIGR1cmF0aW9uOiAxMDAsXG4gICAgICAgICAgICAgIGVhc2luZzogXCJlYXNlT3V0XCIsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBpbmNoZWRHcm91cCA9IG51bGw7XG4gICAgICAgIGNvbnNvbGUubG9nKCdoaXQgbm8gaXRlbScpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBpbmNoTW92ZShldmVudCkge1xuICAgICAgY29uc29sZS5sb2coJ3BpbmNoTW92ZScpO1xuICAgICAgaWYgKCEhcGluY2hlZEdyb3VwKSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdwaW5jaG1vdmUnLCBldmVudCk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHBpbmNoZWRHcm91cCk7XG4gICAgICAgIGxldCBjdXJyZW50U2NhbGUgPSBldmVudC5zY2FsZTtcbiAgICAgICAgbGV0IHNjYWxlRGVsdGEgPSBjdXJyZW50U2NhbGUgLyBsYXN0U2NhbGU7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGxhc3RTY2FsZSwgY3VycmVudFNjYWxlLCBzY2FsZURlbHRhKTtcbiAgICAgICAgbGFzdFNjYWxlID0gY3VycmVudFNjYWxlO1xuXG4gICAgICAgIGxldCBjdXJyZW50Um90YXRpb24gPSBldmVudC5yb3RhdGlvbjtcbiAgICAgICAgbGV0IHJvdGF0aW9uRGVsdGEgPSBjdXJyZW50Um90YXRpb24gLSBsYXN0Um90YXRpb247XG4gICAgICAgIGNvbnNvbGUubG9nKGxhc3RSb3RhdGlvbiwgY3VycmVudFJvdGF0aW9uLCByb3RhdGlvbkRlbHRhKTtcbiAgICAgICAgbGFzdFJvdGF0aW9uID0gY3VycmVudFJvdGF0aW9uO1xuXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGBzY2FsaW5nIGJ5ICR7c2NhbGVEZWx0YX1gKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coYHJvdGF0aW5nIGJ5ICR7cm90YXRpb25EZWx0YX1gKTtcblxuICAgICAgICBwaW5jaGVkR3JvdXAucG9zaXRpb24gPSBldmVudC5jZW50ZXI7XG4gICAgICAgIHBpbmNoZWRHcm91cC5zY2FsZShzY2FsZURlbHRhKTtcbiAgICAgICAgcGluY2hlZEdyb3VwLnJvdGF0ZShyb3RhdGlvbkRlbHRhKTtcblxuICAgICAgICBwaW5jaGVkR3JvdXAuZGF0YS5zY2FsZSAqPSBzY2FsZURlbHRhO1xuICAgICAgICBwaW5jaGVkR3JvdXAuZGF0YS5yb3RhdGlvbiArPSByb3RhdGlvbkRlbHRhO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxldCBsYXN0RXZlbnQ7XG4gICAgZnVuY3Rpb24gcGluY2hFbmQoZXZlbnQpIHtcbiAgICAgIC8vIHdhaXQgMjUwIG1zIHRvIHByZXZlbnQgbWlzdGFrZW4gcGFuIHJlYWRpbmdzXG4gICAgICBsYXN0RXZlbnQgPSBldmVudDtcbiAgICAgIGlmICghIXBpbmNoZWRHcm91cCkge1xuICAgICAgICBwaW5jaGVkR3JvdXAuZGF0YS51cGRhdGUgPSB0cnVlO1xuICAgICAgICBsZXQgbW92ZSA9IHtcbiAgICAgICAgICBpZDogcGluY2hlZEdyb3VwLmlkLFxuICAgICAgICAgIHR5cGU6ICd0cmFuc2Zvcm0nXG4gICAgICAgIH07XG4gICAgICAgIGlmIChwaW5jaGVkR3JvdXAucG9zaXRpb24gIT0gb3JpZ2luYWxQb3NpdGlvbikge1xuICAgICAgICAgIG1vdmUucG9zaXRpb24gPSBvcmlnaW5hbFBvc2l0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBpbmNoZWRHcm91cC5kYXRhLnJvdGF0aW9uICE9IG9yaWdpbmFsUm90YXRpb24pIHtcbiAgICAgICAgICBtb3ZlLnJvdGF0aW9uID0gb3JpZ2luYWxSb3RhdGlvbiAtIHBpbmNoZWRHcm91cC5kYXRhLnJvdGF0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBpbmNoZWRHcm91cC5kYXRhLnNjYWxlICE9IG9yaWdpbmFsU2NhbGUpIHtcbiAgICAgICAgICBtb3ZlLnNjYWxlID0gb3JpZ2luYWxTY2FsZSAvIHBpbmNoZWRHcm91cC5kYXRhLnNjYWxlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc29sZS5sb2coJ2ZpbmFsIHNjYWxlJywgcGluY2hlZEdyb3VwLmRhdGEuc2NhbGUpO1xuICAgICAgICBjb25zb2xlLmxvZyhtb3ZlKTtcblxuICAgICAgICBNT1ZFUy5wdXNoKG1vdmUpO1xuXG4gICAgICAgIGlmIChNYXRoLmFicyhldmVudC52ZWxvY2l0eSkgPiAxKSB7XG4gICAgICAgICAgLy8gZGlzcG9zZSBvZiBncm91cCBvZmZzY3JlZW5cbiAgICAgICAgICB0aHJvd1BpbmNoZWRHcm91cCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaWYgKHJ1bkFuaW1hdGlvbnMpIHtcbiAgICAgICAgLy8gICBwaW5jaGVkR3JvdXAuYW5pbWF0ZSh7XG4gICAgICAgIC8vICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIC8vICAgICAgIHNjYWxlOiAwLjhcbiAgICAgICAgLy8gICAgIH0sXG4gICAgICAgIC8vICAgICBzZXR0aW5nczoge1xuICAgICAgICAvLyAgICAgICBkdXJhdGlvbjogMTAwLFxuICAgICAgICAvLyAgICAgICBlYXNpbmc6IFwiZWFzZU91dFwiLFxuICAgICAgICAvLyAgICAgfVxuICAgICAgICAvLyAgIH0pO1xuICAgICAgICAvLyB9XG4gICAgICB9XG4gICAgICBwaW5jaGluZyA9IGZhbHNlO1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgaGFtbWVyTWFuYWdlci5nZXQoJ3BhbicpLnNldCh7ZW5hYmxlOiB0cnVlfSk7XG4gICAgICB9LCAyNTApO1xuICAgIH1cblxuICAgIGNvbnN0IGhpdE9wdGlvbnMgPSB7XG4gICAgICBzZWdtZW50czogZmFsc2UsXG4gICAgICBzdHJva2U6IHRydWUsXG4gICAgICBmaWxsOiB0cnVlLFxuICAgICAgdG9sZXJhbmNlOiA1XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIHNpbmdsZVRhcChldmVudCkge1xuICAgICAgY29uc3QgcG9pbnRlciA9IGV2ZW50LmNlbnRlcixcbiAgICAgICAgICBwb2ludCA9IG5ldyBQb2ludChwb2ludGVyLngsIHBvaW50ZXIueSksXG4gICAgICAgICAgaGl0UmVzdWx0ID0gcGFwZXIucHJvamVjdC5oaXRUZXN0KHBvaW50LCBoaXRPcHRpb25zKTtcblxuICAgICAgaWYgKGhpdFJlc3VsdCkge1xuICAgICAgICBsZXQgaXRlbSA9IGhpdFJlc3VsdC5pdGVtO1xuICAgICAgICBpdGVtLnNlbGVjdGVkID0gIWl0ZW0uc2VsZWN0ZWQ7XG4gICAgICAgIGNvbnNvbGUubG9nKGl0ZW0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRvdWJsZVRhcChldmVudCkge1xuICAgICAgY29uc3QgcG9pbnRlciA9IGV2ZW50LmNlbnRlcixcbiAgICAgICAgICBwb2ludCA9IG5ldyBQb2ludChwb2ludGVyLngsIHBvaW50ZXIueSksXG4gICAgICAgICAgaGl0UmVzdWx0ID0gcGFwZXIucHJvamVjdC5oaXRUZXN0KHBvaW50LCBoaXRPcHRpb25zKTtcblxuICAgICAgaWYgKGhpdFJlc3VsdCkge1xuICAgICAgICBsZXQgaXRlbSA9IGhpdFJlc3VsdC5pdGVtO1xuICAgICAgICBsZXQgcGFyZW50ID0gaXRlbS5wYXJlbnQ7XG5cbiAgICAgICAgaWYgKGl0ZW0uZGF0YS5pbnRlcmlvcikge1xuICAgICAgICAgIGl0ZW0uZGF0YS50cmFuc3BhcmVudCA9ICFpdGVtLmRhdGEudHJhbnNwYXJlbnQ7XG5cbiAgICAgICAgICBpZiAoaXRlbS5kYXRhLnRyYW5zcGFyZW50KSB7XG4gICAgICAgICAgICBpdGVtLmZpbGxDb2xvciA9IHRyYW5zcGFyZW50O1xuICAgICAgICAgICAgaXRlbS5zdHJva2VDb2xvciA9IHRyYW5zcGFyZW50O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpdGVtLmZpbGxDb2xvciA9IHBhcmVudC5kYXRhLmNvbG9yO1xuICAgICAgICAgICAgaXRlbS5zdHJva2VDb2xvciA9IHBhcmVudC5kYXRhLmNvbG9yO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIE1PVkVTLnB1c2goe1xuICAgICAgICAgICAgdHlwZTogJ2ZpbGxDaGFuZ2UnLFxuICAgICAgICAgICAgaWQ6IGl0ZW0uaWQsXG4gICAgICAgICAgICBmaWxsOiBwYXJlbnQuZGF0YS5jb2xvcixcbiAgICAgICAgICAgIHRyYW5zcGFyZW50OiBpdGVtLmRhdGEudHJhbnNwYXJlbnRcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnbm90IGludGVyaW9yJylcbiAgICAgICAgfVxuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwaW5jaGVkR3JvdXAgPSBudWxsO1xuICAgICAgICBjb25zb2xlLmxvZygnaGl0IG5vIGl0ZW0nKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCB2ZWxvY2l0eU11bHRpcGxpZXIgPSAyNTtcbiAgICBmdW5jdGlvbiB0aHJvd1BpbmNoZWRHcm91cCgpIHtcbiAgICAgIGNvbnNvbGUubG9nKHBpbmNoZWRHcm91cC5wb3NpdGlvbik7XG4gICAgICBpZiAocGluY2hlZEdyb3VwLnBvc2l0aW9uLnggPD0gMCAtIHBpbmNoZWRHcm91cC5ib3VuZHMud2lkdGggfHxcbiAgICAgICAgICBwaW5jaGVkR3JvdXAucG9zaXRpb24ueCA+PSB2aWV3V2lkdGggKyBwaW5jaGVkR3JvdXAuYm91bmRzLndpZHRoIHx8XG4gICAgICAgICAgcGluY2hlZEdyb3VwLnBvc2l0aW9uLnkgPD0gMCAtIHBpbmNoZWRHcm91cC5ib3VuZHMuaGVpZ2h0IHx8XG4gICAgICAgICAgcGluY2hlZEdyb3VwLnBvc2l0aW9uLnkgPj0gdmlld0hlaWdodCArIHBpbmNoZWRHcm91cC5ib3VuZHMuaGVpZ2h0KSB7XG4gICAgICAgICAgICBwaW5jaGVkR3JvdXAuZGF0YS5vZmZTY3JlZW4gPSB0cnVlO1xuICAgICAgICAgICAgcGluY2hlZEdyb3VwLnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRocm93UGluY2hlZEdyb3VwKTtcbiAgICAgIHBpbmNoZWRHcm91cC5wb3NpdGlvbi54ICs9IGxhc3RFdmVudC52ZWxvY2l0eVggKiB2ZWxvY2l0eU11bHRpcGxpZXI7XG4gICAgICBwaW5jaGVkR3JvdXAucG9zaXRpb24ueSArPSBsYXN0RXZlbnQudmVsb2NpdHlZICogdmVsb2NpdHlNdWx0aXBsaWVyO1xuICAgIH1cblxuICAgIHZhciBoYW1tZXJNYW5hZ2VyID0gbmV3IEhhbW1lci5NYW5hZ2VyKCRjYW52YXNbMF0pO1xuXG4gICAgaGFtbWVyTWFuYWdlci5hZGQobmV3IEhhbW1lci5UYXAoeyBldmVudDogJ2RvdWJsZXRhcCcsIHRhcHM6IDIgfSkpO1xuICAgIGhhbW1lck1hbmFnZXIuYWRkKG5ldyBIYW1tZXIuVGFwKHsgZXZlbnQ6ICdzaW5nbGV0YXAnIH0pKTtcbiAgICBoYW1tZXJNYW5hZ2VyLmFkZChuZXcgSGFtbWVyLlBhbih7IGRpcmVjdGlvbjogSGFtbWVyLkRJUkVDVElPTl9BTEwgfSkpO1xuICAgIGhhbW1lck1hbmFnZXIuYWRkKG5ldyBIYW1tZXIuUGluY2goKSk7XG5cbiAgICBoYW1tZXJNYW5hZ2VyLmdldCgnZG91YmxldGFwJykucmVjb2duaXplV2l0aCgnc2luZ2xldGFwJyk7XG4gICAgaGFtbWVyTWFuYWdlci5nZXQoJ3NpbmdsZXRhcCcpLnJlcXVpcmVGYWlsdXJlKCdkb3VibGV0YXAnKTtcbiAgICBoYW1tZXJNYW5hZ2VyLmdldCgncGFuJykucmVxdWlyZUZhaWx1cmUoJ3BpbmNoJyk7XG5cbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdzaW5nbGV0YXAnLCBzaW5nbGVUYXApO1xuICAgIGhhbW1lck1hbmFnZXIub24oJ2RvdWJsZXRhcCcsIGRvdWJsZVRhcCk7XG5cbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdwYW5zdGFydCcsIHBhblN0YXJ0KTtcbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdwYW5tb3ZlJywgcGFuTW92ZSk7XG4gICAgaGFtbWVyTWFuYWdlci5vbigncGFuZW5kJywgcGFuRW5kKTtcblxuICAgIGhhbW1lck1hbmFnZXIub24oJ3BpbmNoc3RhcnQnLCBwaW5jaFN0YXJ0KTtcbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdwaW5jaG1vdmUnLCBwaW5jaE1vdmUpO1xuICAgIGhhbW1lck1hbmFnZXIub24oJ3BpbmNoZW5kJywgcGluY2hFbmQpO1xuICAgIGhhbW1lck1hbmFnZXIub24oJ3BpbmNoY2FuY2VsJywgZnVuY3Rpb24oKSB7IGhhbW1lck1hbmFnZXIuZ2V0KCdwYW4nKS5zZXQoe2VuYWJsZTogdHJ1ZX0pOyB9KTsgLy8gbWFrZSBzdXJlIGl0J3MgcmVlbmFibGVkXG4gIH1cblxuICBmdW5jdGlvbiBuZXdQcmVzc2VkKCkge1xuICAgIGNvbnNvbGUubG9nKCduZXcgcHJlc3NlZCcpO1xuXG4gICAgcGFwZXIucHJvamVjdC5hY3RpdmVMYXllci5yZW1vdmVDaGlsZHJlbigpO1xuICB9XG5cbiAgZnVuY3Rpb24gdW5kb1ByZXNzZWQoKSB7XG4gICAgY29uc29sZS5sb2coJ3VuZG8gcHJlc3NlZCcpO1xuICAgIGlmICghKE1PVkVTLmxlbmd0aCA+IDApKSB7XG4gICAgICBjb25zb2xlLmxvZygnbm8gbW92ZXMgeWV0Jyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IGxhc3RNb3ZlID0gTU9WRVMucG9wKCk7XG4gICAgbGV0IGl0ZW0gPSBwcm9qZWN0LmdldEl0ZW0oe1xuICAgICAgaWQ6IGxhc3RNb3ZlLmlkXG4gICAgfSk7XG5cbiAgICBpZiAoaXRlbSkge1xuICAgICAgaXRlbS52aXNpYmxlID0gdHJ1ZTsgLy8gbWFrZSBzdXJlXG4gICAgICBzd2l0Y2gobGFzdE1vdmUudHlwZSkge1xuICAgICAgICBjYXNlICduZXdHcm91cCc6XG4gICAgICAgICAgY29uc29sZS5sb2coJ3JlbW92aW5nIGdyb3VwJyk7XG4gICAgICAgICAgaXRlbS5yZW1vdmUoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZmlsbENoYW5nZSc6XG4gICAgICAgICAgaWYgKGxhc3RNb3ZlLnRyYW5zcGFyZW50KSB7XG4gICAgICAgICAgICBpdGVtLmZpbGxDb2xvciA9IGxhc3RNb3ZlLmZpbGw7XG4gICAgICAgICAgICBpdGVtLnN0cm9rZUNvbG9yID0gbGFzdE1vdmUuZmlsbDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaXRlbS5maWxsQ29sb3IgPSB0cmFuc3BhcmVudDtcbiAgICAgICAgICAgIGl0ZW0uc3Ryb2tlQ29sb3IgPSB0cmFuc3BhcmVudDtcbiAgICAgICAgICB9XG4gICAgICAgIGNhc2UgJ3RyYW5zZm9ybSc6XG4gICAgICAgICAgaWYgKCEhbGFzdE1vdmUucG9zaXRpb24pIHtcbiAgICAgICAgICAgIGl0ZW0ucG9zaXRpb24gPSBsYXN0TW92ZS5wb3NpdGlvblxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoISFsYXN0TW92ZS5yb3RhdGlvbikge1xuICAgICAgICAgICAgaXRlbS5yb3RhdGlvbiA9IGxhc3RNb3ZlLnJvdGF0aW9uO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoISFsYXN0TW92ZS5zY2FsZSkge1xuICAgICAgICAgICAgaXRlbS5zY2FsZShsYXN0TW92ZS5zY2FsZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGNvbnNvbGUubG9nKCd1bmtub3duIGNhc2UnKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coJ2NvdWxkIG5vdCBmaW5kIG1hdGNoaW5nIGl0ZW0nKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBwbGF5UHJlc3NlZCgpIHtcbiAgICBjb25zb2xlLmxvZygncGxheSBwcmVzc2VkJyk7XG4gIH1cblxuICBmdW5jdGlvbiB0aXBzUHJlc3NlZCgpIHtcbiAgICBjb25zb2xlLmxvZygndGlwcyBwcmVzc2VkJyk7XG4gIH1cblxuICBmdW5jdGlvbiBzaGFyZVByZXNzZWQoKSB7XG4gICAgY29uc29sZS5sb2coJ3NoYXJlIHByZXNzZWQnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXROZXcoKSB7XG4gICAgJCgnLm1haW4tY29udHJvbHMgLm5ldycpLm9uKCdjbGljayB0YXAgdG91Y2gnLCBuZXdQcmVzc2VkKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRVbmRvKCkge1xuICAgICQoJy5tYWluLWNvbnRyb2xzIC51bmRvJykub24oJ2NsaWNrJywgdW5kb1ByZXNzZWQpO1xuICB9XG4gIGZ1bmN0aW9uIGluaXRQbGF5KCkge1xuICAgICQoJy5tYWluLWNvbnRyb2xzIC5wbGF5Jykub24oJ2NsaWNrJywgcGxheVByZXNzZWQpO1xuICB9XG4gIGZ1bmN0aW9uIGluaXRUaXBzKCkge1xuICAgICQoJy5hdXgtY29udHJvbHMgLnRpcHMnKS5vbignY2xpY2snLCB0aXBzUHJlc3NlZCk7XG4gIH1cbiAgZnVuY3Rpb24gaW5pdFNoYXJlKCkge1xuICAgICQoJy5hdXgtY29udHJvbHMgLnNoYXJlJykub24oJ2NsaWNrJywgc2hhcmVQcmVzc2VkKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRyYXdDaXJjbGUoKSB7XG4gICAgbGV0IGNpcmNsZSA9IG5ldyBQYXRoLkNpcmNsZSh7XG4gICAgICBjZW50ZXI6IFs0MDAsIDQwMF0sXG4gICAgICByYWRpdXM6IDEwMCxcbiAgICAgIHN0cm9rZUNvbG9yOiAnZ3JlZW4nLFxuICAgICAgZmlsbENvbG9yOiAnZ3JlZW4nXG4gICAgfSk7XG4gICAgbGV0IGdyb3VwID0gbmV3IEdyb3VwKGNpcmNsZSk7XG4gIH1cblxuICBmdW5jdGlvbiBtYWluKCkge1xuICAgIGluaXRDb250cm9sUGFuZWwoKTtcbiAgICAvLyBkcmF3Q2lyY2xlKCk7XG4gICAgaW5pdFZpZXdWYXJzKCk7XG4gIH1cblxuICBtYWluKCk7XG59KTtcbiIsIi8vIENvbnZlcnRzIGZyb20gZGVncmVlcyB0byByYWRpYW5zLlxuZXhwb3J0IGZ1bmN0aW9uIHJhZChkZWdyZWVzKSB7XG4gIHJldHVybiBkZWdyZWVzICogTWF0aC5QSSAvIDE4MDtcbn07XG5cbi8vIENvbnZlcnRzIGZyb20gcmFkaWFucyB0byBkZWdyZWVzLlxuZXhwb3J0IGZ1bmN0aW9uIGRlZyhyYWRpYW5zKSB7XG4gIHJldHVybiByYWRpYW5zICogMTgwIC8gTWF0aC5QSTtcbn07XG5cbi8vIGRpc3RhbmNlIGJldHdlZW4gdHdvIHBvaW50c1xuZXhwb3J0IGZ1bmN0aW9uIGRlbHRhKHAxLCBwMikge1xuICByZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KHAxLnggLSBwMi54LCAyKSArIE1hdGgucG93KHAxLnkgLSBwMi55LCAyKSk7IC8vIHB5dGhhZ29yZWFuIVxufVxuXG4vLyByZXR1cm5zIGFuIGFycmF5IG9mIHRoZSBpbnRlcmlvciBjdXJ2ZXMgb2YgYSBnaXZlbiBjb21wb3VuZCBwYXRoXG5leHBvcnQgZnVuY3Rpb24gZmluZEludGVyaW9yQ3VydmVzKHBhdGgpIHtcbiAgbGV0IGludGVyaW9yQ3VydmVzID0gW107XG4gIGlmICghcGF0aCB8fCAhcGF0aC5jaGlsZHJlbiB8fCAhcGF0aC5jaGlsZHJlbi5sZW5ndGgpIHJldHVybjtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHBhdGguY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICBsZXQgY2hpbGQgPSBwYXRoLmNoaWxkcmVuW2ldO1xuXG4gICAgaWYgKGNoaWxkLmNsb3NlZCl7XG4gICAgICBpbnRlcmlvckN1cnZlcy5wdXNoKG5ldyBQYXRoKGNoaWxkLnNlZ21lbnRzKSk7XG4gICAgfVxuICB9XG5cbiAgcGF0aC5yZW1vdmUoKTtcbiAgcmV0dXJuIGludGVyaW9yQ3VydmVzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJ1ZUdyb3VwKGdyb3VwKSB7XG4gIGxldCBib3VuZHMgPSBncm91cC5fbmFtZWRDaGlsZHJlbi5ib3VuZHNbMF0sXG4gICAgICBtaWRkbGUgPSBncm91cC5fbmFtZWRDaGlsZHJlbi5taWRkbGVbMF07XG5cbiAgLy8gbGV0IGdyb3VwQ29weSA9IG5ldyBHcm91cCgpO1xuICAvLyBncm91cENvcHkuY29weUNvbnRlbnQoZ3JvdXApO1xuXG4gIHRyeSB7XG4gICAgbGV0IG1pZGRsZUNvcHkgPSBuZXcgUGF0aCgpO1xuICAgIG1pZGRsZUNvcHkuY29weUNvbnRlbnQobWlkZGxlKTtcbiAgICBsZXQgdG90YWxMZW5ndGggPSBtaWRkbGVDb3B5Lmxlbmd0aDtcblxuICAgIGxldCBpbnRlcnNlY3Rpb25zID0gbWlkZGxlQ29weS5nZXRJbnRlcnNlY3Rpb25zKCk7XG4gICAgbGV0IGRpdmlkZWRQYXRoID0gbWlkZGxlQ29weS5yZXNvbHZlQ3Jvc3NpbmdzKCk7XG5cbiAgICAvLyB3ZSB3YW50IHRvIHJlbW92ZSBhbGwgY2xvc2VkIGxvb3BzIGZyb20gdGhlIHBhdGgsIHNpbmNlIHRoZXNlIGFyZSBuZWNlc3NhcmlseSBpbnRlcmlvciBhbmQgbm90IGZpcnN0IG9yIGxhc3RcbiAgICBCYXNlLmVhY2goZGl2aWRlZFBhdGguY2hpbGRyZW4sIChjaGlsZCwgaSkgPT4ge1xuICAgICAgaWYgKGNoaWxkLmNsb3NlZCkge1xuICAgICAgICBjb25zb2xlLmxvZygnc3VidHJhY3RpbmcgY2xvc2VkIGNoaWxkJyk7XG4gICAgICAgIGRpdmlkZWRQYXRoID0gZGl2aWRlZFBhdGguc3VidHJhY3QoY2hpbGQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZGl2aWRlZFBhdGggPSBkaXZpZGVkUGF0aC51bml0ZShjaGlsZCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBjb25zb2xlLmxvZyhkaXZpZGVkUGF0aCk7XG5cbiAgICBpZiAoISFkaXZpZGVkUGF0aC5jaGlsZHJlbiAmJiBkaXZpZGVkUGF0aC5jaGlsZHJlbi5sZW5ndGggPiAxKSB7XG4gICAgICAvLyBkaXZpZGVkIHBhdGggaXMgYSBjb21wb3VuZCBwYXRoXG4gICAgICBsZXQgdW5pdGVkRGl2aWRlZFBhdGggPSBuZXcgUGF0aCgpO1xuICAgICAgLy8gdW5pdGVkRGl2aWRlZFBhdGguY29weUF0dHJpYnV0ZXMoZGl2aWRlZFBhdGgpO1xuICAgICAgY29uc29sZS5sb2coJ2JlZm9yZScsIHVuaXRlZERpdmlkZWRQYXRoKTtcbiAgICAgIEJhc2UuZWFjaChkaXZpZGVkUGF0aC5jaGlsZHJlbiwgKGNoaWxkLCBpKSA9PiB7XG4gICAgICAgIGlmICghY2hpbGQuY2xvc2VkKSB7XG4gICAgICAgICAgdW5pdGVkRGl2aWRlZFBhdGggPSB1bml0ZWREaXZpZGVkUGF0aC51bml0ZShjaGlsZCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgZGl2aWRlZFBhdGggPSB1bml0ZWREaXZpZGVkUGF0aDtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdhZnRlcicsIHVuaXRlZERpdmlkZWRQYXRoKTtcbiAgICAgIC8vIHJldHVybjtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gY29uc29sZS5sb2coJ2RpdmlkZWRQYXRoIGhhcyBvbmUgY2hpbGQnKTtcbiAgICB9XG5cbiAgICBpZiAoaW50ZXJzZWN0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAvLyB3ZSBoYXZlIHRvIGdldCB0aGUgbmVhcmVzdCBsb2NhdGlvbiBiZWNhdXNlIHRoZSBleGFjdCBpbnRlcnNlY3Rpb24gcG9pbnQgaGFzIGFscmVhZHkgYmVlbiByZW1vdmVkIGFzIGEgcGFydCBvZiByZXNvbHZlQ3Jvc3NpbmdzKClcbiAgICAgIGxldCBmaXJzdEludGVyc2VjdGlvbiA9IGRpdmlkZWRQYXRoLmdldE5lYXJlc3RMb2NhdGlvbihpbnRlcnNlY3Rpb25zWzBdLnBvaW50KTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKGRpdmlkZWRQYXRoKTtcbiAgICAgIGxldCByZXN0ID0gZGl2aWRlZFBhdGguc3BsaXRBdChmaXJzdEludGVyc2VjdGlvbik7IC8vIGRpdmlkZWRQYXRoIGlzIG5vdyB0aGUgZmlyc3Qgc2VnbWVudFxuICAgICAgbGV0IGZpcnN0U2VnbWVudCA9IGRpdmlkZWRQYXRoO1xuICAgICAgbGV0IGxhc3RTZWdtZW50O1xuXG4gICAgICAvLyBmaXJzdFNlZ21lbnQuc3Ryb2tlQ29sb3IgPSAncGluayc7XG5cbiAgICAgIC8vIGxldCBjaXJjbGVPbmUgPSBuZXcgUGF0aC5DaXJjbGUoe1xuICAgICAgLy8gICBjZW50ZXI6IGZpcnN0SW50ZXJzZWN0aW9uLnBvaW50LFxuICAgICAgLy8gICByYWRpdXM6IDUsXG4gICAgICAvLyAgIHN0cm9rZUNvbG9yOiAncmVkJ1xuICAgICAgLy8gfSk7XG5cbiAgICAgIC8vIGNvbnNvbGUubG9nKGludGVyc2VjdGlvbnMpO1xuICAgICAgaWYgKGludGVyc2VjdGlvbnMubGVuZ3RoID4gMSkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZygnZm9vJyk7XG4gICAgICAgIC8vIHJlc3QucmV2ZXJzZSgpOyAvLyBzdGFydCBmcm9tIGVuZFxuICAgICAgICBsZXQgbGFzdEludGVyc2VjdGlvbiA9IHJlc3QuZ2V0TmVhcmVzdExvY2F0aW9uKGludGVyc2VjdGlvbnNbaW50ZXJzZWN0aW9ucy5sZW5ndGggLSAxXS5wb2ludCk7XG4gICAgICAgIC8vIGxldCBjaXJjbGVUd28gPSBuZXcgUGF0aC5DaXJjbGUoe1xuICAgICAgICAvLyAgIGNlbnRlcjogbGFzdEludGVyc2VjdGlvbi5wb2ludCxcbiAgICAgICAgLy8gICByYWRpdXM6IDUsXG4gICAgICAgIC8vICAgc3Ryb2tlQ29sb3I6ICdncmVlbidcbiAgICAgICAgLy8gfSk7XG4gICAgICAgIGxhc3RTZWdtZW50ID0gcmVzdC5zcGxpdEF0KGxhc3RJbnRlcnNlY3Rpb24pOyAvLyByZXN0IGlzIG5vdyBldmVyeXRoaW5nIEJVVCB0aGUgZmlyc3QgYW5kIGxhc3Qgc2VnbWVudHNcbiAgICAgICAgaWYgKCFsYXN0U2VnbWVudCB8fCAhbGFzdFNlZ21lbnQubGVuZ3RoKSBsYXN0U2VnbWVudCA9IHJlc3Q7XG4gICAgICAgIHJlc3QucmV2ZXJzZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGFzdFNlZ21lbnQgPSByZXN0O1xuICAgICAgfVxuICAgICAgLy8gbGFzdFNlZ21lbnQuc3Ryb2tlQ29sb3IgPSAnZ3JlZW4nO1xuXG4gICAgICBpZiAoZmlyc3RTZWdtZW50Lmxlbmd0aCA8PSAwLjEgKiB0b3RhbExlbmd0aCkge1xuICAgICAgICBtaWRkbGVDb3B5LnN1YnRyYWN0KGZpcnN0U2VnbWVudCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChsYXN0U2VnbWVudC5sZW5ndGggPD0gMC4xICogdG90YWxMZW5ndGgpIHtcbiAgICAgICAgbWlkZGxlQ29weS5zdWJ0cmFjdChsYXN0U2VnbWVudCk7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIG1pZGRsZUNvcHkuZnVsbHlTZWxlY3RlZCA9IHRydWU7XG4gICAgLy8gbWlkZGxlQ29weS5zdHJva2VDb2xvciA9ICdwaW5rJztcbiAgICAvLyBtaWRkbGVDb3B5LnZpc2libGUgPSB0cnVlO1xuICAgIC8vIGdyb3VwLl9uYW1lZENoaWxkcmVuLm1pZGRsZVswXS5yZXBsYWNlV2l0aChtaWRkbGVDb3B5KTtcbiAgICByZXR1cm4gZ3JvdXA7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjb25zb2xlLmxvZygnZXJyb3IgdHJ1ZWluZyBncm91cHMnLCBlKTtcbiAgICByZXR1cm4gZ3JvdXA7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRydWVQYXRoKHBhdGgpIHtcbiAgLy8gY29uc29sZS5sb2coZ3JvdXApO1xuICAvLyBpZiAocGF0aCAmJiBwYXRoLmNoaWxkcmVuICYmIHBhdGguY2hpbGRyZW4ubGVuZ3RoID4gMCAmJiBwYXRoLl9uYW1lZENoaWxkcmVuWydtaWRkbGUnXSkge1xuICAvLyAgIGxldCBwYXRoQ29weSA9IG5ldyBQYXRoKCk7XG4gIC8vICAgY29uc29sZS5sb2cocGF0aC5fbmFtZWRDaGlsZHJlblsnbWlkZGxlJ10pO1xuICAvLyAgIHBhdGhDb3B5LmNvcHlDb250ZW50KHBhdGguX25hbWVkQ2hpbGRyZW5bJ21pZGRsZSddKTtcbiAgLy8gICBjb25zb2xlLmxvZyhwYXRoQ29weSk7XG4gIC8vIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrUG9wcygpIHtcbiAgbGV0IGdyb3VwcyA9IHBhcGVyLnByb2plY3QuZ2V0SXRlbXMoe1xuICAgIGNsYXNzTmFtZTogJ0dyb3VwJyxcbiAgICBtYXRjaDogZnVuY3Rpb24oZWwpIHtcbiAgICAgIHJldHVybiAoISFlbC5kYXRhICYmIGVsLmRhdGEudXBkYXRlKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vLyBodHRwczovL2dyb3Vwcy5nb29nbGUuY29tL2ZvcnVtLyMhdG9waWMvcGFwZXJqcy9VRDhMME1UeVJlUVxuZXhwb3J0IGZ1bmN0aW9uIG92ZXJsYXBzKHBhdGgsIG90aGVyKSB7XG4gIHJldHVybiAhKHBhdGguZ2V0SW50ZXJzZWN0aW9ucyhvdGhlcikubGVuZ3RoID09PSAwKTtcbn1cblxuLy8gaHR0cHM6Ly9ncm91cHMuZ29vZ2xlLmNvbS9mb3J1bS8jIXRvcGljL3BhcGVyanMvVUQ4TDBNVHlSZVFcbmV4cG9ydCBmdW5jdGlvbiBtZXJnZU9uZVBhdGgocGF0aCwgb3RoZXJzKSB7XG4gIGxldCBpLCBtZXJnZWQsIG90aGVyLCB1bmlvbiwgX2ksIF9sZW4sIF9yZWY7XG4gIGZvciAoaSA9IF9pID0gMCwgX2xlbiA9IG90aGVycy5sZW5ndGg7IF9pIDwgX2xlbjsgaSA9ICsrX2kpIHtcbiAgICBvdGhlciA9IG90aGVyc1tpXTtcbiAgICBpZiAob3ZlcmxhcHMocGF0aCwgb3RoZXIpKSB7XG4gICAgICB1bmlvbiA9IHBhdGgudW5pdGUob3RoZXIpO1xuICAgICAgbWVyZ2VkID0gbWVyZ2VPbmVQYXRoKHVuaW9uLCBvdGhlcnMuc2xpY2UoaSArIDEpKTtcbiAgICAgIHJldHVybiAoX3JlZiA9IG90aGVycy5zbGljZSgwLCBpKSkuY29uY2F0LmFwcGx5KF9yZWYsIG1lcmdlZCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBvdGhlcnMuY29uY2F0KHBhdGgpO1xufTtcblxuLy8gaHR0cHM6Ly9ncm91cHMuZ29vZ2xlLmNvbS9mb3J1bS8jIXRvcGljL3BhcGVyanMvVUQ4TDBNVHlSZVFcbmV4cG9ydCBmdW5jdGlvbiBtZXJnZVBhdGhzKHBhdGhzKSB7XG4gIHZhciBwYXRoLCByZXN1bHQsIF9pLCBfbGVuO1xuICByZXN1bHQgPSBbXTtcbiAgZm9yIChfaSA9IDAsIF9sZW4gPSBwYXRocy5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgIHBhdGggPSBwYXRoc1tfaV07XG4gICAgcmVzdWx0ID0gbWVyZ2VPbmVQYXRoKHBhdGgsIHJlc3VsdCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBoaXRUZXN0Qm91bmRzKHBvaW50LCBjaGlsZHJlbikge1xuICBpZiAoIXBvaW50KSByZXR1cm4gbnVsbDtcblxuICBmb3IgKGxldCBpID0gY2hpbGRyZW4ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBsZXQgY2hpbGQgPSBjaGlsZHJlbltpXTtcbiAgICBsZXQgYm91bmRzID0gY2hpbGQuc3Ryb2tlQm91bmRzO1xuICAgIGlmIChwb2ludC5pc0luc2lkZShjaGlsZC5zdHJva2VCb3VuZHMpKSB7XG4gICAgICByZXR1cm4gY2hpbGQ7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG4iXX0=
