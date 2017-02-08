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
  trimmingThreshold: 0.075,
  cornerThresholdDeg: 10
};

exports.log = true;

},{}],2:[function(require,module,exports){
"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

window.kan = window.kan || {
  palette: ["#20171C", "#1E2A43", "#28377D", "#352747", "#F285A5", "#CA2E26", "#B84526", "#DA6C26", "#453121", "#916A47", "#EEB641", "#F6EB16", "#7F7D31", "#6EAD79", "#2A4621", "#F4EAE0"],
  currentColor: '#20171C',
  numPaths: 10,
  paths: []
};

paper.install(window);

var util = require('./util');
var shape = require('./shape');
var config = require('./../../config');
// require('paper-animate');

function log(thing) {
  util.log(thing);
}

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
  var thresholdAngle = util.rad(config.shape.cornerThresholdDeg);

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
    var sizes = void 0;
    // let paths = getFreshPaths(window.kan.numPaths);
    var touch = false;
    var lastChild = void 0;
    var pathData = {};
    var prevAngle = void 0,
        prevPoint = void 0;

    var sides = void 0;
    var side = void 0;

    var corners = void 0;

    function panStart(event) {
      paper.project.activeLayer.removeChildren(); // REMOVE
      // drawCircle();

      sizes = [];
      prevAngle = Math.atan2(event.velocityY, event.velocityX);

      if (pinching) return;
      if (!(event.changedPointers && event.changedPointers.length > 0)) return;
      if (event.changedPointers.length > 1) {
        log('event.changedPointers > 1');
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

      prevPoint = point;
      corners = [point];

      sides = [];
      side = [point];

      pathData[shape.stringifyPoint(point)] = {
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
      // log(event.overallVelocity);
      // let thisDist = parseInt(event.distance);
      // cumDistance += thisDist;
      //
      // if (cumDistance < 100) {
      //   log('ignoring');
      //   return;
      // } else {
      //   cumDistance = 0;
      //   log('not ignoring');
      // }

      var pointer = event.center;
      var point = new Point(pointer.x, pointer.y);

      // angle = -1 * event.angle; // make up positive rather than negative
      // angle = angle += 180;
      // console.log(event.velocityX, event.velocityY);
      angle = Math.atan2(event.velocityY, event.velocityX);
      var angleDelta = util.angleDelta(angle, prevAngle);
      prevAngle = angle;

      if (angleDelta > thresholdAngle) {
        if (side.length > 0) {
          // console.log('corner');
          var cornerPoint = point;
          // new Path.Circle({
          //   center: cornerPoint,
          //   radius: 15,
          //   strokeColor: 'black'
          // });
          corners.push(cornerPoint);
          sides.push(side);
          side = [];
        }
      }
      side.push(point);
      // let angleDeg = -1 * event.angle;
      // if (angleDeg < 0) angleDeg += 360; // normalize to [0, 360)
      // angle = util.rad(angleDeg);
      //
      // // let angleDelta = Math.atan2(Math.sin(angle), Math.cos(angle)) - Math.atan2(Math.sin(prevAngle), Math.cos(prevAngle));
      // console.log(angle, prevAngle);
      // // console.log(angleDelta);

      // console.log(angle);

      // let angleDelta = Math.abs(prevAngle - angle);
      // if (angleDelta > 360) angleDelta = angleDelta - 360;
      // if (angleDelta > 90) {
      //   console.log(angle, prevAngle, angleDelta);
      //   console.error('corner!');
      // } else {
      //   // console.log(angleDelta);
      // }

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
        p0 = prevPoint;
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
        // log(avgSize);

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
        pathData[shape.stringifyPoint(point)] = {
          point: point,
          size: avgSize,
          speed: Math.abs(event.overallVelocity)
        };
        // if (shape.stringifyPoint(point) in pathData) {
        //   log('duplicate!');
        // } else {
        // }
        // middle.smooth();
      } else {
        // don't have anything to compare to
        dist = 1;
        angle = 0;

        size = dist * alpha;
        size = Math.max(Math.min(size, max), min); // clamp size to [min, max]
        pathData[shape.stringifyPoint(point)] = {
          point: point,
          speed: Math.abs(event.overallVelocity)
        };
      }

      paper.view.draw();

      prevPoint = point;
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

      side.push(point);
      sides.push(side);

      pathData[shape.stringifyPoint(point)] = {
        point: point,
        last: true
      };

      corners.push(point);

      // middle.simplify();
      middle.reduce();

      var _util$trueGroup = util.trueGroup(group, corners),
          _util$trueGroup2 = _slicedToArray(_util$trueGroup, 2),
          truedGroup = _util$trueGroup2[0],
          trueWasNecessary = _util$trueGroup2[1];

      group.replaceWith(truedGroup);
      middle = group._namedChildren.middle[0];
      middle.strokeColor = group.strokeColor;
      // middle.selected = true;

      // bounds.flatten(4);
      // bounds.smooth();

      // middle.flatten(4);
      // middle.reduce();

      // middle.simplify();
      if (trueWasNecessary) {
        var computedCorners = shape.getComputedCorners(middle);
        var computedCornersPath = new Path(computedCorners);
        computedCornersPath.visible = false;
        var computedCornersPathLength = computedCornersPath.length;
        if (Math.abs(computedCornersPathLength - middle.length) / middle.length <= 0.1) {
          middle.segments = computedCorners;
          // middle.reduce();
        }
      }

      middle.reduce();

      // middle.selected = false;
      // middle.visible = true;
      // middle.strokeColor = 'pink';
      // middle.strokeWeight = 50;


      // let mergedCorners = corners.concat(computedCorners);
      // let foo = new Path(mergedCorners);
      // foo.strokeWidth = 5;
      // foo.strokeColor = 'blue';
      // let cornersPath = new Path({
      //   strokeWidth: 5,
      //   strokeColor: 'red'
      // });
      // Base.each(mergedCorners, (corner, i) => {
      //   cornersPath.add(corner);
      //   // if (i < 2) {
      //   //   cornersPath.add(corner);
      //   // } else {
      //   //   let closestPoint = cornersPath.getNearestPoint(corner);
      //   //   cornersPath.insert(corner, closestPoint.index + 1);
      //   // }
      // });
      // let cornersPath = new Path({
      //   strokeWidth: 5,
      //   strokeColor: 'red',
      //   segments: corners
      // });
      // let computedCornersPath = new Path({
      //   strokeWidth: 5,
      //   strokeColor: 'blue',
      //   segments: computedCorners,
      //   closed: true
      // });

      // let thresholdDist = 0.05 * computedCornersPath.length;
      //
      // Base.each(corners, (corner, i) => {
      //   let integerPoint = shape.getIntegerPoint(corner);
      //   let closestPoint = computedCornersPath.getNearestPoint(corner);
      // });
      // computedCorners.visible = false;
      // computedCornersPath.visible = false;
      // let mergedCornersPath = cornersPath.unite(computedCornersPath);
      // mergedCornersPath.strokeColor = 'purple';
      // cornersPath.flatten();
      // }

      // if (trueWasNecessary) {
      //   let idealGeometry = shape.getIdealGeometry(pathData, sides, middle);
      //   log(idealGeometry);
      //   Base.each(corners, (corner, i) => {
      //     idealGeometry.add(corner);
      //   });
      //   idealGeometry.reduce();
      //
      //   idealGeometry.strokeColor = 'red';
      // } else {
      //   log('no trueing necessary');
      // }
      // middle.smooth({
      //   type: 'geometric'
      // });
      // middle.flatten(10);
      // middle.simplify();
      // middle.flatten(20);
      // middle.simplify();
      // middle.flatten();
      // middle.simplify();

      middle.selected = true;
      // let middleClone = middle.clone();
      // middleClone.visible = true;
      // middleClone.strokeColor = 'pink';


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
        // log('no intersections');
      }

      group.data.color = bounds.fillColor;
      group.data.scale = 1; // init variable to track scale changes
      group.data.rotation = 0; // init variable to track rotation changes

      var children = group.getItems({
        match: function match(item) {
          return item.name !== 'middle';
        }
      });

      // log('-----');
      // log(group);
      // log(children);
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
      log('pinchStart', event.center);
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
        log('hit no item');
      }
    }

    function pinchMove(event) {
      log('pinchMove');
      if (!!pinchedGroup) {
        // log('pinchmove', event);
        // log(pinchedGroup);
        var currentScale = event.scale;
        var scaleDelta = currentScale / lastScale;
        // log(lastScale, currentScale, scaleDelta);
        lastScale = currentScale;

        var currentRotation = event.rotation;
        var rotationDelta = currentRotation - lastRotation;
        log(lastRotation, currentRotation, rotationDelta);
        lastRotation = currentRotation;

        // log(`scaling by ${scaleDelta}`);
        // log(`rotating by ${rotationDelta}`);

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

        log('final scale', pinchedGroup.data.scale);
        log(move);

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
        log(item);
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
          log('not interior');
        }
      } else {
        pinchedGroup = null;
        log('hit no item');
      }
    }

    var velocityMultiplier = 25;
    function throwPinchedGroup() {
      log(pinchedGroup.position);
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
    log('new pressed');

    paper.project.activeLayer.removeChildren();
  }

  function undoPressed() {
    log('undo pressed');
    if (!(MOVES.length > 0)) {
      log('no moves yet');
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
          log('removing group');
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
          log('unknown case');
      }
    } else {
      log('could not find matching item');
    }
  }

  function playPressed() {
    log('play pressed');
  }

  function tipsPressed() {
    log('tips pressed');
  }

  function sharePressed() {
    log('share pressed');
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

},{"./../../config":1,"./shape":3,"./util":4}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getIdealGeometry = getIdealGeometry;
exports.OldgetIdealGeometry = OldgetIdealGeometry;
exports.getIntegerPoint = getIntegerPoint;
exports.stringifyPoint = stringifyPoint;
exports.parsePoint = parsePoint;
exports.getClosestPointFromPathData = getClosestPointFromPathData;
exports.getComputedCorners = getComputedCorners;
var util = require('./util');
var config = require('./../../config');

function log() {
  util.log.apply(util, arguments);
}

function getIdealGeometry(pathData, sides, simplifiedPath) {
  var thresholdDist = 0.05 * simplifiedPath.length;

  var returnPath = new Path({
    strokeWidth: 5,
    strokeColor: 'pink'
  });

  var truedPath = new Path({
    strokeWidth: 5,
    strokeColor: 'green'
  });

  // new Path.Circle({
  //   center: simplifiedPath.firstSegment.point,
  //   radius: 3,
  //   fillColor: 'black'
  // });

  var firstPoint = new Path.Circle({
    center: simplifiedPath.firstSegment.point,
    radius: 10,
    strokeColor: 'blue'
  });

  var lastPoint = new Path.Circle({
    center: simplifiedPath.lastSegment.point,
    radius: 10,
    strokeColor: 'red'
  });

  var angle = void 0,
      prevAngle = void 0,
      angleDelta = void 0;
  Base.each(sides, function (side, i) {
    var firstPoint = side[0];
    var lastPoint = side[side.length - 1];

    angle = Math.atan2(lastPoint.y - firstPoint.y, lastPoint.x - firstPoint.x);

    if (!!prevAngle) {
      angleDelta = util.angleDelta(angle, prevAngle);
      console.log(angleDelta);
      returnPath.add(firstPoint);
      returnPath.add(lastPoint);
    }

    prevAngle = angle;
  });

  Base.each(simplifiedPath.segments, function (segment, i) {
    var integerPoint = getIntegerPoint(segment.point);
    var nearestPoint = returnPath.getNearestPoint(integerPoint);
    // console.log(integerPoint.getDistance(nearestPoint), thresholdDist);
    if (integerPoint.getDistance(nearestPoint) <= thresholdDist) {
      truedPath.add(nearestPoint);
      new Path.Circle({
        center: nearestPoint,
        radius: 3,
        fillColor: 'black'
      });
    } else {
      console.log('off path');
      truedPath.add(integerPoint);
      new Path.Circle({
        center: integerPoint,
        radius: 3,
        fillColor: 'green'
      });
    }
  });

  // truedPath.add(simplifiedPath.lastSegment.point);
  // new Path.Circle({
  //   center: simplifiedPath.lastSegment.point,
  //   radius: 3,
  //   fillColor: 'black'
  // });

  if (simplifiedPath.closed) {
    truedPath.closed = true;
  }

  // Base.each(truedPath, (point, i) => {
  //   truedPath.removeSegment(i);
  // });

  return truedPath;
}

function OldgetIdealGeometry(pathData, path) {
  var thresholdAngle = Math.PI / 2;
  var thresholdDist = 0.1 * path.length;
  // log(path);

  var count = 0;

  var sides = [];
  var side = [];
  var prev = void 0;
  var prevAngle = void 0;

  // log('thresholdAngle', thresholdAngle);

  var returnPath = new Path();

  Base.each(path.segments, function (segment, i) {
    var integerPoint = getIntegerPoint(segment.point);
    var pointStr = stringifyPoint(integerPoint);
    var pointData = void 0;
    if (pointStr in pathData) {
      pointData = pathData[pointStr];
    } else {
      var nearestPoint = getClosestPointFromPathData(pathData, integerPoint);
      pointStr = stringifyPoint(nearestPoint);

      if (pointStr in pathData) {
        pointData = pathData[pointStr];
      } else {
        log('could not find close point');
      }
    }

    if (pointData) {
      returnPath.add(integerPoint);
      new Path.Circle({
        center: integerPoint,
        radius: 5,
        strokeColor: new Color(i / path.segments.length, i / path.segments.length, i / path.segments.length)
      });
      log(pointData.point);
      if (!prev) {
        // first point
        // log('pushing first point to side');
        side.push(pointData);
      } else {
        // let angleFoo = integerPoint.getDirectedAngle(prev);
        var angle = Math.atan2(integerPoint.y, integerPoint.x) - Math.atan2(prev.y, prev.x);
        if (angle < 0) angle += 2 * Math.PI; // normalize to [0, 2π)
        // log(angleFoo, angleBar);
        // let angle = Math.atan2(integerPoint.y - prev.y, integerPoint.x - prev.x);
        // let line = new Path.Line(prev, integerPoint);
        // line.strokeWidth = 5;
        // line.strokeColor = 'pink';
        // line.rotate(util.deg(Math.cos(angle) * Math.PI * 2));
        // log('angle', angle);
        if (typeof prevAngle === 'undefined') {
          // second point
          side.push(pointData);
        } else {
          var angleDifference = Math.pow(angle - prevAngle, 2);
          log('angleDifference', angleDifference);
          if (angleDifference <= thresholdAngle) {
            // same side
            // log('pushing point to same side');
            side.push(pointData);
          } else {
            // new side
            // log('new side');
            sides.push(side);
            side = [pointData];
          }
        }

        prevAngle = angle;
      }

      prev = integerPoint;
      count++;
    } else {
      log('no data');
    }
  });

  // log(count);

  sides.push(side);

  return sides;
}

function getIntegerPoint(point) {
  return new Point(Math.floor(point.x), Math.floor(point.y));
}

function stringifyPoint(point) {
  return Math.floor(point.x) + ',' + Math.floor(point.y);
}

function parsePoint(pointStr) {
  var split = pointStr.split(',').map(function (num) {
    return Math.floor(num);
  });

  if (split.length >= 2) {
    return new Point(split[0], split[1]);
  }

  return null;
}

function getClosestPointFromPathData(pathData, point) {
  var leastDistance = void 0,
      closestPoint = void 0;

  Base.each(pathData, function (datum, i) {
    var distance = point.getDistance(datum.point);
    if (!leastDistance || distance < leastDistance) {
      leastDistance = distance;
      closestPoint = datum.point;
    }
  });

  return closestPoint || point;
}

function getComputedCorners(path) {
  var thresholdAngle = util.rad(config.shape.cornerThresholdDeg);
  var thresholdDistance = 0.1 * path.length;

  var corners = [];

  if (path.length > 0) {
    (function () {
      var point = void 0,
          prev = void 0;
      var angle = void 0,
          prevAngle = void 0,
          angleDelta = void 0;

      Base.each(path.segments, function (segment, i) {
        var point = getIntegerPoint(segment.point);
        if (!!prev) {
          var _angle = Math.atan2(point.y - prev.y, point.x - prev.x);
          if (_angle < 0) _angle += 2 * Math.PI; // normalize to [0, 2π)
          if (!!prevAngle) {
            angleDelta = util.angleDelta(_angle, prevAngle);
            if (angleDelta >= thresholdAngle) {
              // console.log('corner');
              // new Path.Circle({
              //   center: prev,
              //   radius: 10,
              //   fillColor: 'pink'
              // });
              corners.push(prev);
            } else {
              // console.log(angleDelta);
            }
          }

          prevAngle = _angle;
        } else {
          // first point
          corners.push(point);
          // new Path.Circle({
          //   center: point,
          //   radius: 10,
          //   fillColor: 'pink'
          // })
        }
        prev = point;
      });

      var lastSegmentPoint = getIntegerPoint(path.lastSegment.point);
      corners.push(lastSegmentPoint);

      var returnCorners = [];
      var skippedIds = [];
      for (var i = 0; i < corners.length; i++) {
        var _point = corners[i];

        if (i !== 0) {
          var dist = _point.getDistance(prev);
          var closestPoints = [];
          while (dist < thresholdDistance) {
            closestPoints.push({
              point: _point,
              index: i
            });

            if (i < corners.length - 1) {
              i++;
              prev = _point;
              _point = corners[i];
              dist = _point.getDistance(prev);
            } else {
              break;
            }
          }
          if (closestPoints.length > 0) {
            var sumX = 0,
                sumY = 0;


            Base.each(closestPoints, function (pointObj) {
              sumX += pointObj.point.x;
              sumY += pointObj.point.y;
            });

            var avgX = sumX / closestPoints.length,
                avgY = sumY / closestPoints.length;

            returnCorners.push(new Point(avgX, avgY));
          }
        } else {
          returnCorners.push(_point);
        }

        prev = _point;
      }

      // Base.each(corners, (corner, i) => {
      //   let point = corner;
      //
      //   if (i !== 0) {
      //     let dist = point.getDistance(prev);
      //     let closestPoints = [];
      //     let index = i;
      //     while (dist < thresholdDistance) {
      //       closestPoints.push({
      //         point: point,
      //         index: index
      //       });
      //     }
      //     console.log(dist, thresholdDistance);
      //     while (dist < thresholdDistance) {
      //
      //     }
      //   } else {
      //     returnCorners.push(corner);
      //   }
      //
      //   prev = point;
      // });
      // new Path.Circle({
      //   center: lastSegmentPoint,
      //   radius: 10,
      //   fillColor: 'pink'
      // });
    })();
  }

  return corners;
}

},{"./../../config":1,"./util":4}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.log = log;
exports.rad = rad;
exports.deg = deg;
exports.angleDelta = angleDelta;
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

function log() {
  if (config.log) {
    var _console;

    (_console = console).log.apply(_console, arguments);
  }
}

