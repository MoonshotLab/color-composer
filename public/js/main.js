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
var shape = require('./shape');
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
    var pathData = {};

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
      pathData[util.stringifyPoint(point)] = {
        point: point,
        first: true
      };
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
        pathData[util.stringifyPoint(point)] = {
          point: point,
          size: avgSize,
          speed: Math.abs(event.overallVelocity)
        };
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
      // bounds.simplify();

      middle.add(point);
      // middle.simplify();

      pathData[util.stringifyPoint(point)] = {
        point: point,
        last: true
      };

      middle.simplify();
      group.replaceWith(util.trueGroup(group));
      middle = group._namedChildren.middle[0];
      middle.strokeColor = group.strokeColor;
      middle.selected = true;

      // bounds.flatten(4);
      // bounds.smooth();

      // middle.flatten(4);
      // middle.reduce();


      // middle.simplify();

      var idealGeometry = shape.getIdealGeometry(pathData, middle);
      console.log(idealGeometry);
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

},{"./shape":3,"./util":4}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getIdealGeometry = getIdealGeometry;
var util = require('./util');

function getIdealGeometry(pathData, path) {
  Base.each(path.segments, function (segment, i) {
    var pointStr = util.stringifyPoint(segment.point);
    if (pointStr in pathData) {
      var pointData = pathData[pointStr];
    }
  });

  return null;
}

},{"./util":4}],4:[function(require,module,exports){
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
exports.stringifyPoint = stringifyPoint;
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
    middleCopy = trimPath(middleCopy, middle);
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
      middleCopy = trimPath(middleCopy, middle);
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

function trimPath(path, original) {
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
      console.log('original length:', totalLength);
      console.log('edited length:', path.length);
      if (path.length / totalLength <= 0.75) {
        console.log('returning original');
        return {
          v: original
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
    return original;
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

function stringifyPoint(point) {
  return point.x + ',' + point.y;
}

},{"./../../config":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjb25maWcuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9zaGFwZS5qcyIsInNyYy9qcy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxRQUFRLE9BQVIsR0FBa0I7QUFDaEIsVUFBUSxDQUFDLFNBQUQsRUFBWSxTQUFaLEVBQXVCLFNBQXZCLEVBQWtDLFNBQWxDLEVBQTZDLFNBQTdDLEVBQXdELFNBQXhELEVBQW1FLFNBQW5FLEVBQThFLFNBQTlFLEVBQXlGLFNBQXpGLEVBQW9HLFNBQXBHLEVBQStHLFNBQS9HLEVBQXlILFNBQXpILENBRFE7QUFFaEIsUUFBTSxDQUFDLFNBQUQsRUFBWSxTQUFaLEVBQXVCLFNBQXZCLEVBQWtDLFNBQWxDLEVBQTZDLFNBQTdDLENBRlU7QUFHaEIsYUFBVyxFQUhLO0FBSWhCLHFCQUFtQjtBQUpILENBQWxCOztBQU9BLFFBQVEsS0FBUixHQUFnQjtBQUNkLHNCQUFvQixHQUROO0FBRWQscUJBQW1CO0FBRkwsQ0FBaEI7Ozs7O0FDUEEsT0FBTyxHQUFQLEdBQWEsT0FBTyxHQUFQLElBQWM7QUFDekIsV0FBUyxDQUFDLFNBQUQsRUFBWSxTQUFaLEVBQXVCLFNBQXZCLEVBQWtDLFNBQWxDLEVBQTZDLFNBQTdDLEVBQXdELFNBQXhELEVBQW1FLFNBQW5FLEVBQThFLFNBQTlFLEVBQXlGLFNBQXpGLEVBQW9HLFNBQXBHLEVBQStHLFNBQS9HLEVBQTBILFNBQTFILEVBQXFJLFNBQXJJLEVBQWdKLFNBQWhKLEVBQTJKLFNBQTNKLEVBQXNLLFNBQXRLLENBRGdCO0FBRXpCLGdCQUFjLFNBRlc7QUFHekIsWUFBVSxFQUhlO0FBSXpCLFNBQU87QUFKa0IsQ0FBM0I7O0FBT0EsTUFBTSxPQUFOLENBQWMsTUFBZDs7QUFFQSxJQUFNLE9BQU8sUUFBUSxRQUFSLENBQWI7QUFDQSxJQUFNLFFBQVEsUUFBUSxTQUFSLENBQWQ7QUFD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QUFiLEVBQWdCLENBQWhCLENBQVIsRUFBNEIsTUFBNUIsQ0FBbUMsS0FBbkMsQ0FBeUMsSUFBekMsRUFBK0MsTUFBL0MsQ0FBUDtBQUNEO0FBQ0Y7QUFDRCxTQUFPLE9BQU8sTUFBUCxDQUFjLElBQWQsQ0FBUDtBQUNEOztBQUVEO0FBQ08sU0FBUyxVQUFULENBQW9CLEtBQXBCLEVBQTJCO0FBQ2hDLE1BQUksSUFBSixFQUFVLE1BQVYsRUFBa0IsRUFBbEIsRUFBc0IsSUFBdEI7QUFDQSxXQUFTLEVBQVQ7QUFDQSxPQUFLLEtBQUssQ0FBTCxFQUFRLE9BQU8sTUFBTSxNQUExQixFQUFrQyxLQUFLLElBQXZDLEVBQTZDLElBQTdDLEVBQW1EO0FBQ2pELFdBQU8sTUFBTSxFQUFOLENBQVA7QUFDQSxhQUFTLGFBQWEsSUFBYixFQUFtQixNQUFuQixDQUFUO0FBQ0Q7QUFDRCxTQUFPLE1BQVA7QUFDRDs7QUFFTSxTQUFTLGFBQVQsQ0FBdUIsS0FBdkIsRUFBOEIsUUFBOUIsRUFBd0M7QUFDN0MsTUFBSSxDQUFDLEtBQUwsRUFBWSxPQUFPLElBQVA7O0FBRVosT0FBSyxJQUFJLElBQUksU0FBUyxNQUFULEdBQWtCLENBQS9CLEVBQWtDLEtBQUssQ0FBdkMsRUFBMEMsR0FBMUMsRUFBK0M7QUFDN0MsUUFBSSxRQUFRLFNBQVMsQ0FBVCxDQUFaO0FBQ0EsUUFBSSxTQUFTLE1BQU0sWUFBbkI7QUFDQSxRQUFJLE1BQU0sUUFBTixDQUFlLE1BQU0sWUFBckIsQ0FBSixFQUF3QztBQUN0QyxhQUFPLEtBQVA7QUFDRDtBQUNGOztBQUVELFNBQU8sSUFBUDtBQUNEOztBQUVNLFNBQVMsY0FBVCxDQUF3QixLQUF4QixFQUErQjtBQUNwQyxTQUFVLE1BQU0sQ0FBaEIsU0FBcUIsTUFBTSxDQUEzQjtBQUNEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImV4cG9ydHMucGFsZXR0ZSA9IHtcbiAgY29sb3JzOiBbXCIjMjAxNzFDXCIsIFwiIzFFMkE0M1wiLCBcIiMyODM3N0RcIiwgXCIjMzUyNzQ3XCIsIFwiI0NBMkUyNlwiLCBcIiM5QTJBMUZcIiwgXCIjREE2QzI2XCIsIFwiIzQ1MzEyMVwiLCBcIiM5MTZBNDdcIiwgXCIjREFBRDI3XCIsIFwiIzdGN0QzMVwiLFwiIzJCNUUyRVwiXSxcbiAgcG9wczogW1wiIzAwQURFRlwiLCBcIiNGMjg1QTVcIiwgXCIjN0RDNTdGXCIsIFwiI0Y2RUIxNlwiLCBcIiNGNEVBRTBcIl0sXG4gIGNvbG9yU2l6ZTogMjAsXG4gIHNlbGVjdGVkQ29sb3JTaXplOiAzMFxufVxuXG5leHBvcnRzLnNoYXBlID0ge1xuICBleHRlbmRpbmdUaHJlc2hvbGQ6IDAuMSxcbiAgdHJpbW1pbmdUaHJlc2hvbGQ6IDAuMDc1LFxufVxuIiwid2luZG93LmthbiA9IHdpbmRvdy5rYW4gfHwge1xuICBwYWxldHRlOiBbXCIjMjAxNzFDXCIsIFwiIzFFMkE0M1wiLCBcIiMyODM3N0RcIiwgXCIjMzUyNzQ3XCIsIFwiI0YyODVBNVwiLCBcIiNDQTJFMjZcIiwgXCIjQjg0NTI2XCIsIFwiI0RBNkMyNlwiLCBcIiM0NTMxMjFcIiwgXCIjOTE2QTQ3XCIsIFwiI0VFQjY0MVwiLCBcIiNGNkVCMTZcIiwgXCIjN0Y3RDMxXCIsIFwiIzZFQUQ3OVwiLCBcIiMyQTQ2MjFcIiwgXCIjRjRFQUUwXCJdLFxuICBjdXJyZW50Q29sb3I6ICcjMjAxNzFDJyxcbiAgbnVtUGF0aHM6IDEwLFxuICBwYXRoczogW10sXG59O1xuXG5wYXBlci5pbnN0YWxsKHdpbmRvdyk7XG5cbmNvbnN0IHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcbmNvbnN0IHNoYXBlID0gcmVxdWlyZSgnLi9zaGFwZScpO1xuLy8gcmVxdWlyZSgncGFwZXItYW5pbWF0ZScpO1xuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgbGV0IE1PVkVTID0gW107IC8vIHN0b3JlIGdsb2JhbCBtb3ZlcyBsaXN0XG4gIC8vIG1vdmVzID0gW1xuICAvLyAgIHtcbiAgLy8gICAgICd0eXBlJzogJ2NvbG9yQ2hhbmdlJyxcbiAgLy8gICAgICdvbGQnOiAnIzIwMTcxQycsXG4gIC8vICAgICAnbmV3JzogJyNGMjg1QTUnXG4gIC8vICAgfSxcbiAgLy8gICB7XG4gIC8vICAgICAndHlwZSc6ICduZXdQYXRoJyxcbiAgLy8gICAgICdyZWYnOiAnPz8/JyAvLyB1dWlkPyBkb20gcmVmZXJlbmNlP1xuICAvLyAgIH0sXG4gIC8vICAge1xuICAvLyAgICAgJ3R5cGUnOiAncGF0aFRyYW5zZm9ybScsXG4gIC8vICAgICAncmVmJzogJz8/PycsIC8vIHV1aWQ/IGRvbSByZWZlcmVuY2U/XG4gIC8vICAgICAnb2xkJzogJ3JvdGF0ZSg5MGRlZylzY2FsZSgxLjUpJywgLy8gPz8/XG4gIC8vICAgICAnbmV3JzogJ3JvdGF0ZSgxMjBkZWcpc2NhbGUoLTAuNSknIC8vID8/P1xuICAvLyAgIH0sXG4gIC8vICAgLy8gb3RoZXJzP1xuICAvLyBdXG5cbiAgY29uc3QgJHdpbmRvdyA9ICQod2luZG93KTtcbiAgY29uc3QgJGJvZHkgPSAkKCdib2R5Jyk7XG4gIGNvbnN0ICRjYW52YXMgPSAkKCdjYW52YXMjbWFpbkNhbnZhcycpO1xuICBjb25zdCBydW5BbmltYXRpb25zID0gZmFsc2U7XG4gIGNvbnN0IHRyYW5zcGFyZW50ID0gbmV3IENvbG9yKDAsIDApO1xuXG4gIGxldCB2aWV3V2lkdGgsIHZpZXdIZWlnaHQ7XG5cbiAgZnVuY3Rpb24gaGl0VGVzdEJvdW5kcyhwb2ludCkge1xuICAgIHJldHVybiB1dGlsLmhpdFRlc3RCb3VuZHMocG9pbnQsIHBhcGVyLnByb2plY3QuYWN0aXZlTGF5ZXIuY2hpbGRyZW4pO1xuICB9XG5cbiAgZnVuY3Rpb24gaGl0VGVzdEdyb3VwQm91bmRzKHBvaW50KSB7XG4gICAgbGV0IGdyb3VwcyA9IHBhcGVyLnByb2plY3QuZ2V0SXRlbXMoe1xuICAgICAgY2xhc3NOYW1lOiAnR3JvdXAnXG4gICAgfSk7XG4gICAgcmV0dXJuIHV0aWwuaGl0VGVzdEJvdW5kcyhwb2ludCwgZ3JvdXBzKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRWaWV3VmFycygpIHtcbiAgICB2aWV3V2lkdGggPSBwYXBlci52aWV3LnZpZXdTaXplLndpZHRoO1xuICAgIHZpZXdIZWlnaHQgPSBwYXBlci52aWV3LnZpZXdTaXplLmhlaWdodDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRDb250cm9sUGFuZWwoKSB7XG4gICAgaW5pdENvbG9yUGFsZXR0ZSgpO1xuICAgIGluaXRDYW52YXNEcmF3KCk7XG4gICAgaW5pdE5ldygpO1xuICAgIGluaXRVbmRvKCk7XG4gICAgaW5pdFBsYXkoKTtcbiAgICBpbml0VGlwcygpO1xuICAgIGluaXRTaGFyZSgpO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdENvbG9yUGFsZXR0ZSgpIHtcbiAgICBjb25zdCAkcGFsZXR0ZVdyYXAgPSAkKCd1bC5wYWxldHRlLWNvbG9ycycpO1xuICAgIGNvbnN0ICRwYWxldHRlQ29sb3JzID0gJHBhbGV0dGVXcmFwLmZpbmQoJ2xpJyk7XG4gICAgY29uc3QgcGFsZXR0ZUNvbG9yU2l6ZSA9IDIwO1xuICAgIGNvbnN0IHBhbGV0dGVTZWxlY3RlZENvbG9yU2l6ZSA9IDMwO1xuICAgIGNvbnN0IHBhbGV0dGVTZWxlY3RlZENsYXNzID0gJ3BhbGV0dGUtc2VsZWN0ZWQnO1xuXG4gICAgLy8gaG9vayB1cCBjbGlja1xuICAgICAgJHBhbGV0dGVDb2xvcnMub24oJ2NsaWNrIHRhcCB0b3VjaCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGxldCAkc3ZnID0gJCh0aGlzKS5maW5kKCdzdmcucGFsZXR0ZS1jb2xvcicpO1xuXG4gICAgICAgICAgaWYgKCEkc3ZnLmhhc0NsYXNzKHBhbGV0dGVTZWxlY3RlZENsYXNzKSkge1xuICAgICAgICAgICAgJCgnLicgKyBwYWxldHRlU2VsZWN0ZWRDbGFzcylcbiAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKHBhbGV0dGVTZWxlY3RlZENsYXNzKVxuICAgICAgICAgICAgICAuYXR0cignd2lkdGgnLCBwYWxldHRlQ29sb3JTaXplKVxuICAgICAgICAgICAgICAuYXR0cignaGVpZ2h0JywgcGFsZXR0ZUNvbG9yU2l6ZSlcbiAgICAgICAgICAgICAgLmZpbmQoJ3JlY3QnKVxuICAgICAgICAgICAgICAuYXR0cigncngnLCAwKVxuICAgICAgICAgICAgICAuYXR0cigncnknLCAwKTtcblxuICAgICAgICAgICAgJHN2Zy5hZGRDbGFzcyhwYWxldHRlU2VsZWN0ZWRDbGFzcylcbiAgICAgICAgICAgICAgLmF0dHIoJ3dpZHRoJywgcGFsZXR0ZVNlbGVjdGVkQ29sb3JTaXplKVxuICAgICAgICAgICAgICAuYXR0cignaGVpZ2h0JywgcGFsZXR0ZVNlbGVjdGVkQ29sb3JTaXplKVxuICAgICAgICAgICAgICAuZmluZCgncmVjdCcpXG4gICAgICAgICAgICAgIC5hdHRyKCdyeCcsIHBhbGV0dGVTZWxlY3RlZENvbG9yU2l6ZSAvIDIpXG4gICAgICAgICAgICAgIC5hdHRyKCdyeScsIHBhbGV0dGVTZWxlY3RlZENvbG9yU2l6ZSAvIDIpXG5cbiAgICAgICAgICAgIHdpbmRvdy5rYW4uY3VycmVudENvbG9yID0gJHN2Zy5maW5kKCdyZWN0JykuYXR0cignZmlsbCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0Q2FudmFzRHJhdygpIHtcblxuICAgIHBhcGVyLnNldHVwKCRjYW52YXNbMF0pO1xuXG4gICAgbGV0IG1pZGRsZSwgYm91bmRzO1xuICAgIGxldCBwYXN0O1xuICAgIGxldCBzaXplcztcbiAgICAvLyBsZXQgcGF0aHMgPSBnZXRGcmVzaFBhdGhzKHdpbmRvdy5rYW4ubnVtUGF0aHMpO1xuICAgIGxldCB0b3VjaCA9IGZhbHNlO1xuICAgIGxldCBsYXN0Q2hpbGQ7XG4gICAgbGV0IHBhdGhEYXRhID0ge307XG5cbiAgICBmdW5jdGlvbiBwYW5TdGFydChldmVudCkge1xuICAgICAgcGFwZXIucHJvamVjdC5hY3RpdmVMYXllci5yZW1vdmVDaGlsZHJlbigpOyAvLyBSRU1PVkVcbiAgICAgIC8vIGRyYXdDaXJjbGUoKTtcblxuICAgICAgc2l6ZXMgPSBbXTtcblxuICAgICAgaWYgKHBpbmNoaW5nKSByZXR1cm47XG4gICAgICBpZiAoIShldmVudC5jaGFuZ2VkUG9pbnRlcnMgJiYgZXZlbnQuY2hhbmdlZFBvaW50ZXJzLmxlbmd0aCA+IDApKSByZXR1cm47XG4gICAgICBpZiAoZXZlbnQuY2hhbmdlZFBvaW50ZXJzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2V2ZW50LmNoYW5nZWRQb2ludGVycyA+IDEnKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcG9pbnRlciA9IGV2ZW50LmNlbnRlcjtcbiAgICAgIGNvbnN0IHBvaW50ID0gbmV3IFBvaW50KHBvaW50ZXIueCwgcG9pbnRlci55KTtcblxuICAgICAgYm91bmRzID0gbmV3IFBhdGgoe1xuICAgICAgICBzdHJva2VDb2xvcjogd2luZG93Lmthbi5jdXJyZW50Q29sb3IsXG4gICAgICAgIGZpbGxDb2xvcjogd2luZG93Lmthbi5jdXJyZW50Q29sb3IsXG4gICAgICAgIG5hbWU6ICdib3VuZHMnLFxuICAgICAgICB2aXNpYmxlOiBmYWxzZVxuICAgICAgfSk7XG5cbiAgICAgIG1pZGRsZSA9IG5ldyBQYXRoKHtcbiAgICAgICAgc3Ryb2tlQ29sb3I6IHdpbmRvdy5rYW4uY3VycmVudENvbG9yLFxuICAgICAgICBuYW1lOiAnbWlkZGxlJyxcbiAgICAgICAgc3Ryb2tlV2lkdGg6IDUsXG4gICAgICAgIHZpc2libGU6IHRydWUsXG4gICAgICAgIHN0cm9rZUNhcDogJ3JvdW5kJ1xuICAgICAgfSk7XG5cbiAgICAgIGJvdW5kcy5hZGQocG9pbnQpO1xuICAgICAgbWlkZGxlLmFkZChwb2ludCk7XG4gICAgICBwYXRoRGF0YVt1dGlsLnN0cmluZ2lmeVBvaW50KHBvaW50KV0gPSB7XG4gICAgICAgIHBvaW50OiBwb2ludCxcbiAgICAgICAgZmlyc3Q6IHRydWVcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3QgbWluID0gMTtcbiAgICBjb25zdCBtYXggPSAxNTtcbiAgICBjb25zdCBhbHBoYSA9IDAuMztcbiAgICBjb25zdCBtZW1vcnkgPSAxMDtcbiAgICB2YXIgY3VtRGlzdGFuY2UgPSAwO1xuICAgIGxldCBjdW1TaXplLCBhdmdTaXplO1xuICAgIGZ1bmN0aW9uIHBhbk1vdmUoZXZlbnQpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBpZiAocGluY2hpbmcpIHJldHVybjtcbiAgICAgIC8vIGNvbnNvbGUubG9nKGV2ZW50Lm92ZXJhbGxWZWxvY2l0eSk7XG4gICAgICAvLyBsZXQgdGhpc0Rpc3QgPSBwYXJzZUludChldmVudC5kaXN0YW5jZSk7XG4gICAgICAvLyBjdW1EaXN0YW5jZSArPSB0aGlzRGlzdDtcbiAgICAgIC8vXG4gICAgICAvLyBpZiAoY3VtRGlzdGFuY2UgPCAxMDApIHtcbiAgICAgIC8vICAgY29uc29sZS5sb2coJ2lnbm9yaW5nJyk7XG4gICAgICAvLyAgIHJldHVybjtcbiAgICAgIC8vIH0gZWxzZSB7XG4gICAgICAvLyAgIGN1bURpc3RhbmNlID0gMDtcbiAgICAgIC8vICAgY29uc29sZS5sb2coJ25vdCBpZ25vcmluZycpO1xuICAgICAgLy8gfVxuXG4gICAgICBjb25zdCBwb2ludGVyID0gZXZlbnQuY2VudGVyO1xuICAgICAgbGV0IHBvaW50ID0gbmV3IFBvaW50KHBvaW50ZXIueCwgcG9pbnRlci55KTtcblxuICAgICAgd2hpbGUgKHNpemVzLmxlbmd0aCA+IG1lbW9yeSkge1xuICAgICAgICBzaXplcy5zaGlmdCgpO1xuICAgICAgfVxuXG4gICAgICBsZXQgYm90dG9tWCwgYm90dG9tWSwgYm90dG9tLFxuICAgICAgICB0b3BYLCB0b3BZLCB0b3AsXG4gICAgICAgIHAwLCBwMSxcbiAgICAgICAgc3RlcCwgYW5nbGUsIGRpc3QsIHNpemU7XG5cbiAgICAgIGlmIChzaXplcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIC8vIG5vdCB0aGUgZmlyc3QgcG9pbnQsIHNvIHdlIGhhdmUgb3RoZXJzIHRvIGNvbXBhcmUgdG9cbiAgICAgICAgcDAgPSBwYXN0O1xuICAgICAgICBkaXN0ID0gdXRpbC5kZWx0YShwb2ludCwgcDApO1xuICAgICAgICBzaXplID0gZGlzdCAqIGFscGhhO1xuICAgICAgICAvLyBpZiAoc2l6ZSA+PSBtYXgpIHNpemUgPSBtYXg7XG4gICAgICAgIHNpemUgPSBNYXRoLm1heChNYXRoLm1pbihzaXplLCBtYXgpLCBtaW4pOyAvLyBjbGFtcCBzaXplIHRvIFttaW4sIG1heF1cbiAgICAgICAgLy8gc2l6ZSA9IG1heCAtIHNpemU7XG5cbiAgICAgICAgY3VtU2l6ZSA9IDA7XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgc2l6ZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICBjdW1TaXplICs9IHNpemVzW2pdO1xuICAgICAgICB9XG4gICAgICAgIGF2Z1NpemUgPSBNYXRoLnJvdW5kKCgoY3VtU2l6ZSAvIHNpemVzLmxlbmd0aCkgKyBzaXplKSAvIDIpO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhhdmdTaXplKTtcblxuICAgICAgICBhbmdsZSA9IE1hdGguYXRhbjIocG9pbnQueSAtIHAwLnksIHBvaW50LnggLSBwMC54KTsgLy8gcmFkXG5cbiAgICAgICAgLy8gUG9pbnQoYm90dG9tWCwgYm90dG9tWSkgaXMgYm90dG9tLCBQb2ludCh0b3BYLCB0b3BZKSBpcyB0b3BcbiAgICAgICAgYm90dG9tWCA9IHBvaW50LnggKyBNYXRoLmNvcyhhbmdsZSArIE1hdGguUEkvMikgKiBhdmdTaXplO1xuICAgICAgICBib3R0b21ZID0gcG9pbnQueSArIE1hdGguc2luKGFuZ2xlICsgTWF0aC5QSS8yKSAqIGF2Z1NpemU7XG4gICAgICAgIGJvdHRvbSA9IG5ldyBQb2ludChib3R0b21YLCBib3R0b21ZKTtcblxuICAgICAgICB0b3BYID0gcG9pbnQueCArIE1hdGguY29zKGFuZ2xlIC0gTWF0aC5QSS8yKSAqIGF2Z1NpemU7XG4gICAgICAgIHRvcFkgPSBwb2ludC55ICsgTWF0aC5zaW4oYW5nbGUgLSBNYXRoLlBJLzIpICogYXZnU2l6ZTtcbiAgICAgICAgdG9wID0gbmV3IFBvaW50KHRvcFgsIHRvcFkpO1xuXG4gICAgICAgIGJvdW5kcy5hZGQodG9wKTtcbiAgICAgICAgYm91bmRzLmluc2VydCgwLCBib3R0b20pO1xuICAgICAgICAvLyBib3VuZHMuc21vb3RoKCk7XG5cbiAgICAgICAgbWlkZGxlLmFkZChwb2ludCk7XG4gICAgICAgIHBhdGhEYXRhW3V0aWwuc3RyaW5naWZ5UG9pbnQocG9pbnQpXSA9IHtcbiAgICAgICAgICBwb2ludDogcG9pbnQsXG4gICAgICAgICAgc2l6ZTogYXZnU2l6ZSxcbiAgICAgICAgICBzcGVlZDogTWF0aC5hYnMoZXZlbnQub3ZlcmFsbFZlbG9jaXR5KVxuICAgICAgICB9O1xuICAgICAgICAvLyBtaWRkbGUuc21vb3RoKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBkb24ndCBoYXZlIGFueXRoaW5nIHRvIGNvbXBhcmUgdG9cbiAgICAgICAgZGlzdCA9IDE7XG4gICAgICAgIGFuZ2xlID0gMDtcblxuICAgICAgICBzaXplID0gZGlzdCAqIGFscGhhO1xuICAgICAgICBzaXplID0gTWF0aC5tYXgoTWF0aC5taW4oc2l6ZSwgbWF4KSwgbWluKTsgLy8gY2xhbXAgc2l6ZSB0byBbbWluLCBtYXhdXG4gICAgICB9XG5cbiAgICAgIHBhcGVyLnZpZXcuZHJhdygpO1xuXG4gICAgICBwYXN0ID0gcG9pbnQ7XG4gICAgICBzaXplcy5wdXNoKHNpemUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhbkVuZChldmVudCkge1xuICAgICAgaWYgKHBpbmNoaW5nKSByZXR1cm47XG5cbiAgICAgIGNvbnN0IHBvaW50ZXIgPSBldmVudC5jZW50ZXI7XG4gICAgICBjb25zdCBwb2ludCA9IG5ldyBQb2ludChwb2ludGVyLngsIHBvaW50ZXIueSk7XG5cbiAgICAgIGxldCBncm91cCA9IG5ldyBHcm91cChbYm91bmRzLCBtaWRkbGVdKTtcbiAgICAgIGdyb3VwLmRhdGEuY29sb3IgPSBib3VuZHMuZmlsbENvbG9yO1xuICAgICAgZ3JvdXAuZGF0YS51cGRhdGUgPSB0cnVlO1xuXG4gICAgICBib3VuZHMuYWRkKHBvaW50KTtcbiAgICAgIGJvdW5kcy5jbG9zZWQgPSB0cnVlO1xuICAgICAgLy8gYm91bmRzLnNpbXBsaWZ5KCk7XG5cbiAgICAgIG1pZGRsZS5hZGQocG9pbnQpO1xuICAgICAgLy8gbWlkZGxlLnNpbXBsaWZ5KCk7XG5cbiAgICAgIHBhdGhEYXRhW3V0aWwuc3RyaW5naWZ5UG9pbnQocG9pbnQpXSA9IHtcbiAgICAgICAgcG9pbnQ6IHBvaW50LFxuICAgICAgICBsYXN0OiB0cnVlXG4gICAgICB9O1xuXG4gICAgICBtaWRkbGUuc2ltcGxpZnkoKTtcbiAgICAgIGdyb3VwLnJlcGxhY2VXaXRoKHV0aWwudHJ1ZUdyb3VwKGdyb3VwKSk7XG4gICAgICBtaWRkbGUgPSBncm91cC5fbmFtZWRDaGlsZHJlbi5taWRkbGVbMF07XG4gICAgICBtaWRkbGUuc3Ryb2tlQ29sb3IgPSBncm91cC5zdHJva2VDb2xvcjtcbiAgICAgIG1pZGRsZS5zZWxlY3RlZCA9IHRydWU7XG5cbiAgICAgIC8vIGJvdW5kcy5mbGF0dGVuKDQpO1xuICAgICAgLy8gYm91bmRzLnNtb290aCgpO1xuXG4gICAgICAvLyBtaWRkbGUuZmxhdHRlbig0KTtcbiAgICAgIC8vIG1pZGRsZS5yZWR1Y2UoKTtcblxuXG4gICAgICAvLyBtaWRkbGUuc2ltcGxpZnkoKTtcblxuICAgICAgbGV0IGlkZWFsR2VvbWV0cnkgPSBzaGFwZS5nZXRJZGVhbEdlb21ldHJ5KHBhdGhEYXRhLCBtaWRkbGUpO1xuICAgICAgY29uc29sZS5sb2coaWRlYWxHZW9tZXRyeSk7XG4gICAgICAvLyBtaWRkbGUuc21vb3RoKHtcbiAgICAgIC8vICAgdHlwZTogJ2dlb21ldHJpYydcbiAgICAgIC8vIH0pO1xuICAgICAgLy8gbWlkZGxlLmZsYXR0ZW4oMTApO1xuICAgICAgLy8gbWlkZGxlLnNpbXBsaWZ5KCk7XG4gICAgICAvLyBtaWRkbGUuZmxhdHRlbigyMCk7XG4gICAgICAvLyBtaWRkbGUuc2ltcGxpZnkoKTtcbiAgICAgIC8vIG1pZGRsZS5mbGF0dGVuKCk7XG4gICAgICAvLyBtaWRkbGUuc2ltcGxpZnkoKTtcblxuICAgICAgLy8gbWlkZGxlLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgIC8vIG1pZGRsZS52aXNpYmxlID0gdHJ1ZTtcbiAgICAgIC8vIG1pZGRsZS5zdHJva2VDb2xvciA9ICdwaW5rJztcblxuXG4gICAgICBsZXQgaW50ZXJzZWN0aW9ucyA9IG1pZGRsZS5nZXRDcm9zc2luZ3MoKTtcbiAgICAgIGlmIChpbnRlcnNlY3Rpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLy8gd2UgY3JlYXRlIGEgY29weSBvZiB0aGUgcGF0aCBiZWNhdXNlIHJlc29sdmVDcm9zc2luZ3MoKSBzcGxpdHMgc291cmNlIHBhdGhcbiAgICAgICAgbGV0IHBhdGhDb3B5ID0gbmV3IFBhdGgoKTtcbiAgICAgICAgcGF0aENvcHkuY29weUNvbnRlbnQobWlkZGxlKTtcbiAgICAgICAgcGF0aENvcHkudmlzaWJsZSA9IGZhbHNlO1xuXG4gICAgICAgIGxldCBkaXZpZGVkUGF0aCA9IHBhdGhDb3B5LnJlc29sdmVDcm9zc2luZ3MoKTtcbiAgICAgICAgZGl2aWRlZFBhdGgudmlzaWJsZSA9IGZhbHNlO1xuXG5cbiAgICAgICAgbGV0IGVuY2xvc2VkTG9vcHMgPSB1dGlsLmZpbmRJbnRlcmlvckN1cnZlcyhkaXZpZGVkUGF0aCk7XG5cbiAgICAgICAgaWYgKGVuY2xvc2VkTG9vcHMpIHtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVuY2xvc2VkTG9vcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGVuY2xvc2VkTG9vcHNbaV0udmlzaWJsZSA9IHRydWU7XG4gICAgICAgICAgICBlbmNsb3NlZExvb3BzW2ldLmNsb3NlZCA9IHRydWU7XG4gICAgICAgICAgICBlbmNsb3NlZExvb3BzW2ldLmZpbGxDb2xvciA9IG5ldyBDb2xvcigwLCAwKTsgLy8gdHJhbnNwYXJlbnRcbiAgICAgICAgICAgIGVuY2xvc2VkTG9vcHNbaV0uZGF0YS5pbnRlcmlvciA9IHRydWU7XG4gICAgICAgICAgICBlbmNsb3NlZExvb3BzW2ldLmRhdGEudHJhbnNwYXJlbnQgPSB0cnVlO1xuICAgICAgICAgICAgLy8gZW5jbG9zZWRMb29wc1tpXS5ibGVuZE1vZGUgPSAnbXVsdGlwbHknO1xuICAgICAgICAgICAgZ3JvdXAuYWRkQ2hpbGQoZW5jbG9zZWRMb29wc1tpXSk7XG4gICAgICAgICAgICBlbmNsb3NlZExvb3BzW2ldLnNlbmRUb0JhY2soKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcGF0aENvcHkucmVtb3ZlKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBjb25zb2xlLmxvZygnbm8gaW50ZXJzZWN0aW9ucycpO1xuICAgICAgfVxuXG4gICAgICBncm91cC5kYXRhLmNvbG9yID0gYm91bmRzLmZpbGxDb2xvcjtcbiAgICAgIGdyb3VwLmRhdGEuc2NhbGUgPSAxOyAvLyBpbml0IHZhcmlhYmxlIHRvIHRyYWNrIHNjYWxlIGNoYW5nZXNcbiAgICAgIGdyb3VwLmRhdGEucm90YXRpb24gPSAwOyAvLyBpbml0IHZhcmlhYmxlIHRvIHRyYWNrIHJvdGF0aW9uIGNoYW5nZXNcblxuICAgICAgbGV0IGNoaWxkcmVuID0gZ3JvdXAuZ2V0SXRlbXMoe1xuICAgICAgICBtYXRjaDogZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgIHJldHVybiBpdGVtLm5hbWUgIT09ICdtaWRkbGUnXG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBjb25zb2xlLmxvZygnLS0tLS0nKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKGdyb3VwKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKGNoaWxkcmVuKTtcbiAgICAgIC8vIGdyb3VwLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgIGxldCB1bml0ZWRQYXRoID0gbmV3IFBhdGgoKTtcbiAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGggPiAxKSB7XG4gICAgICAgIGxldCBhY2N1bXVsYXRvciA9IG5ldyBQYXRoKCk7XG4gICAgICAgIGFjY3VtdWxhdG9yLmNvcHlDb250ZW50KGNoaWxkcmVuWzBdKTtcbiAgICAgICAgYWNjdW11bGF0b3IudmlzaWJsZSA9IGZhbHNlO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBsZXQgb3RoZXJQYXRoID0gbmV3IFBhdGgoKTtcbiAgICAgICAgICBvdGhlclBhdGguY29weUNvbnRlbnQoY2hpbGRyZW5baV0pO1xuICAgICAgICAgIG90aGVyUGF0aC52aXNpYmxlID0gZmFsc2U7XG5cbiAgICAgICAgICB1bml0ZWRQYXRoID0gYWNjdW11bGF0b3IudW5pdGUob3RoZXJQYXRoKTtcbiAgICAgICAgICBvdGhlclBhdGgucmVtb3ZlKCk7XG4gICAgICAgICAgYWNjdW11bGF0b3IgPSB1bml0ZWRQYXRoO1xuICAgICAgICB9XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGNoaWxkcmVuWzBdIGlzIHVuaXRlZCBncm91cFxuICAgICAgICB1bml0ZWRQYXRoLmNvcHlDb250ZW50KGNoaWxkcmVuWzBdKTtcbiAgICAgIH1cblxuICAgICAgdW5pdGVkUGF0aC52aXNpYmxlID0gZmFsc2U7XG4gICAgICB1bml0ZWRQYXRoLmRhdGEubmFtZSA9ICdtYXNrJztcblxuICAgICAgZ3JvdXAuYWRkQ2hpbGQodW5pdGVkUGF0aCk7XG4gICAgICB1bml0ZWRQYXRoLnNlbmRUb0JhY2soKTtcblxuICAgICAgLy8gbWlkZGxlLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgIC8vIG1pZGRsZS52aXNpYmxlID0gdHJ1ZTtcbiAgICAgIC8vIG1pZGRsZS5zdHJva2VDb2xvciA9ICdwaW5rJztcblxuICAgICAgbGFzdENoaWxkID0gZ3JvdXA7XG5cbiAgICAgIE1PVkVTLnB1c2goe1xuICAgICAgICB0eXBlOiAnbmV3R3JvdXAnLFxuICAgICAgICBpZDogZ3JvdXAuaWRcbiAgICAgIH0pO1xuXG4gICAgICBpZiAocnVuQW5pbWF0aW9ucykge1xuICAgICAgICBncm91cC5hbmltYXRlKFxuICAgICAgICAgIFt7XG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgIHNjYWxlOiAwLjlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXR0aW5nczoge1xuICAgICAgICAgICAgICBkdXJhdGlvbjogMTAwLFxuICAgICAgICAgICAgICBlYXNpbmc6IFwiZWFzZU91dFwiLFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICBzY2FsZTogMS4xMVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldHRpbmdzOiB7XG4gICAgICAgICAgICAgIGR1cmF0aW9uOiAxMDAsXG4gICAgICAgICAgICAgIGVhc2luZzogXCJlYXNlSW5cIlxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1dXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IHBpbmNoaW5nO1xuICAgIGxldCBwaW5jaGVkR3JvdXAsIGxhc3RTY2FsZSwgbGFzdFJvdGF0aW9uO1xuICAgIGxldCBvcmlnaW5hbFBvc2l0aW9uLCBvcmlnaW5hbFJvdGF0aW9uLCBvcmlnaW5hbFNjYWxlO1xuXG4gICAgZnVuY3Rpb24gcGluY2hTdGFydChldmVudCkge1xuICAgICAgY29uc29sZS5sb2coJ3BpbmNoU3RhcnQnLCBldmVudC5jZW50ZXIpO1xuICAgICAgaGFtbWVyTWFuYWdlci5nZXQoJ3BhbicpLnNldCh7ZW5hYmxlOiBmYWxzZX0pO1xuICAgICAgY29uc3QgcG9pbnRlciA9IGV2ZW50LmNlbnRlcixcbiAgICAgICAgICBwb2ludCA9IG5ldyBQb2ludChwb2ludGVyLngsIHBvaW50ZXIueSksXG4gICAgICAgICAgaGl0UmVzdWx0ID0gaGl0VGVzdEdyb3VwQm91bmRzKHBvaW50KTtcblxuICAgICAgaWYgKGhpdFJlc3VsdCkge1xuICAgICAgICBwaW5jaGluZyA9IHRydWU7XG4gICAgICAgIC8vIHBpbmNoZWRHcm91cCA9IGhpdFJlc3VsdC5pdGVtLnBhcmVudDtcbiAgICAgICAgcGluY2hlZEdyb3VwID0gaGl0UmVzdWx0O1xuICAgICAgICBsYXN0U2NhbGUgPSAxO1xuICAgICAgICBsYXN0Um90YXRpb24gPSBldmVudC5yb3RhdGlvbjtcblxuICAgICAgICBvcmlnaW5hbFBvc2l0aW9uID0gcGluY2hlZEdyb3VwLnBvc2l0aW9uO1xuICAgICAgICAvLyBvcmlnaW5hbFJvdGF0aW9uID0gcGluY2hlZEdyb3VwLnJvdGF0aW9uO1xuICAgICAgICBvcmlnaW5hbFJvdGF0aW9uID0gcGluY2hlZEdyb3VwLmRhdGEucm90YXRpb247XG4gICAgICAgIG9yaWdpbmFsU2NhbGUgPSBwaW5jaGVkR3JvdXAuZGF0YS5zY2FsZTtcblxuICAgICAgICBpZiAocnVuQW5pbWF0aW9ucykge1xuICAgICAgICAgIHBpbmNoZWRHcm91cC5hbmltYXRlKHtcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgc2NhbGU6IDEuMjVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXR0aW5nczoge1xuICAgICAgICAgICAgICBkdXJhdGlvbjogMTAwLFxuICAgICAgICAgICAgICBlYXNpbmc6IFwiZWFzZU91dFwiLFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwaW5jaGVkR3JvdXAgPSBudWxsO1xuICAgICAgICBjb25zb2xlLmxvZygnaGl0IG5vIGl0ZW0nKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwaW5jaE1vdmUoZXZlbnQpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdwaW5jaE1vdmUnKTtcbiAgICAgIGlmICghIXBpbmNoZWRHcm91cCkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZygncGluY2htb3ZlJywgZXZlbnQpO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhwaW5jaGVkR3JvdXApO1xuICAgICAgICBsZXQgY3VycmVudFNjYWxlID0gZXZlbnQuc2NhbGU7XG4gICAgICAgIGxldCBzY2FsZURlbHRhID0gY3VycmVudFNjYWxlIC8gbGFzdFNjYWxlO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhsYXN0U2NhbGUsIGN1cnJlbnRTY2FsZSwgc2NhbGVEZWx0YSk7XG4gICAgICAgIGxhc3RTY2FsZSA9IGN1cnJlbnRTY2FsZTtcblxuICAgICAgICBsZXQgY3VycmVudFJvdGF0aW9uID0gZXZlbnQucm90YXRpb247XG4gICAgICAgIGxldCByb3RhdGlvbkRlbHRhID0gY3VycmVudFJvdGF0aW9uIC0gbGFzdFJvdGF0aW9uO1xuICAgICAgICBjb25zb2xlLmxvZyhsYXN0Um90YXRpb24sIGN1cnJlbnRSb3RhdGlvbiwgcm90YXRpb25EZWx0YSk7XG4gICAgICAgIGxhc3RSb3RhdGlvbiA9IGN1cnJlbnRSb3RhdGlvbjtcblxuICAgICAgICAvLyBjb25zb2xlLmxvZyhgc2NhbGluZyBieSAke3NjYWxlRGVsdGF9YCk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGByb3RhdGluZyBieSAke3JvdGF0aW9uRGVsdGF9YCk7XG5cbiAgICAgICAgcGluY2hlZEdyb3VwLnBvc2l0aW9uID0gZXZlbnQuY2VudGVyO1xuICAgICAgICBwaW5jaGVkR3JvdXAuc2NhbGUoc2NhbGVEZWx0YSk7XG4gICAgICAgIHBpbmNoZWRHcm91cC5yb3RhdGUocm90YXRpb25EZWx0YSk7XG5cbiAgICAgICAgcGluY2hlZEdyb3VwLmRhdGEuc2NhbGUgKj0gc2NhbGVEZWx0YTtcbiAgICAgICAgcGluY2hlZEdyb3VwLmRhdGEucm90YXRpb24gKz0gcm90YXRpb25EZWx0YTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgbGFzdEV2ZW50O1xuICAgIGZ1bmN0aW9uIHBpbmNoRW5kKGV2ZW50KSB7XG4gICAgICAvLyB3YWl0IDI1MCBtcyB0byBwcmV2ZW50IG1pc3Rha2VuIHBhbiByZWFkaW5nc1xuICAgICAgbGFzdEV2ZW50ID0gZXZlbnQ7XG4gICAgICBpZiAoISFwaW5jaGVkR3JvdXApIHtcbiAgICAgICAgcGluY2hlZEdyb3VwLmRhdGEudXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgbGV0IG1vdmUgPSB7XG4gICAgICAgICAgaWQ6IHBpbmNoZWRHcm91cC5pZCxcbiAgICAgICAgICB0eXBlOiAndHJhbnNmb3JtJ1xuICAgICAgICB9O1xuICAgICAgICBpZiAocGluY2hlZEdyb3VwLnBvc2l0aW9uICE9IG9yaWdpbmFsUG9zaXRpb24pIHtcbiAgICAgICAgICBtb3ZlLnBvc2l0aW9uID0gb3JpZ2luYWxQb3NpdGlvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwaW5jaGVkR3JvdXAuZGF0YS5yb3RhdGlvbiAhPSBvcmlnaW5hbFJvdGF0aW9uKSB7XG4gICAgICAgICAgbW92ZS5yb3RhdGlvbiA9IG9yaWdpbmFsUm90YXRpb24gLSBwaW5jaGVkR3JvdXAuZGF0YS5yb3RhdGlvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwaW5jaGVkR3JvdXAuZGF0YS5zY2FsZSAhPSBvcmlnaW5hbFNjYWxlKSB7XG4gICAgICAgICAgbW92ZS5zY2FsZSA9IG9yaWdpbmFsU2NhbGUgLyBwaW5jaGVkR3JvdXAuZGF0YS5zY2FsZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnNvbGUubG9nKCdmaW5hbCBzY2FsZScsIHBpbmNoZWRHcm91cC5kYXRhLnNjYWxlKTtcbiAgICAgICAgY29uc29sZS5sb2cobW92ZSk7XG5cbiAgICAgICAgTU9WRVMucHVzaChtb3ZlKTtcblxuICAgICAgICBpZiAoTWF0aC5hYnMoZXZlbnQudmVsb2NpdHkpID4gMSkge1xuICAgICAgICAgIC8vIGRpc3Bvc2Ugb2YgZ3JvdXAgb2Zmc2NyZWVuXG4gICAgICAgICAgdGhyb3dQaW5jaGVkR3JvdXAoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIChydW5BbmltYXRpb25zKSB7XG4gICAgICAgIC8vICAgcGluY2hlZEdyb3VwLmFuaW1hdGUoe1xuICAgICAgICAvLyAgICAgcHJvcGVydGllczoge1xuICAgICAgICAvLyAgICAgICBzY2FsZTogMC44XG4gICAgICAgIC8vICAgICB9LFxuICAgICAgICAvLyAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgLy8gICAgICAgZHVyYXRpb246IDEwMCxcbiAgICAgICAgLy8gICAgICAgZWFzaW5nOiBcImVhc2VPdXRcIixcbiAgICAgICAgLy8gICAgIH1cbiAgICAgICAgLy8gICB9KTtcbiAgICAgICAgLy8gfVxuICAgICAgfVxuICAgICAgcGluY2hpbmcgPSBmYWxzZTtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIGhhbW1lck1hbmFnZXIuZ2V0KCdwYW4nKS5zZXQoe2VuYWJsZTogdHJ1ZX0pO1xuICAgICAgfSwgMjUwKTtcbiAgICB9XG5cbiAgICBjb25zdCBoaXRPcHRpb25zID0ge1xuICAgICAgc2VnbWVudHM6IGZhbHNlLFxuICAgICAgc3Ryb2tlOiB0cnVlLFxuICAgICAgZmlsbDogdHJ1ZSxcbiAgICAgIHRvbGVyYW5jZTogNVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBzaW5nbGVUYXAoZXZlbnQpIHtcbiAgICAgIGNvbnN0IHBvaW50ZXIgPSBldmVudC5jZW50ZXIsXG4gICAgICAgICAgcG9pbnQgPSBuZXcgUG9pbnQocG9pbnRlci54LCBwb2ludGVyLnkpLFxuICAgICAgICAgIGhpdFJlc3VsdCA9IHBhcGVyLnByb2plY3QuaGl0VGVzdChwb2ludCwgaGl0T3B0aW9ucyk7XG5cbiAgICAgIGlmIChoaXRSZXN1bHQpIHtcbiAgICAgICAgbGV0IGl0ZW0gPSBoaXRSZXN1bHQuaXRlbTtcbiAgICAgICAgaXRlbS5zZWxlY3RlZCA9ICFpdGVtLnNlbGVjdGVkO1xuICAgICAgICBjb25zb2xlLmxvZyhpdGVtKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkb3VibGVUYXAoZXZlbnQpIHtcbiAgICAgIGNvbnN0IHBvaW50ZXIgPSBldmVudC5jZW50ZXIsXG4gICAgICAgICAgcG9pbnQgPSBuZXcgUG9pbnQocG9pbnRlci54LCBwb2ludGVyLnkpLFxuICAgICAgICAgIGhpdFJlc3VsdCA9IHBhcGVyLnByb2plY3QuaGl0VGVzdChwb2ludCwgaGl0T3B0aW9ucyk7XG5cbiAgICAgIGlmIChoaXRSZXN1bHQpIHtcbiAgICAgICAgbGV0IGl0ZW0gPSBoaXRSZXN1bHQuaXRlbTtcbiAgICAgICAgbGV0IHBhcmVudCA9IGl0ZW0ucGFyZW50O1xuXG4gICAgICAgIGlmIChpdGVtLmRhdGEuaW50ZXJpb3IpIHtcbiAgICAgICAgICBpdGVtLmRhdGEudHJhbnNwYXJlbnQgPSAhaXRlbS5kYXRhLnRyYW5zcGFyZW50O1xuXG4gICAgICAgICAgaWYgKGl0ZW0uZGF0YS50cmFuc3BhcmVudCkge1xuICAgICAgICAgICAgaXRlbS5maWxsQ29sb3IgPSB0cmFuc3BhcmVudDtcbiAgICAgICAgICAgIGl0ZW0uc3Ryb2tlQ29sb3IgPSB0cmFuc3BhcmVudDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaXRlbS5maWxsQ29sb3IgPSBwYXJlbnQuZGF0YS5jb2xvcjtcbiAgICAgICAgICAgIGl0ZW0uc3Ryb2tlQ29sb3IgPSBwYXJlbnQuZGF0YS5jb2xvcjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBNT1ZFUy5wdXNoKHtcbiAgICAgICAgICAgIHR5cGU6ICdmaWxsQ2hhbmdlJyxcbiAgICAgICAgICAgIGlkOiBpdGVtLmlkLFxuICAgICAgICAgICAgZmlsbDogcGFyZW50LmRhdGEuY29sb3IsXG4gICAgICAgICAgICB0cmFuc3BhcmVudDogaXRlbS5kYXRhLnRyYW5zcGFyZW50XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ25vdCBpbnRlcmlvcicpXG4gICAgICAgIH1cblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGluY2hlZEdyb3VwID0gbnVsbDtcbiAgICAgICAgY29uc29sZS5sb2coJ2hpdCBubyBpdGVtJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgdmVsb2NpdHlNdWx0aXBsaWVyID0gMjU7XG4gICAgZnVuY3Rpb24gdGhyb3dQaW5jaGVkR3JvdXAoKSB7XG4gICAgICBjb25zb2xlLmxvZyhwaW5jaGVkR3JvdXAucG9zaXRpb24pO1xuICAgICAgaWYgKHBpbmNoZWRHcm91cC5wb3NpdGlvbi54IDw9IDAgLSBwaW5jaGVkR3JvdXAuYm91bmRzLndpZHRoIHx8XG4gICAgICAgICAgcGluY2hlZEdyb3VwLnBvc2l0aW9uLnggPj0gdmlld1dpZHRoICsgcGluY2hlZEdyb3VwLmJvdW5kcy53aWR0aCB8fFxuICAgICAgICAgIHBpbmNoZWRHcm91cC5wb3NpdGlvbi55IDw9IDAgLSBwaW5jaGVkR3JvdXAuYm91bmRzLmhlaWdodCB8fFxuICAgICAgICAgIHBpbmNoZWRHcm91cC5wb3NpdGlvbi55ID49IHZpZXdIZWlnaHQgKyBwaW5jaGVkR3JvdXAuYm91bmRzLmhlaWdodCkge1xuICAgICAgICAgICAgcGluY2hlZEdyb3VwLmRhdGEub2ZmU2NyZWVuID0gdHJ1ZTtcbiAgICAgICAgICAgIHBpbmNoZWRHcm91cC52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aHJvd1BpbmNoZWRHcm91cCk7XG4gICAgICBwaW5jaGVkR3JvdXAucG9zaXRpb24ueCArPSBsYXN0RXZlbnQudmVsb2NpdHlYICogdmVsb2NpdHlNdWx0aXBsaWVyO1xuICAgICAgcGluY2hlZEdyb3VwLnBvc2l0aW9uLnkgKz0gbGFzdEV2ZW50LnZlbG9jaXR5WSAqIHZlbG9jaXR5TXVsdGlwbGllcjtcbiAgICB9XG5cbiAgICB2YXIgaGFtbWVyTWFuYWdlciA9IG5ldyBIYW1tZXIuTWFuYWdlcigkY2FudmFzWzBdKTtcblxuICAgIGhhbW1lck1hbmFnZXIuYWRkKG5ldyBIYW1tZXIuVGFwKHsgZXZlbnQ6ICdkb3VibGV0YXAnLCB0YXBzOiAyIH0pKTtcbiAgICBoYW1tZXJNYW5hZ2VyLmFkZChuZXcgSGFtbWVyLlRhcCh7IGV2ZW50OiAnc2luZ2xldGFwJyB9KSk7XG4gICAgaGFtbWVyTWFuYWdlci5hZGQobmV3IEhhbW1lci5QYW4oeyBkaXJlY3Rpb246IEhhbW1lci5ESVJFQ1RJT05fQUxMIH0pKTtcbiAgICBoYW1tZXJNYW5hZ2VyLmFkZChuZXcgSGFtbWVyLlBpbmNoKCkpO1xuXG4gICAgaGFtbWVyTWFuYWdlci5nZXQoJ2RvdWJsZXRhcCcpLnJlY29nbml6ZVdpdGgoJ3NpbmdsZXRhcCcpO1xuICAgIGhhbW1lck1hbmFnZXIuZ2V0KCdzaW5nbGV0YXAnKS5yZXF1aXJlRmFpbHVyZSgnZG91YmxldGFwJyk7XG4gICAgaGFtbWVyTWFuYWdlci5nZXQoJ3BhbicpLnJlcXVpcmVGYWlsdXJlKCdwaW5jaCcpO1xuXG4gICAgaGFtbWVyTWFuYWdlci5vbignc2luZ2xldGFwJywgc2luZ2xlVGFwKTtcbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdkb3VibGV0YXAnLCBkb3VibGVUYXApO1xuXG4gICAgaGFtbWVyTWFuYWdlci5vbigncGFuc3RhcnQnLCBwYW5TdGFydCk7XG4gICAgaGFtbWVyTWFuYWdlci5vbigncGFubW92ZScsIHBhbk1vdmUpO1xuICAgIGhhbW1lck1hbmFnZXIub24oJ3BhbmVuZCcsIHBhbkVuZCk7XG5cbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdwaW5jaHN0YXJ0JywgcGluY2hTdGFydCk7XG4gICAgaGFtbWVyTWFuYWdlci5vbigncGluY2htb3ZlJywgcGluY2hNb3ZlKTtcbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdwaW5jaGVuZCcsIHBpbmNoRW5kKTtcbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdwaW5jaGNhbmNlbCcsIGZ1bmN0aW9uKCkgeyBoYW1tZXJNYW5hZ2VyLmdldCgncGFuJykuc2V0KHtlbmFibGU6IHRydWV9KTsgfSk7IC8vIG1ha2Ugc3VyZSBpdCdzIHJlZW5hYmxlZFxuICB9XG5cbiAgZnVuY3Rpb24gbmV3UHJlc3NlZCgpIHtcbiAgICBjb25zb2xlLmxvZygnbmV3IHByZXNzZWQnKTtcblxuICAgIHBhcGVyLnByb2plY3QuYWN0aXZlTGF5ZXIucmVtb3ZlQ2hpbGRyZW4oKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVuZG9QcmVzc2VkKCkge1xuICAgIGNvbnNvbGUubG9nKCd1bmRvIHByZXNzZWQnKTtcbiAgICBpZiAoIShNT1ZFUy5sZW5ndGggPiAwKSkge1xuICAgICAgY29uc29sZS5sb2coJ25vIG1vdmVzIHlldCcpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBsYXN0TW92ZSA9IE1PVkVTLnBvcCgpO1xuICAgIGxldCBpdGVtID0gcHJvamVjdC5nZXRJdGVtKHtcbiAgICAgIGlkOiBsYXN0TW92ZS5pZFxuICAgIH0pO1xuXG4gICAgaWYgKGl0ZW0pIHtcbiAgICAgIGl0ZW0udmlzaWJsZSA9IHRydWU7IC8vIG1ha2Ugc3VyZVxuICAgICAgc3dpdGNoKGxhc3RNb3ZlLnR5cGUpIHtcbiAgICAgICAgY2FzZSAnbmV3R3JvdXAnOlxuICAgICAgICAgIGNvbnNvbGUubG9nKCdyZW1vdmluZyBncm91cCcpO1xuICAgICAgICAgIGl0ZW0ucmVtb3ZlKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2ZpbGxDaGFuZ2UnOlxuICAgICAgICAgIGlmIChsYXN0TW92ZS50cmFuc3BhcmVudCkge1xuICAgICAgICAgICAgaXRlbS5maWxsQ29sb3IgPSBsYXN0TW92ZS5maWxsO1xuICAgICAgICAgICAgaXRlbS5zdHJva2VDb2xvciA9IGxhc3RNb3ZlLmZpbGw7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGl0ZW0uZmlsbENvbG9yID0gdHJhbnNwYXJlbnQ7XG4gICAgICAgICAgICBpdGVtLnN0cm9rZUNvbG9yID0gdHJhbnNwYXJlbnQ7XG4gICAgICAgICAgfVxuICAgICAgICBjYXNlICd0cmFuc2Zvcm0nOlxuICAgICAgICAgIGlmICghIWxhc3RNb3ZlLnBvc2l0aW9uKSB7XG4gICAgICAgICAgICBpdGVtLnBvc2l0aW9uID0gbGFzdE1vdmUucG9zaXRpb25cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCEhbGFzdE1vdmUucm90YXRpb24pIHtcbiAgICAgICAgICAgIGl0ZW0ucm90YXRpb24gPSBsYXN0TW92ZS5yb3RhdGlvbjtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCEhbGFzdE1vdmUuc2NhbGUpIHtcbiAgICAgICAgICAgIGl0ZW0uc2NhbGUobGFzdE1vdmUuc2NhbGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBjb25zb2xlLmxvZygndW5rbm93biBjYXNlJyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKCdjb3VsZCBub3QgZmluZCBtYXRjaGluZyBpdGVtJyk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcGxheVByZXNzZWQoKSB7XG4gICAgY29uc29sZS5sb2coJ3BsYXkgcHJlc3NlZCcpO1xuICB9XG5cbiAgZnVuY3Rpb24gdGlwc1ByZXNzZWQoKSB7XG4gICAgY29uc29sZS5sb2coJ3RpcHMgcHJlc3NlZCcpO1xuICB9XG5cbiAgZnVuY3Rpb24gc2hhcmVQcmVzc2VkKCkge1xuICAgIGNvbnNvbGUubG9nKCdzaGFyZSBwcmVzc2VkJyk7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0TmV3KCkge1xuICAgICQoJy5tYWluLWNvbnRyb2xzIC5uZXcnKS5vbignY2xpY2sgdGFwIHRvdWNoJywgbmV3UHJlc3NlZCk7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0VW5kbygpIHtcbiAgICAkKCcubWFpbi1jb250cm9scyAudW5kbycpLm9uKCdjbGljaycsIHVuZG9QcmVzc2VkKTtcbiAgfVxuICBmdW5jdGlvbiBpbml0UGxheSgpIHtcbiAgICAkKCcubWFpbi1jb250cm9scyAucGxheScpLm9uKCdjbGljaycsIHBsYXlQcmVzc2VkKTtcbiAgfVxuICBmdW5jdGlvbiBpbml0VGlwcygpIHtcbiAgICAkKCcuYXV4LWNvbnRyb2xzIC50aXBzJykub24oJ2NsaWNrJywgdGlwc1ByZXNzZWQpO1xuICB9XG4gIGZ1bmN0aW9uIGluaXRTaGFyZSgpIHtcbiAgICAkKCcuYXV4LWNvbnRyb2xzIC5zaGFyZScpLm9uKCdjbGljaycsIHNoYXJlUHJlc3NlZCk7XG4gIH1cblxuICBmdW5jdGlvbiBkcmF3Q2lyY2xlKCkge1xuICAgIGxldCBjaXJjbGUgPSBuZXcgUGF0aC5DaXJjbGUoe1xuICAgICAgY2VudGVyOiBbNDAwLCA0MDBdLFxuICAgICAgcmFkaXVzOiAxMDAsXG4gICAgICBzdHJva2VDb2xvcjogJ2dyZWVuJyxcbiAgICAgIGZpbGxDb2xvcjogJ2dyZWVuJ1xuICAgIH0pO1xuICAgIGxldCBncm91cCA9IG5ldyBHcm91cChjaXJjbGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gbWFpbigpIHtcbiAgICBpbml0Q29udHJvbFBhbmVsKCk7XG4gICAgLy8gZHJhd0NpcmNsZSgpO1xuICAgIGluaXRWaWV3VmFycygpO1xuICB9XG5cbiAgbWFpbigpO1xufSk7XG4iLCJjb25zdCB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRJZGVhbEdlb21ldHJ5KHBhdGhEYXRhLCBwYXRoKSB7XG4gIEJhc2UuZWFjaChwYXRoLnNlZ21lbnRzLCAoc2VnbWVudCwgaSkgPT4ge1xuICAgIGxldCBwb2ludFN0ciA9IHV0aWwuc3RyaW5naWZ5UG9pbnQoc2VnbWVudC5wb2ludCk7XG4gICAgaWYgKHBvaW50U3RyIGluIHBhdGhEYXRhKSB7XG4gICAgICBsZXQgcG9pbnREYXRhID0gcGF0aERhdGFbcG9pbnRTdHJdO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIG51bGw7XG59XG4iLCJjb25zdCBjb25maWcgPSByZXF1aXJlKCcuLy4uLy4uL2NvbmZpZycpO1xuXG4vLyBDb252ZXJ0cyBmcm9tIGRlZ3JlZXMgdG8gcmFkaWFucy5cbmV4cG9ydCBmdW5jdGlvbiByYWQoZGVncmVlcykge1xuICByZXR1cm4gZGVncmVlcyAqIE1hdGguUEkgLyAxODA7XG59O1xuXG4vLyBDb252ZXJ0cyBmcm9tIHJhZGlhbnMgdG8gZGVncmVlcy5cbmV4cG9ydCBmdW5jdGlvbiBkZWcocmFkaWFucykge1xuICByZXR1cm4gcmFkaWFucyAqIDE4MCAvIE1hdGguUEk7XG59O1xuXG4vLyBkaXN0YW5jZSBiZXR3ZWVuIHR3byBwb2ludHNcbmV4cG9ydCBmdW5jdGlvbiBkZWx0YShwMSwgcDIpIHtcbiAgcmV0dXJuIE1hdGguc3FydChNYXRoLnBvdyhwMS54IC0gcDIueCwgMikgKyBNYXRoLnBvdyhwMS55IC0gcDIueSwgMikpOyAvLyBweXRoYWdvcmVhbiFcbn1cblxuLy8gcmV0dXJucyBhbiBhcnJheSBvZiB0aGUgaW50ZXJpb3IgY3VydmVzIG9mIGEgZ2l2ZW4gY29tcG91bmQgcGF0aFxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRJbnRlcmlvckN1cnZlcyhwYXRoKSB7XG4gIGxldCBpbnRlcmlvckN1cnZlcyA9IFtdO1xuICBpZiAoIXBhdGggfHwgIXBhdGguY2hpbGRyZW4gfHwgIXBhdGguY2hpbGRyZW4ubGVuZ3RoKSByZXR1cm47XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXRoLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IGNoaWxkID0gcGF0aC5jaGlsZHJlbltpXTtcblxuICAgIGlmIChjaGlsZC5jbG9zZWQpe1xuICAgICAgaW50ZXJpb3JDdXJ2ZXMucHVzaChuZXcgUGF0aChjaGlsZC5zZWdtZW50cykpO1xuICAgIH1cbiAgfVxuXG4gIHBhdGgucmVtb3ZlKCk7XG4gIHJldHVybiBpbnRlcmlvckN1cnZlcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRydWVHcm91cChncm91cCkge1xuICBsZXQgYm91bmRzID0gZ3JvdXAuX25hbWVkQ2hpbGRyZW4uYm91bmRzWzBdLFxuICAgICAgbWlkZGxlID0gZ3JvdXAuX25hbWVkQ2hpbGRyZW4ubWlkZGxlWzBdO1xuXG4gIGxldCBpbnRlcnNlY3Rpb25zID0gbWlkZGxlLmdldEludGVyc2VjdGlvbnMoKTtcblxuICBsZXQgbWlkZGxlQ29weSA9IG5ldyBQYXRoKCk7XG4gIG1pZGRsZUNvcHkuY29weUNvbnRlbnQobWlkZGxlKTtcbiAgLy8gZGVidWdnZXI7XG5cbiAgaWYgKGludGVyc2VjdGlvbnMubGVuZ3RoID4gMCkge1xuICAgIC8vIHNlZSBpZiB3ZSBjYW4gdHJpbSB0aGUgcGF0aCB3aGlsZSBtYWludGFpbmluZyBpbnRlcnNlY3Rpb25zXG4gICAgLy8gY29uc29sZS5sb2coJ2ludGVyc2VjdGlvbnMhJyk7XG4gICAgLy8gbWlkZGxlQ29weS5zdHJva2VDb2xvciA9ICd5ZWxsb3cnO1xuICAgIG1pZGRsZUNvcHkgPSB0cmltUGF0aChtaWRkbGVDb3B5LCBtaWRkbGUpO1xuICAgIC8vIG1pZGRsZUNvcHkuc3Ryb2tlQ29sb3IgPSAnb3JhbmdlJztcbiAgfSBlbHNlIHtcbiAgICAvLyBleHRlbmQgZmlyc3QgYW5kIGxhc3Qgc2VnbWVudCBieSB0aHJlc2hvbGQsIHNlZSBpZiBpbnRlcnNlY3Rpb25cbiAgICAvLyBjb25zb2xlLmxvZygnbm8gaW50ZXJzZWN0aW9ucywgZXh0ZW5kaW5nIGZpcnN0IScpO1xuICAgIC8vIG1pZGRsZUNvcHkuc3Ryb2tlQ29sb3IgPSAneWVsbG93JztcbiAgICBtaWRkbGVDb3B5ID0gZXh0ZW5kUGF0aChtaWRkbGVDb3B5KTtcbiAgICAvLyBtaWRkbGVDb3B5LnN0cm9rZUNvbG9yID0gJ29yYW5nZSc7XG4gICAgbGV0IGludGVyc2VjdGlvbnMgPSBtaWRkbGVDb3B5LmdldEludGVyc2VjdGlvbnMoKTtcbiAgICBpZiAoaW50ZXJzZWN0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAvLyBtaWRkbGVDb3B5LnN0cm9rZUNvbG9yID0gJ3BpbmsnO1xuICAgICAgbWlkZGxlQ29weSA9IHRyaW1QYXRoKG1pZGRsZUNvcHksIG1pZGRsZSk7XG4gICAgICAvLyBtaWRkbGVDb3B5LnN0cm9rZUNvbG9yID0gJ2dyZWVuJztcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gbWlkZGxlQ29weS5zdHJva2VDb2xvciA9ICdyZWQnO1xuICAgICAgbWlkZGxlQ29weSA9IHJlbW92ZVBhdGhFeHRlbnNpb25zKG1pZGRsZUNvcHkpO1xuICAgICAgLy8gbWlkZGxlQ29weS5zdHJva2VDb2xvciA9ICdibHVlJztcbiAgICB9XG4gIH1cblxuICBtaWRkbGVDb3B5Lm5hbWUgPSAnbWlkZGxlJzsgLy8gbWFrZSBzdXJlXG5cbiAgLy8gZ3JvdXAuYWRkQ2hpbGQobWlkZGxlQ29weSk7XG4gIC8vIGdyb3VwLl9uYW1lZENoaWxkcmVuLm1pZGRsZVswXSA9IG1pZGRsZUNvcHk7XG4gIGdyb3VwLl9uYW1lZENoaWxkcmVuLm1pZGRsZVswXS5yZXBsYWNlV2l0aChtaWRkbGVDb3B5KTs7XG4gIHJldHVybiBncm91cDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4dGVuZFBhdGgocGF0aCkge1xuICBpZiAocGF0aC5sZW5ndGggPiAwKSB7XG4gICAgY29uc3QgbGVuZ3RoVG9sZXJhbmNlID0gY29uZmlnLnNoYXBlLnRyaW1taW5nVGhyZXNob2xkICogcGF0aC5sZW5ndGg7XG5cbiAgICBsZXQgZmlyc3RTZWdtZW50ID0gcGF0aC5maXJzdFNlZ21lbnQ7XG4gICAgbGV0IG5leHRTZWdtZW50ID0gZmlyc3RTZWdtZW50Lm5leHQ7XG4gICAgbGV0IHN0YXJ0QW5nbGUgPSBNYXRoLmF0YW4yKG5leHRTZWdtZW50LnBvaW50LnkgLSBmaXJzdFNlZ21lbnQucG9pbnQueSwgbmV4dFNlZ21lbnQucG9pbnQueCAtIGZpcnN0U2VnbWVudC5wb2ludC54KTsgLy8gcmFkXG4gICAgbGV0IGludmVyc2VTdGFydEFuZ2xlID0gc3RhcnRBbmdsZSArIE1hdGguUEk7XG4gICAgbGV0IGV4dGVuZGVkU3RhcnRQb2ludCA9IG5ldyBQb2ludChmaXJzdFNlZ21lbnQucG9pbnQueCArIChNYXRoLmNvcyhpbnZlcnNlU3RhcnRBbmdsZSkgKiBsZW5ndGhUb2xlcmFuY2UpLCBmaXJzdFNlZ21lbnQucG9pbnQueSArIChNYXRoLnNpbihpbnZlcnNlU3RhcnRBbmdsZSkgKiBsZW5ndGhUb2xlcmFuY2UpKTtcbiAgICBwYXRoLmluc2VydCgwLCBleHRlbmRlZFN0YXJ0UG9pbnQpO1xuXG4gICAgbGV0IGxhc3RTZWdtZW50ID0gcGF0aC5sYXN0U2VnbWVudDtcbiAgICBsZXQgcGVuU2VnbWVudCA9IGxhc3RTZWdtZW50LnByZXZpb3VzOyAvLyBwZW51bHRpbWF0ZVxuICAgIGxldCBlbmRBbmdsZSA9IE1hdGguYXRhbjIobGFzdFNlZ21lbnQucG9pbnQueSAtIHBlblNlZ21lbnQucG9pbnQueSwgbGFzdFNlZ21lbnQucG9pbnQueCAtIHBlblNlZ21lbnQucG9pbnQueCk7IC8vIHJhZFxuICAgIGxldCBleHRlbmRlZEVuZFBvaW50ID0gbmV3IFBvaW50KGxhc3RTZWdtZW50LnBvaW50LnggKyAoTWF0aC5jb3MoZW5kQW5nbGUpICogbGVuZ3RoVG9sZXJhbmNlKSwgbGFzdFNlZ21lbnQucG9pbnQueSArIChNYXRoLnNpbihlbmRBbmdsZSkgKiBsZW5ndGhUb2xlcmFuY2UpKTtcbiAgICBwYXRoLmFkZChleHRlbmRlZEVuZFBvaW50KTtcbiAgfVxuICByZXR1cm4gcGF0aDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRyaW1QYXRoKHBhdGgsIG9yaWdpbmFsKSB7XG4gIC8vIG9yaWdpbmFsUGF0aC5zdHJva2VDb2xvciA9ICdwaW5rJztcbiAgdHJ5IHtcbiAgICBsZXQgaW50ZXJzZWN0aW9ucyA9IHBhdGguZ2V0SW50ZXJzZWN0aW9ucygpO1xuICAgIGxldCBkaXZpZGVkUGF0aCA9IHBhdGgucmVzb2x2ZUNyb3NzaW5ncygpO1xuXG4gICAgY29uc3QgZXh0ZW5kaW5nVGhyZXNob2xkID0gY29uZmlnLnNoYXBlLmV4dGVuZGluZ1RocmVzaG9sZDtcbiAgICBjb25zdCB0b3RhbExlbmd0aCA9IHBhdGgubGVuZ3RoO1xuXG4gICAgLy8gd2Ugd2FudCB0byByZW1vdmUgYWxsIGNsb3NlZCBsb29wcyBmcm9tIHRoZSBwYXRoLCBzaW5jZSB0aGVzZSBhcmUgbmVjZXNzYXJpbHkgaW50ZXJpb3IgYW5kIG5vdCBmaXJzdCBvciBsYXN0XG4gICAgQmFzZS5lYWNoKGRpdmlkZWRQYXRoLmNoaWxkcmVuLCAoY2hpbGQsIGkpID0+IHtcbiAgICAgIGlmIChjaGlsZC5jbG9zZWQpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ3N1YnRyYWN0aW5nIGNsb3NlZCBjaGlsZCcpO1xuICAgICAgICBkaXZpZGVkUGF0aCA9IGRpdmlkZWRQYXRoLnN1YnRyYWN0KGNoaWxkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGRpdmlkZWRQYXRoID0gZGl2aWRlZFBhdGgudW5pdGUoY2hpbGQpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gY29uc29sZS5sb2coZGl2aWRlZFBhdGgpO1xuXG4gICAgaWYgKCEhZGl2aWRlZFBhdGguY2hpbGRyZW4gJiYgZGl2aWRlZFBhdGguY2hpbGRyZW4ubGVuZ3RoID4gMSkge1xuICAgICAgLy8gZGl2aWRlZCBwYXRoIGlzIGEgY29tcG91bmQgcGF0aFxuICAgICAgbGV0IHVuaXRlZERpdmlkZWRQYXRoID0gbmV3IFBhdGgoKTtcbiAgICAgIC8vIHVuaXRlZERpdmlkZWRQYXRoLmNvcHlBdHRyaWJ1dGVzKGRpdmlkZWRQYXRoKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdiZWZvcmUnLCB1bml0ZWREaXZpZGVkUGF0aCk7XG4gICAgICBCYXNlLmVhY2goZGl2aWRlZFBhdGguY2hpbGRyZW4sIChjaGlsZCwgaSkgPT4ge1xuICAgICAgICBpZiAoIWNoaWxkLmNsb3NlZCkge1xuICAgICAgICAgIHVuaXRlZERpdmlkZWRQYXRoID0gdW5pdGVkRGl2aWRlZFBhdGgudW5pdGUoY2hpbGQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGRpdmlkZWRQYXRoID0gdW5pdGVkRGl2aWRlZFBhdGg7XG4gICAgICAvLyBjb25zb2xlLmxvZygnYWZ0ZXInLCB1bml0ZWREaXZpZGVkUGF0aCk7XG4gICAgICAvLyByZXR1cm47XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdkaXZpZGVkUGF0aCBoYXMgb25lIGNoaWxkJyk7XG4gICAgfVxuXG4gICAgaWYgKGludGVyc2VjdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgLy8gd2UgaGF2ZSB0byBnZXQgdGhlIG5lYXJlc3QgbG9jYXRpb24gYmVjYXVzZSB0aGUgZXhhY3QgaW50ZXJzZWN0aW9uIHBvaW50IGhhcyBhbHJlYWR5IGJlZW4gcmVtb3ZlZCBhcyBhIHBhcnQgb2YgcmVzb2x2ZUNyb3NzaW5ncygpXG4gICAgICBsZXQgZmlyc3RJbnRlcnNlY3Rpb24gPSBkaXZpZGVkUGF0aC5nZXROZWFyZXN0TG9jYXRpb24oaW50ZXJzZWN0aW9uc1swXS5wb2ludCk7XG4gICAgICAvLyBjb25zb2xlLmxvZyhkaXZpZGVkUGF0aCk7XG4gICAgICBsZXQgcmVzdCA9IGRpdmlkZWRQYXRoLnNwbGl0QXQoZmlyc3RJbnRlcnNlY3Rpb24pOyAvLyBkaXZpZGVkUGF0aCBpcyBub3cgdGhlIGZpcnN0IHNlZ21lbnRcbiAgICAgIGxldCBmaXJzdFNlZ21lbnQgPSBkaXZpZGVkUGF0aDtcbiAgICAgIGxldCBsYXN0U2VnbWVudDtcblxuICAgICAgLy8gZmlyc3RTZWdtZW50LnN0cm9rZUNvbG9yID0gJ3BpbmsnO1xuXG4gICAgICAvLyBsZXQgY2lyY2xlT25lID0gbmV3IFBhdGguQ2lyY2xlKHtcbiAgICAgIC8vICAgY2VudGVyOiBmaXJzdEludGVyc2VjdGlvbi5wb2ludCxcbiAgICAgIC8vICAgcmFkaXVzOiA1LFxuICAgICAgLy8gICBzdHJva2VDb2xvcjogJ3JlZCdcbiAgICAgIC8vIH0pO1xuXG4gICAgICAvLyBjb25zb2xlLmxvZyhpbnRlcnNlY3Rpb25zKTtcbiAgICAgIGlmIChpbnRlcnNlY3Rpb25zLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ2ZvbycpO1xuICAgICAgICAvLyByZXN0LnJldmVyc2UoKTsgLy8gc3RhcnQgZnJvbSBlbmRcbiAgICAgICAgbGV0IGxhc3RJbnRlcnNlY3Rpb24gPSByZXN0LmdldE5lYXJlc3RMb2NhdGlvbihpbnRlcnNlY3Rpb25zW2ludGVyc2VjdGlvbnMubGVuZ3RoIC0gMV0ucG9pbnQpO1xuICAgICAgICAvLyBsZXQgY2lyY2xlVHdvID0gbmV3IFBhdGguQ2lyY2xlKHtcbiAgICAgICAgLy8gICBjZW50ZXI6IGxhc3RJbnRlcnNlY3Rpb24ucG9pbnQsXG4gICAgICAgIC8vICAgcmFkaXVzOiA1LFxuICAgICAgICAvLyAgIHN0cm9rZUNvbG9yOiAnZ3JlZW4nXG4gICAgICAgIC8vIH0pO1xuICAgICAgICBsYXN0U2VnbWVudCA9IHJlc3Quc3BsaXRBdChsYXN0SW50ZXJzZWN0aW9uKTsgLy8gcmVzdCBpcyBub3cgZXZlcnl0aGluZyBCVVQgdGhlIGZpcnN0IGFuZCBsYXN0IHNlZ21lbnRzXG4gICAgICAgIGlmICghbGFzdFNlZ21lbnQgfHwgIWxhc3RTZWdtZW50Lmxlbmd0aCkgbGFzdFNlZ21lbnQgPSByZXN0O1xuICAgICAgICByZXN0LnJldmVyc2UoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxhc3RTZWdtZW50ID0gcmVzdDtcbiAgICAgIH1cblxuICAgICAgaWYgKCEhZmlyc3RTZWdtZW50ICYmIGZpcnN0U2VnbWVudC5sZW5ndGggPD0gZXh0ZW5kaW5nVGhyZXNob2xkICogdG90YWxMZW5ndGgpIHtcbiAgICAgICAgcGF0aCA9IHBhdGguc3VidHJhY3QoZmlyc3RTZWdtZW50KTtcbiAgICAgICAgaWYgKHBhdGguY2xhc3NOYW1lID09PSAnQ29tcG91bmRQYXRoJykge1xuICAgICAgICAgIEJhc2UuZWFjaChwYXRoLmNoaWxkcmVuLCAoY2hpbGQsIGkpID0+IHtcbiAgICAgICAgICAgIGlmICghY2hpbGQuY2xvc2VkKSB7XG4gICAgICAgICAgICAgIGNoaWxkLnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICghIWxhc3RTZWdtZW50ICYmIGxhc3RTZWdtZW50Lmxlbmd0aCA8PSBleHRlbmRpbmdUaHJlc2hvbGQgKiB0b3RhbExlbmd0aCkge1xuICAgICAgICBwYXRoID0gcGF0aC5zdWJ0cmFjdChsYXN0U2VnbWVudCk7XG4gICAgICAgIGlmIChwYXRoLmNsYXNzTmFtZSA9PT0gJ0NvbXBvdW5kUGF0aCcpIHtcbiAgICAgICAgICBCYXNlLmVhY2gocGF0aC5jaGlsZHJlbiwgKGNoaWxkLCBpKSA9PiB7XG4gICAgICAgICAgICBpZiAoIWNoaWxkLmNsb3NlZCkge1xuICAgICAgICAgICAgICBjaGlsZC5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHRoaXMgaXMgaGFja3kgYnV0IEknbSBub3Qgc3VyZSBob3cgdG8gZ2V0IGFyb3VuZCBpdFxuICAgIC8vIHNvbWV0aW1lcyBwYXRoLnN1YnRyYWN0KCkgcmV0dXJucyBhIGNvbXBvdW5kIHBhdGgsIHdpdGggY2hpbGRyZW4gY29uc2lzdGluZyBvZiB0aGUgY2xvc2VkIHBhdGggSSB3YW50IGFuZCBhbm90aGVyIGV4dHJhbmVvdXMgY2xvc2VkIHBhdGhcbiAgICAvLyBpdCBhcHBlYXJzIHRoYXQgdGhlIGNvcnJlY3QgcGF0aCBhbHdheXMgaGFzIGEgaGlnaGVyIHZlcnNpb24sIHRob3VnaCBJJ20gbm90IDEwMCUgc3VyZSB0aGF0IHRoaXMgaXMgYWx3YXlzIHRoZSBjYXNlXG5cbiAgICBpZiAocGF0aC5jbGFzc05hbWUgPT09ICdDb21wb3VuZFBhdGgnICYmIHBhdGguY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgaWYgKHBhdGguY2hpbGRyZW4ubGVuZ3RoID4gMSkge1xuICAgICAgICBsZXQgbGFyZ2VzdENoaWxkO1xuICAgICAgICBsZXQgbGFyZ2VzdENoaWxkQXJlYSA9IDA7XG5cbiAgICAgICAgQmFzZS5lYWNoKHBhdGguY2hpbGRyZW4sIChjaGlsZCwgaSkgPT4ge1xuICAgICAgICAgIGlmIChjaGlsZC5hcmVhID4gbGFyZ2VzdENoaWxkQXJlYSkge1xuICAgICAgICAgICAgbGFyZ2VzdENoaWxkQXJlYSA9IGNoaWxkLmFyZWE7XG4gICAgICAgICAgICBsYXJnZXN0Q2hpbGQgPSBjaGlsZDtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChsYXJnZXN0Q2hpbGQpIHtcbiAgICAgICAgICBwYXRoID0gbGFyZ2VzdENoaWxkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBhdGggPSBwYXRoLmNoaWxkcmVuWzBdO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYXRoID0gcGF0aC5jaGlsZHJlblswXTtcbiAgICAgIH1cbiAgICAgIC8vIGNvbnNvbGUubG9nKHBhdGgpO1xuICAgICAgLy8gY29uc29sZS5sb2cocGF0aC5sYXN0Q2hpbGQpO1xuICAgICAgLy8gcGF0aC5maXJzdENoaWxkLnN0cm9rZUNvbG9yID0gJ3BpbmsnO1xuICAgICAgLy8gcGF0aC5sYXN0Q2hpbGQuc3Ryb2tlQ29sb3IgPSAnZ3JlZW4nO1xuICAgICAgLy8gcGF0aCA9IHBhdGgubGFzdENoaWxkOyAvLyByZXR1cm4gbGFzdCBjaGlsZD9cbiAgICAgIC8vIGZpbmQgaGlnaGVzdCB2ZXJzaW9uXG4gICAgICAvL1xuICAgICAgLy8gY29uc29sZS5sb2cocmVhbFBhdGhWZXJzaW9uKTtcbiAgICAgIC8vXG4gICAgICAvLyBCYXNlLmVhY2gocGF0aC5jaGlsZHJlbiwgKGNoaWxkLCBpKSA9PiB7XG4gICAgICAvLyAgIGlmIChjaGlsZC52ZXJzaW9uID09IHJlYWxQYXRoVmVyc2lvbikge1xuICAgICAgLy8gICAgIGNvbnNvbGUubG9nKCdyZXR1cm5pbmcgY2hpbGQnKTtcbiAgICAgIC8vICAgICByZXR1cm4gY2hpbGQ7XG4gICAgICAvLyAgIH1cbiAgICAgIC8vIH0pXG4gICAgfVxuICAgIGNvbnNvbGUubG9nKCdvcmlnaW5hbCBsZW5ndGg6JywgdG90YWxMZW5ndGgpO1xuICAgIGNvbnNvbGUubG9nKCdlZGl0ZWQgbGVuZ3RoOicsIHBhdGgubGVuZ3RoKTtcbiAgICBpZiAocGF0aC5sZW5ndGggLyB0b3RhbExlbmd0aCA8PSAwLjc1KSB7XG4gICAgICBjb25zb2xlLmxvZygncmV0dXJuaW5nIG9yaWdpbmFsJyk7XG4gICAgICByZXR1cm4gb3JpZ2luYWw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBwYXRoO1xuICAgIH1cbiAgfSBjYXRjaChlKSB7XG4gICAgY29uc29sZS5lcnJvcihlKTtcbiAgICByZXR1cm4gb3JpZ2luYWw7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZVBhdGhFeHRlbnNpb25zKHBhdGgpIHtcbiAgcGF0aC5yZW1vdmVTZWdtZW50KDApO1xuICBwYXRoLnJlbW92ZVNlZ21lbnQocGF0aC5zZWdtZW50cy5sZW5ndGggLSAxKTtcbiAgcmV0dXJuIHBhdGg7XG59XG5cbi8vIGV4cG9ydCBmdW5jdGlvbiB0cnVlUGF0aChwYXRoKSB7XG4vLyAgIC8vIGNvbnNvbGUubG9nKGdyb3VwKTtcbi8vICAgLy8gaWYgKHBhdGggJiYgcGF0aC5jaGlsZHJlbiAmJiBwYXRoLmNoaWxkcmVuLmxlbmd0aCA+IDAgJiYgcGF0aC5fbmFtZWRDaGlsZHJlblsnbWlkZGxlJ10pIHtcbi8vICAgLy8gICBsZXQgcGF0aENvcHkgPSBuZXcgUGF0aCgpO1xuLy8gICAvLyAgIGNvbnNvbGUubG9nKHBhdGguX25hbWVkQ2hpbGRyZW5bJ21pZGRsZSddKTtcbi8vICAgLy8gICBwYXRoQ29weS5jb3B5Q29udGVudChwYXRoLl9uYW1lZENoaWxkcmVuWydtaWRkbGUnXSk7XG4vLyAgIC8vICAgY29uc29sZS5sb2cocGF0aENvcHkpO1xuLy8gICAvLyB9XG4vLyB9XG5cbmV4cG9ydCBmdW5jdGlvbiBjaGVja1BvcHMoKSB7XG4gIGxldCBncm91cHMgPSBwYXBlci5wcm9qZWN0LmdldEl0ZW1zKHtcbiAgICBjbGFzc05hbWU6ICdHcm91cCcsXG4gICAgbWF0Y2g6IGZ1bmN0aW9uKGVsKSB7XG4gICAgICByZXR1cm4gKCEhZWwuZGF0YSAmJiBlbC5kYXRhLnVwZGF0ZSk7XG4gICAgfVxuICB9KTtcbn1cblxuLy8gaHR0cHM6Ly9ncm91cHMuZ29vZ2xlLmNvbS9mb3J1bS8jIXRvcGljL3BhcGVyanMvVUQ4TDBNVHlSZVFcbmV4cG9ydCBmdW5jdGlvbiBvdmVybGFwcyhwYXRoLCBvdGhlcikge1xuICByZXR1cm4gIShwYXRoLmdldEludGVyc2VjdGlvbnMob3RoZXIpLmxlbmd0aCA9PT0gMCk7XG59XG5cbi8vIGh0dHBzOi8vZ3JvdXBzLmdvb2dsZS5jb20vZm9ydW0vIyF0b3BpYy9wYXBlcmpzL1VEOEwwTVR5UmVRXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VPbmVQYXRoKHBhdGgsIG90aGVycykge1xuICBsZXQgaSwgbWVyZ2VkLCBvdGhlciwgdW5pb24sIF9pLCBfbGVuLCBfcmVmO1xuICBmb3IgKGkgPSBfaSA9IDAsIF9sZW4gPSBvdGhlcnMubGVuZ3RoOyBfaSA8IF9sZW47IGkgPSArK19pKSB7XG4gICAgb3RoZXIgPSBvdGhlcnNbaV07XG4gICAgaWYgKG92ZXJsYXBzKHBhdGgsIG90aGVyKSkge1xuICAgICAgdW5pb24gPSBwYXRoLnVuaXRlKG90aGVyKTtcbiAgICAgIG1lcmdlZCA9IG1lcmdlT25lUGF0aCh1bmlvbiwgb3RoZXJzLnNsaWNlKGkgKyAxKSk7XG4gICAgICByZXR1cm4gKF9yZWYgPSBvdGhlcnMuc2xpY2UoMCwgaSkpLmNvbmNhdC5hcHBseShfcmVmLCBtZXJnZWQpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gb3RoZXJzLmNvbmNhdChwYXRoKTtcbn07XG5cbi8vIGh0dHBzOi8vZ3JvdXBzLmdvb2dsZS5jb20vZm9ydW0vIyF0b3BpYy9wYXBlcmpzL1VEOEwwTVR5UmVRXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VQYXRocyhwYXRocykge1xuICB2YXIgcGF0aCwgcmVzdWx0LCBfaSwgX2xlbjtcbiAgcmVzdWx0ID0gW107XG4gIGZvciAoX2kgPSAwLCBfbGVuID0gcGF0aHMubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICBwYXRoID0gcGF0aHNbX2ldO1xuICAgIHJlc3VsdCA9IG1lcmdlT25lUGF0aChwYXRoLCByZXN1bHQpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gaGl0VGVzdEJvdW5kcyhwb2ludCwgY2hpbGRyZW4pIHtcbiAgaWYgKCFwb2ludCkgcmV0dXJuIG51bGw7XG5cbiAgZm9yIChsZXQgaSA9IGNoaWxkcmVuLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgbGV0IGNoaWxkID0gY2hpbGRyZW5baV07XG4gICAgbGV0IGJvdW5kcyA9IGNoaWxkLnN0cm9rZUJvdW5kcztcbiAgICBpZiAocG9pbnQuaXNJbnNpZGUoY2hpbGQuc3Ryb2tlQm91bmRzKSkge1xuICAgICAgcmV0dXJuIGNoaWxkO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5naWZ5UG9pbnQocG9pbnQpIHtcbiAgcmV0dXJuIGAke3BvaW50Lnh9LCR7cG9pbnQueX1gO1xufVxuIl19
