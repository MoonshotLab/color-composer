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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjb25maWcuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9zaGFwZS5qcyIsInNyYy9qcy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxRQUFRLE9BQVIsR0FBa0I7QUFDaEIsVUFBUSxDQUFDLFNBQUQsRUFBWSxTQUFaLEVBQXVCLFNBQXZCLEVBQWtDLFNBQWxDLEVBQTZDLFNBQTdDLEVBQXdELFNBQXhELEVBQW1FLFNBQW5FLEVBQThFLFNBQTlFLEVBQXlGLFNBQXpGLEVBQW9HLFNBQXBHLEVBQStHLFNBQS9HLEVBQXlILFNBQXpILENBRFE7QUFFaEIsUUFBTSxDQUFDLFNBQUQsRUFBWSxTQUFaLEVBQXVCLFNBQXZCLEVBQWtDLFNBQWxDLEVBQTZDLFNBQTdDLENBRlU7QUFHaEIsYUFBVyxFQUhLO0FBSWhCLHFCQUFtQjtBQUpILENBQWxCOztBQU9BLFFBQVEsS0FBUixHQUFnQjtBQUNkLHNCQUFvQixHQUROO0FBRWQscUJBQW1CLEtBRkw7QUFHZCxzQkFBb0I7QUFITixDQUFoQjs7QUFNQSxRQUFRLEdBQVIsR0FBYyxJQUFkOzs7Ozs7O0FDYkEsT0FBTyxHQUFQLEdBQWEsT0FBTyxHQUFQLElBQWM7QUFDekIsV0FBUyxDQUFDLFNBQUQsRUFBWSxTQUFaLEVBQXVCLFNBQXZCLEVBQWtDLFNBQWxDLEVBQTZDLFNBQTdDLEVBQXdELFNBQXhELEVBQW1FLFNBQW5FLEVBQThFLFNBQTlFLEVBQXlGLFNBQXpGLEVBQW9HLFNBQXBHLEVBQStHLFNBQS9HLEVBQTBILFNBQTFILEVBQXFJLFNBQXJJLEVBQWdKLFNBQWhKLEVBQTJKLFNBQTNKLEVBQXNLLFNBQXRLLENBRGdCO0FBRXpCLGdCQUFjLFNBRlc7QUFHekIsWUFBVSxFQUhlO0FBSXpCLFNBQU87QUFKa0IsQ0FBM0I7O0FBT0EsTUFBTSxPQUFOLENBQWMsTUFBZDs7QUFFQSxJQUFNLE9BQU8sUUFB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QWMsSUFBZCxDQUFQO0FBQ0Q7O0FBRUQ7QUFDTyxTQUFTLFVBQVQsQ0FBb0IsS0FBcEIsRUFBMkI7QUFDaEMsTUFBSSxJQUFKLEVBQVUsTUFBVixFQUFrQixFQUFsQixFQUFzQixJQUF0QjtBQUNBLFdBQVMsRUFBVDtBQUNBLE9BQUssS0FBSyxDQUFMLEVBQVEsT0FBTyxNQUFNLE1BQTFCLEVBQWtDLEtBQUssSUFBdkMsRUFBNkMsSUFBN0MsRUFBbUQ7QUFDakQsV0FBTyxNQUFNLEVBQU4sQ0FBUDtBQUNBLGFBQVMsYUFBYSxJQUFiLEVBQW1CLE1BQW5CLENBQVQ7QUFDRDtBQUNELFNBQU8sTUFBUDtBQUNEOztBQUVNLFNBQVMsYUFBVCxDQUF1QixLQUF2QixFQUE4QixRQUE5QixFQUF3QztBQUM3QyxNQUFJLENBQUMsS0FBTCxFQUFZLE9BQU8sSUFBUDs7QUFFWixPQUFLLElBQUksSUFBSSxTQUFTLE1BQVQsR0FBa0IsQ0FBL0IsRUFBa0MsS0FBSyxDQUF2QyxFQUEwQyxHQUExQyxFQUErQztBQUM3QyxRQUFJLFFBQVEsU0FBUyxDQUFULENBQVo7QUFDQSxRQUFJLFNBQVMsTUFBTSxZQUFuQjtBQUNBLFFBQUksTUFBTSxRQUFOLENBQWUsTUFBTSxZQUFyQixDQUFKLEVBQXdDO0FBQ3RDLGFBQU8sS0FBUDtBQUNEO0FBQ0Y7O0FBRUQsU0FBTyxJQUFQO0FBQ0QiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiZXhwb3J0cy5wYWxldHRlID0ge1xuICBjb2xvcnM6IFtcIiMyMDE3MUNcIiwgXCIjMUUyQTQzXCIsIFwiIzI4Mzc3RFwiLCBcIiMzNTI3NDdcIiwgXCIjQ0EyRTI2XCIsIFwiIzlBMkExRlwiLCBcIiNEQTZDMjZcIiwgXCIjNDUzMTIxXCIsIFwiIzkxNkE0N1wiLCBcIiNEQUFEMjdcIiwgXCIjN0Y3RDMxXCIsXCIjMkI1RTJFXCJdLFxuICBwb3BzOiBbXCIjMDBBREVGXCIsIFwiI0YyODVBNVwiLCBcIiM3REM1N0ZcIiwgXCIjRjZFQjE2XCIsIFwiI0Y0RUFFMFwiXSxcbiAgY29sb3JTaXplOiAyMCxcbiAgc2VsZWN0ZWRDb2xvclNpemU6IDMwXG59XG5cbmV4cG9ydHMuc2hhcGUgPSB7XG4gIGV4dGVuZGluZ1RocmVzaG9sZDogMC4xLFxuICB0cmltbWluZ1RocmVzaG9sZDogMC4wNzUsXG4gIGNvcm5lclRocmVzaG9sZERlZzogMTBcbn1cblxuZXhwb3J0cy5sb2cgPSB0cnVlO1xuIiwid2luZG93LmthbiA9IHdpbmRvdy5rYW4gfHwge1xuICBwYWxldHRlOiBbXCIjMjAxNzFDXCIsIFwiIzFFMkE0M1wiLCBcIiMyODM3N0RcIiwgXCIjMzUyNzQ3XCIsIFwiI0YyODVBNVwiLCBcIiNDQTJFMjZcIiwgXCIjQjg0NTI2XCIsIFwiI0RBNkMyNlwiLCBcIiM0NTMxMjFcIiwgXCIjOTE2QTQ3XCIsIFwiI0VFQjY0MVwiLCBcIiNGNkVCMTZcIiwgXCIjN0Y3RDMxXCIsIFwiIzZFQUQ3OVwiLCBcIiMyQTQ2MjFcIiwgXCIjRjRFQUUwXCJdLFxuICBjdXJyZW50Q29sb3I6ICcjMjAxNzFDJyxcbiAgbnVtUGF0aHM6IDEwLFxuICBwYXRoczogW10sXG59O1xuXG5wYXBlci5pbnN0YWxsKHdpbmRvdyk7XG5cbmNvbnN0IHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcbmNvbnN0IHNoYXBlID0gcmVxdWlyZSgnLi9zaGFwZScpO1xuY29uc3QgY29uZmlnID0gcmVxdWlyZSgnLi8uLi8uLi9jb25maWcnKTtcbi8vIHJlcXVpcmUoJ3BhcGVyLWFuaW1hdGUnKTtcblxuZnVuY3Rpb24gbG9nKHRoaW5nKSB7XG4gIHV0aWwubG9nKHRoaW5nKTtcbn1cblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gIGxldCBNT1ZFUyA9IFtdOyAvLyBzdG9yZSBnbG9iYWwgbW92ZXMgbGlzdFxuICAvLyBtb3ZlcyA9IFtcbiAgLy8gICB7XG4gIC8vICAgICAndHlwZSc6ICdjb2xvckNoYW5nZScsXG4gIC8vICAgICAnb2xkJzogJyMyMDE3MUMnLFxuICAvLyAgICAgJ25ldyc6ICcjRjI4NUE1J1xuICAvLyAgIH0sXG4gIC8vICAge1xuICAvLyAgICAgJ3R5cGUnOiAnbmV3UGF0aCcsXG4gIC8vICAgICAncmVmJzogJz8/PycgLy8gdXVpZD8gZG9tIHJlZmVyZW5jZT9cbiAgLy8gICB9LFxuICAvLyAgIHtcbiAgLy8gICAgICd0eXBlJzogJ3BhdGhUcmFuc2Zvcm0nLFxuICAvLyAgICAgJ3JlZic6ICc/Pz8nLCAvLyB1dWlkPyBkb20gcmVmZXJlbmNlP1xuICAvLyAgICAgJ29sZCc6ICdyb3RhdGUoOTBkZWcpc2NhbGUoMS41KScsIC8vID8/P1xuICAvLyAgICAgJ25ldyc6ICdyb3RhdGUoMTIwZGVnKXNjYWxlKC0wLjUpJyAvLyA/Pz9cbiAgLy8gICB9LFxuICAvLyAgIC8vIG90aGVycz9cbiAgLy8gXVxuXG4gIGNvbnN0ICR3aW5kb3cgPSAkKHdpbmRvdyk7XG4gIGNvbnN0ICRib2R5ID0gJCgnYm9keScpO1xuICBjb25zdCAkY2FudmFzID0gJCgnY2FudmFzI21haW5DYW52YXMnKTtcbiAgY29uc3QgcnVuQW5pbWF0aW9ucyA9IGZhbHNlO1xuICBjb25zdCB0cmFuc3BhcmVudCA9IG5ldyBDb2xvcigwLCAwKTtcbiAgY29uc3QgdGhyZXNob2xkQW5nbGUgPSB1dGlsLnJhZChjb25maWcuc2hhcGUuY29ybmVyVGhyZXNob2xkRGVnKTtcblxuICBsZXQgdmlld1dpZHRoLCB2aWV3SGVpZ2h0O1xuXG4gIGZ1bmN0aW9uIGhpdFRlc3RCb3VuZHMocG9pbnQpIHtcbiAgICByZXR1cm4gdXRpbC5oaXRUZXN0Qm91bmRzKHBvaW50LCBwYXBlci5wcm9qZWN0LmFjdGl2ZUxheWVyLmNoaWxkcmVuKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhpdFRlc3RHcm91cEJvdW5kcyhwb2ludCkge1xuICAgIGxldCBncm91cHMgPSBwYXBlci5wcm9qZWN0LmdldEl0ZW1zKHtcbiAgICAgIGNsYXNzTmFtZTogJ0dyb3VwJ1xuICAgIH0pO1xuICAgIHJldHVybiB1dGlsLmhpdFRlc3RCb3VuZHMocG9pbnQsIGdyb3Vwcyk7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0Vmlld1ZhcnMoKSB7XG4gICAgdmlld1dpZHRoID0gcGFwZXIudmlldy52aWV3U2l6ZS53aWR0aDtcbiAgICB2aWV3SGVpZ2h0ID0gcGFwZXIudmlldy52aWV3U2l6ZS5oZWlnaHQ7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0Q29udHJvbFBhbmVsKCkge1xuICAgIGluaXRDb2xvclBhbGV0dGUoKTtcbiAgICBpbml0Q2FudmFzRHJhdygpO1xuICAgIGluaXROZXcoKTtcbiAgICBpbml0VW5kbygpO1xuICAgIGluaXRQbGF5KCk7XG4gICAgaW5pdFRpcHMoKTtcbiAgICBpbml0U2hhcmUoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRDb2xvclBhbGV0dGUoKSB7XG4gICAgY29uc3QgJHBhbGV0dGVXcmFwID0gJCgndWwucGFsZXR0ZS1jb2xvcnMnKTtcbiAgICBjb25zdCAkcGFsZXR0ZUNvbG9ycyA9ICRwYWxldHRlV3JhcC5maW5kKCdsaScpO1xuICAgIGNvbnN0IHBhbGV0dGVDb2xvclNpemUgPSAyMDtcbiAgICBjb25zdCBwYWxldHRlU2VsZWN0ZWRDb2xvclNpemUgPSAzMDtcbiAgICBjb25zdCBwYWxldHRlU2VsZWN0ZWRDbGFzcyA9ICdwYWxldHRlLXNlbGVjdGVkJztcblxuICAgIC8vIGhvb2sgdXAgY2xpY2tcbiAgICAgICRwYWxldHRlQ29sb3JzLm9uKCdjbGljayB0YXAgdG91Y2gnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBsZXQgJHN2ZyA9ICQodGhpcykuZmluZCgnc3ZnLnBhbGV0dGUtY29sb3InKTtcblxuICAgICAgICAgIGlmICghJHN2Zy5oYXNDbGFzcyhwYWxldHRlU2VsZWN0ZWRDbGFzcykpIHtcbiAgICAgICAgICAgICQoJy4nICsgcGFsZXR0ZVNlbGVjdGVkQ2xhc3MpXG4gICAgICAgICAgICAgIC5yZW1vdmVDbGFzcyhwYWxldHRlU2VsZWN0ZWRDbGFzcylcbiAgICAgICAgICAgICAgLmF0dHIoJ3dpZHRoJywgcGFsZXR0ZUNvbG9yU2l6ZSlcbiAgICAgICAgICAgICAgLmF0dHIoJ2hlaWdodCcsIHBhbGV0dGVDb2xvclNpemUpXG4gICAgICAgICAgICAgIC5maW5kKCdyZWN0JylcbiAgICAgICAgICAgICAgLmF0dHIoJ3J4JywgMClcbiAgICAgICAgICAgICAgLmF0dHIoJ3J5JywgMCk7XG5cbiAgICAgICAgICAgICRzdmcuYWRkQ2xhc3MocGFsZXR0ZVNlbGVjdGVkQ2xhc3MpXG4gICAgICAgICAgICAgIC5hdHRyKCd3aWR0aCcsIHBhbGV0dGVTZWxlY3RlZENvbG9yU2l6ZSlcbiAgICAgICAgICAgICAgLmF0dHIoJ2hlaWdodCcsIHBhbGV0dGVTZWxlY3RlZENvbG9yU2l6ZSlcbiAgICAgICAgICAgICAgLmZpbmQoJ3JlY3QnKVxuICAgICAgICAgICAgICAuYXR0cigncngnLCBwYWxldHRlU2VsZWN0ZWRDb2xvclNpemUgLyAyKVxuICAgICAgICAgICAgICAuYXR0cigncnknLCBwYWxldHRlU2VsZWN0ZWRDb2xvclNpemUgLyAyKVxuXG4gICAgICAgICAgICB3aW5kb3cua2FuLmN1cnJlbnRDb2xvciA9ICRzdmcuZmluZCgncmVjdCcpLmF0dHIoJ2ZpbGwnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdENhbnZhc0RyYXcoKSB7XG5cbiAgICBwYXBlci5zZXR1cCgkY2FudmFzWzBdKTtcblxuICAgIGxldCBtaWRkbGUsIGJvdW5kcztcbiAgICBsZXQgc2l6ZXM7XG4gICAgLy8gbGV0IHBhdGhzID0gZ2V0RnJlc2hQYXRocyh3aW5kb3cua2FuLm51bVBhdGhzKTtcbiAgICBsZXQgdG91Y2ggPSBmYWxzZTtcbiAgICBsZXQgbGFzdENoaWxkO1xuICAgIGxldCBwYXRoRGF0YSA9IHt9O1xuICAgIGxldCBwcmV2QW5nbGUsIHByZXZQb2ludDtcblxuICAgIGxldCBzaWRlcztcbiAgICBsZXQgc2lkZTtcblxuICAgIGxldCBjb3JuZXJzO1xuXG4gICAgZnVuY3Rpb24gcGFuU3RhcnQoZXZlbnQpIHtcbiAgICAgIHBhcGVyLnByb2plY3QuYWN0aXZlTGF5ZXIucmVtb3ZlQ2hpbGRyZW4oKTsgLy8gUkVNT1ZFXG4gICAgICAvLyBkcmF3Q2lyY2xlKCk7XG5cbiAgICAgIHNpemVzID0gW107XG4gICAgICBwcmV2QW5nbGUgPSBNYXRoLmF0YW4yKGV2ZW50LnZlbG9jaXR5WSwgZXZlbnQudmVsb2NpdHlYKTtcblxuICAgICAgaWYgKHBpbmNoaW5nKSByZXR1cm47XG4gICAgICBpZiAoIShldmVudC5jaGFuZ2VkUG9pbnRlcnMgJiYgZXZlbnQuY2hhbmdlZFBvaW50ZXJzLmxlbmd0aCA+IDApKSByZXR1cm47XG4gICAgICBpZiAoZXZlbnQuY2hhbmdlZFBvaW50ZXJzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgbG9nKCdldmVudC5jaGFuZ2VkUG9pbnRlcnMgPiAxJyk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHBvaW50ZXIgPSBldmVudC5jZW50ZXI7XG4gICAgICBjb25zdCBwb2ludCA9IG5ldyBQb2ludChwb2ludGVyLngsIHBvaW50ZXIueSk7XG5cbiAgICAgIGJvdW5kcyA9IG5ldyBQYXRoKHtcbiAgICAgICAgc3Ryb2tlQ29sb3I6IHdpbmRvdy5rYW4uY3VycmVudENvbG9yLFxuICAgICAgICBmaWxsQ29sb3I6IHdpbmRvdy5rYW4uY3VycmVudENvbG9yLFxuICAgICAgICBuYW1lOiAnYm91bmRzJyxcbiAgICAgICAgdmlzaWJsZTogZmFsc2VcbiAgICAgIH0pO1xuXG4gICAgICBtaWRkbGUgPSBuZXcgUGF0aCh7XG4gICAgICAgIHN0cm9rZUNvbG9yOiB3aW5kb3cua2FuLmN1cnJlbnRDb2xvcixcbiAgICAgICAgbmFtZTogJ21pZGRsZScsXG4gICAgICAgIHN0cm9rZVdpZHRoOiA1LFxuICAgICAgICB2aXNpYmxlOiB0cnVlLFxuICAgICAgICBzdHJva2VDYXA6ICdyb3VuZCdcbiAgICAgIH0pO1xuXG4gICAgICBib3VuZHMuYWRkKHBvaW50KTtcbiAgICAgIG1pZGRsZS5hZGQocG9pbnQpO1xuXG4gICAgICBwcmV2UG9pbnQgPSBwb2ludDtcbiAgICAgIGNvcm5lcnMgPSBbcG9pbnRdO1xuXG4gICAgICBzaWRlcyA9IFtdO1xuICAgICAgc2lkZSA9IFtwb2ludF07XG5cbiAgICAgIHBhdGhEYXRhW3NoYXBlLnN0cmluZ2lmeVBvaW50KHBvaW50KV0gPSB7XG4gICAgICAgIHBvaW50OiBwb2ludCxcbiAgICAgICAgZmlyc3Q6IHRydWVcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3QgbWluID0gMTtcbiAgICBjb25zdCBtYXggPSAxNTtcbiAgICBjb25zdCBhbHBoYSA9IDAuMztcbiAgICBjb25zdCBtZW1vcnkgPSAxMDtcbiAgICB2YXIgY3VtRGlzdGFuY2UgPSAwO1xuICAgIGxldCBjdW1TaXplLCBhdmdTaXplO1xuICAgIGZ1bmN0aW9uIHBhbk1vdmUoZXZlbnQpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBpZiAocGluY2hpbmcpIHJldHVybjtcbiAgICAgIC8vIGxvZyhldmVudC5vdmVyYWxsVmVsb2NpdHkpO1xuICAgICAgLy8gbGV0IHRoaXNEaXN0ID0gcGFyc2VJbnQoZXZlbnQuZGlzdGFuY2UpO1xuICAgICAgLy8gY3VtRGlzdGFuY2UgKz0gdGhpc0Rpc3Q7XG4gICAgICAvL1xuICAgICAgLy8gaWYgKGN1bURpc3RhbmNlIDwgMTAwKSB7XG4gICAgICAvLyAgIGxvZygnaWdub3JpbmcnKTtcbiAgICAgIC8vICAgcmV0dXJuO1xuICAgICAgLy8gfSBlbHNlIHtcbiAgICAgIC8vICAgY3VtRGlzdGFuY2UgPSAwO1xuICAgICAgLy8gICBsb2coJ25vdCBpZ25vcmluZycpO1xuICAgICAgLy8gfVxuXG4gICAgICBjb25zdCBwb2ludGVyID0gZXZlbnQuY2VudGVyO1xuICAgICAgbGV0IHBvaW50ID0gbmV3IFBvaW50KHBvaW50ZXIueCwgcG9pbnRlci55KTtcblxuICAgICAgLy8gYW5nbGUgPSAtMSAqIGV2ZW50LmFuZ2xlOyAvLyBtYWtlIHVwIHBvc2l0aXZlIHJhdGhlciB0aGFuIG5lZ2F0aXZlXG4gICAgICAvLyBhbmdsZSA9IGFuZ2xlICs9IDE4MDtcbiAgICAgIC8vIGNvbnNvbGUubG9nKGV2ZW50LnZlbG9jaXR5WCwgZXZlbnQudmVsb2NpdHlZKTtcbiAgICAgIGFuZ2xlID0gTWF0aC5hdGFuMihldmVudC52ZWxvY2l0eVksIGV2ZW50LnZlbG9jaXR5WCk7XG4gICAgICBsZXQgYW5nbGVEZWx0YSA9IHV0aWwuYW5nbGVEZWx0YShhbmdsZSwgcHJldkFuZ2xlKTtcbiAgICAgIHByZXZBbmdsZSA9IGFuZ2xlO1xuXG4gICAgICBpZiAoYW5nbGVEZWx0YSA+IHRocmVzaG9sZEFuZ2xlKSB7XG4gICAgICAgIGlmIChzaWRlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZygnY29ybmVyJyk7XG4gICAgICAgICAgbGV0IGNvcm5lclBvaW50ID0gcG9pbnQ7XG4gICAgICAgICAgLy8gbmV3IFBhdGguQ2lyY2xlKHtcbiAgICAgICAgICAvLyAgIGNlbnRlcjogY29ybmVyUG9pbnQsXG4gICAgICAgICAgLy8gICByYWRpdXM6IDE1LFxuICAgICAgICAgIC8vICAgc3Ryb2tlQ29sb3I6ICdibGFjaydcbiAgICAgICAgICAvLyB9KTtcbiAgICAgICAgICBjb3JuZXJzLnB1c2goY29ybmVyUG9pbnQpO1xuICAgICAgICAgIHNpZGVzLnB1c2goc2lkZSk7XG4gICAgICAgICAgc2lkZSA9IFtdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBzaWRlLnB1c2gocG9pbnQpO1xuICAgICAgLy8gbGV0IGFuZ2xlRGVnID0gLTEgKiBldmVudC5hbmdsZTtcbiAgICAgIC8vIGlmIChhbmdsZURlZyA8IDApIGFuZ2xlRGVnICs9IDM2MDsgLy8gbm9ybWFsaXplIHRvIFswLCAzNjApXG4gICAgICAvLyBhbmdsZSA9IHV0aWwucmFkKGFuZ2xlRGVnKTtcbiAgICAgIC8vXG4gICAgICAvLyAvLyBsZXQgYW5nbGVEZWx0YSA9IE1hdGguYXRhbjIoTWF0aC5zaW4oYW5nbGUpLCBNYXRoLmNvcyhhbmdsZSkpIC0gTWF0aC5hdGFuMihNYXRoLnNpbihwcmV2QW5nbGUpLCBNYXRoLmNvcyhwcmV2QW5nbGUpKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKGFuZ2xlLCBwcmV2QW5nbGUpO1xuICAgICAgLy8gLy8gY29uc29sZS5sb2coYW5nbGVEZWx0YSk7XG5cbiAgICAgIC8vIGNvbnNvbGUubG9nKGFuZ2xlKTtcblxuICAgICAgLy8gbGV0IGFuZ2xlRGVsdGEgPSBNYXRoLmFicyhwcmV2QW5nbGUgLSBhbmdsZSk7XG4gICAgICAvLyBpZiAoYW5nbGVEZWx0YSA+IDM2MCkgYW5nbGVEZWx0YSA9IGFuZ2xlRGVsdGEgLSAzNjA7XG4gICAgICAvLyBpZiAoYW5nbGVEZWx0YSA+IDkwKSB7XG4gICAgICAvLyAgIGNvbnNvbGUubG9nKGFuZ2xlLCBwcmV2QW5nbGUsIGFuZ2xlRGVsdGEpO1xuICAgICAgLy8gICBjb25zb2xlLmVycm9yKCdjb3JuZXIhJyk7XG4gICAgICAvLyB9IGVsc2Uge1xuICAgICAgLy8gICAvLyBjb25zb2xlLmxvZyhhbmdsZURlbHRhKTtcbiAgICAgIC8vIH1cblxuICAgICAgd2hpbGUgKHNpemVzLmxlbmd0aCA+IG1lbW9yeSkge1xuICAgICAgICBzaXplcy5zaGlmdCgpO1xuICAgICAgfVxuXG4gICAgICBsZXQgYm90dG9tWCwgYm90dG9tWSwgYm90dG9tLFxuICAgICAgICB0b3BYLCB0b3BZLCB0b3AsXG4gICAgICAgIHAwLCBwMSxcbiAgICAgICAgc3RlcCwgYW5nbGUsIGRpc3QsIHNpemU7XG5cbiAgICAgIGlmIChzaXplcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIC8vIG5vdCB0aGUgZmlyc3QgcG9pbnQsIHNvIHdlIGhhdmUgb3RoZXJzIHRvIGNvbXBhcmUgdG9cbiAgICAgICAgcDAgPSBwcmV2UG9pbnQ7XG4gICAgICAgIGRpc3QgPSB1dGlsLmRlbHRhKHBvaW50LCBwMCk7XG4gICAgICAgIHNpemUgPSBkaXN0ICogYWxwaGE7XG4gICAgICAgIC8vIGlmIChzaXplID49IG1heCkgc2l6ZSA9IG1heDtcbiAgICAgICAgc2l6ZSA9IE1hdGgubWF4KE1hdGgubWluKHNpemUsIG1heCksIG1pbik7IC8vIGNsYW1wIHNpemUgdG8gW21pbiwgbWF4XVxuICAgICAgICAvLyBzaXplID0gbWF4IC0gc2l6ZTtcblxuICAgICAgICBjdW1TaXplID0gMDtcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBzaXplcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgIGN1bVNpemUgKz0gc2l6ZXNbal07XG4gICAgICAgIH1cbiAgICAgICAgYXZnU2l6ZSA9IE1hdGgucm91bmQoKChjdW1TaXplIC8gc2l6ZXMubGVuZ3RoKSArIHNpemUpIC8gMik7XG4gICAgICAgIC8vIGxvZyhhdmdTaXplKTtcblxuICAgICAgICBhbmdsZSA9IE1hdGguYXRhbjIocG9pbnQueSAtIHAwLnksIHBvaW50LnggLSBwMC54KTsgLy8gcmFkXG5cbiAgICAgICAgLy8gUG9pbnQoYm90dG9tWCwgYm90dG9tWSkgaXMgYm90dG9tLCBQb2ludCh0b3BYLCB0b3BZKSBpcyB0b3BcbiAgICAgICAgYm90dG9tWCA9IHBvaW50LnggKyBNYXRoLmNvcyhhbmdsZSArIE1hdGguUEkvMikgKiBhdmdTaXplO1xuICAgICAgICBib3R0b21ZID0gcG9pbnQueSArIE1hdGguc2luKGFuZ2xlICsgTWF0aC5QSS8yKSAqIGF2Z1NpemU7XG4gICAgICAgIGJvdHRvbSA9IG5ldyBQb2ludChib3R0b21YLCBib3R0b21ZKTtcblxuICAgICAgICB0b3BYID0gcG9pbnQueCArIE1hdGguY29zKGFuZ2xlIC0gTWF0aC5QSS8yKSAqIGF2Z1NpemU7XG4gICAgICAgIHRvcFkgPSBwb2ludC55ICsgTWF0aC5zaW4oYW5nbGUgLSBNYXRoLlBJLzIpICogYXZnU2l6ZTtcbiAgICAgICAgdG9wID0gbmV3IFBvaW50KHRvcFgsIHRvcFkpO1xuXG4gICAgICAgIGJvdW5kcy5hZGQodG9wKTtcbiAgICAgICAgYm91bmRzLmluc2VydCgwLCBib3R0b20pO1xuICAgICAgICAvLyBib3VuZHMuc21vb3RoKCk7XG5cbiAgICAgICAgbWlkZGxlLmFkZChwb2ludCk7XG4gICAgICAgIHBhdGhEYXRhW3NoYXBlLnN0cmluZ2lmeVBvaW50KHBvaW50KV0gPSB7XG4gICAgICAgICAgcG9pbnQ6IHBvaW50LFxuICAgICAgICAgIHNpemU6IGF2Z1NpemUsXG4gICAgICAgICAgc3BlZWQ6IE1hdGguYWJzKGV2ZW50Lm92ZXJhbGxWZWxvY2l0eSlcbiAgICAgICAgfTtcbiAgICAgICAgLy8gaWYgKHNoYXBlLnN0cmluZ2lmeVBvaW50KHBvaW50KSBpbiBwYXRoRGF0YSkge1xuICAgICAgICAvLyAgIGxvZygnZHVwbGljYXRlIScpO1xuICAgICAgICAvLyB9IGVsc2Uge1xuICAgICAgICAvLyB9XG4gICAgICAgIC8vIG1pZGRsZS5zbW9vdGgoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGRvbid0IGhhdmUgYW55dGhpbmcgdG8gY29tcGFyZSB0b1xuICAgICAgICBkaXN0ID0gMTtcbiAgICAgICAgYW5nbGUgPSAwO1xuXG4gICAgICAgIHNpemUgPSBkaXN0ICogYWxwaGE7XG4gICAgICAgIHNpemUgPSBNYXRoLm1heChNYXRoLm1pbihzaXplLCBtYXgpLCBtaW4pOyAvLyBjbGFtcCBzaXplIHRvIFttaW4sIG1heF1cbiAgICAgICAgcGF0aERhdGFbc2hhcGUuc3RyaW5naWZ5UG9pbnQocG9pbnQpXSA9IHtcbiAgICAgICAgICBwb2ludDogcG9pbnQsXG4gICAgICAgICAgc3BlZWQ6IE1hdGguYWJzKGV2ZW50Lm92ZXJhbGxWZWxvY2l0eSlcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgcGFwZXIudmlldy5kcmF3KCk7XG5cbiAgICAgIHByZXZQb2ludCA9IHBvaW50O1xuICAgICAgc2l6ZXMucHVzaChzaXplKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYW5FbmQoZXZlbnQpIHtcbiAgICAgIGlmIChwaW5jaGluZykgcmV0dXJuO1xuXG4gICAgICBjb25zdCBwb2ludGVyID0gZXZlbnQuY2VudGVyO1xuICAgICAgY29uc3QgcG9pbnQgPSBuZXcgUG9pbnQocG9pbnRlci54LCBwb2ludGVyLnkpO1xuXG4gICAgICBsZXQgZ3JvdXAgPSBuZXcgR3JvdXAoW2JvdW5kcywgbWlkZGxlXSk7XG4gICAgICBncm91cC5kYXRhLmNvbG9yID0gYm91bmRzLmZpbGxDb2xvcjtcbiAgICAgIGdyb3VwLmRhdGEudXBkYXRlID0gdHJ1ZTtcblxuICAgICAgYm91bmRzLmFkZChwb2ludCk7XG4gICAgICBib3VuZHMuY2xvc2VkID0gdHJ1ZTtcbiAgICAgIC8vIGJvdW5kcy5zaW1wbGlmeSgpO1xuXG4gICAgICBtaWRkbGUuYWRkKHBvaW50KTtcbiAgICAgIC8vIG1pZGRsZS5zaW1wbGlmeSgpO1xuXG4gICAgICBzaWRlLnB1c2gocG9pbnQpO1xuICAgICAgc2lkZXMucHVzaChzaWRlKTtcblxuICAgICAgcGF0aERhdGFbc2hhcGUuc3RyaW5naWZ5UG9pbnQocG9pbnQpXSA9IHtcbiAgICAgICAgcG9pbnQ6IHBvaW50LFxuICAgICAgICBsYXN0OiB0cnVlXG4gICAgICB9O1xuXG4gICAgICBjb3JuZXJzLnB1c2gocG9pbnQpO1xuXG4gICAgICAvLyBtaWRkbGUuc2ltcGxpZnkoKTtcbiAgICAgIG1pZGRsZS5yZWR1Y2UoKTtcbiAgICAgIGxldCBbdHJ1ZWRHcm91cCwgdHJ1ZVdhc05lY2Vzc2FyeV0gPSB1dGlsLnRydWVHcm91cChncm91cCwgY29ybmVycyk7XG4gICAgICBncm91cC5yZXBsYWNlV2l0aCh0cnVlZEdyb3VwKTtcbiAgICAgIG1pZGRsZSA9IGdyb3VwLl9uYW1lZENoaWxkcmVuLm1pZGRsZVswXTtcbiAgICAgIG1pZGRsZS5zdHJva2VDb2xvciA9IGdyb3VwLnN0cm9rZUNvbG9yO1xuICAgICAgLy8gbWlkZGxlLnNlbGVjdGVkID0gdHJ1ZTtcblxuICAgICAgLy8gYm91bmRzLmZsYXR0ZW4oNCk7XG4gICAgICAvLyBib3VuZHMuc21vb3RoKCk7XG5cbiAgICAgIC8vIG1pZGRsZS5mbGF0dGVuKDQpO1xuICAgICAgLy8gbWlkZGxlLnJlZHVjZSgpO1xuXG4gICAgICAvLyBtaWRkbGUuc2ltcGxpZnkoKTtcbiAgICAgIGlmICh0cnVlV2FzTmVjZXNzYXJ5KSB7XG4gICAgICAgIGxldCBjb21wdXRlZENvcm5lcnMgPSBzaGFwZS5nZXRDb21wdXRlZENvcm5lcnMobWlkZGxlKTtcbiAgICAgICAgbGV0IGNvbXB1dGVkQ29ybmVyc1BhdGggPSBuZXcgUGF0aChjb21wdXRlZENvcm5lcnMpO1xuICAgICAgICBjb21wdXRlZENvcm5lcnNQYXRoLnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgbGV0IGNvbXB1dGVkQ29ybmVyc1BhdGhMZW5ndGggPSBjb21wdXRlZENvcm5lcnNQYXRoLmxlbmd0aDtcbiAgICAgICAgaWYgKE1hdGguYWJzKGNvbXB1dGVkQ29ybmVyc1BhdGhMZW5ndGggLSBtaWRkbGUubGVuZ3RoKSAvIG1pZGRsZS5sZW5ndGggPD0gMC4xKSB7XG4gICAgICAgICAgbWlkZGxlLnNlZ21lbnRzID0gY29tcHV0ZWRDb3JuZXJzO1xuICAgICAgICAgIC8vIG1pZGRsZS5yZWR1Y2UoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBtaWRkbGUucmVkdWNlKCk7XG5cbiAgICAgICAgLy8gbWlkZGxlLnNlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgIC8vIG1pZGRsZS52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgLy8gbWlkZGxlLnN0cm9rZUNvbG9yID0gJ3BpbmsnO1xuICAgICAgICAvLyBtaWRkbGUuc3Ryb2tlV2VpZ2h0ID0gNTA7XG5cblxuICAgICAgICAvLyBsZXQgbWVyZ2VkQ29ybmVycyA9IGNvcm5lcnMuY29uY2F0KGNvbXB1dGVkQ29ybmVycyk7XG4gICAgICAgIC8vIGxldCBmb28gPSBuZXcgUGF0aChtZXJnZWRDb3JuZXJzKTtcbiAgICAgICAgLy8gZm9vLnN0cm9rZVdpZHRoID0gNTtcbiAgICAgICAgLy8gZm9vLnN0cm9rZUNvbG9yID0gJ2JsdWUnO1xuICAgICAgICAvLyBsZXQgY29ybmVyc1BhdGggPSBuZXcgUGF0aCh7XG4gICAgICAgIC8vICAgc3Ryb2tlV2lkdGg6IDUsXG4gICAgICAgIC8vICAgc3Ryb2tlQ29sb3I6ICdyZWQnXG4gICAgICAgIC8vIH0pO1xuICAgICAgICAvLyBCYXNlLmVhY2gobWVyZ2VkQ29ybmVycywgKGNvcm5lciwgaSkgPT4ge1xuICAgICAgICAvLyAgIGNvcm5lcnNQYXRoLmFkZChjb3JuZXIpO1xuICAgICAgICAvLyAgIC8vIGlmIChpIDwgMikge1xuICAgICAgICAvLyAgIC8vICAgY29ybmVyc1BhdGguYWRkKGNvcm5lcik7XG4gICAgICAgIC8vICAgLy8gfSBlbHNlIHtcbiAgICAgICAgLy8gICAvLyAgIGxldCBjbG9zZXN0UG9pbnQgPSBjb3JuZXJzUGF0aC5nZXROZWFyZXN0UG9pbnQoY29ybmVyKTtcbiAgICAgICAgLy8gICAvLyAgIGNvcm5lcnNQYXRoLmluc2VydChjb3JuZXIsIGNsb3Nlc3RQb2ludC5pbmRleCArIDEpO1xuICAgICAgICAvLyAgIC8vIH1cbiAgICAgICAgLy8gfSk7XG4gICAgICAgIC8vIGxldCBjb3JuZXJzUGF0aCA9IG5ldyBQYXRoKHtcbiAgICAgICAgLy8gICBzdHJva2VXaWR0aDogNSxcbiAgICAgICAgLy8gICBzdHJva2VDb2xvcjogJ3JlZCcsXG4gICAgICAgIC8vICAgc2VnbWVudHM6IGNvcm5lcnNcbiAgICAgICAgLy8gfSk7XG4gICAgICAgIC8vIGxldCBjb21wdXRlZENvcm5lcnNQYXRoID0gbmV3IFBhdGgoe1xuICAgICAgICAvLyAgIHN0cm9rZVdpZHRoOiA1LFxuICAgICAgICAvLyAgIHN0cm9rZUNvbG9yOiAnYmx1ZScsXG4gICAgICAgIC8vICAgc2VnbWVudHM6IGNvbXB1dGVkQ29ybmVycyxcbiAgICAgICAgLy8gICBjbG9zZWQ6IHRydWVcbiAgICAgICAgLy8gfSk7XG5cbiAgICAgICAgLy8gbGV0IHRocmVzaG9sZERpc3QgPSAwLjA1ICogY29tcHV0ZWRDb3JuZXJzUGF0aC5sZW5ndGg7XG4gICAgICAgIC8vXG4gICAgICAgIC8vIEJhc2UuZWFjaChjb3JuZXJzLCAoY29ybmVyLCBpKSA9PiB7XG4gICAgICAgIC8vICAgbGV0IGludGVnZXJQb2ludCA9IHNoYXBlLmdldEludGVnZXJQb2ludChjb3JuZXIpO1xuICAgICAgICAvLyAgIGxldCBjbG9zZXN0UG9pbnQgPSBjb21wdXRlZENvcm5lcnNQYXRoLmdldE5lYXJlc3RQb2ludChjb3JuZXIpO1xuICAgICAgICAvLyB9KTtcbiAgICAgICAgLy8gY29tcHV0ZWRDb3JuZXJzLnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgLy8gY29tcHV0ZWRDb3JuZXJzUGF0aC52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgIC8vIGxldCBtZXJnZWRDb3JuZXJzUGF0aCA9IGNvcm5lcnNQYXRoLnVuaXRlKGNvbXB1dGVkQ29ybmVyc1BhdGgpO1xuICAgICAgICAvLyBtZXJnZWRDb3JuZXJzUGF0aC5zdHJva2VDb2xvciA9ICdwdXJwbGUnO1xuICAgICAgICAvLyBjb3JuZXJzUGF0aC5mbGF0dGVuKCk7XG4gICAgICAvLyB9XG5cbiAgICAgIC8vIGlmICh0cnVlV2FzTmVjZXNzYXJ5KSB7XG4gICAgICAvLyAgIGxldCBpZGVhbEdlb21ldHJ5ID0gc2hhcGUuZ2V0SWRlYWxHZW9tZXRyeShwYXRoRGF0YSwgc2lkZXMsIG1pZGRsZSk7XG4gICAgICAvLyAgIGxvZyhpZGVhbEdlb21ldHJ5KTtcbiAgICAgIC8vICAgQmFzZS5lYWNoKGNvcm5lcnMsIChjb3JuZXIsIGkpID0+IHtcbiAgICAgIC8vICAgICBpZGVhbEdlb21ldHJ5LmFkZChjb3JuZXIpO1xuICAgICAgLy8gICB9KTtcbiAgICAgIC8vICAgaWRlYWxHZW9tZXRyeS5yZWR1Y2UoKTtcbiAgICAgIC8vXG4gICAgICAvLyAgIGlkZWFsR2VvbWV0cnkuc3Ryb2tlQ29sb3IgPSAncmVkJztcbiAgICAgIC8vIH0gZWxzZSB7XG4gICAgICAvLyAgIGxvZygnbm8gdHJ1ZWluZyBuZWNlc3NhcnknKTtcbiAgICAgIC8vIH1cbiAgICAgIC8vIG1pZGRsZS5zbW9vdGgoe1xuICAgICAgLy8gICB0eXBlOiAnZ2VvbWV0cmljJ1xuICAgICAgLy8gfSk7XG4gICAgICAvLyBtaWRkbGUuZmxhdHRlbigxMCk7XG4gICAgICAvLyBtaWRkbGUuc2ltcGxpZnkoKTtcbiAgICAgIC8vIG1pZGRsZS5mbGF0dGVuKDIwKTtcbiAgICAgIC8vIG1pZGRsZS5zaW1wbGlmeSgpO1xuICAgICAgLy8gbWlkZGxlLmZsYXR0ZW4oKTtcbiAgICAgIC8vIG1pZGRsZS5zaW1wbGlmeSgpO1xuXG4gICAgICBtaWRkbGUuc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgLy8gbGV0IG1pZGRsZUNsb25lID0gbWlkZGxlLmNsb25lKCk7XG4gICAgICAvLyBtaWRkbGVDbG9uZS52aXNpYmxlID0gdHJ1ZTtcbiAgICAgIC8vIG1pZGRsZUNsb25lLnN0cm9rZUNvbG9yID0gJ3BpbmsnO1xuXG5cbiAgICAgIGxldCBpbnRlcnNlY3Rpb25zID0gbWlkZGxlLmdldENyb3NzaW5ncygpO1xuICAgICAgaWYgKGludGVyc2VjdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAvLyB3ZSBjcmVhdGUgYSBjb3B5IG9mIHRoZSBwYXRoIGJlY2F1c2UgcmVzb2x2ZUNyb3NzaW5ncygpIHNwbGl0cyBzb3VyY2UgcGF0aFxuICAgICAgICBsZXQgcGF0aENvcHkgPSBuZXcgUGF0aCgpO1xuICAgICAgICBwYXRoQ29weS5jb3B5Q29udGVudChtaWRkbGUpO1xuICAgICAgICBwYXRoQ29weS52aXNpYmxlID0gZmFsc2U7XG5cbiAgICAgICAgbGV0IGRpdmlkZWRQYXRoID0gcGF0aENvcHkucmVzb2x2ZUNyb3NzaW5ncygpO1xuICAgICAgICBkaXZpZGVkUGF0aC52aXNpYmxlID0gZmFsc2U7XG5cblxuICAgICAgICBsZXQgZW5jbG9zZWRMb29wcyA9IHV0aWwuZmluZEludGVyaW9yQ3VydmVzKGRpdmlkZWRQYXRoKTtcblxuICAgICAgICBpZiAoZW5jbG9zZWRMb29wcykge1xuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZW5jbG9zZWRMb29wcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZW5jbG9zZWRMb29wc1tpXS52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgIGVuY2xvc2VkTG9vcHNbaV0uY2xvc2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIGVuY2xvc2VkTG9vcHNbaV0uZmlsbENvbG9yID0gbmV3IENvbG9yKDAsIDApOyAvLyB0cmFuc3BhcmVudFxuICAgICAgICAgICAgZW5jbG9zZWRMb29wc1tpXS5kYXRhLmludGVyaW9yID0gdHJ1ZTtcbiAgICAgICAgICAgIGVuY2xvc2VkTG9vcHNbaV0uZGF0YS50cmFuc3BhcmVudCA9IHRydWU7XG4gICAgICAgICAgICAvLyBlbmNsb3NlZExvb3BzW2ldLmJsZW5kTW9kZSA9ICdtdWx0aXBseSc7XG4gICAgICAgICAgICBncm91cC5hZGRDaGlsZChlbmNsb3NlZExvb3BzW2ldKTtcbiAgICAgICAgICAgIGVuY2xvc2VkTG9vcHNbaV0uc2VuZFRvQmFjaygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBwYXRoQ29weS5yZW1vdmUoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGxvZygnbm8gaW50ZXJzZWN0aW9ucycpO1xuICAgICAgfVxuXG4gICAgICBncm91cC5kYXRhLmNvbG9yID0gYm91bmRzLmZpbGxDb2xvcjtcbiAgICAgIGdyb3VwLmRhdGEuc2NhbGUgPSAxOyAvLyBpbml0IHZhcmlhYmxlIHRvIHRyYWNrIHNjYWxlIGNoYW5nZXNcbiAgICAgIGdyb3VwLmRhdGEucm90YXRpb24gPSAwOyAvLyBpbml0IHZhcmlhYmxlIHRvIHRyYWNrIHJvdGF0aW9uIGNoYW5nZXNcblxuICAgICAgbGV0IGNoaWxkcmVuID0gZ3JvdXAuZ2V0SXRlbXMoe1xuICAgICAgICBtYXRjaDogZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgIHJldHVybiBpdGVtLm5hbWUgIT09ICdtaWRkbGUnXG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBsb2coJy0tLS0tJyk7XG4gICAgICAvLyBsb2coZ3JvdXApO1xuICAgICAgLy8gbG9nKGNoaWxkcmVuKTtcbiAgICAgIC8vIGdyb3VwLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgIGxldCB1bml0ZWRQYXRoID0gbmV3IFBhdGgoKTtcbiAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGggPiAxKSB7XG4gICAgICAgIGxldCBhY2N1bXVsYXRvciA9IG5ldyBQYXRoKCk7XG4gICAgICAgIGFjY3VtdWxhdG9yLmNvcHlDb250ZW50KGNoaWxkcmVuWzBdKTtcbiAgICAgICAgYWNjdW11bGF0b3IudmlzaWJsZSA9IGZhbHNlO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBsZXQgb3RoZXJQYXRoID0gbmV3IFBhdGgoKTtcbiAgICAgICAgICBvdGhlclBhdGguY29weUNvbnRlbnQoY2hpbGRyZW5baV0pO1xuICAgICAgICAgIG90aGVyUGF0aC52aXNpYmxlID0gZmFsc2U7XG5cbiAgICAgICAgICB1bml0ZWRQYXRoID0gYWNjdW11bGF0b3IudW5pdGUob3RoZXJQYXRoKTtcbiAgICAgICAgICBvdGhlclBhdGgucmVtb3ZlKCk7XG4gICAgICAgICAgYWNjdW11bGF0b3IgPSB1bml0ZWRQYXRoO1xuICAgICAgICB9XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGNoaWxkcmVuWzBdIGlzIHVuaXRlZCBncm91cFxuICAgICAgICB1bml0ZWRQYXRoLmNvcHlDb250ZW50KGNoaWxkcmVuWzBdKTtcbiAgICAgIH1cblxuICAgICAgdW5pdGVkUGF0aC52aXNpYmxlID0gZmFsc2U7XG4gICAgICB1bml0ZWRQYXRoLmRhdGEubmFtZSA9ICdtYXNrJztcblxuICAgICAgZ3JvdXAuYWRkQ2hpbGQodW5pdGVkUGF0aCk7XG4gICAgICB1bml0ZWRQYXRoLnNlbmRUb0JhY2soKTtcblxuICAgICAgLy8gbWlkZGxlLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgIC8vIG1pZGRsZS52aXNpYmxlID0gdHJ1ZTtcbiAgICAgIC8vIG1pZGRsZS5zdHJva2VDb2xvciA9ICdwaW5rJztcblxuICAgICAgbGFzdENoaWxkID0gZ3JvdXA7XG5cbiAgICAgIE1PVkVTLnB1c2goe1xuICAgICAgICB0eXBlOiAnbmV3R3JvdXAnLFxuICAgICAgICBpZDogZ3JvdXAuaWRcbiAgICAgIH0pO1xuXG4gICAgICBpZiAocnVuQW5pbWF0aW9ucykge1xuICAgICAgICBncm91cC5hbmltYXRlKFxuICAgICAgICAgIFt7XG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgIHNjYWxlOiAwLjlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXR0aW5nczoge1xuICAgICAgICAgICAgICBkdXJhdGlvbjogMTAwLFxuICAgICAgICAgICAgICBlYXNpbmc6IFwiZWFzZU91dFwiLFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICBzY2FsZTogMS4xMVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldHRpbmdzOiB7XG4gICAgICAgICAgICAgIGR1cmF0aW9uOiAxMDAsXG4gICAgICAgICAgICAgIGVhc2luZzogXCJlYXNlSW5cIlxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1dXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IHBpbmNoaW5nO1xuICAgIGxldCBwaW5jaGVkR3JvdXAsIGxhc3RTY2FsZSwgbGFzdFJvdGF0aW9uO1xuICAgIGxldCBvcmlnaW5hbFBvc2l0aW9uLCBvcmlnaW5hbFJvdGF0aW9uLCBvcmlnaW5hbFNjYWxlO1xuXG4gICAgZnVuY3Rpb24gcGluY2hTdGFydChldmVudCkge1xuICAgICAgbG9nKCdwaW5jaFN0YXJ0JywgZXZlbnQuY2VudGVyKTtcbiAgICAgIGhhbW1lck1hbmFnZXIuZ2V0KCdwYW4nKS5zZXQoe2VuYWJsZTogZmFsc2V9KTtcbiAgICAgIGNvbnN0IHBvaW50ZXIgPSBldmVudC5jZW50ZXIsXG4gICAgICAgICAgcG9pbnQgPSBuZXcgUG9pbnQocG9pbnRlci54LCBwb2ludGVyLnkpLFxuICAgICAgICAgIGhpdFJlc3VsdCA9IGhpdFRlc3RHcm91cEJvdW5kcyhwb2ludCk7XG5cbiAgICAgIGlmIChoaXRSZXN1bHQpIHtcbiAgICAgICAgcGluY2hpbmcgPSB0cnVlO1xuICAgICAgICAvLyBwaW5jaGVkR3JvdXAgPSBoaXRSZXN1bHQuaXRlbS5wYXJlbnQ7XG4gICAgICAgIHBpbmNoZWRHcm91cCA9IGhpdFJlc3VsdDtcbiAgICAgICAgbGFzdFNjYWxlID0gMTtcbiAgICAgICAgbGFzdFJvdGF0aW9uID0gZXZlbnQucm90YXRpb247XG5cbiAgICAgICAgb3JpZ2luYWxQb3NpdGlvbiA9IHBpbmNoZWRHcm91cC5wb3NpdGlvbjtcbiAgICAgICAgLy8gb3JpZ2luYWxSb3RhdGlvbiA9IHBpbmNoZWRHcm91cC5yb3RhdGlvbjtcbiAgICAgICAgb3JpZ2luYWxSb3RhdGlvbiA9IHBpbmNoZWRHcm91cC5kYXRhLnJvdGF0aW9uO1xuICAgICAgICBvcmlnaW5hbFNjYWxlID0gcGluY2hlZEdyb3VwLmRhdGEuc2NhbGU7XG5cbiAgICAgICAgaWYgKHJ1bkFuaW1hdGlvbnMpIHtcbiAgICAgICAgICBwaW5jaGVkR3JvdXAuYW5pbWF0ZSh7XG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgIHNjYWxlOiAxLjI1XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgICAgICAgZHVyYXRpb246IDEwMCxcbiAgICAgICAgICAgICAgZWFzaW5nOiBcImVhc2VPdXRcIixcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGluY2hlZEdyb3VwID0gbnVsbDtcbiAgICAgICAgbG9nKCdoaXQgbm8gaXRlbScpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBpbmNoTW92ZShldmVudCkge1xuICAgICAgbG9nKCdwaW5jaE1vdmUnKTtcbiAgICAgIGlmICghIXBpbmNoZWRHcm91cCkge1xuICAgICAgICAvLyBsb2coJ3BpbmNobW92ZScsIGV2ZW50KTtcbiAgICAgICAgLy8gbG9nKHBpbmNoZWRHcm91cCk7XG4gICAgICAgIGxldCBjdXJyZW50U2NhbGUgPSBldmVudC5zY2FsZTtcbiAgICAgICAgbGV0IHNjYWxlRGVsdGEgPSBjdXJyZW50U2NhbGUgLyBsYXN0U2NhbGU7XG4gICAgICAgIC8vIGxvZyhsYXN0U2NhbGUsIGN1cnJlbnRTY2FsZSwgc2NhbGVEZWx0YSk7XG4gICAgICAgIGxhc3RTY2FsZSA9IGN1cnJlbnRTY2FsZTtcblxuICAgICAgICBsZXQgY3VycmVudFJvdGF0aW9uID0gZXZlbnQucm90YXRpb247XG4gICAgICAgIGxldCByb3RhdGlvbkRlbHRhID0gY3VycmVudFJvdGF0aW9uIC0gbGFzdFJvdGF0aW9uO1xuICAgICAgICBsb2cobGFzdFJvdGF0aW9uLCBjdXJyZW50Um90YXRpb24sIHJvdGF0aW9uRGVsdGEpO1xuICAgICAgICBsYXN0Um90YXRpb24gPSBjdXJyZW50Um90YXRpb247XG5cbiAgICAgICAgLy8gbG9nKGBzY2FsaW5nIGJ5ICR7c2NhbGVEZWx0YX1gKTtcbiAgICAgICAgLy8gbG9nKGByb3RhdGluZyBieSAke3JvdGF0aW9uRGVsdGF9YCk7XG5cbiAgICAgICAgcGluY2hlZEdyb3VwLnBvc2l0aW9uID0gZXZlbnQuY2VudGVyO1xuICAgICAgICBwaW5jaGVkR3JvdXAuc2NhbGUoc2NhbGVEZWx0YSk7XG4gICAgICAgIHBpbmNoZWRHcm91cC5yb3RhdGUocm90YXRpb25EZWx0YSk7XG5cbiAgICAgICAgcGluY2hlZEdyb3VwLmRhdGEuc2NhbGUgKj0gc2NhbGVEZWx0YTtcbiAgICAgICAgcGluY2hlZEdyb3VwLmRhdGEucm90YXRpb24gKz0gcm90YXRpb25EZWx0YTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgbGFzdEV2ZW50O1xuICAgIGZ1bmN0aW9uIHBpbmNoRW5kKGV2ZW50KSB7XG4gICAgICAvLyB3YWl0IDI1MCBtcyB0byBwcmV2ZW50IG1pc3Rha2VuIHBhbiByZWFkaW5nc1xuICAgICAgbGFzdEV2ZW50ID0gZXZlbnQ7XG4gICAgICBpZiAoISFwaW5jaGVkR3JvdXApIHtcbiAgICAgICAgcGluY2hlZEdyb3VwLmRhdGEudXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgbGV0IG1vdmUgPSB7XG4gICAgICAgICAgaWQ6IHBpbmNoZWRHcm91cC5pZCxcbiAgICAgICAgICB0eXBlOiAndHJhbnNmb3JtJ1xuICAgICAgICB9O1xuICAgICAgICBpZiAocGluY2hlZEdyb3VwLnBvc2l0aW9uICE9IG9yaWdpbmFsUG9zaXRpb24pIHtcbiAgICAgICAgICBtb3ZlLnBvc2l0aW9uID0gb3JpZ2luYWxQb3NpdGlvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwaW5jaGVkR3JvdXAuZGF0YS5yb3RhdGlvbiAhPSBvcmlnaW5hbFJvdGF0aW9uKSB7XG4gICAgICAgICAgbW92ZS5yb3RhdGlvbiA9IG9yaWdpbmFsUm90YXRpb24gLSBwaW5jaGVkR3JvdXAuZGF0YS5yb3RhdGlvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwaW5jaGVkR3JvdXAuZGF0YS5zY2FsZSAhPSBvcmlnaW5hbFNjYWxlKSB7XG4gICAgICAgICAgbW92ZS5zY2FsZSA9IG9yaWdpbmFsU2NhbGUgLyBwaW5jaGVkR3JvdXAuZGF0YS5zY2FsZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxvZygnZmluYWwgc2NhbGUnLCBwaW5jaGVkR3JvdXAuZGF0YS5zY2FsZSk7XG4gICAgICAgIGxvZyhtb3ZlKTtcblxuICAgICAgICBNT1ZFUy5wdXNoKG1vdmUpO1xuXG4gICAgICAgIGlmIChNYXRoLmFicyhldmVudC52ZWxvY2l0eSkgPiAxKSB7XG4gICAgICAgICAgLy8gZGlzcG9zZSBvZiBncm91cCBvZmZzY3JlZW5cbiAgICAgICAgICB0aHJvd1BpbmNoZWRHcm91cCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaWYgKHJ1bkFuaW1hdGlvbnMpIHtcbiAgICAgICAgLy8gICBwaW5jaGVkR3JvdXAuYW5pbWF0ZSh7XG4gICAgICAgIC8vICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIC8vICAgICAgIHNjYWxlOiAwLjhcbiAgICAgICAgLy8gICAgIH0sXG4gICAgICAgIC8vICAgICBzZXR0aW5nczoge1xuICAgICAgICAvLyAgICAgICBkdXJhdGlvbjogMTAwLFxuICAgICAgICAvLyAgICAgICBlYXNpbmc6IFwiZWFzZU91dFwiLFxuICAgICAgICAvLyAgICAgfVxuICAgICAgICAvLyAgIH0pO1xuICAgICAgICAvLyB9XG4gICAgICB9XG4gICAgICBwaW5jaGluZyA9IGZhbHNlO1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgaGFtbWVyTWFuYWdlci5nZXQoJ3BhbicpLnNldCh7ZW5hYmxlOiB0cnVlfSk7XG4gICAgICB9LCAyNTApO1xuICAgIH1cblxuICAgIGNvbnN0IGhpdE9wdGlvbnMgPSB7XG4gICAgICBzZWdtZW50czogZmFsc2UsXG4gICAgICBzdHJva2U6IHRydWUsXG4gICAgICBmaWxsOiB0cnVlLFxuICAgICAgdG9sZXJhbmNlOiA1XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIHNpbmdsZVRhcChldmVudCkge1xuICAgICAgY29uc3QgcG9pbnRlciA9IGV2ZW50LmNlbnRlcixcbiAgICAgICAgICBwb2ludCA9IG5ldyBQb2ludChwb2ludGVyLngsIHBvaW50ZXIueSksXG4gICAgICAgICAgaGl0UmVzdWx0ID0gcGFwZXIucHJvamVjdC5oaXRUZXN0KHBvaW50LCBoaXRPcHRpb25zKTtcblxuICAgICAgaWYgKGhpdFJlc3VsdCkge1xuICAgICAgICBsZXQgaXRlbSA9IGhpdFJlc3VsdC5pdGVtO1xuICAgICAgICBpdGVtLnNlbGVjdGVkID0gIWl0ZW0uc2VsZWN0ZWQ7XG4gICAgICAgIGxvZyhpdGVtKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkb3VibGVUYXAoZXZlbnQpIHtcbiAgICAgIGNvbnN0IHBvaW50ZXIgPSBldmVudC5jZW50ZXIsXG4gICAgICAgICAgcG9pbnQgPSBuZXcgUG9pbnQocG9pbnRlci54LCBwb2ludGVyLnkpLFxuICAgICAgICAgIGhpdFJlc3VsdCA9IHBhcGVyLnByb2plY3QuaGl0VGVzdChwb2ludCwgaGl0T3B0aW9ucyk7XG5cbiAgICAgIGlmIChoaXRSZXN1bHQpIHtcbiAgICAgICAgbGV0IGl0ZW0gPSBoaXRSZXN1bHQuaXRlbTtcbiAgICAgICAgbGV0IHBhcmVudCA9IGl0ZW0ucGFyZW50O1xuXG4gICAgICAgIGlmIChpdGVtLmRhdGEuaW50ZXJpb3IpIHtcbiAgICAgICAgICBpdGVtLmRhdGEudHJhbnNwYXJlbnQgPSAhaXRlbS5kYXRhLnRyYW5zcGFyZW50O1xuXG4gICAgICAgICAgaWYgKGl0ZW0uZGF0YS50cmFuc3BhcmVudCkge1xuICAgICAgICAgICAgaXRlbS5maWxsQ29sb3IgPSB0cmFuc3BhcmVudDtcbiAgICAgICAgICAgIGl0ZW0uc3Ryb2tlQ29sb3IgPSB0cmFuc3BhcmVudDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaXRlbS5maWxsQ29sb3IgPSBwYXJlbnQuZGF0YS5jb2xvcjtcbiAgICAgICAgICAgIGl0ZW0uc3Ryb2tlQ29sb3IgPSBwYXJlbnQuZGF0YS5jb2xvcjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBNT1ZFUy5wdXNoKHtcbiAgICAgICAgICAgIHR5cGU6ICdmaWxsQ2hhbmdlJyxcbiAgICAgICAgICAgIGlkOiBpdGVtLmlkLFxuICAgICAgICAgICAgZmlsbDogcGFyZW50LmRhdGEuY29sb3IsXG4gICAgICAgICAgICB0cmFuc3BhcmVudDogaXRlbS5kYXRhLnRyYW5zcGFyZW50XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbG9nKCdub3QgaW50ZXJpb3InKVxuICAgICAgICB9XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBpbmNoZWRHcm91cCA9IG51bGw7XG4gICAgICAgIGxvZygnaGl0IG5vIGl0ZW0nKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCB2ZWxvY2l0eU11bHRpcGxpZXIgPSAyNTtcbiAgICBmdW5jdGlvbiB0aHJvd1BpbmNoZWRHcm91cCgpIHtcbiAgICAgIGxvZyhwaW5jaGVkR3JvdXAucG9zaXRpb24pO1xuICAgICAgaWYgKHBpbmNoZWRHcm91cC5wb3NpdGlvbi54IDw9IDAgLSBwaW5jaGVkR3JvdXAuYm91bmRzLndpZHRoIHx8XG4gICAgICAgICAgcGluY2hlZEdyb3VwLnBvc2l0aW9uLnggPj0gdmlld1dpZHRoICsgcGluY2hlZEdyb3VwLmJvdW5kcy53aWR0aCB8fFxuICAgICAgICAgIHBpbmNoZWRHcm91cC5wb3NpdGlvbi55IDw9IDAgLSBwaW5jaGVkR3JvdXAuYm91bmRzLmhlaWdodCB8fFxuICAgICAgICAgIHBpbmNoZWRHcm91cC5wb3NpdGlvbi55ID49IHZpZXdIZWlnaHQgKyBwaW5jaGVkR3JvdXAuYm91bmRzLmhlaWdodCkge1xuICAgICAgICAgICAgcGluY2hlZEdyb3VwLmRhdGEub2ZmU2NyZWVuID0gdHJ1ZTtcbiAgICAgICAgICAgIHBpbmNoZWRHcm91cC52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aHJvd1BpbmNoZWRHcm91cCk7XG4gICAgICBwaW5jaGVkR3JvdXAucG9zaXRpb24ueCArPSBsYXN0RXZlbnQudmVsb2NpdHlYICogdmVsb2NpdHlNdWx0aXBsaWVyO1xuICAgICAgcGluY2hlZEdyb3VwLnBvc2l0aW9uLnkgKz0gbGFzdEV2ZW50LnZlbG9jaXR5WSAqIHZlbG9jaXR5TXVsdGlwbGllcjtcbiAgICB9XG5cbiAgICB2YXIgaGFtbWVyTWFuYWdlciA9IG5ldyBIYW1tZXIuTWFuYWdlcigkY2FudmFzWzBdKTtcblxuICAgIGhhbW1lck1hbmFnZXIuYWRkKG5ldyBIYW1tZXIuVGFwKHsgZXZlbnQ6ICdkb3VibGV0YXAnLCB0YXBzOiAyIH0pKTtcbiAgICBoYW1tZXJNYW5hZ2VyLmFkZChuZXcgSGFtbWVyLlRhcCh7IGV2ZW50OiAnc2luZ2xldGFwJyB9KSk7XG4gICAgaGFtbWVyTWFuYWdlci5hZGQobmV3IEhhbW1lci5QYW4oeyBkaXJlY3Rpb246IEhhbW1lci5ESVJFQ1RJT05fQUxMIH0pKTtcbiAgICBoYW1tZXJNYW5hZ2VyLmFkZChuZXcgSGFtbWVyLlBpbmNoKCkpO1xuXG4gICAgaGFtbWVyTWFuYWdlci5nZXQoJ2RvdWJsZXRhcCcpLnJlY29nbml6ZVdpdGgoJ3NpbmdsZXRhcCcpO1xuICAgIGhhbW1lck1hbmFnZXIuZ2V0KCdzaW5nbGV0YXAnKS5yZXF1aXJlRmFpbHVyZSgnZG91YmxldGFwJyk7XG4gICAgaGFtbWVyTWFuYWdlci5nZXQoJ3BhbicpLnJlcXVpcmVGYWlsdXJlKCdwaW5jaCcpO1xuXG4gICAgaGFtbWVyTWFuYWdlci5vbignc2luZ2xldGFwJywgc2luZ2xlVGFwKTtcbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdkb3VibGV0YXAnLCBkb3VibGVUYXApO1xuXG4gICAgaGFtbWVyTWFuYWdlci5vbigncGFuc3RhcnQnLCBwYW5TdGFydCk7XG4gICAgaGFtbWVyTWFuYWdlci5vbigncGFubW92ZScsIHBhbk1vdmUpO1xuICAgIGhhbW1lck1hbmFnZXIub24oJ3BhbmVuZCcsIHBhbkVuZCk7XG5cbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdwaW5jaHN0YXJ0JywgcGluY2hTdGFydCk7XG4gICAgaGFtbWVyTWFuYWdlci5vbigncGluY2htb3ZlJywgcGluY2hNb3ZlKTtcbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdwaW5jaGVuZCcsIHBpbmNoRW5kKTtcbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdwaW5jaGNhbmNlbCcsIGZ1bmN0aW9uKCkgeyBoYW1tZXJNYW5hZ2VyLmdldCgncGFuJykuc2V0KHtlbmFibGU6IHRydWV9KTsgfSk7IC8vIG1ha2Ugc3VyZSBpdCdzIHJlZW5hYmxlZFxuICB9XG5cbiAgZnVuY3Rpb24gbmV3UHJlc3NlZCgpIHtcbiAgICBsb2coJ25ldyBwcmVzc2VkJyk7XG5cbiAgICBwYXBlci5wcm9qZWN0LmFjdGl2ZUxheWVyLnJlbW92ZUNoaWxkcmVuKCk7XG4gIH1cblxuICBmdW5jdGlvbiB1bmRvUHJlc3NlZCgpIHtcbiAgICBsb2coJ3VuZG8gcHJlc3NlZCcpO1xuICAgIGlmICghKE1PVkVTLmxlbmd0aCA+IDApKSB7XG4gICAgICBsb2coJ25vIG1vdmVzIHlldCcpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBsYXN0TW92ZSA9IE1PVkVTLnBvcCgpO1xuICAgIGxldCBpdGVtID0gcHJvamVjdC5nZXRJdGVtKHtcbiAgICAgIGlkOiBsYXN0TW92ZS5pZFxuICAgIH0pO1xuXG4gICAgaWYgKGl0ZW0pIHtcbiAgICAgIGl0ZW0udmlzaWJsZSA9IHRydWU7IC8vIG1ha2Ugc3VyZVxuICAgICAgc3dpdGNoKGxhc3RNb3ZlLnR5cGUpIHtcbiAgICAgICAgY2FzZSAnbmV3R3JvdXAnOlxuICAgICAgICAgIGxvZygncmVtb3ZpbmcgZ3JvdXAnKTtcbiAgICAgICAgICBpdGVtLnJlbW92ZSgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdmaWxsQ2hhbmdlJzpcbiAgICAgICAgICBpZiAobGFzdE1vdmUudHJhbnNwYXJlbnQpIHtcbiAgICAgICAgICAgIGl0ZW0uZmlsbENvbG9yID0gbGFzdE1vdmUuZmlsbDtcbiAgICAgICAgICAgIGl0ZW0uc3Ryb2tlQ29sb3IgPSBsYXN0TW92ZS5maWxsO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpdGVtLmZpbGxDb2xvciA9IHRyYW5zcGFyZW50O1xuICAgICAgICAgICAgaXRlbS5zdHJva2VDb2xvciA9IHRyYW5zcGFyZW50O1xuICAgICAgICAgIH1cbiAgICAgICAgY2FzZSAndHJhbnNmb3JtJzpcbiAgICAgICAgICBpZiAoISFsYXN0TW92ZS5wb3NpdGlvbikge1xuICAgICAgICAgICAgaXRlbS5wb3NpdGlvbiA9IGxhc3RNb3ZlLnBvc2l0aW9uXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghIWxhc3RNb3ZlLnJvdGF0aW9uKSB7XG4gICAgICAgICAgICBpdGVtLnJvdGF0aW9uID0gbGFzdE1vdmUucm90YXRpb247XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghIWxhc3RNb3ZlLnNjYWxlKSB7XG4gICAgICAgICAgICBpdGVtLnNjYWxlKGxhc3RNb3ZlLnNjYWxlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgbG9nKCd1bmtub3duIGNhc2UnKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbG9nKCdjb3VsZCBub3QgZmluZCBtYXRjaGluZyBpdGVtJyk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcGxheVByZXNzZWQoKSB7XG4gICAgbG9nKCdwbGF5IHByZXNzZWQnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRpcHNQcmVzc2VkKCkge1xuICAgIGxvZygndGlwcyBwcmVzc2VkJyk7XG4gIH1cblxuICBmdW5jdGlvbiBzaGFyZVByZXNzZWQoKSB7XG4gICAgbG9nKCdzaGFyZSBwcmVzc2VkJyk7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0TmV3KCkge1xuICAgICQoJy5tYWluLWNvbnRyb2xzIC5uZXcnKS5vbignY2xpY2sgdGFwIHRvdWNoJywgbmV3UHJlc3NlZCk7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0VW5kbygpIHtcbiAgICAkKCcubWFpbi1jb250cm9scyAudW5kbycpLm9uKCdjbGljaycsIHVuZG9QcmVzc2VkKTtcbiAgfVxuICBmdW5jdGlvbiBpbml0UGxheSgpIHtcbiAgICAkKCcubWFpbi1jb250cm9scyAucGxheScpLm9uKCdjbGljaycsIHBsYXlQcmVzc2VkKTtcbiAgfVxuICBmdW5jdGlvbiBpbml0VGlwcygpIHtcbiAgICAkKCcuYXV4LWNvbnRyb2xzIC50aXBzJykub24oJ2NsaWNrJywgdGlwc1ByZXNzZWQpO1xuICB9XG4gIGZ1bmN0aW9uIGluaXRTaGFyZSgpIHtcbiAgICAkKCcuYXV4LWNvbnRyb2xzIC5zaGFyZScpLm9uKCdjbGljaycsIHNoYXJlUHJlc3NlZCk7XG4gIH1cblxuICBmdW5jdGlvbiBkcmF3Q2lyY2xlKCkge1xuICAgIGxldCBjaXJjbGUgPSBuZXcgUGF0aC5DaXJjbGUoe1xuICAgICAgY2VudGVyOiBbNDAwLCA0MDBdLFxuICAgICAgcmFkaXVzOiAxMDAsXG4gICAgICBzdHJva2VDb2xvcjogJ2dyZWVuJyxcbiAgICAgIGZpbGxDb2xvcjogJ2dyZWVuJ1xuICAgIH0pO1xuICAgIGxldCBncm91cCA9IG5ldyBHcm91cChjaXJjbGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gbWFpbigpIHtcbiAgICBpbml0Q29udHJvbFBhbmVsKCk7XG4gICAgLy8gZHJhd0NpcmNsZSgpO1xuICAgIGluaXRWaWV3VmFycygpO1xuICB9XG5cbiAgbWFpbigpO1xufSk7XG4iLCJjb25zdCB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5jb25zdCBjb25maWcgPSByZXF1aXJlKCcuLy4uLy4uL2NvbmZpZycpO1xuXG5mdW5jdGlvbiBsb2coLi4udGhpbmcpIHtcbiAgdXRpbC5sb2coLi4udGhpbmcpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SWRlYWxHZW9tZXRyeShwYXRoRGF0YSwgc2lkZXMsIHNpbXBsaWZpZWRQYXRoKSB7XG4gIGNvbnN0IHRocmVzaG9sZERpc3QgPSAwLjA1ICogc2ltcGxpZmllZFBhdGgubGVuZ3RoO1xuXG4gIGxldCByZXR1cm5QYXRoID0gbmV3IFBhdGgoe1xuICAgIHN0cm9rZVdpZHRoOiA1LFxuICAgIHN0cm9rZUNvbG9yOiAncGluaydcbiAgfSk7XG5cbiAgbGV0IHRydWVkUGF0aCA9IG5ldyBQYXRoKHtcbiAgICBzdHJva2VXaWR0aDogNSxcbiAgICBzdHJva2VDb2xvcjogJ2dyZWVuJ1xuICB9KTtcblxuICAvLyBuZXcgUGF0aC5DaXJjbGUoe1xuICAvLyAgIGNlbnRlcjogc2ltcGxpZmllZFBhdGguZmlyc3RTZWdtZW50LnBvaW50LFxuICAvLyAgIHJhZGl1czogMyxcbiAgLy8gICBmaWxsQ29sb3I6ICdibGFjaydcbiAgLy8gfSk7XG5cbiAgbGV0IGZpcnN0UG9pbnQgPSBuZXcgUGF0aC5DaXJjbGUoe1xuICAgIGNlbnRlcjogc2ltcGxpZmllZFBhdGguZmlyc3RTZWdtZW50LnBvaW50LFxuICAgIHJhZGl1czogMTAsXG4gICAgc3Ryb2tlQ29sb3I6ICdibHVlJ1xuICB9KTtcblxuICBsZXQgbGFzdFBvaW50ID0gbmV3IFBhdGguQ2lyY2xlKHtcbiAgICBjZW50ZXI6IHNpbXBsaWZpZWRQYXRoLmxhc3RTZWdtZW50LnBvaW50LFxuICAgIHJhZGl1czogMTAsXG4gICAgc3Ryb2tlQ29sb3I6ICdyZWQnXG4gIH0pO1xuXG5cbiAgbGV0IGFuZ2xlLCBwcmV2QW5nbGUsIGFuZ2xlRGVsdGE7XG4gIEJhc2UuZWFjaChzaWRlcywgKHNpZGUsIGkpID0+IHtcbiAgICBsZXQgZmlyc3RQb2ludCA9IHNpZGVbMF07XG4gICAgbGV0IGxhc3RQb2ludCA9IHNpZGVbc2lkZS5sZW5ndGggLSAxXTtcblxuICAgIGFuZ2xlID0gTWF0aC5hdGFuMihsYXN0UG9pbnQueSAtIGZpcnN0UG9pbnQueSwgbGFzdFBvaW50LnggLSBmaXJzdFBvaW50LngpO1xuXG4gICAgaWYgKCEhcHJldkFuZ2xlKSB7XG4gICAgICBhbmdsZURlbHRhID0gdXRpbC5hbmdsZURlbHRhKGFuZ2xlLCBwcmV2QW5nbGUpO1xuICAgICAgY29uc29sZS5sb2coYW5nbGVEZWx0YSk7XG4gICAgICByZXR1cm5QYXRoLmFkZChmaXJzdFBvaW50KTtcbiAgICAgIHJldHVyblBhdGguYWRkKGxhc3RQb2ludCk7XG4gICAgfVxuXG4gICAgcHJldkFuZ2xlID0gYW5nbGU7XG4gIH0pO1xuXG4gIEJhc2UuZWFjaChzaW1wbGlmaWVkUGF0aC5zZWdtZW50cywgKHNlZ21lbnQsIGkpID0+IHtcbiAgICBsZXQgaW50ZWdlclBvaW50ID0gZ2V0SW50ZWdlclBvaW50KHNlZ21lbnQucG9pbnQpO1xuICAgIGxldCBuZWFyZXN0UG9pbnQgPSByZXR1cm5QYXRoLmdldE5lYXJlc3RQb2ludChpbnRlZ2VyUG9pbnQpO1xuICAgIC8vIGNvbnNvbGUubG9nKGludGVnZXJQb2ludC5nZXREaXN0YW5jZShuZWFyZXN0UG9pbnQpLCB0aHJlc2hvbGREaXN0KTtcbiAgICBpZiAoaW50ZWdlclBvaW50LmdldERpc3RhbmNlKG5lYXJlc3RQb2ludCkgPD0gdGhyZXNob2xkRGlzdCkge1xuICAgICAgdHJ1ZWRQYXRoLmFkZChuZWFyZXN0UG9pbnQpO1xuICAgICAgbmV3IFBhdGguQ2lyY2xlKHtcbiAgICAgICAgY2VudGVyOiBuZWFyZXN0UG9pbnQsXG4gICAgICAgIHJhZGl1czogMyxcbiAgICAgICAgZmlsbENvbG9yOiAnYmxhY2snXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coJ29mZiBwYXRoJyk7XG4gICAgICB0cnVlZFBhdGguYWRkKGludGVnZXJQb2ludCk7XG4gICAgICBuZXcgUGF0aC5DaXJjbGUoe1xuICAgICAgICBjZW50ZXI6IGludGVnZXJQb2ludCxcbiAgICAgICAgcmFkaXVzOiAzLFxuICAgICAgICBmaWxsQ29sb3I6ICdncmVlbidcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gdHJ1ZWRQYXRoLmFkZChzaW1wbGlmaWVkUGF0aC5sYXN0U2VnbWVudC5wb2ludCk7XG4gIC8vIG5ldyBQYXRoLkNpcmNsZSh7XG4gIC8vICAgY2VudGVyOiBzaW1wbGlmaWVkUGF0aC5sYXN0U2VnbWVudC5wb2ludCxcbiAgLy8gICByYWRpdXM6IDMsXG4gIC8vICAgZmlsbENvbG9yOiAnYmxhY2snXG4gIC8vIH0pO1xuXG4gIGlmIChzaW1wbGlmaWVkUGF0aC5jbG9zZWQpIHtcbiAgICB0cnVlZFBhdGguY2xvc2VkID0gdHJ1ZTtcbiAgfVxuXG4gIC8vIEJhc2UuZWFjaCh0cnVlZFBhdGgsIChwb2ludCwgaSkgPT4ge1xuICAvLyAgIHRydWVkUGF0aC5yZW1vdmVTZWdtZW50KGkpO1xuICAvLyB9KTtcblxuICByZXR1cm4gdHJ1ZWRQYXRoO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gT2xkZ2V0SWRlYWxHZW9tZXRyeShwYXRoRGF0YSwgcGF0aCkge1xuICBjb25zdCB0aHJlc2hvbGRBbmdsZSA9IE1hdGguUEkgLyAyO1xuICBjb25zdCB0aHJlc2hvbGREaXN0ID0gMC4xICogcGF0aC5sZW5ndGg7XG4gIC8vIGxvZyhwYXRoKTtcblxuICBsZXQgY291bnQgPSAwO1xuXG4gIGxldCBzaWRlcyA9IFtdO1xuICBsZXQgc2lkZSA9IFtdO1xuICBsZXQgcHJldjtcbiAgbGV0IHByZXZBbmdsZTtcblxuICAvLyBsb2coJ3RocmVzaG9sZEFuZ2xlJywgdGhyZXNob2xkQW5nbGUpO1xuXG4gIGxldCByZXR1cm5QYXRoID0gbmV3IFBhdGgoKTtcblxuICBCYXNlLmVhY2gocGF0aC5zZWdtZW50cywgKHNlZ21lbnQsIGkpID0+IHtcbiAgICBsZXQgaW50ZWdlclBvaW50ID0gZ2V0SW50ZWdlclBvaW50KHNlZ21lbnQucG9pbnQpO1xuICAgIGxldCBwb2ludFN0ciA9IHN0cmluZ2lmeVBvaW50KGludGVnZXJQb2ludCk7XG4gICAgbGV0IHBvaW50RGF0YTtcbiAgICBpZiAocG9pbnRTdHIgaW4gcGF0aERhdGEpIHtcbiAgICAgIHBvaW50RGF0YSA9IHBhdGhEYXRhW3BvaW50U3RyXTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IG5lYXJlc3RQb2ludCA9IGdldENsb3Nlc3RQb2ludEZyb21QYXRoRGF0YShwYXRoRGF0YSwgaW50ZWdlclBvaW50KTtcbiAgICAgIHBvaW50U3RyID0gc3RyaW5naWZ5UG9pbnQobmVhcmVzdFBvaW50KTtcblxuICAgICAgaWYgKHBvaW50U3RyIGluIHBhdGhEYXRhKSB7XG4gICAgICAgIHBvaW50RGF0YSA9IHBhdGhEYXRhW3BvaW50U3RyXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxvZygnY291bGQgbm90IGZpbmQgY2xvc2UgcG9pbnQnKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9pbnREYXRhKSB7XG4gICAgICByZXR1cm5QYXRoLmFkZChpbnRlZ2VyUG9pbnQpO1xuICAgICAgbmV3IFBhdGguQ2lyY2xlKHtcbiAgICAgICAgY2VudGVyOiBpbnRlZ2VyUG9pbnQsXG4gICAgICAgIHJhZGl1czogNSxcbiAgICAgICAgc3Ryb2tlQ29sb3I6IG5ldyBDb2xvcihpIC8gcGF0aC5zZWdtZW50cy5sZW5ndGgsIGkgLyBwYXRoLnNlZ21lbnRzLmxlbmd0aCwgaSAvIHBhdGguc2VnbWVudHMubGVuZ3RoKVxuICAgICAgfSk7XG4gICAgICBsb2cocG9pbnREYXRhLnBvaW50KTtcbiAgICAgIGlmICghcHJldikge1xuICAgICAgICAvLyBmaXJzdCBwb2ludFxuICAgICAgICAvLyBsb2coJ3B1c2hpbmcgZmlyc3QgcG9pbnQgdG8gc2lkZScpO1xuICAgICAgICBzaWRlLnB1c2gocG9pbnREYXRhKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGxldCBhbmdsZUZvbyA9IGludGVnZXJQb2ludC5nZXREaXJlY3RlZEFuZ2xlKHByZXYpO1xuICAgICAgICBsZXQgYW5nbGUgPSBNYXRoLmF0YW4yKGludGVnZXJQb2ludC55LCBpbnRlZ2VyUG9pbnQueCkgLSBNYXRoLmF0YW4yKHByZXYueSwgcHJldi54KTtcbiAgICAgICAgaWYgKGFuZ2xlIDwgMCkgYW5nbGUgKz0gKDIgKiBNYXRoLlBJKTsgLy8gbm9ybWFsaXplIHRvIFswLCAyz4ApXG4gICAgICAgIC8vIGxvZyhhbmdsZUZvbywgYW5nbGVCYXIpO1xuICAgICAgICAvLyBsZXQgYW5nbGUgPSBNYXRoLmF0YW4yKGludGVnZXJQb2ludC55IC0gcHJldi55LCBpbnRlZ2VyUG9pbnQueCAtIHByZXYueCk7XG4gICAgICAgIC8vIGxldCBsaW5lID0gbmV3IFBhdGguTGluZShwcmV2LCBpbnRlZ2VyUG9pbnQpO1xuICAgICAgICAvLyBsaW5lLnN0cm9rZVdpZHRoID0gNTtcbiAgICAgICAgLy8gbGluZS5zdHJva2VDb2xvciA9ICdwaW5rJztcbiAgICAgICAgLy8gbGluZS5yb3RhdGUodXRpbC5kZWcoTWF0aC5jb3MoYW5nbGUpICogTWF0aC5QSSAqIDIpKTtcbiAgICAgICAgLy8gbG9nKCdhbmdsZScsIGFuZ2xlKTtcbiAgICAgICAgaWYgKHR5cGVvZiBwcmV2QW5nbGUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgLy8gc2Vjb25kIHBvaW50XG4gICAgICAgICAgc2lkZS5wdXNoKHBvaW50RGF0YSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsZXQgYW5nbGVEaWZmZXJlbmNlID0gTWF0aC5wb3coYW5nbGUgLSBwcmV2QW5nbGUsIDIpO1xuICAgICAgICAgIGxvZygnYW5nbGVEaWZmZXJlbmNlJywgYW5nbGVEaWZmZXJlbmNlKTtcbiAgICAgICAgICBpZiAoYW5nbGVEaWZmZXJlbmNlIDw9IHRocmVzaG9sZEFuZ2xlKSB7XG4gICAgICAgICAgICAvLyBzYW1lIHNpZGVcbiAgICAgICAgICAgIC8vIGxvZygncHVzaGluZyBwb2ludCB0byBzYW1lIHNpZGUnKTtcbiAgICAgICAgICAgIHNpZGUucHVzaChwb2ludERhdGEpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBuZXcgc2lkZVxuICAgICAgICAgICAgLy8gbG9nKCduZXcgc2lkZScpO1xuICAgICAgICAgICAgc2lkZXMucHVzaChzaWRlKTtcbiAgICAgICAgICAgIHNpZGUgPSBbcG9pbnREYXRhXTtcblxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByZXZBbmdsZSA9IGFuZ2xlO1xuICAgICAgfVxuXG4gICAgICBwcmV2ID0gaW50ZWdlclBvaW50O1xuICAgICAgY291bnQrKztcbiAgICB9IGVsc2Uge1xuICAgICAgbG9nKCdubyBkYXRhJyk7XG4gICAgfVxuICB9KTtcblxuICAvLyBsb2coY291bnQpO1xuXG4gIHNpZGVzLnB1c2goc2lkZSk7XG5cbiAgcmV0dXJuIHNpZGVzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SW50ZWdlclBvaW50KHBvaW50KSB7XG4gIHJldHVybiBuZXcgUG9pbnQoTWF0aC5mbG9vcihwb2ludC54KSwgTWF0aC5mbG9vcihwb2ludC55KSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHJpbmdpZnlQb2ludChwb2ludCkge1xuICByZXR1cm4gYCR7TWF0aC5mbG9vcihwb2ludC54KX0sJHtNYXRoLmZsb29yKHBvaW50LnkpfWA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVBvaW50KHBvaW50U3RyKSB7XG4gIGxldCBzcGxpdCA9IHBvaW50U3RyLnNwbGl0KCcsJykubWFwKChudW0pID0+IE1hdGguZmxvb3IobnVtKSk7XG5cbiAgaWYgKHNwbGl0Lmxlbmd0aCA+PSAyKSB7XG4gICAgcmV0dXJuIG5ldyBQb2ludChzcGxpdFswXSwgc3BsaXRbMV0pO1xuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDbG9zZXN0UG9pbnRGcm9tUGF0aERhdGEocGF0aERhdGEsIHBvaW50KSB7XG4gIGxldCBsZWFzdERpc3RhbmNlLCBjbG9zZXN0UG9pbnQ7XG5cbiAgQmFzZS5lYWNoKHBhdGhEYXRhLCAoZGF0dW0sIGkpID0+IHtcbiAgICBsZXQgZGlzdGFuY2UgPSBwb2ludC5nZXREaXN0YW5jZShkYXR1bS5wb2ludCk7XG4gICAgaWYgKCFsZWFzdERpc3RhbmNlIHx8IGRpc3RhbmNlIDwgbGVhc3REaXN0YW5jZSkge1xuICAgICAgbGVhc3REaXN0YW5jZSA9IGRpc3RhbmNlO1xuICAgICAgY2xvc2VzdFBvaW50ID0gZGF0dW0ucG9pbnQ7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gY2xvc2VzdFBvaW50IHx8IHBvaW50O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29tcHV0ZWRDb3JuZXJzKHBhdGgpIHtcbiAgY29uc3QgdGhyZXNob2xkQW5nbGUgPSB1dGlsLnJhZChjb25maWcuc2hhcGUuY29ybmVyVGhyZXNob2xkRGVnKTtcbiAgY29uc3QgdGhyZXNob2xkRGlzdGFuY2UgPSAwLjEgKiBwYXRoLmxlbmd0aDtcblxuICBsZXQgY29ybmVycyA9IFtdO1xuXG4gIGlmIChwYXRoLmxlbmd0aCA+IDApIHtcbiAgICBsZXQgcG9pbnQsIHByZXY7XG4gICAgbGV0IGFuZ2xlLCBwcmV2QW5nbGUsIGFuZ2xlRGVsdGE7XG5cbiAgICBCYXNlLmVhY2gocGF0aC5zZWdtZW50cywgKHNlZ21lbnQsIGkpID0+IHtcbiAgICAgIGxldCBwb2ludCA9IGdldEludGVnZXJQb2ludChzZWdtZW50LnBvaW50KTtcbiAgICAgIGlmICghIXByZXYpIHtcbiAgICAgICAgbGV0IGFuZ2xlID0gTWF0aC5hdGFuMihwb2ludC55IC0gcHJldi55LCBwb2ludC54IC0gcHJldi54KTtcbiAgICAgICAgaWYgKGFuZ2xlIDwgMCkgYW5nbGUgKz0gKDIgKiBNYXRoLlBJKTsgLy8gbm9ybWFsaXplIHRvIFswLCAyz4ApXG4gICAgICAgIGlmICghIXByZXZBbmdsZSkge1xuICAgICAgICAgIGFuZ2xlRGVsdGEgPSB1dGlsLmFuZ2xlRGVsdGEoYW5nbGUsIHByZXZBbmdsZSk7XG4gICAgICAgICAgaWYgKGFuZ2xlRGVsdGEgPj0gdGhyZXNob2xkQW5nbGUpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdjb3JuZXInKTtcbiAgICAgICAgICAgIC8vIG5ldyBQYXRoLkNpcmNsZSh7XG4gICAgICAgICAgICAvLyAgIGNlbnRlcjogcHJldixcbiAgICAgICAgICAgIC8vICAgcmFkaXVzOiAxMCxcbiAgICAgICAgICAgIC8vICAgZmlsbENvbG9yOiAncGluaydcbiAgICAgICAgICAgIC8vIH0pO1xuICAgICAgICAgICAgY29ybmVycy5wdXNoKHByZXYpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhhbmdsZURlbHRhKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwcmV2QW5nbGUgPSBhbmdsZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGZpcnN0IHBvaW50XG4gICAgICAgIGNvcm5lcnMucHVzaChwb2ludCk7XG4gICAgICAgIC8vIG5ldyBQYXRoLkNpcmNsZSh7XG4gICAgICAgIC8vICAgY2VudGVyOiBwb2ludCxcbiAgICAgICAgLy8gICByYWRpdXM6IDEwLFxuICAgICAgICAvLyAgIGZpbGxDb2xvcjogJ3BpbmsnXG4gICAgICAgIC8vIH0pXG4gICAgICB9XG4gICAgICBwcmV2ID0gcG9pbnQ7XG4gICAgfSk7XG5cbiAgICBsZXQgbGFzdFNlZ21lbnRQb2ludCA9IGdldEludGVnZXJQb2ludChwYXRoLmxhc3RTZWdtZW50LnBvaW50KTtcbiAgICBjb3JuZXJzLnB1c2gobGFzdFNlZ21lbnRQb2ludCk7XG5cbiAgICBsZXQgcmV0dXJuQ29ybmVycyA9IFtdO1xuICAgIGxldCBza2lwcGVkSWRzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3JuZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgcG9pbnQgPSBjb3JuZXJzW2ldO1xuXG4gICAgICBpZiAoaSAhPT0gMCkge1xuICAgICAgICBsZXQgZGlzdCA9IHBvaW50LmdldERpc3RhbmNlKHByZXYpO1xuICAgICAgICBsZXQgY2xvc2VzdFBvaW50cyA9IFtdO1xuICAgICAgICB3aGlsZSAoZGlzdCA8IHRocmVzaG9sZERpc3RhbmNlKSB7XG4gICAgICAgICAgY2xvc2VzdFBvaW50cy5wdXNoKHtcbiAgICAgICAgICAgIHBvaW50OiBwb2ludCxcbiAgICAgICAgICAgIGluZGV4OiBpXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBpZiAoaSA8IGNvcm5lcnMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgcHJldiA9IHBvaW50O1xuICAgICAgICAgICAgcG9pbnQgPSBjb3JuZXJzW2ldO1xuICAgICAgICAgICAgZGlzdCA9IHBvaW50LmdldERpc3RhbmNlKHByZXYpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNsb3Nlc3RQb2ludHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGxldCBbc3VtWCwgc3VtWV0gPSBbMCwgMF07XG5cbiAgICAgICAgICBCYXNlLmVhY2goY2xvc2VzdFBvaW50cywgKHBvaW50T2JqKSA9PiB7XG4gICAgICAgICAgICBzdW1YICs9IHBvaW50T2JqLnBvaW50Lng7XG4gICAgICAgICAgICBzdW1ZICs9IHBvaW50T2JqLnBvaW50Lnk7XG4gICAgICAgICAgfSk7XG5cblxuICAgICAgICAgIGxldCBbYXZnWCwgYXZnWV0gPSBbc3VtWCAvIGNsb3Nlc3RQb2ludHMubGVuZ3RoLCBzdW1ZIC8gY2xvc2VzdFBvaW50cy5sZW5ndGhdO1xuICAgICAgICAgIHJldHVybkNvcm5lcnMucHVzaChuZXcgUG9pbnQoYXZnWCwgYXZnWSkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm5Db3JuZXJzLnB1c2gocG9pbnQpO1xuICAgICAgfVxuXG4gICAgICBwcmV2ID0gcG9pbnQ7XG4gICAgfVxuXG4gICAgLy8gQmFzZS5lYWNoKGNvcm5lcnMsIChjb3JuZXIsIGkpID0+IHtcbiAgICAvLyAgIGxldCBwb2ludCA9IGNvcm5lcjtcbiAgICAvL1xuICAgIC8vICAgaWYgKGkgIT09IDApIHtcbiAgICAvLyAgICAgbGV0IGRpc3QgPSBwb2ludC5nZXREaXN0YW5jZShwcmV2KTtcbiAgICAvLyAgICAgbGV0IGNsb3Nlc3RQb2ludHMgPSBbXTtcbiAgICAvLyAgICAgbGV0IGluZGV4ID0gaTtcbiAgICAvLyAgICAgd2hpbGUgKGRpc3QgPCB0aHJlc2hvbGREaXN0YW5jZSkge1xuICAgIC8vICAgICAgIGNsb3Nlc3RQb2ludHMucHVzaCh7XG4gICAgLy8gICAgICAgICBwb2ludDogcG9pbnQsXG4gICAgLy8gICAgICAgICBpbmRleDogaW5kZXhcbiAgICAvLyAgICAgICB9KTtcbiAgICAvLyAgICAgfVxuICAgIC8vICAgICBjb25zb2xlLmxvZyhkaXN0LCB0aHJlc2hvbGREaXN0YW5jZSk7XG4gICAgLy8gICAgIHdoaWxlIChkaXN0IDwgdGhyZXNob2xkRGlzdGFuY2UpIHtcbiAgICAvL1xuICAgIC8vICAgICB9XG4gICAgLy8gICB9IGVsc2Uge1xuICAgIC8vICAgICByZXR1cm5Db3JuZXJzLnB1c2goY29ybmVyKTtcbiAgICAvLyAgIH1cbiAgICAvL1xuICAgIC8vICAgcHJldiA9IHBvaW50O1xuICAgIC8vIH0pO1xuICAgIC8vIG5ldyBQYXRoLkNpcmNsZSh7XG4gICAgLy8gICBjZW50ZXI6IGxhc3RTZWdtZW50UG9pbnQsXG4gICAgLy8gICByYWRpdXM6IDEwLFxuICAgIC8vICAgZmlsbENvbG9yOiAncGluaydcbiAgICAvLyB9KTtcbiAgfVxuXG4gIHJldHVybiBjb3JuZXJzO1xufVxuIiwiY29uc3QgY29uZmlnID0gcmVxdWlyZSgnLi8uLi8uLi9jb25maWcnKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGxvZyguLi50aGluZykge1xuICBpZiAoY29uZmlnLmxvZykge1xuICAgIGNvbnNvbGUubG9nKC4uLnRoaW5nKTtcbiAgfVxufVxuXG4vLyBDb252ZXJ0cyBmcm9tIGRlZ3JlZXMgdG8gcmFkaWFucy5cbmV4cG9ydCBmdW5jdGlvbiByYWQoZGVncmVlcykge1xuICByZXR1cm4gZGVncmVlcyAqIE1hdGguUEkgLyAxODA7XG59O1xuXG4vLyBDb252ZXJ0cyBmcm9tIHJhZGlhbnMgdG8gZGVncmVlcy5cbmV4cG9ydCBmdW5jdGlvbiBkZWcocmFkaWFucykge1xuICByZXR1cm4gcmFkaWFucyAqIDE4MCAvIE1hdGguUEk7XG59O1xuXG4vLyByZXR1cm5zIGFic29sdXRlIHZhbHVlIG9mIHRoZSBkZWx0YSBvZiB0d28gYW5nbGVzIGluIHJhZGlhbnNcbmV4cG9ydCBmdW5jdGlvbiBhbmdsZURlbHRhKHgsIHkpIHtcbiAgcmV0dXJuIE1hdGguYWJzKE1hdGguYXRhbjIoTWF0aC5zaW4oeSAtIHgpLCBNYXRoLmNvcyh5IC0geCkpKTs7XG59XG5cbi8vIGRpc3RhbmNlIGJldHdlZW4gdHdvIHBvaW50c1xuZXhwb3J0IGZ1bmN0aW9uIGRlbHRhKHAxLCBwMikge1xuICByZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KHAxLnggLSBwMi54LCAyKSArIE1hdGgucG93KHAxLnkgLSBwMi55LCAyKSk7IC8vIHB5dGhhZ29yZWFuIVxufVxuXG4vLyByZXR1cm5zIGFuIGFycmF5IG9mIHRoZSBpbnRlcmlvciBjdXJ2ZXMgb2YgYSBnaXZlbiBjb21wb3VuZCBwYXRoXG5leHBvcnQgZnVuY3Rpb24gZmluZEludGVyaW9yQ3VydmVzKHBhdGgpIHtcbiAgbGV0IGludGVyaW9yQ3VydmVzID0gW107XG4gIGlmICghcGF0aCB8fCAhcGF0aC5jaGlsZHJlbiB8fCAhcGF0aC5jaGlsZHJlbi5sZW5ndGgpIHJldHVybjtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHBhdGguY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICBsZXQgY2hpbGQgPSBwYXRoLmNoaWxkcmVuW2ldO1xuXG4gICAgaWYgKGNoaWxkLmNsb3NlZCl7XG4gICAgICBpbnRlcmlvckN1cnZlcy5wdXNoKG5ldyBQYXRoKGNoaWxkLnNlZ21lbnRzKSk7XG4gICAgfVxuICB9XG5cbiAgcGF0aC5yZW1vdmUoKTtcbiAgcmV0dXJuIGludGVyaW9yQ3VydmVzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJ1ZUdyb3VwKGdyb3VwLCBjb3JuZXJzKSB7XG4gIGxldCBtaWRkbGUgPSBncm91cC5fbmFtZWRDaGlsZHJlbi5taWRkbGVbMF07XG5cbiAgbGV0IGludGVyc2VjdGlvbnMgPSBtaWRkbGUuZ2V0SW50ZXJzZWN0aW9ucygpO1xuICBsZXQgdHJ1ZU5lY2Vzc2FyeSA9IGZhbHNlO1xuXG4gIGxldCBtaWRkbGVDb3B5ID0gbWlkZGxlLmNsb25lKCk7XG4gIG1pZGRsZUNvcHkudmlzaWJsZSA9IGZhbHNlO1xuICAvLyBkZWJ1Z2dlcjtcblxuICBpZiAoaW50ZXJzZWN0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgLy8gc2VlIGlmIHdlIGNhbiB0cmltIHRoZSBwYXRoIHdoaWxlIG1haW50YWluaW5nIGludGVyc2VjdGlvbnNcbiAgICAvLyBsb2coJ2ludGVyc2VjdGlvbnMhJyk7XG4gICAgLy8gbWlkZGxlQ29weS5zdHJva2VDb2xvciA9ICd5ZWxsb3cnO1xuICAgIFttaWRkbGVDb3B5LCB0cnVlTmVjZXNzYXJ5XSA9IHRyaW1QYXRoKG1pZGRsZUNvcHksIG1pZGRsZSk7XG4gICAgLy8gbWlkZGxlQ29weS5zdHJva2VDb2xvciA9ICdvcmFuZ2UnO1xuICB9IGVsc2Uge1xuICAgIC8vIGV4dGVuZCBmaXJzdCBhbmQgbGFzdCBzZWdtZW50IGJ5IHRocmVzaG9sZCwgc2VlIGlmIGludGVyc2VjdGlvblxuICAgIC8vIGxvZygnbm8gaW50ZXJzZWN0aW9ucywgZXh0ZW5kaW5nIGZpcnN0IScpO1xuICAgIC8vIG1pZGRsZUNvcHkuc3Ryb2tlQ29sb3IgPSAneWVsbG93JztcbiAgICBtaWRkbGVDb3B5ID0gZXh0ZW5kUGF0aChtaWRkbGVDb3B5KTtcbiAgICAvLyBtaWRkbGVDb3B5LnN0cm9rZUNvbG9yID0gJ29yYW5nZSc7XG4gICAgbGV0IGludGVyc2VjdGlvbnMgPSBtaWRkbGVDb3B5LmdldEludGVyc2VjdGlvbnMoKTtcbiAgICBpZiAoaW50ZXJzZWN0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAvLyBtaWRkbGVDb3B5LnN0cm9rZUNvbG9yID0gJ3BpbmsnO1xuICAgICAgW21pZGRsZUNvcHksIHRydWVOZWNlc3NhcnldID0gdHJpbVBhdGgobWlkZGxlQ29weSwgbWlkZGxlKTtcbiAgICAgIC8vIG1pZGRsZUNvcHkuc3Ryb2tlQ29sb3IgPSAnZ3JlZW4nO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBtaWRkbGVDb3B5LnN0cm9rZUNvbG9yID0gJ3JlZCc7XG4gICAgICBtaWRkbGVDb3B5ID0gcmVtb3ZlUGF0aEV4dGVuc2lvbnMobWlkZGxlQ29weSk7XG4gICAgICAvLyBtaWRkbGVDb3B5LnN0cm9rZUNvbG9yID0gJ2JsdWUnO1xuICAgIH1cbiAgfVxuXG4gIG1pZGRsZUNvcHkubmFtZSA9ICdtaWRkbGUnOyAvLyBtYWtlIHN1cmVcbiAgbWlkZGxlQ29weS52aXNpYmxlID0gdHJ1ZTtcblxuICAvLyBncm91cC5hZGRDaGlsZChtaWRkbGVDb3B5KTtcbiAgLy8gZ3JvdXAuX25hbWVkQ2hpbGRyZW4ubWlkZGxlWzBdID0gbWlkZGxlQ29weTtcbiAgZ3JvdXAuX25hbWVkQ2hpbGRyZW4ubWlkZGxlWzBdLnJlcGxhY2VXaXRoKG1pZGRsZUNvcHkpO1xuXG5cbiAgcmV0dXJuIFtncm91cCwgdHJ1ZU5lY2Vzc2FyeV07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleHRlbmRQYXRoKHBhdGgpIHtcbiAgaWYgKHBhdGgubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IGxlbmd0aFRvbGVyYW5jZSA9IGNvbmZpZy5zaGFwZS50cmltbWluZ1RocmVzaG9sZCAqIHBhdGgubGVuZ3RoO1xuXG4gICAgbGV0IGZpcnN0U2VnbWVudCA9IHBhdGguZmlyc3RTZWdtZW50O1xuICAgIGxldCBuZXh0U2VnbWVudCA9IGZpcnN0U2VnbWVudC5uZXh0O1xuICAgIGxldCBzdGFydEFuZ2xlID0gTWF0aC5hdGFuMihuZXh0U2VnbWVudC5wb2ludC55IC0gZmlyc3RTZWdtZW50LnBvaW50LnksIG5leHRTZWdtZW50LnBvaW50LnggLSBmaXJzdFNlZ21lbnQucG9pbnQueCk7IC8vIHJhZFxuICAgIGxldCBpbnZlcnNlU3RhcnRBbmdsZSA9IHN0YXJ0QW5nbGUgKyBNYXRoLlBJO1xuICAgIGxldCBleHRlbmRlZFN0YXJ0UG9pbnQgPSBuZXcgUG9pbnQoZmlyc3RTZWdtZW50LnBvaW50LnggKyAoTWF0aC5jb3MoaW52ZXJzZVN0YXJ0QW5nbGUpICogbGVuZ3RoVG9sZXJhbmNlKSwgZmlyc3RTZWdtZW50LnBvaW50LnkgKyAoTWF0aC5zaW4oaW52ZXJzZVN0YXJ0QW5nbGUpICogbGVuZ3RoVG9sZXJhbmNlKSk7XG4gICAgcGF0aC5pbnNlcnQoMCwgZXh0ZW5kZWRTdGFydFBvaW50KTtcblxuICAgIGxldCBsYXN0U2VnbWVudCA9IHBhdGgubGFzdFNlZ21lbnQ7XG4gICAgbGV0IHBlblNlZ21lbnQgPSBsYXN0U2VnbWVudC5wcmV2aW91czsgLy8gcGVudWx0aW1hdGVcbiAgICBsZXQgZW5kQW5nbGUgPSBNYXRoLmF0YW4yKGxhc3RTZWdtZW50LnBvaW50LnkgLSBwZW5TZWdtZW50LnBvaW50LnksIGxhc3RTZWdtZW50LnBvaW50LnggLSBwZW5TZWdtZW50LnBvaW50LngpOyAvLyByYWRcbiAgICBsZXQgZXh0ZW5kZWRFbmRQb2ludCA9IG5ldyBQb2ludChsYXN0U2VnbWVudC5wb2ludC54ICsgKE1hdGguY29zKGVuZEFuZ2xlKSAqIGxlbmd0aFRvbGVyYW5jZSksIGxhc3RTZWdtZW50LnBvaW50LnkgKyAoTWF0aC5zaW4oZW5kQW5nbGUpICogbGVuZ3RoVG9sZXJhbmNlKSk7XG4gICAgcGF0aC5hZGQoZXh0ZW5kZWRFbmRQb2ludCk7XG4gIH1cbiAgcmV0dXJuIHBhdGg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cmltUGF0aChwYXRoLCBvcmlnaW5hbCkge1xuICAvLyBvcmlnaW5hbFBhdGguc3Ryb2tlQ29sb3IgPSAncGluayc7XG4gIHRyeSB7XG4gICAgbGV0IGludGVyc2VjdGlvbnMgPSBwYXRoLmdldEludGVyc2VjdGlvbnMoKTtcbiAgICBsZXQgZGl2aWRlZFBhdGggPSBwYXRoLnJlc29sdmVDcm9zc2luZ3MoKTtcblxuICAgIGlmIChpbnRlcnNlY3Rpb25zLmxlbmd0aCA+IDEpIHtcbiAgICAgIHJldHVybiBbb3JpZ2luYWwsIGZhbHNlXTsgLy8gbW9yZSB0aGFuIG9uZSBpbnRlcnNlY3Rpb24sIGRvbid0IHdvcnJ5IGFib3V0IHRyaW1taW5nXG4gICAgfVxuXG4gICAgY29uc3QgZXh0ZW5kaW5nVGhyZXNob2xkID0gY29uZmlnLnNoYXBlLmV4dGVuZGluZ1RocmVzaG9sZDtcbiAgICBjb25zdCB0b3RhbExlbmd0aCA9IHBhdGgubGVuZ3RoO1xuXG4gICAgLy8gd2Ugd2FudCB0byByZW1vdmUgYWxsIGNsb3NlZCBsb29wcyBmcm9tIHRoZSBwYXRoLCBzaW5jZSB0aGVzZSBhcmUgbmVjZXNzYXJpbHkgaW50ZXJpb3IgYW5kIG5vdCBmaXJzdCBvciBsYXN0XG4gICAgQmFzZS5lYWNoKGRpdmlkZWRQYXRoLmNoaWxkcmVuLCAoY2hpbGQsIGkpID0+IHtcbiAgICAgIGlmIChjaGlsZC5jbG9zZWQpIHtcbiAgICAgICAgLy8gbG9nKCdzdWJ0cmFjdGluZyBjbG9zZWQgY2hpbGQnKTtcbiAgICAgICAgZGl2aWRlZFBhdGggPSBkaXZpZGVkUGF0aC5zdWJ0cmFjdChjaGlsZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBkaXZpZGVkUGF0aCA9IGRpdmlkZWRQYXRoLnVuaXRlKGNoaWxkKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIGxvZyhkaXZpZGVkUGF0aCk7XG5cbiAgICBpZiAoISFkaXZpZGVkUGF0aC5jaGlsZHJlbiAmJiBkaXZpZGVkUGF0aC5jaGlsZHJlbi5sZW5ndGggPiAxKSB7XG4gICAgICAvLyBkaXZpZGVkIHBhdGggaXMgYSBjb21wb3VuZCBwYXRoXG4gICAgICBsZXQgdW5pdGVkRGl2aWRlZFBhdGggPSBuZXcgUGF0aCgpO1xuICAgICAgLy8gdW5pdGVkRGl2aWRlZFBhdGguY29weUF0dHJpYnV0ZXMoZGl2aWRlZFBhdGgpO1xuICAgICAgLy8gbG9nKCdiZWZvcmUnLCB1bml0ZWREaXZpZGVkUGF0aCk7XG4gICAgICBCYXNlLmVhY2goZGl2aWRlZFBhdGguY2hpbGRyZW4sIChjaGlsZCwgaSkgPT4ge1xuICAgICAgICBpZiAoIWNoaWxkLmNsb3NlZCkge1xuICAgICAgICAgIHVuaXRlZERpdmlkZWRQYXRoID0gdW5pdGVkRGl2aWRlZFBhdGgudW5pdGUoY2hpbGQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGRpdmlkZWRQYXRoID0gdW5pdGVkRGl2aWRlZFBhdGg7XG4gICAgICAvLyBsb2coJ2FmdGVyJywgdW5pdGVkRGl2aWRlZFBhdGgpO1xuICAgICAgLy8gcmV0dXJuO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBsb2coJ2RpdmlkZWRQYXRoIGhhcyBvbmUgY2hpbGQnKTtcbiAgICB9XG5cbiAgICBpZiAoaW50ZXJzZWN0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAvLyB3ZSBoYXZlIHRvIGdldCB0aGUgbmVhcmVzdCBsb2NhdGlvbiBiZWNhdXNlIHRoZSBleGFjdCBpbnRlcnNlY3Rpb24gcG9pbnQgaGFzIGFscmVhZHkgYmVlbiByZW1vdmVkIGFzIGEgcGFydCBvZiByZXNvbHZlQ3Jvc3NpbmdzKClcbiAgICAgIGxldCBmaXJzdEludGVyc2VjdGlvbiA9IGRpdmlkZWRQYXRoLmdldE5lYXJlc3RMb2NhdGlvbihpbnRlcnNlY3Rpb25zWzBdLnBvaW50KTtcbiAgICAgIC8vIGxvZyhkaXZpZGVkUGF0aCk7XG4gICAgICBsZXQgcmVzdCA9IGRpdmlkZWRQYXRoLnNwbGl0QXQoZmlyc3RJbnRlcnNlY3Rpb24pOyAvLyBkaXZpZGVkUGF0aCBpcyBub3cgdGhlIGZpcnN0IHNlZ21lbnRcbiAgICAgIGxldCBmaXJzdFNlZ21lbnQgPSBkaXZpZGVkUGF0aDtcbiAgICAgIGxldCBsYXN0U2VnbWVudDtcblxuICAgICAgLy8gZmlyc3RTZWdtZW50LnN0cm9rZUNvbG9yID0gJ3BpbmsnO1xuXG4gICAgICAvLyBsZXQgY2lyY2xlT25lID0gbmV3IFBhdGguQ2lyY2xlKHtcbiAgICAgIC8vICAgY2VudGVyOiBmaXJzdEludGVyc2VjdGlvbi5wb2ludCxcbiAgICAgIC8vICAgcmFkaXVzOiA1LFxuICAgICAgLy8gICBzdHJva2VDb2xvcjogJ3JlZCdcbiAgICAgIC8vIH0pO1xuXG4gICAgICAvLyBsb2coaW50ZXJzZWN0aW9ucyk7XG4gICAgICBpZiAoaW50ZXJzZWN0aW9ucy5sZW5ndGggPiAxKSB7XG4gICAgICAgIC8vIGxvZygnZm9vJyk7XG4gICAgICAgIC8vIHJlc3QucmV2ZXJzZSgpOyAvLyBzdGFydCBmcm9tIGVuZFxuICAgICAgICBsZXQgbGFzdEludGVyc2VjdGlvbiA9IHJlc3QuZ2V0TmVhcmVzdExvY2F0aW9uKGludGVyc2VjdGlvbnNbaW50ZXJzZWN0aW9ucy5sZW5ndGggLSAxXS5wb2ludCk7XG4gICAgICAgIC8vIGxldCBjaXJjbGVUd28gPSBuZXcgUGF0aC5DaXJjbGUoe1xuICAgICAgICAvLyAgIGNlbnRlcjogbGFzdEludGVyc2VjdGlvbi5wb2ludCxcbiAgICAgICAgLy8gICByYWRpdXM6IDUsXG4gICAgICAgIC8vICAgc3Ryb2tlQ29sb3I6ICdncmVlbidcbiAgICAgICAgLy8gfSk7XG4gICAgICAgIGxhc3RTZWdtZW50ID0gcmVzdC5zcGxpdEF0KGxhc3RJbnRlcnNlY3Rpb24pOyAvLyByZXN0IGlzIG5vdyBldmVyeXRoaW5nIEJVVCB0aGUgZmlyc3QgYW5kIGxhc3Qgc2VnbWVudHNcbiAgICAgICAgaWYgKCFsYXN0U2VnbWVudCB8fCAhbGFzdFNlZ21lbnQubGVuZ3RoKSBsYXN0U2VnbWVudCA9IHJlc3Q7XG4gICAgICAgIHJlc3QucmV2ZXJzZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGFzdFNlZ21lbnQgPSByZXN0O1xuICAgICAgfVxuXG4gICAgICBpZiAoISFmaXJzdFNlZ21lbnQgJiYgZmlyc3RTZWdtZW50Lmxlbmd0aCA8PSBleHRlbmRpbmdUaHJlc2hvbGQgKiB0b3RhbExlbmd0aCkge1xuICAgICAgICBwYXRoID0gcGF0aC5zdWJ0cmFjdChmaXJzdFNlZ21lbnQpO1xuICAgICAgICBpZiAocGF0aC5jbGFzc05hbWUgPT09ICdDb21wb3VuZFBhdGgnKSB7XG4gICAgICAgICAgQmFzZS5lYWNoKHBhdGguY2hpbGRyZW4sIChjaGlsZCwgaSkgPT4ge1xuICAgICAgICAgICAgaWYgKCFjaGlsZC5jbG9zZWQpIHtcbiAgICAgICAgICAgICAgY2hpbGQucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKCEhbGFzdFNlZ21lbnQgJiYgbGFzdFNlZ21lbnQubGVuZ3RoIDw9IGV4dGVuZGluZ1RocmVzaG9sZCAqIHRvdGFsTGVuZ3RoKSB7XG4gICAgICAgIHBhdGggPSBwYXRoLnN1YnRyYWN0KGxhc3RTZWdtZW50KTtcbiAgICAgICAgaWYgKHBhdGguY2xhc3NOYW1lID09PSAnQ29tcG91bmRQYXRoJykge1xuICAgICAgICAgIEJhc2UuZWFjaChwYXRoLmNoaWxkcmVuLCAoY2hpbGQsIGkpID0+IHtcbiAgICAgICAgICAgIGlmICghY2hpbGQuY2xvc2VkKSB7XG4gICAgICAgICAgICAgIGNoaWxkLnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gdGhpcyBpcyBoYWNreSBidXQgSSdtIG5vdCBzdXJlIGhvdyB0byBnZXQgYXJvdW5kIGl0XG4gICAgLy8gc29tZXRpbWVzIHBhdGguc3VidHJhY3QoKSByZXR1cm5zIGEgY29tcG91bmQgcGF0aCwgd2l0aCBjaGlsZHJlbiBjb25zaXN0aW5nIG9mIHRoZSBjbG9zZWQgcGF0aCBJIHdhbnQgYW5kIGFub3RoZXIgZXh0cmFuZW91cyBjbG9zZWQgcGF0aFxuICAgIC8vIGl0IGFwcGVhcnMgdGhhdCB0aGUgY29ycmVjdCBwYXRoIGFsd2F5cyBoYXMgYSBoaWdoZXIgdmVyc2lvbiwgdGhvdWdoIEknbSBub3QgMTAwJSBzdXJlIHRoYXQgdGhpcyBpcyBhbHdheXMgdGhlIGNhc2VcblxuICAgIGlmIChwYXRoLmNsYXNzTmFtZSA9PT0gJ0NvbXBvdW5kUGF0aCcgJiYgcGF0aC5jaGlsZHJlbi5sZW5ndGggPiAwKSB7XG4gICAgICBpZiAocGF0aC5jaGlsZHJlbi5sZW5ndGggPiAxKSB7XG4gICAgICAgIGxldCBsYXJnZXN0Q2hpbGQ7XG4gICAgICAgIGxldCBsYXJnZXN0Q2hpbGRBcmVhID0gMDtcblxuICAgICAgICBCYXNlLmVhY2gocGF0aC5jaGlsZHJlbiwgKGNoaWxkLCBpKSA9PiB7XG4gICAgICAgICAgaWYgKGNoaWxkLmFyZWEgPiBsYXJnZXN0Q2hpbGRBcmVhKSB7XG4gICAgICAgICAgICBsYXJnZXN0Q2hpbGRBcmVhID0gY2hpbGQuYXJlYTtcbiAgICAgICAgICAgIGxhcmdlc3RDaGlsZCA9IGNoaWxkO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGxhcmdlc3RDaGlsZCkge1xuICAgICAgICAgIHBhdGggPSBsYXJnZXN0Q2hpbGQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcGF0aCA9IHBhdGguY2hpbGRyZW5bMF07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhdGggPSBwYXRoLmNoaWxkcmVuWzBdO1xuICAgICAgfVxuICAgICAgLy8gbG9nKHBhdGgpO1xuICAgICAgLy8gbG9nKHBhdGgubGFzdENoaWxkKTtcbiAgICAgIC8vIHBhdGguZmlyc3RDaGlsZC5zdHJva2VDb2xvciA9ICdwaW5rJztcbiAgICAgIC8vIHBhdGgubGFzdENoaWxkLnN0cm9rZUNvbG9yID0gJ2dyZWVuJztcbiAgICAgIC8vIHBhdGggPSBwYXRoLmxhc3RDaGlsZDsgLy8gcmV0dXJuIGxhc3QgY2hpbGQ/XG4gICAgICAvLyBmaW5kIGhpZ2hlc3QgdmVyc2lvblxuICAgICAgLy9cbiAgICAgIC8vIGxvZyhyZWFsUGF0aFZlcnNpb24pO1xuICAgICAgLy9cbiAgICAgIC8vIEJhc2UuZWFjaChwYXRoLmNoaWxkcmVuLCAoY2hpbGQsIGkpID0+IHtcbiAgICAgIC8vICAgaWYgKGNoaWxkLnZlcnNpb24gPT0gcmVhbFBhdGhWZXJzaW9uKSB7XG4gICAgICAvLyAgICAgbG9nKCdyZXR1cm5pbmcgY2hpbGQnKTtcbiAgICAgIC8vICAgICByZXR1cm4gY2hpbGQ7XG4gICAgICAvLyAgIH1cbiAgICAgIC8vIH0pXG4gICAgfVxuICAgIGxvZygnb3JpZ2luYWwgbGVuZ3RoOicsIHRvdGFsTGVuZ3RoKTtcbiAgICBsb2coJ2VkaXRlZCBsZW5ndGg6JywgcGF0aC5sZW5ndGgpO1xuICAgIGlmIChwYXRoLmxlbmd0aCAvIHRvdGFsTGVuZ3RoIDw9IDAuNzUpIHtcbiAgICAgIGxvZygncmV0dXJuaW5nIG9yaWdpbmFsJyk7XG4gICAgICByZXR1cm4gW29yaWdpbmFsLCBmYWxzZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBbcGF0aCwgdHJ1ZV07XG4gICAgfVxuICB9IGNhdGNoKGUpIHtcbiAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgIHJldHVybiBbb3JpZ2luYWwsIGZhbHNlXTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlUGF0aEV4dGVuc2lvbnMocGF0aCkge1xuICBwYXRoLnJlbW92ZVNlZ21lbnQoMCk7XG4gIHBhdGgucmVtb3ZlU2VnbWVudChwYXRoLnNlZ21lbnRzLmxlbmd0aCAtIDEpO1xuICByZXR1cm4gcGF0aDtcbn1cblxuLy8gZXhwb3J0IGZ1bmN0aW9uIHRydWVQYXRoKHBhdGgpIHtcbi8vICAgLy8gbG9nKGdyb3VwKTtcbi8vICAgLy8gaWYgKHBhdGggJiYgcGF0aC5jaGlsZHJlbiAmJiBwYXRoLmNoaWxkcmVuLmxlbmd0aCA+IDAgJiYgcGF0aC5fbmFtZWRDaGlsZHJlblsnbWlkZGxlJ10pIHtcbi8vICAgLy8gICBsZXQgcGF0aENvcHkgPSBuZXcgUGF0aCgpO1xuLy8gICAvLyAgIGxvZyhwYXRoLl9uYW1lZENoaWxkcmVuWydtaWRkbGUnXSk7XG4vLyAgIC8vICAgcGF0aENvcHkuY29weUNvbnRlbnQocGF0aC5fbmFtZWRDaGlsZHJlblsnbWlkZGxlJ10pO1xuLy8gICAvLyAgIGxvZyhwYXRoQ29weSk7XG4vLyAgIC8vIH1cbi8vIH1cblxuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrUG9wcygpIHtcbiAgbGV0IGdyb3VwcyA9IHBhcGVyLnByb2plY3QuZ2V0SXRlbXMoe1xuICAgIGNsYXNzTmFtZTogJ0dyb3VwJyxcbiAgICBtYXRjaDogZnVuY3Rpb24oZWwpIHtcbiAgICAgIHJldHVybiAoISFlbC5kYXRhICYmIGVsLmRhdGEudXBkYXRlKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vLyBodHRwczovL2dyb3Vwcy5nb29nbGUuY29tL2ZvcnVtLyMhdG9waWMvcGFwZXJqcy9VRDhMME1UeVJlUVxuZXhwb3J0IGZ1bmN0aW9uIG92ZXJsYXBzKHBhdGgsIG90aGVyKSB7XG4gIHJldHVybiAhKHBhdGguZ2V0SW50ZXJzZWN0aW9ucyhvdGhlcikubGVuZ3RoID09PSAwKTtcbn1cblxuLy8gaHR0cHM6Ly9ncm91cHMuZ29vZ2xlLmNvbS9mb3J1bS8jIXRvcGljL3BhcGVyanMvVUQ4TDBNVHlSZVFcbmV4cG9ydCBmdW5jdGlvbiBtZXJnZU9uZVBhdGgocGF0aCwgb3RoZXJzKSB7XG4gIGxldCBpLCBtZXJnZWQsIG90aGVyLCB1bmlvbiwgX2ksIF9sZW4sIF9yZWY7XG4gIGZvciAoaSA9IF9pID0gMCwgX2xlbiA9IG90aGVycy5sZW5ndGg7IF9pIDwgX2xlbjsgaSA9ICsrX2kpIHtcbiAgICBvdGhlciA9IG90aGVyc1tpXTtcbiAgICBpZiAob3ZlcmxhcHMocGF0aCwgb3RoZXIpKSB7XG4gICAgICB1bmlvbiA9IHBhdGgudW5pdGUob3RoZXIpO1xuICAgICAgbWVyZ2VkID0gbWVyZ2VPbmVQYXRoKHVuaW9uLCBvdGhlcnMuc2xpY2UoaSArIDEpKTtcbiAgICAgIHJldHVybiAoX3JlZiA9IG90aGVycy5zbGljZSgwLCBpKSkuY29uY2F0LmFwcGx5KF9yZWYsIG1lcmdlZCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBvdGhlcnMuY29uY2F0KHBhdGgpO1xufTtcblxuLy8gaHR0cHM6Ly9ncm91cHMuZ29vZ2xlLmNvbS9mb3J1bS8jIXRvcGljL3BhcGVyanMvVUQ4TDBNVHlSZVFcbmV4cG9ydCBmdW5jdGlvbiBtZXJnZVBhdGhzKHBhdGhzKSB7XG4gIHZhciBwYXRoLCByZXN1bHQsIF9pLCBfbGVuO1xuICByZXN1bHQgPSBbXTtcbiAgZm9yIChfaSA9IDAsIF9sZW4gPSBwYXRocy5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgIHBhdGggPSBwYXRoc1tfaV07XG4gICAgcmVzdWx0ID0gbWVyZ2VPbmVQYXRoKHBhdGgsIHJlc3VsdCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBoaXRUZXN0Qm91bmRzKHBvaW50LCBjaGlsZHJlbikge1xuICBpZiAoIXBvaW50KSByZXR1cm4gbnVsbDtcblxuICBmb3IgKGxldCBpID0gY2hpbGRyZW4ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBsZXQgY2hpbGQgPSBjaGlsZHJlbltpXTtcbiAgICBsZXQgYm91bmRzID0gY2hpbGQuc3Ryb2tlQm91bmRzO1xuICAgIGlmIChwb2ludC5pc0luc2lkZShjaGlsZC5zdHJva2VCb3VuZHMpKSB7XG4gICAgICByZXR1cm4gY2hpbGQ7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG4iXX0=