// Converts from degrees to radians.
function rad(degrees) {
  return degrees * Math.PI / 180;
};

// Converts from radians to degrees.
function deg(radians) {
  return radians * 180 / Math.PI;
};

// returns absolute value of the delta of two angles in radians
function angleDelta(x, y) {
  return Math.abs(Math.atan2(Math.sin(y - x), Math.cos(y - x)));;
}

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

function trueGroup(group, corners) {
  var middle = group._namedChildren.middle[0];

  var intersections = middle.getIntersections();
  var trueNecessary = false;

  var middleCopy = new Path();
  middleCopy.copyContent(middle);
  // debugger;

  if (intersections.length > 0) {
    // middleCopy.strokeColor = 'orange';
    var _trimPath = trimPath(middleCopy, middle);
    // see if we can trim the path while maintaining intersections
    // log('intersections!');
    // middleCopy.strokeColor = 'yellow';


    var _trimPath2 = _slicedToArray(_trimPath, 2);

    middleCopy = _trimPath2[0];
    trueNecessary = _trimPath2[1];
  } else {
    // extend first and last segment by threshold, see if intersection
    // log('no intersections, extending first!');
    // middleCopy.strokeColor = 'yellow';
    middleCopy = extendPath(middleCopy);
    // middleCopy.strokeColor = 'orange';
    var _intersections = middleCopy.getIntersections();
    if (_intersections.length > 0) {
      // middleCopy.strokeColor = 'green';
      var _trimPath3 = trimPath(middleCopy, middle);
      // middleCopy.strokeColor = 'pink';


      var _trimPath4 = _slicedToArray(_trimPath3, 2);

      middleCopy = _trimPath4[0];
      trueNecessary = _trimPath4[1];
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

  return [group, trueNecessary];
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

      if (intersections.length > 1) {
        return {
          v: [original, false]
        }; // more than one intersection, don't worry about trimming
      }

      var extendingThreshold = config.shape.extendingThreshold;
      var totalLength = path.length;

      // we want to remove all closed loops from the path, since these are necessarily interior and not first or last
      Base.each(dividedPath.children, function (child, i) {
        if (child.closed) {
          // log('subtracting closed child');
          dividedPath = dividedPath.subtract(child);
        } else {
          // dividedPath = dividedPath.unite(child);
        }
      });

      // log(dividedPath);

      if (!!dividedPath.children && dividedPath.children.length > 1) {
        (function () {
          // divided path is a compound path
          var unitedDividedPath = new Path();
          // unitedDividedPath.copyAttributes(dividedPath);
          // log('before', unitedDividedPath);
          Base.each(dividedPath.children, function (child, i) {
            if (!child.closed) {
              unitedDividedPath = unitedDividedPath.unite(child);
            }
          });
          dividedPath = unitedDividedPath;
          // log('after', unitedDividedPath);
          // return;
        })();
      } else {
          // log('dividedPath has one child');
        }

      if (intersections.length > 0) {
        // we have to get the nearest location because the exact intersection point has already been removed as a part of resolveCrossings()
        var firstIntersection = dividedPath.getNearestLocation(intersections[0].point);
        // log(dividedPath);
        var rest = dividedPath.splitAt(firstIntersection); // dividedPath is now the first segment
        var firstSegment = dividedPath;
        var lastSegment = void 0;

        // firstSegment.strokeColor = 'pink';

        // let circleOne = new Path.Circle({
        //   center: firstIntersection.point,
        //   radius: 5,
        //   strokeColor: 'red'
        // });

        // log(intersections);
        if (intersections.length > 1) {
          // log('foo');
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
        // log(path);
        // log(path.lastChild);
        // path.firstChild.strokeColor = 'pink';
        // path.lastChild.strokeColor = 'green';
        // path = path.lastChild; // return last child?
        // find highest version
        //
        // log(realPathVersion);
        //
        // Base.each(path.children, (child, i) => {
        //   if (child.version == realPathVersion) {
        //     log('returning child');
        //     return child;
        //   }
        // })
      }
      log('original length:', totalLength);
      log('edited length:', path.length);
      if (path.length / totalLength <= 0.75) {
        log('returning original');
        return {
          v: [original, false]
        };
      } else {
        return {
          v: [path, true]
        };
      }
    }();

    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
  } catch (e) {
    console.error(e);
    return [original, false];
  }
}

function removePathExtensions(path) {
  path.removeSegment(0);
  path.removeSegment(path.segments.length - 1);
  return path;
}

// export function truePath(path) {
//   // log(group);
//   // if (path && path.children && path.children.length > 0 && path._namedChildren['middle']) {
//   //   let pathCopy = new Path();
//   //   log(path._namedChildren['middle']);
//   //   pathCopy.copyContent(path._namedChildren['middle']);
//   //   log(pathCopy);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjb25maWcuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9zaGFwZS5qcyIsInNyYy9qcy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxRQUFRLE9BQVIsR0FBa0I7QUFDaEIsVUFBUSxDQUFDLFNBQUQsRUFBWSxTQUFaLEVBQXVCLFNBQXZCLEVBQWtDLFNBQWxDLEVBQTZDLFNBQTdDLEVBQXdELFNBQXhELEVBQW1FLFNBQW5FLEVBQThFLFNBQTlFLEVBQXlGLFNBQXpGLEVBQW9HLFNBQXBHLEVBQStHLFNBQS9HLEVBQXlILFNBQXpILENBRFE7QUFFaEIsUUFBTSxDQUFDLFNBQUQsRUFBWSxTQUFaLEVBQXVCLFNBQXZCLEVBQWtDLFNBQWxDLEVBQTZDLFNBQTdDLENBRlU7QUFHaEIsYUFBVyxFQUhLO0FBSWhCLHFCQUFtQjtBQUpILENBQWxCOztBQU9BLFFBQVEsS0FBUixHQUFnQjtBQUNkLHNCQUFvQixHQUROO0FBRWQscUJBQW1CLEtBRkw7QUFHZCxzQkFBb0I7QUFITixDQUFoQjs7QUFNQSxRQUFRLEdBQVIsR0FBYyxJQUFkOzs7Ozs7O0FDYkEsT0FBTyxHQUFQLEdBQWEsT0FBTyxHQUFQLElBQWM7QUFDekIsV0FBUyxDQUFDLFNBQUQsRUFBWSxTQUFaLEVBQXVCLFNBQXZCLEVBQWtDLFNBQWxDLEVBQTZDLFNBQTdDLEVBQXdELFNBQXhELEVBQW1FLFNBQW5FLEVBQThFLFNBQTlFLEVBQXlGLFNBQXpGLEVBQW9HLFNBQXBHLEVBQStHLFNBQS9HLEVBQTBILFNBQTFILEVBQXFJLFNBQXJJLEVBQWdKLFNBQWhKLEVBQTJKLFNBQTNKLEVBQXNLLFNBQXRLLENBRGdCO0FBRXpCLGdCQUFjLFNBRlc7QUFHekIsWUFBVSxFQUhlO0FBSXpCLFNBQU87QUFKa0IsQ0FBM0I7O0FBT0EsTUFBTSxPQUFOLENBQWMsTUFBZDs7QUFFQSxJQUFNLE9BQU8sUUFB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QUVEO0FBQ08sU0FBUyxVQUFULENBQW9CLEtBQXBCLEVBQTJCO0FBQ2hDLE1BQUksSUFBSixFQUFVLE1BQVYsRUFBa0IsRUFBbEIsRUFBc0IsSUFBdEI7QUFDQSxXQUFTLEVBQVQ7QUFDQSxPQUFLLEtBQUssQ0FBTCxFQUFRLE9BQU8sTUFBTSxNQUExQixFQUFrQyxLQUFLLElBQXZDLEVBQTZDLElBQTdDLEVBQW1EO0FBQ2pELFdBQU8sTUFBTSxFQUFOLENBQVA7QUFDQSxhQUFTLGFBQWEsSUFBYixFQUFtQixNQUFuQixDQUFUO0FBQ0Q7QUFDRCxTQUFPLE1BQVA7QUFDRDs7QUFFTSxTQUFTLGFBQVQsQ0FBdUIsS0FBdkIsRUFBOEIsUUFBOUIsRUFBd0M7QUFDN0MsTUFBSSxDQUFDLEtBQUwsRUFBWSxPQUFPLElBQVA7O0FBRVosT0FBSyxJQUFJLElBQUksU0FBUyxNQUFULEdBQWtCLENBQS9CLEVBQWtDLEtBQUssQ0FBdkMsRUFBMEMsR0FBMUMsRUFBK0M7QUFDN0MsUUFBSSxRQUFRLFNBQVMsQ0FBVCxDQUFaO0FBQ0EsUUFBSSxTQUFTLE1BQU0sWUFBbkI7QUFDQSxRQUFJLE1BQU0sUUFBTixDQUFlLE1BQU0sWUFBckIsQ0FBSixFQUF3QztBQUN0QyxhQUFPLEtBQVA7QUFDRDtBQUNGOztBQUVELFNBQU8sSUFBUDtBQUNEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImV4cG9ydHMucGFsZXR0ZSA9IHtcbiAgY29sb3JzOiBbXCIjMjAxNzFDXCIsIFwiIzFFMkE0M1wiLCBcIiMyODM3N0RcIiwgXCIjMzUyNzQ3XCIsIFwiI0NBMkUyNlwiLCBcIiM5QTJBMUZcIiwgXCIjREE2QzI2XCIsIFwiIzQ1MzEyMVwiLCBcIiM5MTZBNDdcIiwgXCIjREFBRDI3XCIsIFwiIzdGN0QzMVwiLFwiIzJCNUUyRVwiXSxcbiAgcG9wczogW1wiIzAwQURFRlwiLCBcIiNGMjg1QTVcIiwgXCIjN0RDNTdGXCIsIFwiI0Y2RUIxNlwiLCBcIiNGNEVBRTBcIl0sXG4gIGNvbG9yU2l6ZTogMjAsXG4gIHNlbGVjdGVkQ29sb3JTaXplOiAzMFxufVxuXG5leHBvcnRzLnNoYXBlID0ge1xuICBleHRlbmRpbmdUaHJlc2hvbGQ6IDAuMSxcbiAgdHJpbW1pbmdUaHJlc2hvbGQ6IDAuMDc1LFxuICBjb3JuZXJUaHJlc2hvbGREZWc6IDEwXG59XG5cbmV4cG9ydHMubG9nID0gdHJ1ZTtcbiIsIndpbmRvdy5rYW4gPSB3aW5kb3cua2FuIHx8IHtcbiAgcGFsZXR0ZTogW1wiIzIwMTcxQ1wiLCBcIiMxRTJBNDNcIiwgXCIjMjgzNzdEXCIsIFwiIzM1Mjc0N1wiLCBcIiNGMjg1QTVcIiwgXCIjQ0EyRTI2XCIsIFwiI0I4NDUyNlwiLCBcIiNEQTZDMjZcIiwgXCIjNDUzMTIxXCIsIFwiIzkxNkE0N1wiLCBcIiNFRUI2NDFcIiwgXCIjRjZFQjE2XCIsIFwiIzdGN0QzMVwiLCBcIiM2RUFENzlcIiwgXCIjMkE0NjIxXCIsIFwiI0Y0RUFFMFwiXSxcbiAgY3VycmVudENvbG9yOiAnIzIwMTcxQycsXG4gIG51bVBhdGhzOiAxMCxcbiAgcGF0aHM6IFtdLFxufTtcblxucGFwZXIuaW5zdGFsbCh3aW5kb3cpO1xuXG5jb25zdCB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5jb25zdCBzaGFwZSA9IHJlcXVpcmUoJy4vc2hhcGUnKTtcbmNvbnN0IGNvbmZpZyA9IHJlcXVpcmUoJy4vLi4vLi4vY29uZmlnJyk7XG4vLyByZXF1aXJlKCdwYXBlci1hbmltYXRlJyk7XG5cbmZ1bmN0aW9uIGxvZyh0aGluZykge1xuICB1dGlsLmxvZyh0aGluZyk7XG59XG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICBsZXQgTU9WRVMgPSBbXTsgLy8gc3RvcmUgZ2xvYmFsIG1vdmVzIGxpc3RcbiAgLy8gbW92ZXMgPSBbXG4gIC8vICAge1xuICAvLyAgICAgJ3R5cGUnOiAnY29sb3JDaGFuZ2UnLFxuICAvLyAgICAgJ29sZCc6ICcjMjAxNzFDJyxcbiAgLy8gICAgICduZXcnOiAnI0YyODVBNSdcbiAgLy8gICB9LFxuICAvLyAgIHtcbiAgLy8gICAgICd0eXBlJzogJ25ld1BhdGgnLFxuICAvLyAgICAgJ3JlZic6ICc/Pz8nIC8vIHV1aWQ/IGRvbSByZWZlcmVuY2U/XG4gIC8vICAgfSxcbiAgLy8gICB7XG4gIC8vICAgICAndHlwZSc6ICdwYXRoVHJhbnNmb3JtJyxcbiAgLy8gICAgICdyZWYnOiAnPz8/JywgLy8gdXVpZD8gZG9tIHJlZmVyZW5jZT9cbiAgLy8gICAgICdvbGQnOiAncm90YXRlKDkwZGVnKXNjYWxlKDEuNSknLCAvLyA/Pz9cbiAgLy8gICAgICduZXcnOiAncm90YXRlKDEyMGRlZylzY2FsZSgtMC41KScgLy8gPz8/XG4gIC8vICAgfSxcbiAgLy8gICAvLyBvdGhlcnM/XG4gIC8vIF1cblxuICBjb25zdCAkd2luZG93ID0gJCh3aW5kb3cpO1xuICBjb25zdCAkYm9keSA9ICQoJ2JvZHknKTtcbiAgY29uc3QgJGNhbnZhcyA9ICQoJ2NhbnZhcyNtYWluQ2FudmFzJyk7XG4gIGNvbnN0IHJ1bkFuaW1hdGlvbnMgPSBmYWxzZTtcbiAgY29uc3QgdHJhbnNwYXJlbnQgPSBuZXcgQ29sb3IoMCwgMCk7XG4gIGNvbnN0IHRocmVzaG9sZEFuZ2xlID0gdXRpbC5yYWQoY29uZmlnLnNoYXBlLmNvcm5lclRocmVzaG9sZERlZyk7XG5cbiAgbGV0IHZpZXdXaWR0aCwgdmlld0hlaWdodDtcblxuICBmdW5jdGlvbiBoaXRUZXN0Qm91bmRzKHBvaW50KSB7XG4gICAgcmV0dXJuIHV0aWwuaGl0VGVzdEJvdW5kcyhwb2ludCwgcGFwZXIucHJvamVjdC5hY3RpdmVMYXllci5jaGlsZHJlbik7XG4gIH1cblxuICBmdW5jdGlvbiBoaXRUZXN0R3JvdXBCb3VuZHMocG9pbnQpIHtcbiAgICBsZXQgZ3JvdXBzID0gcGFwZXIucHJvamVjdC5nZXRJdGVtcyh7XG4gICAgICBjbGFzc05hbWU6ICdHcm91cCdcbiAgICB9KTtcbiAgICByZXR1cm4gdXRpbC5oaXRUZXN0Qm91bmRzKHBvaW50LCBncm91cHMpO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdFZpZXdWYXJzKCkge1xuICAgIHZpZXdXaWR0aCA9IHBhcGVyLnZpZXcudmlld1NpemUud2lkdGg7XG4gICAgdmlld0hlaWdodCA9IHBhcGVyLnZpZXcudmlld1NpemUuaGVpZ2h0O1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdENvbnRyb2xQYW5lbCgpIHtcbiAgICBpbml0Q29sb3JQYWxldHRlKCk7XG4gICAgaW5pdENhbnZhc0RyYXcoKTtcbiAgICBpbml0TmV3KCk7XG4gICAgaW5pdFVuZG8oKTtcbiAgICBpbml0UGxheSgpO1xuICAgIGluaXRUaXBzKCk7XG4gICAgaW5pdFNoYXJlKCk7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0Q29sb3JQYWxldHRlKCkge1xuICAgIGNvbnN0ICRwYWxldHRlV3JhcCA9ICQoJ3VsLnBhbGV0dGUtY29sb3JzJyk7XG4gICAgY29uc3QgJHBhbGV0dGVDb2xvcnMgPSAkcGFsZXR0ZVdyYXAuZmluZCgnbGknKTtcbiAgICBjb25zdCBwYWxldHRlQ29sb3JTaXplID0gMjA7XG4gICAgY29uc3QgcGFsZXR0ZVNlbGVjdGVkQ29sb3JTaXplID0gMzA7XG4gICAgY29uc3QgcGFsZXR0ZVNlbGVjdGVkQ2xhc3MgPSAncGFsZXR0ZS1zZWxlY3RlZCc7XG5cbiAgICAvLyBob29rIHVwIGNsaWNrXG4gICAgICAkcGFsZXR0ZUNvbG9ycy5vbignY2xpY2sgdGFwIHRvdWNoJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgbGV0ICRzdmcgPSAkKHRoaXMpLmZpbmQoJ3N2Zy5wYWxldHRlLWNvbG9yJyk7XG5cbiAgICAgICAgICBpZiAoISRzdmcuaGFzQ2xhc3MocGFsZXR0ZVNlbGVjdGVkQ2xhc3MpKSB7XG4gICAgICAgICAgICAkKCcuJyArIHBhbGV0dGVTZWxlY3RlZENsYXNzKVxuICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MocGFsZXR0ZVNlbGVjdGVkQ2xhc3MpXG4gICAgICAgICAgICAgIC5hdHRyKCd3aWR0aCcsIHBhbGV0dGVDb2xvclNpemUpXG4gICAgICAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCBwYWxldHRlQ29sb3JTaXplKVxuICAgICAgICAgICAgICAuZmluZCgncmVjdCcpXG4gICAgICAgICAgICAgIC5hdHRyKCdyeCcsIDApXG4gICAgICAgICAgICAgIC5hdHRyKCdyeScsIDApO1xuXG4gICAgICAgICAgICAkc3ZnLmFkZENsYXNzKHBhbGV0dGVTZWxlY3RlZENsYXNzKVxuICAgICAgICAgICAgICAuYXR0cignd2lkdGgnLCBwYWxldHRlU2VsZWN0ZWRDb2xvclNpemUpXG4gICAgICAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCBwYWxldHRlU2VsZWN0ZWRDb2xvclNpemUpXG4gICAgICAgICAgICAgIC5maW5kKCdyZWN0JylcbiAgICAgICAgICAgICAgLmF0dHIoJ3J4JywgcGFsZXR0ZVNlbGVjdGVkQ29sb3JTaXplIC8gMilcbiAgICAgICAgICAgICAgLmF0dHIoJ3J5JywgcGFsZXR0ZVNlbGVjdGVkQ29sb3JTaXplIC8gMilcblxuICAgICAgICAgICAgd2luZG93Lmthbi5jdXJyZW50Q29sb3IgPSAkc3ZnLmZpbmQoJ3JlY3QnKS5hdHRyKCdmaWxsJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRDYW52YXNEcmF3KCkge1xuXG4gICAgcGFwZXIuc2V0dXAoJGNhbnZhc1swXSk7XG5cbiAgICBsZXQgbWlkZGxlLCBib3VuZHM7XG4gICAgbGV0IHNpemVzO1xuICAgIC8vIGxldCBwYXRocyA9IGdldEZyZXNoUGF0aHMod2luZG93Lmthbi5udW1QYXRocyk7XG4gICAgbGV0IHRvdWNoID0gZmFsc2U7XG4gICAgbGV0IGxhc3RDaGlsZDtcbiAgICBsZXQgcGF0aERhdGEgPSB7fTtcbiAgICBsZXQgcHJldkFuZ2xlLCBwcmV2UG9pbnQ7XG5cbiAgICBsZXQgc2lkZXM7XG4gICAgbGV0IHNpZGU7XG5cbiAgICBsZXQgY29ybmVycztcblxuICAgIGZ1bmN0aW9uIHBhblN0YXJ0KGV2ZW50KSB7XG4gICAgICBwYXBlci5wcm9qZWN0LmFjdGl2ZUxheWVyLnJlbW92ZUNoaWxkcmVuKCk7IC8vIFJFTU9WRVxuICAgICAgLy8gZHJhd0NpcmNsZSgpO1xuXG4gICAgICBzaXplcyA9IFtdO1xuICAgICAgcHJldkFuZ2xlID0gTWF0aC5hdGFuMihldmVudC52ZWxvY2l0eVksIGV2ZW50LnZlbG9jaXR5WCk7XG5cbiAgICAgIGlmIChwaW5jaGluZykgcmV0dXJuO1xuICAgICAgaWYgKCEoZXZlbnQuY2hhbmdlZFBvaW50ZXJzICYmIGV2ZW50LmNoYW5nZWRQb2ludGVycy5sZW5ndGggPiAwKSkgcmV0dXJuO1xuICAgICAgaWYgKGV2ZW50LmNoYW5nZWRQb2ludGVycy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGxvZygnZXZlbnQuY2hhbmdlZFBvaW50ZXJzID4gMScpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBwb2ludGVyID0gZXZlbnQuY2VudGVyO1xuICAgICAgY29uc3QgcG9pbnQgPSBuZXcgUG9pbnQocG9pbnRlci54LCBwb2ludGVyLnkpO1xuXG4gICAgICBib3VuZHMgPSBuZXcgUGF0aCh7XG4gICAgICAgIHN0cm9rZUNvbG9yOiB3aW5kb3cua2FuLmN1cnJlbnRDb2xvcixcbiAgICAgICAgZmlsbENvbG9yOiB3aW5kb3cua2FuLmN1cnJlbnRDb2xvcixcbiAgICAgICAgbmFtZTogJ2JvdW5kcycsXG4gICAgICAgIHZpc2libGU6IGZhbHNlXG4gICAgICB9KTtcblxuICAgICAgbWlkZGxlID0gbmV3IFBhdGgoe1xuICAgICAgICBzdHJva2VDb2xvcjogd2luZG93Lmthbi5jdXJyZW50Q29sb3IsXG4gICAgICAgIG5hbWU6ICdtaWRkbGUnLFxuICAgICAgICBzdHJva2VXaWR0aDogNSxcbiAgICAgICAgdmlzaWJsZTogdHJ1ZSxcbiAgICAgICAgc3Ryb2tlQ2FwOiAncm91bmQnXG4gICAgICB9KTtcblxuICAgICAgYm91bmRzLmFkZChwb2ludCk7XG4gICAgICBtaWRkbGUuYWRkKHBvaW50KTtcblxuICAgICAgcHJldlBvaW50ID0gcG9pbnQ7XG4gICAgICBjb3JuZXJzID0gW3BvaW50XTtcblxuICAgICAgc2lkZXMgPSBbXTtcbiAgICAgIHNpZGUgPSBbcG9pbnRdO1xuXG4gICAgICBwYXRoRGF0YVtzaGFwZS5zdHJpbmdpZnlQb2ludChwb2ludCldID0ge1xuICAgICAgICBwb2ludDogcG9pbnQsXG4gICAgICAgIGZpcnN0OiB0cnVlXG4gICAgICB9O1xuICAgIH1cblxuICAgIGNvbnN0IG1pbiA9IDE7XG4gICAgY29uc3QgbWF4ID0gMTU7XG4gICAgY29uc3QgYWxwaGEgPSAwLjM7XG4gICAgY29uc3QgbWVtb3J5ID0gMTA7XG4gICAgdmFyIGN1bURpc3RhbmNlID0gMDtcbiAgICBsZXQgY3VtU2l6ZSwgYXZnU2l6ZTtcbiAgICBmdW5jdGlvbiBwYW5Nb3ZlKGV2ZW50KSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgaWYgKHBpbmNoaW5nKSByZXR1cm47XG4gICAgICAvLyBsb2coZXZlbnQub3ZlcmFsbFZlbG9jaXR5KTtcbiAgICAgIC8vIGxldCB0aGlzRGlzdCA9IHBhcnNlSW50KGV2ZW50LmRpc3RhbmNlKTtcbiAgICAgIC8vIGN1bURpc3RhbmNlICs9IHRoaXNEaXN0O1xuICAgICAgLy9cbiAgICAgIC8vIGlmIChjdW1EaXN0YW5jZSA8IDEwMCkge1xuICAgICAgLy8gICBsb2coJ2lnbm9yaW5nJyk7XG4gICAgICAvLyAgIHJldHVybjtcbiAgICAgIC8vIH0gZWxzZSB7XG4gICAgICAvLyAgIGN1bURpc3RhbmNlID0gMDtcbiAgICAgIC8vICAgbG9nKCdub3QgaWdub3JpbmcnKTtcbiAgICAgIC8vIH1cblxuICAgICAgY29uc3QgcG9pbnRlciA9IGV2ZW50LmNlbnRlcjtcbiAgICAgIGxldCBwb2ludCA9IG5ldyBQb2ludChwb2ludGVyLngsIHBvaW50ZXIueSk7XG5cbiAgICAgIC8vIGFuZ2xlID0gLTEgKiBldmVudC5hbmdsZTsgLy8gbWFrZSB1cCBwb3NpdGl2ZSByYXRoZXIgdGhhbiBuZWdhdGl2ZVxuICAgICAgLy8gYW5nbGUgPSBhbmdsZSArPSAxODA7XG4gICAgICAvLyBjb25zb2xlLmxvZyhldmVudC52ZWxvY2l0eVgsIGV2ZW50LnZlbG9jaXR5WSk7XG4gICAgICBhbmdsZSA9IE1hdGguYXRhbjIoZXZlbnQudmVsb2NpdHlZLCBldmVudC52ZWxvY2l0eVgpO1xuICAgICAgbGV0IGFuZ2xlRGVsdGEgPSB1dGlsLmFuZ2xlRGVsdGEoYW5nbGUsIHByZXZBbmdsZSk7XG4gICAgICBwcmV2QW5nbGUgPSBhbmdsZTtcblxuICAgICAgaWYgKGFuZ2xlRGVsdGEgPiB0aHJlc2hvbGRBbmdsZSkge1xuICAgICAgICBpZiAoc2lkZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgLy8gY29uc29sZS5sb2coJ2Nvcm5lcicpO1xuICAgICAgICAgIGxldCBjb3JuZXJQb2ludCA9IHBvaW50O1xuICAgICAgICAgIC8vIG5ldyBQYXRoLkNpcmNsZSh7XG4gICAgICAgICAgLy8gICBjZW50ZXI6IGNvcm5lclBvaW50LFxuICAgICAgICAgIC8vICAgcmFkaXVzOiAxNSxcbiAgICAgICAgICAvLyAgIHN0cm9rZUNvbG9yOiAnYmxhY2snXG4gICAgICAgICAgLy8gfSk7XG4gICAgICAgICAgY29ybmVycy5wdXNoKGNvcm5lclBvaW50KTtcbiAgICAgICAgICBzaWRlcy5wdXNoKHNpZGUpO1xuICAgICAgICAgIHNpZGUgPSBbXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgc2lkZS5wdXNoKHBvaW50KTtcbiAgICAgIC8vIGxldCBhbmdsZURlZyA9IC0xICogZXZlbnQuYW5nbGU7XG4gICAgICAvLyBpZiAoYW5nbGVEZWcgPCAwKSBhbmdsZURlZyArPSAzNjA7IC8vIG5vcm1hbGl6ZSB0byBbMCwgMzYwKVxuICAgICAgLy8gYW5nbGUgPSB1dGlsLnJhZChhbmdsZURlZyk7XG4gICAgICAvL1xuICAgICAgLy8gLy8gbGV0IGFuZ2xlRGVsdGEgPSBNYXRoLmF0YW4yKE1hdGguc2luKGFuZ2xlKSwgTWF0aC5jb3MoYW5nbGUpKSAtIE1hdGguYXRhbjIoTWF0aC5zaW4ocHJldkFuZ2xlKSwgTWF0aC5jb3MocHJldkFuZ2xlKSk7XG4gICAgICAvLyBjb25zb2xlLmxvZyhhbmdsZSwgcHJldkFuZ2xlKTtcbiAgICAgIC8vIC8vIGNvbnNvbGUubG9nKGFuZ2xlRGVsdGEpO1xuXG4gICAgICAvLyBjb25zb2xlLmxvZyhhbmdsZSk7XG5cbiAgICAgIC8vIGxldCBhbmdsZURlbHRhID0gTWF0aC5hYnMocHJldkFuZ2xlIC0gYW5nbGUpO1xuICAgICAgLy8gaWYgKGFuZ2xlRGVsdGEgPiAzNjApIGFuZ2xlRGVsdGEgPSBhbmdsZURlbHRhIC0gMzYwO1xuICAgICAgLy8gaWYgKGFuZ2xlRGVsdGEgPiA5MCkge1xuICAgICAgLy8gICBjb25zb2xlLmxvZyhhbmdsZSwgcHJldkFuZ2xlLCBhbmdsZURlbHRhKTtcbiAgICAgIC8vICAgY29uc29sZS5lcnJvcignY29ybmVyIScpO1xuICAgICAgLy8gfSBlbHNlIHtcbiAgICAgIC8vICAgLy8gY29uc29sZS5sb2coYW5nbGVEZWx0YSk7XG4gICAgICAvLyB9XG5cbiAgICAgIHdoaWxlIChzaXplcy5sZW5ndGggPiBtZW1vcnkpIHtcbiAgICAgICAgc2l6ZXMuc2hpZnQoKTtcbiAgICAgIH1cblxuICAgICAgbGV0IGJvdHRvbVgsIGJvdHRvbVksIGJvdHRvbSxcbiAgICAgICAgdG9wWCwgdG9wWSwgdG9wLFxuICAgICAgICBwMCwgcDEsXG4gICAgICAgIHN0ZXAsIGFuZ2xlLCBkaXN0LCBzaXplO1xuXG4gICAgICBpZiAoc2l6ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAvLyBub3QgdGhlIGZpcnN0IHBvaW50LCBzbyB3ZSBoYXZlIG90aGVycyB0byBjb21wYXJlIHRvXG4gICAgICAgIHAwID0gcHJldlBvaW50O1xuICAgICAgICBkaXN0ID0gdXRpbC5kZWx0YShwb2ludCwgcDApO1xuICAgICAgICBzaXplID0gZGlzdCAqIGFscGhhO1xuICAgICAgICAvLyBpZiAoc2l6ZSA+PSBtYXgpIHNpemUgPSBtYXg7XG4gICAgICAgIHNpemUgPSBNYXRoLm1heChNYXRoLm1pbihzaXplLCBtYXgpLCBtaW4pOyAvLyBjbGFtcCBzaXplIHRvIFttaW4sIG1heF1cbiAgICAgICAgLy8gc2l6ZSA9IG1heCAtIHNpemU7XG5cbiAgICAgICAgY3VtU2l6ZSA9IDA7XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgc2l6ZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICBjdW1TaXplICs9IHNpemVzW2pdO1xuICAgICAgICB9XG4gICAgICAgIGF2Z1NpemUgPSBNYXRoLnJvdW5kKCgoY3VtU2l6ZSAvIHNpemVzLmxlbmd0aCkgKyBzaXplKSAvIDIpO1xuICAgICAgICAvLyBsb2coYXZnU2l6ZSk7XG5cbiAgICAgICAgYW5nbGUgPSBNYXRoLmF0YW4yKHBvaW50LnkgLSBwMC55LCBwb2ludC54IC0gcDAueCk7IC8vIHJhZFxuXG4gICAgICAgIC8vIFBvaW50KGJvdHRvbVgsIGJvdHRvbVkpIGlzIGJvdHRvbSwgUG9pbnQodG9wWCwgdG9wWSkgaXMgdG9wXG4gICAgICAgIGJvdHRvbVggPSBwb2ludC54ICsgTWF0aC5jb3MoYW5nbGUgKyBNYXRoLlBJLzIpICogYXZnU2l6ZTtcbiAgICAgICAgYm90dG9tWSA9IHBvaW50LnkgKyBNYXRoLnNpbihhbmdsZSArIE1hdGguUEkvMikgKiBhdmdTaXplO1xuICAgICAgICBib3R0b20gPSBuZXcgUG9pbnQoYm90dG9tWCwgYm90dG9tWSk7XG5cbiAgICAgICAgdG9wWCA9IHBvaW50LnggKyBNYXRoLmNvcyhhbmdsZSAtIE1hdGguUEkvMikgKiBhdmdTaXplO1xuICAgICAgICB0b3BZID0gcG9pbnQueSArIE1hdGguc2luKGFuZ2xlIC0gTWF0aC5QSS8yKSAqIGF2Z1NpemU7XG4gICAgICAgIHRvcCA9IG5ldyBQb2ludCh0b3BYLCB0b3BZKTtcblxuICAgICAgICBib3VuZHMuYWRkKHRvcCk7XG4gICAgICAgIGJvdW5kcy5pbnNlcnQoMCwgYm90dG9tKTtcbiAgICAgICAgLy8gYm91bmRzLnNtb290aCgpO1xuXG4gICAgICAgIG1pZGRsZS5hZGQocG9pbnQpO1xuICAgICAgICBwYXRoRGF0YVtzaGFwZS5zdHJpbmdpZnlQb2ludChwb2ludCldID0ge1xuICAgICAgICAgIHBvaW50OiBwb2ludCxcbiAgICAgICAgICBzaXplOiBhdmdTaXplLFxuICAgICAgICAgIHNwZWVkOiBNYXRoLmFicyhldmVudC5vdmVyYWxsVmVsb2NpdHkpXG4gICAgICAgIH07XG4gICAgICAgIC8vIGlmIChzaGFwZS5zdHJpbmdpZnlQb2ludChwb2ludCkgaW4gcGF0aERhdGEpIHtcbiAgICAgICAgLy8gICBsb2coJ2R1cGxpY2F0ZSEnKTtcbiAgICAgICAgLy8gfSBlbHNlIHtcbiAgICAgICAgLy8gfVxuICAgICAgICAvLyBtaWRkbGUuc21vb3RoKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBkb24ndCBoYXZlIGFueXRoaW5nIHRvIGNvbXBhcmUgdG9cbiAgICAgICAgZGlzdCA9IDE7XG4gICAgICAgIGFuZ2xlID0gMDtcblxuICAgICAgICBzaXplID0gZGlzdCAqIGFscGhhO1xuICAgICAgICBzaXplID0gTWF0aC5tYXgoTWF0aC5taW4oc2l6ZSwgbWF4KSwgbWluKTsgLy8gY2xhbXAgc2l6ZSB0byBbbWluLCBtYXhdXG4gICAgICAgIHBhdGhEYXRhW3NoYXBlLnN0cmluZ2lmeVBvaW50KHBvaW50KV0gPSB7XG4gICAgICAgICAgcG9pbnQ6IHBvaW50LFxuICAgICAgICAgIHNwZWVkOiBNYXRoLmFicyhldmVudC5vdmVyYWxsVmVsb2NpdHkpXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIHBhcGVyLnZpZXcuZHJhdygpO1xuXG4gICAgICBwcmV2UG9pbnQgPSBwb2ludDtcbiAgICAgIHNpemVzLnB1c2goc2l6ZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGFuRW5kKGV2ZW50KSB7XG4gICAgICBpZiAocGluY2hpbmcpIHJldHVybjtcblxuICAgICAgY29uc3QgcG9pbnRlciA9IGV2ZW50LmNlbnRlcjtcbiAgICAgIGNvbnN0IHBvaW50ID0gbmV3IFBvaW50KHBvaW50ZXIueCwgcG9pbnRlci55KTtcblxuICAgICAgbGV0IGdyb3VwID0gbmV3IEdyb3VwKFtib3VuZHMsIG1pZGRsZV0pO1xuICAgICAgZ3JvdXAuZGF0YS5jb2xvciA9IGJvdW5kcy5maWxsQ29sb3I7XG4gICAgICBncm91cC5kYXRhLnVwZGF0ZSA9IHRydWU7XG5cbiAgICAgIGJvdW5kcy5hZGQocG9pbnQpO1xuICAgICAgYm91bmRzLmNsb3NlZCA9IHRydWU7XG4gICAgICAvLyBib3VuZHMuc2ltcGxpZnkoKTtcblxuICAgICAgbWlkZGxlLmFkZChwb2ludCk7XG4gICAgICAvLyBtaWRkbGUuc2ltcGxpZnkoKTtcblxuICAgICAgc2lkZS5wdXNoKHBvaW50KTtcbiAgICAgIHNpZGVzLnB1c2goc2lkZSk7XG5cbiAgICAgIHBhdGhEYXRhW3NoYXBlLnN0cmluZ2lmeVBvaW50KHBvaW50KV0gPSB7XG4gICAgICAgIHBvaW50OiBwb2ludCxcbiAgICAgICAgbGFzdDogdHJ1ZVxuICAgICAgfTtcblxuICAgICAgY29ybmVycy5wdXNoKHBvaW50KTtcblxuICAgICAgLy8gbWlkZGxlLnNpbXBsaWZ5KCk7XG4gICAgICBtaWRkbGUucmVkdWNlKCk7XG4gICAgICBsZXQgW3RydWVkR3JvdXAsIHRydWVXYXNOZWNlc3NhcnldID0gdXRpbC50cnVlR3JvdXAoZ3JvdXAsIGNvcm5lcnMpO1xuICAgICAgZ3JvdXAucmVwbGFjZVdpdGgodHJ1ZWRHcm91cCk7XG4gICAgICBtaWRkbGUgPSBncm91cC5fbmFtZWRDaGlsZHJlbi5taWRkbGVbMF07XG4gICAgICBtaWRkbGUuc3Ryb2tlQ29sb3IgPSBncm91cC5zdHJva2VDb2xvcjtcbiAgICAgIC8vIG1pZGRsZS5zZWxlY3RlZCA9IHRydWU7XG5cbiAgICAgIC8vIGJvdW5kcy5mbGF0dGVuKDQpO1xuICAgICAgLy8gYm91bmRzLnNtb290aCgpO1xuXG4gICAgICAvLyBtaWRkbGUuZmxhdHRlbig0KTtcbiAgICAgIC8vIG1pZGRsZS5yZWR1Y2UoKTtcblxuICAgICAgLy8gbWlkZGxlLnNpbXBsaWZ5KCk7XG4gICAgICBpZiAodHJ1ZVdhc05lY2Vzc2FyeSkge1xuICAgICAgICBsZXQgY29tcHV0ZWRDb3JuZXJzID0gc2hhcGUuZ2V0Q29tcHV0ZWRDb3JuZXJzKG1pZGRsZSk7XG4gICAgICAgIGxldCBjb21wdXRlZENvcm5lcnNQYXRoID0gbmV3IFBhdGgoY29tcHV0ZWRDb3JuZXJzKTtcbiAgICAgICAgY29tcHV0ZWRDb3JuZXJzUGF0aC52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgIGxldCBjb21wdXRlZENvcm5lcnNQYXRoTGVuZ3RoID0gY29tcHV0ZWRDb3JuZXJzUGF0aC5sZW5ndGg7XG4gICAgICAgIGlmIChNYXRoLmFicyhjb21wdXRlZENvcm5lcnNQYXRoTGVuZ3RoIC0gbWlkZGxlLmxlbmd0aCkgLyBtaWRkbGUubGVuZ3RoIDw9IDAuMSkge1xuICAgICAgICAgIG1pZGRsZS5zZWdtZW50cyA9IGNvbXB1dGVkQ29ybmVycztcbiAgICAgICAgICAvLyBtaWRkbGUucmVkdWNlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbWlkZGxlLnJlZHVjZSgpO1xuXG4gICAgICAgIC8vIG1pZGRsZS5zZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAvLyBtaWRkbGUudmlzaWJsZSA9IHRydWU7XG4gICAgICAgIC8vIG1pZGRsZS5zdHJva2VDb2xvciA9ICdwaW5rJztcbiAgICAgICAgLy8gbWlkZGxlLnN0cm9rZVdlaWdodCA9IDUwO1xuXG5cbiAgICAgICAgLy8gbGV0IG1lcmdlZENvcm5lcnMgPSBjb3JuZXJzLmNvbmNhdChjb21wdXRlZENvcm5lcnMpO1xuICAgICAgICAvLyBsZXQgZm9vID0gbmV3IFBhdGgobWVyZ2VkQ29ybmVycyk7XG4gICAgICAgIC8vIGZvby5zdHJva2VXaWR0aCA9IDU7XG4gICAgICAgIC8vIGZvby5zdHJva2VDb2xvciA9ICdibHVlJztcbiAgICAgICAgLy8gbGV0IGNvcm5lcnNQYXRoID0gbmV3IFBhdGgoe1xuICAgICAgICAvLyAgIHN0cm9rZVdpZHRoOiA1LFxuICAgICAgICAvLyAgIHN0cm9rZUNvbG9yOiAncmVkJ1xuICAgICAgICAvLyB9KTtcbiAgICAgICAgLy8gQmFzZS5lYWNoKG1lcmdlZENvcm5lcnMsIChjb3JuZXIsIGkpID0+IHtcbiAgICAgICAgLy8gICBjb3JuZXJzUGF0aC5hZGQoY29ybmVyKTtcbiAgICAgICAgLy8gICAvLyBpZiAoaSA8IDIpIHtcbiAgICAgICAgLy8gICAvLyAgIGNvcm5lcnNQYXRoLmFkZChjb3JuZXIpO1xuICAgICAgICAvLyAgIC8vIH0gZWxzZSB7XG4gICAgICAgIC8vICAgLy8gICBsZXQgY2xvc2VzdFBvaW50ID0gY29ybmVyc1BhdGguZ2V0TmVhcmVzdFBvaW50KGNvcm5lcik7XG4gICAgICAgIC8vICAgLy8gICBjb3JuZXJzUGF0aC5pbnNlcnQoY29ybmVyLCBjbG9zZXN0UG9pbnQuaW5kZXggKyAxKTtcbiAgICAgICAgLy8gICAvLyB9XG4gICAgICAgIC8vIH0pO1xuICAgICAgICAvLyBsZXQgY29ybmVyc1BhdGggPSBuZXcgUGF0aCh7XG4gICAgICAgIC8vICAgc3Ryb2tlV2lkdGg6IDUsXG4gICAgICAgIC8vICAgc3Ryb2tlQ29sb3I6ICdyZWQnLFxuICAgICAgICAvLyAgIHNlZ21lbnRzOiBjb3JuZXJzXG4gICAgICAgIC8vIH0pO1xuICAgICAgICAvLyBsZXQgY29tcHV0ZWRDb3JuZXJzUGF0aCA9IG5ldyBQYXRoKHtcbiAgICAgICAgLy8gICBzdHJva2VXaWR0aDogNSxcbiAgICAgICAgLy8gICBzdHJva2VDb2xvcjogJ2JsdWUnLFxuICAgICAgICAvLyAgIHNlZ21lbnRzOiBjb21wdXRlZENvcm5lcnMsXG4gICAgICAgIC8vICAgY2xvc2VkOiB0cnVlXG4gICAgICAgIC8vIH0pO1xuXG4gICAgICAgIC8vIGxldCB0aHJlc2hvbGREaXN0ID0gMC4wNSAqIGNvbXB1dGVkQ29ybmVyc1BhdGgubGVuZ3RoO1xuICAgICAgICAvL1xuICAgICAgICAvLyBCYXNlLmVhY2goY29ybmVycywgKGNvcm5lciwgaSkgPT4ge1xuICAgICAgICAvLyAgIGxldCBpbnRlZ2VyUG9pbnQgPSBzaGFwZS5nZXRJbnRlZ2VyUG9pbnQoY29ybmVyKTtcbiAgICAgICAgLy8gICBsZXQgY2xvc2VzdFBvaW50ID0gY29tcHV0ZWRDb3JuZXJzUGF0aC5nZXROZWFyZXN0UG9pbnQoY29ybmVyKTtcbiAgICAgICAgLy8gfSk7XG4gICAgICAgIC8vIGNvbXB1dGVkQ29ybmVycy52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgIC8vIGNvbXB1dGVkQ29ybmVyc1BhdGgudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICAvLyBsZXQgbWVyZ2VkQ29ybmVyc1BhdGggPSBjb3JuZXJzUGF0aC51bml0ZShjb21wdXRlZENvcm5lcnNQYXRoKTtcbiAgICAgICAgLy8gbWVyZ2VkQ29ybmVyc1BhdGguc3Ryb2tlQ29sb3IgPSAncHVycGxlJztcbiAgICAgICAgLy8gY29ybmVyc1BhdGguZmxhdHRlbigpO1xuICAgICAgLy8gfVxuXG4gICAgICAvLyBpZiAodHJ1ZVdhc05lY2Vzc2FyeSkge1xuICAgICAgLy8gICBsZXQgaWRlYWxHZW9tZXRyeSA9IHNoYXBlLmdldElkZWFsR2VvbWV0cnkocGF0aERhdGEsIHNpZGVzLCBtaWRkbGUpO1xuICAgICAgLy8gICBsb2coaWRlYWxHZW9tZXRyeSk7XG4gICAgICAvLyAgIEJhc2UuZWFjaChjb3JuZXJzLCAoY29ybmVyLCBpKSA9PiB7XG4gICAgICAvLyAgICAgaWRlYWxHZW9tZXRyeS5hZGQoY29ybmVyKTtcbiAgICAgIC8vICAgfSk7XG4gICAgICAvLyAgIGlkZWFsR2VvbWV0cnkucmVkdWNlKCk7XG4gICAgICAvL1xuICAgICAgLy8gICBpZGVhbEdlb21ldHJ5LnN0cm9rZUNvbG9yID0gJ3JlZCc7XG4gICAgICAvLyB9IGVsc2Uge1xuICAgICAgLy8gICBsb2coJ25vIHRydWVpbmcgbmVjZXNzYXJ5Jyk7XG4gICAgICAvLyB9XG4gICAgICAvLyBtaWRkbGUuc21vb3RoKHtcbiAgICAgIC8vICAgdHlwZTogJ2dlb21ldHJpYydcbiAgICAgIC8vIH0pO1xuICAgICAgLy8gbWlkZGxlLmZsYXR0ZW4oMTApO1xuICAgICAgLy8gbWlkZGxlLnNpbXBsaWZ5KCk7XG4gICAgICAvLyBtaWRkbGUuZmxhdHRlbigyMCk7XG4gICAgICAvLyBtaWRkbGUuc2ltcGxpZnkoKTtcbiAgICAgIC8vIG1pZGRsZS5mbGF0dGVuKCk7XG4gICAgICAvLyBtaWRkbGUuc2ltcGxpZnkoKTtcblxuICAgICAgbWlkZGxlLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgIC8vIGxldCBtaWRkbGVDbG9uZSA9IG1pZGRsZS5jbG9uZSgpO1xuICAgICAgLy8gbWlkZGxlQ2xvbmUudmlzaWJsZSA9IHRydWU7XG4gICAgICAvLyBtaWRkbGVDbG9uZS5zdHJva2VDb2xvciA9ICdwaW5rJztcblxuXG4gICAgICBsZXQgaW50ZXJzZWN0aW9ucyA9IG1pZGRsZS5nZXRDcm9zc2luZ3MoKTtcbiAgICAgIGlmIChpbnRlcnNlY3Rpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLy8gd2UgY3JlYXRlIGEgY29weSBvZiB0aGUgcGF0aCBiZWNhdXNlIHJlc29sdmVDcm9zc2luZ3MoKSBzcGxpdHMgc291cmNlIHBhdGhcbiAgICAgICAgbGV0IHBhdGhDb3B5ID0gbmV3IFBhdGgoKTtcbiAgICAgICAgcGF0aENvcHkuY29weUNvbnRlbnQobWlkZGxlKTtcbiAgICAgICAgcGF0aENvcHkudmlzaWJsZSA9IGZhbHNlO1xuXG4gICAgICAgIGxldCBkaXZpZGVkUGF0aCA9IHBhdGhDb3B5LnJlc29sdmVDcm9zc2luZ3MoKTtcbiAgICAgICAgZGl2aWRlZFBhdGgudmlzaWJsZSA9IGZhbHNlO1xuXG5cbiAgICAgICAgbGV0IGVuY2xvc2VkTG9vcHMgPSB1dGlsLmZpbmRJbnRlcmlvckN1cnZlcyhkaXZpZGVkUGF0aCk7XG5cbiAgICAgICAgaWYgKGVuY2xvc2VkTG9vcHMpIHtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVuY2xvc2VkTG9vcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGVuY2xvc2VkTG9vcHNbaV0udmlzaWJsZSA9IHRydWU7XG4gICAgICAgICAgICBlbmNsb3NlZExvb3BzW2ldLmNsb3NlZCA9IHRydWU7XG4gICAgICAgICAgICBlbmNsb3NlZExvb3BzW2ldLmZpbGxDb2xvciA9IG5ldyBDb2xvcigwLCAwKTsgLy8gdHJhbnNwYXJlbnRcbiAgICAgICAgICAgIGVuY2xvc2VkTG9vcHNbaV0uZGF0YS5pbnRlcmlvciA9IHRydWU7XG4gICAgICAgICAgICBlbmNsb3NlZExvb3BzW2ldLmRhdGEudHJhbnNwYXJlbnQgPSB0cnVlO1xuICAgICAgICAgICAgLy8gZW5jbG9zZWRMb29wc1tpXS5ibGVuZE1vZGUgPSAnbXVsdGlwbHknO1xuICAgICAgICAgICAgZ3JvdXAuYWRkQ2hpbGQoZW5jbG9zZWRMb29wc1tpXSk7XG4gICAgICAgICAgICBlbmNsb3NlZExvb3BzW2ldLnNlbmRUb0JhY2soKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcGF0aENvcHkucmVtb3ZlKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBsb2coJ25vIGludGVyc2VjdGlvbnMnKTtcbiAgICAgIH1cblxuICAgICAgZ3JvdXAuZGF0YS5jb2xvciA9IGJvdW5kcy5maWxsQ29sb3I7XG4gICAgICBncm91cC5kYXRhLnNjYWxlID0gMTsgLy8gaW5pdCB2YXJpYWJsZSB0byB0cmFjayBzY2FsZSBjaGFuZ2VzXG4gICAgICBncm91cC5kYXRhLnJvdGF0aW9uID0gMDsgLy8gaW5pdCB2YXJpYWJsZSB0byB0cmFjayByb3RhdGlvbiBjaGFuZ2VzXG5cbiAgICAgIGxldCBjaGlsZHJlbiA9IGdyb3VwLmdldEl0ZW1zKHtcbiAgICAgICAgbWF0Y2g6IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICByZXR1cm4gaXRlbS5uYW1lICE9PSAnbWlkZGxlJ1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gbG9nKCctLS0tLScpO1xuICAgICAgLy8gbG9nKGdyb3VwKTtcbiAgICAgIC8vIGxvZyhjaGlsZHJlbik7XG4gICAgICAvLyBncm91cC5zZWxlY3RlZCA9IHRydWU7XG4gICAgICBsZXQgdW5pdGVkUGF0aCA9IG5ldyBQYXRoKCk7XG4gICAgICBpZiAoY2hpbGRyZW4ubGVuZ3RoID4gMSkge1xuICAgICAgICBsZXQgYWNjdW11bGF0b3IgPSBuZXcgUGF0aCgpO1xuICAgICAgICBhY2N1bXVsYXRvci5jb3B5Q29udGVudChjaGlsZHJlblswXSk7XG4gICAgICAgIGFjY3VtdWxhdG9yLnZpc2libGUgPSBmYWxzZTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgbGV0IG90aGVyUGF0aCA9IG5ldyBQYXRoKCk7XG4gICAgICAgICAgb3RoZXJQYXRoLmNvcHlDb250ZW50KGNoaWxkcmVuW2ldKTtcbiAgICAgICAgICBvdGhlclBhdGgudmlzaWJsZSA9IGZhbHNlO1xuXG4gICAgICAgICAgdW5pdGVkUGF0aCA9IGFjY3VtdWxhdG9yLnVuaXRlKG90aGVyUGF0aCk7XG4gICAgICAgICAgb3RoZXJQYXRoLnJlbW92ZSgpO1xuICAgICAgICAgIGFjY3VtdWxhdG9yID0gdW5pdGVkUGF0aDtcbiAgICAgICAgfVxuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBjaGlsZHJlblswXSBpcyB1bml0ZWQgZ3JvdXBcbiAgICAgICAgdW5pdGVkUGF0aC5jb3B5Q29udGVudChjaGlsZHJlblswXSk7XG4gICAgICB9XG5cbiAgICAgIHVuaXRlZFBhdGgudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgdW5pdGVkUGF0aC5kYXRhLm5hbWUgPSAnbWFzayc7XG5cbiAgICAgIGdyb3VwLmFkZENoaWxkKHVuaXRlZFBhdGgpO1xuICAgICAgdW5pdGVkUGF0aC5zZW5kVG9CYWNrKCk7XG5cbiAgICAgIC8vIG1pZGRsZS5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAvLyBtaWRkbGUudmlzaWJsZSA9IHRydWU7XG4gICAgICAvLyBtaWRkbGUuc3Ryb2tlQ29sb3IgPSAncGluayc7XG5cbiAgICAgIGxhc3RDaGlsZCA9IGdyb3VwO1xuXG4gICAgICBNT1ZFUy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ25ld0dyb3VwJyxcbiAgICAgICAgaWQ6IGdyb3VwLmlkXG4gICAgICB9KTtcblxuICAgICAgaWYgKHJ1bkFuaW1hdGlvbnMpIHtcbiAgICAgICAgZ3JvdXAuYW5pbWF0ZShcbiAgICAgICAgICBbe1xuICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICBzY2FsZTogMC45XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgICAgICAgZHVyYXRpb246IDEwMCxcbiAgICAgICAgICAgICAgZWFzaW5nOiBcImVhc2VPdXRcIixcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgc2NhbGU6IDEuMTFcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXR0aW5nczoge1xuICAgICAgICAgICAgICBkdXJhdGlvbjogMTAwLFxuICAgICAgICAgICAgICBlYXNpbmc6IFwiZWFzZUluXCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxldCBwaW5jaGluZztcbiAgICBsZXQgcGluY2hlZEdyb3VwLCBsYXN0U2NhbGUsIGxhc3RSb3RhdGlvbjtcbiAgICBsZXQgb3JpZ2luYWxQb3NpdGlvbiwgb3JpZ2luYWxSb3RhdGlvbiwgb3JpZ2luYWxTY2FsZTtcblxuICAgIGZ1bmN0aW9uIHBpbmNoU3RhcnQoZXZlbnQpIHtcbiAgICAgIGxvZygncGluY2hTdGFydCcsIGV2ZW50LmNlbnRlcik7XG4gICAgICBoYW1tZXJNYW5hZ2VyLmdldCgncGFuJykuc2V0KHtlbmFibGU6IGZhbHNlfSk7XG4gICAgICBjb25zdCBwb2ludGVyID0gZXZlbnQuY2VudGVyLFxuICAgICAgICAgIHBvaW50ID0gbmV3IFBvaW50KHBvaW50ZXIueCwgcG9pbnRlci55KSxcbiAgICAgICAgICBoaXRSZXN1bHQgPSBoaXRUZXN0R3JvdXBCb3VuZHMocG9pbnQpO1xuXG4gICAgICBpZiAoaGl0UmVzdWx0KSB7XG4gICAgICAgIHBpbmNoaW5nID0gdHJ1ZTtcbiAgICAgICAgLy8gcGluY2hlZEdyb3VwID0gaGl0UmVzdWx0Lml0ZW0ucGFyZW50O1xuICAgICAgICBwaW5jaGVkR3JvdXAgPSBoaXRSZXN1bHQ7XG4gICAgICAgIGxhc3RTY2FsZSA9IDE7XG4gICAgICAgIGxhc3RSb3RhdGlvbiA9IGV2ZW50LnJvdGF0aW9uO1xuXG4gICAgICAgIG9yaWdpbmFsUG9zaXRpb24gPSBwaW5jaGVkR3JvdXAucG9zaXRpb247XG4gICAgICAgIC8vIG9yaWdpbmFsUm90YXRpb24gPSBwaW5jaGVkR3JvdXAucm90YXRpb247XG4gICAgICAgIG9yaWdpbmFsUm90YXRpb24gPSBwaW5jaGVkR3JvdXAuZGF0YS5yb3RhdGlvbjtcbiAgICAgICAgb3JpZ2luYWxTY2FsZSA9IHBpbmNoZWRHcm91cC5kYXRhLnNjYWxlO1xuXG4gICAgICAgIGlmIChydW5BbmltYXRpb25zKSB7XG4gICAgICAgICAgcGluY2hlZEdyb3VwLmFuaW1hdGUoe1xuICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICBzY2FsZTogMS4yNVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldHRpbmdzOiB7XG4gICAgICAgICAgICAgIGR1cmF0aW9uOiAxMDAsXG4gICAgICAgICAgICAgIGVhc2luZzogXCJlYXNlT3V0XCIsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBpbmNoZWRHcm91cCA9IG51bGw7XG4gICAgICAgIGxvZygnaGl0IG5vIGl0ZW0nKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwaW5jaE1vdmUoZXZlbnQpIHtcbiAgICAgIGxvZygncGluY2hNb3ZlJyk7XG4gICAgICBpZiAoISFwaW5jaGVkR3JvdXApIHtcbiAgICAgICAgLy8gbG9nKCdwaW5jaG1vdmUnLCBldmVudCk7XG4gICAgICAgIC8vIGxvZyhwaW5jaGVkR3JvdXApO1xuICAgICAgICBsZXQgY3VycmVudFNjYWxlID0gZXZlbnQuc2NhbGU7XG4gICAgICAgIGxldCBzY2FsZURlbHRhID0gY3VycmVudFNjYWxlIC8gbGFzdFNjYWxlO1xuICAgICAgICAvLyBsb2cobGFzdFNjYWxlLCBjdXJyZW50U2NhbGUsIHNjYWxlRGVsdGEpO1xuICAgICAgICBsYXN0U2NhbGUgPSBjdXJyZW50U2NhbGU7XG5cbiAgICAgICAgbGV0IGN1cnJlbnRSb3RhdGlvbiA9IGV2ZW50LnJvdGF0aW9uO1xuICAgICAgICBsZXQgcm90YXRpb25EZWx0YSA9IGN1cnJlbnRSb3RhdGlvbiAtIGxhc3RSb3RhdGlvbjtcbiAgICAgICAgbG9nKGxhc3RSb3RhdGlvbiwgY3VycmVudFJvdGF0aW9uLCByb3RhdGlvbkRlbHRhKTtcbiAgICAgICAgbGFzdFJvdGF0aW9uID0gY3VycmVudFJvdGF0aW9uO1xuXG4gICAgICAgIC8vIGxvZyhgc2NhbGluZyBieSAke3NjYWxlRGVsdGF9YCk7XG4gICAgICAgIC8vIGxvZyhgcm90YXRpbmcgYnkgJHtyb3RhdGlvbkRlbHRhfWApO1xuXG4gICAgICAgIHBpbmNoZWRHcm91cC5wb3NpdGlvbiA9IGV2ZW50LmNlbnRlcjtcbiAgICAgICAgcGluY2hlZEdyb3VwLnNjYWxlKHNjYWxlRGVsdGEpO1xuICAgICAgICBwaW5jaGVkR3JvdXAucm90YXRlKHJvdGF0aW9uRGVsdGEpO1xuXG4gICAgICAgIHBpbmNoZWRHcm91cC5kYXRhLnNjYWxlICo9IHNjYWxlRGVsdGE7XG4gICAgICAgIHBpbmNoZWRHcm91cC5kYXRhLnJvdGF0aW9uICs9IHJvdGF0aW9uRGVsdGE7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IGxhc3RFdmVudDtcbiAgICBmdW5jdGlvbiBwaW5jaEVuZChldmVudCkge1xuICAgICAgLy8gd2FpdCAyNTAgbXMgdG8gcHJldmVudCBtaXN0YWtlbiBwYW4gcmVhZGluZ3NcbiAgICAgIGxhc3RFdmVudCA9IGV2ZW50O1xuICAgICAgaWYgKCEhcGluY2hlZEdyb3VwKSB7XG4gICAgICAgIHBpbmNoZWRHcm91cC5kYXRhLnVwZGF0ZSA9IHRydWU7XG4gICAgICAgIGxldCBtb3ZlID0ge1xuICAgICAgICAgIGlkOiBwaW5jaGVkR3JvdXAuaWQsXG4gICAgICAgICAgdHlwZTogJ3RyYW5zZm9ybSdcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHBpbmNoZWRHcm91cC5wb3NpdGlvbiAhPSBvcmlnaW5hbFBvc2l0aW9uKSB7XG4gICAgICAgICAgbW92ZS5wb3NpdGlvbiA9IG9yaWdpbmFsUG9zaXRpb247XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGluY2hlZEdyb3VwLmRhdGEucm90YXRpb24gIT0gb3JpZ2luYWxSb3RhdGlvbikge1xuICAgICAgICAgIG1vdmUucm90YXRpb24gPSBvcmlnaW5hbFJvdGF0aW9uIC0gcGluY2hlZEdyb3VwLmRhdGEucm90YXRpb247XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGluY2hlZEdyb3VwLmRhdGEuc2NhbGUgIT0gb3JpZ2luYWxTY2FsZSkge1xuICAgICAgICAgIG1vdmUuc2NhbGUgPSBvcmlnaW5hbFNjYWxlIC8gcGluY2hlZEdyb3VwLmRhdGEuc2NhbGU7XG4gICAgICAgIH1cblxuICAgICAgICBsb2coJ2ZpbmFsIHNjYWxlJywgcGluY2hlZEdyb3VwLmRhdGEuc2NhbGUpO1xuICAgICAgICBsb2cobW92ZSk7XG5cbiAgICAgICAgTU9WRVMucHVzaChtb3ZlKTtcblxuICAgICAgICBpZiAoTWF0aC5hYnMoZXZlbnQudmVsb2NpdHkpID4gMSkge1xuICAgICAgICAgIC8vIGRpc3Bvc2Ugb2YgZ3JvdXAgb2Zmc2NyZWVuXG4gICAgICAgICAgdGhyb3dQaW5jaGVkR3JvdXAoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIChydW5BbmltYXRpb25zKSB7XG4gICAgICAgIC8vICAgcGluY2hlZEdyb3VwLmFuaW1hdGUoe1xuICAgICAgICAvLyAgICAgcHJvcGVydGllczoge1xuICAgICAgICAvLyAgICAgICBzY2FsZTogMC44XG4gICAgICAgIC8vICAgICB9LFxuICAgICAgICAvLyAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgLy8gICAgICAgZHVyYXRpb246IDEwMCxcbiAgICAgICAgLy8gICAgICAgZWFzaW5nOiBcImVhc2VPdXRcIixcbiAgICAgICAgLy8gICAgIH1cbiAgICAgICAgLy8gICB9KTtcbiAgICAgICAgLy8gfVxuICAgICAgfVxuICAgICAgcGluY2hpbmcgPSBmYWxzZTtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIGhhbW1lck1hbmFnZXIuZ2V0KCdwYW4nKS5zZXQoe2VuYWJsZTogdHJ1ZX0pO1xuICAgICAgfSwgMjUwKTtcbiAgICB9XG5cbiAgICBjb25zdCBoaXRPcHRpb25zID0ge1xuICAgICAgc2VnbWVudHM6IGZhbHNlLFxuICAgICAgc3Ryb2tlOiB0cnVlLFxuICAgICAgZmlsbDogdHJ1ZSxcbiAgICAgIHRvbGVyYW5jZTogNVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBzaW5nbGVUYXAoZXZlbnQpIHtcbiAgICAgIGNvbnN0IHBvaW50ZXIgPSBldmVudC5jZW50ZXIsXG4gICAgICAgICAgcG9pbnQgPSBuZXcgUG9pbnQocG9pbnRlci54LCBwb2ludGVyLnkpLFxuICAgICAgICAgIGhpdFJlc3VsdCA9IHBhcGVyLnByb2plY3QuaGl0VGVzdChwb2ludCwgaGl0T3B0aW9ucyk7XG5cbiAgICAgIGlmIChoaXRSZXN1bHQpIHtcbiAgICAgICAgbGV0IGl0ZW0gPSBoaXRSZXN1bHQuaXRlbTtcbiAgICAgICAgaXRlbS5zZWxlY3RlZCA9ICFpdGVtLnNlbGVjdGVkO1xuICAgICAgICBsb2coaXRlbSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZG91YmxlVGFwKGV2ZW50KSB7XG4gICAgICBjb25zdCBwb2ludGVyID0gZXZlbnQuY2VudGVyLFxuICAgICAgICAgIHBvaW50ID0gbmV3IFBvaW50KHBvaW50ZXIueCwgcG9pbnRlci55KSxcbiAgICAgICAgICBoaXRSZXN1bHQgPSBwYXBlci5wcm9qZWN0LmhpdFRlc3QocG9pbnQsIGhpdE9wdGlvbnMpO1xuXG4gICAgICBpZiAoaGl0UmVzdWx0KSB7XG4gICAgICAgIGxldCBpdGVtID0gaGl0UmVzdWx0Lml0ZW07XG4gICAgICAgIGxldCBwYXJlbnQgPSBpdGVtLnBhcmVudDtcblxuICAgICAgICBpZiAoaXRlbS5kYXRhLmludGVyaW9yKSB7XG4gICAgICAgICAgaXRlbS5kYXRhLnRyYW5zcGFyZW50ID0gIWl0ZW0uZGF0YS50cmFuc3BhcmVudDtcblxuICAgICAgICAgIGlmIChpdGVtLmRhdGEudHJhbnNwYXJlbnQpIHtcbiAgICAgICAgICAgIGl0ZW0uZmlsbENvbG9yID0gdHJhbnNwYXJlbnQ7XG4gICAgICAgICAgICBpdGVtLnN0cm9rZUNvbG9yID0gdHJhbnNwYXJlbnQ7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGl0ZW0uZmlsbENvbG9yID0gcGFyZW50LmRhdGEuY29sb3I7XG4gICAgICAgICAgICBpdGVtLnN0cm9rZUNvbG9yID0gcGFyZW50LmRhdGEuY29sb3I7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgTU9WRVMucHVzaCh7XG4gICAgICAgICAgICB0eXBlOiAnZmlsbENoYW5nZScsXG4gICAgICAgICAgICBpZDogaXRlbS5pZCxcbiAgICAgICAgICAgIGZpbGw6IHBhcmVudC5kYXRhLmNvbG9yLFxuICAgICAgICAgICAgdHJhbnNwYXJlbnQ6IGl0ZW0uZGF0YS50cmFuc3BhcmVudFxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxvZygnbm90IGludGVyaW9yJylcbiAgICAgICAgfVxuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwaW5jaGVkR3JvdXAgPSBudWxsO1xuICAgICAgICBsb2coJ2hpdCBubyBpdGVtJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgdmVsb2NpdHlNdWx0aXBsaWVyID0gMjU7XG4gICAgZnVuY3Rpb24gdGhyb3dQaW5jaGVkR3JvdXAoKSB7XG4gICAgICBsb2cocGluY2hlZEdyb3VwLnBvc2l0aW9uKTtcbiAgICAgIGlmIChwaW5jaGVkR3JvdXAucG9zaXRpb24ueCA8PSAwIC0gcGluY2hlZEdyb3VwLmJvdW5kcy53aWR0aCB8fFxuICAgICAgICAgIHBpbmNoZWRHcm91cC5wb3NpdGlvbi54ID49IHZpZXdXaWR0aCArIHBpbmNoZWRHcm91cC5ib3VuZHMud2lkdGggfHxcbiAgICAgICAgICBwaW5jaGVkR3JvdXAucG9zaXRpb24ueSA8PSAwIC0gcGluY2hlZEdyb3VwLmJvdW5kcy5oZWlnaHQgfHxcbiAgICAgICAgICBwaW5jaGVkR3JvdXAucG9zaXRpb24ueSA+PSB2aWV3SGVpZ2h0ICsgcGluY2hlZEdyb3VwLmJvdW5kcy5oZWlnaHQpIHtcbiAgICAgICAgICAgIHBpbmNoZWRHcm91cC5kYXRhLm9mZlNjcmVlbiA9IHRydWU7XG4gICAgICAgICAgICBwaW5jaGVkR3JvdXAudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhyb3dQaW5jaGVkR3JvdXApO1xuICAgICAgcGluY2hlZEdyb3VwLnBvc2l0aW9uLnggKz0gbGFzdEV2ZW50LnZlbG9jaXR5WCAqIHZlbG9jaXR5TXVsdGlwbGllcjtcbiAgICAgIHBpbmNoZWRHcm91cC5wb3NpdGlvbi55ICs9IGxhc3RFdmVudC52ZWxvY2l0eVkgKiB2ZWxvY2l0eU11bHRpcGxpZXI7XG4gICAgfVxuXG4gICAgdmFyIGhhbW1lck1hbmFnZXIgPSBuZXcgSGFtbWVyLk1hbmFnZXIoJGNhbnZhc1swXSk7XG5cbiAgICBoYW1tZXJNYW5hZ2VyLmFkZChuZXcgSGFtbWVyLlRhcCh7IGV2ZW50OiAnZG91YmxldGFwJywgdGFwczogMiB9KSk7XG4gICAgaGFtbWVyTWFuYWdlci5hZGQobmV3IEhhbW1lci5UYXAoeyBldmVudDogJ3NpbmdsZXRhcCcgfSkpO1xuICAgIGhhbW1lck1hbmFnZXIuYWRkKG5ldyBIYW1tZXIuUGFuKHsgZGlyZWN0aW9uOiBIYW1tZXIuRElSRUNUSU9OX0FMTCB9KSk7XG4gICAgaGFtbWVyTWFuYWdlci5hZGQobmV3IEhhbW1lci5QaW5jaCgpKTtcblxuICAgIGhhbW1lck1hbmFnZXIuZ2V0KCdkb3VibGV0YXAnKS5yZWNvZ25pemVXaXRoKCdzaW5nbGV0YXAnKTtcbiAgICBoYW1tZXJNYW5hZ2VyLmdldCgnc2luZ2xldGFwJykucmVxdWlyZUZhaWx1cmUoJ2RvdWJsZXRhcCcpO1xuICAgIGhhbW1lck1hbmFnZXIuZ2V0KCdwYW4nKS5yZXF1aXJlRmFpbHVyZSgncGluY2gnKTtcblxuICAgIGhhbW1lck1hbmFnZXIub24oJ3NpbmdsZXRhcCcsIHNpbmdsZVRhcCk7XG4gICAgaGFtbWVyTWFuYWdlci5vbignZG91YmxldGFwJywgZG91YmxlVGFwKTtcblxuICAgIGhhbW1lck1hbmFnZXIub24oJ3BhbnN0YXJ0JywgcGFuU3RhcnQpO1xuICAgIGhhbW1lck1hbmFnZXIub24oJ3Bhbm1vdmUnLCBwYW5Nb3ZlKTtcbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdwYW5lbmQnLCBwYW5FbmQpO1xuXG4gICAgaGFtbWVyTWFuYWdlci5vbigncGluY2hzdGFydCcsIHBpbmNoU3RhcnQpO1xuICAgIGhhbW1lck1hbmFnZXIub24oJ3BpbmNobW92ZScsIHBpbmNoTW92ZSk7XG4gICAgaGFtbWVyTWFuYWdlci5vbigncGluY2hlbmQnLCBwaW5jaEVuZCk7XG4gICAgaGFtbWVyTWFuYWdlci5vbigncGluY2hjYW5jZWwnLCBmdW5jdGlvbigpIHsgaGFtbWVyTWFuYWdlci5nZXQoJ3BhbicpLnNldCh7ZW5hYmxlOiB0cnVlfSk7IH0pOyAvLyBtYWtlIHN1cmUgaXQncyByZWVuYWJsZWRcbiAgfVxuXG4gIGZ1bmN0aW9uIG5ld1ByZXNzZWQoKSB7XG4gICAgbG9nKCduZXcgcHJlc3NlZCcpO1xuXG4gICAgcGFwZXIucHJvamVjdC5hY3RpdmVMYXllci5yZW1vdmVDaGlsZHJlbigpO1xuICB9XG5cbiAgZnVuY3Rpb24gdW5kb1ByZXNzZWQoKSB7XG4gICAgbG9nKCd1bmRvIHByZXNzZWQnKTtcbiAgICBpZiAoIShNT1ZFUy5sZW5ndGggPiAwKSkge1xuICAgICAgbG9nKCdubyBtb3ZlcyB5ZXQnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgbGFzdE1vdmUgPSBNT1ZFUy5wb3AoKTtcbiAgICBsZXQgaXRlbSA9IHByb2plY3QuZ2V0SXRlbSh7XG4gICAgICBpZDogbGFzdE1vdmUuaWRcbiAgICB9KTtcblxuICAgIGlmIChpdGVtKSB7XG4gICAgICBpdGVtLnZpc2libGUgPSB0cnVlOyAvLyBtYWtlIHN1cmVcbiAgICAgIHN3aXRjaChsYXN0TW92ZS50eXBlKSB7XG4gICAgICAgIGNhc2UgJ25ld0dyb3VwJzpcbiAgICAgICAgICBsb2coJ3JlbW92aW5nIGdyb3VwJyk7XG4gICAgICAgICAgaXRlbS5yZW1vdmUoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZmlsbENoYW5nZSc6XG4gICAgICAgICAgaWYgKGxhc3RNb3ZlLnRyYW5zcGFyZW50KSB7XG4gICAgICAgICAgICBpdGVtLmZpbGxDb2xvciA9IGxhc3RNb3ZlLmZpbGw7XG4gICAgICAgICAgICBpdGVtLnN0cm9rZUNvbG9yID0gbGFzdE1vdmUuZmlsbDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaXRlbS5maWxsQ29sb3IgPSB0cmFuc3BhcmVudDtcbiAgICAgICAgICAgIGl0ZW0uc3Ryb2tlQ29sb3IgPSB0cmFuc3BhcmVudDtcbiAgICAgICAgICB9XG4gICAgICAgIGNhc2UgJ3RyYW5zZm9ybSc6XG4gICAgICAgICAgaWYgKCEhbGFzdE1vdmUucG9zaXRpb24pIHtcbiAgICAgICAgICAgIGl0ZW0ucG9zaXRpb24gPSBsYXN0TW92ZS5wb3NpdGlvblxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoISFsYXN0TW92ZS5yb3RhdGlvbikge1xuICAgICAgICAgICAgaXRlbS5yb3RhdGlvbiA9IGxhc3RNb3ZlLnJvdGF0aW9uO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoISFsYXN0TW92ZS5zY2FsZSkge1xuICAgICAgICAgICAgaXRlbS5zY2FsZShsYXN0TW92ZS5zY2FsZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGxvZygndW5rbm93biBjYXNlJyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZygnY291bGQgbm90IGZpbmQgbWF0Y2hpbmcgaXRlbScpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHBsYXlQcmVzc2VkKCkge1xuICAgIGxvZygncGxheSBwcmVzc2VkJyk7XG4gIH1cblxuICBmdW5jdGlvbiB0aXBzUHJlc3NlZCgpIHtcbiAgICBsb2coJ3RpcHMgcHJlc3NlZCcpO1xuICB9XG5cbiAgZnVuY3Rpb24gc2hhcmVQcmVzc2VkKCkge1xuICAgIGxvZygnc2hhcmUgcHJlc3NlZCcpO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdE5ldygpIHtcbiAgICAkKCcubWFpbi1jb250cm9scyAubmV3Jykub24oJ2NsaWNrIHRhcCB0b3VjaCcsIG5ld1ByZXNzZWQpO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdFVuZG8oKSB7XG4gICAgJCgnLm1haW4tY29udHJvbHMgLnVuZG8nKS5vbignY2xpY2snLCB1bmRvUHJlc3NlZCk7XG4gIH1cbiAgZnVuY3Rpb24gaW5pdFBsYXkoKSB7XG4gICAgJCgnLm1haW4tY29udHJvbHMgLnBsYXknKS5vbignY2xpY2snLCBwbGF5UHJlc3NlZCk7XG4gIH1cbiAgZnVuY3Rpb24gaW5pdFRpcHMoKSB7XG4gICAgJCgnLmF1eC1jb250cm9scyAudGlwcycpLm9uKCdjbGljaycsIHRpcHNQcmVzc2VkKTtcbiAgfVxuICBmdW5jdGlvbiBpbml0U2hhcmUoKSB7XG4gICAgJCgnLmF1eC1jb250cm9scyAuc2hhcmUnKS5vbignY2xpY2snLCBzaGFyZVByZXNzZWQpO1xuICB9XG5cbiAgZnVuY3Rpb24gZHJhd0NpcmNsZSgpIHtcbiAgICBsZXQgY2lyY2xlID0gbmV3IFBhdGguQ2lyY2xlKHtcbiAgICAgIGNlbnRlcjogWzQwMCwgNDAwXSxcbiAgICAgIHJhZGl1czogMTAwLFxuICAgICAgc3Ryb2tlQ29sb3I6ICdncmVlbicsXG4gICAgICBmaWxsQ29sb3I6ICdncmVlbidcbiAgICB9KTtcbiAgICBsZXQgZ3JvdXAgPSBuZXcgR3JvdXAoY2lyY2xlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1haW4oKSB7XG4gICAgaW5pdENvbnRyb2xQYW5lbCgpO1xuICAgIC8vIGRyYXdDaXJjbGUoKTtcbiAgICBpbml0Vmlld1ZhcnMoKTtcbiAgfVxuXG4gIG1haW4oKTtcbn0pO1xuIiwiY29uc3QgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuY29uc3QgY29uZmlnID0gcmVxdWlyZSgnLi8uLi8uLi9jb25maWcnKTtcblxuZnVuY3Rpb24gbG9nKC4uLnRoaW5nKSB7XG4gIHV0aWwubG9nKC4uLnRoaW5nKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldElkZWFsR2VvbWV0cnkocGF0aERhdGEsIHNpZGVzLCBzaW1wbGlmaWVkUGF0aCkge1xuICBjb25zdCB0aHJlc2hvbGREaXN0ID0gMC4wNSAqIHNpbXBsaWZpZWRQYXRoLmxlbmd0aDtcblxuICBsZXQgcmV0dXJuUGF0aCA9IG5ldyBQYXRoKHtcbiAgICBzdHJva2VXaWR0aDogNSxcbiAgICBzdHJva2VDb2xvcjogJ3BpbmsnXG4gIH0pO1xuXG4gIGxldCB0cnVlZFBhdGggPSBuZXcgUGF0aCh7XG4gICAgc3Ryb2tlV2lkdGg6IDUsXG4gICAgc3Ryb2tlQ29sb3I6ICdncmVlbidcbiAgfSk7XG5cbiAgLy8gbmV3IFBhdGguQ2lyY2xlKHtcbiAgLy8gICBjZW50ZXI6IHNpbXBsaWZpZWRQYXRoLmZpcnN0U2VnbWVudC5wb2ludCxcbiAgLy8gICByYWRpdXM6IDMsXG4gIC8vICAgZmlsbENvbG9yOiAnYmxhY2snXG4gIC8vIH0pO1xuXG4gIGxldCBmaXJzdFBvaW50ID0gbmV3IFBhdGguQ2lyY2xlKHtcbiAgICBjZW50ZXI6IHNpbXBsaWZpZWRQYXRoLmZpcnN0U2VnbWVudC5wb2ludCxcbiAgICByYWRpdXM6IDEwLFxuICAgIHN0cm9rZUNvbG9yOiAnYmx1ZSdcbiAgfSk7XG5cbiAgbGV0IGxhc3RQb2ludCA9IG5ldyBQYXRoLkNpcmNsZSh7XG4gICAgY2VudGVyOiBzaW1wbGlmaWVkUGF0aC5sYXN0U2VnbWVudC5wb2ludCxcbiAgICByYWRpdXM6IDEwLFxuICAgIHN0cm9rZUNvbG9yOiAncmVkJ1xuICB9KTtcblxuXG4gIGxldCBhbmdsZSwgcHJldkFuZ2xlLCBhbmdsZURlbHRhO1xuICBCYXNlLmVhY2goc2lkZXMsIChzaWRlLCBpKSA9PiB7XG4gICAgbGV0IGZpcnN0UG9pbnQgPSBzaWRlWzBdO1xuICAgIGxldCBsYXN0UG9pbnQgPSBzaWRlW3NpZGUubGVuZ3RoIC0gMV07XG5cbiAgICBhbmdsZSA9IE1hdGguYXRhbjIobGFzdFBvaW50LnkgLSBmaXJzdFBvaW50LnksIGxhc3RQb2ludC54IC0gZmlyc3RQb2ludC54KTtcblxuICAgIGlmICghIXByZXZBbmdsZSkge1xuICAgICAgYW5nbGVEZWx0YSA9IHV0aWwuYW5nbGVEZWx0YShhbmdsZSwgcHJldkFuZ2xlKTtcbiAgICAgIGNvbnNvbGUubG9nKGFuZ2xlRGVsdGEpO1xuICAgICAgcmV0dXJuUGF0aC5hZGQoZmlyc3RQb2ludCk7XG4gICAgICByZXR1cm5QYXRoLmFkZChsYXN0UG9pbnQpO1xuICAgIH1cblxuICAgIHByZXZBbmdsZSA9IGFuZ2xlO1xuICB9KTtcblxuICBCYXNlLmVhY2goc2ltcGxpZmllZFBhdGguc2VnbWVudHMsIChzZWdtZW50LCBpKSA9PiB7XG4gICAgbGV0IGludGVnZXJQb2ludCA9IGdldEludGVnZXJQb2ludChzZWdtZW50LnBvaW50KTtcbiAgICBsZXQgbmVhcmVzdFBvaW50ID0gcmV0dXJuUGF0aC5nZXROZWFyZXN0UG9pbnQoaW50ZWdlclBvaW50KTtcbiAgICAvLyBjb25zb2xlLmxvZyhpbnRlZ2VyUG9pbnQuZ2V0RGlzdGFuY2UobmVhcmVzdFBvaW50KSwgdGhyZXNob2xkRGlzdCk7XG4gICAgaWYgKGludGVnZXJQb2ludC5nZXREaXN0YW5jZShuZWFyZXN0UG9pbnQpIDw9IHRocmVzaG9sZERpc3QpIHtcbiAgICAgIHRydWVkUGF0aC5hZGQobmVhcmVzdFBvaW50KTtcbiAgICAgIG5ldyBQYXRoLkNpcmNsZSh7XG4gICAgICAgIGNlbnRlcjogbmVhcmVzdFBvaW50LFxuICAgICAgICByYWRpdXM6IDMsXG4gICAgICAgIGZpbGxDb2xvcjogJ2JsYWNrJ1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKCdvZmYgcGF0aCcpO1xuICAgICAgdHJ1ZWRQYXRoLmFkZChpbnRlZ2VyUG9pbnQpO1xuICAgICAgbmV3IFBhdGguQ2lyY2xlKHtcbiAgICAgICAgY2VudGVyOiBpbnRlZ2VyUG9pbnQsXG4gICAgICAgIHJhZGl1czogMyxcbiAgICAgICAgZmlsbENvbG9yOiAnZ3JlZW4nXG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIHRydWVkUGF0aC5hZGQoc2ltcGxpZmllZFBhdGgubGFzdFNlZ21lbnQucG9pbnQpO1xuICAvLyBuZXcgUGF0aC5DaXJjbGUoe1xuICAvLyAgIGNlbnRlcjogc2ltcGxpZmllZFBhdGgubGFzdFNlZ21lbnQucG9pbnQsXG4gIC8vICAgcmFkaXVzOiAzLFxuICAvLyAgIGZpbGxDb2xvcjogJ2JsYWNrJ1xuICAvLyB9KTtcblxuICBpZiAoc2ltcGxpZmllZFBhdGguY2xvc2VkKSB7XG4gICAgdHJ1ZWRQYXRoLmNsb3NlZCA9IHRydWU7XG4gIH1cblxuICAvLyBCYXNlLmVhY2godHJ1ZWRQYXRoLCAocG9pbnQsIGkpID0+IHtcbiAgLy8gICB0cnVlZFBhdGgucmVtb3ZlU2VnbWVudChpKTtcbiAgLy8gfSk7XG5cbiAgcmV0dXJuIHRydWVkUGF0aDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIE9sZGdldElkZWFsR2VvbWV0cnkocGF0aERhdGEsIHBhdGgpIHtcbiAgY29uc3QgdGhyZXNob2xkQW5nbGUgPSBNYXRoLlBJIC8gMjtcbiAgY29uc3QgdGhyZXNob2xkRGlzdCA9IDAuMSAqIHBhdGgubGVuZ3RoO1xuICAvLyBsb2cocGF0aCk7XG5cbiAgbGV0IGNvdW50ID0gMDtcblxuICBsZXQgc2lkZXMgPSBbXTtcbiAgbGV0IHNpZGUgPSBbXTtcbiAgbGV0IHByZXY7XG4gIGxldCBwcmV2QW5nbGU7XG5cbiAgLy8gbG9nKCd0aHJlc2hvbGRBbmdsZScsIHRocmVzaG9sZEFuZ2xlKTtcblxuICBsZXQgcmV0dXJuUGF0aCA9IG5ldyBQYXRoKCk7XG5cbiAgQmFzZS5lYWNoKHBhdGguc2VnbWVudHMsIChzZWdtZW50LCBpKSA9PiB7XG4gICAgbGV0IGludGVnZXJQb2ludCA9IGdldEludGVnZXJQb2ludChzZWdtZW50LnBvaW50KTtcbiAgICBsZXQgcG9pbnRTdHIgPSBzdHJpbmdpZnlQb2ludChpbnRlZ2VyUG9pbnQpO1xuICAgIGxldCBwb2ludERhdGE7XG4gICAgaWYgKHBvaW50U3RyIGluIHBhdGhEYXRhKSB7XG4gICAgICBwb2ludERhdGEgPSBwYXRoRGF0YVtwb2ludFN0cl07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBuZWFyZXN0UG9pbnQgPSBnZXRDbG9zZXN0UG9pbnRGcm9tUGF0aERhdGEocGF0aERhdGEsIGludGVnZXJQb2ludCk7XG4gICAgICBwb2ludFN0ciA9IHN0cmluZ2lmeVBvaW50KG5lYXJlc3RQb2ludCk7XG5cbiAgICAgIGlmIChwb2ludFN0ciBpbiBwYXRoRGF0YSkge1xuICAgICAgICBwb2ludERhdGEgPSBwYXRoRGF0YVtwb2ludFN0cl07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsb2coJ2NvdWxkIG5vdCBmaW5kIGNsb3NlIHBvaW50Jyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvaW50RGF0YSkge1xuICAgICAgcmV0dXJuUGF0aC5hZGQoaW50ZWdlclBvaW50KTtcbiAgICAgIG5ldyBQYXRoLkNpcmNsZSh7XG4gICAgICAgIGNlbnRlcjogaW50ZWdlclBvaW50LFxuICAgICAgICByYWRpdXM6IDUsXG4gICAgICAgIHN0cm9rZUNvbG9yOiBuZXcgQ29sb3IoaSAvIHBhdGguc2VnbWVudHMubGVuZ3RoLCBpIC8gcGF0aC5zZWdtZW50cy5sZW5ndGgsIGkgLyBwYXRoLnNlZ21lbnRzLmxlbmd0aClcbiAgICAgIH0pO1xuICAgICAgbG9nKHBvaW50RGF0YS5wb2ludCk7XG4gICAgICBpZiAoIXByZXYpIHtcbiAgICAgICAgLy8gZmlyc3QgcG9pbnRcbiAgICAgICAgLy8gbG9nKCdwdXNoaW5nIGZpcnN0IHBvaW50IHRvIHNpZGUnKTtcbiAgICAgICAgc2lkZS5wdXNoKHBvaW50RGF0YSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBsZXQgYW5nbGVGb28gPSBpbnRlZ2VyUG9pbnQuZ2V0RGlyZWN0ZWRBbmdsZShwcmV2KTtcbiAgICAgICAgbGV0IGFuZ2xlID0gTWF0aC5hdGFuMihpbnRlZ2VyUG9pbnQueSwgaW50ZWdlclBvaW50LngpIC0gTWF0aC5hdGFuMihwcmV2LnksIHByZXYueCk7XG4gICAgICAgIGlmIChhbmdsZSA8IDApIGFuZ2xlICs9ICgyICogTWF0aC5QSSk7IC8vIG5vcm1hbGl6ZSB0byBbMCwgMs+AKVxuICAgICAgICAvLyBsb2coYW5nbGVGb28sIGFuZ2xlQmFyKTtcbiAgICAgICAgLy8gbGV0IGFuZ2xlID0gTWF0aC5hdGFuMihpbnRlZ2VyUG9pbnQueSAtIHByZXYueSwgaW50ZWdlclBvaW50LnggLSBwcmV2LngpO1xuICAgICAgICAvLyBsZXQgbGluZSA9IG5ldyBQYXRoLkxpbmUocHJldiwgaW50ZWdlclBvaW50KTtcbiAgICAgICAgLy8gbGluZS5zdHJva2VXaWR0aCA9IDU7XG4gICAgICAgIC8vIGxpbmUuc3Ryb2tlQ29sb3IgPSAncGluayc7XG4gICAgICAgIC8vIGxpbmUucm90YXRlKHV0aWwuZGVnKE1hdGguY29zKGFuZ2xlKSAqIE1hdGguUEkgKiAyKSk7XG4gICAgICAgIC8vIGxvZygnYW5nbGUnLCBhbmdsZSk7XG4gICAgICAgIGlmICh0eXBlb2YgcHJldkFuZ2xlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIC8vIHNlY29uZCBwb2ludFxuICAgICAgICAgIHNpZGUucHVzaChwb2ludERhdGEpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGV0IGFuZ2xlRGlmZmVyZW5jZSA9IE1hdGgucG93KGFuZ2xlIC0gcHJldkFuZ2xlLCAyKTtcbiAgICAgICAgICBsb2coJ2FuZ2xlRGlmZmVyZW5jZScsIGFuZ2xlRGlmZmVyZW5jZSk7XG4gICAgICAgICAgaWYgKGFuZ2xlRGlmZmVyZW5jZSA8PSB0aHJlc2hvbGRBbmdsZSkge1xuICAgICAgICAgICAgLy8gc2FtZSBzaWRlXG4gICAgICAgICAgICAvLyBsb2coJ3B1c2hpbmcgcG9pbnQgdG8gc2FtZSBzaWRlJyk7XG4gICAgICAgICAgICBzaWRlLnB1c2gocG9pbnREYXRhKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gbmV3IHNpZGVcbiAgICAgICAgICAgIC8vIGxvZygnbmV3IHNpZGUnKTtcbiAgICAgICAgICAgIHNpZGVzLnB1c2goc2lkZSk7XG4gICAgICAgICAgICBzaWRlID0gW3BvaW50RGF0YV07XG5cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwcmV2QW5nbGUgPSBhbmdsZTtcbiAgICAgIH1cblxuICAgICAgcHJldiA9IGludGVnZXJQb2ludDtcbiAgICAgIGNvdW50Kys7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZygnbm8gZGF0YScpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gbG9nKGNvdW50KTtcblxuICBzaWRlcy5wdXNoKHNpZGUpO1xuXG4gIHJldHVybiBzaWRlcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEludGVnZXJQb2ludChwb2ludCkge1xuICByZXR1cm4gbmV3IFBvaW50KE1hdGguZmxvb3IocG9pbnQueCksIE1hdGguZmxvb3IocG9pbnQueSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5naWZ5UG9pbnQocG9pbnQpIHtcbiAgcmV0dXJuIGAke01hdGguZmxvb3IocG9pbnQueCl9LCR7TWF0aC5mbG9vcihwb2ludC55KX1gO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VQb2ludChwb2ludFN0cikge1xuICBsZXQgc3BsaXQgPSBwb2ludFN0ci5zcGxpdCgnLCcpLm1hcCgobnVtKSA9PiBNYXRoLmZsb29yKG51bSkpO1xuXG4gIGlmIChzcGxpdC5sZW5ndGggPj0gMikge1xuICAgIHJldHVybiBuZXcgUG9pbnQoc3BsaXRbMF0sIHNwbGl0WzFdKTtcbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2xvc2VzdFBvaW50RnJvbVBhdGhEYXRhKHBhdGhEYXRhLCBwb2ludCkge1xuICBsZXQgbGVhc3REaXN0YW5jZSwgY2xvc2VzdFBvaW50O1xuXG4gIEJhc2UuZWFjaChwYXRoRGF0YSwgKGRhdHVtLCBpKSA9PiB7XG4gICAgbGV0IGRpc3RhbmNlID0gcG9pbnQuZ2V0RGlzdGFuY2UoZGF0dW0ucG9pbnQpO1xuICAgIGlmICghbGVhc3REaXN0YW5jZSB8fCBkaXN0YW5jZSA8IGxlYXN0RGlzdGFuY2UpIHtcbiAgICAgIGxlYXN0RGlzdGFuY2UgPSBkaXN0YW5jZTtcbiAgICAgIGNsb3Nlc3RQb2ludCA9IGRhdHVtLnBvaW50O1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIGNsb3Nlc3RQb2ludCB8fCBwb2ludDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbXB1dGVkQ29ybmVycyhwYXRoKSB7XG4gIGNvbnN0IHRocmVzaG9sZEFuZ2xlID0gdXRpbC5yYWQoY29uZmlnLnNoYXBlLmNvcm5lclRocmVzaG9sZERlZyk7XG4gIGNvbnN0IHRocmVzaG9sZERpc3RhbmNlID0gMC4xICogcGF0aC5sZW5ndGg7XG5cbiAgbGV0IGNvcm5lcnMgPSBbXTtcblxuICBpZiAocGF0aC5sZW5ndGggPiAwKSB7XG4gICAgbGV0IHBvaW50LCBwcmV2O1xuICAgIGxldCBhbmdsZSwgcHJldkFuZ2xlLCBhbmdsZURlbHRhO1xuXG4gICAgQmFzZS5lYWNoKHBhdGguc2VnbWVudHMsIChzZWdtZW50LCBpKSA9PiB7XG4gICAgICBsZXQgcG9pbnQgPSBnZXRJbnRlZ2VyUG9pbnQoc2VnbWVudC5wb2ludCk7XG4gICAgICBpZiAoISFwcmV2KSB7XG4gICAgICAgIGxldCBhbmdsZSA9IE1hdGguYXRhbjIocG9pbnQueSAtIHByZXYueSwgcG9pbnQueCAtIHByZXYueCk7XG4gICAgICAgIGlmIChhbmdsZSA8IDApIGFuZ2xlICs9ICgyICogTWF0aC5QSSk7IC8vIG5vcm1hbGl6ZSB0byBbMCwgMs+AKVxuICAgICAgICBpZiAoISFwcmV2QW5nbGUpIHtcbiAgICAgICAgICBhbmdsZURlbHRhID0gdXRpbC5hbmdsZURlbHRhKGFuZ2xlLCBwcmV2QW5nbGUpO1xuICAgICAgICAgIGlmIChhbmdsZURlbHRhID49IHRocmVzaG9sZEFuZ2xlKSB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnY29ybmVyJyk7XG4gICAgICAgICAgICAvLyBuZXcgUGF0aC5DaXJjbGUoe1xuICAgICAgICAgICAgLy8gICBjZW50ZXI6IHByZXYsXG4gICAgICAgICAgICAvLyAgIHJhZGl1czogMTAsXG4gICAgICAgICAgICAvLyAgIGZpbGxDb2xvcjogJ3BpbmsnXG4gICAgICAgICAgICAvLyB9KTtcbiAgICAgICAgICAgIGNvcm5lcnMucHVzaChwcmV2KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYW5nbGVEZWx0YSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJldkFuZ2xlID0gYW5nbGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBmaXJzdCBwb2ludFxuICAgICAgICBjb3JuZXJzLnB1c2gocG9pbnQpO1xuICAgICAgICAvLyBuZXcgUGF0aC5DaXJjbGUoe1xuICAgICAgICAvLyAgIGNlbnRlcjogcG9pbnQsXG4gICAgICAgIC8vICAgcmFkaXVzOiAxMCxcbiAgICAgICAgLy8gICBmaWxsQ29sb3I6ICdwaW5rJ1xuICAgICAgICAvLyB9KVxuICAgICAgfVxuICAgICAgcHJldiA9IHBvaW50O1xuICAgIH0pO1xuXG4gICAgbGV0IGxhc3RTZWdtZW50UG9pbnQgPSBnZXRJbnRlZ2VyUG9pbnQocGF0aC5sYXN0U2VnbWVudC5wb2ludCk7XG4gICAgY29ybmVycy5wdXNoKGxhc3RTZWdtZW50UG9pbnQpO1xuXG4gICAgbGV0IHJldHVybkNvcm5lcnMgPSBbXTtcbiAgICBsZXQgc2tpcHBlZElkcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29ybmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IHBvaW50ID0gY29ybmVyc1tpXTtcblxuICAgICAgaWYgKGkgIT09IDApIHtcbiAgICAgICAgbGV0IGRpc3QgPSBwb2ludC5nZXREaXN0YW5jZShwcmV2KTtcbiAgICAgICAgbGV0IGNsb3Nlc3RQb2ludHMgPSBbXTtcbiAgICAgICAgd2hpbGUgKGRpc3QgPCB0aHJlc2hvbGREaXN0YW5jZSkge1xuICAgICAgICAgIGNsb3Nlc3RQb2ludHMucHVzaCh7XG4gICAgICAgICAgICBwb2ludDogcG9pbnQsXG4gICAgICAgICAgICBpbmRleDogaVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgaWYgKGkgPCBjb3JuZXJzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIHByZXYgPSBwb2ludDtcbiAgICAgICAgICAgIHBvaW50ID0gY29ybmVyc1tpXTtcbiAgICAgICAgICAgIGRpc3QgPSBwb2ludC5nZXREaXN0YW5jZShwcmV2KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChjbG9zZXN0UG9pbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBsZXQgW3N1bVgsIHN1bVldID0gWzAsIDBdO1xuXG4gICAgICAgICAgQmFzZS5lYWNoKGNsb3Nlc3RQb2ludHMsIChwb2ludE9iaikgPT4ge1xuICAgICAgICAgICAgc3VtWCArPSBwb2ludE9iai5wb2ludC54O1xuICAgICAgICAgICAgc3VtWSArPSBwb2ludE9iai5wb2ludC55O1xuICAgICAgICAgIH0pO1xuXG5cbiAgICAgICAgICBsZXQgW2F2Z1gsIGF2Z1ldID0gW3N1bVggLyBjbG9zZXN0UG9pbnRzLmxlbmd0aCwgc3VtWSAvIGNsb3Nlc3RQb2ludHMubGVuZ3RoXTtcbiAgICAgICAgICByZXR1cm5Db3JuZXJzLnB1c2gobmV3IFBvaW50KGF2Z1gsIGF2Z1kpKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuQ29ybmVycy5wdXNoKHBvaW50KTtcbiAgICAgIH1cblxuICAgICAgcHJldiA9IHBvaW50O1xuICAgIH1cblxuICAgIC8vIEJhc2UuZWFjaChjb3JuZXJzLCAoY29ybmVyLCBpKSA9PiB7XG4gICAgLy8gICBsZXQgcG9pbnQgPSBjb3JuZXI7XG4gICAgLy9cbiAgICAvLyAgIGlmIChpICE9PSAwKSB7XG4gICAgLy8gICAgIGxldCBkaXN0ID0gcG9pbnQuZ2V0RGlzdGFuY2UocHJldik7XG4gICAgLy8gICAgIGxldCBjbG9zZXN0UG9pbnRzID0gW107XG4gICAgLy8gICAgIGxldCBpbmRleCA9IGk7XG4gICAgLy8gICAgIHdoaWxlIChkaXN0IDwgdGhyZXNob2xkRGlzdGFuY2UpIHtcbiAgICAvLyAgICAgICBjbG9zZXN0UG9pbnRzLnB1c2goe1xuICAgIC8vICAgICAgICAgcG9pbnQ6IHBvaW50LFxuICAgIC8vICAgICAgICAgaW5kZXg6IGluZGV4XG4gICAgLy8gICAgICAgfSk7XG4gICAgLy8gICAgIH1cbiAgICAvLyAgICAgY29uc29sZS5sb2coZGlzdCwgdGhyZXNob2xkRGlzdGFuY2UpO1xuICAgIC8vICAgICB3aGlsZSAoZGlzdCA8IHRocmVzaG9sZERpc3RhbmNlKSB7XG4gICAgLy9cbiAgICAvLyAgICAgfVxuICAgIC8vICAgfSBlbHNlIHtcbiAgICAvLyAgICAgcmV0dXJuQ29ybmVycy5wdXNoKGNvcm5lcik7XG4gICAgLy8gICB9XG4gICAgLy9cbiAgICAvLyAgIHByZXYgPSBwb2ludDtcbiAgICAvLyB9KTtcbiAgICAvLyBuZXcgUGF0aC5DaXJjbGUoe1xuICAgIC8vICAgY2VudGVyOiBsYXN0U2VnbWVudFBvaW50LFxuICAgIC8vICAgcmFkaXVzOiAxMCxcbiAgICAvLyAgIGZpbGxDb2xvcjogJ3BpbmsnXG4gICAgLy8gfSk7XG4gIH1cblxuICByZXR1cm4gY29ybmVycztcbn1cbiIsImNvbnN0IGNvbmZpZyA9IHJlcXVpcmUoJy4vLi4vLi4vY29uZmlnJyk7XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2coLi4udGhpbmcpIHtcbiAgaWYgKGNvbmZpZy5sb2cpIHtcbiAgICBjb25zb2xlLmxvZyguLi50aGluZyk7XG4gIH1cbn1cblxuLy8gQ29udmVydHMgZnJvbSBkZWdyZWVzIHRvIHJhZGlhbnMuXG5leHBvcnQgZnVuY3Rpb24gcmFkKGRlZ3JlZXMpIHtcbiAgcmV0dXJuIGRlZ3JlZXMgKiBNYXRoLlBJIC8gMTgwO1xufTtcblxuLy8gQ29udmVydHMgZnJvbSByYWRpYW5zIHRvIGRlZ3JlZXMuXG5leHBvcnQgZnVuY3Rpb24gZGVnKHJhZGlhbnMpIHtcbiAgcmV0dXJuIHJhZGlhbnMgKiAxODAgLyBNYXRoLlBJO1xufTtcblxuLy8gcmV0dXJucyBhYnNvbHV0ZSB2YWx1ZSBvZiB0aGUgZGVsdGEgb2YgdHdvIGFuZ2xlcyBpbiByYWRpYW5zXG5leHBvcnQgZnVuY3Rpb24gYW5nbGVEZWx0YSh4LCB5KSB7XG4gIHJldHVybiBNYXRoLmFicyhNYXRoLmF0YW4yKE1hdGguc2luKHkgLSB4KSwgTWF0aC5jb3MoeSAtIHgpKSk7O1xufVxuXG4vLyBkaXN0YW5jZSBiZXR3ZWVuIHR3byBwb2ludHNcbmV4cG9ydCBmdW5jdGlvbiBkZWx0YShwMSwgcDIpIHtcbiAgcmV0dXJuIE1hdGguc3FydChNYXRoLnBvdyhwMS54IC0gcDIueCwgMikgKyBNYXRoLnBvdyhwMS55IC0gcDIueSwgMikpOyAvLyBweXRoYWdvcmVhbiFcbn1cblxuLy8gcmV0dXJucyBhbiBhcnJheSBvZiB0aGUgaW50ZXJpb3IgY3VydmVzIG9mIGEgZ2l2ZW4gY29tcG91bmQgcGF0aFxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRJbnRlcmlvckN1cnZlcyhwYXRoKSB7XG4gIGxldCBpbnRlcmlvckN1cnZlcyA9IFtdO1xuICBpZiAoIXBhdGggfHwgIXBhdGguY2hpbGRyZW4gfHwgIXBhdGguY2hpbGRyZW4ubGVuZ3RoKSByZXR1cm47XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXRoLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IGNoaWxkID0gcGF0aC5jaGlsZHJlbltpXTtcblxuICAgIGlmIChjaGlsZC5jbG9zZWQpe1xuICAgICAgaW50ZXJpb3JDdXJ2ZXMucHVzaChuZXcgUGF0aChjaGlsZC5zZWdtZW50cykpO1xuICAgIH1cbiAgfVxuXG4gIHBhdGgucmVtb3ZlKCk7XG4gIHJldHVybiBpbnRlcmlvckN1cnZlcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRydWVHcm91cChncm91cCwgY29ybmVycykge1xuICBsZXQgbWlkZGxlID0gZ3JvdXAuX25hbWVkQ2hpbGRyZW4ubWlkZGxlWzBdO1xuXG4gIGxldCBpbnRlcnNlY3Rpb25zID0gbWlkZGxlLmdldEludGVyc2VjdGlvbnMoKTtcbiAgbGV0IHRydWVOZWNlc3NhcnkgPSBmYWxzZTtcblxuICBsZXQgbWlkZGxlQ29weSA9IG5ldyBQYXRoKCk7XG4gIG1pZGRsZUNvcHkuY29weUNvbnRlbnQobWlkZGxlKTtcbiAgLy8gZGVidWdnZXI7XG5cbiAgaWYgKGludGVyc2VjdGlvbnMubGVuZ3RoID4gMCkge1xuICAgIC8vIHNlZSBpZiB3ZSBjYW4gdHJpbSB0aGUgcGF0aCB3aGlsZSBtYWludGFpbmluZyBpbnRlcnNlY3Rpb25zXG4gICAgLy8gbG9nKCdpbnRlcnNlY3Rpb25zIScpO1xuICAgIC8vIG1pZGRsZUNvcHkuc3Ryb2tlQ29sb3IgPSAneWVsbG93JztcbiAgICBbbWlkZGxlQ29weSwgdHJ1ZU5lY2Vzc2FyeV0gPSB0cmltUGF0aChtaWRkbGVDb3B5LCBtaWRkbGUpO1xuICAgIC8vIG1pZGRsZUNvcHkuc3Ryb2tlQ29sb3IgPSAnb3JhbmdlJztcbiAgfSBlbHNlIHtcbiAgICAvLyBleHRlbmQgZmlyc3QgYW5kIGxhc3Qgc2VnbWVudCBieSB0aHJlc2hvbGQsIHNlZSBpZiBpbnRlcnNlY3Rpb25cbiAgICAvLyBsb2coJ25vIGludGVyc2VjdGlvbnMsIGV4dGVuZGluZyBmaXJzdCEnKTtcbiAgICAvLyBtaWRkbGVDb3B5LnN0cm9rZUNvbG9yID0gJ3llbGxvdyc7XG4gICAgbWlkZGxlQ29weSA9IGV4dGVuZFBhdGgobWlkZGxlQ29weSk7XG4gICAgLy8gbWlkZGxlQ29weS5zdHJva2VDb2xvciA9ICdvcmFuZ2UnO1xuICAgIGxldCBpbnRlcnNlY3Rpb25zID0gbWlkZGxlQ29weS5nZXRJbnRlcnNlY3Rpb25zKCk7XG4gICAgaWYgKGludGVyc2VjdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgLy8gbWlkZGxlQ29weS5zdHJva2VDb2xvciA9ICdwaW5rJztcbiAgICAgIFttaWRkbGVDb3B5LCB0cnVlTmVjZXNzYXJ5XSA9IHRyaW1QYXRoKG1pZGRsZUNvcHksIG1pZGRsZSk7XG4gICAgICAvLyBtaWRkbGVDb3B5LnN0cm9rZUNvbG9yID0gJ2dyZWVuJztcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gbWlkZGxlQ29weS5zdHJva2VDb2xvciA9ICdyZWQnO1xuICAgICAgbWlkZGxlQ29weSA9IHJlbW92ZVBhdGhFeHRlbnNpb25zKG1pZGRsZUNvcHkpO1xuICAgICAgLy8gbWlkZGxlQ29weS5zdHJva2VDb2xvciA9ICdibHVlJztcbiAgICB9XG4gIH1cblxuICBtaWRkbGVDb3B5Lm5hbWUgPSAnbWlkZGxlJzsgLy8gbWFrZSBzdXJlXG5cbiAgLy8gZ3JvdXAuYWRkQ2hpbGQobWlkZGxlQ29weSk7XG4gIC8vIGdyb3VwLl9uYW1lZENoaWxkcmVuLm1pZGRsZVswXSA9IG1pZGRsZUNvcHk7XG4gIGdyb3VwLl9uYW1lZENoaWxkcmVuLm1pZGRsZVswXS5yZXBsYWNlV2l0aChtaWRkbGVDb3B5KTs7XG5cbiAgcmV0dXJuIFtncm91cCwgdHJ1ZU5lY2Vzc2FyeV07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleHRlbmRQYXRoKHBhdGgpIHtcbiAgaWYgKHBhdGgubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IGxlbmd0aFRvbGVyYW5jZSA9IGNvbmZpZy5zaGFwZS50cmltbWluZ1RocmVzaG9sZCAqIHBhdGgubGVuZ3RoO1xuXG4gICAgbGV0IGZpcnN0U2VnbWVudCA9IHBhdGguZmlyc3RTZWdtZW50O1xuICAgIGxldCBuZXh0U2VnbWVudCA9IGZpcnN0U2VnbWVudC5uZXh0O1xuICAgIGxldCBzdGFydEFuZ2xlID0gTWF0aC5hdGFuMihuZXh0U2VnbWVudC5wb2ludC55IC0gZmlyc3RTZWdtZW50LnBvaW50LnksIG5leHRTZWdtZW50LnBvaW50LnggLSBmaXJzdFNlZ21lbnQucG9pbnQueCk7IC8vIHJhZFxuICAgIGxldCBpbnZlcnNlU3RhcnRBbmdsZSA9IHN0YXJ0QW5nbGUgKyBNYXRoLlBJO1xuICAgIGxldCBleHRlbmRlZFN0YXJ0UG9pbnQgPSBuZXcgUG9pbnQoZmlyc3RTZWdtZW50LnBvaW50LnggKyAoTWF0aC5jb3MoaW52ZXJzZVN0YXJ0QW5nbGUpICogbGVuZ3RoVG9sZXJhbmNlKSwgZmlyc3RTZWdtZW50LnBvaW50LnkgKyAoTWF0aC5zaW4oaW52ZXJzZVN0YXJ0QW5nbGUpICogbGVuZ3RoVG9sZXJhbmNlKSk7XG4gICAgcGF0aC5pbnNlcnQoMCwgZXh0ZW5kZWRTdGFydFBvaW50KTtcblxuICAgIGxldCBsYXN0U2VnbWVudCA9IHBhdGgubGFzdFNlZ21lbnQ7XG4gICAgbGV0IHBlblNlZ21lbnQgPSBsYXN0U2VnbWVudC5wcmV2aW91czsgLy8gcGVudWx0aW1hdGVcbiAgICBsZXQgZW5kQW5nbGUgPSBNYXRoLmF0YW4yKGxhc3RTZWdtZW50LnBvaW50LnkgLSBwZW5TZWdtZW50LnBvaW50LnksIGxhc3RTZWdtZW50LnBvaW50LnggLSBwZW5TZWdtZW50LnBvaW50LngpOyAvLyByYWRcbiAgICBsZXQgZXh0ZW5kZWRFbmRQb2ludCA9IG5ldyBQb2ludChsYXN0U2VnbWVudC5wb2ludC54ICsgKE1hdGguY29zKGVuZEFuZ2xlKSAqIGxlbmd0aFRvbGVyYW5jZSksIGxhc3RTZWdtZW50LnBvaW50LnkgKyAoTWF0aC5zaW4oZW5kQW5nbGUpICogbGVuZ3RoVG9sZXJhbmNlKSk7XG4gICAgcGF0aC5hZGQoZXh0ZW5kZWRFbmRQb2ludCk7XG4gIH1cbiAgcmV0dXJuIHBhdGg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cmltUGF0aChwYXRoLCBvcmlnaW5hbCkge1xuICAvLyBvcmlnaW5hbFBhdGguc3Ryb2tlQ29sb3IgPSAncGluayc7XG4gIHRyeSB7XG4gICAgbGV0IGludGVyc2VjdGlvbnMgPSBwYXRoLmdldEludGVyc2VjdGlvbnMoKTtcbiAgICBsZXQgZGl2aWRlZFBhdGggPSBwYXRoLnJlc29sdmVDcm9zc2luZ3MoKTtcblxuICAgIGlmIChpbnRlcnNlY3Rpb25zLmxlbmd0aCA+IDEpIHtcbiAgICAgIHJldHVybiBbb3JpZ2luYWwsIGZhbHNlXTsgLy8gbW9yZSB0aGFuIG9uZSBpbnRlcnNlY3Rpb24sIGRvbid0IHdvcnJ5IGFib3V0IHRyaW1taW5nXG4gICAgfVxuXG4gICAgY29uc3QgZXh0ZW5kaW5nVGhyZXNob2xkID0gY29uZmlnLnNoYXBlLmV4dGVuZGluZ1RocmVzaG9sZDtcbiAgICBjb25zdCB0b3RhbExlbmd0aCA9IHBhdGgubGVuZ3RoO1xuXG4gICAgLy8gd2Ugd2FudCB0byByZW1vdmUgYWxsIGNsb3NlZCBsb29wcyBmcm9tIHRoZSBwYXRoLCBzaW5jZSB0aGVzZSBhcmUgbmVjZXNzYXJpbHkgaW50ZXJpb3IgYW5kIG5vdCBmaXJzdCBvciBsYXN0XG4gICAgQmFzZS5lYWNoKGRpdmlkZWRQYXRoLmNoaWxkcmVuLCAoY2hpbGQsIGkpID0+IHtcbiAgICAgIGlmIChjaGlsZC5jbG9zZWQpIHtcbiAgICAgICAgLy8gbG9nKCdzdWJ0cmFjdGluZyBjbG9zZWQgY2hpbGQnKTtcbiAgICAgICAgZGl2aWRlZFBhdGggPSBkaXZpZGVkUGF0aC5zdWJ0cmFjdChjaGlsZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBkaXZpZGVkUGF0aCA9IGRpdmlkZWRQYXRoLnVuaXRlKGNoaWxkKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIGxvZyhkaXZpZGVkUGF0aCk7XG5cbiAgICBpZiAoISFkaXZpZGVkUGF0aC5jaGlsZHJlbiAmJiBkaXZpZGVkUGF0aC5jaGlsZHJlbi5sZW5ndGggPiAxKSB7XG4gICAgICAvLyBkaXZpZGVkIHBhdGggaXMgYSBjb21wb3VuZCBwYXRoXG4gICAgICBsZXQgdW5pdGVkRGl2aWRlZFBhdGggPSBuZXcgUGF0aCgpO1xuICAgICAgLy8gdW5pdGVkRGl2aWRlZFBhdGguY29weUF0dHJpYnV0ZXMoZGl2aWRlZFBhdGgpO1xuICAgICAgLy8gbG9nKCdiZWZvcmUnLCB1bml0ZWREaXZpZGVkUGF0aCk7XG4gICAgICBCYXNlLmVhY2goZGl2aWRlZFBhdGguY2hpbGRyZW4sIChjaGlsZCwgaSkgPT4ge1xuICAgICAgICBpZiAoIWNoaWxkLmNsb3NlZCkge1xuICAgICAgICAgIHVuaXRlZERpdmlkZWRQYXRoID0gdW5pdGVkRGl2aWRlZFBhdGgudW5pdGUoY2hpbGQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGRpdmlkZWRQYXRoID0gdW5pdGVkRGl2aWRlZFBhdGg7XG4gICAgICAvLyBsb2coJ2FmdGVyJywgdW5pdGVkRGl2aWRlZFBhdGgpO1xuICAgICAgLy8gcmV0dXJuO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBsb2coJ2RpdmlkZWRQYXRoIGhhcyBvbmUgY2hpbGQnKTtcbiAgICB9XG5cbiAgICBpZiAoaW50ZXJzZWN0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAvLyB3ZSBoYXZlIHRvIGdldCB0aGUgbmVhcmVzdCBsb2NhdGlvbiBiZWNhdXNlIHRoZSBleGFjdCBpbnRlcnNlY3Rpb24gcG9pbnQgaGFzIGFscmVhZHkgYmVlbiByZW1vdmVkIGFzIGEgcGFydCBvZiByZXNvbHZlQ3Jvc3NpbmdzKClcbiAgICAgIGxldCBmaXJzdEludGVyc2VjdGlvbiA9IGRpdmlkZWRQYXRoLmdldE5lYXJlc3RMb2NhdGlvbihpbnRlcnNlY3Rpb25zWzBdLnBvaW50KTtcbiAgICAgIC8vIGxvZyhkaXZpZGVkUGF0aCk7XG4gICAgICBsZXQgcmVzdCA9IGRpdmlkZWRQYXRoLnNwbGl0QXQoZmlyc3RJbnRlcnNlY3Rpb24pOyAvLyBkaXZpZGVkUGF0aCBpcyBub3cgdGhlIGZpcnN0IHNlZ21lbnRcbiAgICAgIGxldCBmaXJzdFNlZ21lbnQgPSBkaXZpZGVkUGF0aDtcbiAgICAgIGxldCBsYXN0U2VnbWVudDtcblxuICAgICAgLy8gZmlyc3RTZWdtZW50LnN0cm9rZUNvbG9yID0gJ3BpbmsnO1xuXG4gICAgICAvLyBsZXQgY2lyY2xlT25lID0gbmV3IFBhdGguQ2lyY2xlKHtcbiAgICAgIC8vICAgY2VudGVyOiBmaXJzdEludGVyc2VjdGlvbi5wb2ludCxcbiAgICAgIC8vICAgcmFkaXVzOiA1LFxuICAgICAgLy8gICBzdHJva2VDb2xvcjogJ3JlZCdcbiAgICAgIC8vIH0pO1xuXG4gICAgICAvLyBsb2coaW50ZXJzZWN0aW9ucyk7XG4gICAgICBpZiAoaW50ZXJzZWN0aW9ucy5sZW5ndGggPiAxKSB7XG4gICAgICAgIC8vIGxvZygnZm9vJyk7XG4gICAgICAgIC8vIHJlc3QucmV2ZXJzZSgpOyAvLyBzdGFydCBmcm9tIGVuZFxuICAgICAgICBsZXQgbGFzdEludGVyc2VjdGlvbiA9IHJlc3QuZ2V0TmVhcmVzdExvY2F0aW9uKGludGVyc2VjdGlvbnNbaW50ZXJzZWN0aW9ucy5sZW5ndGggLSAxXS5wb2ludCk7XG4gICAgICAgIC8vIGxldCBjaXJjbGVUd28gPSBuZXcgUGF0aC5DaXJjbGUoe1xuICAgICAgICAvLyAgIGNlbnRlcjogbGFzdEludGVyc2VjdGlvbi5wb2ludCxcbiAgICAgICAgLy8gICByYWRpdXM6IDUsXG4gICAgICAgIC8vICAgc3Ryb2tlQ29sb3I6ICdncmVlbidcbiAgICAgICAgLy8gfSk7XG4gICAgICAgIGxhc3RTZWdtZW50ID0gcmVzdC5zcGxpdEF0KGxhc3RJbnRlcnNlY3Rpb24pOyAvLyByZXN0IGlzIG5vdyBldmVyeXRoaW5nIEJVVCB0aGUgZmlyc3QgYW5kIGxhc3Qgc2VnbWVudHNcbiAgICAgICAgaWYgKCFsYXN0U2VnbWVudCB8fCAhbGFzdFNlZ21lbnQubGVuZ3RoKSBsYXN0U2VnbWVudCA9IHJlc3Q7XG4gICAgICAgIHJlc3QucmV2ZXJzZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGFzdFNlZ21lbnQgPSByZXN0O1xuICAgICAgfVxuXG4gICAgICBpZiAoISFmaXJzdFNlZ21lbnQgJiYgZmlyc3RTZWdtZW50Lmxlbmd0aCA8PSBleHRlbmRpbmdUaHJlc2hvbGQgKiB0b3RhbExlbmd0aCkge1xuICAgICAgICBwYXRoID0gcGF0aC5zdWJ0cmFjdChmaXJzdFNlZ21lbnQpO1xuICAgICAgICBpZiAocGF0aC5jbGFzc05hbWUgPT09ICdDb21wb3VuZFBhdGgnKSB7XG4gICAgICAgICAgQmFzZS5lYWNoKHBhdGguY2hpbGRyZW4sIChjaGlsZCwgaSkgPT4ge1xuICAgICAgICAgICAgaWYgKCFjaGlsZC5jbG9zZWQpIHtcbiAgICAgICAgICAgICAgY2hpbGQucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKCEhbGFzdFNlZ21lbnQgJiYgbGFzdFNlZ21lbnQubGVuZ3RoIDw9IGV4dGVuZGluZ1RocmVzaG9sZCAqIHRvdGFsTGVuZ3RoKSB7XG4gICAgICAgIHBhdGggPSBwYXRoLnN1YnRyYWN0KGxhc3RTZWdtZW50KTtcbiAgICAgICAgaWYgKHBhdGguY2xhc3NOYW1lID09PSAnQ29tcG91bmRQYXRoJykge1xuICAgICAgICAgIEJhc2UuZWFjaChwYXRoLmNoaWxkcmVuLCAoY2hpbGQsIGkpID0+IHtcbiAgICAgICAgICAgIGlmICghY2hpbGQuY2xvc2VkKSB7XG4gICAgICAgICAgICAgIGNoaWxkLnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gdGhpcyBpcyBoYWNreSBidXQgSSdtIG5vdCBzdXJlIGhvdyB0byBnZXQgYXJvdW5kIGl0XG4gICAgLy8gc29tZXRpbWVzIHBhdGguc3VidHJhY3QoKSByZXR1cm5zIGEgY29tcG91bmQgcGF0aCwgd2l0aCBjaGlsZHJlbiBjb25zaXN0aW5nIG9mIHRoZSBjbG9zZWQgcGF0aCBJIHdhbnQgYW5kIGFub3RoZXIgZXh0cmFuZW91cyBjbG9zZWQgcGF0aFxuICAgIC8vIGl0IGFwcGVhcnMgdGhhdCB0aGUgY29ycmVjdCBwYXRoIGFsd2F5cyBoYXMgYSBoaWdoZXIgdmVyc2lvbiwgdGhvdWdoIEknbSBub3QgMTAwJSBzdXJlIHRoYXQgdGhpcyBpcyBhbHdheXMgdGhlIGNhc2VcblxuICAgIGlmIChwYXRoLmNsYXNzTmFtZSA9PT0gJ0NvbXBvdW5kUGF0aCcgJiYgcGF0aC5jaGlsZHJlbi5sZW5ndGggPiAwKSB7XG4gICAgICBpZiAocGF0aC5jaGlsZHJlbi5sZW5ndGggPiAxKSB7XG4gICAgICAgIGxldCBsYXJnZXN0Q2hpbGQ7XG4gICAgICAgIGxldCBsYXJnZXN0Q2hpbGRBcmVhID0gMDtcblxuICAgICAgICBCYXNlLmVhY2gocGF0aC5jaGlsZHJlbiwgKGNoaWxkLCBpKSA9PiB7XG4gICAgICAgICAgaWYgKGNoaWxkLmFyZWEgPiBsYXJnZXN0Q2hpbGRBcmVhKSB7XG4gICAgICAgICAgICBsYXJnZXN0Q2hpbGRBcmVhID0gY2hpbGQuYXJlYTtcbiAgICAgICAgICAgIGxhcmdlc3RDaGlsZCA9IGNoaWxkO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGxhcmdlc3RDaGlsZCkge1xuICAgICAgICAgIHBhdGggPSBsYXJnZXN0Q2hpbGQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcGF0aCA9IHBhdGguY2hpbGRyZW5bMF07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhdGggPSBwYXRoLmNoaWxkcmVuWzBdO1xuICAgICAgfVxuICAgICAgLy8gbG9nKHBhdGgpO1xuICAgICAgLy8gbG9nKHBhdGgubGFzdENoaWxkKTtcbiAgICAgIC8vIHBhdGguZmlyc3RDaGlsZC5zdHJva2VDb2xvciA9ICdwaW5rJztcbiAgICAgIC8vIHBhdGgubGFzdENoaWxkLnN0cm9rZUNvbG9yID0gJ2dyZWVuJztcbiAgICAgIC8vIHBhdGggPSBwYXRoLmxhc3RDaGlsZDsgLy8gcmV0dXJuIGxhc3QgY2hpbGQ/XG4gICAgICAvLyBmaW5kIGhpZ2hlc3QgdmVyc2lvblxuICAgICAgLy9cbiAgICAgIC8vIGxvZyhyZWFsUGF0aFZlcnNpb24pO1xuICAgICAgLy9cbiAgICAgIC8vIEJhc2UuZWFjaChwYXRoLmNoaWxkcmVuLCAoY2hpbGQsIGkpID0+IHtcbiAgICAgIC8vICAgaWYgKGNoaWxkLnZlcnNpb24gPT0gcmVhbFBhdGhWZXJzaW9uKSB7XG4gICAgICAvLyAgICAgbG9nKCdyZXR1cm5pbmcgY2hpbGQnKTtcbiAgICAgIC8vICAgICByZXR1cm4gY2hpbGQ7XG4gICAgICAvLyAgIH1cbiAgICAgIC8vIH0pXG4gICAgfVxuICAgIGxvZygnb3JpZ2luYWwgbGVuZ3RoOicsIHRvdGFsTGVuZ3RoKTtcbiAgICBsb2coJ2VkaXRlZCBsZW5ndGg6JywgcGF0aC5sZW5ndGgpO1xuICAgIGlmIChwYXRoLmxlbmd0aCAvIHRvdGFsTGVuZ3RoIDw9IDAuNzUpIHtcbiAgICAgIGxvZygncmV0dXJuaW5nIG9yaWdpbmFsJyk7XG4gICAgICByZXR1cm4gW29yaWdpbmFsLCBmYWxzZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBbcGF0aCwgdHJ1ZV07XG4gICAgfVxuICB9IGNhdGNoKGUpIHtcbiAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgIHJldHVybiBbb3JpZ2luYWwsIGZhbHNlXTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlUGF0aEV4dGVuc2lvbnMocGF0aCkge1xuICBwYXRoLnJlbW92ZVNlZ21lbnQoMCk7XG4gIHBhdGgucmVtb3ZlU2VnbWVudChwYXRoLnNlZ21lbnRzLmxlbmd0aCAtIDEpO1xuICByZXR1cm4gcGF0aDtcbn1cblxuLy8gZXhwb3J0IGZ1bmN0aW9uIHRydWVQYXRoKHBhdGgpIHtcbi8vICAgLy8gbG9nKGdyb3VwKTtcbi8vICAgLy8gaWYgKHBhdGggJiYgcGF0aC5jaGlsZHJlbiAmJiBwYXRoLmNoaWxkcmVuLmxlbmd0aCA+IDAgJiYgcGF0aC5fbmFtZWRDaGlsZHJlblsnbWlkZGxlJ10pIHtcbi8vICAgLy8gICBsZXQgcGF0aENvcHkgPSBuZXcgUGF0aCgpO1xuLy8gICAvLyAgIGxvZyhwYXRoLl9uYW1lZENoaWxkcmVuWydtaWRkbGUnXSk7XG4vLyAgIC8vICAgcGF0aENvcHkuY29weUNvbnRlbnQocGF0aC5fbmFtZWRDaGlsZHJlblsnbWlkZGxlJ10pO1xuLy8gICAvLyAgIGxvZyhwYXRoQ29weSk7XG4vLyAgIC8vIH1cbi8vIH1cblxuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrUG9wcygpIHtcbiAgbGV0IGdyb3VwcyA9IHBhcGVyLnByb2plY3QuZ2V0SXRlbXMoe1xuICAgIGNsYXNzTmFtZTogJ0dyb3VwJyxcbiAgICBtYXRjaDogZnVuY3Rpb24oZWwpIHtcbiAgICAgIHJldHVybiAoISFlbC5kYXRhICYmIGVsLmRhdGEudXBkYXRlKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vLyBodHRwczovL2dyb3Vwcy5nb29nbGUuY29tL2ZvcnVtLyMhdG9waWMvcGFwZXJqcy9VRDhMME1UeVJlUVxuZXhwb3J0IGZ1bmN0aW9uIG92ZXJsYXBzKHBhdGgsIG90aGVyKSB7XG4gIHJldHVybiAhKHBhdGguZ2V0SW50ZXJzZWN0aW9ucyhvdGhlcikubGVuZ3RoID09PSAwKTtcbn1cblxuLy8gaHR0cHM6Ly9ncm91cHMuZ29vZ2xlLmNvbS9mb3J1bS8jIXRvcGljL3BhcGVyanMvVUQ4TDBNVHlSZVFcbmV4cG9ydCBmdW5jdGlvbiBtZXJnZU9uZVBhdGgocGF0aCwgb3RoZXJzKSB7XG4gIGxldCBpLCBtZXJnZWQsIG90aGVyLCB1bmlvbiwgX2ksIF9sZW4sIF9yZWY7XG4gIGZvciAoaSA9IF9pID0gMCwgX2xlbiA9IG90aGVycy5sZW5ndGg7IF9pIDwgX2xlbjsgaSA9ICsrX2kpIHtcbiAgICBvdGhlciA9IG90aGVyc1tpXTtcbiAgICBpZiAob3ZlcmxhcHMocGF0aCwgb3RoZXIpKSB7XG4gICAgICB1bmlvbiA9IHBhdGgudW5pdGUob3RoZXIpO1xuICAgICAgbWVyZ2VkID0gbWVyZ2VPbmVQYXRoKHVuaW9uLCBvdGhlcnMuc2xpY2UoaSArIDEpKTtcbiAgICAgIHJldHVybiAoX3JlZiA9IG90aGVycy5zbGljZSgwLCBpKSkuY29uY2F0LmFwcGx5KF9yZWYsIG1lcmdlZCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBvdGhlcnMuY29uY2F0KHBhdGgpO1xufTtcblxuLy8gaHR0cHM6Ly9ncm91cHMuZ29vZ2xlLmNvbS9mb3J1bS8jIXRvcGljL3BhcGVyanMvVUQ4TDBNVHlSZVFcbmV4cG9ydCBmdW5jdGlvbiBtZXJnZVBhdGhzKHBhdGhzKSB7XG4gIHZhciBwYXRoLCByZXN1bHQsIF9pLCBfbGVuO1xuICByZXN1bHQgPSBbXTtcbiAgZm9yIChfaSA9IDAsIF9sZW4gPSBwYXRocy5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgIHBhdGggPSBwYXRoc1tfaV07XG4gICAgcmVzdWx0ID0gbWVyZ2VPbmVQYXRoKHBhdGgsIHJlc3VsdCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBoaXRUZXN0Qm91bmRzKHBvaW50LCBjaGlsZHJlbikge1xuICBpZiAoIXBvaW50KSByZXR1cm4gbnVsbDtcblxuICBmb3IgKGxldCBpID0gY2hpbGRyZW4ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBsZXQgY2hpbGQgPSBjaGlsZHJlbltpXTtcbiAgICBsZXQgYm91bmRzID0gY2hpbGQuc3Ryb2tlQm91bmRzO1xuICAgIGlmIChwb2ludC5pc0luc2lkZShjaGlsZC5zdHJva2VCb3VuZHMpKSB7XG4gICAgICByZXR1cm4gY2hpbGQ7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG4iXX0=
