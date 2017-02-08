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

      // middle.selected = true;
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
        if (middle.closed) {
          var enclosedLoop = middle.clone();
          enclosedLoop.visible = true;
          enclosedLoop.fillColor = new Color(0, 0); // transparent
          enclosedLoop.data.interior = true;
          enclosedLoop.data.transparent = true;
          group.addChild(enclosedLoop);
          enclosedLoop.sendToBack();
        }
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

  var middleCopy = middle.clone();
  middleCopy.visible = false;
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
  middleCopy.visible = true;

  // group.addChild(middleCopy);
  // group._namedChildren.middle[0] = middleCopy;
  group._namedChildren.middle[0].replaceWith(middleCopy);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjb25maWcuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9zaGFwZS5qcyIsInNyYy9qcy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxRQUFRLE9BQVIsR0FBa0I7QUFDaEIsVUFBUSxDQUFDLFNBQUQsRUFBWSxTQUFaLEVBQXVCLFNBQXZCLEVBQWtDLFNBQWxDLEVBQTZDLFNBQTdDLEVBQXdELFNBQXhELEVBQW1FLFNBQW5FLEVBQThFLFNBQTlFLEVBQXlGLFNBQXpGLEVBQW9HLFNBQXBHLEVBQStHLFNBQS9HLEVBQXlILFNBQXpILENBRFE7QUFFaEIsUUFBTSxDQUFDLFNBQUQsRUFBWSxTQUFaLEVBQXVCLFNBQXZCLEVBQWtDLFNBQWxDLEVBQTZDLFNBQTdDLENBRlU7QUFHaEIsYUFBVyxFQUhLO0FBSWhCLHFCQUFtQjtBQUpILENBQWxCOztBQU9BLFFBQVEsS0FBUixHQUFnQjtBQUNkLHNCQUFvQixHQUROO0FBRWQscUJBQW1CLEtBRkw7QUFHZCxzQkFBb0I7QUFITixDQUFoQjs7QUFNQSxRQUFRLEdBQVIsR0FBYyxJQUFkOzs7Ozs7O0FDYkEsT0FBTyxHQUFQLEdBQWEsT0FBTyxHQUFQLElBQWM7QUFDekIsV0FBUyxDQUFDLFNBQUQsRUFBWSxTQUFaLEVBQXVCLFNBQXZCLEVBQWtDLFNBQWxDLEVBQTZDLFNBQTdDLEVBQXdELFNBQXhELEVBQW1FLFNBQW5FLEVBQThFLFNBQTlFLEVBQXlGLFNBQXpGLEVBQW9HLFNBQXBHLEVBQStHLFNBQS9HLEVBQTBILFNBQTFILEVBQXFJLFNBQXJJLEVBQWdKLFNBQWhKLEVBQTJKLFNBQTNKLEVBQXNLLFNBQXRLLENBRGdCO0FBRXpCLGdCQUFjLFNBRlc7QUFHekIsWUFBVSxFQUhlO0FBSXpCLFNBQU87QUFKa0IsQ0FBM0I7O0FBT0EsTUFBTSxPQUFOLENBQWMsTUFBZDs7QUFFQSxJQUFNLE9BQU8sUUFB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c0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJleHBvcnRzLnBhbGV0dGUgPSB7XG4gIGNvbG9yczogW1wiIzIwMTcxQ1wiLCBcIiMxRTJBNDNcIiwgXCIjMjgzNzdEXCIsIFwiIzM1Mjc0N1wiLCBcIiNDQTJFMjZcIiwgXCIjOUEyQTFGXCIsIFwiI0RBNkMyNlwiLCBcIiM0NTMxMjFcIiwgXCIjOTE2QTQ3XCIsIFwiI0RBQUQyN1wiLCBcIiM3RjdEMzFcIixcIiMyQjVFMkVcIl0sXG4gIHBvcHM6IFtcIiMwMEFERUZcIiwgXCIjRjI4NUE1XCIsIFwiIzdEQzU3RlwiLCBcIiNGNkVCMTZcIiwgXCIjRjRFQUUwXCJdLFxuICBjb2xvclNpemU6IDIwLFxuICBzZWxlY3RlZENvbG9yU2l6ZTogMzBcbn1cblxuZXhwb3J0cy5zaGFwZSA9IHtcbiAgZXh0ZW5kaW5nVGhyZXNob2xkOiAwLjEsXG4gIHRyaW1taW5nVGhyZXNob2xkOiAwLjA3NSxcbiAgY29ybmVyVGhyZXNob2xkRGVnOiAxMFxufVxuXG5leHBvcnRzLmxvZyA9IHRydWU7XG4iLCJ3aW5kb3cua2FuID0gd2luZG93LmthbiB8fCB7XG4gIHBhbGV0dGU6IFtcIiMyMDE3MUNcIiwgXCIjMUUyQTQzXCIsIFwiIzI4Mzc3RFwiLCBcIiMzNTI3NDdcIiwgXCIjRjI4NUE1XCIsIFwiI0NBMkUyNlwiLCBcIiNCODQ1MjZcIiwgXCIjREE2QzI2XCIsIFwiIzQ1MzEyMVwiLCBcIiM5MTZBNDdcIiwgXCIjRUVCNjQxXCIsIFwiI0Y2RUIxNlwiLCBcIiM3RjdEMzFcIiwgXCIjNkVBRDc5XCIsIFwiIzJBNDYyMVwiLCBcIiNGNEVBRTBcIl0sXG4gIGN1cnJlbnRDb2xvcjogJyMyMDE3MUMnLFxuICBudW1QYXRoczogMTAsXG4gIHBhdGhzOiBbXSxcbn07XG5cbnBhcGVyLmluc3RhbGwod2luZG93KTtcblxuY29uc3QgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuY29uc3Qgc2hhcGUgPSByZXF1aXJlKCcuL3NoYXBlJyk7XG5jb25zdCBjb25maWcgPSByZXF1aXJlKCcuLy4uLy4uL2NvbmZpZycpO1xuLy8gcmVxdWlyZSgncGFwZXItYW5pbWF0ZScpO1xuXG5mdW5jdGlvbiBsb2codGhpbmcpIHtcbiAgdXRpbC5sb2codGhpbmcpO1xufVxuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgbGV0IE1PVkVTID0gW107IC8vIHN0b3JlIGdsb2JhbCBtb3ZlcyBsaXN0XG4gIC8vIG1vdmVzID0gW1xuICAvLyAgIHtcbiAgLy8gICAgICd0eXBlJzogJ2NvbG9yQ2hhbmdlJyxcbiAgLy8gICAgICdvbGQnOiAnIzIwMTcxQycsXG4gIC8vICAgICAnbmV3JzogJyNGMjg1QTUnXG4gIC8vICAgfSxcbiAgLy8gICB7XG4gIC8vICAgICAndHlwZSc6ICduZXdQYXRoJyxcbiAgLy8gICAgICdyZWYnOiAnPz8/JyAvLyB1dWlkPyBkb20gcmVmZXJlbmNlP1xuICAvLyAgIH0sXG4gIC8vICAge1xuICAvLyAgICAgJ3R5cGUnOiAncGF0aFRyYW5zZm9ybScsXG4gIC8vICAgICAncmVmJzogJz8/PycsIC8vIHV1aWQ/IGRvbSByZWZlcmVuY2U/XG4gIC8vICAgICAnb2xkJzogJ3JvdGF0ZSg5MGRlZylzY2FsZSgxLjUpJywgLy8gPz8/XG4gIC8vICAgICAnbmV3JzogJ3JvdGF0ZSgxMjBkZWcpc2NhbGUoLTAuNSknIC8vID8/P1xuICAvLyAgIH0sXG4gIC8vICAgLy8gb3RoZXJzP1xuICAvLyBdXG5cbiAgY29uc3QgJHdpbmRvdyA9ICQod2luZG93KTtcbiAgY29uc3QgJGJvZHkgPSAkKCdib2R5Jyk7XG4gIGNvbnN0ICRjYW52YXMgPSAkKCdjYW52YXMjbWFpbkNhbnZhcycpO1xuICBjb25zdCBydW5BbmltYXRpb25zID0gZmFsc2U7XG4gIGNvbnN0IHRyYW5zcGFyZW50ID0gbmV3IENvbG9yKDAsIDApO1xuICBjb25zdCB0aHJlc2hvbGRBbmdsZSA9IHV0aWwucmFkKGNvbmZpZy5zaGFwZS5jb3JuZXJUaHJlc2hvbGREZWcpO1xuXG4gIGxldCB2aWV3V2lkdGgsIHZpZXdIZWlnaHQ7XG5cbiAgZnVuY3Rpb24gaGl0VGVzdEJvdW5kcyhwb2ludCkge1xuICAgIHJldHVybiB1dGlsLmhpdFRlc3RCb3VuZHMocG9pbnQsIHBhcGVyLnByb2plY3QuYWN0aXZlTGF5ZXIuY2hpbGRyZW4pO1xuICB9XG5cbiAgZnVuY3Rpb24gaGl0VGVzdEdyb3VwQm91bmRzKHBvaW50KSB7XG4gICAgbGV0IGdyb3VwcyA9IHBhcGVyLnByb2plY3QuZ2V0SXRlbXMoe1xuICAgICAgY2xhc3NOYW1lOiAnR3JvdXAnXG4gICAgfSk7XG4gICAgcmV0dXJuIHV0aWwuaGl0VGVzdEJvdW5kcyhwb2ludCwgZ3JvdXBzKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRWaWV3VmFycygpIHtcbiAgICB2aWV3V2lkdGggPSBwYXBlci52aWV3LnZpZXdTaXplLndpZHRoO1xuICAgIHZpZXdIZWlnaHQgPSBwYXBlci52aWV3LnZpZXdTaXplLmhlaWdodDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRDb250cm9sUGFuZWwoKSB7XG4gICAgaW5pdENvbG9yUGFsZXR0ZSgpO1xuICAgIGluaXRDYW52YXNEcmF3KCk7XG4gICAgaW5pdE5ldygpO1xuICAgIGluaXRVbmRvKCk7XG4gICAgaW5pdFBsYXkoKTtcbiAgICBpbml0VGlwcygpO1xuICAgIGluaXRTaGFyZSgpO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdENvbG9yUGFsZXR0ZSgpIHtcbiAgICBjb25zdCAkcGFsZXR0ZVdyYXAgPSAkKCd1bC5wYWxldHRlLWNvbG9ycycpO1xuICAgIGNvbnN0ICRwYWxldHRlQ29sb3JzID0gJHBhbGV0dGVXcmFwLmZpbmQoJ2xpJyk7XG4gICAgY29uc3QgcGFsZXR0ZUNvbG9yU2l6ZSA9IDIwO1xuICAgIGNvbnN0IHBhbGV0dGVTZWxlY3RlZENvbG9yU2l6ZSA9IDMwO1xuICAgIGNvbnN0IHBhbGV0dGVTZWxlY3RlZENsYXNzID0gJ3BhbGV0dGUtc2VsZWN0ZWQnO1xuXG4gICAgLy8gaG9vayB1cCBjbGlja1xuICAgICAgJHBhbGV0dGVDb2xvcnMub24oJ2NsaWNrIHRhcCB0b3VjaCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGxldCAkc3ZnID0gJCh0aGlzKS5maW5kKCdzdmcucGFsZXR0ZS1jb2xvcicpO1xuXG4gICAgICAgICAgaWYgKCEkc3ZnLmhhc0NsYXNzKHBhbGV0dGVTZWxlY3RlZENsYXNzKSkge1xuICAgICAgICAgICAgJCgnLicgKyBwYWxldHRlU2VsZWN0ZWRDbGFzcylcbiAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKHBhbGV0dGVTZWxlY3RlZENsYXNzKVxuICAgICAgICAgICAgICAuYXR0cignd2lkdGgnLCBwYWxldHRlQ29sb3JTaXplKVxuICAgICAgICAgICAgICAuYXR0cignaGVpZ2h0JywgcGFsZXR0ZUNvbG9yU2l6ZSlcbiAgICAgICAgICAgICAgLmZpbmQoJ3JlY3QnKVxuICAgICAgICAgICAgICAuYXR0cigncngnLCAwKVxuICAgICAgICAgICAgICAuYXR0cigncnknLCAwKTtcblxuICAgICAgICAgICAgJHN2Zy5hZGRDbGFzcyhwYWxldHRlU2VsZWN0ZWRDbGFzcylcbiAgICAgICAgICAgICAgLmF0dHIoJ3dpZHRoJywgcGFsZXR0ZVNlbGVjdGVkQ29sb3JTaXplKVxuICAgICAgICAgICAgICAuYXR0cignaGVpZ2h0JywgcGFsZXR0ZVNlbGVjdGVkQ29sb3JTaXplKVxuICAgICAgICAgICAgICAuZmluZCgncmVjdCcpXG4gICAgICAgICAgICAgIC5hdHRyKCdyeCcsIHBhbGV0dGVTZWxlY3RlZENvbG9yU2l6ZSAvIDIpXG4gICAgICAgICAgICAgIC5hdHRyKCdyeScsIHBhbGV0dGVTZWxlY3RlZENvbG9yU2l6ZSAvIDIpXG5cbiAgICAgICAgICAgIHdpbmRvdy5rYW4uY3VycmVudENvbG9yID0gJHN2Zy5maW5kKCdyZWN0JykuYXR0cignZmlsbCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0Q2FudmFzRHJhdygpIHtcblxuICAgIHBhcGVyLnNldHVwKCRjYW52YXNbMF0pO1xuXG4gICAgbGV0IG1pZGRsZSwgYm91bmRzO1xuICAgIGxldCBzaXplcztcbiAgICAvLyBsZXQgcGF0aHMgPSBnZXRGcmVzaFBhdGhzKHdpbmRvdy5rYW4ubnVtUGF0aHMpO1xuICAgIGxldCB0b3VjaCA9IGZhbHNlO1xuICAgIGxldCBsYXN0Q2hpbGQ7XG4gICAgbGV0IHBhdGhEYXRhID0ge307XG4gICAgbGV0IHByZXZBbmdsZSwgcHJldlBvaW50O1xuXG4gICAgbGV0IHNpZGVzO1xuICAgIGxldCBzaWRlO1xuXG4gICAgbGV0IGNvcm5lcnM7XG5cbiAgICBmdW5jdGlvbiBwYW5TdGFydChldmVudCkge1xuICAgICAgcGFwZXIucHJvamVjdC5hY3RpdmVMYXllci5yZW1vdmVDaGlsZHJlbigpOyAvLyBSRU1PVkVcbiAgICAgIC8vIGRyYXdDaXJjbGUoKTtcblxuICAgICAgc2l6ZXMgPSBbXTtcbiAgICAgIHByZXZBbmdsZSA9IE1hdGguYXRhbjIoZXZlbnQudmVsb2NpdHlZLCBldmVudC52ZWxvY2l0eVgpO1xuXG4gICAgICBpZiAocGluY2hpbmcpIHJldHVybjtcbiAgICAgIGlmICghKGV2ZW50LmNoYW5nZWRQb2ludGVycyAmJiBldmVudC5jaGFuZ2VkUG9pbnRlcnMubGVuZ3RoID4gMCkpIHJldHVybjtcbiAgICAgIGlmIChldmVudC5jaGFuZ2VkUG9pbnRlcnMubGVuZ3RoID4gMSkge1xuICAgICAgICBsb2coJ2V2ZW50LmNoYW5nZWRQb2ludGVycyA+IDEnKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcG9pbnRlciA9IGV2ZW50LmNlbnRlcjtcbiAgICAgIGNvbnN0IHBvaW50ID0gbmV3IFBvaW50KHBvaW50ZXIueCwgcG9pbnRlci55KTtcblxuICAgICAgYm91bmRzID0gbmV3IFBhdGgoe1xuICAgICAgICBzdHJva2VDb2xvcjogd2luZG93Lmthbi5jdXJyZW50Q29sb3IsXG4gICAgICAgIGZpbGxDb2xvcjogd2luZG93Lmthbi5jdXJyZW50Q29sb3IsXG4gICAgICAgIG5hbWU6ICdib3VuZHMnLFxuICAgICAgICB2aXNpYmxlOiBmYWxzZVxuICAgICAgfSk7XG5cbiAgICAgIG1pZGRsZSA9IG5ldyBQYXRoKHtcbiAgICAgICAgc3Ryb2tlQ29sb3I6IHdpbmRvdy5rYW4uY3VycmVudENvbG9yLFxuICAgICAgICBuYW1lOiAnbWlkZGxlJyxcbiAgICAgICAgc3Ryb2tlV2lkdGg6IDUsXG4gICAgICAgIHZpc2libGU6IHRydWUsXG4gICAgICAgIHN0cm9rZUNhcDogJ3JvdW5kJ1xuICAgICAgfSk7XG5cbiAgICAgIGJvdW5kcy5hZGQocG9pbnQpO1xuICAgICAgbWlkZGxlLmFkZChwb2ludCk7XG5cbiAgICAgIHByZXZQb2ludCA9IHBvaW50O1xuICAgICAgY29ybmVycyA9IFtwb2ludF07XG5cbiAgICAgIHNpZGVzID0gW107XG4gICAgICBzaWRlID0gW3BvaW50XTtcblxuICAgICAgcGF0aERhdGFbc2hhcGUuc3RyaW5naWZ5UG9pbnQocG9pbnQpXSA9IHtcbiAgICAgICAgcG9pbnQ6IHBvaW50LFxuICAgICAgICBmaXJzdDogdHJ1ZVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBjb25zdCBtaW4gPSAxO1xuICAgIGNvbnN0IG1heCA9IDE1O1xuICAgIGNvbnN0IGFscGhhID0gMC4zO1xuICAgIGNvbnN0IG1lbW9yeSA9IDEwO1xuICAgIHZhciBjdW1EaXN0YW5jZSA9IDA7XG4gICAgbGV0IGN1bVNpemUsIGF2Z1NpemU7XG4gICAgZnVuY3Rpb24gcGFuTW92ZShldmVudCkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGlmIChwaW5jaGluZykgcmV0dXJuO1xuICAgICAgLy8gbG9nKGV2ZW50Lm92ZXJhbGxWZWxvY2l0eSk7XG4gICAgICAvLyBsZXQgdGhpc0Rpc3QgPSBwYXJzZUludChldmVudC5kaXN0YW5jZSk7XG4gICAgICAvLyBjdW1EaXN0YW5jZSArPSB0aGlzRGlzdDtcbiAgICAgIC8vXG4gICAgICAvLyBpZiAoY3VtRGlzdGFuY2UgPCAxMDApIHtcbiAgICAgIC8vICAgbG9nKCdpZ25vcmluZycpO1xuICAgICAgLy8gICByZXR1cm47XG4gICAgICAvLyB9IGVsc2Uge1xuICAgICAgLy8gICBjdW1EaXN0YW5jZSA9IDA7XG4gICAgICAvLyAgIGxvZygnbm90IGlnbm9yaW5nJyk7XG4gICAgICAvLyB9XG5cbiAgICAgIGNvbnN0IHBvaW50ZXIgPSBldmVudC5jZW50ZXI7XG4gICAgICBsZXQgcG9pbnQgPSBuZXcgUG9pbnQocG9pbnRlci54LCBwb2ludGVyLnkpO1xuXG4gICAgICAvLyBhbmdsZSA9IC0xICogZXZlbnQuYW5nbGU7IC8vIG1ha2UgdXAgcG9zaXRpdmUgcmF0aGVyIHRoYW4gbmVnYXRpdmVcbiAgICAgIC8vIGFuZ2xlID0gYW5nbGUgKz0gMTgwO1xuICAgICAgLy8gY29uc29sZS5sb2coZXZlbnQudmVsb2NpdHlYLCBldmVudC52ZWxvY2l0eVkpO1xuICAgICAgYW5nbGUgPSBNYXRoLmF0YW4yKGV2ZW50LnZlbG9jaXR5WSwgZXZlbnQudmVsb2NpdHlYKTtcbiAgICAgIGxldCBhbmdsZURlbHRhID0gdXRpbC5hbmdsZURlbHRhKGFuZ2xlLCBwcmV2QW5nbGUpO1xuICAgICAgcHJldkFuZ2xlID0gYW5nbGU7XG5cbiAgICAgIGlmIChhbmdsZURlbHRhID4gdGhyZXNob2xkQW5nbGUpIHtcbiAgICAgICAgaWYgKHNpZGUubGVuZ3RoID4gMCkge1xuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdjb3JuZXInKTtcbiAgICAgICAgICBsZXQgY29ybmVyUG9pbnQgPSBwb2ludDtcbiAgICAgICAgICAvLyBuZXcgUGF0aC5DaXJjbGUoe1xuICAgICAgICAgIC8vICAgY2VudGVyOiBjb3JuZXJQb2ludCxcbiAgICAgICAgICAvLyAgIHJhZGl1czogMTUsXG4gICAgICAgICAgLy8gICBzdHJva2VDb2xvcjogJ2JsYWNrJ1xuICAgICAgICAgIC8vIH0pO1xuICAgICAgICAgIGNvcm5lcnMucHVzaChjb3JuZXJQb2ludCk7XG4gICAgICAgICAgc2lkZXMucHVzaChzaWRlKTtcbiAgICAgICAgICBzaWRlID0gW107XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHNpZGUucHVzaChwb2ludCk7XG4gICAgICAvLyBsZXQgYW5nbGVEZWcgPSAtMSAqIGV2ZW50LmFuZ2xlO1xuICAgICAgLy8gaWYgKGFuZ2xlRGVnIDwgMCkgYW5nbGVEZWcgKz0gMzYwOyAvLyBub3JtYWxpemUgdG8gWzAsIDM2MClcbiAgICAgIC8vIGFuZ2xlID0gdXRpbC5yYWQoYW5nbGVEZWcpO1xuICAgICAgLy9cbiAgICAgIC8vIC8vIGxldCBhbmdsZURlbHRhID0gTWF0aC5hdGFuMihNYXRoLnNpbihhbmdsZSksIE1hdGguY29zKGFuZ2xlKSkgLSBNYXRoLmF0YW4yKE1hdGguc2luKHByZXZBbmdsZSksIE1hdGguY29zKHByZXZBbmdsZSkpO1xuICAgICAgLy8gY29uc29sZS5sb2coYW5nbGUsIHByZXZBbmdsZSk7XG4gICAgICAvLyAvLyBjb25zb2xlLmxvZyhhbmdsZURlbHRhKTtcblxuICAgICAgLy8gY29uc29sZS5sb2coYW5nbGUpO1xuXG4gICAgICAvLyBsZXQgYW5nbGVEZWx0YSA9IE1hdGguYWJzKHByZXZBbmdsZSAtIGFuZ2xlKTtcbiAgICAgIC8vIGlmIChhbmdsZURlbHRhID4gMzYwKSBhbmdsZURlbHRhID0gYW5nbGVEZWx0YSAtIDM2MDtcbiAgICAgIC8vIGlmIChhbmdsZURlbHRhID4gOTApIHtcbiAgICAgIC8vICAgY29uc29sZS5sb2coYW5nbGUsIHByZXZBbmdsZSwgYW5nbGVEZWx0YSk7XG4gICAgICAvLyAgIGNvbnNvbGUuZXJyb3IoJ2Nvcm5lciEnKTtcbiAgICAgIC8vIH0gZWxzZSB7XG4gICAgICAvLyAgIC8vIGNvbnNvbGUubG9nKGFuZ2xlRGVsdGEpO1xuICAgICAgLy8gfVxuXG4gICAgICB3aGlsZSAoc2l6ZXMubGVuZ3RoID4gbWVtb3J5KSB7XG4gICAgICAgIHNpemVzLnNoaWZ0KCk7XG4gICAgICB9XG5cbiAgICAgIGxldCBib3R0b21YLCBib3R0b21ZLCBib3R0b20sXG4gICAgICAgIHRvcFgsIHRvcFksIHRvcCxcbiAgICAgICAgcDAsIHAxLFxuICAgICAgICBzdGVwLCBhbmdsZSwgZGlzdCwgc2l6ZTtcblxuICAgICAgaWYgKHNpemVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLy8gbm90IHRoZSBmaXJzdCBwb2ludCwgc28gd2UgaGF2ZSBvdGhlcnMgdG8gY29tcGFyZSB0b1xuICAgICAgICBwMCA9IHByZXZQb2ludDtcbiAgICAgICAgZGlzdCA9IHV0aWwuZGVsdGEocG9pbnQsIHAwKTtcbiAgICAgICAgc2l6ZSA9IGRpc3QgKiBhbHBoYTtcbiAgICAgICAgLy8gaWYgKHNpemUgPj0gbWF4KSBzaXplID0gbWF4O1xuICAgICAgICBzaXplID0gTWF0aC5tYXgoTWF0aC5taW4oc2l6ZSwgbWF4KSwgbWluKTsgLy8gY2xhbXAgc2l6ZSB0byBbbWluLCBtYXhdXG4gICAgICAgIC8vIHNpemUgPSBtYXggLSBzaXplO1xuXG4gICAgICAgIGN1bVNpemUgPSAwO1xuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHNpemVzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgY3VtU2l6ZSArPSBzaXplc1tqXTtcbiAgICAgICAgfVxuICAgICAgICBhdmdTaXplID0gTWF0aC5yb3VuZCgoKGN1bVNpemUgLyBzaXplcy5sZW5ndGgpICsgc2l6ZSkgLyAyKTtcbiAgICAgICAgLy8gbG9nKGF2Z1NpemUpO1xuXG4gICAgICAgIGFuZ2xlID0gTWF0aC5hdGFuMihwb2ludC55IC0gcDAueSwgcG9pbnQueCAtIHAwLngpOyAvLyByYWRcblxuICAgICAgICAvLyBQb2ludChib3R0b21YLCBib3R0b21ZKSBpcyBib3R0b20sIFBvaW50KHRvcFgsIHRvcFkpIGlzIHRvcFxuICAgICAgICBib3R0b21YID0gcG9pbnQueCArIE1hdGguY29zKGFuZ2xlICsgTWF0aC5QSS8yKSAqIGF2Z1NpemU7XG4gICAgICAgIGJvdHRvbVkgPSBwb2ludC55ICsgTWF0aC5zaW4oYW5nbGUgKyBNYXRoLlBJLzIpICogYXZnU2l6ZTtcbiAgICAgICAgYm90dG9tID0gbmV3IFBvaW50KGJvdHRvbVgsIGJvdHRvbVkpO1xuXG4gICAgICAgIHRvcFggPSBwb2ludC54ICsgTWF0aC5jb3MoYW5nbGUgLSBNYXRoLlBJLzIpICogYXZnU2l6ZTtcbiAgICAgICAgdG9wWSA9IHBvaW50LnkgKyBNYXRoLnNpbihhbmdsZSAtIE1hdGguUEkvMikgKiBhdmdTaXplO1xuICAgICAgICB0b3AgPSBuZXcgUG9pbnQodG9wWCwgdG9wWSk7XG5cbiAgICAgICAgYm91bmRzLmFkZCh0b3ApO1xuICAgICAgICBib3VuZHMuaW5zZXJ0KDAsIGJvdHRvbSk7XG4gICAgICAgIC8vIGJvdW5kcy5zbW9vdGgoKTtcblxuICAgICAgICBtaWRkbGUuYWRkKHBvaW50KTtcbiAgICAgICAgcGF0aERhdGFbc2hhcGUuc3RyaW5naWZ5UG9pbnQocG9pbnQpXSA9IHtcbiAgICAgICAgICBwb2ludDogcG9pbnQsXG4gICAgICAgICAgc2l6ZTogYXZnU2l6ZSxcbiAgICAgICAgICBzcGVlZDogTWF0aC5hYnMoZXZlbnQub3ZlcmFsbFZlbG9jaXR5KVxuICAgICAgICB9O1xuICAgICAgICAvLyBpZiAoc2hhcGUuc3RyaW5naWZ5UG9pbnQocG9pbnQpIGluIHBhdGhEYXRhKSB7XG4gICAgICAgIC8vICAgbG9nKCdkdXBsaWNhdGUhJyk7XG4gICAgICAgIC8vIH0gZWxzZSB7XG4gICAgICAgIC8vIH1cbiAgICAgICAgLy8gbWlkZGxlLnNtb290aCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZG9uJ3QgaGF2ZSBhbnl0aGluZyB0byBjb21wYXJlIHRvXG4gICAgICAgIGRpc3QgPSAxO1xuICAgICAgICBhbmdsZSA9IDA7XG5cbiAgICAgICAgc2l6ZSA9IGRpc3QgKiBhbHBoYTtcbiAgICAgICAgc2l6ZSA9IE1hdGgubWF4KE1hdGgubWluKHNpemUsIG1heCksIG1pbik7IC8vIGNsYW1wIHNpemUgdG8gW21pbiwgbWF4XVxuICAgICAgICBwYXRoRGF0YVtzaGFwZS5zdHJpbmdpZnlQb2ludChwb2ludCldID0ge1xuICAgICAgICAgIHBvaW50OiBwb2ludCxcbiAgICAgICAgICBzcGVlZDogTWF0aC5hYnMoZXZlbnQub3ZlcmFsbFZlbG9jaXR5KVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBwYXBlci52aWV3LmRyYXcoKTtcblxuICAgICAgcHJldlBvaW50ID0gcG9pbnQ7XG4gICAgICBzaXplcy5wdXNoKHNpemUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhbkVuZChldmVudCkge1xuICAgICAgaWYgKHBpbmNoaW5nKSByZXR1cm47XG5cbiAgICAgIGNvbnN0IHBvaW50ZXIgPSBldmVudC5jZW50ZXI7XG4gICAgICBjb25zdCBwb2ludCA9IG5ldyBQb2ludChwb2ludGVyLngsIHBvaW50ZXIueSk7XG5cbiAgICAgIGxldCBncm91cCA9IG5ldyBHcm91cChbYm91bmRzLCBtaWRkbGVdKTtcbiAgICAgIGdyb3VwLmRhdGEuY29sb3IgPSBib3VuZHMuZmlsbENvbG9yO1xuICAgICAgZ3JvdXAuZGF0YS51cGRhdGUgPSB0cnVlO1xuXG4gICAgICBib3VuZHMuYWRkKHBvaW50KTtcbiAgICAgIGJvdW5kcy5jbG9zZWQgPSB0cnVlO1xuICAgICAgLy8gYm91bmRzLnNpbXBsaWZ5KCk7XG5cbiAgICAgIG1pZGRsZS5hZGQocG9pbnQpO1xuICAgICAgLy8gbWlkZGxlLnNpbXBsaWZ5KCk7XG5cbiAgICAgIHNpZGUucHVzaChwb2ludCk7XG4gICAgICBzaWRlcy5wdXNoKHNpZGUpO1xuXG4gICAgICBwYXRoRGF0YVtzaGFwZS5zdHJpbmdpZnlQb2ludChwb2ludCldID0ge1xuICAgICAgICBwb2ludDogcG9pbnQsXG4gICAgICAgIGxhc3Q6IHRydWVcbiAgICAgIH07XG5cbiAgICAgIGNvcm5lcnMucHVzaChwb2ludCk7XG5cbiAgICAgIC8vIG1pZGRsZS5zaW1wbGlmeSgpO1xuICAgICAgbWlkZGxlLnJlZHVjZSgpO1xuICAgICAgbGV0IFt0cnVlZEdyb3VwLCB0cnVlV2FzTmVjZXNzYXJ5XSA9IHV0aWwudHJ1ZUdyb3VwKGdyb3VwLCBjb3JuZXJzKTtcbiAgICAgIGdyb3VwLnJlcGxhY2VXaXRoKHRydWVkR3JvdXApO1xuICAgICAgbWlkZGxlID0gZ3JvdXAuX25hbWVkQ2hpbGRyZW4ubWlkZGxlWzBdO1xuICAgICAgbWlkZGxlLnN0cm9rZUNvbG9yID0gZ3JvdXAuc3Ryb2tlQ29sb3I7XG4gICAgICAvLyBtaWRkbGUuc2VsZWN0ZWQgPSB0cnVlO1xuXG4gICAgICAvLyBib3VuZHMuZmxhdHRlbig0KTtcbiAgICAgIC8vIGJvdW5kcy5zbW9vdGgoKTtcblxuICAgICAgLy8gbWlkZGxlLmZsYXR0ZW4oNCk7XG4gICAgICAvLyBtaWRkbGUucmVkdWNlKCk7XG5cbiAgICAgIC8vIG1pZGRsZS5zaW1wbGlmeSgpO1xuICAgICAgaWYgKHRydWVXYXNOZWNlc3NhcnkpIHtcbiAgICAgICAgbGV0IGNvbXB1dGVkQ29ybmVycyA9IHNoYXBlLmdldENvbXB1dGVkQ29ybmVycyhtaWRkbGUpO1xuICAgICAgICBsZXQgY29tcHV0ZWRDb3JuZXJzUGF0aCA9IG5ldyBQYXRoKGNvbXB1dGVkQ29ybmVycyk7XG4gICAgICAgIGNvbXB1dGVkQ29ybmVyc1BhdGgudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICBsZXQgY29tcHV0ZWRDb3JuZXJzUGF0aExlbmd0aCA9IGNvbXB1dGVkQ29ybmVyc1BhdGgubGVuZ3RoO1xuICAgICAgICBpZiAoTWF0aC5hYnMoY29tcHV0ZWRDb3JuZXJzUGF0aExlbmd0aCAtIG1pZGRsZS5sZW5ndGgpIC8gbWlkZGxlLmxlbmd0aCA8PSAwLjEpIHtcbiAgICAgICAgICBtaWRkbGUuc2VnbWVudHMgPSBjb21wdXRlZENvcm5lcnM7XG4gICAgICAgICAgLy8gbWlkZGxlLnJlZHVjZSgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIG1pZGRsZS5yZWR1Y2UoKTtcblxuICAgICAgICAvLyBtaWRkbGUuc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgLy8gbWlkZGxlLnZpc2libGUgPSB0cnVlO1xuICAgICAgICAvLyBtaWRkbGUuc3Ryb2tlQ29sb3IgPSAncGluayc7XG4gICAgICAgIC8vIG1pZGRsZS5zdHJva2VXZWlnaHQgPSA1MDtcblxuXG4gICAgICAgIC8vIGxldCBtZXJnZWRDb3JuZXJzID0gY29ybmVycy5jb25jYXQoY29tcHV0ZWRDb3JuZXJzKTtcbiAgICAgICAgLy8gbGV0IGZvbyA9IG5ldyBQYXRoKG1lcmdlZENvcm5lcnMpO1xuICAgICAgICAvLyBmb28uc3Ryb2tlV2lkdGggPSA1O1xuICAgICAgICAvLyBmb28uc3Ryb2tlQ29sb3IgPSAnYmx1ZSc7XG4gICAgICAgIC8vIGxldCBjb3JuZXJzUGF0aCA9IG5ldyBQYXRoKHtcbiAgICAgICAgLy8gICBzdHJva2VXaWR0aDogNSxcbiAgICAgICAgLy8gICBzdHJva2VDb2xvcjogJ3JlZCdcbiAgICAgICAgLy8gfSk7XG4gICAgICAgIC8vIEJhc2UuZWFjaChtZXJnZWRDb3JuZXJzLCAoY29ybmVyLCBpKSA9PiB7XG4gICAgICAgIC8vICAgY29ybmVyc1BhdGguYWRkKGNvcm5lcik7XG4gICAgICAgIC8vICAgLy8gaWYgKGkgPCAyKSB7XG4gICAgICAgIC8vICAgLy8gICBjb3JuZXJzUGF0aC5hZGQoY29ybmVyKTtcbiAgICAgICAgLy8gICAvLyB9IGVsc2Uge1xuICAgICAgICAvLyAgIC8vICAgbGV0IGNsb3Nlc3RQb2ludCA9IGNvcm5lcnNQYXRoLmdldE5lYXJlc3RQb2ludChjb3JuZXIpO1xuICAgICAgICAvLyAgIC8vICAgY29ybmVyc1BhdGguaW5zZXJ0KGNvcm5lciwgY2xvc2VzdFBvaW50LmluZGV4ICsgMSk7XG4gICAgICAgIC8vICAgLy8gfVxuICAgICAgICAvLyB9KTtcbiAgICAgICAgLy8gbGV0IGNvcm5lcnNQYXRoID0gbmV3IFBhdGgoe1xuICAgICAgICAvLyAgIHN0cm9rZVdpZHRoOiA1LFxuICAgICAgICAvLyAgIHN0cm9rZUNvbG9yOiAncmVkJyxcbiAgICAgICAgLy8gICBzZWdtZW50czogY29ybmVyc1xuICAgICAgICAvLyB9KTtcbiAgICAgICAgLy8gbGV0IGNvbXB1dGVkQ29ybmVyc1BhdGggPSBuZXcgUGF0aCh7XG4gICAgICAgIC8vICAgc3Ryb2tlV2lkdGg6IDUsXG4gICAgICAgIC8vICAgc3Ryb2tlQ29sb3I6ICdibHVlJyxcbiAgICAgICAgLy8gICBzZWdtZW50czogY29tcHV0ZWRDb3JuZXJzLFxuICAgICAgICAvLyAgIGNsb3NlZDogdHJ1ZVxuICAgICAgICAvLyB9KTtcblxuICAgICAgICAvLyBsZXQgdGhyZXNob2xkRGlzdCA9IDAuMDUgKiBjb21wdXRlZENvcm5lcnNQYXRoLmxlbmd0aDtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gQmFzZS5lYWNoKGNvcm5lcnMsIChjb3JuZXIsIGkpID0+IHtcbiAgICAgICAgLy8gICBsZXQgaW50ZWdlclBvaW50ID0gc2hhcGUuZ2V0SW50ZWdlclBvaW50KGNvcm5lcik7XG4gICAgICAgIC8vICAgbGV0IGNsb3Nlc3RQb2ludCA9IGNvbXB1dGVkQ29ybmVyc1BhdGguZ2V0TmVhcmVzdFBvaW50KGNvcm5lcik7XG4gICAgICAgIC8vIH0pO1xuICAgICAgICAvLyBjb21wdXRlZENvcm5lcnMudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICAvLyBjb21wdXRlZENvcm5lcnNQYXRoLnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgLy8gbGV0IG1lcmdlZENvcm5lcnNQYXRoID0gY29ybmVyc1BhdGgudW5pdGUoY29tcHV0ZWRDb3JuZXJzUGF0aCk7XG4gICAgICAgIC8vIG1lcmdlZENvcm5lcnNQYXRoLnN0cm9rZUNvbG9yID0gJ3B1cnBsZSc7XG4gICAgICAgIC8vIGNvcm5lcnNQYXRoLmZsYXR0ZW4oKTtcbiAgICAgIC8vIH1cblxuICAgICAgLy8gaWYgKHRydWVXYXNOZWNlc3NhcnkpIHtcbiAgICAgIC8vICAgbGV0IGlkZWFsR2VvbWV0cnkgPSBzaGFwZS5nZXRJZGVhbEdlb21ldHJ5KHBhdGhEYXRhLCBzaWRlcywgbWlkZGxlKTtcbiAgICAgIC8vICAgbG9nKGlkZWFsR2VvbWV0cnkpO1xuICAgICAgLy8gICBCYXNlLmVhY2goY29ybmVycywgKGNvcm5lciwgaSkgPT4ge1xuICAgICAgLy8gICAgIGlkZWFsR2VvbWV0cnkuYWRkKGNvcm5lcik7XG4gICAgICAvLyAgIH0pO1xuICAgICAgLy8gICBpZGVhbEdlb21ldHJ5LnJlZHVjZSgpO1xuICAgICAgLy9cbiAgICAgIC8vICAgaWRlYWxHZW9tZXRyeS5zdHJva2VDb2xvciA9ICdyZWQnO1xuICAgICAgLy8gfSBlbHNlIHtcbiAgICAgIC8vICAgbG9nKCdubyB0cnVlaW5nIG5lY2Vzc2FyeScpO1xuICAgICAgLy8gfVxuICAgICAgLy8gbWlkZGxlLnNtb290aCh7XG4gICAgICAvLyAgIHR5cGU6ICdnZW9tZXRyaWMnXG4gICAgICAvLyB9KTtcbiAgICAgIC8vIG1pZGRsZS5mbGF0dGVuKDEwKTtcbiAgICAgIC8vIG1pZGRsZS5zaW1wbGlmeSgpO1xuICAgICAgLy8gbWlkZGxlLmZsYXR0ZW4oMjApO1xuICAgICAgLy8gbWlkZGxlLnNpbXBsaWZ5KCk7XG4gICAgICAvLyBtaWRkbGUuZmxhdHRlbigpO1xuICAgICAgLy8gbWlkZGxlLnNpbXBsaWZ5KCk7XG5cbiAgICAgIC8vIG1pZGRsZS5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAvLyBsZXQgbWlkZGxlQ2xvbmUgPSBtaWRkbGUuY2xvbmUoKTtcbiAgICAgIC8vIG1pZGRsZUNsb25lLnZpc2libGUgPSB0cnVlO1xuICAgICAgLy8gbWlkZGxlQ2xvbmUuc3Ryb2tlQ29sb3IgPSAncGluayc7XG5cblxuICAgICAgbGV0IGludGVyc2VjdGlvbnMgPSBtaWRkbGUuZ2V0Q3Jvc3NpbmdzKCk7XG4gICAgICBpZiAoaW50ZXJzZWN0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgIC8vIHdlIGNyZWF0ZSBhIGNvcHkgb2YgdGhlIHBhdGggYmVjYXVzZSByZXNvbHZlQ3Jvc3NpbmdzKCkgc3BsaXRzIHNvdXJjZSBwYXRoXG4gICAgICAgIGxldCBwYXRoQ29weSA9IG5ldyBQYXRoKCk7XG4gICAgICAgIHBhdGhDb3B5LmNvcHlDb250ZW50KG1pZGRsZSk7XG4gICAgICAgIHBhdGhDb3B5LnZpc2libGUgPSBmYWxzZTtcblxuICAgICAgICBsZXQgZGl2aWRlZFBhdGggPSBwYXRoQ29weS5yZXNvbHZlQ3Jvc3NpbmdzKCk7XG4gICAgICAgIGRpdmlkZWRQYXRoLnZpc2libGUgPSBmYWxzZTtcblxuXG4gICAgICAgIGxldCBlbmNsb3NlZExvb3BzID0gdXRpbC5maW5kSW50ZXJpb3JDdXJ2ZXMoZGl2aWRlZFBhdGgpO1xuXG4gICAgICAgIGlmIChlbmNsb3NlZExvb3BzKSB7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbmNsb3NlZExvb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBlbmNsb3NlZExvb3BzW2ldLnZpc2libGUgPSB0cnVlO1xuICAgICAgICAgICAgZW5jbG9zZWRMb29wc1tpXS5jbG9zZWQgPSB0cnVlO1xuICAgICAgICAgICAgZW5jbG9zZWRMb29wc1tpXS5maWxsQ29sb3IgPSBuZXcgQ29sb3IoMCwgMCk7IC8vIHRyYW5zcGFyZW50XG4gICAgICAgICAgICBlbmNsb3NlZExvb3BzW2ldLmRhdGEuaW50ZXJpb3IgPSB0cnVlO1xuICAgICAgICAgICAgZW5jbG9zZWRMb29wc1tpXS5kYXRhLnRyYW5zcGFyZW50ID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vIGVuY2xvc2VkTG9vcHNbaV0uYmxlbmRNb2RlID0gJ211bHRpcGx5JztcbiAgICAgICAgICAgIGdyb3VwLmFkZENoaWxkKGVuY2xvc2VkTG9vcHNbaV0pO1xuICAgICAgICAgICAgZW5jbG9zZWRMb29wc1tpXS5zZW5kVG9CYWNrKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHBhdGhDb3B5LnJlbW92ZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKG1pZGRsZS5jbG9zZWQpIHtcbiAgICAgICAgICBsZXQgZW5jbG9zZWRMb29wID0gbWlkZGxlLmNsb25lKCk7XG4gICAgICAgICAgZW5jbG9zZWRMb29wLnZpc2libGUgPSB0cnVlO1xuICAgICAgICAgIGVuY2xvc2VkTG9vcC5maWxsQ29sb3IgPSBuZXcgQ29sb3IoMCwgMCk7IC8vIHRyYW5zcGFyZW50XG4gICAgICAgICAgZW5jbG9zZWRMb29wLmRhdGEuaW50ZXJpb3IgPSB0cnVlO1xuICAgICAgICAgIGVuY2xvc2VkTG9vcC5kYXRhLnRyYW5zcGFyZW50ID0gdHJ1ZTtcbiAgICAgICAgICBncm91cC5hZGRDaGlsZChlbmNsb3NlZExvb3ApO1xuICAgICAgICAgIGVuY2xvc2VkTG9vcC5zZW5kVG9CYWNrKCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZ3JvdXAuZGF0YS5jb2xvciA9IGJvdW5kcy5maWxsQ29sb3I7XG4gICAgICBncm91cC5kYXRhLnNjYWxlID0gMTsgLy8gaW5pdCB2YXJpYWJsZSB0byB0cmFjayBzY2FsZSBjaGFuZ2VzXG4gICAgICBncm91cC5kYXRhLnJvdGF0aW9uID0gMDsgLy8gaW5pdCB2YXJpYWJsZSB0byB0cmFjayByb3RhdGlvbiBjaGFuZ2VzXG5cbiAgICAgIGxldCBjaGlsZHJlbiA9IGdyb3VwLmdldEl0ZW1zKHtcbiAgICAgICAgbWF0Y2g6IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICByZXR1cm4gaXRlbS5uYW1lICE9PSAnbWlkZGxlJ1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gbG9nKCctLS0tLScpO1xuICAgICAgLy8gbG9nKGdyb3VwKTtcbiAgICAgIC8vIGxvZyhjaGlsZHJlbik7XG4gICAgICAvLyBncm91cC5zZWxlY3RlZCA9IHRydWU7XG4gICAgICBsZXQgdW5pdGVkUGF0aCA9IG5ldyBQYXRoKCk7XG4gICAgICBpZiAoY2hpbGRyZW4ubGVuZ3RoID4gMSkge1xuICAgICAgICBsZXQgYWNjdW11bGF0b3IgPSBuZXcgUGF0aCgpO1xuICAgICAgICBhY2N1bXVsYXRvci5jb3B5Q29udGVudChjaGlsZHJlblswXSk7XG4gICAgICAgIGFjY3VtdWxhdG9yLnZpc2libGUgPSBmYWxzZTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgbGV0IG90aGVyUGF0aCA9IG5ldyBQYXRoKCk7XG4gICAgICAgICAgb3RoZXJQYXRoLmNvcHlDb250ZW50KGNoaWxkcmVuW2ldKTtcbiAgICAgICAgICBvdGhlclBhdGgudmlzaWJsZSA9IGZhbHNlO1xuXG4gICAgICAgICAgdW5pdGVkUGF0aCA9IGFjY3VtdWxhdG9yLnVuaXRlKG90aGVyUGF0aCk7XG4gICAgICAgICAgb3RoZXJQYXRoLnJlbW92ZSgpO1xuICAgICAgICAgIGFjY3VtdWxhdG9yID0gdW5pdGVkUGF0aDtcbiAgICAgICAgfVxuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBjaGlsZHJlblswXSBpcyB1bml0ZWQgZ3JvdXBcbiAgICAgICAgdW5pdGVkUGF0aC5jb3B5Q29udGVudChjaGlsZHJlblswXSk7XG4gICAgICB9XG5cbiAgICAgIHVuaXRlZFBhdGgudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgdW5pdGVkUGF0aC5kYXRhLm5hbWUgPSAnbWFzayc7XG5cbiAgICAgIGdyb3VwLmFkZENoaWxkKHVuaXRlZFBhdGgpO1xuICAgICAgdW5pdGVkUGF0aC5zZW5kVG9CYWNrKCk7XG5cbiAgICAgIC8vIG1pZGRsZS5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAvLyBtaWRkbGUudmlzaWJsZSA9IHRydWU7XG4gICAgICAvLyBtaWRkbGUuc3Ryb2tlQ29sb3IgPSAncGluayc7XG5cbiAgICAgIGxhc3RDaGlsZCA9IGdyb3VwO1xuXG4gICAgICBNT1ZFUy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ25ld0dyb3VwJyxcbiAgICAgICAgaWQ6IGdyb3VwLmlkXG4gICAgICB9KTtcblxuICAgICAgaWYgKHJ1bkFuaW1hdGlvbnMpIHtcbiAgICAgICAgZ3JvdXAuYW5pbWF0ZShcbiAgICAgICAgICBbe1xuICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICBzY2FsZTogMC45XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgICAgICAgZHVyYXRpb246IDEwMCxcbiAgICAgICAgICAgICAgZWFzaW5nOiBcImVhc2VPdXRcIixcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgc2NhbGU6IDEuMTFcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXR0aW5nczoge1xuICAgICAgICAgICAgICBkdXJhdGlvbjogMTAwLFxuICAgICAgICAgICAgICBlYXNpbmc6IFwiZWFzZUluXCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxldCBwaW5jaGluZztcbiAgICBsZXQgcGluY2hlZEdyb3VwLCBsYXN0U2NhbGUsIGxhc3RSb3RhdGlvbjtcbiAgICBsZXQgb3JpZ2luYWxQb3NpdGlvbiwgb3JpZ2luYWxSb3RhdGlvbiwgb3JpZ2luYWxTY2FsZTtcblxuICAgIGZ1bmN0aW9uIHBpbmNoU3RhcnQoZXZlbnQpIHtcbiAgICAgIGxvZygncGluY2hTdGFydCcsIGV2ZW50LmNlbnRlcik7XG4gICAgICBoYW1tZXJNYW5hZ2VyLmdldCgncGFuJykuc2V0KHtlbmFibGU6IGZhbHNlfSk7XG4gICAgICBjb25zdCBwb2ludGVyID0gZXZlbnQuY2VudGVyLFxuICAgICAgICAgIHBvaW50ID0gbmV3IFBvaW50KHBvaW50ZXIueCwgcG9pbnRlci55KSxcbiAgICAgICAgICBoaXRSZXN1bHQgPSBoaXRUZXN0R3JvdXBCb3VuZHMocG9pbnQpO1xuXG4gICAgICBpZiAoaGl0UmVzdWx0KSB7XG4gICAgICAgIHBpbmNoaW5nID0gdHJ1ZTtcbiAgICAgICAgLy8gcGluY2hlZEdyb3VwID0gaGl0UmVzdWx0Lml0ZW0ucGFyZW50O1xuICAgICAgICBwaW5jaGVkR3JvdXAgPSBoaXRSZXN1bHQ7XG4gICAgICAgIGxhc3RTY2FsZSA9IDE7XG4gICAgICAgIGxhc3RSb3RhdGlvbiA9IGV2ZW50LnJvdGF0aW9uO1xuXG4gICAgICAgIG9yaWdpbmFsUG9zaXRpb24gPSBwaW5jaGVkR3JvdXAucG9zaXRpb247XG4gICAgICAgIC8vIG9yaWdpbmFsUm90YXRpb24gPSBwaW5jaGVkR3JvdXAucm90YXRpb247XG4gICAgICAgIG9yaWdpbmFsUm90YXRpb24gPSBwaW5jaGVkR3JvdXAuZGF0YS5yb3RhdGlvbjtcbiAgICAgICAgb3JpZ2luYWxTY2FsZSA9IHBpbmNoZWRHcm91cC5kYXRhLnNjYWxlO1xuXG4gICAgICAgIGlmIChydW5BbmltYXRpb25zKSB7XG4gICAgICAgICAgcGluY2hlZEdyb3VwLmFuaW1hdGUoe1xuICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICBzY2FsZTogMS4yNVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldHRpbmdzOiB7XG4gICAgICAgICAgICAgIGR1cmF0aW9uOiAxMDAsXG4gICAgICAgICAgICAgIGVhc2luZzogXCJlYXNlT3V0XCIsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBpbmNoZWRHcm91cCA9IG51bGw7XG4gICAgICAgIGxvZygnaGl0IG5vIGl0ZW0nKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwaW5jaE1vdmUoZXZlbnQpIHtcbiAgICAgIGxvZygncGluY2hNb3ZlJyk7XG4gICAgICBpZiAoISFwaW5jaGVkR3JvdXApIHtcbiAgICAgICAgLy8gbG9nKCdwaW5jaG1vdmUnLCBldmVudCk7XG4gICAgICAgIC8vIGxvZyhwaW5jaGVkR3JvdXApO1xuICAgICAgICBsZXQgY3VycmVudFNjYWxlID0gZXZlbnQuc2NhbGU7XG4gICAgICAgIGxldCBzY2FsZURlbHRhID0gY3VycmVudFNjYWxlIC8gbGFzdFNjYWxlO1xuICAgICAgICAvLyBsb2cobGFzdFNjYWxlLCBjdXJyZW50U2NhbGUsIHNjYWxlRGVsdGEpO1xuICAgICAgICBsYXN0U2NhbGUgPSBjdXJyZW50U2NhbGU7XG5cbiAgICAgICAgbGV0IGN1cnJlbnRSb3RhdGlvbiA9IGV2ZW50LnJvdGF0aW9uO1xuICAgICAgICBsZXQgcm90YXRpb25EZWx0YSA9IGN1cnJlbnRSb3RhdGlvbiAtIGxhc3RSb3RhdGlvbjtcbiAgICAgICAgbG9nKGxhc3RSb3RhdGlvbiwgY3VycmVudFJvdGF0aW9uLCByb3RhdGlvbkRlbHRhKTtcbiAgICAgICAgbGFzdFJvdGF0aW9uID0gY3VycmVudFJvdGF0aW9uO1xuXG4gICAgICAgIC8vIGxvZyhgc2NhbGluZyBieSAke3NjYWxlRGVsdGF9YCk7XG4gICAgICAgIC8vIGxvZyhgcm90YXRpbmcgYnkgJHtyb3RhdGlvbkRlbHRhfWApO1xuXG4gICAgICAgIHBpbmNoZWRHcm91cC5wb3NpdGlvbiA9IGV2ZW50LmNlbnRlcjtcbiAgICAgICAgcGluY2hlZEdyb3VwLnNjYWxlKHNjYWxlRGVsdGEpO1xuICAgICAgICBwaW5jaGVkR3JvdXAucm90YXRlKHJvdGF0aW9uRGVsdGEpO1xuXG4gICAgICAgIHBpbmNoZWRHcm91cC5kYXRhLnNjYWxlICo9IHNjYWxlRGVsdGE7XG4gICAgICAgIHBpbmNoZWRHcm91cC5kYXRhLnJvdGF0aW9uICs9IHJvdGF0aW9uRGVsdGE7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IGxhc3RFdmVudDtcbiAgICBmdW5jdGlvbiBwaW5jaEVuZChldmVudCkge1xuICAgICAgLy8gd2FpdCAyNTAgbXMgdG8gcHJldmVudCBtaXN0YWtlbiBwYW4gcmVhZGluZ3NcbiAgICAgIGxhc3RFdmVudCA9IGV2ZW50O1xuICAgICAgaWYgKCEhcGluY2hlZEdyb3VwKSB7XG4gICAgICAgIHBpbmNoZWRHcm91cC5kYXRhLnVwZGF0ZSA9IHRydWU7XG4gICAgICAgIGxldCBtb3ZlID0ge1xuICAgICAgICAgIGlkOiBwaW5jaGVkR3JvdXAuaWQsXG4gICAgICAgICAgdHlwZTogJ3RyYW5zZm9ybSdcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHBpbmNoZWRHcm91cC5wb3NpdGlvbiAhPSBvcmlnaW5hbFBvc2l0aW9uKSB7XG4gICAgICAgICAgbW92ZS5wb3NpdGlvbiA9IG9yaWdpbmFsUG9zaXRpb247XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGluY2hlZEdyb3VwLmRhdGEucm90YXRpb24gIT0gb3JpZ2luYWxSb3RhdGlvbikge1xuICAgICAgICAgIG1vdmUucm90YXRpb24gPSBvcmlnaW5hbFJvdGF0aW9uIC0gcGluY2hlZEdyb3VwLmRhdGEucm90YXRpb247XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGluY2hlZEdyb3VwLmRhdGEuc2NhbGUgIT0gb3JpZ2luYWxTY2FsZSkge1xuICAgICAgICAgIG1vdmUuc2NhbGUgPSBvcmlnaW5hbFNjYWxlIC8gcGluY2hlZEdyb3VwLmRhdGEuc2NhbGU7XG4gICAgICAgIH1cblxuICAgICAgICBsb2coJ2ZpbmFsIHNjYWxlJywgcGluY2hlZEdyb3VwLmRhdGEuc2NhbGUpO1xuICAgICAgICBsb2cobW92ZSk7XG5cbiAgICAgICAgTU9WRVMucHVzaChtb3ZlKTtcblxuICAgICAgICBpZiAoTWF0aC5hYnMoZXZlbnQudmVsb2NpdHkpID4gMSkge1xuICAgICAgICAgIC8vIGRpc3Bvc2Ugb2YgZ3JvdXAgb2Zmc2NyZWVuXG4gICAgICAgICAgdGhyb3dQaW5jaGVkR3JvdXAoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIChydW5BbmltYXRpb25zKSB7XG4gICAgICAgIC8vICAgcGluY2hlZEdyb3VwLmFuaW1hdGUoe1xuICAgICAgICAvLyAgICAgcHJvcGVydGllczoge1xuICAgICAgICAvLyAgICAgICBzY2FsZTogMC44XG4gICAgICAgIC8vICAgICB9LFxuICAgICAgICAvLyAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgLy8gICAgICAgZHVyYXRpb246IDEwMCxcbiAgICAgICAgLy8gICAgICAgZWFzaW5nOiBcImVhc2VPdXRcIixcbiAgICAgICAgLy8gICAgIH1cbiAgICAgICAgLy8gICB9KTtcbiAgICAgICAgLy8gfVxuICAgICAgfVxuICAgICAgcGluY2hpbmcgPSBmYWxzZTtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIGhhbW1lck1hbmFnZXIuZ2V0KCdwYW4nKS5zZXQoe2VuYWJsZTogdHJ1ZX0pO1xuICAgICAgfSwgMjUwKTtcbiAgICB9XG5cbiAgICBjb25zdCBoaXRPcHRpb25zID0ge1xuICAgICAgc2VnbWVudHM6IGZhbHNlLFxuICAgICAgc3Ryb2tlOiB0cnVlLFxuICAgICAgZmlsbDogdHJ1ZSxcbiAgICAgIHRvbGVyYW5jZTogNVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBzaW5nbGVUYXAoZXZlbnQpIHtcbiAgICAgIGNvbnN0IHBvaW50ZXIgPSBldmVudC5jZW50ZXIsXG4gICAgICAgICAgcG9pbnQgPSBuZXcgUG9pbnQocG9pbnRlci54LCBwb2ludGVyLnkpLFxuICAgICAgICAgIGhpdFJlc3VsdCA9IHBhcGVyLnByb2plY3QuaGl0VGVzdChwb2ludCwgaGl0T3B0aW9ucyk7XG5cbiAgICAgIGlmIChoaXRSZXN1bHQpIHtcbiAgICAgICAgbGV0IGl0ZW0gPSBoaXRSZXN1bHQuaXRlbTtcbiAgICAgICAgaXRlbS5zZWxlY3RlZCA9ICFpdGVtLnNlbGVjdGVkO1xuICAgICAgICBsb2coaXRlbSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZG91YmxlVGFwKGV2ZW50KSB7XG4gICAgICBjb25zdCBwb2ludGVyID0gZXZlbnQuY2VudGVyLFxuICAgICAgICAgIHBvaW50ID0gbmV3IFBvaW50KHBvaW50ZXIueCwgcG9pbnRlci55KSxcbiAgICAgICAgICBoaXRSZXN1bHQgPSBwYXBlci5wcm9qZWN0LmhpdFRlc3QocG9pbnQsIGhpdE9wdGlvbnMpO1xuXG4gICAgICBpZiAoaGl0UmVzdWx0KSB7XG4gICAgICAgIGxldCBpdGVtID0gaGl0UmVzdWx0Lml0ZW07XG4gICAgICAgIGxldCBwYXJlbnQgPSBpdGVtLnBhcmVudDtcblxuICAgICAgICBpZiAoaXRlbS5kYXRhLmludGVyaW9yKSB7XG4gICAgICAgICAgaXRlbS5kYXRhLnRyYW5zcGFyZW50ID0gIWl0ZW0uZGF0YS50cmFuc3BhcmVudDtcblxuICAgICAgICAgIGlmIChpdGVtLmRhdGEudHJhbnNwYXJlbnQpIHtcbiAgICAgICAgICAgIGl0ZW0uZmlsbENvbG9yID0gdHJhbnNwYXJlbnQ7XG4gICAgICAgICAgICBpdGVtLnN0cm9rZUNvbG9yID0gdHJhbnNwYXJlbnQ7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGl0ZW0uZmlsbENvbG9yID0gcGFyZW50LmRhdGEuY29sb3I7XG4gICAgICAgICAgICBpdGVtLnN0cm9rZUNvbG9yID0gcGFyZW50LmRhdGEuY29sb3I7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgTU9WRVMucHVzaCh7XG4gICAgICAgICAgICB0eXBlOiAnZmlsbENoYW5nZScsXG4gICAgICAgICAgICBpZDogaXRlbS5pZCxcbiAgICAgICAgICAgIGZpbGw6IHBhcmVudC5kYXRhLmNvbG9yLFxuICAgICAgICAgICAgdHJhbnNwYXJlbnQ6IGl0ZW0uZGF0YS50cmFuc3BhcmVudFxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxvZygnbm90IGludGVyaW9yJylcbiAgICAgICAgfVxuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwaW5jaGVkR3JvdXAgPSBudWxsO1xuICAgICAgICBsb2coJ2hpdCBubyBpdGVtJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgdmVsb2NpdHlNdWx0aXBsaWVyID0gMjU7XG4gICAgZnVuY3Rpb24gdGhyb3dQaW5jaGVkR3JvdXAoKSB7XG4gICAgICBsb2cocGluY2hlZEdyb3VwLnBvc2l0aW9uKTtcbiAgICAgIGlmIChwaW5jaGVkR3JvdXAucG9zaXRpb24ueCA8PSAwIC0gcGluY2hlZEdyb3VwLmJvdW5kcy53aWR0aCB8fFxuICAgICAgICAgIHBpbmNoZWRHcm91cC5wb3NpdGlvbi54ID49IHZpZXdXaWR0aCArIHBpbmNoZWRHcm91cC5ib3VuZHMud2lkdGggfHxcbiAgICAgICAgICBwaW5jaGVkR3JvdXAucG9zaXRpb24ueSA8PSAwIC0gcGluY2hlZEdyb3VwLmJvdW5kcy5oZWlnaHQgfHxcbiAgICAgICAgICBwaW5jaGVkR3JvdXAucG9zaXRpb24ueSA+PSB2aWV3SGVpZ2h0ICsgcGluY2hlZEdyb3VwLmJvdW5kcy5oZWlnaHQpIHtcbiAgICAgICAgICAgIHBpbmNoZWRHcm91cC5kYXRhLm9mZlNjcmVlbiA9IHRydWU7XG4gICAgICAgICAgICBwaW5jaGVkR3JvdXAudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhyb3dQaW5jaGVkR3JvdXApO1xuICAgICAgcGluY2hlZEdyb3VwLnBvc2l0aW9uLnggKz0gbGFzdEV2ZW50LnZlbG9jaXR5WCAqIHZlbG9jaXR5TXVsdGlwbGllcjtcbiAgICAgIHBpbmNoZWRHcm91cC5wb3NpdGlvbi55ICs9IGxhc3RFdmVudC52ZWxvY2l0eVkgKiB2ZWxvY2l0eU11bHRpcGxpZXI7XG4gICAgfVxuXG4gICAgdmFyIGhhbW1lck1hbmFnZXIgPSBuZXcgSGFtbWVyLk1hbmFnZXIoJGNhbnZhc1swXSk7XG5cbiAgICBoYW1tZXJNYW5hZ2VyLmFkZChuZXcgSGFtbWVyLlRhcCh7IGV2ZW50OiAnZG91YmxldGFwJywgdGFwczogMiB9KSk7XG4gICAgaGFtbWVyTWFuYWdlci5hZGQobmV3IEhhbW1lci5UYXAoeyBldmVudDogJ3NpbmdsZXRhcCcgfSkpO1xuICAgIGhhbW1lck1hbmFnZXIuYWRkKG5ldyBIYW1tZXIuUGFuKHsgZGlyZWN0aW9uOiBIYW1tZXIuRElSRUNUSU9OX0FMTCB9KSk7XG4gICAgaGFtbWVyTWFuYWdlci5hZGQobmV3IEhhbW1lci5QaW5jaCgpKTtcblxuICAgIGhhbW1lck1hbmFnZXIuZ2V0KCdkb3VibGV0YXAnKS5yZWNvZ25pemVXaXRoKCdzaW5nbGV0YXAnKTtcbiAgICBoYW1tZXJNYW5hZ2VyLmdldCgnc2luZ2xldGFwJykucmVxdWlyZUZhaWx1cmUoJ2RvdWJsZXRhcCcpO1xuICAgIGhhbW1lck1hbmFnZXIuZ2V0KCdwYW4nKS5yZXF1aXJlRmFpbHVyZSgncGluY2gnKTtcblxuICAgIGhhbW1lck1hbmFnZXIub24oJ3NpbmdsZXRhcCcsIHNpbmdsZVRhcCk7XG4gICAgaGFtbWVyTWFuYWdlci5vbignZG91YmxldGFwJywgZG91YmxlVGFwKTtcblxuICAgIGhhbW1lck1hbmFnZXIub24oJ3BhbnN0YXJ0JywgcGFuU3RhcnQpO1xuICAgIGhhbW1lck1hbmFnZXIub24oJ3Bhbm1vdmUnLCBwYW5Nb3ZlKTtcbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdwYW5lbmQnLCBwYW5FbmQpO1xuXG4gICAgaGFtbWVyTWFuYWdlci5vbigncGluY2hzdGFydCcsIHBpbmNoU3RhcnQpO1xuICAgIGhhbW1lck1hbmFnZXIub24oJ3BpbmNobW92ZScsIHBpbmNoTW92ZSk7XG4gICAgaGFtbWVyTWFuYWdlci5vbigncGluY2hlbmQnLCBwaW5jaEVuZCk7XG4gICAgaGFtbWVyTWFuYWdlci5vbigncGluY2hjYW5jZWwnLCBmdW5jdGlvbigpIHsgaGFtbWVyTWFuYWdlci5nZXQoJ3BhbicpLnNldCh7ZW5hYmxlOiB0cnVlfSk7IH0pOyAvLyBtYWtlIHN1cmUgaXQncyByZWVuYWJsZWRcbiAgfVxuXG4gIGZ1bmN0aW9uIG5ld1ByZXNzZWQoKSB7XG4gICAgbG9nKCduZXcgcHJlc3NlZCcpO1xuXG4gICAgcGFwZXIucHJvamVjdC5hY3RpdmVMYXllci5yZW1vdmVDaGlsZHJlbigpO1xuICB9XG5cbiAgZnVuY3Rpb24gdW5kb1ByZXNzZWQoKSB7XG4gICAgbG9nKCd1bmRvIHByZXNzZWQnKTtcbiAgICBpZiAoIShNT1ZFUy5sZW5ndGggPiAwKSkge1xuICAgICAgbG9nKCdubyBtb3ZlcyB5ZXQnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgbGFzdE1vdmUgPSBNT1ZFUy5wb3AoKTtcbiAgICBsZXQgaXRlbSA9IHByb2plY3QuZ2V0SXRlbSh7XG4gICAgICBpZDogbGFzdE1vdmUuaWRcbiAgICB9KTtcblxuICAgIGlmIChpdGVtKSB7XG4gICAgICBpdGVtLnZpc2libGUgPSB0cnVlOyAvLyBtYWtlIHN1cmVcbiAgICAgIHN3aXRjaChsYXN0TW92ZS50eXBlKSB7XG4gICAgICAgIGNhc2UgJ25ld0dyb3VwJzpcbiAgICAgICAgICBsb2coJ3JlbW92aW5nIGdyb3VwJyk7XG4gICAgICAgICAgaXRlbS5yZW1vdmUoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZmlsbENoYW5nZSc6XG4gICAgICAgICAgaWYgKGxhc3RNb3ZlLnRyYW5zcGFyZW50KSB7XG4gICAgICAgICAgICBpdGVtLmZpbGxDb2xvciA9IGxhc3RNb3ZlLmZpbGw7XG4gICAgICAgICAgICBpdGVtLnN0cm9rZUNvbG9yID0gbGFzdE1vdmUuZmlsbDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaXRlbS5maWxsQ29sb3IgPSB0cmFuc3BhcmVudDtcbiAgICAgICAgICAgIGl0ZW0uc3Ryb2tlQ29sb3IgPSB0cmFuc3BhcmVudDtcbiAgICAgICAgICB9XG4gICAgICAgIGNhc2UgJ3RyYW5zZm9ybSc6XG4gICAgICAgICAgaWYgKCEhbGFzdE1vdmUucG9zaXRpb24pIHtcbiAgICAgICAgICAgIGl0ZW0ucG9zaXRpb24gPSBsYXN0TW92ZS5wb3NpdGlvblxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoISFsYXN0TW92ZS5yb3RhdGlvbikge1xuICAgICAgICAgICAgaXRlbS5yb3RhdGlvbiA9IGxhc3RNb3ZlLnJvdGF0aW9uO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoISFsYXN0TW92ZS5zY2FsZSkge1xuICAgICAgICAgICAgaXRlbS5zY2FsZShsYXN0TW92ZS5zY2FsZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGxvZygndW5rbm93biBjYXNlJyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZygnY291bGQgbm90IGZpbmQgbWF0Y2hpbmcgaXRlbScpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHBsYXlQcmVzc2VkKCkge1xuICAgIGxvZygncGxheSBwcmVzc2VkJyk7XG4gIH1cblxuICBmdW5jdGlvbiB0aXBzUHJlc3NlZCgpIHtcbiAgICBsb2coJ3RpcHMgcHJlc3NlZCcpO1xuICB9XG5cbiAgZnVuY3Rpb24gc2hhcmVQcmVzc2VkKCkge1xuICAgIGxvZygnc2hhcmUgcHJlc3NlZCcpO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdE5ldygpIHtcbiAgICAkKCcubWFpbi1jb250cm9scyAubmV3Jykub24oJ2NsaWNrIHRhcCB0b3VjaCcsIG5ld1ByZXNzZWQpO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdFVuZG8oKSB7XG4gICAgJCgnLm1haW4tY29udHJvbHMgLnVuZG8nKS5vbignY2xpY2snLCB1bmRvUHJlc3NlZCk7XG4gIH1cbiAgZnVuY3Rpb24gaW5pdFBsYXkoKSB7XG4gICAgJCgnLm1haW4tY29udHJvbHMgLnBsYXknKS5vbignY2xpY2snLCBwbGF5UHJlc3NlZCk7XG4gIH1cbiAgZnVuY3Rpb24gaW5pdFRpcHMoKSB7XG4gICAgJCgnLmF1eC1jb250cm9scyAudGlwcycpLm9uKCdjbGljaycsIHRpcHNQcmVzc2VkKTtcbiAgfVxuICBmdW5jdGlvbiBpbml0U2hhcmUoKSB7XG4gICAgJCgnLmF1eC1jb250cm9scyAuc2hhcmUnKS5vbignY2xpY2snLCBzaGFyZVByZXNzZWQpO1xuICB9XG5cbiAgZnVuY3Rpb24gZHJhd0NpcmNsZSgpIHtcbiAgICBsZXQgY2lyY2xlID0gbmV3IFBhdGguQ2lyY2xlKHtcbiAgICAgIGNlbnRlcjogWzQwMCwgNDAwXSxcbiAgICAgIHJhZGl1czogMTAwLFxuICAgICAgc3Ryb2tlQ29sb3I6ICdncmVlbicsXG4gICAgICBmaWxsQ29sb3I6ICdncmVlbidcbiAgICB9KTtcbiAgICBsZXQgZ3JvdXAgPSBuZXcgR3JvdXAoY2lyY2xlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1haW4oKSB7XG4gICAgaW5pdENvbnRyb2xQYW5lbCgpO1xuICAgIC8vIGRyYXdDaXJjbGUoKTtcbiAgICBpbml0Vmlld1ZhcnMoKTtcbiAgfVxuXG4gIG1haW4oKTtcbn0pO1xuIiwiY29uc3QgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuY29uc3QgY29uZmlnID0gcmVxdWlyZSgnLi8uLi8uLi9jb25maWcnKTtcblxuZnVuY3Rpb24gbG9nKC4uLnRoaW5nKSB7XG4gIHV0aWwubG9nKC4uLnRoaW5nKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldElkZWFsR2VvbWV0cnkocGF0aERhdGEsIHNpZGVzLCBzaW1wbGlmaWVkUGF0aCkge1xuICBjb25zdCB0aHJlc2hvbGREaXN0ID0gMC4wNSAqIHNpbXBsaWZpZWRQYXRoLmxlbmd0aDtcblxuICBsZXQgcmV0dXJuUGF0aCA9IG5ldyBQYXRoKHtcbiAgICBzdHJva2VXaWR0aDogNSxcbiAgICBzdHJva2VDb2xvcjogJ3BpbmsnXG4gIH0pO1xuXG4gIGxldCB0cnVlZFBhdGggPSBuZXcgUGF0aCh7XG4gICAgc3Ryb2tlV2lkdGg6IDUsXG4gICAgc3Ryb2tlQ29sb3I6ICdncmVlbidcbiAgfSk7XG5cbiAgLy8gbmV3IFBhdGguQ2lyY2xlKHtcbiAgLy8gICBjZW50ZXI6IHNpbXBsaWZpZWRQYXRoLmZpcnN0U2VnbWVudC5wb2ludCxcbiAgLy8gICByYWRpdXM6IDMsXG4gIC8vICAgZmlsbENvbG9yOiAnYmxhY2snXG4gIC8vIH0pO1xuXG4gIGxldCBmaXJzdFBvaW50ID0gbmV3IFBhdGguQ2lyY2xlKHtcbiAgICBjZW50ZXI6IHNpbXBsaWZpZWRQYXRoLmZpcnN0U2VnbWVudC5wb2ludCxcbiAgICByYWRpdXM6IDEwLFxuICAgIHN0cm9rZUNvbG9yOiAnYmx1ZSdcbiAgfSk7XG5cbiAgbGV0IGxhc3RQb2ludCA9IG5ldyBQYXRoLkNpcmNsZSh7XG4gICAgY2VudGVyOiBzaW1wbGlmaWVkUGF0aC5sYXN0U2VnbWVudC5wb2ludCxcbiAgICByYWRpdXM6IDEwLFxuICAgIHN0cm9rZUNvbG9yOiAncmVkJ1xuICB9KTtcblxuXG4gIGxldCBhbmdsZSwgcHJldkFuZ2xlLCBhbmdsZURlbHRhO1xuICBCYXNlLmVhY2goc2lkZXMsIChzaWRlLCBpKSA9PiB7XG4gICAgbGV0IGZpcnN0UG9pbnQgPSBzaWRlWzBdO1xuICAgIGxldCBsYXN0UG9pbnQgPSBzaWRlW3NpZGUubGVuZ3RoIC0gMV07XG5cbiAgICBhbmdsZSA9IE1hdGguYXRhbjIobGFzdFBvaW50LnkgLSBmaXJzdFBvaW50LnksIGxhc3RQb2ludC54IC0gZmlyc3RQb2ludC54KTtcblxuICAgIGlmICghIXByZXZBbmdsZSkge1xuICAgICAgYW5nbGVEZWx0YSA9IHV0aWwuYW5nbGVEZWx0YShhbmdsZSwgcHJldkFuZ2xlKTtcbiAgICAgIGNvbnNvbGUubG9nKGFuZ2xlRGVsdGEpO1xuICAgICAgcmV0dXJuUGF0aC5hZGQoZmlyc3RQb2ludCk7XG4gICAgICByZXR1cm5QYXRoLmFkZChsYXN0UG9pbnQpO1xuICAgIH1cblxuICAgIHByZXZBbmdsZSA9IGFuZ2xlO1xuICB9KTtcblxuICBCYXNlLmVhY2goc2ltcGxpZmllZFBhdGguc2VnbWVudHMsIChzZWdtZW50LCBpKSA9PiB7XG4gICAgbGV0IGludGVnZXJQb2ludCA9IGdldEludGVnZXJQb2ludChzZWdtZW50LnBvaW50KTtcbiAgICBsZXQgbmVhcmVzdFBvaW50ID0gcmV0dXJuUGF0aC5nZXROZWFyZXN0UG9pbnQoaW50ZWdlclBvaW50KTtcbiAgICAvLyBjb25zb2xlLmxvZyhpbnRlZ2VyUG9pbnQuZ2V0RGlzdGFuY2UobmVhcmVzdFBvaW50KSwgdGhyZXNob2xkRGlzdCk7XG4gICAgaWYgKGludGVnZXJQb2ludC5nZXREaXN0YW5jZShuZWFyZXN0UG9pbnQpIDw9IHRocmVzaG9sZERpc3QpIHtcbiAgICAgIHRydWVkUGF0aC5hZGQobmVhcmVzdFBvaW50KTtcbiAgICAgIG5ldyBQYXRoLkNpcmNsZSh7XG4gICAgICAgIGNlbnRlcjogbmVhcmVzdFBvaW50LFxuICAgICAgICByYWRpdXM6IDMsXG4gICAgICAgIGZpbGxDb2xvcjogJ2JsYWNrJ1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKCdvZmYgcGF0aCcpO1xuICAgICAgdHJ1ZWRQYXRoLmFkZChpbnRlZ2VyUG9pbnQpO1xuICAgICAgbmV3IFBhdGguQ2lyY2xlKHtcbiAgICAgICAgY2VudGVyOiBpbnRlZ2VyUG9pbnQsXG4gICAgICAgIHJhZGl1czogMyxcbiAgICAgICAgZmlsbENvbG9yOiAnZ3JlZW4nXG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIHRydWVkUGF0aC5hZGQoc2ltcGxpZmllZFBhdGgubGFzdFNlZ21lbnQucG9pbnQpO1xuICAvLyBuZXcgUGF0aC5DaXJjbGUoe1xuICAvLyAgIGNlbnRlcjogc2ltcGxpZmllZFBhdGgubGFzdFNlZ21lbnQucG9pbnQsXG4gIC8vICAgcmFkaXVzOiAzLFxuICAvLyAgIGZpbGxDb2xvcjogJ2JsYWNrJ1xuICAvLyB9KTtcblxuICBpZiAoc2ltcGxpZmllZFBhdGguY2xvc2VkKSB7XG4gICAgdHJ1ZWRQYXRoLmNsb3NlZCA9IHRydWU7XG4gIH1cblxuICAvLyBCYXNlLmVhY2godHJ1ZWRQYXRoLCAocG9pbnQsIGkpID0+IHtcbiAgLy8gICB0cnVlZFBhdGgucmVtb3ZlU2VnbWVudChpKTtcbiAgLy8gfSk7XG5cbiAgcmV0dXJuIHRydWVkUGF0aDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIE9sZGdldElkZWFsR2VvbWV0cnkocGF0aERhdGEsIHBhdGgpIHtcbiAgY29uc3QgdGhyZXNob2xkQW5nbGUgPSBNYXRoLlBJIC8gMjtcbiAgY29uc3QgdGhyZXNob2xkRGlzdCA9IDAuMSAqIHBhdGgubGVuZ3RoO1xuICAvLyBsb2cocGF0aCk7XG5cbiAgbGV0IGNvdW50ID0gMDtcblxuICBsZXQgc2lkZXMgPSBbXTtcbiAgbGV0IHNpZGUgPSBbXTtcbiAgbGV0IHByZXY7XG4gIGxldCBwcmV2QW5nbGU7XG5cbiAgLy8gbG9nKCd0aHJlc2hvbGRBbmdsZScsIHRocmVzaG9sZEFuZ2xlKTtcblxuICBsZXQgcmV0dXJuUGF0aCA9IG5ldyBQYXRoKCk7XG5cbiAgQmFzZS5lYWNoKHBhdGguc2VnbWVudHMsIChzZWdtZW50LCBpKSA9PiB7XG4gICAgbGV0IGludGVnZXJQb2ludCA9IGdldEludGVnZXJQb2ludChzZWdtZW50LnBvaW50KTtcbiAgICBsZXQgcG9pbnRTdHIgPSBzdHJpbmdpZnlQb2ludChpbnRlZ2VyUG9pbnQpO1xuICAgIGxldCBwb2ludERhdGE7XG4gICAgaWYgKHBvaW50U3RyIGluIHBhdGhEYXRhKSB7XG4gICAgICBwb2ludERhdGEgPSBwYXRoRGF0YVtwb2ludFN0cl07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBuZWFyZXN0UG9pbnQgPSBnZXRDbG9zZXN0UG9pbnRGcm9tUGF0aERhdGEocGF0aERhdGEsIGludGVnZXJQb2ludCk7XG4gICAgICBwb2ludFN0ciA9IHN0cmluZ2lmeVBvaW50KG5lYXJlc3RQb2ludCk7XG5cbiAgICAgIGlmIChwb2ludFN0ciBpbiBwYXRoRGF0YSkge1xuICAgICAgICBwb2ludERhdGEgPSBwYXRoRGF0YVtwb2ludFN0cl07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsb2coJ2NvdWxkIG5vdCBmaW5kIGNsb3NlIHBvaW50Jyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvaW50RGF0YSkge1xuICAgICAgcmV0dXJuUGF0aC5hZGQoaW50ZWdlclBvaW50KTtcbiAgICAgIG5ldyBQYXRoLkNpcmNsZSh7XG4gICAgICAgIGNlbnRlcjogaW50ZWdlclBvaW50LFxuICAgICAgICByYWRpdXM6IDUsXG4gICAgICAgIHN0cm9rZUNvbG9yOiBuZXcgQ29sb3IoaSAvIHBhdGguc2VnbWVudHMubGVuZ3RoLCBpIC8gcGF0aC5zZWdtZW50cy5sZW5ndGgsIGkgLyBwYXRoLnNlZ21lbnRzLmxlbmd0aClcbiAgICAgIH0pO1xuICAgICAgbG9nKHBvaW50RGF0YS5wb2ludCk7XG4gICAgICBpZiAoIXByZXYpIHtcbiAgICAgICAgLy8gZmlyc3QgcG9pbnRcbiAgICAgICAgLy8gbG9nKCdwdXNoaW5nIGZpcnN0IHBvaW50IHRvIHNpZGUnKTtcbiAgICAgICAgc2lkZS5wdXNoKHBvaW50RGF0YSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBsZXQgYW5nbGVGb28gPSBpbnRlZ2VyUG9pbnQuZ2V0RGlyZWN0ZWRBbmdsZShwcmV2KTtcbiAgICAgICAgbGV0IGFuZ2xlID0gTWF0aC5hdGFuMihpbnRlZ2VyUG9pbnQueSwgaW50ZWdlclBvaW50LngpIC0gTWF0aC5hdGFuMihwcmV2LnksIHByZXYueCk7XG4gICAgICAgIGlmIChhbmdsZSA8IDApIGFuZ2xlICs9ICgyICogTWF0aC5QSSk7IC8vIG5vcm1hbGl6ZSB0byBbMCwgMs+AKVxuICAgICAgICAvLyBsb2coYW5nbGVGb28sIGFuZ2xlQmFyKTtcbiAgICAgICAgLy8gbGV0IGFuZ2xlID0gTWF0aC5hdGFuMihpbnRlZ2VyUG9pbnQueSAtIHByZXYueSwgaW50ZWdlclBvaW50LnggLSBwcmV2LngpO1xuICAgICAgICAvLyBsZXQgbGluZSA9IG5ldyBQYXRoLkxpbmUocHJldiwgaW50ZWdlclBvaW50KTtcbiAgICAgICAgLy8gbGluZS5zdHJva2VXaWR0aCA9IDU7XG4gICAgICAgIC8vIGxpbmUuc3Ryb2tlQ29sb3IgPSAncGluayc7XG4gICAgICAgIC8vIGxpbmUucm90YXRlKHV0aWwuZGVnKE1hdGguY29zKGFuZ2xlKSAqIE1hdGguUEkgKiAyKSk7XG4gICAgICAgIC8vIGxvZygnYW5nbGUnLCBhbmdsZSk7XG4gICAgICAgIGlmICh0eXBlb2YgcHJldkFuZ2xlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIC8vIHNlY29uZCBwb2ludFxuICAgICAgICAgIHNpZGUucHVzaChwb2ludERhdGEpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGV0IGFuZ2xlRGlmZmVyZW5jZSA9IE1hdGgucG93KGFuZ2xlIC0gcHJldkFuZ2xlLCAyKTtcbiAgICAgICAgICBsb2coJ2FuZ2xlRGlmZmVyZW5jZScsIGFuZ2xlRGlmZmVyZW5jZSk7XG4gICAgICAgICAgaWYgKGFuZ2xlRGlmZmVyZW5jZSA8PSB0aHJlc2hvbGRBbmdsZSkge1xuICAgICAgICAgICAgLy8gc2FtZSBzaWRlXG4gICAgICAgICAgICAvLyBsb2coJ3B1c2hpbmcgcG9pbnQgdG8gc2FtZSBzaWRlJyk7XG4gICAgICAgICAgICBzaWRlLnB1c2gocG9pbnREYXRhKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gbmV3IHNpZGVcbiAgICAgICAgICAgIC8vIGxvZygnbmV3IHNpZGUnKTtcbiAgICAgICAgICAgIHNpZGVzLnB1c2goc2lkZSk7XG4gICAgICAgICAgICBzaWRlID0gW3BvaW50RGF0YV07XG5cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwcmV2QW5nbGUgPSBhbmdsZTtcbiAgICAgIH1cblxuICAgICAgcHJldiA9IGludGVnZXJQb2ludDtcbiAgICAgIGNvdW50Kys7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZygnbm8gZGF0YScpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gbG9nKGNvdW50KTtcblxuICBzaWRlcy5wdXNoKHNpZGUpO1xuXG4gIHJldHVybiBzaWRlcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEludGVnZXJQb2ludChwb2ludCkge1xuICByZXR1cm4gbmV3IFBvaW50KE1hdGguZmxvb3IocG9pbnQueCksIE1hdGguZmxvb3IocG9pbnQueSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5naWZ5UG9pbnQocG9pbnQpIHtcbiAgcmV0dXJuIGAke01hdGguZmxvb3IocG9pbnQueCl9LCR7TWF0aC5mbG9vcihwb2ludC55KX1gO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VQb2ludChwb2ludFN0cikge1xuICBsZXQgc3BsaXQgPSBwb2ludFN0ci5zcGxpdCgnLCcpLm1hcCgobnVtKSA9PiBNYXRoLmZsb29yKG51bSkpO1xuXG4gIGlmIChzcGxpdC5sZW5ndGggPj0gMikge1xuICAgIHJldHVybiBuZXcgUG9pbnQoc3BsaXRbMF0sIHNwbGl0WzFdKTtcbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2xvc2VzdFBvaW50RnJvbVBhdGhEYXRhKHBhdGhEYXRhLCBwb2ludCkge1xuICBsZXQgbGVhc3REaXN0YW5jZSwgY2xvc2VzdFBvaW50O1xuXG4gIEJhc2UuZWFjaChwYXRoRGF0YSwgKGRhdHVtLCBpKSA9PiB7XG4gICAgbGV0IGRpc3RhbmNlID0gcG9pbnQuZ2V0RGlzdGFuY2UoZGF0dW0ucG9pbnQpO1xuICAgIGlmICghbGVhc3REaXN0YW5jZSB8fCBkaXN0YW5jZSA8IGxlYXN0RGlzdGFuY2UpIHtcbiAgICAgIGxlYXN0RGlzdGFuY2UgPSBkaXN0YW5jZTtcbiAgICAgIGNsb3Nlc3RQb2ludCA9IGRhdHVtLnBvaW50O1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIGNsb3Nlc3RQb2ludCB8fCBwb2ludDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbXB1dGVkQ29ybmVycyhwYXRoKSB7XG4gIGNvbnN0IHRocmVzaG9sZEFuZ2xlID0gdXRpbC5yYWQoY29uZmlnLnNoYXBlLmNvcm5lclRocmVzaG9sZERlZyk7XG4gIGNvbnN0IHRocmVzaG9sZERpc3RhbmNlID0gMC4xICogcGF0aC5sZW5ndGg7XG5cbiAgbGV0IGNvcm5lcnMgPSBbXTtcblxuICBpZiAocGF0aC5sZW5ndGggPiAwKSB7XG4gICAgbGV0IHBvaW50LCBwcmV2O1xuICAgIGxldCBhbmdsZSwgcHJldkFuZ2xlLCBhbmdsZURlbHRhO1xuXG4gICAgQmFzZS5lYWNoKHBhdGguc2VnbWVudHMsIChzZWdtZW50LCBpKSA9PiB7XG4gICAgICBsZXQgcG9pbnQgPSBnZXRJbnRlZ2VyUG9pbnQoc2VnbWVudC5wb2ludCk7XG4gICAgICBpZiAoISFwcmV2KSB7XG4gICAgICAgIGxldCBhbmdsZSA9IE1hdGguYXRhbjIocG9pbnQueSAtIHByZXYueSwgcG9pbnQueCAtIHByZXYueCk7XG4gICAgICAgIGlmIChhbmdsZSA8IDApIGFuZ2xlICs9ICgyICogTWF0aC5QSSk7IC8vIG5vcm1hbGl6ZSB0byBbMCwgMs+AKVxuICAgICAgICBpZiAoISFwcmV2QW5nbGUpIHtcbiAgICAgICAgICBhbmdsZURlbHRhID0gdXRpbC5hbmdsZURlbHRhKGFuZ2xlLCBwcmV2QW5nbGUpO1xuICAgICAgICAgIGlmIChhbmdsZURlbHRhID49IHRocmVzaG9sZEFuZ2xlKSB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnY29ybmVyJyk7XG4gICAgICAgICAgICAvLyBuZXcgUGF0aC5DaXJjbGUoe1xuICAgICAgICAgICAgLy8gICBjZW50ZXI6IHByZXYsXG4gICAgICAgICAgICAvLyAgIHJhZGl1czogMTAsXG4gICAgICAgICAgICAvLyAgIGZpbGxDb2xvcjogJ3BpbmsnXG4gICAgICAgICAgICAvLyB9KTtcbiAgICAgICAgICAgIGNvcm5lcnMucHVzaChwcmV2KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYW5nbGVEZWx0YSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJldkFuZ2xlID0gYW5nbGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBmaXJzdCBwb2ludFxuICAgICAgICBjb3JuZXJzLnB1c2gocG9pbnQpO1xuICAgICAgICAvLyBuZXcgUGF0aC5DaXJjbGUoe1xuICAgICAgICAvLyAgIGNlbnRlcjogcG9pbnQsXG4gICAgICAgIC8vICAgcmFkaXVzOiAxMCxcbiAgICAgICAgLy8gICBmaWxsQ29sb3I6ICdwaW5rJ1xuICAgICAgICAvLyB9KVxuICAgICAgfVxuICAgICAgcHJldiA9IHBvaW50O1xuICAgIH0pO1xuXG4gICAgbGV0IGxhc3RTZWdtZW50UG9pbnQgPSBnZXRJbnRlZ2VyUG9pbnQocGF0aC5sYXN0U2VnbWVudC5wb2ludCk7XG4gICAgY29ybmVycy5wdXNoKGxhc3RTZWdtZW50UG9pbnQpO1xuXG4gICAgbGV0IHJldHVybkNvcm5lcnMgPSBbXTtcbiAgICBsZXQgc2tpcHBlZElkcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29ybmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IHBvaW50ID0gY29ybmVyc1tpXTtcblxuICAgICAgaWYgKGkgIT09IDApIHtcbiAgICAgICAgbGV0IGRpc3QgPSBwb2ludC5nZXREaXN0YW5jZShwcmV2KTtcbiAgICAgICAgbGV0IGNsb3Nlc3RQb2ludHMgPSBbXTtcbiAgICAgICAgd2hpbGUgKGRpc3QgPCB0aHJlc2hvbGREaXN0YW5jZSkge1xuICAgICAgICAgIGNsb3Nlc3RQb2ludHMucHVzaCh7XG4gICAgICAgICAgICBwb2ludDogcG9pbnQsXG4gICAgICAgICAgICBpbmRleDogaVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgaWYgKGkgPCBjb3JuZXJzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIHByZXYgPSBwb2ludDtcbiAgICAgICAgICAgIHBvaW50ID0gY29ybmVyc1tpXTtcbiAgICAgICAgICAgIGRpc3QgPSBwb2ludC5nZXREaXN0YW5jZShwcmV2KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChjbG9zZXN0UG9pbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBsZXQgW3N1bVgsIHN1bVldID0gWzAsIDBdO1xuXG4gICAgICAgICAgQmFzZS5lYWNoKGNsb3Nlc3RQb2ludHMsIChwb2ludE9iaikgPT4ge1xuICAgICAgICAgICAgc3VtWCArPSBwb2ludE9iai5wb2ludC54O1xuICAgICAgICAgICAgc3VtWSArPSBwb2ludE9iai5wb2ludC55O1xuICAgICAgICAgIH0pO1xuXG5cbiAgICAgICAgICBsZXQgW2F2Z1gsIGF2Z1ldID0gW3N1bVggLyBjbG9zZXN0UG9pbnRzLmxlbmd0aCwgc3VtWSAvIGNsb3Nlc3RQb2ludHMubGVuZ3RoXTtcbiAgICAgICAgICByZXR1cm5Db3JuZXJzLnB1c2gobmV3IFBvaW50KGF2Z1gsIGF2Z1kpKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuQ29ybmVycy5wdXNoKHBvaW50KTtcbiAgICAgIH1cblxuICAgICAgcHJldiA9IHBvaW50O1xuICAgIH1cblxuICAgIC8vIEJhc2UuZWFjaChjb3JuZXJzLCAoY29ybmVyLCBpKSA9PiB7XG4gICAgLy8gICBsZXQgcG9pbnQgPSBjb3JuZXI7XG4gICAgLy9cbiAgICAvLyAgIGlmIChpICE9PSAwKSB7XG4gICAgLy8gICAgIGxldCBkaXN0ID0gcG9pbnQuZ2V0RGlzdGFuY2UocHJldik7XG4gICAgLy8gICAgIGxldCBjbG9zZXN0UG9pbnRzID0gW107XG4gICAgLy8gICAgIGxldCBpbmRleCA9IGk7XG4gICAgLy8gICAgIHdoaWxlIChkaXN0IDwgdGhyZXNob2xkRGlzdGFuY2UpIHtcbiAgICAvLyAgICAgICBjbG9zZXN0UG9pbnRzLnB1c2goe1xuICAgIC8vICAgICAgICAgcG9pbnQ6IHBvaW50LFxuICAgIC8vICAgICAgICAgaW5kZXg6IGluZGV4XG4gICAgLy8gICAgICAgfSk7XG4gICAgLy8gICAgIH1cbiAgICAvLyAgICAgY29uc29sZS5sb2coZGlzdCwgdGhyZXNob2xkRGlzdGFuY2UpO1xuICAgIC8vICAgICB3aGlsZSAoZGlzdCA8IHRocmVzaG9sZERpc3RhbmNlKSB7XG4gICAgLy9cbiAgICAvLyAgICAgfVxuICAgIC8vICAgfSBlbHNlIHtcbiAgICAvLyAgICAgcmV0dXJuQ29ybmVycy5wdXNoKGNvcm5lcik7XG4gICAgLy8gICB9XG4gICAgLy9cbiAgICAvLyAgIHByZXYgPSBwb2ludDtcbiAgICAvLyB9KTtcbiAgICAvLyBuZXcgUGF0aC5DaXJjbGUoe1xuICAgIC8vICAgY2VudGVyOiBsYXN0U2VnbWVudFBvaW50LFxuICAgIC8vICAgcmFkaXVzOiAxMCxcbiAgICAvLyAgIGZpbGxDb2xvcjogJ3BpbmsnXG4gICAgLy8gfSk7XG4gIH1cblxuICByZXR1cm4gY29ybmVycztcbn1cbiIsImNvbnN0IGNvbmZpZyA9IHJlcXVpcmUoJy4vLi4vLi4vY29uZmlnJyk7XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2coLi4udGhpbmcpIHtcbiAgaWYgKGNvbmZpZy5sb2cpIHtcbiAgICBjb25zb2xlLmxvZyguLi50aGluZyk7XG4gIH1cbn1cblxuLy8gQ29udmVydHMgZnJvbSBkZWdyZWVzIHRvIHJhZGlhbnMuXG5leHBvcnQgZnVuY3Rpb24gcmFkKGRlZ3JlZXMpIHtcbiAgcmV0dXJuIGRlZ3JlZXMgKiBNYXRoLlBJIC8gMTgwO1xufTtcblxuLy8gQ29udmVydHMgZnJvbSByYWRpYW5zIHRvIGRlZ3JlZXMuXG5leHBvcnQgZnVuY3Rpb24gZGVnKHJhZGlhbnMpIHtcbiAgcmV0dXJuIHJhZGlhbnMgKiAxODAgLyBNYXRoLlBJO1xufTtcblxuLy8gcmV0dXJucyBhYnNvbHV0ZSB2YWx1ZSBvZiB0aGUgZGVsdGEgb2YgdHdvIGFuZ2xlcyBpbiByYWRpYW5zXG5leHBvcnQgZnVuY3Rpb24gYW5nbGVEZWx0YSh4LCB5KSB7XG4gIHJldHVybiBNYXRoLmFicyhNYXRoLmF0YW4yKE1hdGguc2luKHkgLSB4KSwgTWF0aC5jb3MoeSAtIHgpKSk7O1xufVxuXG4vLyBkaXN0YW5jZSBiZXR3ZWVuIHR3byBwb2ludHNcbmV4cG9ydCBmdW5jdGlvbiBkZWx0YShwMSwgcDIpIHtcbiAgcmV0dXJuIE1hdGguc3FydChNYXRoLnBvdyhwMS54IC0gcDIueCwgMikgKyBNYXRoLnBvdyhwMS55IC0gcDIueSwgMikpOyAvLyBweXRoYWdvcmVhbiFcbn1cblxuLy8gcmV0dXJucyBhbiBhcnJheSBvZiB0aGUgaW50ZXJpb3IgY3VydmVzIG9mIGEgZ2l2ZW4gY29tcG91bmQgcGF0aFxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRJbnRlcmlvckN1cnZlcyhwYXRoKSB7XG4gIGxldCBpbnRlcmlvckN1cnZlcyA9IFtdO1xuICBpZiAoIXBhdGggfHwgIXBhdGguY2hpbGRyZW4gfHwgIXBhdGguY2hpbGRyZW4ubGVuZ3RoKSByZXR1cm47XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXRoLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IGNoaWxkID0gcGF0aC5jaGlsZHJlbltpXTtcblxuICAgIGlmIChjaGlsZC5jbG9zZWQpe1xuICAgICAgaW50ZXJpb3JDdXJ2ZXMucHVzaChuZXcgUGF0aChjaGlsZC5zZWdtZW50cykpO1xuICAgIH1cbiAgfVxuXG4gIHBhdGgucmVtb3ZlKCk7XG4gIHJldHVybiBpbnRlcmlvckN1cnZlcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRydWVHcm91cChncm91cCwgY29ybmVycykge1xuICBsZXQgbWlkZGxlID0gZ3JvdXAuX25hbWVkQ2hpbGRyZW4ubWlkZGxlWzBdO1xuXG4gIGxldCBpbnRlcnNlY3Rpb25zID0gbWlkZGxlLmdldEludGVyc2VjdGlvbnMoKTtcbiAgbGV0IHRydWVOZWNlc3NhcnkgPSBmYWxzZTtcblxuICBsZXQgbWlkZGxlQ29weSA9IG1pZGRsZS5jbG9uZSgpO1xuICBtaWRkbGVDb3B5LnZpc2libGUgPSBmYWxzZTtcbiAgLy8gZGVidWdnZXI7XG5cbiAgaWYgKGludGVyc2VjdGlvbnMubGVuZ3RoID4gMCkge1xuICAgIC8vIHNlZSBpZiB3ZSBjYW4gdHJpbSB0aGUgcGF0aCB3aGlsZSBtYWludGFpbmluZyBpbnRlcnNlY3Rpb25zXG4gICAgLy8gbG9nKCdpbnRlcnNlY3Rpb25zIScpO1xuICAgIC8vIG1pZGRsZUNvcHkuc3Ryb2tlQ29sb3IgPSAneWVsbG93JztcbiAgICBbbWlkZGxlQ29weSwgdHJ1ZU5lY2Vzc2FyeV0gPSB0cmltUGF0aChtaWRkbGVDb3B5LCBtaWRkbGUpO1xuICAgIC8vIG1pZGRsZUNvcHkuc3Ryb2tlQ29sb3IgPSAnb3JhbmdlJztcbiAgfSBlbHNlIHtcbiAgICAvLyBleHRlbmQgZmlyc3QgYW5kIGxhc3Qgc2VnbWVudCBieSB0aHJlc2hvbGQsIHNlZSBpZiBpbnRlcnNlY3Rpb25cbiAgICAvLyBsb2coJ25vIGludGVyc2VjdGlvbnMsIGV4dGVuZGluZyBmaXJzdCEnKTtcbiAgICAvLyBtaWRkbGVDb3B5LnN0cm9rZUNvbG9yID0gJ3llbGxvdyc7XG4gICAgbWlkZGxlQ29weSA9IGV4dGVuZFBhdGgobWlkZGxlQ29weSk7XG4gICAgLy8gbWlkZGxlQ29weS5zdHJva2VDb2xvciA9ICdvcmFuZ2UnO1xuICAgIGxldCBpbnRlcnNlY3Rpb25zID0gbWlkZGxlQ29weS5nZXRJbnRlcnNlY3Rpb25zKCk7XG4gICAgaWYgKGludGVyc2VjdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgLy8gbWlkZGxlQ29weS5zdHJva2VDb2xvciA9ICdwaW5rJztcbiAgICAgIFttaWRkbGVDb3B5LCB0cnVlTmVjZXNzYXJ5XSA9IHRyaW1QYXRoKG1pZGRsZUNvcHksIG1pZGRsZSk7XG4gICAgICAvLyBtaWRkbGVDb3B5LnN0cm9rZUNvbG9yID0gJ2dyZWVuJztcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gbWlkZGxlQ29weS5zdHJva2VDb2xvciA9ICdyZWQnO1xuICAgICAgbWlkZGxlQ29weSA9IHJlbW92ZVBhdGhFeHRlbnNpb25zKG1pZGRsZUNvcHkpO1xuICAgICAgLy8gbWlkZGxlQ29weS5zdHJva2VDb2xvciA9ICdibHVlJztcbiAgICB9XG4gIH1cblxuICBtaWRkbGVDb3B5Lm5hbWUgPSAnbWlkZGxlJzsgLy8gbWFrZSBzdXJlXG4gIG1pZGRsZUNvcHkudmlzaWJsZSA9IHRydWU7XG5cbiAgLy8gZ3JvdXAuYWRkQ2hpbGQobWlkZGxlQ29weSk7XG4gIC8vIGdyb3VwLl9uYW1lZENoaWxkcmVuLm1pZGRsZVswXSA9IG1pZGRsZUNvcHk7XG4gIGdyb3VwLl9uYW1lZENoaWxkcmVuLm1pZGRsZVswXS5yZXBsYWNlV2l0aChtaWRkbGVDb3B5KTtcblxuXG4gIHJldHVybiBbZ3JvdXAsIHRydWVOZWNlc3NhcnldO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXh0ZW5kUGF0aChwYXRoKSB7XG4gIGlmIChwYXRoLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBsZW5ndGhUb2xlcmFuY2UgPSBjb25maWcuc2hhcGUudHJpbW1pbmdUaHJlc2hvbGQgKiBwYXRoLmxlbmd0aDtcblxuICAgIGxldCBmaXJzdFNlZ21lbnQgPSBwYXRoLmZpcnN0U2VnbWVudDtcbiAgICBsZXQgbmV4dFNlZ21lbnQgPSBmaXJzdFNlZ21lbnQubmV4dDtcbiAgICBsZXQgc3RhcnRBbmdsZSA9IE1hdGguYXRhbjIobmV4dFNlZ21lbnQucG9pbnQueSAtIGZpcnN0U2VnbWVudC5wb2ludC55LCBuZXh0U2VnbWVudC5wb2ludC54IC0gZmlyc3RTZWdtZW50LnBvaW50LngpOyAvLyByYWRcbiAgICBsZXQgaW52ZXJzZVN0YXJ0QW5nbGUgPSBzdGFydEFuZ2xlICsgTWF0aC5QSTtcbiAgICBsZXQgZXh0ZW5kZWRTdGFydFBvaW50ID0gbmV3IFBvaW50KGZpcnN0U2VnbWVudC5wb2ludC54ICsgKE1hdGguY29zKGludmVyc2VTdGFydEFuZ2xlKSAqIGxlbmd0aFRvbGVyYW5jZSksIGZpcnN0U2VnbWVudC5wb2ludC55ICsgKE1hdGguc2luKGludmVyc2VTdGFydEFuZ2xlKSAqIGxlbmd0aFRvbGVyYW5jZSkpO1xuICAgIHBhdGguaW5zZXJ0KDAsIGV4dGVuZGVkU3RhcnRQb2ludCk7XG5cbiAgICBsZXQgbGFzdFNlZ21lbnQgPSBwYXRoLmxhc3RTZWdtZW50O1xuICAgIGxldCBwZW5TZWdtZW50ID0gbGFzdFNlZ21lbnQucHJldmlvdXM7IC8vIHBlbnVsdGltYXRlXG4gICAgbGV0IGVuZEFuZ2xlID0gTWF0aC5hdGFuMihsYXN0U2VnbWVudC5wb2ludC55IC0gcGVuU2VnbWVudC5wb2ludC55LCBsYXN0U2VnbWVudC5wb2ludC54IC0gcGVuU2VnbWVudC5wb2ludC54KTsgLy8gcmFkXG4gICAgbGV0IGV4dGVuZGVkRW5kUG9pbnQgPSBuZXcgUG9pbnQobGFzdFNlZ21lbnQucG9pbnQueCArIChNYXRoLmNvcyhlbmRBbmdsZSkgKiBsZW5ndGhUb2xlcmFuY2UpLCBsYXN0U2VnbWVudC5wb2ludC55ICsgKE1hdGguc2luKGVuZEFuZ2xlKSAqIGxlbmd0aFRvbGVyYW5jZSkpO1xuICAgIHBhdGguYWRkKGV4dGVuZGVkRW5kUG9pbnQpO1xuICB9XG4gIHJldHVybiBwYXRoO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJpbVBhdGgocGF0aCwgb3JpZ2luYWwpIHtcbiAgLy8gb3JpZ2luYWxQYXRoLnN0cm9rZUNvbG9yID0gJ3BpbmsnO1xuICB0cnkge1xuICAgIGxldCBpbnRlcnNlY3Rpb25zID0gcGF0aC5nZXRJbnRlcnNlY3Rpb25zKCk7XG4gICAgbGV0IGRpdmlkZWRQYXRoID0gcGF0aC5yZXNvbHZlQ3Jvc3NpbmdzKCk7XG5cbiAgICBpZiAoaW50ZXJzZWN0aW9ucy5sZW5ndGggPiAxKSB7XG4gICAgICByZXR1cm4gW29yaWdpbmFsLCBmYWxzZV07IC8vIG1vcmUgdGhhbiBvbmUgaW50ZXJzZWN0aW9uLCBkb24ndCB3b3JyeSBhYm91dCB0cmltbWluZ1xuICAgIH1cblxuICAgIGNvbnN0IGV4dGVuZGluZ1RocmVzaG9sZCA9IGNvbmZpZy5zaGFwZS5leHRlbmRpbmdUaHJlc2hvbGQ7XG4gICAgY29uc3QgdG90YWxMZW5ndGggPSBwYXRoLmxlbmd0aDtcblxuICAgIC8vIHdlIHdhbnQgdG8gcmVtb3ZlIGFsbCBjbG9zZWQgbG9vcHMgZnJvbSB0aGUgcGF0aCwgc2luY2UgdGhlc2UgYXJlIG5lY2Vzc2FyaWx5IGludGVyaW9yIGFuZCBub3QgZmlyc3Qgb3IgbGFzdFxuICAgIEJhc2UuZWFjaChkaXZpZGVkUGF0aC5jaGlsZHJlbiwgKGNoaWxkLCBpKSA9PiB7XG4gICAgICBpZiAoY2hpbGQuY2xvc2VkKSB7XG4gICAgICAgIC8vIGxvZygnc3VidHJhY3RpbmcgY2xvc2VkIGNoaWxkJyk7XG4gICAgICAgIGRpdmlkZWRQYXRoID0gZGl2aWRlZFBhdGguc3VidHJhY3QoY2hpbGQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZGl2aWRlZFBhdGggPSBkaXZpZGVkUGF0aC51bml0ZShjaGlsZCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBsb2coZGl2aWRlZFBhdGgpO1xuXG4gICAgaWYgKCEhZGl2aWRlZFBhdGguY2hpbGRyZW4gJiYgZGl2aWRlZFBhdGguY2hpbGRyZW4ubGVuZ3RoID4gMSkge1xuICAgICAgLy8gZGl2aWRlZCBwYXRoIGlzIGEgY29tcG91bmQgcGF0aFxuICAgICAgbGV0IHVuaXRlZERpdmlkZWRQYXRoID0gbmV3IFBhdGgoKTtcbiAgICAgIC8vIHVuaXRlZERpdmlkZWRQYXRoLmNvcHlBdHRyaWJ1dGVzKGRpdmlkZWRQYXRoKTtcbiAgICAgIC8vIGxvZygnYmVmb3JlJywgdW5pdGVkRGl2aWRlZFBhdGgpO1xuICAgICAgQmFzZS5lYWNoKGRpdmlkZWRQYXRoLmNoaWxkcmVuLCAoY2hpbGQsIGkpID0+IHtcbiAgICAgICAgaWYgKCFjaGlsZC5jbG9zZWQpIHtcbiAgICAgICAgICB1bml0ZWREaXZpZGVkUGF0aCA9IHVuaXRlZERpdmlkZWRQYXRoLnVuaXRlKGNoaWxkKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBkaXZpZGVkUGF0aCA9IHVuaXRlZERpdmlkZWRQYXRoO1xuICAgICAgLy8gbG9nKCdhZnRlcicsIHVuaXRlZERpdmlkZWRQYXRoKTtcbiAgICAgIC8vIHJldHVybjtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gbG9nKCdkaXZpZGVkUGF0aCBoYXMgb25lIGNoaWxkJyk7XG4gICAgfVxuXG4gICAgaWYgKGludGVyc2VjdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgLy8gd2UgaGF2ZSB0byBnZXQgdGhlIG5lYXJlc3QgbG9jYXRpb24gYmVjYXVzZSB0aGUgZXhhY3QgaW50ZXJzZWN0aW9uIHBvaW50IGhhcyBhbHJlYWR5IGJlZW4gcmVtb3ZlZCBhcyBhIHBhcnQgb2YgcmVzb2x2ZUNyb3NzaW5ncygpXG4gICAgICBsZXQgZmlyc3RJbnRlcnNlY3Rpb24gPSBkaXZpZGVkUGF0aC5nZXROZWFyZXN0TG9jYXRpb24oaW50ZXJzZWN0aW9uc1swXS5wb2ludCk7XG4gICAgICAvLyBsb2coZGl2aWRlZFBhdGgpO1xuICAgICAgbGV0IHJlc3QgPSBkaXZpZGVkUGF0aC5zcGxpdEF0KGZpcnN0SW50ZXJzZWN0aW9uKTsgLy8gZGl2aWRlZFBhdGggaXMgbm93IHRoZSBmaXJzdCBzZWdtZW50XG4gICAgICBsZXQgZmlyc3RTZWdtZW50ID0gZGl2aWRlZFBhdGg7XG4gICAgICBsZXQgbGFzdFNlZ21lbnQ7XG5cbiAgICAgIC8vIGZpcnN0U2VnbWVudC5zdHJva2VDb2xvciA9ICdwaW5rJztcblxuICAgICAgLy8gbGV0IGNpcmNsZU9uZSA9IG5ldyBQYXRoLkNpcmNsZSh7XG4gICAgICAvLyAgIGNlbnRlcjogZmlyc3RJbnRlcnNlY3Rpb24ucG9pbnQsXG4gICAgICAvLyAgIHJhZGl1czogNSxcbiAgICAgIC8vICAgc3Ryb2tlQ29sb3I6ICdyZWQnXG4gICAgICAvLyB9KTtcblxuICAgICAgLy8gbG9nKGludGVyc2VjdGlvbnMpO1xuICAgICAgaWYgKGludGVyc2VjdGlvbnMubGVuZ3RoID4gMSkge1xuICAgICAgICAvLyBsb2coJ2ZvbycpO1xuICAgICAgICAvLyByZXN0LnJldmVyc2UoKTsgLy8gc3RhcnQgZnJvbSBlbmRcbiAgICAgICAgbGV0IGxhc3RJbnRlcnNlY3Rpb24gPSByZXN0LmdldE5lYXJlc3RMb2NhdGlvbihpbnRlcnNlY3Rpb25zW2ludGVyc2VjdGlvbnMubGVuZ3RoIC0gMV0ucG9pbnQpO1xuICAgICAgICAvLyBsZXQgY2lyY2xlVHdvID0gbmV3IFBhdGguQ2lyY2xlKHtcbiAgICAgICAgLy8gICBjZW50ZXI6IGxhc3RJbnRlcnNlY3Rpb24ucG9pbnQsXG4gICAgICAgIC8vICAgcmFkaXVzOiA1LFxuICAgICAgICAvLyAgIHN0cm9rZUNvbG9yOiAnZ3JlZW4nXG4gICAgICAgIC8vIH0pO1xuICAgICAgICBsYXN0U2VnbWVudCA9IHJlc3Quc3BsaXRBdChsYXN0SW50ZXJzZWN0aW9uKTsgLy8gcmVzdCBpcyBub3cgZXZlcnl0aGluZyBCVVQgdGhlIGZpcnN0IGFuZCBsYXN0IHNlZ21lbnRzXG4gICAgICAgIGlmICghbGFzdFNlZ21lbnQgfHwgIWxhc3RTZWdtZW50Lmxlbmd0aCkgbGFzdFNlZ21lbnQgPSByZXN0O1xuICAgICAgICByZXN0LnJldmVyc2UoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxhc3RTZWdtZW50ID0gcmVzdDtcbiAgICAgIH1cblxuICAgICAgaWYgKCEhZmlyc3RTZWdtZW50ICYmIGZpcnN0U2VnbWVudC5sZW5ndGggPD0gZXh0ZW5kaW5nVGhyZXNob2xkICogdG90YWxMZW5ndGgpIHtcbiAgICAgICAgcGF0aCA9IHBhdGguc3VidHJhY3QoZmlyc3RTZWdtZW50KTtcbiAgICAgICAgaWYgKHBhdGguY2xhc3NOYW1lID09PSAnQ29tcG91bmRQYXRoJykge1xuICAgICAgICAgIEJhc2UuZWFjaChwYXRoLmNoaWxkcmVuLCAoY2hpbGQsIGkpID0+IHtcbiAgICAgICAgICAgIGlmICghY2hpbGQuY2xvc2VkKSB7XG4gICAgICAgICAgICAgIGNoaWxkLnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICghIWxhc3RTZWdtZW50ICYmIGxhc3RTZWdtZW50Lmxlbmd0aCA8PSBleHRlbmRpbmdUaHJlc2hvbGQgKiB0b3RhbExlbmd0aCkge1xuICAgICAgICBwYXRoID0gcGF0aC5zdWJ0cmFjdChsYXN0U2VnbWVudCk7XG4gICAgICAgIGlmIChwYXRoLmNsYXNzTmFtZSA9PT0gJ0NvbXBvdW5kUGF0aCcpIHtcbiAgICAgICAgICBCYXNlLmVhY2gocGF0aC5jaGlsZHJlbiwgKGNoaWxkLCBpKSA9PiB7XG4gICAgICAgICAgICBpZiAoIWNoaWxkLmNsb3NlZCkge1xuICAgICAgICAgICAgICBjaGlsZC5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHRoaXMgaXMgaGFja3kgYnV0IEknbSBub3Qgc3VyZSBob3cgdG8gZ2V0IGFyb3VuZCBpdFxuICAgIC8vIHNvbWV0aW1lcyBwYXRoLnN1YnRyYWN0KCkgcmV0dXJucyBhIGNvbXBvdW5kIHBhdGgsIHdpdGggY2hpbGRyZW4gY29uc2lzdGluZyBvZiB0aGUgY2xvc2VkIHBhdGggSSB3YW50IGFuZCBhbm90aGVyIGV4dHJhbmVvdXMgY2xvc2VkIHBhdGhcbiAgICAvLyBpdCBhcHBlYXJzIHRoYXQgdGhlIGNvcnJlY3QgcGF0aCBhbHdheXMgaGFzIGEgaGlnaGVyIHZlcnNpb24sIHRob3VnaCBJJ20gbm90IDEwMCUgc3VyZSB0aGF0IHRoaXMgaXMgYWx3YXlzIHRoZSBjYXNlXG5cbiAgICBpZiAocGF0aC5jbGFzc05hbWUgPT09ICdDb21wb3VuZFBhdGgnICYmIHBhdGguY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgaWYgKHBhdGguY2hpbGRyZW4ubGVuZ3RoID4gMSkge1xuICAgICAgICBsZXQgbGFyZ2VzdENoaWxkO1xuICAgICAgICBsZXQgbGFyZ2VzdENoaWxkQXJlYSA9IDA7XG5cbiAgICAgICAgQmFzZS5lYWNoKHBhdGguY2hpbGRyZW4sIChjaGlsZCwgaSkgPT4ge1xuICAgICAgICAgIGlmIChjaGlsZC5hcmVhID4gbGFyZ2VzdENoaWxkQXJlYSkge1xuICAgICAgICAgICAgbGFyZ2VzdENoaWxkQXJlYSA9IGNoaWxkLmFyZWE7XG4gICAgICAgICAgICBsYXJnZXN0Q2hpbGQgPSBjaGlsZDtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChsYXJnZXN0Q2hpbGQpIHtcbiAgICAgICAgICBwYXRoID0gbGFyZ2VzdENoaWxkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBhdGggPSBwYXRoLmNoaWxkcmVuWzBdO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYXRoID0gcGF0aC5jaGlsZHJlblswXTtcbiAgICAgIH1cbiAgICAgIC8vIGxvZyhwYXRoKTtcbiAgICAgIC8vIGxvZyhwYXRoLmxhc3RDaGlsZCk7XG4gICAgICAvLyBwYXRoLmZpcnN0Q2hpbGQuc3Ryb2tlQ29sb3IgPSAncGluayc7XG4gICAgICAvLyBwYXRoLmxhc3RDaGlsZC5zdHJva2VDb2xvciA9ICdncmVlbic7XG4gICAgICAvLyBwYXRoID0gcGF0aC5sYXN0Q2hpbGQ7IC8vIHJldHVybiBsYXN0IGNoaWxkP1xuICAgICAgLy8gZmluZCBoaWdoZXN0IHZlcnNpb25cbiAgICAgIC8vXG4gICAgICAvLyBsb2cocmVhbFBhdGhWZXJzaW9uKTtcbiAgICAgIC8vXG4gICAgICAvLyBCYXNlLmVhY2gocGF0aC5jaGlsZHJlbiwgKGNoaWxkLCBpKSA9PiB7XG4gICAgICAvLyAgIGlmIChjaGlsZC52ZXJzaW9uID09IHJlYWxQYXRoVmVyc2lvbikge1xuICAgICAgLy8gICAgIGxvZygncmV0dXJuaW5nIGNoaWxkJyk7XG4gICAgICAvLyAgICAgcmV0dXJuIGNoaWxkO1xuICAgICAgLy8gICB9XG4gICAgICAvLyB9KVxuICAgIH1cbiAgICBsb2coJ29yaWdpbmFsIGxlbmd0aDonLCB0b3RhbExlbmd0aCk7XG4gICAgbG9nKCdlZGl0ZWQgbGVuZ3RoOicsIHBhdGgubGVuZ3RoKTtcbiAgICBpZiAocGF0aC5sZW5ndGggLyB0b3RhbExlbmd0aCA8PSAwLjc1KSB7XG4gICAgICBsb2coJ3JldHVybmluZyBvcmlnaW5hbCcpO1xuICAgICAgcmV0dXJuIFtvcmlnaW5hbCwgZmFsc2VdO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gW3BhdGgsIHRydWVdO1xuICAgIH1cbiAgfSBjYXRjaChlKSB7XG4gICAgY29uc29sZS5lcnJvcihlKTtcbiAgICByZXR1cm4gW29yaWdpbmFsLCBmYWxzZV07XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZVBhdGhFeHRlbnNpb25zKHBhdGgpIHtcbiAgcGF0aC5yZW1vdmVTZWdtZW50KDApO1xuICBwYXRoLnJlbW92ZVNlZ21lbnQocGF0aC5zZWdtZW50cy5sZW5ndGggLSAxKTtcbiAgcmV0dXJuIHBhdGg7XG59XG5cbi8vIGV4cG9ydCBmdW5jdGlvbiB0cnVlUGF0aChwYXRoKSB7XG4vLyAgIC8vIGxvZyhncm91cCk7XG4vLyAgIC8vIGlmIChwYXRoICYmIHBhdGguY2hpbGRyZW4gJiYgcGF0aC5jaGlsZHJlbi5sZW5ndGggPiAwICYmIHBhdGguX25hbWVkQ2hpbGRyZW5bJ21pZGRsZSddKSB7XG4vLyAgIC8vICAgbGV0IHBhdGhDb3B5ID0gbmV3IFBhdGgoKTtcbi8vICAgLy8gICBsb2cocGF0aC5fbmFtZWRDaGlsZHJlblsnbWlkZGxlJ10pO1xuLy8gICAvLyAgIHBhdGhDb3B5LmNvcHlDb250ZW50KHBhdGguX25hbWVkQ2hpbGRyZW5bJ21pZGRsZSddKTtcbi8vICAgLy8gICBsb2cocGF0aENvcHkpO1xuLy8gICAvLyB9XG4vLyB9XG5cbmV4cG9ydCBmdW5jdGlvbiBjaGVja1BvcHMoKSB7XG4gIGxldCBncm91cHMgPSBwYXBlci5wcm9qZWN0LmdldEl0ZW1zKHtcbiAgICBjbGFzc05hbWU6ICdHcm91cCcsXG4gICAgbWF0Y2g6IGZ1bmN0aW9uKGVsKSB7XG4gICAgICByZXR1cm4gKCEhZWwuZGF0YSAmJiBlbC5kYXRhLnVwZGF0ZSk7XG4gICAgfVxuICB9KTtcbn1cblxuLy8gaHR0cHM6Ly9ncm91cHMuZ29vZ2xlLmNvbS9mb3J1bS8jIXRvcGljL3BhcGVyanMvVUQ4TDBNVHlSZVFcbmV4cG9ydCBmdW5jdGlvbiBvdmVybGFwcyhwYXRoLCBvdGhlcikge1xuICByZXR1cm4gIShwYXRoLmdldEludGVyc2VjdGlvbnMob3RoZXIpLmxlbmd0aCA9PT0gMCk7XG59XG5cbi8vIGh0dHBzOi8vZ3JvdXBzLmdvb2dsZS5jb20vZm9ydW0vIyF0b3BpYy9wYXBlcmpzL1VEOEwwTVR5UmVRXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VPbmVQYXRoKHBhdGgsIG90aGVycykge1xuICBsZXQgaSwgbWVyZ2VkLCBvdGhlciwgdW5pb24sIF9pLCBfbGVuLCBfcmVmO1xuICBmb3IgKGkgPSBfaSA9IDAsIF9sZW4gPSBvdGhlcnMubGVuZ3RoOyBfaSA8IF9sZW47IGkgPSArK19pKSB7XG4gICAgb3RoZXIgPSBvdGhlcnNbaV07XG4gICAgaWYgKG92ZXJsYXBzKHBhdGgsIG90aGVyKSkge1xuICAgICAgdW5pb24gPSBwYXRoLnVuaXRlKG90aGVyKTtcbiAgICAgIG1lcmdlZCA9IG1lcmdlT25lUGF0aCh1bmlvbiwgb3RoZXJzLnNsaWNlKGkgKyAxKSk7XG4gICAgICByZXR1cm4gKF9yZWYgPSBvdGhlcnMuc2xpY2UoMCwgaSkpLmNvbmNhdC5hcHBseShfcmVmLCBtZXJnZWQpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gb3RoZXJzLmNvbmNhdChwYXRoKTtcbn07XG5cbi8vIGh0dHBzOi8vZ3JvdXBzLmdvb2dsZS5jb20vZm9ydW0vIyF0b3BpYy9wYXBlcmpzL1VEOEwwTVR5UmVRXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VQYXRocyhwYXRocykge1xuICB2YXIgcGF0aCwgcmVzdWx0LCBfaSwgX2xlbjtcbiAgcmVzdWx0ID0gW107XG4gIGZvciAoX2kgPSAwLCBfbGVuID0gcGF0aHMubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICBwYXRoID0gcGF0aHNbX2ldO1xuICAgIHJlc3VsdCA9IG1lcmdlT25lUGF0aChwYXRoLCByZXN1bHQpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gaGl0VGVzdEJvdW5kcyhwb2ludCwgY2hpbGRyZW4pIHtcbiAgaWYgKCFwb2ludCkgcmV0dXJuIG51bGw7XG5cbiAgZm9yIChsZXQgaSA9IGNoaWxkcmVuLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgbGV0IGNoaWxkID0gY2hpbGRyZW5baV07XG4gICAgbGV0IGJvdW5kcyA9IGNoaWxkLnN0cm9rZUJvdW5kcztcbiAgICBpZiAocG9pbnQuaXNJbnNpZGUoY2hpbGQuc3Ryb2tlQm91bmRzKSkge1xuICAgICAgcmV0dXJuIGNoaWxkO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuIl19
