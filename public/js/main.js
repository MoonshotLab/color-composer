(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

exports.palette = {
  colors: ["#20171C", "#1E2A43", "#28377D", "#352747", "#CA2E26", "#9A2A1F", "#DA6C26", "#453121", "#916A47", "#DAAD27", "#7F7D31", "#2B5E2E"],
  pops: ["#00ADEF", "#F285A5", "#7DC57F", "#F6EB16", "#F4EAE0"],
  colorSize: 20,
  selectedColorSize: 30
};

exports.shape = {
  extendingThreshold: 0.1,
  trimmingThreshold: 0.075
};

},{}],2:[function(require,module,exports){
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
    var pathData = [];

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
        strokeWidth: 5,
        visible: true,
        strokeCap: 'round'
      });

      bounds.add(point);
      middle.add(point);
    }

    var min = 1;
    var max = 15;
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
      bounds.closed = true;
      bounds.simplify();

      middle.add(point);
      middle.simplify();

      group.replaceWith(util.trueGroup(group));
      middle = group._namedChildren.middle[0];
      middle.strokeColor = group.strokeColor;

      bounds.flatten(4);
      bounds.smooth();

      // Base.each(middle, (middlePoint) => {
      //   console.log(middlePoint);
      // });

      // bounds.interpolate(bounds.clone(), middle, 0.5);

      middle.flatten(4);
      middle.reduce();

      var ideal = middle.clone();
      ideal.strokeColor = 'pink';
      ideal.strokeWidth = 5;
      ideal.strokeCap = 'round';

      // middle.smooth({
      //   type: 'geometric'
      // });
      // middle.flatten(10);
      // middle.simplify();
      // middle.flatten(20);
      // middle.simplify();
      // middle.flatten();
      // middle.simplify();

      // middle.selected = true;
      // middle.visible = true;
      // middle.strokeColor = 'pink';


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

      // middle.selected = true;
      // middle.visible = true;
      // middle.strokeColor = 'pink';

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

},{"./util":3}],3:[function(require,module,exports){
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
exports.extendPath = extendPath;
exports.trimPath = trimPath;
exports.removePathExtensions = removePathExtensions;
exports.checkPops = checkPops;
exports.overlaps = overlaps;
exports.mergeOnePath = mergeOnePath;
exports.mergePaths = mergePaths;
exports.hitTestBounds = hitTestBounds;
var config = require('./../../config');

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

  var intersections = middle.getIntersections();

  var middleCopy = new Path();
  middleCopy.copyContent(middle);
  // debugger;

  if (intersections.length > 0) {
    // see if we can trim the path while maintaining intersections
    // console.log('intersections!');
    // middleCopy.strokeColor = 'yellow';
    middleCopy = trimPath(middleCopy);
    // middleCopy.strokeColor = 'orange';
  } else {
    // extend first and last segment by threshold, see if intersection
    // console.log('no intersections, extending first!');
    // middleCopy.strokeColor = 'yellow';
    middleCopy = extendPath(middleCopy);
    // middleCopy.strokeColor = 'orange';
    var _intersections = middleCopy.getIntersections();
    if (_intersections.length > 0) {
      // middleCopy.strokeColor = 'pink';
      middleCopy = trimPath(middleCopy);
      // middleCopy.strokeColor = 'green';
    } else {
      // middleCopy.strokeColor = 'red';
      middleCopy = removePathExtensions(middleCopy);
      // middleCopy.strokeColor = 'blue';
    }
  }

  middleCopy.name = 'middle'; // make sure

  // group.addChild(middleCopy);
  // group._namedChildren.middle[0] = middleCopy;
  group._namedChildren.middle[0].replaceWith(middleCopy);;
  return group;
}

function extendPath(path) {
  if (path.length > 0) {
    var lengthTolerance = config.shape.trimmingThreshold * path.length;

    var firstSegment = path.firstSegment;
    var nextSegment = firstSegment.next;
    var startAngle = Math.atan2(nextSegment.point.y - firstSegment.point.y, nextSegment.point.x - firstSegment.point.x); // rad
    var inverseStartAngle = startAngle + Math.PI;
    var extendedStartPoint = new Point(firstSegment.point.x + Math.cos(inverseStartAngle) * lengthTolerance, firstSegment.point.y + Math.sin(inverseStartAngle) * lengthTolerance);
    path.insert(0, extendedStartPoint);

    var lastSegment = path.lastSegment;
    var penSegment = lastSegment.previous; // penultimate
    var endAngle = Math.atan2(lastSegment.point.y - penSegment.point.y, lastSegment.point.x - penSegment.point.x); // rad
    var extendedEndPoint = new Point(lastSegment.point.x + Math.cos(endAngle) * lengthTolerance, lastSegment.point.y + Math.sin(endAngle) * lengthTolerance);
    path.add(extendedEndPoint);
  }
  return path;
}

function trimPath(path) {
  var originalPath = path.clone();
  // originalPath.strokeColor = 'pink';
  try {
    var _ret = function () {
      var intersections = path.getIntersections();
      var dividedPath = path.resolveCrossings();

      var extendingThreshold = config.shape.extendingThreshold;
      var totalLength = path.length;

      // we want to remove all closed loops from the path, since these are necessarily interior and not first or last
      Base.each(dividedPath.children, function (child, i) {
        if (child.closed) {
          // console.log('subtracting closed child');
          dividedPath = dividedPath.subtract(child);
        } else {
          // dividedPath = dividedPath.unite(child);
        }
      });

      // console.log(dividedPath);

      if (!!dividedPath.children && dividedPath.children.length > 1) {
        (function () {
          // divided path is a compound path
          var unitedDividedPath = new Path();
          // unitedDividedPath.copyAttributes(dividedPath);
          // console.log('before', unitedDividedPath);
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

        if (!!firstSegment && firstSegment.length <= extendingThreshold * totalLength) {
          path = path.subtract(firstSegment);
          if (path.className === 'CompoundPath') {
            Base.each(path.children, function (child, i) {
              if (!child.closed) {
                child.remove();
              }
            });
          }
        }

        if (!!lastSegment && lastSegment.length <= extendingThreshold * totalLength) {
          path = path.subtract(lastSegment);
          if (path.className === 'CompoundPath') {
            Base.each(path.children, function (child, i) {
              if (!child.closed) {
                child.remove();
              }
            });
          }
        }
      }

      // this is hacky but I'm not sure how to get around it
      // sometimes path.subtract() returns a compound path, with children consisting of the closed path I want and another extraneous closed path
      // it appears that the correct path always has a higher version, though I'm not 100% sure that this is always the case

      if (path.className === 'CompoundPath' && path.children.length > 0) {
        if (path.children.length > 1) {
          (function () {
            var largestChild = void 0;
            var largestChildArea = 0;

            Base.each(path.children, function (child, i) {
              if (child.area > largestChildArea) {
                largestChildArea = child.area;
                largestChild = child;
              }
            });

            if (largestChild) {
              path = largestChild;
            } else {
              path = path.children[0];
            }
          })();
        } else {
          path = path.children[0];
        }
        // console.log(path);
        // console.log(path.lastChild);
        // path.firstChild.strokeColor = 'pink';
        // path.lastChild.strokeColor = 'green';
        // path = path.lastChild; // return last child?
        // find highest version
        //
        // console.log(realPathVersion);
        //
        // Base.each(path.children, (child, i) => {
        //   if (child.version == realPathVersion) {
        //     console.log('returning child');
        //     return child;
        //   }
        // })
      }
      // console.log('original length:', totalLength);
      // console.log('edited length:', path.length);
      if (path.length / totalLength <= 0.75) {
        console.log('returning original');
        return {
          v: originalPath
        };
      } else {
        return {
          v: path
        };
      }
    }();

    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
  } catch (e) {
    console.error(e);
    return originalPath;
  }
}

function removePathExtensions(path) {
  path.removeSegment(0);
  path.removeSegment(path.segments.length - 1);
  return path;
}

// export function truePath(path) {
//   // console.log(group);
//   // if (path && path.children && path.children.length > 0 && path._namedChildren['middle']) {
//   //   let pathCopy = new Path();
//   //   console.log(path._namedChildren['middle']);
//   //   pathCopy.copyContent(path._namedChildren['middle']);
//   //   console.log(pathCopy);
//   // }
// }

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

},{"./../../config":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjb25maWcuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxRQUFRLE9BQVIsR0FBa0I7QUFDaEIsVUFBUSxDQUFDLFNBQUQsRUFBWSxTQUFaLEVBQXVCLFNBQXZCLEVBQWtDLFNBQWxDLEVBQTZDLFNBQTdDLEVBQXdELFNBQXhELEVBQW1FLFNBQW5FLEVBQThFLFNBQTlFLEVBQXlGLFNBQXpGLEVBQW9HLFNBQXBHLEVBQStHLFNBQS9HLEVBQXlILFNBQXpILENBRFE7QUFFaEIsUUFBTSxDQUFDLFNBQUQsRUFBWSxTQUFaLEVBQXVCLFNBQXZCLEVBQWtDLFNBQWxDLEVBQTZDLFNBQTdDLENBRlU7QUFHaEIsYUFBVyxFQUhLO0FBSWhCLHFCQUFtQjtBQUpILENBQWxCOztBQU9BLFFBQVEsS0FBUixHQUFnQjtBQUNkLHNCQUFvQixHQUROO0FBRWQscUJBQW1CO0FBRkwsQ0FBaEI7Ozs7O0FDUEEsT0FBTyxHQUFQLEdBQWEsT0FBTyxHQUFQLElBQWM7QUFDekIsV0FBUyxDQUFDLFNBQUQsRUFBWSxTQUFaLEVBQXVCLFNBQXZCLEVBQWtDLFNBQWxDLEVBQTZDLFNBQTdDLEVBQXdELFNBQXhELEVBQW1FLFNBQW5FLEVBQThFLFNBQTlFLEVBQXlGLFNBQXpGLEVBQW9HLFNBQXBHLEVBQStHLFNBQS9HLEVBQTBILFNBQTFILEVBQXFJLFNBQXJJLEVBQWdKLFNBQWhKLEVBQTJKLFNBQTNKLEVBQXNLLFNBQXRLLENBRGdCO0FBRXpCLGdCQUFjLFNBRlc7QUFHekIsWUFBVSxFQUhlO0FBSXpCLFNBQU87QUFKa0IsQ0FBM0I7O0FBT0EsTUFBTSxPQUFOLENBQWMsTUFBZDs7QUFFQSxJQUFNLE9BQU8sUUFBUSxRQUFSLENBQWI7QUFDQTs7QUFFQSxFQUFFLFFBQUYsRUFBWSxLQUFaLENBQWtCLFlBQVc7QUFDM0IsTUFBSSxRQUFRLEVBQVosQ0FEMkIsQ0FDWDtBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsTUFBTSxVQUFVLEVBQUUsTUFBRixDQUFoQjtBQUNBLE1BQU0sUUFBUSxFQUFFLE1BQUYsQ0FBZDtBQUNBLE1BQU0sVUFBVSxFQUFFLG1CQUFGLENBQWhCO0FBQ0EsTUFBTSxnQkFBZ0IsS0FBdEI7QUFDQSxNQUFNLGNBQWMsSUFBSSxLQUFKLENBQVUsQ0FBVixFQUFhLENBQWIsQ0FBcEI7O0FBRUEsTUFBSSxrQkFBSjtBQUFBLE1BQWUsbUJBQWY7O0FBRUEsV0FBUyxhQUFULENBQXVCLEtBQXZCLEVBQThCO0FBQzVCLFdBQU8sS0FBSyxhQUFMLENBQW1CLEtBQW5CLEVBQTBCLE1BQU0sT0FBTixDQUFjLFdBQWQsQ0FBMEIsUUFBcEQsQ0FBUDtBQUNEOztBQUVELFdBQVMsa0JBQVQsQ0FBNEIsS0FBNUIsRUFBbUM7QUFDakMsUUFBSSxTQUFTLE1BQU0sT0FBTixDQUFjLFFBQWQsQ0FBdUI7QUFDbEMsaUJBQVc7QUFEdUIsS0FBdkIsQ0FBYjtBQUdBLFdBQU8sS0FBSyxhQUFMLENBQW1CLEtBQW5CLEVBQTBCLE1BQTFCLENBQVA7QUFDRDs7QUFFRCxXQUFTLFlBQVQsR0FBd0I7QUFDdEIsZ0JBQVksTUFBTSxJQUFOLENBQVcsUUFBWCxDQUFvQixLQUFoQztBQUNBLGlCQUFhLE1BQU0sSUFBTixDQUFXLFFBQVgsQ0FBb0IsTUFBakM7QUFDRDs7QUFFRCxXQUFTLGdCQUFULEdBQTRCO0FBQzFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Q7O0FBRUQsV0FBUyxnQkFBVCxHQUE0QjtBQUMxQixRQUFNLGVBQWUsRUFBRSxtQkFBRixDQUFyQjtBQUNBLFFBQU0saUJBQWlCLGFBQWEsSUFBYixDQUFrQixJQUFsQixDQUF2QjtBQUNBLFFBQU0sbUJBQW1CLEVBQXpCO0FBQ0EsUUFBTSwyQkFBMkIsRUFBakM7QUFDQSxRQUFNLHVCQUF1QixrQkFBN0I7O0FBRUE7QUFDRSxtQkFBZSxFQUFmLENBQWtCLGlCQUFsQixFQUFxQyxZQUFXO0FBQzVDLFVBQUksT0FBTyxFQUFFLElBQUYsRUFBUSxJQUFSLENBQWEsbUJBQWIsQ0FBWDs7QUFFQSxVQUFJLENBQUMsS0FBSyxRQUFMLENBQWMsb0JBQWQsQ0FBTCxFQUEwQztBQUN4QyxVQUFFLE1BQU0sb0JBQVIsRUFDRyxXQURILENBQ2Usb0JBRGYsRUFFRyxJQUZILENBRVEsT0FGUixFQUVpQixnQkFGakIsRUFHRyxJQUhILENBR1EsUUFIUixFQUdrQixnQkFIbEIsRUFJRyxJQUpILENBSVEsTUFKUixFQUtHLElBTEgsQ0FLUSxJQUxSLEVBS2MsQ0FMZCxFQU1HLElBTkgsQ0FNUSxJQU5SLEVBTWMsQ0FOZDs7QUFRQSxhQUFLLFFBQUwsQ0FBYyxvQkFBZCxFQUNHLElBREgsQ0FDUSxPQURSLEVBQ2lCLHdCQURqQixFQUVHLElBRkgsQ0FFUSxRQUZSLEVBRWtCLHdCQUZsQixFQUdHLElBSEgsQ0FHUSxNQUhSLEVBSUcsSUFKSCxDQUlRLElBSlIsRUFJYywyQkFBMkIsQ0FKekMsRUFLRyxJQUxILENBS1EsSUFMUixFQUtjLDJCQUEyQixDQUx6Qzs7QUFPQSxlQUFPLEdBQVAsQ0FBVyxZQUFYLEdBQTBCLEtBQUssSUFBTCxDQUFVLE1BQVYsRUFBa0IsSUFBbEIsQ0FBdUIsTUFBdkIsQ0FBMUI7QUFDRDtBQUNGLEtBckJIO0FBc0JIOztBQUVELFdBQVMsY0FBVCxHQUEwQjs7QUFFeEIsVUFBTSxLQUFOLENBQVksUUFBUSxDQUFSLENBQVo7O0FBRUEsUUFBSSxlQUFKO0FBQUEsUUFBWSxlQUFaO0FBQ0EsUUFBSSxhQUFKO0FBQ0EsUUFBSSxjQUFKO0FBQ0E7QUFDQSxRQUFJLFFBQVEsS0FBWjtBQUNBLFFBQUksa0JBQUo7QUFDQSxRQUFJLFdBQVcsRUFBZjs7QUFFQSxhQUFTLFFBQVQsQ0FBa0IsS0FBbEIsRUFBeUI7QUFDdkIsWUFBTSxPQUFOLENBQWMsV0FBZCxDQUEwQixjQUExQixHQUR1QixDQUNxQjtBQUM1Qzs7QUFFQSxjQUFRLEVBQVI7O0FBRUEsVUFBSSxRQUFKLEVBQWM7QUFDZCxVQUFJLEVBQUUsTUFBTSxlQUFOLElBQXlCLE1BQU0sZUFBTixDQUFzQixNQUF0QixHQUErQixDQUExRCxDQUFKLEVBQWtFO0FBQ2xFLFVBQUksTUFBTSxlQUFOLENBQXNCLE1BQXRCLEdBQStCLENBQW5DLEVBQXNDO0FBQ3BDLGdCQUFRLEdBQVIsQ0FBWSwyQkFBWjtBQUNEOztBQUVELFVBQU0sVUFBVSxNQUFNLE1BQXRCO0FBQ0EsVUFBTSxRQUFRLElBQUksS0FBSixDQUFVLFFBQVEsQ0FBbEIsRUFBcUIsUUFBUSxDQUE3QixDQUFkOztBQUVBLGVBQVMsSUFBSSxJQUFKLENBQVM7QUFDaEIscUJBQWEsT0FBTyxHQUFQLENBQVcsWUFEUjtBQUVoQixtQkFBVyxPQUFPLEdBQVAsQ0FBVyxZQUZOO0FBR2hCLGNBQU0sUUFIVTtBQUloQixpQkFBUztBQUpPLE9BQVQsQ0FBVDs7QUFPQSxlQUFTLElBQUksSUFBSixDQUFTO0FBQ2hCLHFCQUFhLE9BQU8sR0FBUCxDQUFXLFlBRFI7QUFFaEIsY0FBTSxRQUZVO0FBR2hCLHFCQUFhLENBSEc7QUFJaEIsaUJBQVMsSUFKTztBQUtoQixtQkFBVztBQUxLLE9BQVQsQ0FBVDs7QUFRQSxhQUFPLEdBQVAsQ0FBVyxLQUFYO0FBQ0EsYUFBTyxHQUFQLENBQVcsS0FBWDtBQUNEOztBQUVELFFBQU0sTUFBTSxDQUFaO0FBQ0EsUUFBTSxNQUFNLEVBQVo7QUFDQSxRQUFNLFFBQVEsR0FBZDtBQUNBLFFBQU0sU0FBUyxFQUFmO0FBQ0EsUUFBSSxjQUFjLENBQWxCO0FBQ0EsUUFBSSxnQkFBSjtBQUFBLFFBQWEsZ0JBQWI7QUFDQSxhQUFTLE9BQVQsQ0FBaUIsS0FBakIsRUFBd0I7QUFDdEIsWUFBTSxjQUFOO0FBQ0EsVUFBSSxRQUFKLEVBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFVBQU0sVUFBVSxNQUFNLE1BQXRCO0FBQ0EsVUFBSSxRQUFRLElBQUksS0FBSixDQUFVLFFBQVEsQ0FBbEIsRUFBcUIsUUFBUSxDQUE3QixDQUFaOztBQUVBLGFBQU8sTUFBTSxNQUFOLEdBQWUsTUFBdEIsRUFBOEI7QUFDNUIsY0FBTSxLQUFOO0FBQ0Q7O0FBRUQsVUFBSSxnQkFBSjtBQUFBLFVBQWEsZ0JBQWI7QUFBQSxVQUFzQixlQUF0QjtBQUFBLFVBQ0UsYUFERjtBQUFBLFVBQ1EsYUFEUjtBQUFBLFVBQ2MsWUFEZDtBQUFBLFVBRUUsV0FGRjtBQUFBLFVBRU0sV0FGTjtBQUFBLFVBR0UsYUFIRjtBQUFBLFVBR1EsY0FIUjtBQUFBLFVBR2UsYUFIZjtBQUFBLFVBR3FCLGFBSHJCOztBQUtBLFVBQUksTUFBTSxNQUFOLEdBQWUsQ0FBbkIsRUFBc0I7QUFDcEI7QUFDQSxhQUFLLElBQUw7QUFDQSxlQUFPLEtBQUssS0FBTCxDQUFXLEtBQVgsRUFBa0IsRUFBbEIsQ0FBUDtBQUNBLGVBQU8sT0FBTyxLQUFkO0FBQ0E7QUFDQSxlQUFPLEtBQUssR0FBTCxDQUFTLEtBQUssR0FBTCxDQUFTLElBQVQsRUFBZSxHQUFmLENBQVQsRUFBOEIsR0FBOUIsQ0FBUCxDQU5vQixDQU11QjtBQUMzQzs7QUFFQSxrQkFBVSxDQUFWO0FBQ0EsYUFBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLE1BQU0sTUFBMUIsRUFBa0MsR0FBbEMsRUFBdUM7QUFDckMscUJBQVcsTUFBTSxDQUFOLENBQVg7QUFDRDtBQUNELGtCQUFVLEtBQUssS0FBTCxDQUFXLENBQUUsVUFBVSxNQUFNLE1BQWpCLEdBQTJCLElBQTVCLElBQW9DLENBQS9DLENBQVY7QUFDQTs7QUFFQSxnQkFBUSxLQUFLLEtBQUwsQ0FBVyxNQUFNLENBQU4sR0FBVSxHQUFHLENBQXhCLEVBQTJCLE1BQU0sQ0FBTixHQUFVLEdBQUcsQ0FBeEMsQ0FBUixDQWhCb0IsQ0FnQmdDOztBQUVwRDtBQUNBLGtCQUFVLE1BQU0sQ0FBTixHQUFVLEtBQUssR0FBTCxDQUFTLFFBQVEsS0FBSyxFQUFMLEdBQVEsQ0FBekIsSUFBOEIsT0FBbEQ7QUFDQSxrQkFBVSxNQUFNLENBQU4sR0FBVSxLQUFLLEdBQUwsQ0FBUyxRQUFRLEtBQUssRUFBTCxHQUFRLENBQXpCLElBQThCLE9BQWxEO0FBQ0EsaUJBQVMsSUFBSSxLQUFKLENBQVUsT0FBVixFQUFtQixPQUFuQixDQUFUOztBQUVBLGVBQU8sTUFBTSxDQUFOLEdBQVUsS0FBSyxHQUFMLENBQVMsUUFBUSxLQUFLLEVBQUwsR0FBUSxDQUF6QixJQUE4QixPQUEvQztBQUNBLGVBQU8sTUFBTSxDQUFOLEdBQVUsS0FBSyxHQUFMLENBQVMsUUFBUSxLQUFLLEVBQUwsR0FBUSxDQUF6QixJQUE4QixPQUEvQztBQUNBLGNBQU0sSUFBSSxLQUFKLENBQVUsSUFBVixFQUFnQixJQUFoQixDQUFOOztBQUVBLGVBQU8sR0FBUCxDQUFXLEdBQVg7QUFDQSxlQUFPLE1BQVAsQ0FBYyxDQUFkLEVBQWlCLE1BQWpCO0FBQ0E7O0FBRUEsZUFBTyxHQUFQLENBQVcsS0FBWDtBQUNBO0FBQ0QsT0FqQ0QsTUFpQ087QUFDTDtBQUNBLGVBQU8sQ0FBUDtBQUNBLGdCQUFRLENBQVI7O0FBRUEsZUFBTyxPQUFPLEtBQWQ7QUFDQSxlQUFPLEtBQUssR0FBTCxDQUFTLEtBQUssR0FBTCxDQUFTLElBQVQsRUFBZSxHQUFmLENBQVQsRUFBOEIsR0FBOUIsQ0FBUCxDQU5LLENBTXNDO0FBQzVDOztBQUVELFlBQU0sSUFBTixDQUFXLElBQVg7O0FBRUEsYUFBTyxLQUFQO0FBQ0EsWUFBTSxJQUFOLENBQVcsSUFBWDtBQUNEOztBQUVELGFBQVMsTUFBVCxDQUFnQixLQUFoQixFQUF1QjtBQUNyQixVQUFJLFFBQUosRUFBYzs7QUFFZCxVQUFNLFVBQVUsTUFBTSxNQUF0QjtBQUNBLFVBQU0sUUFBUSxJQUFJLEtBQUosQ0FBVSxRQUFRLENBQWxCLEVBQXFCLFFBQVEsQ0FBN0IsQ0FBZDs7QUFFQSxVQUFJLFFBQVEsSUFBSSxLQUFKLENBQVUsQ0FBQyxNQUFELEVBQVMsTUFBVCxDQUFWLENBQVo7QUFDQSxZQUFNLElBQU4sQ0FBVyxLQUFYLEdBQW1CLE9BQU8sU0FBMUI7QUFDQSxZQUFNLElBQU4sQ0FBVyxNQUFYLEdBQW9CLElBQXBCOztBQUVBLGFBQU8sR0FBUCxDQUFXLEtBQVg7QUFDQSxhQUFPLE1BQVAsR0FBZ0IsSUFBaEI7QUFDQSxhQUFPLFFBQVA7O0FBRUEsYUFBTyxHQUFQLENBQVcsS0FBWDtBQUNBLGFBQU8sUUFBUDs7QUFFQSxZQUFNLFdBQU4sQ0FBa0IsS0FBSyxTQUFMLENBQWUsS0FBZixDQUFsQjtBQUNBLGVBQVMsTUFBTSxjQUFOLENBQXFCLE1BQXJCLENBQTRCLENBQTVCLENBQVQ7QUFDQSxhQUFPLFdBQVAsR0FBcUIsTUFBTSxXQUEzQjs7QUFFQSxhQUFPLE9BQVAsQ0FBZSxDQUFmO0FBQ0EsYUFBTyxNQUFQOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSxhQUFPLE9BQVAsQ0FBZSxDQUFmO0FBQ0EsYUFBTyxNQUFQOztBQUVBLFVBQUksUUFBUSxPQUFPLEtBQVAsRUFBWjtBQUNBLFlBQU0sV0FBTixHQUFvQixNQUFwQjtBQUNBLFlBQU0sV0FBTixHQUFvQixDQUFwQjtBQUNBLFlBQU0sU0FBTixHQUFrQixPQUFsQjs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQSxVQUFJLGdCQUFnQixPQUFPLFlBQVAsRUFBcEI7QUFDQSxVQUFJLGNBQWMsTUFBZCxHQUF1QixDQUEzQixFQUE4QjtBQUM1QjtBQUNBLFlBQUksV0FBVyxJQUFJLElBQUosRUFBZjtBQUNBLGlCQUFTLFdBQVQsQ0FBcUIsTUFBckI7QUFDQSxpQkFBUyxPQUFULEdBQW1CLEtBQW5COztBQUVBLFlBQUksY0FBYyxTQUFTLGdCQUFULEVBQWxCO0FBQ0Esb0JBQVksT0FBWixHQUFzQixLQUF0Qjs7QUFHQSxZQUFJLGdCQUFnQixLQUFLLGtCQUFMLENBQXdCLFdBQXhCLENBQXBCOztBQUVBLFlBQUksYUFBSixFQUFtQjtBQUNqQixlQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksY0FBYyxNQUFsQyxFQUEwQyxHQUExQyxFQUErQztBQUM3QywwQkFBYyxDQUFkLEVBQWlCLE9BQWpCLEdBQTJCLElBQTNCO0FBQ0EsMEJBQWMsQ0FBZCxFQUFpQixNQUFqQixHQUEwQixJQUExQjtBQUNBLDBCQUFjLENBQWQsRUFBaUIsU0FBakIsR0FBNkIsSUFBSSxLQUFKLENBQVUsQ0FBVixFQUFhLENBQWIsQ0FBN0IsQ0FINkMsQ0FHQztBQUM5QywwQkFBYyxDQUFkLEVBQWlCLElBQWpCLENBQXNCLFFBQXRCLEdBQWlDLElBQWpDO0FBQ0EsMEJBQWMsQ0FBZCxFQUFpQixJQUFqQixDQUFzQixXQUF0QixHQUFvQyxJQUFwQztBQUNBO0FBQ0Esa0JBQU0sUUFBTixDQUFlLGNBQWMsQ0FBZCxDQUFmO0FBQ0EsMEJBQWMsQ0FBZCxFQUFpQixVQUFqQjtBQUNEO0FBQ0Y7QUFDRCxpQkFBUyxNQUFUO0FBQ0QsT0F6QkQsTUF5Qk87QUFDTDtBQUNEOztBQUVELFlBQU0sSUFBTixDQUFXLEtBQVgsR0FBbUIsT0FBTyxTQUExQjtBQUNBLFlBQU0sSUFBTixDQUFXLEtBQVgsR0FBbUIsQ0FBbkIsQ0FyRnFCLENBcUZDO0FBQ3RCLFlBQU0sSUFBTixDQUFXLFFBQVgsR0FBc0IsQ0FBdEIsQ0F0RnFCLENBc0ZJOztBQUV6QixVQUFJLFdBQVcsTUFBTSxRQUFOLENBQWU7QUFDNUIsZUFBTyxlQUFTLElBQVQsRUFBZTtBQUNwQixpQkFBTyxLQUFLLElBQUwsS0FBYyxRQUFyQjtBQUNEO0FBSDJCLE9BQWYsQ0FBZjs7QUFNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQUksYUFBYSxJQUFJLElBQUosRUFBakI7QUFDQSxVQUFJLFNBQVMsTUFBVCxHQUFrQixDQUF0QixFQUF5QjtBQUN2QixZQUFJLGNBQWMsSUFBSSxJQUFKLEVBQWxCO0FBQ0Esb0JBQVksV0FBWixDQUF3QixTQUFTLENBQVQsQ0FBeEI7QUFDQSxvQkFBWSxPQUFaLEdBQXNCLEtBQXRCOztBQUVBLGFBQUssSUFBSSxLQUFJLENBQWIsRUFBZ0IsS0FBSSxTQUFTLE1BQTdCLEVBQXFDLElBQXJDLEVBQTBDO0FBQ3hDLGNBQUksWUFBWSxJQUFJLElBQUosRUFBaEI7QUFDQSxvQkFBVSxXQUFWLENBQXNCLFNBQVMsRUFBVCxDQUF0QjtBQUNBLG9CQUFVLE9BQVYsR0FBb0IsS0FBcEI7O0FBRUEsdUJBQWEsWUFBWSxLQUFaLENBQWtCLFNBQWxCLENBQWI7QUFDQSxvQkFBVSxNQUFWO0FBQ0Esd0JBQWMsVUFBZDtBQUNEO0FBRUYsT0FmRCxNQWVPO0FBQ0w7QUFDQSxtQkFBVyxXQUFYLENBQXVCLFNBQVMsQ0FBVCxDQUF2QjtBQUNEOztBQUVELGlCQUFXLE9BQVgsR0FBcUIsS0FBckI7QUFDQSxpQkFBVyxJQUFYLENBQWdCLElBQWhCLEdBQXVCLE1BQXZCOztBQUVBLFlBQU0sUUFBTixDQUFlLFVBQWY7QUFDQSxpQkFBVyxVQUFYOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxrQkFBWSxLQUFaOztBQUVBLFlBQU0sSUFBTixDQUFXO0FBQ1QsY0FBTSxVQURHO0FBRVQsWUFBSSxNQUFNO0FBRkQsT0FBWDs7QUFLQSxVQUFJLGFBQUosRUFBbUI7QUFDakIsY0FBTSxPQUFOLENBQ0UsQ0FBQztBQUNDLHNCQUFZO0FBQ1YsbUJBQU87QUFERyxXQURiO0FBSUMsb0JBQVU7QUFDUixzQkFBVSxHQURGO0FBRVIsb0JBQVE7QUFGQTtBQUpYLFNBQUQsRUFTQTtBQUNFLHNCQUFZO0FBQ1YsbUJBQU87QUFERyxXQURkO0FBSUUsb0JBQVU7QUFDUixzQkFBVSxHQURGO0FBRVIsb0JBQVE7QUFGQTtBQUpaLFNBVEEsQ0FERjtBQW9CRDtBQUNGOztBQUVELFFBQUksaUJBQUo7QUFDQSxRQUFJLHFCQUFKO0FBQUEsUUFBa0Isa0JBQWxCO0FBQUEsUUFBNkIscUJBQTdCO0FBQ0EsUUFBSSx5QkFBSjtBQUFBLFFBQXNCLHlCQUF0QjtBQUFBLFFBQXdDLHNCQUF4Qzs7QUFFQSxhQUFTLFVBQVQsQ0FBb0IsS0FBcEIsRUFBMkI7QUFDekIsY0FBUSxHQUFSLENBQVksWUFBWixFQUEwQixNQUFNLE1BQWhDO0FBQ0Esb0JBQWMsR0FBZCxDQUFrQixLQUFsQixFQUF5QixHQUF6QixDQUE2QixFQUFDLFFBQVEsS0FBVCxFQUE3QjtBQUNBLFVBQU0sVUFBVSxNQUFNLE1BQXRCO0FBQUEsVUFDSSxRQUFRLElBQUksS0FBSixDQUFVLFFBQVEsQ0FBbEIsRUFBcUIsUUFBUSxDQUE3QixDQURaO0FBQUEsVUFFSSxZQUFZLG1CQUFtQixLQUFuQixDQUZoQjs7QUFJQSxVQUFJLFNBQUosRUFBZTtBQUNiLG1CQUFXLElBQVg7QUFDQTtBQUNBLHVCQUFlLFNBQWY7QUFDQSxvQkFBWSxDQUFaO0FBQ0EsdUJBQWUsTUFBTSxRQUFyQjs7QUFFQSwyQkFBbUIsYUFBYSxRQUFoQztBQUNBO0FBQ0EsMkJBQW1CLGFBQWEsSUFBYixDQUFrQixRQUFyQztBQUNBLHdCQUFnQixhQUFhLElBQWIsQ0FBa0IsS0FBbEM7O0FBRUEsWUFBSSxhQUFKLEVBQW1CO0FBQ2pCLHVCQUFhLE9BQWIsQ0FBcUI7QUFDbkIsd0JBQVk7QUFDVixxQkFBTztBQURHLGFBRE87QUFJbkIsc0JBQVU7QUFDUix3QkFBVSxHQURGO0FBRVIsc0JBQVE7QUFGQTtBQUpTLFdBQXJCO0FBU0Q7QUFDRixPQXZCRCxNQXVCTztBQUNMLHVCQUFlLElBQWY7QUFDQSxnQkFBUSxHQUFSLENBQVksYUFBWjtBQUNEO0FBQ0Y7O0FBRUQsYUFBUyxTQUFULENBQW1CLEtBQW5CLEVBQTBCO0FBQ3hCLGNBQVEsR0FBUixDQUFZLFdBQVo7QUFDQSxVQUFJLENBQUMsQ0FBQyxZQUFOLEVBQW9CO0FBQ2xCO0FBQ0E7QUFDQSxZQUFJLGVBQWUsTUFBTSxLQUF6QjtBQUNBLFlBQUksYUFBYSxlQUFlLFNBQWhDO0FBQ0E7QUFDQSxvQkFBWSxZQUFaOztBQUVBLFlBQUksa0JBQWtCLE1BQU0sUUFBNUI7QUFDQSxZQUFJLGdCQUFnQixrQkFBa0IsWUFBdEM7QUFDQSxnQkFBUSxHQUFSLENBQVksWUFBWixFQUEwQixlQUExQixFQUEyQyxhQUEzQztBQUNBLHVCQUFlLGVBQWY7O0FBRUE7QUFDQTs7QUFFQSxxQkFBYSxRQUFiLEdBQXdCLE1BQU0sTUFBOUI7QUFDQSxxQkFBYSxLQUFiLENBQW1CLFVBQW5CO0FBQ0EscUJBQWEsTUFBYixDQUFvQixhQUFwQjs7QUFFQSxxQkFBYSxJQUFiLENBQWtCLEtBQWxCLElBQTJCLFVBQTNCO0FBQ0EscUJBQWEsSUFBYixDQUFrQixRQUFsQixJQUE4QixhQUE5QjtBQUNEO0FBQ0Y7O0FBRUQsUUFBSSxrQkFBSjtBQUNBLGFBQVMsUUFBVCxDQUFrQixLQUFsQixFQUF5QjtBQUN2QjtBQUNBLGtCQUFZLEtBQVo7QUFDQSxVQUFJLENBQUMsQ0FBQyxZQUFOLEVBQW9CO0FBQ2xCLHFCQUFhLElBQWIsQ0FBa0IsTUFBbEIsR0FBMkIsSUFBM0I7QUFDQSxZQUFJLE9BQU87QUFDVCxjQUFJLGFBQWEsRUFEUjtBQUVULGdCQUFNO0FBRkcsU0FBWDtBQUlBLFlBQUksYUFBYSxRQUFiLElBQXlCLGdCQUE3QixFQUErQztBQUM3QyxlQUFLLFFBQUwsR0FBZ0IsZ0JBQWhCO0FBQ0Q7O0FBRUQsWUFBSSxhQUFhLElBQWIsQ0FBa0IsUUFBbEIsSUFBOEIsZ0JBQWxDLEVBQW9EO0FBQ2xELGVBQUssUUFBTCxHQUFnQixtQkFBbUIsYUFBYSxJQUFiLENBQWtCLFFBQXJEO0FBQ0Q7O0FBRUQsWUFBSSxhQUFhLElBQWIsQ0FBa0IsS0FBbEIsSUFBMkIsYUFBL0IsRUFBOEM7QUFDNUMsZUFBSyxLQUFMLEdBQWEsZ0JBQWdCLGFBQWEsSUFBYixDQUFrQixLQUEvQztBQUNEOztBQUVELGdCQUFRLEdBQVIsQ0FBWSxhQUFaLEVBQTJCLGFBQWEsSUFBYixDQUFrQixLQUE3QztBQUNBLGdCQUFRLEdBQVIsQ0FBWSxJQUFaOztBQUVBLGNBQU0sSUFBTixDQUFXLElBQVg7O0FBRUEsWUFBSSxLQUFLLEdBQUwsQ0FBUyxNQUFNLFFBQWYsSUFBMkIsQ0FBL0IsRUFBa0M7QUFDaEM7QUFDQTtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDRDtBQUNELGlCQUFXLEtBQVg7QUFDQSxpQkFBVyxZQUFXO0FBQ3BCLHNCQUFjLEdBQWQsQ0FBa0IsS0FBbEIsRUFBeUIsR0FBekIsQ0FBNkIsRUFBQyxRQUFRLElBQVQsRUFBN0I7QUFDRCxPQUZELEVBRUcsR0FGSDtBQUdEOztBQUVELFFBQU0sYUFBYTtBQUNqQixnQkFBVSxLQURPO0FBRWpCLGNBQVEsSUFGUztBQUdqQixZQUFNLElBSFc7QUFJakIsaUJBQVc7QUFKTSxLQUFuQjs7QUFPQSxhQUFTLFNBQVQsQ0FBbUIsS0FBbkIsRUFBMEI7QUFDeEIsVUFBTSxVQUFVLE1BQU0sTUFBdEI7QUFBQSxVQUNJLFFBQVEsSUFBSSxLQUFKLENBQVUsUUFBUSxDQUFsQixFQUFxQixRQUFRLENBQTdCLENBRFo7QUFBQSxVQUVJLFlBQVksTUFBTSxPQUFOLENBQWMsT0FBZCxDQUFzQixLQUF0QixFQUE2QixVQUE3QixDQUZoQjs7QUFJQSxVQUFJLFNBQUosRUFBZTtBQUNiLFlBQUksT0FBTyxVQUFVLElBQXJCO0FBQ0EsYUFBSyxRQUFMLEdBQWdCLENBQUMsS0FBSyxRQUF0QjtBQUNBLGdCQUFRLEdBQVIsQ0FBWSxJQUFaO0FBQ0Q7QUFDRjs7QUFFRCxhQUFTLFNBQVQsQ0FBbUIsS0FBbkIsRUFBMEI7QUFDeEIsVUFBTSxVQUFVLE1BQU0sTUFBdEI7QUFBQSxVQUNJLFFBQVEsSUFBSSxLQUFKLENBQVUsUUFBUSxDQUFsQixFQUFxQixRQUFRLENBQTdCLENBRFo7QUFBQSxVQUVJLFlBQVksTUFBTSxPQUFOLENBQWMsT0FBZCxDQUFzQixLQUF0QixFQUE2QixVQUE3QixDQUZoQjs7QUFJQSxVQUFJLFNBQUosRUFBZTtBQUNiLFlBQUksT0FBTyxVQUFVLElBQXJCO0FBQ0EsWUFBSSxTQUFTLEtBQUssTUFBbEI7O0FBRUEsWUFBSSxLQUFLLElBQUwsQ0FBVSxRQUFkLEVBQXdCO0FBQ3RCLGVBQUssSUFBTCxDQUFVLFdBQVYsR0FBd0IsQ0FBQyxLQUFLLElBQUwsQ0FBVSxXQUFuQzs7QUFFQSxjQUFJLEtBQUssSUFBTCxDQUFVLFdBQWQsRUFBMkI7QUFDekIsaUJBQUssU0FBTCxHQUFpQixXQUFqQjtBQUNBLGlCQUFLLFdBQUwsR0FBbUIsV0FBbkI7QUFDRCxXQUhELE1BR087QUFDTCxpQkFBSyxTQUFMLEdBQWlCLE9BQU8sSUFBUCxDQUFZLEtBQTdCO0FBQ0EsaUJBQUssV0FBTCxHQUFtQixPQUFPLElBQVAsQ0FBWSxLQUEvQjtBQUNEOztBQUVELGdCQUFNLElBQU4sQ0FBVztBQUNULGtCQUFNLFlBREc7QUFFVCxnQkFBSSxLQUFLLEVBRkE7QUFHVCxrQkFBTSxPQUFPLElBQVAsQ0FBWSxLQUhUO0FBSVQseUJBQWEsS0FBSyxJQUFMLENBQVU7QUFKZCxXQUFYO0FBTUQsU0FqQkQsTUFpQk87QUFDTCxrQkFBUSxHQUFSLENBQVksY0FBWjtBQUNEO0FBRUYsT0F6QkQsTUF5Qk87QUFDTCx1QkFBZSxJQUFmO0FBQ0EsZ0JBQVEsR0FBUixDQUFZLGFBQVo7QUFDRDtBQUNGOztBQUVELFFBQU0scUJBQXFCLEVBQTNCO0FBQ0EsYUFBUyxpQkFBVCxHQUE2QjtBQUMzQixjQUFRLEdBQVIsQ0FBWSxhQUFhLFFBQXpCO0FBQ0EsVUFBSSxhQUFhLFFBQWIsQ0FBc0IsQ0FBdEIsSUFBMkIsSUFBSSxhQUFhLE1BQWIsQ0FBb0IsS0FBbkQsSUFDQSxhQUFhLFFBQWIsQ0FBc0IsQ0FBdEIsSUFBMkIsWUFBWSxhQUFhLE1BQWIsQ0FBb0IsS0FEM0QsSUFFQSxhQUFhLFFBQWIsQ0FBc0IsQ0FBdEIsSUFBMkIsSUFBSSxhQUFhLE1BQWIsQ0FBb0IsTUFGbkQsSUFHQSxhQUFhLFFBQWIsQ0FBc0IsQ0FBdEIsSUFBMkIsYUFBYSxhQUFhLE1BQWIsQ0FBb0IsTUFIaEUsRUFHd0U7QUFDbEUscUJBQWEsSUFBYixDQUFrQixTQUFsQixHQUE4QixJQUE5QjtBQUNBLHFCQUFhLE9BQWIsR0FBdUIsS0FBdkI7QUFDSjtBQUNEO0FBQ0QsNEJBQXNCLGlCQUF0QjtBQUNBLG1CQUFhLFFBQWIsQ0FBc0IsQ0FBdEIsSUFBMkIsVUFBVSxTQUFWLEdBQXNCLGtCQUFqRDtBQUNBLG1CQUFhLFFBQWIsQ0FBc0IsQ0FBdEIsSUFBMkIsVUFBVSxTQUFWLEdBQXNCLGtCQUFqRDtBQUNEOztBQUVELFFBQUksZ0JBQWdCLElBQUksT0FBTyxPQUFYLENBQW1CLFFBQVEsQ0FBUixDQUFuQixDQUFwQjs7QUFFQSxrQkFBYyxHQUFkLENBQWtCLElBQUksT0FBTyxHQUFYLENBQWUsRUFBRSxPQUFPLFdBQVQsRUFBc0IsTUFBTSxDQUE1QixFQUFmLENBQWxCO0FBQ0Esa0JBQWMsR0FBZCxDQUFrQixJQUFJLE9BQU8sR0FBWCxDQUFlLEVBQUUsT0FBTyxXQUFULEVBQWYsQ0FBbEI7QUFDQSxrQkFBYyxHQUFkLENBQWtCLElBQUksT0FBTyxHQUFYLENBQWUsRUFBRSxXQUFXLE9BQU8sYUFBcEIsRUFBZixDQUFsQjtBQUNBLGtCQUFjLEdBQWQsQ0FBa0IsSUFBSSxPQUFPLEtBQVgsRUFBbEI7O0FBRUEsa0JBQWMsR0FBZCxDQUFrQixXQUFsQixFQUErQixhQUEvQixDQUE2QyxXQUE3QztBQUNBLGtCQUFjLEdBQWQsQ0FBa0IsV0FBbEIsRUFBK0IsY0FBL0IsQ0FBOEMsV0FBOUM7QUFDQSxrQkFBYyxHQUFkLENBQWtCLEtBQWxCLEVBQXlCLGNBQXpCLENBQXdDLE9BQXhDOztBQUVBLGtCQUFjLEVBQWQsQ0FBaUIsV0FBakIsRUFBOEIsU0FBOUI7QUFDQSxrQkFBYyxFQUFkLENBQWlCLFdBQWpCLEVBQThCLFNBQTlCOztBQUVBLGtCQUFjLEVBQWQsQ0FBaUIsVUFBakIsRUFBNkIsUUFBN0I7QUFDQSxrQkFBYyxFQUFkLENBQWlCLFNBQWpCLEVBQTRCLE9BQTVCO0FBQ0Esa0JBQWMsRUFBZCxDQUFpQixRQUFqQixFQUEyQixNQUEzQjs7QUFFQSxrQkFBYyxFQUFkLENBQWlCLFlBQWpCLEVBQStCLFVBQS9CO0FBQ0Esa0JBQWMsRUFBZCxDQUFpQixXQUFqQixFQUE4QixTQUE5QjtBQUNBLGtCQUFjLEVBQWQsQ0FBaUIsVUFBakIsRUFBNkIsUUFBN0I7QUFDQSxrQkFBYyxFQUFkLENBQWlCLGFBQWpCLEVBQWdDLFlBQVc7QUFBRSxvQkFBYyxHQUFkLENBQWtCLEtBQWxCLEVBQXlCLEdBQXpCLENBQTZCLEVBQUMsUUFBUSxJQUFULEVBQTdCO0FBQStDLEtBQTVGLEVBaGZ3QixDQWdmdUU7QUFDaEc7O0FBRUQsV0FBUyxVQUFULEdBQXNCO0FBQ3BCLFlBQVEsR0FBUixDQUFZLGFBQVo7O0FBRUEsVUFBTSxPQUFOLENBQWMsV0FBZCxDQUEwQixjQUExQjtBQUNEOztBQUVELFdBQVMsV0FBVCxHQUF1QjtBQUNyQixZQUFRLEdBQVIsQ0FBWSxjQUFaO0FBQ0EsUUFBSSxFQUFFLE1BQU0sTUFBTixHQUFlLENBQWpCLENBQUosRUFBeUI7QUFDdkIsY0FBUSxHQUFSLENBQVksY0FBWjtBQUNBO0FBQ0Q7O0FBRUQsUUFBSSxXQUFXLE1BQU0sR0FBTixFQUFmO0FBQ0EsUUFBSSxPQUFPLFFBQVEsT0FBUixDQUFnQjtBQUN6QixVQUFJLFNBQVM7QUFEWSxLQUFoQixDQUFYOztBQUlBLFFBQUksSUFBSixFQUFVO0FBQ1IsV0FBSyxPQUFMLEdBQWUsSUFBZixDQURRLENBQ2E7QUFDckIsY0FBTyxTQUFTLElBQWhCO0FBQ0UsYUFBSyxVQUFMO0FBQ0Usa0JBQVEsR0FBUixDQUFZLGdCQUFaO0FBQ0EsZUFBSyxNQUFMO0FBQ0E7QUFDRixhQUFLLFlBQUw7QUFDRSxjQUFJLFNBQVMsV0FBYixFQUEwQjtBQUN4QixpQkFBSyxTQUFMLEdBQWlCLFNBQVMsSUFBMUI7QUFDQSxpQkFBSyxXQUFMLEdBQW1CLFNBQVMsSUFBNUI7QUFDRCxXQUhELE1BR087QUFDTCxpQkFBSyxTQUFMLEdBQWlCLFdBQWpCO0FBQ0EsaUJBQUssV0FBTCxHQUFtQixXQUFuQjtBQUNEO0FBQ0gsYUFBSyxXQUFMO0FBQ0UsY0FBSSxDQUFDLENBQUMsU0FBUyxRQUFmLEVBQXlCO0FBQ3ZCLGlCQUFLLFFBQUwsR0FBZ0IsU0FBUyxRQUF6QjtBQUNEO0FBQ0QsY0FBSSxDQUFDLENBQUMsU0FBUyxRQUFmLEVBQXlCO0FBQ3ZCLGlCQUFLLFFBQUwsR0FBZ0IsU0FBUyxRQUF6QjtBQUNEO0FBQ0QsY0FBSSxDQUFDLENBQUMsU0FBUyxLQUFmLEVBQXNCO0FBQ3BCLGlCQUFLLEtBQUwsQ0FBVyxTQUFTLEtBQXBCO0FBQ0Q7QUFDRDtBQUNGO0FBQ0Usa0JBQVEsR0FBUixDQUFZLGNBQVo7QUF6Qko7QUEyQkQsS0E3QkQsTUE2Qk87QUFDTCxjQUFRLEdBQVIsQ0FBWSw4QkFBWjtBQUNEO0FBQ0Y7O0FBRUQsV0FBUyxXQUFULEdBQXVCO0FBQ3JCLFlBQVEsR0FBUixDQUFZLGNBQVo7QUFDRDs7QUFFRCxXQUFTLFdBQVQsR0FBdUI7QUFDckIsWUFBUSxHQUFSLENBQVksY0FBWjtBQUNEOztBQUVELFdBQVMsWUFBVCxHQUF3QjtBQUN0QixZQUFRLEdBQVIsQ0FBWSxlQUFaO0FBQ0Q7O0FBRUQsV0FBUyxPQUFULEdBQW1CO0FBQ2pCLE1BQUUscUJBQUYsRUFBeUIsRUFBekIsQ0FBNEIsaUJBQTVCLEVBQStDLFVBQS9DO0FBQ0Q7O0FBRUQsV0FBUyxRQUFULEdBQW9CO0FBQ2xCLE1BQUUsc0JBQUYsRUFBMEIsRUFBMUIsQ0FBNkIsT0FBN0IsRUFBc0MsV0FBdEM7QUFDRDtBQUNELFdBQVMsUUFBVCxHQUFvQjtBQUNsQixNQUFFLHNCQUFGLEVBQTBCLEVBQTFCLENBQTZCLE9BQTdCLEVBQXNDLFdBQXRDO0FBQ0Q7QUFDRCxXQUFTLFFBQVQsR0FBb0I7QUFDbEIsTUFBRSxxQkFBRixFQUF5QixFQUF6QixDQUE0QixPQUE1QixFQUFxQyxXQUFyQztBQUNEO0FBQ0QsV0FBUyxTQUFULEdBQXFCO0FBQ25CLE1BQUUsc0JBQUYsRUFBMEIsRUFBMUIsQ0FBNkIsT0FBN0IsRUFBc0MsWUFBdEM7QUFDRDs7QUFFRCxXQUFTLFVBQVQsR0FBc0I7QUFDcEIsUUFBSSxTQUFTLElBQUksS0FBSyxNQUFULENBQWdCO0FBQzNCLGNBQVEsQ0FBQyxHQUFELEVBQU0sR0FBTixDQURtQjtBQUUzQixjQUFRLEdBRm1CO0FBRzNCLG1CQUFhLE9BSGM7QUFJM0IsaUJBQVc7QUFKZ0IsS0FBaEIsQ0FBYjtBQU1BLFFBQUksUUFBUSxJQUFJLEtBQUosQ0FBVSxNQUFWLENBQVo7QUFDRDs7QUFFRCxXQUFTLElBQVQsR0FBZ0I7QUFDZDtBQUNBO0FBQ0E7QUFDRDs7QUFFRDtBQUNELENBNXFCRDs7Ozs7Ozs7Ozs7UUNUZ0IsRyxHQUFBLEc7UUFLQSxHLEdBQUEsRztRQUtBLEssR0FBQSxLO1FBS0Esa0IsR0FBQSxrQjtRQWdCQSxTLEdBQUEsUztRQTBDQSxVLEdBQUEsVTtRQW9CQSxRLEdBQUEsUTtRQXFKQSxvQixHQUFBLG9CO1FBZ0JBLFMsR0FBQSxTO1FBVUEsUSxHQUFBLFE7UUFLQSxZLEdBQUEsWTtRQWNBLFUsR0FBQSxVO1FBVUEsYSxHQUFBLGE7QUE1U2hCLElBQU0sU0FBUyxRQUFRLGdCQUFSLENBQWY7O0FBRUE7QUFDTyxTQUFTLEdBQVQsQ0FBYSxPQUFiLEVBQXNCO0FBQzNCLFNBQU8sVUFBVSxLQUFLLEVBQWYsR0FBb0IsR0FBM0I7QUFDRDs7QUFFRDtBQUNPLFNBQVMsR0FBVCxDQUFhLE9BQWIsRUFBc0I7QUFDM0IsU0FBTyxVQUFVLEdBQVYsR0FBZ0IsS0FBSyxFQUE1QjtBQUNEOztBQUVEO0FBQ08sU0FBUyxLQUFULENBQWUsRUFBZixFQUFtQixFQUFuQixFQUF1QjtBQUM1QixTQUFPLEtBQUssSUFBTCxDQUFVLEtBQUssR0FBTCxDQUFTLEdBQUcsQ0FBSCxHQUFPLEdBQUcsQ0FBbkIsRUFBc0IsQ0FBdEIsSUFBMkIsS0FBSyxHQUFMLENBQVMsR0FBRyxDQUFILEdBQU8sR0FBRyxDQUFuQixFQUFzQixDQUF0QixDQUFyQyxDQUFQLENBRDRCLENBQzJDO0FBQ3hFOztBQUVEO0FBQ08sU0FBUyxrQkFBVCxDQUE0QixJQUE1QixFQUFrQztBQUN2QyxNQUFJLGlCQUFpQixFQUFyQjtBQUNBLE1BQUksQ0FBQyxJQUFELElBQVMsQ0FBQyxLQUFLLFFBQWYsSUFBMkIsQ0FBQyxLQUFLLFFBQUwsQ0FBYyxNQUE5QyxFQUFzRDs7QUFFdEQsT0FBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLEtBQUssUUFBTCxDQUFjLE1BQWxDLEVBQTBDLEdBQTFDLEVBQStDO0FBQzdDLFFBQUksUUFBUSxLQUFLLFFBQUwsQ0FBYyxDQUFkLENBQVo7O0FBRUEsUUFBSSxNQUFNLE1BQVYsRUFBaUI7QUFDZixxQkFBZSxJQUFmLENBQW9CLElBQUksSUFBSixDQUFTLE1BQU0sUUFBZixDQUFwQjtBQUNEO0FBQ0Y7O0FBRUQsT0FBSyxNQUFMO0FBQ0EsU0FBTyxjQUFQO0FBQ0Q7O0FBRU0sU0FBUyxTQUFULENBQW1CLEtBQW5CLEVBQTBCO0FBQy9CLE1BQUksU0FBUyxNQUFNLGNBQU4sQ0FBcUIsTUFBckIsQ0FBNEIsQ0FBNUIsQ0FBYjtBQUFBLE1BQ0ksU0FBUyxNQUFNLGNBQU4sQ0FBcUIsTUFBckIsQ0FBNEIsQ0FBNUIsQ0FEYjs7QUFHQSxNQUFJLGdCQUFnQixPQUFPLGdCQUFQLEVBQXBCOztBQUVBLE1BQUksYUFBYSxJQUFJLElBQUosRUFBakI7QUFDQSxhQUFXLFdBQVgsQ0FBdUIsTUFBdkI7QUFDQTs7QUFFQSxNQUFJLGNBQWMsTUFBZCxHQUF1QixDQUEzQixFQUE4QjtBQUM1QjtBQUNBO0FBQ0E7QUFDQSxpQkFBYSxTQUFTLFVBQVQsQ0FBYjtBQUNBO0FBQ0QsR0FORCxNQU1PO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsaUJBQWEsV0FBVyxVQUFYLENBQWI7QUFDQTtBQUNBLFFBQUksaUJBQWdCLFdBQVcsZ0JBQVgsRUFBcEI7QUFDQSxRQUFJLGVBQWMsTUFBZCxHQUF1QixDQUEzQixFQUE4QjtBQUM1QjtBQUNBLG1CQUFhLFNBQVMsVUFBVCxDQUFiO0FBQ0E7QUFDRCxLQUpELE1BSU87QUFDTDtBQUNBLG1CQUFhLHFCQUFxQixVQUFyQixDQUFiO0FBQ0E7QUFDRDtBQUNGOztBQUVELGFBQVcsSUFBWCxHQUFrQixRQUFsQixDQWxDK0IsQ0FrQ0g7O0FBRTVCO0FBQ0E7QUFDQSxRQUFNLGNBQU4sQ0FBcUIsTUFBckIsQ0FBNEIsQ0FBNUIsRUFBK0IsV0FBL0IsQ0FBMkMsVUFBM0MsRUFBdUQ7QUFDdkQsU0FBTyxLQUFQO0FBQ0Q7O0FBRU0sU0FBUyxVQUFULENBQW9CLElBQXBCLEVBQTBCO0FBQy9CLE1BQUksS0FBSyxNQUFMLEdBQWMsQ0FBbEIsRUFBcUI7QUFDbkIsUUFBTSxrQkFBa0IsT0FBTyxLQUFQLENBQWEsaUJBQWIsR0FBaUMsS0FBSyxNQUE5RDs7QUFFQSxRQUFJLGVBQWUsS0FBSyxZQUF4QjtBQUNBLFFBQUksY0FBYyxhQUFhLElBQS9CO0FBQ0EsUUFBSSxhQUFhLEtBQUssS0FBTCxDQUFXLFlBQVksS0FBWixDQUFrQixDQUFsQixHQUFzQixhQUFhLEtBQWIsQ0FBbUIsQ0FBcEQsRUFBdUQsWUFBWSxLQUFaLENBQWtCLENBQWxCLEdBQXNCLGFBQWEsS0FBYixDQUFtQixDQUFoRyxDQUFqQixDQUxtQixDQUtrRztBQUNySCxRQUFJLG9CQUFvQixhQUFhLEtBQUssRUFBMUM7QUFDQSxRQUFJLHFCQUFxQixJQUFJLEtBQUosQ0FBVSxhQUFhLEtBQWIsQ0FBbUIsQ0FBbkIsR0FBd0IsS0FBSyxHQUFMLENBQVMsaUJBQVQsSUFBOEIsZUFBaEUsRUFBa0YsYUFBYSxLQUFiLENBQW1CLENBQW5CLEdBQXdCLEtBQUssR0FBTCxDQUFTLGlCQUFULElBQThCLGVBQXhJLENBQXpCO0FBQ0EsU0FBSyxNQUFMLENBQVksQ0FBWixFQUFlLGtCQUFmOztBQUVBLFFBQUksY0FBYyxLQUFLLFdBQXZCO0FBQ0EsUUFBSSxhQUFhLFlBQVksUUFBN0IsQ0FYbUIsQ0FXb0I7QUFDdkMsUUFBSSxXQUFXLEtBQUssS0FBTCxDQUFXLFlBQVksS0FBWixDQUFrQixDQUFsQixHQUFzQixXQUFXLEtBQVgsQ0FBaUIsQ0FBbEQsRUFBcUQsWUFBWSxLQUFaLENBQWtCLENBQWxCLEdBQXNCLFdBQVcsS0FBWCxDQUFpQixDQUE1RixDQUFmLENBWm1CLENBWTRGO0FBQy9HLFFBQUksbUJBQW1CLElBQUksS0FBSixDQUFVLFlBQVksS0FBWixDQUFrQixDQUFsQixHQUF1QixLQUFLLEdBQUwsQ0FBUyxRQUFULElBQXFCLGVBQXRELEVBQXdFLFlBQVksS0FBWixDQUFrQixDQUFsQixHQUF1QixLQUFLLEdBQUwsQ0FBUyxRQUFULElBQXFCLGVBQXBILENBQXZCO0FBQ0EsU0FBSyxHQUFMLENBQVMsZ0JBQVQ7QUFDRDtBQUNELFNBQU8sSUFBUDtBQUNEOztBQUVNLFNBQVMsUUFBVCxDQUFrQixJQUFsQixFQUF3QjtBQUM3QixNQUFJLGVBQWUsS0FBSyxLQUFMLEVBQW5CO0FBQ0E7QUFDQSxNQUFJO0FBQUE7QUFDRixVQUFJLGdCQUFnQixLQUFLLGdCQUFMLEVBQXBCO0FBQ0EsVUFBSSxjQUFjLEtBQUssZ0JBQUwsRUFBbEI7O0FBRUEsVUFBTSxxQkFBcUIsT0FBTyxLQUFQLENBQWEsa0JBQXhDO0FBQ0EsVUFBTSxjQUFjLEtBQUssTUFBekI7O0FBRUE7QUFDQSxXQUFLLElBQUwsQ0FBVSxZQUFZLFFBQXRCLEVBQWdDLFVBQUMsS0FBRCxFQUFRLENBQVIsRUFBYztBQUM1QyxZQUFJLE1BQU0sTUFBVixFQUFrQjtBQUNoQjtBQUNBLHdCQUFjLFlBQVksUUFBWixDQUFxQixLQUFyQixDQUFkO0FBQ0QsU0FIRCxNQUdPO0FBQ0w7QUFDRDtBQUNGLE9BUEQ7O0FBU0E7O0FBRUEsVUFBSSxDQUFDLENBQUMsWUFBWSxRQUFkLElBQTBCLFlBQVksUUFBWixDQUFxQixNQUFyQixHQUE4QixDQUE1RCxFQUErRDtBQUFBO0FBQzdEO0FBQ0EsY0FBSSxvQkFBb0IsSUFBSSxJQUFKLEVBQXhCO0FBQ0E7QUFDQTtBQUNBLGVBQUssSUFBTCxDQUFVLFlBQVksUUFBdEIsRUFBZ0MsVUFBQyxLQUFELEVBQVEsQ0FBUixFQUFjO0FBQzVDLGdCQUFJLENBQUMsTUFBTSxNQUFYLEVBQW1CO0FBQ2pCLGtDQUFvQixrQkFBa0IsS0FBbEIsQ0FBd0IsS0FBeEIsQ0FBcEI7QUFDRDtBQUNGLFdBSkQ7QUFLQSx3QkFBYyxpQkFBZDtBQUNBO0FBQ0E7QUFaNkQ7QUFhOUQsT0FiRCxNQWFPO0FBQ0w7QUFDRDs7QUFFRCxVQUFJLGNBQWMsTUFBZCxHQUF1QixDQUEzQixFQUE4QjtBQUM1QjtBQUNBLFlBQUksb0JBQW9CLFlBQVksa0JBQVosQ0FBK0IsY0FBYyxDQUFkLEVBQWlCLEtBQWhELENBQXhCO0FBQ0E7QUFDQSxZQUFJLE9BQU8sWUFBWSxPQUFaLENBQW9CLGlCQUFwQixDQUFYLENBSjRCLENBSXVCO0FBQ25ELFlBQUksZUFBZSxXQUFuQjtBQUNBLFlBQUksb0JBQUo7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLFlBQUksY0FBYyxNQUFkLEdBQXVCLENBQTNCLEVBQThCO0FBQzVCO0FBQ0E7QUFDQSxjQUFJLG1CQUFtQixLQUFLLGtCQUFMLENBQXdCLGNBQWMsY0FBYyxNQUFkLEdBQXVCLENBQXJDLEVBQXdDLEtBQWhFLENBQXZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUFjLEtBQUssT0FBTCxDQUFhLGdCQUFiLENBQWQsQ0FUNEIsQ0FTa0I7QUFDOUMsY0FBSSxDQUFDLFdBQUQsSUFBZ0IsQ0FBQyxZQUFZLE1BQWpDLEVBQXlDLGNBQWMsSUFBZDtBQUN6QyxlQUFLLE9BQUw7QUFDRCxTQVpELE1BWU87QUFDTCx3QkFBYyxJQUFkO0FBQ0Q7O0FBRUQsWUFBSSxDQUFDLENBQUMsWUFBRixJQUFrQixhQUFhLE1BQWIsSUFBdUIscUJBQXFCLFdBQWxFLEVBQStFO0FBQzdFLGlCQUFPLEtBQUssUUFBTCxDQUFjLFlBQWQsQ0FBUDtBQUNBLGNBQUksS0FBSyxTQUFMLEtBQW1CLGNBQXZCLEVBQXVDO0FBQ3JDLGlCQUFLLElBQUwsQ0FBVSxLQUFLLFFBQWYsRUFBeUIsVUFBQyxLQUFELEVBQVEsQ0FBUixFQUFjO0FBQ3JDLGtCQUFJLENBQUMsTUFBTSxNQUFYLEVBQW1CO0FBQ2pCLHNCQUFNLE1BQU47QUFDRDtBQUNGLGFBSkQ7QUFLRDtBQUNGOztBQUVELFlBQUksQ0FBQyxDQUFDLFdBQUYsSUFBaUIsWUFBWSxNQUFaLElBQXNCLHFCQUFxQixXQUFoRSxFQUE2RTtBQUMzRSxpQkFBTyxLQUFLLFFBQUwsQ0FBYyxXQUFkLENBQVA7QUFDQSxjQUFJLEtBQUssU0FBTCxLQUFtQixjQUF2QixFQUF1QztBQUNyQyxpQkFBSyxJQUFMLENBQVUsS0FBSyxRQUFmLEVBQXlCLFVBQUMsS0FBRCxFQUFRLENBQVIsRUFBYztBQUNyQyxrQkFBSSxDQUFDLE1BQU0sTUFBWCxFQUFtQjtBQUNqQixzQkFBTSxNQUFOO0FBQ0Q7QUFDRixhQUpEO0FBS0Q7QUFDRjtBQUNGOztBQUVEO0FBQ0E7QUFDQTs7QUFFQSxVQUFJLEtBQUssU0FBTCxLQUFtQixjQUFuQixJQUFxQyxLQUFLLFFBQUwsQ0FBYyxNQUFkLEdBQXVCLENBQWhFLEVBQW1FO0FBQ2pFLFlBQUksS0FBSyxRQUFMLENBQWMsTUFBZCxHQUF1QixDQUEzQixFQUE4QjtBQUFBO0FBQzVCLGdCQUFJLHFCQUFKO0FBQ0EsZ0JBQUksbUJBQW1CLENBQXZCOztBQUVBLGlCQUFLLElBQUwsQ0FBVSxLQUFLLFFBQWYsRUFBeUIsVUFBQyxLQUFELEVBQVEsQ0FBUixFQUFjO0FBQ3JDLGtCQUFJLE1BQU0sSUFBTixHQUFhLGdCQUFqQixFQUFtQztBQUNqQyxtQ0FBbUIsTUFBTSxJQUF6QjtBQUNBLCtCQUFlLEtBQWY7QUFDRDtBQUNGLGFBTEQ7O0FBT0EsZ0JBQUksWUFBSixFQUFrQjtBQUNoQixxQkFBTyxZQUFQO0FBQ0QsYUFGRCxNQUVPO0FBQ0wscUJBQU8sS0FBSyxRQUFMLENBQWMsQ0FBZCxDQUFQO0FBQ0Q7QUFmMkI7QUFnQjdCLFNBaEJELE1BZ0JPO0FBQ0wsaUJBQU8sS0FBSyxRQUFMLENBQWMsQ0FBZCxDQUFQO0FBQ0Q7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDRDtBQUNEO0FBQ0E7QUFDQSxVQUFJLEtBQUssTUFBTCxHQUFjLFdBQWQsSUFBNkIsSUFBakMsRUFBdUM7QUFDckMsZ0JBQVEsR0FBUixDQUFZLG9CQUFaO0FBQ0E7QUFBQSxhQUFPO0FBQVA7QUFDRCxPQUhELE1BR087QUFDTDtBQUFBLGFBQU87QUFBUDtBQUNEO0FBM0lDOztBQUFBO0FBNElILEdBNUlELENBNElFLE9BQU0sQ0FBTixFQUFTO0FBQ1QsWUFBUSxLQUFSLENBQWMsQ0FBZDtBQUNBLFdBQU8sWUFBUDtBQUNEO0FBQ0Y7O0FBRU0sU0FBUyxvQkFBVCxDQUE4QixJQUE5QixFQUFvQztBQUN6QyxPQUFLLGFBQUwsQ0FBbUIsQ0FBbkI7QUFDQSxPQUFLLGFBQUwsQ0FBbUIsS0FBSyxRQUFMLENBQWMsTUFBZCxHQUF1QixDQUExQztBQUNBLFNBQU8sSUFBUDtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFTyxTQUFTLFNBQVQsR0FBcUI7QUFDMUIsTUFBSSxTQUFTLE1BQU0sT0FBTixDQUFjLFFBQWQsQ0FBdUI7QUFDbEMsZUFBVyxPQUR1QjtBQUVsQyxXQUFPLGVBQVMsRUFBVCxFQUFhO0FBQ2xCLGFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBTCxJQUFhLEdBQUcsSUFBSCxDQUFRLE1BQTdCO0FBQ0Q7QUFKaUMsR0FBdkIsQ0FBYjtBQU1EOztBQUVEO0FBQ08sU0FBUyxRQUFULENBQWtCLElBQWxCLEVBQXdCLEtBQXhCLEVBQStCO0FBQ3BDLFNBQU8sRUFBRSxLQUFLLGdCQUFMLENBQXNCLEtBQXRCLEVBQTZCLE1BQTdCLEtBQXdDLENBQTFDLENBQVA7QUFDRDs7QUFFRDtBQUNPLFNBQVMsWUFBVCxDQUFzQixJQUF0QixFQUE0QixNQUE1QixFQUFvQztBQUN6QyxNQUFJLFVBQUo7QUFBQSxNQUFPLGVBQVA7QUFBQSxNQUFlLGNBQWY7QUFBQSxNQUFzQixjQUF0QjtBQUFBLE1BQTZCLFdBQTdCO0FBQUEsTUFBaUMsYUFBakM7QUFBQSxNQUF1QyxhQUF2QztBQUNBLE9BQUssSUFBSSxLQUFLLENBQVQsRUFBWSxPQUFPLE9BQU8sTUFBL0IsRUFBdUMsS0FBSyxJQUE1QyxFQUFrRCxJQUFJLEVBQUUsRUFBeEQsRUFBNEQ7QUFDMUQsWUFBUSxPQUFPLENBQVAsQ0FBUjtBQUNBLFFBQUksU0FBUyxJQUFULEVBQWUsS0FBZixDQUFKLEVBQTJCO0FBQ3pCLGNBQVEsS0FBSyxLQUFMLENBQVcsS0FBWCxDQUFSO0FBQ0EsZUFBUyxhQUFhLEtBQWIsRUFBb0IsT0FBTyxLQUFQLENBQWEsSUFBSSxDQUFqQixDQUFwQixDQUFUO0FBQ0EsYUFBTyxDQUFDLE9BQU8sT0FBTyxLQUFQLENBQWEsQ0FBYixFQUFnQixDQUFoQixDQUFSLEVBQTRCLE1BQTVCLENBQW1DLEtBQW5DLENBQXlDLElBQXpDLEVBQStDLE1BQS9DLENBQVA7QUFDRDtBQUNGO0FBQ0QsU0FBTyxPQUFPLE1BQVAsQ0FBYyxJQUFkLENBQVA7QUFDRDs7QUFFRDtBQUNPLFNBQVMsVUFBVCxDQUFvQixLQUFwQixFQUEyQjtBQUNoQyxNQUFJLElBQUosRUFBVSxNQUFWLEVBQWtCLEVBQWxCLEVBQXNCLElBQXRCO0FBQ0EsV0FBUyxFQUFUO0FBQ0EsT0FBSyxLQUFLLENBQUwsRUFBUSxPQUFPLE1BQU0sTUFBMUIsRUFBa0MsS0FBSyxJQUF2QyxFQUE2QyxJQUE3QyxFQUFtRDtBQUNqRCxXQUFPLE1BQU0sRUFBTixDQUFQO0FBQ0EsYUFBUyxhQUFhLElBQWIsRUFBbUIsTUFBbkIsQ0FBVDtBQUNEO0FBQ0QsU0FBTyxNQUFQO0FBQ0Q7O0FBRU0sU0FBUyxhQUFULENBQXVCLEtBQXZCLEVBQThCLFFBQTlCLEVBQXdDO0FBQzdDLE1BQUksQ0FBQyxLQUFMLEVBQVksT0FBTyxJQUFQOztBQUVaLE9BQUssSUFBSSxJQUFJLFNBQVMsTUFBVCxHQUFrQixDQUEvQixFQUFrQyxLQUFLLENBQXZDLEVBQTBDLEdBQTFDLEVBQStDO0FBQzdDLFFBQUksUUFBUSxTQUFTLENBQVQsQ0FBWjtBQUNBLFFBQUksU0FBUyxNQUFNLFlBQW5CO0FBQ0EsUUFBSSxNQUFNLFFBQU4sQ0FBZSxNQUFNLFlBQXJCLENBQUosRUFBd0M7QUFDdEMsYUFBTyxLQUFQO0FBQ0Q7QUFDRjs7QUFFRCxTQUFPLElBQVA7QUFDRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJleHBvcnRzLnBhbGV0dGUgPSB7XG4gIGNvbG9yczogW1wiIzIwMTcxQ1wiLCBcIiMxRTJBNDNcIiwgXCIjMjgzNzdEXCIsIFwiIzM1Mjc0N1wiLCBcIiNDQTJFMjZcIiwgXCIjOUEyQTFGXCIsIFwiI0RBNkMyNlwiLCBcIiM0NTMxMjFcIiwgXCIjOTE2QTQ3XCIsIFwiI0RBQUQyN1wiLCBcIiM3RjdEMzFcIixcIiMyQjVFMkVcIl0sXG4gIHBvcHM6IFtcIiMwMEFERUZcIiwgXCIjRjI4NUE1XCIsIFwiIzdEQzU3RlwiLCBcIiNGNkVCMTZcIiwgXCIjRjRFQUUwXCJdLFxuICBjb2xvclNpemU6IDIwLFxuICBzZWxlY3RlZENvbG9yU2l6ZTogMzBcbn1cblxuZXhwb3J0cy5zaGFwZSA9IHtcbiAgZXh0ZW5kaW5nVGhyZXNob2xkOiAwLjEsXG4gIHRyaW1taW5nVGhyZXNob2xkOiAwLjA3NSxcbn1cbiIsIndpbmRvdy5rYW4gPSB3aW5kb3cua2FuIHx8IHtcbiAgcGFsZXR0ZTogW1wiIzIwMTcxQ1wiLCBcIiMxRTJBNDNcIiwgXCIjMjgzNzdEXCIsIFwiIzM1Mjc0N1wiLCBcIiNGMjg1QTVcIiwgXCIjQ0EyRTI2XCIsIFwiI0I4NDUyNlwiLCBcIiNEQTZDMjZcIiwgXCIjNDUzMTIxXCIsIFwiIzkxNkE0N1wiLCBcIiNFRUI2NDFcIiwgXCIjRjZFQjE2XCIsIFwiIzdGN0QzMVwiLCBcIiM2RUFENzlcIiwgXCIjMkE0NjIxXCIsIFwiI0Y0RUFFMFwiXSxcbiAgY3VycmVudENvbG9yOiAnIzIwMTcxQycsXG4gIG51bVBhdGhzOiAxMCxcbiAgcGF0aHM6IFtdLFxufTtcblxucGFwZXIuaW5zdGFsbCh3aW5kb3cpO1xuXG5jb25zdCB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG4vLyByZXF1aXJlKCdwYXBlci1hbmltYXRlJyk7XG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICBsZXQgTU9WRVMgPSBbXTsgLy8gc3RvcmUgZ2xvYmFsIG1vdmVzIGxpc3RcbiAgLy8gbW92ZXMgPSBbXG4gIC8vICAge1xuICAvLyAgICAgJ3R5cGUnOiAnY29sb3JDaGFuZ2UnLFxuICAvLyAgICAgJ29sZCc6ICcjMjAxNzFDJyxcbiAgLy8gICAgICduZXcnOiAnI0YyODVBNSdcbiAgLy8gICB9LFxuICAvLyAgIHtcbiAgLy8gICAgICd0eXBlJzogJ25ld1BhdGgnLFxuICAvLyAgICAgJ3JlZic6ICc/Pz8nIC8vIHV1aWQ/IGRvbSByZWZlcmVuY2U/XG4gIC8vICAgfSxcbiAgLy8gICB7XG4gIC8vICAgICAndHlwZSc6ICdwYXRoVHJhbnNmb3JtJyxcbiAgLy8gICAgICdyZWYnOiAnPz8/JywgLy8gdXVpZD8gZG9tIHJlZmVyZW5jZT9cbiAgLy8gICAgICdvbGQnOiAncm90YXRlKDkwZGVnKXNjYWxlKDEuNSknLCAvLyA/Pz9cbiAgLy8gICAgICduZXcnOiAncm90YXRlKDEyMGRlZylzY2FsZSgtMC41KScgLy8gPz8/XG4gIC8vICAgfSxcbiAgLy8gICAvLyBvdGhlcnM/XG4gIC8vIF1cblxuICBjb25zdCAkd2luZG93ID0gJCh3aW5kb3cpO1xuICBjb25zdCAkYm9keSA9ICQoJ2JvZHknKTtcbiAgY29uc3QgJGNhbnZhcyA9ICQoJ2NhbnZhcyNtYWluQ2FudmFzJyk7XG4gIGNvbnN0IHJ1bkFuaW1hdGlvbnMgPSBmYWxzZTtcbiAgY29uc3QgdHJhbnNwYXJlbnQgPSBuZXcgQ29sb3IoMCwgMCk7XG5cbiAgbGV0IHZpZXdXaWR0aCwgdmlld0hlaWdodDtcblxuICBmdW5jdGlvbiBoaXRUZXN0Qm91bmRzKHBvaW50KSB7XG4gICAgcmV0dXJuIHV0aWwuaGl0VGVzdEJvdW5kcyhwb2ludCwgcGFwZXIucHJvamVjdC5hY3RpdmVMYXllci5jaGlsZHJlbik7XG4gIH1cblxuICBmdW5jdGlvbiBoaXRUZXN0R3JvdXBCb3VuZHMocG9pbnQpIHtcbiAgICBsZXQgZ3JvdXBzID0gcGFwZXIucHJvamVjdC5nZXRJdGVtcyh7XG4gICAgICBjbGFzc05hbWU6ICdHcm91cCdcbiAgICB9KTtcbiAgICByZXR1cm4gdXRpbC5oaXRUZXN0Qm91bmRzKHBvaW50LCBncm91cHMpO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdFZpZXdWYXJzKCkge1xuICAgIHZpZXdXaWR0aCA9IHBhcGVyLnZpZXcudmlld1NpemUud2lkdGg7XG4gICAgdmlld0hlaWdodCA9IHBhcGVyLnZpZXcudmlld1NpemUuaGVpZ2h0O1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdENvbnRyb2xQYW5lbCgpIHtcbiAgICBpbml0Q29sb3JQYWxldHRlKCk7XG4gICAgaW5pdENhbnZhc0RyYXcoKTtcbiAgICBpbml0TmV3KCk7XG4gICAgaW5pdFVuZG8oKTtcbiAgICBpbml0UGxheSgpO1xuICAgIGluaXRUaXBzKCk7XG4gICAgaW5pdFNoYXJlKCk7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0Q29sb3JQYWxldHRlKCkge1xuICAgIGNvbnN0ICRwYWxldHRlV3JhcCA9ICQoJ3VsLnBhbGV0dGUtY29sb3JzJyk7XG4gICAgY29uc3QgJHBhbGV0dGVDb2xvcnMgPSAkcGFsZXR0ZVdyYXAuZmluZCgnbGknKTtcbiAgICBjb25zdCBwYWxldHRlQ29sb3JTaXplID0gMjA7XG4gICAgY29uc3QgcGFsZXR0ZVNlbGVjdGVkQ29sb3JTaXplID0gMzA7XG4gICAgY29uc3QgcGFsZXR0ZVNlbGVjdGVkQ2xhc3MgPSAncGFsZXR0ZS1zZWxlY3RlZCc7XG5cbiAgICAvLyBob29rIHVwIGNsaWNrXG4gICAgICAkcGFsZXR0ZUNvbG9ycy5vbignY2xpY2sgdGFwIHRvdWNoJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgbGV0ICRzdmcgPSAkKHRoaXMpLmZpbmQoJ3N2Zy5wYWxldHRlLWNvbG9yJyk7XG5cbiAgICAgICAgICBpZiAoISRzdmcuaGFzQ2xhc3MocGFsZXR0ZVNlbGVjdGVkQ2xhc3MpKSB7XG4gICAgICAgICAgICAkKCcuJyArIHBhbGV0dGVTZWxlY3RlZENsYXNzKVxuICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MocGFsZXR0ZVNlbGVjdGVkQ2xhc3MpXG4gICAgICAgICAgICAgIC5hdHRyKCd3aWR0aCcsIHBhbGV0dGVDb2xvclNpemUpXG4gICAgICAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCBwYWxldHRlQ29sb3JTaXplKVxuICAgICAgICAgICAgICAuZmluZCgncmVjdCcpXG4gICAgICAgICAgICAgIC5hdHRyKCdyeCcsIDApXG4gICAgICAgICAgICAgIC5hdHRyKCdyeScsIDApO1xuXG4gICAgICAgICAgICAkc3ZnLmFkZENsYXNzKHBhbGV0dGVTZWxlY3RlZENsYXNzKVxuICAgICAgICAgICAgICAuYXR0cignd2lkdGgnLCBwYWxldHRlU2VsZWN0ZWRDb2xvclNpemUpXG4gICAgICAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCBwYWxldHRlU2VsZWN0ZWRDb2xvclNpemUpXG4gICAgICAgICAgICAgIC5maW5kKCdyZWN0JylcbiAgICAgICAgICAgICAgLmF0dHIoJ3J4JywgcGFsZXR0ZVNlbGVjdGVkQ29sb3JTaXplIC8gMilcbiAgICAgICAgICAgICAgLmF0dHIoJ3J5JywgcGFsZXR0ZVNlbGVjdGVkQ29sb3JTaXplIC8gMilcblxuICAgICAgICAgICAgd2luZG93Lmthbi5jdXJyZW50Q29sb3IgPSAkc3ZnLmZpbmQoJ3JlY3QnKS5hdHRyKCdmaWxsJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRDYW52YXNEcmF3KCkge1xuXG4gICAgcGFwZXIuc2V0dXAoJGNhbnZhc1swXSk7XG5cbiAgICBsZXQgbWlkZGxlLCBib3VuZHM7XG4gICAgbGV0IHBhc3Q7XG4gICAgbGV0IHNpemVzO1xuICAgIC8vIGxldCBwYXRocyA9IGdldEZyZXNoUGF0aHMod2luZG93Lmthbi5udW1QYXRocyk7XG4gICAgbGV0IHRvdWNoID0gZmFsc2U7XG4gICAgbGV0IGxhc3RDaGlsZDtcbiAgICBsZXQgcGF0aERhdGEgPSBbXTtcblxuICAgIGZ1bmN0aW9uIHBhblN0YXJ0KGV2ZW50KSB7XG4gICAgICBwYXBlci5wcm9qZWN0LmFjdGl2ZUxheWVyLnJlbW92ZUNoaWxkcmVuKCk7IC8vIFJFTU9WRVxuICAgICAgLy8gZHJhd0NpcmNsZSgpO1xuXG4gICAgICBzaXplcyA9IFtdO1xuXG4gICAgICBpZiAocGluY2hpbmcpIHJldHVybjtcbiAgICAgIGlmICghKGV2ZW50LmNoYW5nZWRQb2ludGVycyAmJiBldmVudC5jaGFuZ2VkUG9pbnRlcnMubGVuZ3RoID4gMCkpIHJldHVybjtcbiAgICAgIGlmIChldmVudC5jaGFuZ2VkUG9pbnRlcnMubGVuZ3RoID4gMSkge1xuICAgICAgICBjb25zb2xlLmxvZygnZXZlbnQuY2hhbmdlZFBvaW50ZXJzID4gMScpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBwb2ludGVyID0gZXZlbnQuY2VudGVyO1xuICAgICAgY29uc3QgcG9pbnQgPSBuZXcgUG9pbnQocG9pbnRlci54LCBwb2ludGVyLnkpO1xuXG4gICAgICBib3VuZHMgPSBuZXcgUGF0aCh7XG4gICAgICAgIHN0cm9rZUNvbG9yOiB3aW5kb3cua2FuLmN1cnJlbnRDb2xvcixcbiAgICAgICAgZmlsbENvbG9yOiB3aW5kb3cua2FuLmN1cnJlbnRDb2xvcixcbiAgICAgICAgbmFtZTogJ2JvdW5kcycsXG4gICAgICAgIHZpc2libGU6IGZhbHNlXG4gICAgICB9KTtcblxuICAgICAgbWlkZGxlID0gbmV3IFBhdGgoe1xuICAgICAgICBzdHJva2VDb2xvcjogd2luZG93Lmthbi5jdXJyZW50Q29sb3IsXG4gICAgICAgIG5hbWU6ICdtaWRkbGUnLFxuICAgICAgICBzdHJva2VXaWR0aDogNSxcbiAgICAgICAgdmlzaWJsZTogdHJ1ZSxcbiAgICAgICAgc3Ryb2tlQ2FwOiAncm91bmQnXG4gICAgICB9KTtcblxuICAgICAgYm91bmRzLmFkZChwb2ludCk7XG4gICAgICBtaWRkbGUuYWRkKHBvaW50KTtcbiAgICB9XG5cbiAgICBjb25zdCBtaW4gPSAxO1xuICAgIGNvbnN0IG1heCA9IDE1O1xuICAgIGNvbnN0IGFscGhhID0gMC4zO1xuICAgIGNvbnN0IG1lbW9yeSA9IDEwO1xuICAgIHZhciBjdW1EaXN0YW5jZSA9IDA7XG4gICAgbGV0IGN1bVNpemUsIGF2Z1NpemU7XG4gICAgZnVuY3Rpb24gcGFuTW92ZShldmVudCkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGlmIChwaW5jaGluZykgcmV0dXJuO1xuICAgICAgLy8gY29uc29sZS5sb2coZXZlbnQub3ZlcmFsbFZlbG9jaXR5KTtcbiAgICAgIC8vIGxldCB0aGlzRGlzdCA9IHBhcnNlSW50KGV2ZW50LmRpc3RhbmNlKTtcbiAgICAgIC8vIGN1bURpc3RhbmNlICs9IHRoaXNEaXN0O1xuICAgICAgLy9cbiAgICAgIC8vIGlmIChjdW1EaXN0YW5jZSA8IDEwMCkge1xuICAgICAgLy8gICBjb25zb2xlLmxvZygnaWdub3JpbmcnKTtcbiAgICAgIC8vICAgcmV0dXJuO1xuICAgICAgLy8gfSBlbHNlIHtcbiAgICAgIC8vICAgY3VtRGlzdGFuY2UgPSAwO1xuICAgICAgLy8gICBjb25zb2xlLmxvZygnbm90IGlnbm9yaW5nJyk7XG4gICAgICAvLyB9XG5cbiAgICAgIGNvbnN0IHBvaW50ZXIgPSBldmVudC5jZW50ZXI7XG4gICAgICBsZXQgcG9pbnQgPSBuZXcgUG9pbnQocG9pbnRlci54LCBwb2ludGVyLnkpO1xuXG4gICAgICB3aGlsZSAoc2l6ZXMubGVuZ3RoID4gbWVtb3J5KSB7XG4gICAgICAgIHNpemVzLnNoaWZ0KCk7XG4gICAgICB9XG5cbiAgICAgIGxldCBib3R0b21YLCBib3R0b21ZLCBib3R0b20sXG4gICAgICAgIHRvcFgsIHRvcFksIHRvcCxcbiAgICAgICAgcDAsIHAxLFxuICAgICAgICBzdGVwLCBhbmdsZSwgZGlzdCwgc2l6ZTtcblxuICAgICAgaWYgKHNpemVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLy8gbm90IHRoZSBmaXJzdCBwb2ludCwgc28gd2UgaGF2ZSBvdGhlcnMgdG8gY29tcGFyZSB0b1xuICAgICAgICBwMCA9IHBhc3Q7XG4gICAgICAgIGRpc3QgPSB1dGlsLmRlbHRhKHBvaW50LCBwMCk7XG4gICAgICAgIHNpemUgPSBkaXN0ICogYWxwaGE7XG4gICAgICAgIC8vIGlmIChzaXplID49IG1heCkgc2l6ZSA9IG1heDtcbiAgICAgICAgc2l6ZSA9IE1hdGgubWF4KE1hdGgubWluKHNpemUsIG1heCksIG1pbik7IC8vIGNsYW1wIHNpemUgdG8gW21pbiwgbWF4XVxuICAgICAgICAvLyBzaXplID0gbWF4IC0gc2l6ZTtcblxuICAgICAgICBjdW1TaXplID0gMDtcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBzaXplcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgIGN1bVNpemUgKz0gc2l6ZXNbal07XG4gICAgICAgIH1cbiAgICAgICAgYXZnU2l6ZSA9IE1hdGgucm91bmQoKChjdW1TaXplIC8gc2l6ZXMubGVuZ3RoKSArIHNpemUpIC8gMik7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGF2Z1NpemUpO1xuXG4gICAgICAgIGFuZ2xlID0gTWF0aC5hdGFuMihwb2ludC55IC0gcDAueSwgcG9pbnQueCAtIHAwLngpOyAvLyByYWRcblxuICAgICAgICAvLyBQb2ludChib3R0b21YLCBib3R0b21ZKSBpcyBib3R0b20sIFBvaW50KHRvcFgsIHRvcFkpIGlzIHRvcFxuICAgICAgICBib3R0b21YID0gcG9pbnQueCArIE1hdGguY29zKGFuZ2xlICsgTWF0aC5QSS8yKSAqIGF2Z1NpemU7XG4gICAgICAgIGJvdHRvbVkgPSBwb2ludC55ICsgTWF0aC5zaW4oYW5nbGUgKyBNYXRoLlBJLzIpICogYXZnU2l6ZTtcbiAgICAgICAgYm90dG9tID0gbmV3IFBvaW50KGJvdHRvbVgsIGJvdHRvbVkpO1xuXG4gICAgICAgIHRvcFggPSBwb2ludC54ICsgTWF0aC5jb3MoYW5nbGUgLSBNYXRoLlBJLzIpICogYXZnU2l6ZTtcbiAgICAgICAgdG9wWSA9IHBvaW50LnkgKyBNYXRoLnNpbihhbmdsZSAtIE1hdGguUEkvMikgKiBhdmdTaXplO1xuICAgICAgICB0b3AgPSBuZXcgUG9pbnQodG9wWCwgdG9wWSk7XG5cbiAgICAgICAgYm91bmRzLmFkZCh0b3ApO1xuICAgICAgICBib3VuZHMuaW5zZXJ0KDAsIGJvdHRvbSk7XG4gICAgICAgIC8vIGJvdW5kcy5zbW9vdGgoKTtcblxuICAgICAgICBtaWRkbGUuYWRkKHBvaW50KTtcbiAgICAgICAgLy8gbWlkZGxlLnNtb290aCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZG9uJ3QgaGF2ZSBhbnl0aGluZyB0byBjb21wYXJlIHRvXG4gICAgICAgIGRpc3QgPSAxO1xuICAgICAgICBhbmdsZSA9IDA7XG5cbiAgICAgICAgc2l6ZSA9IGRpc3QgKiBhbHBoYTtcbiAgICAgICAgc2l6ZSA9IE1hdGgubWF4KE1hdGgubWluKHNpemUsIG1heCksIG1pbik7IC8vIGNsYW1wIHNpemUgdG8gW21pbiwgbWF4XVxuICAgICAgfVxuXG4gICAgICBwYXBlci52aWV3LmRyYXcoKTtcblxuICAgICAgcGFzdCA9IHBvaW50O1xuICAgICAgc2l6ZXMucHVzaChzaXplKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYW5FbmQoZXZlbnQpIHtcbiAgICAgIGlmIChwaW5jaGluZykgcmV0dXJuO1xuXG4gICAgICBjb25zdCBwb2ludGVyID0gZXZlbnQuY2VudGVyO1xuICAgICAgY29uc3QgcG9pbnQgPSBuZXcgUG9pbnQocG9pbnRlci54LCBwb2ludGVyLnkpO1xuXG4gICAgICBsZXQgZ3JvdXAgPSBuZXcgR3JvdXAoW2JvdW5kcywgbWlkZGxlXSk7XG4gICAgICBncm91cC5kYXRhLmNvbG9yID0gYm91bmRzLmZpbGxDb2xvcjtcbiAgICAgIGdyb3VwLmRhdGEudXBkYXRlID0gdHJ1ZTtcblxuICAgICAgYm91bmRzLmFkZChwb2ludCk7XG4gICAgICBib3VuZHMuY2xvc2VkID0gdHJ1ZTtcbiAgICAgIGJvdW5kcy5zaW1wbGlmeSgpO1xuXG4gICAgICBtaWRkbGUuYWRkKHBvaW50KTtcbiAgICAgIG1pZGRsZS5zaW1wbGlmeSgpO1xuXG4gICAgICBncm91cC5yZXBsYWNlV2l0aCh1dGlsLnRydWVHcm91cChncm91cCkpO1xuICAgICAgbWlkZGxlID0gZ3JvdXAuX25hbWVkQ2hpbGRyZW4ubWlkZGxlWzBdO1xuICAgICAgbWlkZGxlLnN0cm9rZUNvbG9yID0gZ3JvdXAuc3Ryb2tlQ29sb3I7XG5cbiAgICAgIGJvdW5kcy5mbGF0dGVuKDQpO1xuICAgICAgYm91bmRzLnNtb290aCgpO1xuXG4gICAgICAvLyBCYXNlLmVhY2gobWlkZGxlLCAobWlkZGxlUG9pbnQpID0+IHtcbiAgICAgIC8vICAgY29uc29sZS5sb2cobWlkZGxlUG9pbnQpO1xuICAgICAgLy8gfSk7XG5cbiAgICAgIC8vIGJvdW5kcy5pbnRlcnBvbGF0ZShib3VuZHMuY2xvbmUoKSwgbWlkZGxlLCAwLjUpO1xuXG4gICAgICBtaWRkbGUuZmxhdHRlbig0KTtcbiAgICAgIG1pZGRsZS5yZWR1Y2UoKTtcblxuICAgICAgbGV0IGlkZWFsID0gbWlkZGxlLmNsb25lKCk7XG4gICAgICBpZGVhbC5zdHJva2VDb2xvciA9ICdwaW5rJztcbiAgICAgIGlkZWFsLnN0cm9rZVdpZHRoID0gNTtcbiAgICAgIGlkZWFsLnN0cm9rZUNhcCA9ICdyb3VuZCc7XG5cblxuICAgICAgLy8gbWlkZGxlLnNtb290aCh7XG4gICAgICAvLyAgIHR5cGU6ICdnZW9tZXRyaWMnXG4gICAgICAvLyB9KTtcbiAgICAgIC8vIG1pZGRsZS5mbGF0dGVuKDEwKTtcbiAgICAgIC8vIG1pZGRsZS5zaW1wbGlmeSgpO1xuICAgICAgLy8gbWlkZGxlLmZsYXR0ZW4oMjApO1xuICAgICAgLy8gbWlkZGxlLnNpbXBsaWZ5KCk7XG4gICAgICAvLyBtaWRkbGUuZmxhdHRlbigpO1xuICAgICAgLy8gbWlkZGxlLnNpbXBsaWZ5KCk7XG5cbiAgICAgIC8vIG1pZGRsZS5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAvLyBtaWRkbGUudmlzaWJsZSA9IHRydWU7XG4gICAgICAvLyBtaWRkbGUuc3Ryb2tlQ29sb3IgPSAncGluayc7XG5cblxuICAgICAgbGV0IGludGVyc2VjdGlvbnMgPSBtaWRkbGUuZ2V0Q3Jvc3NpbmdzKCk7XG4gICAgICBpZiAoaW50ZXJzZWN0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgIC8vIHdlIGNyZWF0ZSBhIGNvcHkgb2YgdGhlIHBhdGggYmVjYXVzZSByZXNvbHZlQ3Jvc3NpbmdzKCkgc3BsaXRzIHNvdXJjZSBwYXRoXG4gICAgICAgIGxldCBwYXRoQ29weSA9IG5ldyBQYXRoKCk7XG4gICAgICAgIHBhdGhDb3B5LmNvcHlDb250ZW50KG1pZGRsZSk7XG4gICAgICAgIHBhdGhDb3B5LnZpc2libGUgPSBmYWxzZTtcblxuICAgICAgICBsZXQgZGl2aWRlZFBhdGggPSBwYXRoQ29weS5yZXNvbHZlQ3Jvc3NpbmdzKCk7XG4gICAgICAgIGRpdmlkZWRQYXRoLnZpc2libGUgPSBmYWxzZTtcblxuXG4gICAgICAgIGxldCBlbmNsb3NlZExvb3BzID0gdXRpbC5maW5kSW50ZXJpb3JDdXJ2ZXMoZGl2aWRlZFBhdGgpO1xuXG4gICAgICAgIGlmIChlbmNsb3NlZExvb3BzKSB7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbmNsb3NlZExvb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBlbmNsb3NlZExvb3BzW2ldLnZpc2libGUgPSB0cnVlO1xuICAgICAgICAgICAgZW5jbG9zZWRMb29wc1tpXS5jbG9zZWQgPSB0cnVlO1xuICAgICAgICAgICAgZW5jbG9zZWRMb29wc1tpXS5maWxsQ29sb3IgPSBuZXcgQ29sb3IoMCwgMCk7IC8vIHRyYW5zcGFyZW50XG4gICAgICAgICAgICBlbmNsb3NlZExvb3BzW2ldLmRhdGEuaW50ZXJpb3IgPSB0cnVlO1xuICAgICAgICAgICAgZW5jbG9zZWRMb29wc1tpXS5kYXRhLnRyYW5zcGFyZW50ID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vIGVuY2xvc2VkTG9vcHNbaV0uYmxlbmRNb2RlID0gJ211bHRpcGx5JztcbiAgICAgICAgICAgIGdyb3VwLmFkZENoaWxkKGVuY2xvc2VkTG9vcHNbaV0pO1xuICAgICAgICAgICAgZW5jbG9zZWRMb29wc1tpXS5zZW5kVG9CYWNrKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHBhdGhDb3B5LnJlbW92ZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ25vIGludGVyc2VjdGlvbnMnKTtcbiAgICAgIH1cblxuICAgICAgZ3JvdXAuZGF0YS5jb2xvciA9IGJvdW5kcy5maWxsQ29sb3I7XG4gICAgICBncm91cC5kYXRhLnNjYWxlID0gMTsgLy8gaW5pdCB2YXJpYWJsZSB0byB0cmFjayBzY2FsZSBjaGFuZ2VzXG4gICAgICBncm91cC5kYXRhLnJvdGF0aW9uID0gMDsgLy8gaW5pdCB2YXJpYWJsZSB0byB0cmFjayByb3RhdGlvbiBjaGFuZ2VzXG5cbiAgICAgIGxldCBjaGlsZHJlbiA9IGdyb3VwLmdldEl0ZW1zKHtcbiAgICAgICAgbWF0Y2g6IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICByZXR1cm4gaXRlbS5uYW1lICE9PSAnbWlkZGxlJ1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gY29uc29sZS5sb2coJy0tLS0tJyk7XG4gICAgICAvLyBjb25zb2xlLmxvZyhncm91cCk7XG4gICAgICAvLyBjb25zb2xlLmxvZyhjaGlsZHJlbik7XG4gICAgICAvLyBncm91cC5zZWxlY3RlZCA9IHRydWU7XG4gICAgICBsZXQgdW5pdGVkUGF0aCA9IG5ldyBQYXRoKCk7XG4gICAgICBpZiAoY2hpbGRyZW4ubGVuZ3RoID4gMSkge1xuICAgICAgICBsZXQgYWNjdW11bGF0b3IgPSBuZXcgUGF0aCgpO1xuICAgICAgICBhY2N1bXVsYXRvci5jb3B5Q29udGVudChjaGlsZHJlblswXSk7XG4gICAgICAgIGFjY3VtdWxhdG9yLnZpc2libGUgPSBmYWxzZTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgbGV0IG90aGVyUGF0aCA9IG5ldyBQYXRoKCk7XG4gICAgICAgICAgb3RoZXJQYXRoLmNvcHlDb250ZW50KGNoaWxkcmVuW2ldKTtcbiAgICAgICAgICBvdGhlclBhdGgudmlzaWJsZSA9IGZhbHNlO1xuXG4gICAgICAgICAgdW5pdGVkUGF0aCA9IGFjY3VtdWxhdG9yLnVuaXRlKG90aGVyUGF0aCk7XG4gICAgICAgICAgb3RoZXJQYXRoLnJlbW92ZSgpO1xuICAgICAgICAgIGFjY3VtdWxhdG9yID0gdW5pdGVkUGF0aDtcbiAgICAgICAgfVxuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBjaGlsZHJlblswXSBpcyB1bml0ZWQgZ3JvdXBcbiAgICAgICAgdW5pdGVkUGF0aC5jb3B5Q29udGVudChjaGlsZHJlblswXSk7XG4gICAgICB9XG5cbiAgICAgIHVuaXRlZFBhdGgudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgdW5pdGVkUGF0aC5kYXRhLm5hbWUgPSAnbWFzayc7XG5cbiAgICAgIGdyb3VwLmFkZENoaWxkKHVuaXRlZFBhdGgpO1xuICAgICAgdW5pdGVkUGF0aC5zZW5kVG9CYWNrKCk7XG5cbiAgICAgIC8vIG1pZGRsZS5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAvLyBtaWRkbGUudmlzaWJsZSA9IHRydWU7XG4gICAgICAvLyBtaWRkbGUuc3Ryb2tlQ29sb3IgPSAncGluayc7XG5cbiAgICAgIGxhc3RDaGlsZCA9IGdyb3VwO1xuXG4gICAgICBNT1ZFUy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ25ld0dyb3VwJyxcbiAgICAgICAgaWQ6IGdyb3VwLmlkXG4gICAgICB9KTtcblxuICAgICAgaWYgKHJ1bkFuaW1hdGlvbnMpIHtcbiAgICAgICAgZ3JvdXAuYW5pbWF0ZShcbiAgICAgICAgICBbe1xuICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICBzY2FsZTogMC45XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgICAgICAgZHVyYXRpb246IDEwMCxcbiAgICAgICAgICAgICAgZWFzaW5nOiBcImVhc2VPdXRcIixcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgc2NhbGU6IDEuMTFcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXR0aW5nczoge1xuICAgICAgICAgICAgICBkdXJhdGlvbjogMTAwLFxuICAgICAgICAgICAgICBlYXNpbmc6IFwiZWFzZUluXCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxldCBwaW5jaGluZztcbiAgICBsZXQgcGluY2hlZEdyb3VwLCBsYXN0U2NhbGUsIGxhc3RSb3RhdGlvbjtcbiAgICBsZXQgb3JpZ2luYWxQb3NpdGlvbiwgb3JpZ2luYWxSb3RhdGlvbiwgb3JpZ2luYWxTY2FsZTtcblxuICAgIGZ1bmN0aW9uIHBpbmNoU3RhcnQoZXZlbnQpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdwaW5jaFN0YXJ0JywgZXZlbnQuY2VudGVyKTtcbiAgICAgIGhhbW1lck1hbmFnZXIuZ2V0KCdwYW4nKS5zZXQoe2VuYWJsZTogZmFsc2V9KTtcbiAgICAgIGNvbnN0IHBvaW50ZXIgPSBldmVudC5jZW50ZXIsXG4gICAgICAgICAgcG9pbnQgPSBuZXcgUG9pbnQocG9pbnRlci54LCBwb2ludGVyLnkpLFxuICAgICAgICAgIGhpdFJlc3VsdCA9IGhpdFRlc3RHcm91cEJvdW5kcyhwb2ludCk7XG5cbiAgICAgIGlmIChoaXRSZXN1bHQpIHtcbiAgICAgICAgcGluY2hpbmcgPSB0cnVlO1xuICAgICAgICAvLyBwaW5jaGVkR3JvdXAgPSBoaXRSZXN1bHQuaXRlbS5wYXJlbnQ7XG4gICAgICAgIHBpbmNoZWRHcm91cCA9IGhpdFJlc3VsdDtcbiAgICAgICAgbGFzdFNjYWxlID0gMTtcbiAgICAgICAgbGFzdFJvdGF0aW9uID0gZXZlbnQucm90YXRpb247XG5cbiAgICAgICAgb3JpZ2luYWxQb3NpdGlvbiA9IHBpbmNoZWRHcm91cC5wb3NpdGlvbjtcbiAgICAgICAgLy8gb3JpZ2luYWxSb3RhdGlvbiA9IHBpbmNoZWRHcm91cC5yb3RhdGlvbjtcbiAgICAgICAgb3JpZ2luYWxSb3RhdGlvbiA9IHBpbmNoZWRHcm91cC5kYXRhLnJvdGF0aW9uO1xuICAgICAgICBvcmlnaW5hbFNjYWxlID0gcGluY2hlZEdyb3VwLmRhdGEuc2NhbGU7XG5cbiAgICAgICAgaWYgKHJ1bkFuaW1hdGlvbnMpIHtcbiAgICAgICAgICBwaW5jaGVkR3JvdXAuYW5pbWF0ZSh7XG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgIHNjYWxlOiAxLjI1XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgICAgICAgZHVyYXRpb246IDEwMCxcbiAgICAgICAgICAgICAgZWFzaW5nOiBcImVhc2VPdXRcIixcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGluY2hlZEdyb3VwID0gbnVsbDtcbiAgICAgICAgY29uc29sZS5sb2coJ2hpdCBubyBpdGVtJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGluY2hNb3ZlKGV2ZW50KSB7XG4gICAgICBjb25zb2xlLmxvZygncGluY2hNb3ZlJyk7XG4gICAgICBpZiAoISFwaW5jaGVkR3JvdXApIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ3BpbmNobW92ZScsIGV2ZW50KTtcbiAgICAgICAgLy8gY29uc29sZS5sb2cocGluY2hlZEdyb3VwKTtcbiAgICAgICAgbGV0IGN1cnJlbnRTY2FsZSA9IGV2ZW50LnNjYWxlO1xuICAgICAgICBsZXQgc2NhbGVEZWx0YSA9IGN1cnJlbnRTY2FsZSAvIGxhc3RTY2FsZTtcbiAgICAgICAgLy8gY29uc29sZS5sb2cobGFzdFNjYWxlLCBjdXJyZW50U2NhbGUsIHNjYWxlRGVsdGEpO1xuICAgICAgICBsYXN0U2NhbGUgPSBjdXJyZW50U2NhbGU7XG5cbiAgICAgICAgbGV0IGN1cnJlbnRSb3RhdGlvbiA9IGV2ZW50LnJvdGF0aW9uO1xuICAgICAgICBsZXQgcm90YXRpb25EZWx0YSA9IGN1cnJlbnRSb3RhdGlvbiAtIGxhc3RSb3RhdGlvbjtcbiAgICAgICAgY29uc29sZS5sb2cobGFzdFJvdGF0aW9uLCBjdXJyZW50Um90YXRpb24sIHJvdGF0aW9uRGVsdGEpO1xuICAgICAgICBsYXN0Um90YXRpb24gPSBjdXJyZW50Um90YXRpb247XG5cbiAgICAgICAgLy8gY29uc29sZS5sb2coYHNjYWxpbmcgYnkgJHtzY2FsZURlbHRhfWApO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhgcm90YXRpbmcgYnkgJHtyb3RhdGlvbkRlbHRhfWApO1xuXG4gICAgICAgIHBpbmNoZWRHcm91cC5wb3NpdGlvbiA9IGV2ZW50LmNlbnRlcjtcbiAgICAgICAgcGluY2hlZEdyb3VwLnNjYWxlKHNjYWxlRGVsdGEpO1xuICAgICAgICBwaW5jaGVkR3JvdXAucm90YXRlKHJvdGF0aW9uRGVsdGEpO1xuXG4gICAgICAgIHBpbmNoZWRHcm91cC5kYXRhLnNjYWxlICo9IHNjYWxlRGVsdGE7XG4gICAgICAgIHBpbmNoZWRHcm91cC5kYXRhLnJvdGF0aW9uICs9IHJvdGF0aW9uRGVsdGE7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IGxhc3RFdmVudDtcbiAgICBmdW5jdGlvbiBwaW5jaEVuZChldmVudCkge1xuICAgICAgLy8gd2FpdCAyNTAgbXMgdG8gcHJldmVudCBtaXN0YWtlbiBwYW4gcmVhZGluZ3NcbiAgICAgIGxhc3RFdmVudCA9IGV2ZW50O1xuICAgICAgaWYgKCEhcGluY2hlZEdyb3VwKSB7XG4gICAgICAgIHBpbmNoZWRHcm91cC5kYXRhLnVwZGF0ZSA9IHRydWU7XG4gICAgICAgIGxldCBtb3ZlID0ge1xuICAgICAgICAgIGlkOiBwaW5jaGVkR3JvdXAuaWQsXG4gICAgICAgICAgdHlwZTogJ3RyYW5zZm9ybSdcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHBpbmNoZWRHcm91cC5wb3NpdGlvbiAhPSBvcmlnaW5hbFBvc2l0aW9uKSB7XG4gICAgICAgICAgbW92ZS5wb3NpdGlvbiA9IG9yaWdpbmFsUG9zaXRpb247XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGluY2hlZEdyb3VwLmRhdGEucm90YXRpb24gIT0gb3JpZ2luYWxSb3RhdGlvbikge1xuICAgICAgICAgIG1vdmUucm90YXRpb24gPSBvcmlnaW5hbFJvdGF0aW9uIC0gcGluY2hlZEdyb3VwLmRhdGEucm90YXRpb247XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGluY2hlZEdyb3VwLmRhdGEuc2NhbGUgIT0gb3JpZ2luYWxTY2FsZSkge1xuICAgICAgICAgIG1vdmUuc2NhbGUgPSBvcmlnaW5hbFNjYWxlIC8gcGluY2hlZEdyb3VwLmRhdGEuc2NhbGU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zb2xlLmxvZygnZmluYWwgc2NhbGUnLCBwaW5jaGVkR3JvdXAuZGF0YS5zY2FsZSk7XG4gICAgICAgIGNvbnNvbGUubG9nKG1vdmUpO1xuXG4gICAgICAgIE1PVkVTLnB1c2gobW92ZSk7XG5cbiAgICAgICAgaWYgKE1hdGguYWJzKGV2ZW50LnZlbG9jaXR5KSA+IDEpIHtcbiAgICAgICAgICAvLyBkaXNwb3NlIG9mIGdyb3VwIG9mZnNjcmVlblxuICAgICAgICAgIHRocm93UGluY2hlZEdyb3VwKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZiAocnVuQW5pbWF0aW9ucykge1xuICAgICAgICAvLyAgIHBpbmNoZWRHcm91cC5hbmltYXRlKHtcbiAgICAgICAgLy8gICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgLy8gICAgICAgc2NhbGU6IDAuOFxuICAgICAgICAvLyAgICAgfSxcbiAgICAgICAgLy8gICAgIHNldHRpbmdzOiB7XG4gICAgICAgIC8vICAgICAgIGR1cmF0aW9uOiAxMDAsXG4gICAgICAgIC8vICAgICAgIGVhc2luZzogXCJlYXNlT3V0XCIsXG4gICAgICAgIC8vICAgICB9XG4gICAgICAgIC8vICAgfSk7XG4gICAgICAgIC8vIH1cbiAgICAgIH1cbiAgICAgIHBpbmNoaW5nID0gZmFsc2U7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICBoYW1tZXJNYW5hZ2VyLmdldCgncGFuJykuc2V0KHtlbmFibGU6IHRydWV9KTtcbiAgICAgIH0sIDI1MCk7XG4gICAgfVxuXG4gICAgY29uc3QgaGl0T3B0aW9ucyA9IHtcbiAgICAgIHNlZ21lbnRzOiBmYWxzZSxcbiAgICAgIHN0cm9rZTogdHJ1ZSxcbiAgICAgIGZpbGw6IHRydWUsXG4gICAgICB0b2xlcmFuY2U6IDVcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gc2luZ2xlVGFwKGV2ZW50KSB7XG4gICAgICBjb25zdCBwb2ludGVyID0gZXZlbnQuY2VudGVyLFxuICAgICAgICAgIHBvaW50ID0gbmV3IFBvaW50KHBvaW50ZXIueCwgcG9pbnRlci55KSxcbiAgICAgICAgICBoaXRSZXN1bHQgPSBwYXBlci5wcm9qZWN0LmhpdFRlc3QocG9pbnQsIGhpdE9wdGlvbnMpO1xuXG4gICAgICBpZiAoaGl0UmVzdWx0KSB7XG4gICAgICAgIGxldCBpdGVtID0gaGl0UmVzdWx0Lml0ZW07XG4gICAgICAgIGl0ZW0uc2VsZWN0ZWQgPSAhaXRlbS5zZWxlY3RlZDtcbiAgICAgICAgY29uc29sZS5sb2coaXRlbSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZG91YmxlVGFwKGV2ZW50KSB7XG4gICAgICBjb25zdCBwb2ludGVyID0gZXZlbnQuY2VudGVyLFxuICAgICAgICAgIHBvaW50ID0gbmV3IFBvaW50KHBvaW50ZXIueCwgcG9pbnRlci55KSxcbiAgICAgICAgICBoaXRSZXN1bHQgPSBwYXBlci5wcm9qZWN0LmhpdFRlc3QocG9pbnQsIGhpdE9wdGlvbnMpO1xuXG4gICAgICBpZiAoaGl0UmVzdWx0KSB7XG4gICAgICAgIGxldCBpdGVtID0gaGl0UmVzdWx0Lml0ZW07XG4gICAgICAgIGxldCBwYXJlbnQgPSBpdGVtLnBhcmVudDtcblxuICAgICAgICBpZiAoaXRlbS5kYXRhLmludGVyaW9yKSB7XG4gICAgICAgICAgaXRlbS5kYXRhLnRyYW5zcGFyZW50ID0gIWl0ZW0uZGF0YS50cmFuc3BhcmVudDtcblxuICAgICAgICAgIGlmIChpdGVtLmRhdGEudHJhbnNwYXJlbnQpIHtcbiAgICAgICAgICAgIGl0ZW0uZmlsbENvbG9yID0gdHJhbnNwYXJlbnQ7XG4gICAgICAgICAgICBpdGVtLnN0cm9rZUNvbG9yID0gdHJhbnNwYXJlbnQ7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGl0ZW0uZmlsbENvbG9yID0gcGFyZW50LmRhdGEuY29sb3I7XG4gICAgICAgICAgICBpdGVtLnN0cm9rZUNvbG9yID0gcGFyZW50LmRhdGEuY29sb3I7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgTU9WRVMucHVzaCh7XG4gICAgICAgICAgICB0eXBlOiAnZmlsbENoYW5nZScsXG4gICAgICAgICAgICBpZDogaXRlbS5pZCxcbiAgICAgICAgICAgIGZpbGw6IHBhcmVudC5kYXRhLmNvbG9yLFxuICAgICAgICAgICAgdHJhbnNwYXJlbnQ6IGl0ZW0uZGF0YS50cmFuc3BhcmVudFxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdub3QgaW50ZXJpb3InKVxuICAgICAgICB9XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBpbmNoZWRHcm91cCA9IG51bGw7XG4gICAgICAgIGNvbnNvbGUubG9nKCdoaXQgbm8gaXRlbScpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHZlbG9jaXR5TXVsdGlwbGllciA9IDI1O1xuICAgIGZ1bmN0aW9uIHRocm93UGluY2hlZEdyb3VwKCkge1xuICAgICAgY29uc29sZS5sb2cocGluY2hlZEdyb3VwLnBvc2l0aW9uKTtcbiAgICAgIGlmIChwaW5jaGVkR3JvdXAucG9zaXRpb24ueCA8PSAwIC0gcGluY2hlZEdyb3VwLmJvdW5kcy53aWR0aCB8fFxuICAgICAgICAgIHBpbmNoZWRHcm91cC5wb3NpdGlvbi54ID49IHZpZXdXaWR0aCArIHBpbmNoZWRHcm91cC5ib3VuZHMud2lkdGggfHxcbiAgICAgICAgICBwaW5jaGVkR3JvdXAucG9zaXRpb24ueSA8PSAwIC0gcGluY2hlZEdyb3VwLmJvdW5kcy5oZWlnaHQgfHxcbiAgICAgICAgICBwaW5jaGVkR3JvdXAucG9zaXRpb24ueSA+PSB2aWV3SGVpZ2h0ICsgcGluY2hlZEdyb3VwLmJvdW5kcy5oZWlnaHQpIHtcbiAgICAgICAgICAgIHBpbmNoZWRHcm91cC5kYXRhLm9mZlNjcmVlbiA9IHRydWU7XG4gICAgICAgICAgICBwaW5jaGVkR3JvdXAudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhyb3dQaW5jaGVkR3JvdXApO1xuICAgICAgcGluY2hlZEdyb3VwLnBvc2l0aW9uLnggKz0gbGFzdEV2ZW50LnZlbG9jaXR5WCAqIHZlbG9jaXR5TXVsdGlwbGllcjtcbiAgICAgIHBpbmNoZWRHcm91cC5wb3NpdGlvbi55ICs9IGxhc3RFdmVudC52ZWxvY2l0eVkgKiB2ZWxvY2l0eU11bHRpcGxpZXI7XG4gICAgfVxuXG4gICAgdmFyIGhhbW1lck1hbmFnZXIgPSBuZXcgSGFtbWVyLk1hbmFnZXIoJGNhbnZhc1swXSk7XG5cbiAgICBoYW1tZXJNYW5hZ2VyLmFkZChuZXcgSGFtbWVyLlRhcCh7IGV2ZW50OiAnZG91YmxldGFwJywgdGFwczogMiB9KSk7XG4gICAgaGFtbWVyTWFuYWdlci5hZGQobmV3IEhhbW1lci5UYXAoeyBldmVudDogJ3NpbmdsZXRhcCcgfSkpO1xuICAgIGhhbW1lck1hbmFnZXIuYWRkKG5ldyBIYW1tZXIuUGFuKHsgZGlyZWN0aW9uOiBIYW1tZXIuRElSRUNUSU9OX0FMTCB9KSk7XG4gICAgaGFtbWVyTWFuYWdlci5hZGQobmV3IEhhbW1lci5QaW5jaCgpKTtcblxuICAgIGhhbW1lck1hbmFnZXIuZ2V0KCdkb3VibGV0YXAnKS5yZWNvZ25pemVXaXRoKCdzaW5nbGV0YXAnKTtcbiAgICBoYW1tZXJNYW5hZ2VyLmdldCgnc2luZ2xldGFwJykucmVxdWlyZUZhaWx1cmUoJ2RvdWJsZXRhcCcpO1xuICAgIGhhbW1lck1hbmFnZXIuZ2V0KCdwYW4nKS5yZXF1aXJlRmFpbHVyZSgncGluY2gnKTtcblxuICAgIGhhbW1lck1hbmFnZXIub24oJ3NpbmdsZXRhcCcsIHNpbmdsZVRhcCk7XG4gICAgaGFtbWVyTWFuYWdlci5vbignZG91YmxldGFwJywgZG91YmxlVGFwKTtcblxuICAgIGhhbW1lck1hbmFnZXIub24oJ3BhbnN0YXJ0JywgcGFuU3RhcnQpO1xuICAgIGhhbW1lck1hbmFnZXIub24oJ3Bhbm1vdmUnLCBwYW5Nb3ZlKTtcbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdwYW5lbmQnLCBwYW5FbmQpO1xuXG4gICAgaGFtbWVyTWFuYWdlci5vbigncGluY2hzdGFydCcsIHBpbmNoU3RhcnQpO1xuICAgIGhhbW1lck1hbmFnZXIub24oJ3BpbmNobW92ZScsIHBpbmNoTW92ZSk7XG4gICAgaGFtbWVyTWFuYWdlci5vbigncGluY2hlbmQnLCBwaW5jaEVuZCk7XG4gICAgaGFtbWVyTWFuYWdlci5vbigncGluY2hjYW5jZWwnLCBmdW5jdGlvbigpIHsgaGFtbWVyTWFuYWdlci5nZXQoJ3BhbicpLnNldCh7ZW5hYmxlOiB0cnVlfSk7IH0pOyAvLyBtYWtlIHN1cmUgaXQncyByZWVuYWJsZWRcbiAgfVxuXG4gIGZ1bmN0aW9uIG5ld1ByZXNzZWQoKSB7XG4gICAgY29uc29sZS5sb2coJ25ldyBwcmVzc2VkJyk7XG5cbiAgICBwYXBlci5wcm9qZWN0LmFjdGl2ZUxheWVyLnJlbW92ZUNoaWxkcmVuKCk7XG4gIH1cblxuICBmdW5jdGlvbiB1bmRvUHJlc3NlZCgpIHtcbiAgICBjb25zb2xlLmxvZygndW5kbyBwcmVzc2VkJyk7XG4gICAgaWYgKCEoTU9WRVMubGVuZ3RoID4gMCkpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdubyBtb3ZlcyB5ZXQnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgbGFzdE1vdmUgPSBNT1ZFUy5wb3AoKTtcbiAgICBsZXQgaXRlbSA9IHByb2plY3QuZ2V0SXRlbSh7XG4gICAgICBpZDogbGFzdE1vdmUuaWRcbiAgICB9KTtcblxuICAgIGlmIChpdGVtKSB7XG4gICAgICBpdGVtLnZpc2libGUgPSB0cnVlOyAvLyBtYWtlIHN1cmVcbiAgICAgIHN3aXRjaChsYXN0TW92ZS50eXBlKSB7XG4gICAgICAgIGNhc2UgJ25ld0dyb3VwJzpcbiAgICAgICAgICBjb25zb2xlLmxvZygncmVtb3ZpbmcgZ3JvdXAnKTtcbiAgICAgICAgICBpdGVtLnJlbW92ZSgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdmaWxsQ2hhbmdlJzpcbiAgICAgICAgICBpZiAobGFzdE1vdmUudHJhbnNwYXJlbnQpIHtcbiAgICAgICAgICAgIGl0ZW0uZmlsbENvbG9yID0gbGFzdE1vdmUuZmlsbDtcbiAgICAgICAgICAgIGl0ZW0uc3Ryb2tlQ29sb3IgPSBsYXN0TW92ZS5maWxsO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpdGVtLmZpbGxDb2xvciA9IHRyYW5zcGFyZW50O1xuICAgICAgICAgICAgaXRlbS5zdHJva2VDb2xvciA9IHRyYW5zcGFyZW50O1xuICAgICAgICAgIH1cbiAgICAgICAgY2FzZSAndHJhbnNmb3JtJzpcbiAgICAgICAgICBpZiAoISFsYXN0TW92ZS5wb3NpdGlvbikge1xuICAgICAgICAgICAgaXRlbS5wb3NpdGlvbiA9IGxhc3RNb3ZlLnBvc2l0aW9uXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghIWxhc3RNb3ZlLnJvdGF0aW9uKSB7XG4gICAgICAgICAgICBpdGVtLnJvdGF0aW9uID0gbGFzdE1vdmUucm90YXRpb247XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghIWxhc3RNb3ZlLnNjYWxlKSB7XG4gICAgICAgICAgICBpdGVtLnNjYWxlKGxhc3RNb3ZlLnNjYWxlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgY29uc29sZS5sb2coJ3Vua25vd24gY2FzZScpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZygnY291bGQgbm90IGZpbmQgbWF0Y2hpbmcgaXRlbScpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHBsYXlQcmVzc2VkKCkge1xuICAgIGNvbnNvbGUubG9nKCdwbGF5IHByZXNzZWQnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRpcHNQcmVzc2VkKCkge1xuICAgIGNvbnNvbGUubG9nKCd0aXBzIHByZXNzZWQnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNoYXJlUHJlc3NlZCgpIHtcbiAgICBjb25zb2xlLmxvZygnc2hhcmUgcHJlc3NlZCcpO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdE5ldygpIHtcbiAgICAkKCcubWFpbi1jb250cm9scyAubmV3Jykub24oJ2NsaWNrIHRhcCB0b3VjaCcsIG5ld1ByZXNzZWQpO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdFVuZG8oKSB7XG4gICAgJCgnLm1haW4tY29udHJvbHMgLnVuZG8nKS5vbignY2xpY2snLCB1bmRvUHJlc3NlZCk7XG4gIH1cbiAgZnVuY3Rpb24gaW5pdFBsYXkoKSB7XG4gICAgJCgnLm1haW4tY29udHJvbHMgLnBsYXknKS5vbignY2xpY2snLCBwbGF5UHJlc3NlZCk7XG4gIH1cbiAgZnVuY3Rpb24gaW5pdFRpcHMoKSB7XG4gICAgJCgnLmF1eC1jb250cm9scyAudGlwcycpLm9uKCdjbGljaycsIHRpcHNQcmVzc2VkKTtcbiAgfVxuICBmdW5jdGlvbiBpbml0U2hhcmUoKSB7XG4gICAgJCgnLmF1eC1jb250cm9scyAuc2hhcmUnKS5vbignY2xpY2snLCBzaGFyZVByZXNzZWQpO1xuICB9XG5cbiAgZnVuY3Rpb24gZHJhd0NpcmNsZSgpIHtcbiAgICBsZXQgY2lyY2xlID0gbmV3IFBhdGguQ2lyY2xlKHtcbiAgICAgIGNlbnRlcjogWzQwMCwgNDAwXSxcbiAgICAgIHJhZGl1czogMTAwLFxuICAgICAgc3Ryb2tlQ29sb3I6ICdncmVlbicsXG4gICAgICBmaWxsQ29sb3I6ICdncmVlbidcbiAgICB9KTtcbiAgICBsZXQgZ3JvdXAgPSBuZXcgR3JvdXAoY2lyY2xlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1haW4oKSB7XG4gICAgaW5pdENvbnRyb2xQYW5lbCgpO1xuICAgIC8vIGRyYXdDaXJjbGUoKTtcbiAgICBpbml0Vmlld1ZhcnMoKTtcbiAgfVxuXG4gIG1haW4oKTtcbn0pO1xuIiwiY29uc3QgY29uZmlnID0gcmVxdWlyZSgnLi8uLi8uLi9jb25maWcnKTtcblxuLy8gQ29udmVydHMgZnJvbSBkZWdyZWVzIHRvIHJhZGlhbnMuXG5leHBvcnQgZnVuY3Rpb24gcmFkKGRlZ3JlZXMpIHtcbiAgcmV0dXJuIGRlZ3JlZXMgKiBNYXRoLlBJIC8gMTgwO1xufTtcblxuLy8gQ29udmVydHMgZnJvbSByYWRpYW5zIHRvIGRlZ3JlZXMuXG5leHBvcnQgZnVuY3Rpb24gZGVnKHJhZGlhbnMpIHtcbiAgcmV0dXJuIHJhZGlhbnMgKiAxODAgLyBNYXRoLlBJO1xufTtcblxuLy8gZGlzdGFuY2UgYmV0d2VlbiB0d28gcG9pbnRzXG5leHBvcnQgZnVuY3Rpb24gZGVsdGEocDEsIHAyKSB7XG4gIHJldHVybiBNYXRoLnNxcnQoTWF0aC5wb3cocDEueCAtIHAyLngsIDIpICsgTWF0aC5wb3cocDEueSAtIHAyLnksIDIpKTsgLy8gcHl0aGFnb3JlYW4hXG59XG5cbi8vIHJldHVybnMgYW4gYXJyYXkgb2YgdGhlIGludGVyaW9yIGN1cnZlcyBvZiBhIGdpdmVuIGNvbXBvdW5kIHBhdGhcbmV4cG9ydCBmdW5jdGlvbiBmaW5kSW50ZXJpb3JDdXJ2ZXMocGF0aCkge1xuICBsZXQgaW50ZXJpb3JDdXJ2ZXMgPSBbXTtcbiAgaWYgKCFwYXRoIHx8ICFwYXRoLmNoaWxkcmVuIHx8ICFwYXRoLmNoaWxkcmVuLmxlbmd0aCkgcmV0dXJuO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcGF0aC5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgIGxldCBjaGlsZCA9IHBhdGguY2hpbGRyZW5baV07XG5cbiAgICBpZiAoY2hpbGQuY2xvc2VkKXtcbiAgICAgIGludGVyaW9yQ3VydmVzLnB1c2gobmV3IFBhdGgoY2hpbGQuc2VnbWVudHMpKTtcbiAgICB9XG4gIH1cblxuICBwYXRoLnJlbW92ZSgpO1xuICByZXR1cm4gaW50ZXJpb3JDdXJ2ZXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cnVlR3JvdXAoZ3JvdXApIHtcbiAgbGV0IGJvdW5kcyA9IGdyb3VwLl9uYW1lZENoaWxkcmVuLmJvdW5kc1swXSxcbiAgICAgIG1pZGRsZSA9IGdyb3VwLl9uYW1lZENoaWxkcmVuLm1pZGRsZVswXTtcblxuICBsZXQgaW50ZXJzZWN0aW9ucyA9IG1pZGRsZS5nZXRJbnRlcnNlY3Rpb25zKCk7XG5cbiAgbGV0IG1pZGRsZUNvcHkgPSBuZXcgUGF0aCgpO1xuICBtaWRkbGVDb3B5LmNvcHlDb250ZW50KG1pZGRsZSk7XG4gIC8vIGRlYnVnZ2VyO1xuXG4gIGlmIChpbnRlcnNlY3Rpb25zLmxlbmd0aCA+IDApIHtcbiAgICAvLyBzZWUgaWYgd2UgY2FuIHRyaW0gdGhlIHBhdGggd2hpbGUgbWFpbnRhaW5pbmcgaW50ZXJzZWN0aW9uc1xuICAgIC8vIGNvbnNvbGUubG9nKCdpbnRlcnNlY3Rpb25zIScpO1xuICAgIC8vIG1pZGRsZUNvcHkuc3Ryb2tlQ29sb3IgPSAneWVsbG93JztcbiAgICBtaWRkbGVDb3B5ID0gdHJpbVBhdGgobWlkZGxlQ29weSk7XG4gICAgLy8gbWlkZGxlQ29weS5zdHJva2VDb2xvciA9ICdvcmFuZ2UnO1xuICB9IGVsc2Uge1xuICAgIC8vIGV4dGVuZCBmaXJzdCBhbmQgbGFzdCBzZWdtZW50IGJ5IHRocmVzaG9sZCwgc2VlIGlmIGludGVyc2VjdGlvblxuICAgIC8vIGNvbnNvbGUubG9nKCdubyBpbnRlcnNlY3Rpb25zLCBleHRlbmRpbmcgZmlyc3QhJyk7XG4gICAgLy8gbWlkZGxlQ29weS5zdHJva2VDb2xvciA9ICd5ZWxsb3cnO1xuICAgIG1pZGRsZUNvcHkgPSBleHRlbmRQYXRoKG1pZGRsZUNvcHkpO1xuICAgIC8vIG1pZGRsZUNvcHkuc3Ryb2tlQ29sb3IgPSAnb3JhbmdlJztcbiAgICBsZXQgaW50ZXJzZWN0aW9ucyA9IG1pZGRsZUNvcHkuZ2V0SW50ZXJzZWN0aW9ucygpO1xuICAgIGlmIChpbnRlcnNlY3Rpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgIC8vIG1pZGRsZUNvcHkuc3Ryb2tlQ29sb3IgPSAncGluayc7XG4gICAgICBtaWRkbGVDb3B5ID0gdHJpbVBhdGgobWlkZGxlQ29weSk7XG4gICAgICAvLyBtaWRkbGVDb3B5LnN0cm9rZUNvbG9yID0gJ2dyZWVuJztcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gbWlkZGxlQ29weS5zdHJva2VDb2xvciA9ICdyZWQnO1xuICAgICAgbWlkZGxlQ29weSA9IHJlbW92ZVBhdGhFeHRlbnNpb25zKG1pZGRsZUNvcHkpO1xuICAgICAgLy8gbWlkZGxlQ29weS5zdHJva2VDb2xvciA9ICdibHVlJztcbiAgICB9XG4gIH1cblxuICBtaWRkbGVDb3B5Lm5hbWUgPSAnbWlkZGxlJzsgLy8gbWFrZSBzdXJlXG5cbiAgLy8gZ3JvdXAuYWRkQ2hpbGQobWlkZGxlQ29weSk7XG4gIC8vIGdyb3VwLl9uYW1lZENoaWxkcmVuLm1pZGRsZVswXSA9IG1pZGRsZUNvcHk7XG4gIGdyb3VwLl9uYW1lZENoaWxkcmVuLm1pZGRsZVswXS5yZXBsYWNlV2l0aChtaWRkbGVDb3B5KTs7XG4gIHJldHVybiBncm91cDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4dGVuZFBhdGgocGF0aCkge1xuICBpZiAocGF0aC5sZW5ndGggPiAwKSB7XG4gICAgY29uc3QgbGVuZ3RoVG9sZXJhbmNlID0gY29uZmlnLnNoYXBlLnRyaW1taW5nVGhyZXNob2xkICogcGF0aC5sZW5ndGg7XG5cbiAgICBsZXQgZmlyc3RTZWdtZW50ID0gcGF0aC5maXJzdFNlZ21lbnQ7XG4gICAgbGV0IG5leHRTZWdtZW50ID0gZmlyc3RTZWdtZW50Lm5leHQ7XG4gICAgbGV0IHN0YXJ0QW5nbGUgPSBNYXRoLmF0YW4yKG5leHRTZWdtZW50LnBvaW50LnkgLSBmaXJzdFNlZ21lbnQucG9pbnQueSwgbmV4dFNlZ21lbnQucG9pbnQueCAtIGZpcnN0U2VnbWVudC5wb2ludC54KTsgLy8gcmFkXG4gICAgbGV0IGludmVyc2VTdGFydEFuZ2xlID0gc3RhcnRBbmdsZSArIE1hdGguUEk7XG4gICAgbGV0IGV4dGVuZGVkU3RhcnRQb2ludCA9IG5ldyBQb2ludChmaXJzdFNlZ21lbnQucG9pbnQueCArIChNYXRoLmNvcyhpbnZlcnNlU3RhcnRBbmdsZSkgKiBsZW5ndGhUb2xlcmFuY2UpLCBmaXJzdFNlZ21lbnQucG9pbnQueSArIChNYXRoLnNpbihpbnZlcnNlU3RhcnRBbmdsZSkgKiBsZW5ndGhUb2xlcmFuY2UpKTtcbiAgICBwYXRoLmluc2VydCgwLCBleHRlbmRlZFN0YXJ0UG9pbnQpO1xuXG4gICAgbGV0IGxhc3RTZWdtZW50ID0gcGF0aC5sYXN0U2VnbWVudDtcbiAgICBsZXQgcGVuU2VnbWVudCA9IGxhc3RTZWdtZW50LnByZXZpb3VzOyAvLyBwZW51bHRpbWF0ZVxuICAgIGxldCBlbmRBbmdsZSA9IE1hdGguYXRhbjIobGFzdFNlZ21lbnQucG9pbnQueSAtIHBlblNlZ21lbnQucG9pbnQueSwgbGFzdFNlZ21lbnQucG9pbnQueCAtIHBlblNlZ21lbnQucG9pbnQueCk7IC8vIHJhZFxuICAgIGxldCBleHRlbmRlZEVuZFBvaW50ID0gbmV3IFBvaW50KGxhc3RTZWdtZW50LnBvaW50LnggKyAoTWF0aC5jb3MoZW5kQW5nbGUpICogbGVuZ3RoVG9sZXJhbmNlKSwgbGFzdFNlZ21lbnQucG9pbnQueSArIChNYXRoLnNpbihlbmRBbmdsZSkgKiBsZW5ndGhUb2xlcmFuY2UpKTtcbiAgICBwYXRoLmFkZChleHRlbmRlZEVuZFBvaW50KTtcbiAgfVxuICByZXR1cm4gcGF0aDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRyaW1QYXRoKHBhdGgpIHtcbiAgbGV0IG9yaWdpbmFsUGF0aCA9IHBhdGguY2xvbmUoKTtcbiAgLy8gb3JpZ2luYWxQYXRoLnN0cm9rZUNvbG9yID0gJ3BpbmsnO1xuICB0cnkge1xuICAgIGxldCBpbnRlcnNlY3Rpb25zID0gcGF0aC5nZXRJbnRlcnNlY3Rpb25zKCk7XG4gICAgbGV0IGRpdmlkZWRQYXRoID0gcGF0aC5yZXNvbHZlQ3Jvc3NpbmdzKCk7XG5cbiAgICBjb25zdCBleHRlbmRpbmdUaHJlc2hvbGQgPSBjb25maWcuc2hhcGUuZXh0ZW5kaW5nVGhyZXNob2xkO1xuICAgIGNvbnN0IHRvdGFsTGVuZ3RoID0gcGF0aC5sZW5ndGg7XG5cbiAgICAvLyB3ZSB3YW50IHRvIHJlbW92ZSBhbGwgY2xvc2VkIGxvb3BzIGZyb20gdGhlIHBhdGgsIHNpbmNlIHRoZXNlIGFyZSBuZWNlc3NhcmlseSBpbnRlcmlvciBhbmQgbm90IGZpcnN0IG9yIGxhc3RcbiAgICBCYXNlLmVhY2goZGl2aWRlZFBhdGguY2hpbGRyZW4sIChjaGlsZCwgaSkgPT4ge1xuICAgICAgaWYgKGNoaWxkLmNsb3NlZCkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZygnc3VidHJhY3RpbmcgY2xvc2VkIGNoaWxkJyk7XG4gICAgICAgIGRpdmlkZWRQYXRoID0gZGl2aWRlZFBhdGguc3VidHJhY3QoY2hpbGQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZGl2aWRlZFBhdGggPSBkaXZpZGVkUGF0aC51bml0ZShjaGlsZCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBjb25zb2xlLmxvZyhkaXZpZGVkUGF0aCk7XG5cbiAgICBpZiAoISFkaXZpZGVkUGF0aC5jaGlsZHJlbiAmJiBkaXZpZGVkUGF0aC5jaGlsZHJlbi5sZW5ndGggPiAxKSB7XG4gICAgICAvLyBkaXZpZGVkIHBhdGggaXMgYSBjb21wb3VuZCBwYXRoXG4gICAgICBsZXQgdW5pdGVkRGl2aWRlZFBhdGggPSBuZXcgUGF0aCgpO1xuICAgICAgLy8gdW5pdGVkRGl2aWRlZFBhdGguY29weUF0dHJpYnV0ZXMoZGl2aWRlZFBhdGgpO1xuICAgICAgLy8gY29uc29sZS5sb2coJ2JlZm9yZScsIHVuaXRlZERpdmlkZWRQYXRoKTtcbiAgICAgIEJhc2UuZWFjaChkaXZpZGVkUGF0aC5jaGlsZHJlbiwgKGNoaWxkLCBpKSA9PiB7XG4gICAgICAgIGlmICghY2hpbGQuY2xvc2VkKSB7XG4gICAgICAgICAgdW5pdGVkRGl2aWRlZFBhdGggPSB1bml0ZWREaXZpZGVkUGF0aC51bml0ZShjaGlsZCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgZGl2aWRlZFBhdGggPSB1bml0ZWREaXZpZGVkUGF0aDtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdhZnRlcicsIHVuaXRlZERpdmlkZWRQYXRoKTtcbiAgICAgIC8vIHJldHVybjtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gY29uc29sZS5sb2coJ2RpdmlkZWRQYXRoIGhhcyBvbmUgY2hpbGQnKTtcbiAgICB9XG5cbiAgICBpZiAoaW50ZXJzZWN0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAvLyB3ZSBoYXZlIHRvIGdldCB0aGUgbmVhcmVzdCBsb2NhdGlvbiBiZWNhdXNlIHRoZSBleGFjdCBpbnRlcnNlY3Rpb24gcG9pbnQgaGFzIGFscmVhZHkgYmVlbiByZW1vdmVkIGFzIGEgcGFydCBvZiByZXNvbHZlQ3Jvc3NpbmdzKClcbiAgICAgIGxldCBmaXJzdEludGVyc2VjdGlvbiA9IGRpdmlkZWRQYXRoLmdldE5lYXJlc3RMb2NhdGlvbihpbnRlcnNlY3Rpb25zWzBdLnBvaW50KTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKGRpdmlkZWRQYXRoKTtcbiAgICAgIGxldCByZXN0ID0gZGl2aWRlZFBhdGguc3BsaXRBdChmaXJzdEludGVyc2VjdGlvbik7IC8vIGRpdmlkZWRQYXRoIGlzIG5vdyB0aGUgZmlyc3Qgc2VnbWVudFxuICAgICAgbGV0IGZpcnN0U2VnbWVudCA9IGRpdmlkZWRQYXRoO1xuICAgICAgbGV0IGxhc3RTZWdtZW50O1xuXG4gICAgICAvLyBmaXJzdFNlZ21lbnQuc3Ryb2tlQ29sb3IgPSAncGluayc7XG5cbiAgICAgIC8vIGxldCBjaXJjbGVPbmUgPSBuZXcgUGF0aC5DaXJjbGUoe1xuICAgICAgLy8gICBjZW50ZXI6IGZpcnN0SW50ZXJzZWN0aW9uLnBvaW50LFxuICAgICAgLy8gICByYWRpdXM6IDUsXG4gICAgICAvLyAgIHN0cm9rZUNvbG9yOiAncmVkJ1xuICAgICAgLy8gfSk7XG5cbiAgICAgIC8vIGNvbnNvbGUubG9nKGludGVyc2VjdGlvbnMpO1xuICAgICAgaWYgKGludGVyc2VjdGlvbnMubGVuZ3RoID4gMSkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZygnZm9vJyk7XG4gICAgICAgIC8vIHJlc3QucmV2ZXJzZSgpOyAvLyBzdGFydCBmcm9tIGVuZFxuICAgICAgICBsZXQgbGFzdEludGVyc2VjdGlvbiA9IHJlc3QuZ2V0TmVhcmVzdExvY2F0aW9uKGludGVyc2VjdGlvbnNbaW50ZXJzZWN0aW9ucy5sZW5ndGggLSAxXS5wb2ludCk7XG4gICAgICAgIC8vIGxldCBjaXJjbGVUd28gPSBuZXcgUGF0aC5DaXJjbGUoe1xuICAgICAgICAvLyAgIGNlbnRlcjogbGFzdEludGVyc2VjdGlvbi5wb2ludCxcbiAgICAgICAgLy8gICByYWRpdXM6IDUsXG4gICAgICAgIC8vICAgc3Ryb2tlQ29sb3I6ICdncmVlbidcbiAgICAgICAgLy8gfSk7XG4gICAgICAgIGxhc3RTZWdtZW50ID0gcmVzdC5zcGxpdEF0KGxhc3RJbnRlcnNlY3Rpb24pOyAvLyByZXN0IGlzIG5vdyBldmVyeXRoaW5nIEJVVCB0aGUgZmlyc3QgYW5kIGxhc3Qgc2VnbWVudHNcbiAgICAgICAgaWYgKCFsYXN0U2VnbWVudCB8fCAhbGFzdFNlZ21lbnQubGVuZ3RoKSBsYXN0U2VnbWVudCA9IHJlc3Q7XG4gICAgICAgIHJlc3QucmV2ZXJzZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGFzdFNlZ21lbnQgPSByZXN0O1xuICAgICAgfVxuXG4gICAgICBpZiAoISFmaXJzdFNlZ21lbnQgJiYgZmlyc3RTZWdtZW50Lmxlbmd0aCA8PSBleHRlbmRpbmdUaHJlc2hvbGQgKiB0b3RhbExlbmd0aCkge1xuICAgICAgICBwYXRoID0gcGF0aC5zdWJ0cmFjdChmaXJzdFNlZ21lbnQpO1xuICAgICAgICBpZiAocGF0aC5jbGFzc05hbWUgPT09ICdDb21wb3VuZFBhdGgnKSB7XG4gICAgICAgICAgQmFzZS5lYWNoKHBhdGguY2hpbGRyZW4sIChjaGlsZCwgaSkgPT4ge1xuICAgICAgICAgICAgaWYgKCFjaGlsZC5jbG9zZWQpIHtcbiAgICAgICAgICAgICAgY2hpbGQucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKCEhbGFzdFNlZ21lbnQgJiYgbGFzdFNlZ21lbnQubGVuZ3RoIDw9IGV4dGVuZGluZ1RocmVzaG9sZCAqIHRvdGFsTGVuZ3RoKSB7XG4gICAgICAgIHBhdGggPSBwYXRoLnN1YnRyYWN0KGxhc3RTZWdtZW50KTtcbiAgICAgICAgaWYgKHBhdGguY2xhc3NOYW1lID09PSAnQ29tcG91bmRQYXRoJykge1xuICAgICAgICAgIEJhc2UuZWFjaChwYXRoLmNoaWxkcmVuLCAoY2hpbGQsIGkpID0+IHtcbiAgICAgICAgICAgIGlmICghY2hpbGQuY2xvc2VkKSB7XG4gICAgICAgICAgICAgIGNoaWxkLnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gdGhpcyBpcyBoYWNreSBidXQgSSdtIG5vdCBzdXJlIGhvdyB0byBnZXQgYXJvdW5kIGl0XG4gICAgLy8gc29tZXRpbWVzIHBhdGguc3VidHJhY3QoKSByZXR1cm5zIGEgY29tcG91bmQgcGF0aCwgd2l0aCBjaGlsZHJlbiBjb25zaXN0aW5nIG9mIHRoZSBjbG9zZWQgcGF0aCBJIHdhbnQgYW5kIGFub3RoZXIgZXh0cmFuZW91cyBjbG9zZWQgcGF0aFxuICAgIC8vIGl0IGFwcGVhcnMgdGhhdCB0aGUgY29ycmVjdCBwYXRoIGFsd2F5cyBoYXMgYSBoaWdoZXIgdmVyc2lvbiwgdGhvdWdoIEknbSBub3QgMTAwJSBzdXJlIHRoYXQgdGhpcyBpcyBhbHdheXMgdGhlIGNhc2VcblxuICAgIGlmIChwYXRoLmNsYXNzTmFtZSA9PT0gJ0NvbXBvdW5kUGF0aCcgJiYgcGF0aC5jaGlsZHJlbi5sZW5ndGggPiAwKSB7XG4gICAgICBpZiAocGF0aC5jaGlsZHJlbi5sZW5ndGggPiAxKSB7XG4gICAgICAgIGxldCBsYXJnZXN0Q2hpbGQ7XG4gICAgICAgIGxldCBsYXJnZXN0Q2hpbGRBcmVhID0gMDtcblxuICAgICAgICBCYXNlLmVhY2gocGF0aC5jaGlsZHJlbiwgKGNoaWxkLCBpKSA9PiB7XG4gICAgICAgICAgaWYgKGNoaWxkLmFyZWEgPiBsYXJnZXN0Q2hpbGRBcmVhKSB7XG4gICAgICAgICAgICBsYXJnZXN0Q2hpbGRBcmVhID0gY2hpbGQuYXJlYTtcbiAgICAgICAgICAgIGxhcmdlc3RDaGlsZCA9IGNoaWxkO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGxhcmdlc3RDaGlsZCkge1xuICAgICAgICAgIHBhdGggPSBsYXJnZXN0Q2hpbGQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcGF0aCA9IHBhdGguY2hpbGRyZW5bMF07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhdGggPSBwYXRoLmNoaWxkcmVuWzBdO1xuICAgICAgfVxuICAgICAgLy8gY29uc29sZS5sb2cocGF0aCk7XG4gICAgICAvLyBjb25zb2xlLmxvZyhwYXRoLmxhc3RDaGlsZCk7XG4gICAgICAvLyBwYXRoLmZpcnN0Q2hpbGQuc3Ryb2tlQ29sb3IgPSAncGluayc7XG4gICAgICAvLyBwYXRoLmxhc3RDaGlsZC5zdHJva2VDb2xvciA9ICdncmVlbic7XG4gICAgICAvLyBwYXRoID0gcGF0aC5sYXN0Q2hpbGQ7IC8vIHJldHVybiBsYXN0IGNoaWxkP1xuICAgICAgLy8gZmluZCBoaWdoZXN0IHZlcnNpb25cbiAgICAgIC8vXG4gICAgICAvLyBjb25zb2xlLmxvZyhyZWFsUGF0aFZlcnNpb24pO1xuICAgICAgLy9cbiAgICAgIC8vIEJhc2UuZWFjaChwYXRoLmNoaWxkcmVuLCAoY2hpbGQsIGkpID0+IHtcbiAgICAgIC8vICAgaWYgKGNoaWxkLnZlcnNpb24gPT0gcmVhbFBhdGhWZXJzaW9uKSB7XG4gICAgICAvLyAgICAgY29uc29sZS5sb2coJ3JldHVybmluZyBjaGlsZCcpO1xuICAgICAgLy8gICAgIHJldHVybiBjaGlsZDtcbiAgICAgIC8vICAgfVxuICAgICAgLy8gfSlcbiAgICB9XG4gICAgLy8gY29uc29sZS5sb2coJ29yaWdpbmFsIGxlbmd0aDonLCB0b3RhbExlbmd0aCk7XG4gICAgLy8gY29uc29sZS5sb2coJ2VkaXRlZCBsZW5ndGg6JywgcGF0aC5sZW5ndGgpO1xuICAgIGlmIChwYXRoLmxlbmd0aCAvIHRvdGFsTGVuZ3RoIDw9IDAuNzUpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdyZXR1cm5pbmcgb3JpZ2luYWwnKTtcbiAgICAgIHJldHVybiBvcmlnaW5hbFBhdGg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBwYXRoO1xuICAgIH1cbiAgfSBjYXRjaChlKSB7XG4gICAgY29uc29sZS5lcnJvcihlKTtcbiAgICByZXR1cm4gb3JpZ2luYWxQYXRoO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVQYXRoRXh0ZW5zaW9ucyhwYXRoKSB7XG4gIHBhdGgucmVtb3ZlU2VnbWVudCgwKTtcbiAgcGF0aC5yZW1vdmVTZWdtZW50KHBhdGguc2VnbWVudHMubGVuZ3RoIC0gMSk7XG4gIHJldHVybiBwYXRoO1xufVxuXG4vLyBleHBvcnQgZnVuY3Rpb24gdHJ1ZVBhdGgocGF0aCkge1xuLy8gICAvLyBjb25zb2xlLmxvZyhncm91cCk7XG4vLyAgIC8vIGlmIChwYXRoICYmIHBhdGguY2hpbGRyZW4gJiYgcGF0aC5jaGlsZHJlbi5sZW5ndGggPiAwICYmIHBhdGguX25hbWVkQ2hpbGRyZW5bJ21pZGRsZSddKSB7XG4vLyAgIC8vICAgbGV0IHBhdGhDb3B5ID0gbmV3IFBhdGgoKTtcbi8vICAgLy8gICBjb25zb2xlLmxvZyhwYXRoLl9uYW1lZENoaWxkcmVuWydtaWRkbGUnXSk7XG4vLyAgIC8vICAgcGF0aENvcHkuY29weUNvbnRlbnQocGF0aC5fbmFtZWRDaGlsZHJlblsnbWlkZGxlJ10pO1xuLy8gICAvLyAgIGNvbnNvbGUubG9nKHBhdGhDb3B5KTtcbi8vICAgLy8gfVxuLy8gfVxuXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tQb3BzKCkge1xuICBsZXQgZ3JvdXBzID0gcGFwZXIucHJvamVjdC5nZXRJdGVtcyh7XG4gICAgY2xhc3NOYW1lOiAnR3JvdXAnLFxuICAgIG1hdGNoOiBmdW5jdGlvbihlbCkge1xuICAgICAgcmV0dXJuICghIWVsLmRhdGEgJiYgZWwuZGF0YS51cGRhdGUpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8vIGh0dHBzOi8vZ3JvdXBzLmdvb2dsZS5jb20vZm9ydW0vIyF0b3BpYy9wYXBlcmpzL1VEOEwwTVR5UmVRXG5leHBvcnQgZnVuY3Rpb24gb3ZlcmxhcHMocGF0aCwgb3RoZXIpIHtcbiAgcmV0dXJuICEocGF0aC5nZXRJbnRlcnNlY3Rpb25zKG90aGVyKS5sZW5ndGggPT09IDApO1xufVxuXG4vLyBodHRwczovL2dyb3Vwcy5nb29nbGUuY29tL2ZvcnVtLyMhdG9waWMvcGFwZXJqcy9VRDhMME1UeVJlUVxuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlT25lUGF0aChwYXRoLCBvdGhlcnMpIHtcbiAgbGV0IGksIG1lcmdlZCwgb3RoZXIsIHVuaW9uLCBfaSwgX2xlbiwgX3JlZjtcbiAgZm9yIChpID0gX2kgPSAwLCBfbGVuID0gb3RoZXJzLmxlbmd0aDsgX2kgPCBfbGVuOyBpID0gKytfaSkge1xuICAgIG90aGVyID0gb3RoZXJzW2ldO1xuICAgIGlmIChvdmVybGFwcyhwYXRoLCBvdGhlcikpIHtcbiAgICAgIHVuaW9uID0gcGF0aC51bml0ZShvdGhlcik7XG4gICAgICBtZXJnZWQgPSBtZXJnZU9uZVBhdGgodW5pb24sIG90aGVycy5zbGljZShpICsgMSkpO1xuICAgICAgcmV0dXJuIChfcmVmID0gb3RoZXJzLnNsaWNlKDAsIGkpKS5jb25jYXQuYXBwbHkoX3JlZiwgbWVyZ2VkKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG90aGVycy5jb25jYXQocGF0aCk7XG59O1xuXG4vLyBodHRwczovL2dyb3Vwcy5nb29nbGUuY29tL2ZvcnVtLyMhdG9waWMvcGFwZXJqcy9VRDhMME1UeVJlUVxuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlUGF0aHMocGF0aHMpIHtcbiAgdmFyIHBhdGgsIHJlc3VsdCwgX2ksIF9sZW47XG4gIHJlc3VsdCA9IFtdO1xuICBmb3IgKF9pID0gMCwgX2xlbiA9IHBhdGhzLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgcGF0aCA9IHBhdGhzW19pXTtcbiAgICByZXN1bHQgPSBtZXJnZU9uZVBhdGgocGF0aCwgcmVzdWx0KTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGhpdFRlc3RCb3VuZHMocG9pbnQsIGNoaWxkcmVuKSB7XG4gIGlmICghcG9pbnQpIHJldHVybiBudWxsO1xuXG4gIGZvciAobGV0IGkgPSBjaGlsZHJlbi5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGxldCBjaGlsZCA9IGNoaWxkcmVuW2ldO1xuICAgIGxldCBib3VuZHMgPSBjaGlsZC5zdHJva2VCb3VuZHM7XG4gICAgaWYgKHBvaW50LmlzSW5zaWRlKGNoaWxkLnN0cm9rZUJvdW5kcykpIHtcbiAgICAgIHJldHVybiBjaGlsZDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cbiJdfQ==
