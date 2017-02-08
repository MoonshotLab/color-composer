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
      }

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjb25maWcuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9zaGFwZS5qcyIsInNyYy9qcy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxRQUFRLE9BQVIsR0FBa0I7QUFDaEIsVUFBUSxDQUFDLFNBQUQsRUFBWSxTQUFaLEVBQXVCLFNBQXZCLEVBQWtDLFNBQWxDLEVBQTZDLFNBQTdDLEVBQXdELFNBQXhELEVBQW1FLFNBQW5FLEVBQThFLFNBQTlFLEVBQXlGLFNBQXpGLEVBQW9HLFNBQXBHLEVBQStHLFNBQS9HLEVBQXlILFNBQXpILENBRFE7QUFFaEIsUUFBTSxDQUFDLFNBQUQsRUFBWSxTQUFaLEVBQXVCLFNBQXZCLEVBQWtDLFNBQWxDLEVBQTZDLFNBQTdDLENBRlU7QUFHaEIsYUFBVyxFQUhLO0FBSWhCLHFCQUFtQjtBQUpILENBQWxCOztBQU9BLFFBQVEsS0FBUixHQUFnQjtBQUNkLHNCQUFvQixHQUROO0FBRWQscUJBQW1CLEtBRkw7QUFHZCxzQkFBb0I7QUFITixDQUFoQjs7QUFNQSxRQUFRLEdBQVIsR0FBYyxJQUFkOzs7Ozs7O0FDYkEsT0FBTyxHQUFQLEdBQWEsT0FBTyxHQUFQLElBQWM7QUFDekIsV0FBUyxDQUFDLFNBQUQsRUFBWSxTQUFaLEVBQXVCLFNBQXZCLEVBQWtDLFNBQWxDLEVBQTZDLFNBQTdDLEVBQXdELFNBQXhELEVBQW1FLFNBQW5FLEVBQThFLFNBQTlFLEVBQXlGLFNBQXpGLEVBQW9HLFNBQXBHLEVBQStHLFNBQS9HLEVBQTBILFNBQTFILEVBQXFJLFNBQXJJLEVBQWdKLFNBQWhKLEVBQTJKLFNBQTNKLEVBQXNLLFNBQXRLLENBRGdCO0FBRXpCLGdCQUFjLFNBRlc7QUFHekIsWUFBVSxFQUhlO0FBSXpCLFNBQU87QUFKa0IsQ0FBM0I7O0FBT0EsTUFBTSxPQUFOLENBQWMsTUFBZDs7QUFFQSxJQUFNLE9BQU8sUUFB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QUFvQixLQUFwQixFQUEyQjtBQUNoQyxNQUFJLElBQUosRUFBVSxNQUFWLEVBQWtCLEVBQWxCLEVBQXNCLElBQXRCO0FBQ0EsV0FBUyxFQUFUO0FBQ0EsT0FBSyxLQUFLLENBQUwsRUFBUSxPQUFPLE1BQU0sTUFBMUIsRUFBa0MsS0FBSyxJQUF2QyxFQUE2QyxJQUE3QyxFQUFtRDtBQUNqRCxXQUFPLE1BQU0sRUFBTixDQUFQO0FBQ0EsYUFBUyxhQUFhLElBQWIsRUFBbUIsTUFBbkIsQ0FBVDtBQUNEO0FBQ0QsU0FBTyxNQUFQO0FBQ0Q7O0FBRU0sU0FBUyxhQUFULENBQXVCLEtBQXZCLEVBQThCLFFBQTlCLEVBQXdDO0FBQzdDLE1BQUksQ0FBQyxLQUFMLEVBQVksT0FBTyxJQUFQOztBQUVaLE9BQUssSUFBSSxJQUFJLFNBQVMsTUFBVCxHQUFrQixDQUEvQixFQUFrQyxLQUFLLENBQXZDLEVBQTBDLEdBQTFDLEVBQStDO0FBQzdDLFFBQUksUUFBUSxTQUFTLENBQVQsQ0FBWjtBQUNBLFFBQUksU0FBUyxNQUFNLFlBQW5CO0FBQ0EsUUFBSSxNQUFNLFFBQU4sQ0FBZSxNQUFNLFlBQXJCLENBQUosRUFBd0M7QUFDdEMsYUFBTyxLQUFQO0FBQ0Q7QUFDRjs7QUFFRCxTQUFPLElBQVA7QUFDRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJleHBvcnRzLnBhbGV0dGUgPSB7XG4gIGNvbG9yczogW1wiIzIwMTcxQ1wiLCBcIiMxRTJBNDNcIiwgXCIjMjgzNzdEXCIsIFwiIzM1Mjc0N1wiLCBcIiNDQTJFMjZcIiwgXCIjOUEyQTFGXCIsIFwiI0RBNkMyNlwiLCBcIiM0NTMxMjFcIiwgXCIjOTE2QTQ3XCIsIFwiI0RBQUQyN1wiLCBcIiM3RjdEMzFcIixcIiMyQjVFMkVcIl0sXG4gIHBvcHM6IFtcIiMwMEFERUZcIiwgXCIjRjI4NUE1XCIsIFwiIzdEQzU3RlwiLCBcIiNGNkVCMTZcIiwgXCIjRjRFQUUwXCJdLFxuICBjb2xvclNpemU6IDIwLFxuICBzZWxlY3RlZENvbG9yU2l6ZTogMzBcbn1cblxuZXhwb3J0cy5zaGFwZSA9IHtcbiAgZXh0ZW5kaW5nVGhyZXNob2xkOiAwLjEsXG4gIHRyaW1taW5nVGhyZXNob2xkOiAwLjA3NSxcbiAgY29ybmVyVGhyZXNob2xkRGVnOiAxMFxufVxuXG5leHBvcnRzLmxvZyA9IHRydWU7XG4iLCJ3aW5kb3cua2FuID0gd2luZG93LmthbiB8fCB7XG4gIHBhbGV0dGU6IFtcIiMyMDE3MUNcIiwgXCIjMUUyQTQzXCIsIFwiIzI4Mzc3RFwiLCBcIiMzNTI3NDdcIiwgXCIjRjI4NUE1XCIsIFwiI0NBMkUyNlwiLCBcIiNCODQ1MjZcIiwgXCIjREE2QzI2XCIsIFwiIzQ1MzEyMVwiLCBcIiM5MTZBNDdcIiwgXCIjRUVCNjQxXCIsIFwiI0Y2RUIxNlwiLCBcIiM3RjdEMzFcIiwgXCIjNkVBRDc5XCIsIFwiIzJBNDYyMVwiLCBcIiNGNEVBRTBcIl0sXG4gIGN1cnJlbnRDb2xvcjogJyMyMDE3MUMnLFxuICBudW1QYXRoczogMTAsXG4gIHBhdGhzOiBbXSxcbn07XG5cbnBhcGVyLmluc3RhbGwod2luZG93KTtcblxuY29uc3QgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuY29uc3Qgc2hhcGUgPSByZXF1aXJlKCcuL3NoYXBlJyk7XG5jb25zdCBjb25maWcgPSByZXF1aXJlKCcuLy4uLy4uL2NvbmZpZycpO1xuLy8gcmVxdWlyZSgncGFwZXItYW5pbWF0ZScpO1xuXG5mdW5jdGlvbiBsb2codGhpbmcpIHtcbiAgdXRpbC5sb2codGhpbmcpO1xufVxuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgbGV0IE1PVkVTID0gW107IC8vIHN0b3JlIGdsb2JhbCBtb3ZlcyBsaXN0XG4gIC8vIG1vdmVzID0gW1xuICAvLyAgIHtcbiAgLy8gICAgICd0eXBlJzogJ2NvbG9yQ2hhbmdlJyxcbiAgLy8gICAgICdvbGQnOiAnIzIwMTcxQycsXG4gIC8vICAgICAnbmV3JzogJyNGMjg1QTUnXG4gIC8vICAgfSxcbiAgLy8gICB7XG4gIC8vICAgICAndHlwZSc6ICduZXdQYXRoJyxcbiAgLy8gICAgICdyZWYnOiAnPz8/JyAvLyB1dWlkPyBkb20gcmVmZXJlbmNlP1xuICAvLyAgIH0sXG4gIC8vICAge1xuICAvLyAgICAgJ3R5cGUnOiAncGF0aFRyYW5zZm9ybScsXG4gIC8vICAgICAncmVmJzogJz8/PycsIC8vIHV1aWQ/IGRvbSByZWZlcmVuY2U/XG4gIC8vICAgICAnb2xkJzogJ3JvdGF0ZSg5MGRlZylzY2FsZSgxLjUpJywgLy8gPz8/XG4gIC8vICAgICAnbmV3JzogJ3JvdGF0ZSgxMjBkZWcpc2NhbGUoLTAuNSknIC8vID8/P1xuICAvLyAgIH0sXG4gIC8vICAgLy8gb3RoZXJzP1xuICAvLyBdXG5cbiAgY29uc3QgJHdpbmRvdyA9ICQod2luZG93KTtcbiAgY29uc3QgJGJvZHkgPSAkKCdib2R5Jyk7XG4gIGNvbnN0ICRjYW52YXMgPSAkKCdjYW52YXMjbWFpbkNhbnZhcycpO1xuICBjb25zdCBydW5BbmltYXRpb25zID0gZmFsc2U7XG4gIGNvbnN0IHRyYW5zcGFyZW50ID0gbmV3IENvbG9yKDAsIDApO1xuICBjb25zdCB0aHJlc2hvbGRBbmdsZSA9IHV0aWwucmFkKGNvbmZpZy5zaGFwZS5jb3JuZXJUaHJlc2hvbGREZWcpO1xuXG4gIGxldCB2aWV3V2lkdGgsIHZpZXdIZWlnaHQ7XG5cbiAgZnVuY3Rpb24gaGl0VGVzdEJvdW5kcyhwb2ludCkge1xuICAgIHJldHVybiB1dGlsLmhpdFRlc3RCb3VuZHMocG9pbnQsIHBhcGVyLnByb2plY3QuYWN0aXZlTGF5ZXIuY2hpbGRyZW4pO1xuICB9XG5cbiAgZnVuY3Rpb24gaGl0VGVzdEdyb3VwQm91bmRzKHBvaW50KSB7XG4gICAgbGV0IGdyb3VwcyA9IHBhcGVyLnByb2plY3QuZ2V0SXRlbXMoe1xuICAgICAgY2xhc3NOYW1lOiAnR3JvdXAnXG4gICAgfSk7XG4gICAgcmV0dXJuIHV0aWwuaGl0VGVzdEJvdW5kcyhwb2ludCwgZ3JvdXBzKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRWaWV3VmFycygpIHtcbiAgICB2aWV3V2lkdGggPSBwYXBlci52aWV3LnZpZXdTaXplLndpZHRoO1xuICAgIHZpZXdIZWlnaHQgPSBwYXBlci52aWV3LnZpZXdTaXplLmhlaWdodDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRDb250cm9sUGFuZWwoKSB7XG4gICAgaW5pdENvbG9yUGFsZXR0ZSgpO1xuICAgIGluaXRDYW52YXNEcmF3KCk7XG4gICAgaW5pdE5ldygpO1xuICAgIGluaXRVbmRvKCk7XG4gICAgaW5pdFBsYXkoKTtcbiAgICBpbml0VGlwcygpO1xuICAgIGluaXRTaGFyZSgpO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdENvbG9yUGFsZXR0ZSgpIHtcbiAgICBjb25zdCAkcGFsZXR0ZVdyYXAgPSAkKCd1bC5wYWxldHRlLWNvbG9ycycpO1xuICAgIGNvbnN0ICRwYWxldHRlQ29sb3JzID0gJHBhbGV0dGVXcmFwLmZpbmQoJ2xpJyk7XG4gICAgY29uc3QgcGFsZXR0ZUNvbG9yU2l6ZSA9IDIwO1xuICAgIGNvbnN0IHBhbGV0dGVTZWxlY3RlZENvbG9yU2l6ZSA9IDMwO1xuICAgIGNvbnN0IHBhbGV0dGVTZWxlY3RlZENsYXNzID0gJ3BhbGV0dGUtc2VsZWN0ZWQnO1xuXG4gICAgLy8gaG9vayB1cCBjbGlja1xuICAgICAgJHBhbGV0dGVDb2xvcnMub24oJ2NsaWNrIHRhcCB0b3VjaCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGxldCAkc3ZnID0gJCh0aGlzKS5maW5kKCdzdmcucGFsZXR0ZS1jb2xvcicpO1xuXG4gICAgICAgICAgaWYgKCEkc3ZnLmhhc0NsYXNzKHBhbGV0dGVTZWxlY3RlZENsYXNzKSkge1xuICAgICAgICAgICAgJCgnLicgKyBwYWxldHRlU2VsZWN0ZWRDbGFzcylcbiAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKHBhbGV0dGVTZWxlY3RlZENsYXNzKVxuICAgICAgICAgICAgICAuYXR0cignd2lkdGgnLCBwYWxldHRlQ29sb3JTaXplKVxuICAgICAgICAgICAgICAuYXR0cignaGVpZ2h0JywgcGFsZXR0ZUNvbG9yU2l6ZSlcbiAgICAgICAgICAgICAgLmZpbmQoJ3JlY3QnKVxuICAgICAgICAgICAgICAuYXR0cigncngnLCAwKVxuICAgICAgICAgICAgICAuYXR0cigncnknLCAwKTtcblxuICAgICAgICAgICAgJHN2Zy5hZGRDbGFzcyhwYWxldHRlU2VsZWN0ZWRDbGFzcylcbiAgICAgICAgICAgICAgLmF0dHIoJ3dpZHRoJywgcGFsZXR0ZVNlbGVjdGVkQ29sb3JTaXplKVxuICAgICAgICAgICAgICAuYXR0cignaGVpZ2h0JywgcGFsZXR0ZVNlbGVjdGVkQ29sb3JTaXplKVxuICAgICAgICAgICAgICAuZmluZCgncmVjdCcpXG4gICAgICAgICAgICAgIC5hdHRyKCdyeCcsIHBhbGV0dGVTZWxlY3RlZENvbG9yU2l6ZSAvIDIpXG4gICAgICAgICAgICAgIC5hdHRyKCdyeScsIHBhbGV0dGVTZWxlY3RlZENvbG9yU2l6ZSAvIDIpXG5cbiAgICAgICAgICAgIHdpbmRvdy5rYW4uY3VycmVudENvbG9yID0gJHN2Zy5maW5kKCdyZWN0JykuYXR0cignZmlsbCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0Q2FudmFzRHJhdygpIHtcblxuICAgIHBhcGVyLnNldHVwKCRjYW52YXNbMF0pO1xuXG4gICAgbGV0IG1pZGRsZSwgYm91bmRzO1xuICAgIGxldCBzaXplcztcbiAgICAvLyBsZXQgcGF0aHMgPSBnZXRGcmVzaFBhdGhzKHdpbmRvdy5rYW4ubnVtUGF0aHMpO1xuICAgIGxldCB0b3VjaCA9IGZhbHNlO1xuICAgIGxldCBsYXN0Q2hpbGQ7XG4gICAgbGV0IHBhdGhEYXRhID0ge307XG4gICAgbGV0IHByZXZBbmdsZSwgcHJldlBvaW50O1xuXG4gICAgbGV0IHNpZGVzO1xuICAgIGxldCBzaWRlO1xuXG4gICAgbGV0IGNvcm5lcnM7XG5cbiAgICBmdW5jdGlvbiBwYW5TdGFydChldmVudCkge1xuICAgICAgcGFwZXIucHJvamVjdC5hY3RpdmVMYXllci5yZW1vdmVDaGlsZHJlbigpOyAvLyBSRU1PVkVcbiAgICAgIC8vIGRyYXdDaXJjbGUoKTtcblxuICAgICAgc2l6ZXMgPSBbXTtcbiAgICAgIHByZXZBbmdsZSA9IE1hdGguYXRhbjIoZXZlbnQudmVsb2NpdHlZLCBldmVudC52ZWxvY2l0eVgpO1xuXG4gICAgICBpZiAocGluY2hpbmcpIHJldHVybjtcbiAgICAgIGlmICghKGV2ZW50LmNoYW5nZWRQb2ludGVycyAmJiBldmVudC5jaGFuZ2VkUG9pbnRlcnMubGVuZ3RoID4gMCkpIHJldHVybjtcbiAgICAgIGlmIChldmVudC5jaGFuZ2VkUG9pbnRlcnMubGVuZ3RoID4gMSkge1xuICAgICAgICBsb2coJ2V2ZW50LmNoYW5nZWRQb2ludGVycyA+IDEnKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcG9pbnRlciA9IGV2ZW50LmNlbnRlcjtcbiAgICAgIGNvbnN0IHBvaW50ID0gbmV3IFBvaW50KHBvaW50ZXIueCwgcG9pbnRlci55KTtcblxuICAgICAgYm91bmRzID0gbmV3IFBhdGgoe1xuICAgICAgICBzdHJva2VDb2xvcjogd2luZG93Lmthbi5jdXJyZW50Q29sb3IsXG4gICAgICAgIGZpbGxDb2xvcjogd2luZG93Lmthbi5jdXJyZW50Q29sb3IsXG4gICAgICAgIG5hbWU6ICdib3VuZHMnLFxuICAgICAgICB2aXNpYmxlOiBmYWxzZVxuICAgICAgfSk7XG5cbiAgICAgIG1pZGRsZSA9IG5ldyBQYXRoKHtcbiAgICAgICAgc3Ryb2tlQ29sb3I6IHdpbmRvdy5rYW4uY3VycmVudENvbG9yLFxuICAgICAgICBuYW1lOiAnbWlkZGxlJyxcbiAgICAgICAgc3Ryb2tlV2lkdGg6IDUsXG4gICAgICAgIHZpc2libGU6IHRydWUsXG4gICAgICAgIHN0cm9rZUNhcDogJ3JvdW5kJ1xuICAgICAgfSk7XG5cbiAgICAgIGJvdW5kcy5hZGQocG9pbnQpO1xuICAgICAgbWlkZGxlLmFkZChwb2ludCk7XG5cbiAgICAgIHByZXZQb2ludCA9IHBvaW50O1xuICAgICAgY29ybmVycyA9IFtwb2ludF07XG5cbiAgICAgIHNpZGVzID0gW107XG4gICAgICBzaWRlID0gW3BvaW50XTtcblxuICAgICAgcGF0aERhdGFbc2hhcGUuc3RyaW5naWZ5UG9pbnQocG9pbnQpXSA9IHtcbiAgICAgICAgcG9pbnQ6IHBvaW50LFxuICAgICAgICBmaXJzdDogdHJ1ZVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBjb25zdCBtaW4gPSAxO1xuICAgIGNvbnN0IG1heCA9IDE1O1xuICAgIGNvbnN0IGFscGhhID0gMC4zO1xuICAgIGNvbnN0IG1lbW9yeSA9IDEwO1xuICAgIHZhciBjdW1EaXN0YW5jZSA9IDA7XG4gICAgbGV0IGN1bVNpemUsIGF2Z1NpemU7XG4gICAgZnVuY3Rpb24gcGFuTW92ZShldmVudCkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGlmIChwaW5jaGluZykgcmV0dXJuO1xuICAgICAgLy8gbG9nKGV2ZW50Lm92ZXJhbGxWZWxvY2l0eSk7XG4gICAgICAvLyBsZXQgdGhpc0Rpc3QgPSBwYXJzZUludChldmVudC5kaXN0YW5jZSk7XG4gICAgICAvLyBjdW1EaXN0YW5jZSArPSB0aGlzRGlzdDtcbiAgICAgIC8vXG4gICAgICAvLyBpZiAoY3VtRGlzdGFuY2UgPCAxMDApIHtcbiAgICAgIC8vICAgbG9nKCdpZ25vcmluZycpO1xuICAgICAgLy8gICByZXR1cm47XG4gICAgICAvLyB9IGVsc2Uge1xuICAgICAgLy8gICBjdW1EaXN0YW5jZSA9IDA7XG4gICAgICAvLyAgIGxvZygnbm90IGlnbm9yaW5nJyk7XG4gICAgICAvLyB9XG5cbiAgICAgIGNvbnN0IHBvaW50ZXIgPSBldmVudC5jZW50ZXI7XG4gICAgICBsZXQgcG9pbnQgPSBuZXcgUG9pbnQocG9pbnRlci54LCBwb2ludGVyLnkpO1xuXG4gICAgICAvLyBhbmdsZSA9IC0xICogZXZlbnQuYW5nbGU7IC8vIG1ha2UgdXAgcG9zaXRpdmUgcmF0aGVyIHRoYW4gbmVnYXRpdmVcbiAgICAgIC8vIGFuZ2xlID0gYW5nbGUgKz0gMTgwO1xuICAgICAgLy8gY29uc29sZS5sb2coZXZlbnQudmVsb2NpdHlYLCBldmVudC52ZWxvY2l0eVkpO1xuICAgICAgYW5nbGUgPSBNYXRoLmF0YW4yKGV2ZW50LnZlbG9jaXR5WSwgZXZlbnQudmVsb2NpdHlYKTtcbiAgICAgIGxldCBhbmdsZURlbHRhID0gdXRpbC5hbmdsZURlbHRhKGFuZ2xlLCBwcmV2QW5nbGUpO1xuICAgICAgcHJldkFuZ2xlID0gYW5nbGU7XG5cbiAgICAgIGlmIChhbmdsZURlbHRhID4gdGhyZXNob2xkQW5nbGUpIHtcbiAgICAgICAgaWYgKHNpZGUubGVuZ3RoID4gMCkge1xuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdjb3JuZXInKTtcbiAgICAgICAgICBsZXQgY29ybmVyUG9pbnQgPSBwb2ludDtcbiAgICAgICAgICAvLyBuZXcgUGF0aC5DaXJjbGUoe1xuICAgICAgICAgIC8vICAgY2VudGVyOiBjb3JuZXJQb2ludCxcbiAgICAgICAgICAvLyAgIHJhZGl1czogMTUsXG4gICAgICAgICAgLy8gICBzdHJva2VDb2xvcjogJ2JsYWNrJ1xuICAgICAgICAgIC8vIH0pO1xuICAgICAgICAgIGNvcm5lcnMucHVzaChjb3JuZXJQb2ludCk7XG4gICAgICAgICAgc2lkZXMucHVzaChzaWRlKTtcbiAgICAgICAgICBzaWRlID0gW107XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHNpZGUucHVzaChwb2ludCk7XG4gICAgICAvLyBsZXQgYW5nbGVEZWcgPSAtMSAqIGV2ZW50LmFuZ2xlO1xuICAgICAgLy8gaWYgKGFuZ2xlRGVnIDwgMCkgYW5nbGVEZWcgKz0gMzYwOyAvLyBub3JtYWxpemUgdG8gWzAsIDM2MClcbiAgICAgIC8vIGFuZ2xlID0gdXRpbC5yYWQoYW5nbGVEZWcpO1xuICAgICAgLy9cbiAgICAgIC8vIC8vIGxldCBhbmdsZURlbHRhID0gTWF0aC5hdGFuMihNYXRoLnNpbihhbmdsZSksIE1hdGguY29zKGFuZ2xlKSkgLSBNYXRoLmF0YW4yKE1hdGguc2luKHByZXZBbmdsZSksIE1hdGguY29zKHByZXZBbmdsZSkpO1xuICAgICAgLy8gY29uc29sZS5sb2coYW5nbGUsIHByZXZBbmdsZSk7XG4gICAgICAvLyAvLyBjb25zb2xlLmxvZyhhbmdsZURlbHRhKTtcblxuICAgICAgLy8gY29uc29sZS5sb2coYW5nbGUpO1xuXG4gICAgICAvLyBsZXQgYW5nbGVEZWx0YSA9IE1hdGguYWJzKHByZXZBbmdsZSAtIGFuZ2xlKTtcbiAgICAgIC8vIGlmIChhbmdsZURlbHRhID4gMzYwKSBhbmdsZURlbHRhID0gYW5nbGVEZWx0YSAtIDM2MDtcbiAgICAgIC8vIGlmIChhbmdsZURlbHRhID4gOTApIHtcbiAgICAgIC8vICAgY29uc29sZS5sb2coYW5nbGUsIHByZXZBbmdsZSwgYW5nbGVEZWx0YSk7XG4gICAgICAvLyAgIGNvbnNvbGUuZXJyb3IoJ2Nvcm5lciEnKTtcbiAgICAgIC8vIH0gZWxzZSB7XG4gICAgICAvLyAgIC8vIGNvbnNvbGUubG9nKGFuZ2xlRGVsdGEpO1xuICAgICAgLy8gfVxuXG4gICAgICB3aGlsZSAoc2l6ZXMubGVuZ3RoID4gbWVtb3J5KSB7XG4gICAgICAgIHNpemVzLnNoaWZ0KCk7XG4gICAgICB9XG5cbiAgICAgIGxldCBib3R0b21YLCBib3R0b21ZLCBib3R0b20sXG4gICAgICAgIHRvcFgsIHRvcFksIHRvcCxcbiAgICAgICAgcDAsIHAxLFxuICAgICAgICBzdGVwLCBhbmdsZSwgZGlzdCwgc2l6ZTtcblxuICAgICAgaWYgKHNpemVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLy8gbm90IHRoZSBmaXJzdCBwb2ludCwgc28gd2UgaGF2ZSBvdGhlcnMgdG8gY29tcGFyZSB0b1xuICAgICAgICBwMCA9IHByZXZQb2ludDtcbiAgICAgICAgZGlzdCA9IHV0aWwuZGVsdGEocG9pbnQsIHAwKTtcbiAgICAgICAgc2l6ZSA9IGRpc3QgKiBhbHBoYTtcbiAgICAgICAgLy8gaWYgKHNpemUgPj0gbWF4KSBzaXplID0gbWF4O1xuICAgICAgICBzaXplID0gTWF0aC5tYXgoTWF0aC5taW4oc2l6ZSwgbWF4KSwgbWluKTsgLy8gY2xhbXAgc2l6ZSB0byBbbWluLCBtYXhdXG4gICAgICAgIC8vIHNpemUgPSBtYXggLSBzaXplO1xuXG4gICAgICAgIGN1bVNpemUgPSAwO1xuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHNpemVzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgY3VtU2l6ZSArPSBzaXplc1tqXTtcbiAgICAgICAgfVxuICAgICAgICBhdmdTaXplID0gTWF0aC5yb3VuZCgoKGN1bVNpemUgLyBzaXplcy5sZW5ndGgpICsgc2l6ZSkgLyAyKTtcbiAgICAgICAgLy8gbG9nKGF2Z1NpemUpO1xuXG4gICAgICAgIGFuZ2xlID0gTWF0aC5hdGFuMihwb2ludC55IC0gcDAueSwgcG9pbnQueCAtIHAwLngpOyAvLyByYWRcblxuICAgICAgICAvLyBQb2ludChib3R0b21YLCBib3R0b21ZKSBpcyBib3R0b20sIFBvaW50KHRvcFgsIHRvcFkpIGlzIHRvcFxuICAgICAgICBib3R0b21YID0gcG9pbnQueCArIE1hdGguY29zKGFuZ2xlICsgTWF0aC5QSS8yKSAqIGF2Z1NpemU7XG4gICAgICAgIGJvdHRvbVkgPSBwb2ludC55ICsgTWF0aC5zaW4oYW5nbGUgKyBNYXRoLlBJLzIpICogYXZnU2l6ZTtcbiAgICAgICAgYm90dG9tID0gbmV3IFBvaW50KGJvdHRvbVgsIGJvdHRvbVkpO1xuXG4gICAgICAgIHRvcFggPSBwb2ludC54ICsgTWF0aC5jb3MoYW5nbGUgLSBNYXRoLlBJLzIpICogYXZnU2l6ZTtcbiAgICAgICAgdG9wWSA9IHBvaW50LnkgKyBNYXRoLnNpbihhbmdsZSAtIE1hdGguUEkvMikgKiBhdmdTaXplO1xuICAgICAgICB0b3AgPSBuZXcgUG9pbnQodG9wWCwgdG9wWSk7XG5cbiAgICAgICAgYm91bmRzLmFkZCh0b3ApO1xuICAgICAgICBib3VuZHMuaW5zZXJ0KDAsIGJvdHRvbSk7XG4gICAgICAgIC8vIGJvdW5kcy5zbW9vdGgoKTtcblxuICAgICAgICBtaWRkbGUuYWRkKHBvaW50KTtcbiAgICAgICAgcGF0aERhdGFbc2hhcGUuc3RyaW5naWZ5UG9pbnQocG9pbnQpXSA9IHtcbiAgICAgICAgICBwb2ludDogcG9pbnQsXG4gICAgICAgICAgc2l6ZTogYXZnU2l6ZSxcbiAgICAgICAgICBzcGVlZDogTWF0aC5hYnMoZXZlbnQub3ZlcmFsbFZlbG9jaXR5KVxuICAgICAgICB9O1xuICAgICAgICAvLyBpZiAoc2hhcGUuc3RyaW5naWZ5UG9pbnQocG9pbnQpIGluIHBhdGhEYXRhKSB7XG4gICAgICAgIC8vICAgbG9nKCdkdXBsaWNhdGUhJyk7XG4gICAgICAgIC8vIH0gZWxzZSB7XG4gICAgICAgIC8vIH1cbiAgICAgICAgLy8gbWlkZGxlLnNtb290aCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZG9uJ3QgaGF2ZSBhbnl0aGluZyB0byBjb21wYXJlIHRvXG4gICAgICAgIGRpc3QgPSAxO1xuICAgICAgICBhbmdsZSA9IDA7XG5cbiAgICAgICAgc2l6ZSA9IGRpc3QgKiBhbHBoYTtcbiAgICAgICAgc2l6ZSA9IE1hdGgubWF4KE1hdGgubWluKHNpemUsIG1heCksIG1pbik7IC8vIGNsYW1wIHNpemUgdG8gW21pbiwgbWF4XVxuICAgICAgICBwYXRoRGF0YVtzaGFwZS5zdHJpbmdpZnlQb2ludChwb2ludCldID0ge1xuICAgICAgICAgIHBvaW50OiBwb2ludCxcbiAgICAgICAgICBzcGVlZDogTWF0aC5hYnMoZXZlbnQub3ZlcmFsbFZlbG9jaXR5KVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBwYXBlci52aWV3LmRyYXcoKTtcblxuICAgICAgcHJldlBvaW50ID0gcG9pbnQ7XG4gICAgICBzaXplcy5wdXNoKHNpemUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhbkVuZChldmVudCkge1xuICAgICAgaWYgKHBpbmNoaW5nKSByZXR1cm47XG5cbiAgICAgIGNvbnN0IHBvaW50ZXIgPSBldmVudC5jZW50ZXI7XG4gICAgICBjb25zdCBwb2ludCA9IG5ldyBQb2ludChwb2ludGVyLngsIHBvaW50ZXIueSk7XG5cbiAgICAgIGxldCBncm91cCA9IG5ldyBHcm91cChbYm91bmRzLCBtaWRkbGVdKTtcbiAgICAgIGdyb3VwLmRhdGEuY29sb3IgPSBib3VuZHMuZmlsbENvbG9yO1xuICAgICAgZ3JvdXAuZGF0YS51cGRhdGUgPSB0cnVlO1xuXG4gICAgICBib3VuZHMuYWRkKHBvaW50KTtcbiAgICAgIGJvdW5kcy5jbG9zZWQgPSB0cnVlO1xuICAgICAgLy8gYm91bmRzLnNpbXBsaWZ5KCk7XG5cbiAgICAgIG1pZGRsZS5hZGQocG9pbnQpO1xuICAgICAgLy8gbWlkZGxlLnNpbXBsaWZ5KCk7XG5cbiAgICAgIHNpZGUucHVzaChwb2ludCk7XG4gICAgICBzaWRlcy5wdXNoKHNpZGUpO1xuXG4gICAgICBwYXRoRGF0YVtzaGFwZS5zdHJpbmdpZnlQb2ludChwb2ludCldID0ge1xuICAgICAgICBwb2ludDogcG9pbnQsXG4gICAgICAgIGxhc3Q6IHRydWVcbiAgICAgIH07XG5cbiAgICAgIGNvcm5lcnMucHVzaChwb2ludCk7XG5cbiAgICAgIC8vIG1pZGRsZS5zaW1wbGlmeSgpO1xuICAgICAgbWlkZGxlLnJlZHVjZSgpO1xuICAgICAgbGV0IFt0cnVlZEdyb3VwLCB0cnVlV2FzTmVjZXNzYXJ5XSA9IHV0aWwudHJ1ZUdyb3VwKGdyb3VwLCBjb3JuZXJzKTtcbiAgICAgIGdyb3VwLnJlcGxhY2VXaXRoKHRydWVkR3JvdXApO1xuICAgICAgbWlkZGxlID0gZ3JvdXAuX25hbWVkQ2hpbGRyZW4ubWlkZGxlWzBdO1xuICAgICAgbWlkZGxlLnN0cm9rZUNvbG9yID0gZ3JvdXAuc3Ryb2tlQ29sb3I7XG4gICAgICAvLyBtaWRkbGUuc2VsZWN0ZWQgPSB0cnVlO1xuXG4gICAgICAvLyBib3VuZHMuZmxhdHRlbig0KTtcbiAgICAgIC8vIGJvdW5kcy5zbW9vdGgoKTtcblxuICAgICAgLy8gbWlkZGxlLmZsYXR0ZW4oNCk7XG4gICAgICAvLyBtaWRkbGUucmVkdWNlKCk7XG5cblxuICAgICAgLy8gbWlkZGxlLnNpbXBsaWZ5KCk7XG4gICAgICBpZiAodHJ1ZVdhc05lY2Vzc2FyeSkge1xuICAgICAgICBsZXQgY29tcHV0ZWRDb3JuZXJzID0gc2hhcGUuZ2V0Q29tcHV0ZWRDb3JuZXJzKG1pZGRsZSk7XG4gICAgICAgIGxldCBjb21wdXRlZENvcm5lcnNQYXRoID0gbmV3IFBhdGgoY29tcHV0ZWRDb3JuZXJzKTtcbiAgICAgICAgY29tcHV0ZWRDb3JuZXJzUGF0aC52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgIGxldCBjb21wdXRlZENvcm5lcnNQYXRoTGVuZ3RoID0gY29tcHV0ZWRDb3JuZXJzUGF0aC5sZW5ndGg7XG4gICAgICAgIGlmIChNYXRoLmFicyhjb21wdXRlZENvcm5lcnNQYXRoTGVuZ3RoIC0gbWlkZGxlLmxlbmd0aCkgLyBtaWRkbGUubGVuZ3RoIDw9IDAuMSkge1xuICAgICAgICAgIG1pZGRsZS5zZWdtZW50cyA9IGNvbXB1dGVkQ29ybmVycztcbiAgICAgICAgICAvLyBtaWRkbGUucmVkdWNlKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBtaWRkbGUuc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgLy8gbWlkZGxlLnZpc2libGUgPSB0cnVlO1xuICAgICAgICAvLyBtaWRkbGUuc3Ryb2tlQ29sb3IgPSAncGluayc7XG4gICAgICAgIC8vIG1pZGRsZS5zdHJva2VXZWlnaHQgPSA1MDtcblxuXG4gICAgICAgIC8vIGxldCBtZXJnZWRDb3JuZXJzID0gY29ybmVycy5jb25jYXQoY29tcHV0ZWRDb3JuZXJzKTtcbiAgICAgICAgLy8gbGV0IGZvbyA9IG5ldyBQYXRoKG1lcmdlZENvcm5lcnMpO1xuICAgICAgICAvLyBmb28uc3Ryb2tlV2lkdGggPSA1O1xuICAgICAgICAvLyBmb28uc3Ryb2tlQ29sb3IgPSAnYmx1ZSc7XG4gICAgICAgIC8vIGxldCBjb3JuZXJzUGF0aCA9IG5ldyBQYXRoKHtcbiAgICAgICAgLy8gICBzdHJva2VXaWR0aDogNSxcbiAgICAgICAgLy8gICBzdHJva2VDb2xvcjogJ3JlZCdcbiAgICAgICAgLy8gfSk7XG4gICAgICAgIC8vIEJhc2UuZWFjaChtZXJnZWRDb3JuZXJzLCAoY29ybmVyLCBpKSA9PiB7XG4gICAgICAgIC8vICAgY29ybmVyc1BhdGguYWRkKGNvcm5lcik7XG4gICAgICAgIC8vICAgLy8gaWYgKGkgPCAyKSB7XG4gICAgICAgIC8vICAgLy8gICBjb3JuZXJzUGF0aC5hZGQoY29ybmVyKTtcbiAgICAgICAgLy8gICAvLyB9IGVsc2Uge1xuICAgICAgICAvLyAgIC8vICAgbGV0IGNsb3Nlc3RQb2ludCA9IGNvcm5lcnNQYXRoLmdldE5lYXJlc3RQb2ludChjb3JuZXIpO1xuICAgICAgICAvLyAgIC8vICAgY29ybmVyc1BhdGguaW5zZXJ0KGNvcm5lciwgY2xvc2VzdFBvaW50LmluZGV4ICsgMSk7XG4gICAgICAgIC8vICAgLy8gfVxuICAgICAgICAvLyB9KTtcbiAgICAgICAgLy8gbGV0IGNvcm5lcnNQYXRoID0gbmV3IFBhdGgoe1xuICAgICAgICAvLyAgIHN0cm9rZVdpZHRoOiA1LFxuICAgICAgICAvLyAgIHN0cm9rZUNvbG9yOiAncmVkJyxcbiAgICAgICAgLy8gICBzZWdtZW50czogY29ybmVyc1xuICAgICAgICAvLyB9KTtcbiAgICAgICAgLy8gbGV0IGNvbXB1dGVkQ29ybmVyc1BhdGggPSBuZXcgUGF0aCh7XG4gICAgICAgIC8vICAgc3Ryb2tlV2lkdGg6IDUsXG4gICAgICAgIC8vICAgc3Ryb2tlQ29sb3I6ICdibHVlJyxcbiAgICAgICAgLy8gICBzZWdtZW50czogY29tcHV0ZWRDb3JuZXJzLFxuICAgICAgICAvLyAgIGNsb3NlZDogdHJ1ZVxuICAgICAgICAvLyB9KTtcblxuICAgICAgICAvLyBsZXQgdGhyZXNob2xkRGlzdCA9IDAuMDUgKiBjb21wdXRlZENvcm5lcnNQYXRoLmxlbmd0aDtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gQmFzZS5lYWNoKGNvcm5lcnMsIChjb3JuZXIsIGkpID0+IHtcbiAgICAgICAgLy8gICBsZXQgaW50ZWdlclBvaW50ID0gc2hhcGUuZ2V0SW50ZWdlclBvaW50KGNvcm5lcik7XG4gICAgICAgIC8vICAgbGV0IGNsb3Nlc3RQb2ludCA9IGNvbXB1dGVkQ29ybmVyc1BhdGguZ2V0TmVhcmVzdFBvaW50KGNvcm5lcik7XG4gICAgICAgIC8vIH0pO1xuICAgICAgICAvLyBjb21wdXRlZENvcm5lcnMudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICAvLyBjb21wdXRlZENvcm5lcnNQYXRoLnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgLy8gbGV0IG1lcmdlZENvcm5lcnNQYXRoID0gY29ybmVyc1BhdGgudW5pdGUoY29tcHV0ZWRDb3JuZXJzUGF0aCk7XG4gICAgICAgIC8vIG1lcmdlZENvcm5lcnNQYXRoLnN0cm9rZUNvbG9yID0gJ3B1cnBsZSc7XG4gICAgICAgIC8vIGNvcm5lcnNQYXRoLmZsYXR0ZW4oKTtcbiAgICAgIH1cblxuICAgICAgLy8gaWYgKHRydWVXYXNOZWNlc3NhcnkpIHtcbiAgICAgIC8vICAgbGV0IGlkZWFsR2VvbWV0cnkgPSBzaGFwZS5nZXRJZGVhbEdlb21ldHJ5KHBhdGhEYXRhLCBzaWRlcywgbWlkZGxlKTtcbiAgICAgIC8vICAgbG9nKGlkZWFsR2VvbWV0cnkpO1xuICAgICAgLy8gICBCYXNlLmVhY2goY29ybmVycywgKGNvcm5lciwgaSkgPT4ge1xuICAgICAgLy8gICAgIGlkZWFsR2VvbWV0cnkuYWRkKGNvcm5lcik7XG4gICAgICAvLyAgIH0pO1xuICAgICAgLy8gICBpZGVhbEdlb21ldHJ5LnJlZHVjZSgpO1xuICAgICAgLy9cbiAgICAgIC8vICAgaWRlYWxHZW9tZXRyeS5zdHJva2VDb2xvciA9ICdyZWQnO1xuICAgICAgLy8gfSBlbHNlIHtcbiAgICAgIC8vICAgbG9nKCdubyB0cnVlaW5nIG5lY2Vzc2FyeScpO1xuICAgICAgLy8gfVxuICAgICAgLy8gbWlkZGxlLnNtb290aCh7XG4gICAgICAvLyAgIHR5cGU6ICdnZW9tZXRyaWMnXG4gICAgICAvLyB9KTtcbiAgICAgIC8vIG1pZGRsZS5mbGF0dGVuKDEwKTtcbiAgICAgIC8vIG1pZGRsZS5zaW1wbGlmeSgpO1xuICAgICAgLy8gbWlkZGxlLmZsYXR0ZW4oMjApO1xuICAgICAgLy8gbWlkZGxlLnNpbXBsaWZ5KCk7XG4gICAgICAvLyBtaWRkbGUuZmxhdHRlbigpO1xuICAgICAgLy8gbWlkZGxlLnNpbXBsaWZ5KCk7XG5cbiAgICAgIG1pZGRsZS5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAvLyBsZXQgbWlkZGxlQ2xvbmUgPSBtaWRkbGUuY2xvbmUoKTtcbiAgICAgIC8vIG1pZGRsZUNsb25lLnZpc2libGUgPSB0cnVlO1xuICAgICAgLy8gbWlkZGxlQ2xvbmUuc3Ryb2tlQ29sb3IgPSAncGluayc7XG5cblxuICAgICAgbGV0IGludGVyc2VjdGlvbnMgPSBtaWRkbGUuZ2V0Q3Jvc3NpbmdzKCk7XG4gICAgICBpZiAoaW50ZXJzZWN0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgIC8vIHdlIGNyZWF0ZSBhIGNvcHkgb2YgdGhlIHBhdGggYmVjYXVzZSByZXNvbHZlQ3Jvc3NpbmdzKCkgc3BsaXRzIHNvdXJjZSBwYXRoXG4gICAgICAgIGxldCBwYXRoQ29weSA9IG5ldyBQYXRoKCk7XG4gICAgICAgIHBhdGhDb3B5LmNvcHlDb250ZW50KG1pZGRsZSk7XG4gICAgICAgIHBhdGhDb3B5LnZpc2libGUgPSBmYWxzZTtcblxuICAgICAgICBsZXQgZGl2aWRlZFBhdGggPSBwYXRoQ29weS5yZXNvbHZlQ3Jvc3NpbmdzKCk7XG4gICAgICAgIGRpdmlkZWRQYXRoLnZpc2libGUgPSBmYWxzZTtcblxuXG4gICAgICAgIGxldCBlbmNsb3NlZExvb3BzID0gdXRpbC5maW5kSW50ZXJpb3JDdXJ2ZXMoZGl2aWRlZFBhdGgpO1xuXG4gICAgICAgIGlmIChlbmNsb3NlZExvb3BzKSB7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbmNsb3NlZExvb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBlbmNsb3NlZExvb3BzW2ldLnZpc2libGUgPSB0cnVlO1xuICAgICAgICAgICAgZW5jbG9zZWRMb29wc1tpXS5jbG9zZWQgPSB0cnVlO1xuICAgICAgICAgICAgZW5jbG9zZWRMb29wc1tpXS5maWxsQ29sb3IgPSBuZXcgQ29sb3IoMCwgMCk7IC8vIHRyYW5zcGFyZW50XG4gICAgICAgICAgICBlbmNsb3NlZExvb3BzW2ldLmRhdGEuaW50ZXJpb3IgPSB0cnVlO1xuICAgICAgICAgICAgZW5jbG9zZWRMb29wc1tpXS5kYXRhLnRyYW5zcGFyZW50ID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vIGVuY2xvc2VkTG9vcHNbaV0uYmxlbmRNb2RlID0gJ211bHRpcGx5JztcbiAgICAgICAgICAgIGdyb3VwLmFkZENoaWxkKGVuY2xvc2VkTG9vcHNbaV0pO1xuICAgICAgICAgICAgZW5jbG9zZWRMb29wc1tpXS5zZW5kVG9CYWNrKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHBhdGhDb3B5LnJlbW92ZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gbG9nKCdubyBpbnRlcnNlY3Rpb25zJyk7XG4gICAgICB9XG5cbiAgICAgIGdyb3VwLmRhdGEuY29sb3IgPSBib3VuZHMuZmlsbENvbG9yO1xuICAgICAgZ3JvdXAuZGF0YS5zY2FsZSA9IDE7IC8vIGluaXQgdmFyaWFibGUgdG8gdHJhY2sgc2NhbGUgY2hhbmdlc1xuICAgICAgZ3JvdXAuZGF0YS5yb3RhdGlvbiA9IDA7IC8vIGluaXQgdmFyaWFibGUgdG8gdHJhY2sgcm90YXRpb24gY2hhbmdlc1xuXG4gICAgICBsZXQgY2hpbGRyZW4gPSBncm91cC5nZXRJdGVtcyh7XG4gICAgICAgIG1hdGNoOiBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgcmV0dXJuIGl0ZW0ubmFtZSAhPT0gJ21pZGRsZSdcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIGxvZygnLS0tLS0nKTtcbiAgICAgIC8vIGxvZyhncm91cCk7XG4gICAgICAvLyBsb2coY2hpbGRyZW4pO1xuICAgICAgLy8gZ3JvdXAuc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgbGV0IHVuaXRlZFBhdGggPSBuZXcgUGF0aCgpO1xuICAgICAgaWYgKGNoaWxkcmVuLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgbGV0IGFjY3VtdWxhdG9yID0gbmV3IFBhdGgoKTtcbiAgICAgICAgYWNjdW11bGF0b3IuY29weUNvbnRlbnQoY2hpbGRyZW5bMF0pO1xuICAgICAgICBhY2N1bXVsYXRvci52aXNpYmxlID0gZmFsc2U7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGxldCBvdGhlclBhdGggPSBuZXcgUGF0aCgpO1xuICAgICAgICAgIG90aGVyUGF0aC5jb3B5Q29udGVudChjaGlsZHJlbltpXSk7XG4gICAgICAgICAgb3RoZXJQYXRoLnZpc2libGUgPSBmYWxzZTtcblxuICAgICAgICAgIHVuaXRlZFBhdGggPSBhY2N1bXVsYXRvci51bml0ZShvdGhlclBhdGgpO1xuICAgICAgICAgIG90aGVyUGF0aC5yZW1vdmUoKTtcbiAgICAgICAgICBhY2N1bXVsYXRvciA9IHVuaXRlZFBhdGg7XG4gICAgICAgIH1cblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gY2hpbGRyZW5bMF0gaXMgdW5pdGVkIGdyb3VwXG4gICAgICAgIHVuaXRlZFBhdGguY29weUNvbnRlbnQoY2hpbGRyZW5bMF0pO1xuICAgICAgfVxuXG4gICAgICB1bml0ZWRQYXRoLnZpc2libGUgPSBmYWxzZTtcbiAgICAgIHVuaXRlZFBhdGguZGF0YS5uYW1lID0gJ21hc2snO1xuXG4gICAgICBncm91cC5hZGRDaGlsZCh1bml0ZWRQYXRoKTtcbiAgICAgIHVuaXRlZFBhdGguc2VuZFRvQmFjaygpO1xuXG4gICAgICAvLyBtaWRkbGUuc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgLy8gbWlkZGxlLnZpc2libGUgPSB0cnVlO1xuICAgICAgLy8gbWlkZGxlLnN0cm9rZUNvbG9yID0gJ3BpbmsnO1xuXG4gICAgICBsYXN0Q2hpbGQgPSBncm91cDtcblxuICAgICAgTU9WRVMucHVzaCh7XG4gICAgICAgIHR5cGU6ICduZXdHcm91cCcsXG4gICAgICAgIGlkOiBncm91cC5pZFxuICAgICAgfSk7XG5cbiAgICAgIGlmIChydW5BbmltYXRpb25zKSB7XG4gICAgICAgIGdyb3VwLmFuaW1hdGUoXG4gICAgICAgICAgW3tcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgc2NhbGU6IDAuOVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldHRpbmdzOiB7XG4gICAgICAgICAgICAgIGR1cmF0aW9uOiAxMDAsXG4gICAgICAgICAgICAgIGVhc2luZzogXCJlYXNlT3V0XCIsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgIHNjYWxlOiAxLjExXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgICAgICAgZHVyYXRpb246IDEwMCxcbiAgICAgICAgICAgICAgZWFzaW5nOiBcImVhc2VJblwiXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfV1cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgcGluY2hpbmc7XG4gICAgbGV0IHBpbmNoZWRHcm91cCwgbGFzdFNjYWxlLCBsYXN0Um90YXRpb247XG4gICAgbGV0IG9yaWdpbmFsUG9zaXRpb24sIG9yaWdpbmFsUm90YXRpb24sIG9yaWdpbmFsU2NhbGU7XG5cbiAgICBmdW5jdGlvbiBwaW5jaFN0YXJ0KGV2ZW50KSB7XG4gICAgICBsb2coJ3BpbmNoU3RhcnQnLCBldmVudC5jZW50ZXIpO1xuICAgICAgaGFtbWVyTWFuYWdlci5nZXQoJ3BhbicpLnNldCh7ZW5hYmxlOiBmYWxzZX0pO1xuICAgICAgY29uc3QgcG9pbnRlciA9IGV2ZW50LmNlbnRlcixcbiAgICAgICAgICBwb2ludCA9IG5ldyBQb2ludChwb2ludGVyLngsIHBvaW50ZXIueSksXG4gICAgICAgICAgaGl0UmVzdWx0ID0gaGl0VGVzdEdyb3VwQm91bmRzKHBvaW50KTtcblxuICAgICAgaWYgKGhpdFJlc3VsdCkge1xuICAgICAgICBwaW5jaGluZyA9IHRydWU7XG4gICAgICAgIC8vIHBpbmNoZWRHcm91cCA9IGhpdFJlc3VsdC5pdGVtLnBhcmVudDtcbiAgICAgICAgcGluY2hlZEdyb3VwID0gaGl0UmVzdWx0O1xuICAgICAgICBsYXN0U2NhbGUgPSAxO1xuICAgICAgICBsYXN0Um90YXRpb24gPSBldmVudC5yb3RhdGlvbjtcblxuICAgICAgICBvcmlnaW5hbFBvc2l0aW9uID0gcGluY2hlZEdyb3VwLnBvc2l0aW9uO1xuICAgICAgICAvLyBvcmlnaW5hbFJvdGF0aW9uID0gcGluY2hlZEdyb3VwLnJvdGF0aW9uO1xuICAgICAgICBvcmlnaW5hbFJvdGF0aW9uID0gcGluY2hlZEdyb3VwLmRhdGEucm90YXRpb247XG4gICAgICAgIG9yaWdpbmFsU2NhbGUgPSBwaW5jaGVkR3JvdXAuZGF0YS5zY2FsZTtcblxuICAgICAgICBpZiAocnVuQW5pbWF0aW9ucykge1xuICAgICAgICAgIHBpbmNoZWRHcm91cC5hbmltYXRlKHtcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgc2NhbGU6IDEuMjVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXR0aW5nczoge1xuICAgICAgICAgICAgICBkdXJhdGlvbjogMTAwLFxuICAgICAgICAgICAgICBlYXNpbmc6IFwiZWFzZU91dFwiLFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwaW5jaGVkR3JvdXAgPSBudWxsO1xuICAgICAgICBsb2coJ2hpdCBubyBpdGVtJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGluY2hNb3ZlKGV2ZW50KSB7XG4gICAgICBsb2coJ3BpbmNoTW92ZScpO1xuICAgICAgaWYgKCEhcGluY2hlZEdyb3VwKSB7XG4gICAgICAgIC8vIGxvZygncGluY2htb3ZlJywgZXZlbnQpO1xuICAgICAgICAvLyBsb2cocGluY2hlZEdyb3VwKTtcbiAgICAgICAgbGV0IGN1cnJlbnRTY2FsZSA9IGV2ZW50LnNjYWxlO1xuICAgICAgICBsZXQgc2NhbGVEZWx0YSA9IGN1cnJlbnRTY2FsZSAvIGxhc3RTY2FsZTtcbiAgICAgICAgLy8gbG9nKGxhc3RTY2FsZSwgY3VycmVudFNjYWxlLCBzY2FsZURlbHRhKTtcbiAgICAgICAgbGFzdFNjYWxlID0gY3VycmVudFNjYWxlO1xuXG4gICAgICAgIGxldCBjdXJyZW50Um90YXRpb24gPSBldmVudC5yb3RhdGlvbjtcbiAgICAgICAgbGV0IHJvdGF0aW9uRGVsdGEgPSBjdXJyZW50Um90YXRpb24gLSBsYXN0Um90YXRpb247XG4gICAgICAgIGxvZyhsYXN0Um90YXRpb24sIGN1cnJlbnRSb3RhdGlvbiwgcm90YXRpb25EZWx0YSk7XG4gICAgICAgIGxhc3RSb3RhdGlvbiA9IGN1cnJlbnRSb3RhdGlvbjtcblxuICAgICAgICAvLyBsb2coYHNjYWxpbmcgYnkgJHtzY2FsZURlbHRhfWApO1xuICAgICAgICAvLyBsb2coYHJvdGF0aW5nIGJ5ICR7cm90YXRpb25EZWx0YX1gKTtcblxuICAgICAgICBwaW5jaGVkR3JvdXAucG9zaXRpb24gPSBldmVudC5jZW50ZXI7XG4gICAgICAgIHBpbmNoZWRHcm91cC5zY2FsZShzY2FsZURlbHRhKTtcbiAgICAgICAgcGluY2hlZEdyb3VwLnJvdGF0ZShyb3RhdGlvbkRlbHRhKTtcblxuICAgICAgICBwaW5jaGVkR3JvdXAuZGF0YS5zY2FsZSAqPSBzY2FsZURlbHRhO1xuICAgICAgICBwaW5jaGVkR3JvdXAuZGF0YS5yb3RhdGlvbiArPSByb3RhdGlvbkRlbHRhO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxldCBsYXN0RXZlbnQ7XG4gICAgZnVuY3Rpb24gcGluY2hFbmQoZXZlbnQpIHtcbiAgICAgIC8vIHdhaXQgMjUwIG1zIHRvIHByZXZlbnQgbWlzdGFrZW4gcGFuIHJlYWRpbmdzXG4gICAgICBsYXN0RXZlbnQgPSBldmVudDtcbiAgICAgIGlmICghIXBpbmNoZWRHcm91cCkge1xuICAgICAgICBwaW5jaGVkR3JvdXAuZGF0YS51cGRhdGUgPSB0cnVlO1xuICAgICAgICBsZXQgbW92ZSA9IHtcbiAgICAgICAgICBpZDogcGluY2hlZEdyb3VwLmlkLFxuICAgICAgICAgIHR5cGU6ICd0cmFuc2Zvcm0nXG4gICAgICAgIH07XG4gICAgICAgIGlmIChwaW5jaGVkR3JvdXAucG9zaXRpb24gIT0gb3JpZ2luYWxQb3NpdGlvbikge1xuICAgICAgICAgIG1vdmUucG9zaXRpb24gPSBvcmlnaW5hbFBvc2l0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBpbmNoZWRHcm91cC5kYXRhLnJvdGF0aW9uICE9IG9yaWdpbmFsUm90YXRpb24pIHtcbiAgICAgICAgICBtb3ZlLnJvdGF0aW9uID0gb3JpZ2luYWxSb3RhdGlvbiAtIHBpbmNoZWRHcm91cC5kYXRhLnJvdGF0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBpbmNoZWRHcm91cC5kYXRhLnNjYWxlICE9IG9yaWdpbmFsU2NhbGUpIHtcbiAgICAgICAgICBtb3ZlLnNjYWxlID0gb3JpZ2luYWxTY2FsZSAvIHBpbmNoZWRHcm91cC5kYXRhLnNjYWxlO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9nKCdmaW5hbCBzY2FsZScsIHBpbmNoZWRHcm91cC5kYXRhLnNjYWxlKTtcbiAgICAgICAgbG9nKG1vdmUpO1xuXG4gICAgICAgIE1PVkVTLnB1c2gobW92ZSk7XG5cbiAgICAgICAgaWYgKE1hdGguYWJzKGV2ZW50LnZlbG9jaXR5KSA+IDEpIHtcbiAgICAgICAgICAvLyBkaXNwb3NlIG9mIGdyb3VwIG9mZnNjcmVlblxuICAgICAgICAgIHRocm93UGluY2hlZEdyb3VwKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZiAocnVuQW5pbWF0aW9ucykge1xuICAgICAgICAvLyAgIHBpbmNoZWRHcm91cC5hbmltYXRlKHtcbiAgICAgICAgLy8gICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgLy8gICAgICAgc2NhbGU6IDAuOFxuICAgICAgICAvLyAgICAgfSxcbiAgICAgICAgLy8gICAgIHNldHRpbmdzOiB7XG4gICAgICAgIC8vICAgICAgIGR1cmF0aW9uOiAxMDAsXG4gICAgICAgIC8vICAgICAgIGVhc2luZzogXCJlYXNlT3V0XCIsXG4gICAgICAgIC8vICAgICB9XG4gICAgICAgIC8vICAgfSk7XG4gICAgICAgIC8vIH1cbiAgICAgIH1cbiAgICAgIHBpbmNoaW5nID0gZmFsc2U7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICBoYW1tZXJNYW5hZ2VyLmdldCgncGFuJykuc2V0KHtlbmFibGU6IHRydWV9KTtcbiAgICAgIH0sIDI1MCk7XG4gICAgfVxuXG4gICAgY29uc3QgaGl0T3B0aW9ucyA9IHtcbiAgICAgIHNlZ21lbnRzOiBmYWxzZSxcbiAgICAgIHN0cm9rZTogdHJ1ZSxcbiAgICAgIGZpbGw6IHRydWUsXG4gICAgICB0b2xlcmFuY2U6IDVcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gc2luZ2xlVGFwKGV2ZW50KSB7XG4gICAgICBjb25zdCBwb2ludGVyID0gZXZlbnQuY2VudGVyLFxuICAgICAgICAgIHBvaW50ID0gbmV3IFBvaW50KHBvaW50ZXIueCwgcG9pbnRlci55KSxcbiAgICAgICAgICBoaXRSZXN1bHQgPSBwYXBlci5wcm9qZWN0LmhpdFRlc3QocG9pbnQsIGhpdE9wdGlvbnMpO1xuXG4gICAgICBpZiAoaGl0UmVzdWx0KSB7XG4gICAgICAgIGxldCBpdGVtID0gaGl0UmVzdWx0Lml0ZW07XG4gICAgICAgIGl0ZW0uc2VsZWN0ZWQgPSAhaXRlbS5zZWxlY3RlZDtcbiAgICAgICAgbG9nKGl0ZW0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRvdWJsZVRhcChldmVudCkge1xuICAgICAgY29uc3QgcG9pbnRlciA9IGV2ZW50LmNlbnRlcixcbiAgICAgICAgICBwb2ludCA9IG5ldyBQb2ludChwb2ludGVyLngsIHBvaW50ZXIueSksXG4gICAgICAgICAgaGl0UmVzdWx0ID0gcGFwZXIucHJvamVjdC5oaXRUZXN0KHBvaW50LCBoaXRPcHRpb25zKTtcblxuICAgICAgaWYgKGhpdFJlc3VsdCkge1xuICAgICAgICBsZXQgaXRlbSA9IGhpdFJlc3VsdC5pdGVtO1xuICAgICAgICBsZXQgcGFyZW50ID0gaXRlbS5wYXJlbnQ7XG5cbiAgICAgICAgaWYgKGl0ZW0uZGF0YS5pbnRlcmlvcikge1xuICAgICAgICAgIGl0ZW0uZGF0YS50cmFuc3BhcmVudCA9ICFpdGVtLmRhdGEudHJhbnNwYXJlbnQ7XG5cbiAgICAgICAgICBpZiAoaXRlbS5kYXRhLnRyYW5zcGFyZW50KSB7XG4gICAgICAgICAgICBpdGVtLmZpbGxDb2xvciA9IHRyYW5zcGFyZW50O1xuICAgICAgICAgICAgaXRlbS5zdHJva2VDb2xvciA9IHRyYW5zcGFyZW50O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpdGVtLmZpbGxDb2xvciA9IHBhcmVudC5kYXRhLmNvbG9yO1xuICAgICAgICAgICAgaXRlbS5zdHJva2VDb2xvciA9IHBhcmVudC5kYXRhLmNvbG9yO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIE1PVkVTLnB1c2goe1xuICAgICAgICAgICAgdHlwZTogJ2ZpbGxDaGFuZ2UnLFxuICAgICAgICAgICAgaWQ6IGl0ZW0uaWQsXG4gICAgICAgICAgICBmaWxsOiBwYXJlbnQuZGF0YS5jb2xvcixcbiAgICAgICAgICAgIHRyYW5zcGFyZW50OiBpdGVtLmRhdGEudHJhbnNwYXJlbnRcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsb2coJ25vdCBpbnRlcmlvcicpXG4gICAgICAgIH1cblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGluY2hlZEdyb3VwID0gbnVsbDtcbiAgICAgICAgbG9nKCdoaXQgbm8gaXRlbScpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHZlbG9jaXR5TXVsdGlwbGllciA9IDI1O1xuICAgIGZ1bmN0aW9uIHRocm93UGluY2hlZEdyb3VwKCkge1xuICAgICAgbG9nKHBpbmNoZWRHcm91cC5wb3NpdGlvbik7XG4gICAgICBpZiAocGluY2hlZEdyb3VwLnBvc2l0aW9uLnggPD0gMCAtIHBpbmNoZWRHcm91cC5ib3VuZHMud2lkdGggfHxcbiAgICAgICAgICBwaW5jaGVkR3JvdXAucG9zaXRpb24ueCA+PSB2aWV3V2lkdGggKyBwaW5jaGVkR3JvdXAuYm91bmRzLndpZHRoIHx8XG4gICAgICAgICAgcGluY2hlZEdyb3VwLnBvc2l0aW9uLnkgPD0gMCAtIHBpbmNoZWRHcm91cC5ib3VuZHMuaGVpZ2h0IHx8XG4gICAgICAgICAgcGluY2hlZEdyb3VwLnBvc2l0aW9uLnkgPj0gdmlld0hlaWdodCArIHBpbmNoZWRHcm91cC5ib3VuZHMuaGVpZ2h0KSB7XG4gICAgICAgICAgICBwaW5jaGVkR3JvdXAuZGF0YS5vZmZTY3JlZW4gPSB0cnVlO1xuICAgICAgICAgICAgcGluY2hlZEdyb3VwLnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRocm93UGluY2hlZEdyb3VwKTtcbiAgICAgIHBpbmNoZWRHcm91cC5wb3NpdGlvbi54ICs9IGxhc3RFdmVudC52ZWxvY2l0eVggKiB2ZWxvY2l0eU11bHRpcGxpZXI7XG4gICAgICBwaW5jaGVkR3JvdXAucG9zaXRpb24ueSArPSBsYXN0RXZlbnQudmVsb2NpdHlZICogdmVsb2NpdHlNdWx0aXBsaWVyO1xuICAgIH1cblxuICAgIHZhciBoYW1tZXJNYW5hZ2VyID0gbmV3IEhhbW1lci5NYW5hZ2VyKCRjYW52YXNbMF0pO1xuXG4gICAgaGFtbWVyTWFuYWdlci5hZGQobmV3IEhhbW1lci5UYXAoeyBldmVudDogJ2RvdWJsZXRhcCcsIHRhcHM6IDIgfSkpO1xuICAgIGhhbW1lck1hbmFnZXIuYWRkKG5ldyBIYW1tZXIuVGFwKHsgZXZlbnQ6ICdzaW5nbGV0YXAnIH0pKTtcbiAgICBoYW1tZXJNYW5hZ2VyLmFkZChuZXcgSGFtbWVyLlBhbih7IGRpcmVjdGlvbjogSGFtbWVyLkRJUkVDVElPTl9BTEwgfSkpO1xuICAgIGhhbW1lck1hbmFnZXIuYWRkKG5ldyBIYW1tZXIuUGluY2goKSk7XG5cbiAgICBoYW1tZXJNYW5hZ2VyLmdldCgnZG91YmxldGFwJykucmVjb2duaXplV2l0aCgnc2luZ2xldGFwJyk7XG4gICAgaGFtbWVyTWFuYWdlci5nZXQoJ3NpbmdsZXRhcCcpLnJlcXVpcmVGYWlsdXJlKCdkb3VibGV0YXAnKTtcbiAgICBoYW1tZXJNYW5hZ2VyLmdldCgncGFuJykucmVxdWlyZUZhaWx1cmUoJ3BpbmNoJyk7XG5cbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdzaW5nbGV0YXAnLCBzaW5nbGVUYXApO1xuICAgIGhhbW1lck1hbmFnZXIub24oJ2RvdWJsZXRhcCcsIGRvdWJsZVRhcCk7XG5cbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdwYW5zdGFydCcsIHBhblN0YXJ0KTtcbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdwYW5tb3ZlJywgcGFuTW92ZSk7XG4gICAgaGFtbWVyTWFuYWdlci5vbigncGFuZW5kJywgcGFuRW5kKTtcblxuICAgIGhhbW1lck1hbmFnZXIub24oJ3BpbmNoc3RhcnQnLCBwaW5jaFN0YXJ0KTtcbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdwaW5jaG1vdmUnLCBwaW5jaE1vdmUpO1xuICAgIGhhbW1lck1hbmFnZXIub24oJ3BpbmNoZW5kJywgcGluY2hFbmQpO1xuICAgIGhhbW1lck1hbmFnZXIub24oJ3BpbmNoY2FuY2VsJywgZnVuY3Rpb24oKSB7IGhhbW1lck1hbmFnZXIuZ2V0KCdwYW4nKS5zZXQoe2VuYWJsZTogdHJ1ZX0pOyB9KTsgLy8gbWFrZSBzdXJlIGl0J3MgcmVlbmFibGVkXG4gIH1cblxuICBmdW5jdGlvbiBuZXdQcmVzc2VkKCkge1xuICAgIGxvZygnbmV3IHByZXNzZWQnKTtcblxuICAgIHBhcGVyLnByb2plY3QuYWN0aXZlTGF5ZXIucmVtb3ZlQ2hpbGRyZW4oKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVuZG9QcmVzc2VkKCkge1xuICAgIGxvZygndW5kbyBwcmVzc2VkJyk7XG4gICAgaWYgKCEoTU9WRVMubGVuZ3RoID4gMCkpIHtcbiAgICAgIGxvZygnbm8gbW92ZXMgeWV0Jyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IGxhc3RNb3ZlID0gTU9WRVMucG9wKCk7XG4gICAgbGV0IGl0ZW0gPSBwcm9qZWN0LmdldEl0ZW0oe1xuICAgICAgaWQ6IGxhc3RNb3ZlLmlkXG4gICAgfSk7XG5cbiAgICBpZiAoaXRlbSkge1xuICAgICAgaXRlbS52aXNpYmxlID0gdHJ1ZTsgLy8gbWFrZSBzdXJlXG4gICAgICBzd2l0Y2gobGFzdE1vdmUudHlwZSkge1xuICAgICAgICBjYXNlICduZXdHcm91cCc6XG4gICAgICAgICAgbG9nKCdyZW1vdmluZyBncm91cCcpO1xuICAgICAgICAgIGl0ZW0ucmVtb3ZlKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2ZpbGxDaGFuZ2UnOlxuICAgICAgICAgIGlmIChsYXN0TW92ZS50cmFuc3BhcmVudCkge1xuICAgICAgICAgICAgaXRlbS5maWxsQ29sb3IgPSBsYXN0TW92ZS5maWxsO1xuICAgICAgICAgICAgaXRlbS5zdHJva2VDb2xvciA9IGxhc3RNb3ZlLmZpbGw7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGl0ZW0uZmlsbENvbG9yID0gdHJhbnNwYXJlbnQ7XG4gICAgICAgICAgICBpdGVtLnN0cm9rZUNvbG9yID0gdHJhbnNwYXJlbnQ7XG4gICAgICAgICAgfVxuICAgICAgICBjYXNlICd0cmFuc2Zvcm0nOlxuICAgICAgICAgIGlmICghIWxhc3RNb3ZlLnBvc2l0aW9uKSB7XG4gICAgICAgICAgICBpdGVtLnBvc2l0aW9uID0gbGFzdE1vdmUucG9zaXRpb25cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCEhbGFzdE1vdmUucm90YXRpb24pIHtcbiAgICAgICAgICAgIGl0ZW0ucm90YXRpb24gPSBsYXN0TW92ZS5yb3RhdGlvbjtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCEhbGFzdE1vdmUuc2NhbGUpIHtcbiAgICAgICAgICAgIGl0ZW0uc2NhbGUobGFzdE1vdmUuc2NhbGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBsb2coJ3Vua25vd24gY2FzZScpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBsb2coJ2NvdWxkIG5vdCBmaW5kIG1hdGNoaW5nIGl0ZW0nKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBwbGF5UHJlc3NlZCgpIHtcbiAgICBsb2coJ3BsYXkgcHJlc3NlZCcpO1xuICB9XG5cbiAgZnVuY3Rpb24gdGlwc1ByZXNzZWQoKSB7XG4gICAgbG9nKCd0aXBzIHByZXNzZWQnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNoYXJlUHJlc3NlZCgpIHtcbiAgICBsb2coJ3NoYXJlIHByZXNzZWQnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXROZXcoKSB7XG4gICAgJCgnLm1haW4tY29udHJvbHMgLm5ldycpLm9uKCdjbGljayB0YXAgdG91Y2gnLCBuZXdQcmVzc2VkKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRVbmRvKCkge1xuICAgICQoJy5tYWluLWNvbnRyb2xzIC51bmRvJykub24oJ2NsaWNrJywgdW5kb1ByZXNzZWQpO1xuICB9XG4gIGZ1bmN0aW9uIGluaXRQbGF5KCkge1xuICAgICQoJy5tYWluLWNvbnRyb2xzIC5wbGF5Jykub24oJ2NsaWNrJywgcGxheVByZXNzZWQpO1xuICB9XG4gIGZ1bmN0aW9uIGluaXRUaXBzKCkge1xuICAgICQoJy5hdXgtY29udHJvbHMgLnRpcHMnKS5vbignY2xpY2snLCB0aXBzUHJlc3NlZCk7XG4gIH1cbiAgZnVuY3Rpb24gaW5pdFNoYXJlKCkge1xuICAgICQoJy5hdXgtY29udHJvbHMgLnNoYXJlJykub24oJ2NsaWNrJywgc2hhcmVQcmVzc2VkKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRyYXdDaXJjbGUoKSB7XG4gICAgbGV0IGNpcmNsZSA9IG5ldyBQYXRoLkNpcmNsZSh7XG4gICAgICBjZW50ZXI6IFs0MDAsIDQwMF0sXG4gICAgICByYWRpdXM6IDEwMCxcbiAgICAgIHN0cm9rZUNvbG9yOiAnZ3JlZW4nLFxuICAgICAgZmlsbENvbG9yOiAnZ3JlZW4nXG4gICAgfSk7XG4gICAgbGV0IGdyb3VwID0gbmV3IEdyb3VwKGNpcmNsZSk7XG4gIH1cblxuICBmdW5jdGlvbiBtYWluKCkge1xuICAgIGluaXRDb250cm9sUGFuZWwoKTtcbiAgICAvLyBkcmF3Q2lyY2xlKCk7XG4gICAgaW5pdFZpZXdWYXJzKCk7XG4gIH1cblxuICBtYWluKCk7XG59KTtcbiIsImNvbnN0IHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcbmNvbnN0IGNvbmZpZyA9IHJlcXVpcmUoJy4vLi4vLi4vY29uZmlnJyk7XG5cbmZ1bmN0aW9uIGxvZyguLi50aGluZykge1xuICB1dGlsLmxvZyguLi50aGluZyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRJZGVhbEdlb21ldHJ5KHBhdGhEYXRhLCBzaWRlcywgc2ltcGxpZmllZFBhdGgpIHtcbiAgY29uc3QgdGhyZXNob2xkRGlzdCA9IDAuMDUgKiBzaW1wbGlmaWVkUGF0aC5sZW5ndGg7XG5cbiAgbGV0IHJldHVyblBhdGggPSBuZXcgUGF0aCh7XG4gICAgc3Ryb2tlV2lkdGg6IDUsXG4gICAgc3Ryb2tlQ29sb3I6ICdwaW5rJ1xuICB9KTtcblxuICBsZXQgdHJ1ZWRQYXRoID0gbmV3IFBhdGgoe1xuICAgIHN0cm9rZVdpZHRoOiA1LFxuICAgIHN0cm9rZUNvbG9yOiAnZ3JlZW4nXG4gIH0pO1xuXG4gIC8vIG5ldyBQYXRoLkNpcmNsZSh7XG4gIC8vICAgY2VudGVyOiBzaW1wbGlmaWVkUGF0aC5maXJzdFNlZ21lbnQucG9pbnQsXG4gIC8vICAgcmFkaXVzOiAzLFxuICAvLyAgIGZpbGxDb2xvcjogJ2JsYWNrJ1xuICAvLyB9KTtcblxuICBsZXQgZmlyc3RQb2ludCA9IG5ldyBQYXRoLkNpcmNsZSh7XG4gICAgY2VudGVyOiBzaW1wbGlmaWVkUGF0aC5maXJzdFNlZ21lbnQucG9pbnQsXG4gICAgcmFkaXVzOiAxMCxcbiAgICBzdHJva2VDb2xvcjogJ2JsdWUnXG4gIH0pO1xuXG4gIGxldCBsYXN0UG9pbnQgPSBuZXcgUGF0aC5DaXJjbGUoe1xuICAgIGNlbnRlcjogc2ltcGxpZmllZFBhdGgubGFzdFNlZ21lbnQucG9pbnQsXG4gICAgcmFkaXVzOiAxMCxcbiAgICBzdHJva2VDb2xvcjogJ3JlZCdcbiAgfSk7XG5cblxuICBsZXQgYW5nbGUsIHByZXZBbmdsZSwgYW5nbGVEZWx0YTtcbiAgQmFzZS5lYWNoKHNpZGVzLCAoc2lkZSwgaSkgPT4ge1xuICAgIGxldCBmaXJzdFBvaW50ID0gc2lkZVswXTtcbiAgICBsZXQgbGFzdFBvaW50ID0gc2lkZVtzaWRlLmxlbmd0aCAtIDFdO1xuXG4gICAgYW5nbGUgPSBNYXRoLmF0YW4yKGxhc3RQb2ludC55IC0gZmlyc3RQb2ludC55LCBsYXN0UG9pbnQueCAtIGZpcnN0UG9pbnQueCk7XG5cbiAgICBpZiAoISFwcmV2QW5nbGUpIHtcbiAgICAgIGFuZ2xlRGVsdGEgPSB1dGlsLmFuZ2xlRGVsdGEoYW5nbGUsIHByZXZBbmdsZSk7XG4gICAgICBjb25zb2xlLmxvZyhhbmdsZURlbHRhKTtcbiAgICAgIHJldHVyblBhdGguYWRkKGZpcnN0UG9pbnQpO1xuICAgICAgcmV0dXJuUGF0aC5hZGQobGFzdFBvaW50KTtcbiAgICB9XG5cbiAgICBwcmV2QW5nbGUgPSBhbmdsZTtcbiAgfSk7XG5cbiAgQmFzZS5lYWNoKHNpbXBsaWZpZWRQYXRoLnNlZ21lbnRzLCAoc2VnbWVudCwgaSkgPT4ge1xuICAgIGxldCBpbnRlZ2VyUG9pbnQgPSBnZXRJbnRlZ2VyUG9pbnQoc2VnbWVudC5wb2ludCk7XG4gICAgbGV0IG5lYXJlc3RQb2ludCA9IHJldHVyblBhdGguZ2V0TmVhcmVzdFBvaW50KGludGVnZXJQb2ludCk7XG4gICAgLy8gY29uc29sZS5sb2coaW50ZWdlclBvaW50LmdldERpc3RhbmNlKG5lYXJlc3RQb2ludCksIHRocmVzaG9sZERpc3QpO1xuICAgIGlmIChpbnRlZ2VyUG9pbnQuZ2V0RGlzdGFuY2UobmVhcmVzdFBvaW50KSA8PSB0aHJlc2hvbGREaXN0KSB7XG4gICAgICB0cnVlZFBhdGguYWRkKG5lYXJlc3RQb2ludCk7XG4gICAgICBuZXcgUGF0aC5DaXJjbGUoe1xuICAgICAgICBjZW50ZXI6IG5lYXJlc3RQb2ludCxcbiAgICAgICAgcmFkaXVzOiAzLFxuICAgICAgICBmaWxsQ29sb3I6ICdibGFjaydcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZygnb2ZmIHBhdGgnKTtcbiAgICAgIHRydWVkUGF0aC5hZGQoaW50ZWdlclBvaW50KTtcbiAgICAgIG5ldyBQYXRoLkNpcmNsZSh7XG4gICAgICAgIGNlbnRlcjogaW50ZWdlclBvaW50LFxuICAgICAgICByYWRpdXM6IDMsXG4gICAgICAgIGZpbGxDb2xvcjogJ2dyZWVuJ1xuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxuICAvLyB0cnVlZFBhdGguYWRkKHNpbXBsaWZpZWRQYXRoLmxhc3RTZWdtZW50LnBvaW50KTtcbiAgLy8gbmV3IFBhdGguQ2lyY2xlKHtcbiAgLy8gICBjZW50ZXI6IHNpbXBsaWZpZWRQYXRoLmxhc3RTZWdtZW50LnBvaW50LFxuICAvLyAgIHJhZGl1czogMyxcbiAgLy8gICBmaWxsQ29sb3I6ICdibGFjaydcbiAgLy8gfSk7XG5cbiAgaWYgKHNpbXBsaWZpZWRQYXRoLmNsb3NlZCkge1xuICAgIHRydWVkUGF0aC5jbG9zZWQgPSB0cnVlO1xuICB9XG5cbiAgLy8gQmFzZS5lYWNoKHRydWVkUGF0aCwgKHBvaW50LCBpKSA9PiB7XG4gIC8vICAgdHJ1ZWRQYXRoLnJlbW92ZVNlZ21lbnQoaSk7XG4gIC8vIH0pO1xuXG4gIHJldHVybiB0cnVlZFBhdGg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBPbGRnZXRJZGVhbEdlb21ldHJ5KHBhdGhEYXRhLCBwYXRoKSB7XG4gIGNvbnN0IHRocmVzaG9sZEFuZ2xlID0gTWF0aC5QSSAvIDI7XG4gIGNvbnN0IHRocmVzaG9sZERpc3QgPSAwLjEgKiBwYXRoLmxlbmd0aDtcbiAgLy8gbG9nKHBhdGgpO1xuXG4gIGxldCBjb3VudCA9IDA7XG5cbiAgbGV0IHNpZGVzID0gW107XG4gIGxldCBzaWRlID0gW107XG4gIGxldCBwcmV2O1xuICBsZXQgcHJldkFuZ2xlO1xuXG4gIC8vIGxvZygndGhyZXNob2xkQW5nbGUnLCB0aHJlc2hvbGRBbmdsZSk7XG5cbiAgbGV0IHJldHVyblBhdGggPSBuZXcgUGF0aCgpO1xuXG4gIEJhc2UuZWFjaChwYXRoLnNlZ21lbnRzLCAoc2VnbWVudCwgaSkgPT4ge1xuICAgIGxldCBpbnRlZ2VyUG9pbnQgPSBnZXRJbnRlZ2VyUG9pbnQoc2VnbWVudC5wb2ludCk7XG4gICAgbGV0IHBvaW50U3RyID0gc3RyaW5naWZ5UG9pbnQoaW50ZWdlclBvaW50KTtcbiAgICBsZXQgcG9pbnREYXRhO1xuICAgIGlmIChwb2ludFN0ciBpbiBwYXRoRGF0YSkge1xuICAgICAgcG9pbnREYXRhID0gcGF0aERhdGFbcG9pbnRTdHJdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgbmVhcmVzdFBvaW50ID0gZ2V0Q2xvc2VzdFBvaW50RnJvbVBhdGhEYXRhKHBhdGhEYXRhLCBpbnRlZ2VyUG9pbnQpO1xuICAgICAgcG9pbnRTdHIgPSBzdHJpbmdpZnlQb2ludChuZWFyZXN0UG9pbnQpO1xuXG4gICAgICBpZiAocG9pbnRTdHIgaW4gcGF0aERhdGEpIHtcbiAgICAgICAgcG9pbnREYXRhID0gcGF0aERhdGFbcG9pbnRTdHJdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbG9nKCdjb3VsZCBub3QgZmluZCBjbG9zZSBwb2ludCcpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwb2ludERhdGEpIHtcbiAgICAgIHJldHVyblBhdGguYWRkKGludGVnZXJQb2ludCk7XG4gICAgICBuZXcgUGF0aC5DaXJjbGUoe1xuICAgICAgICBjZW50ZXI6IGludGVnZXJQb2ludCxcbiAgICAgICAgcmFkaXVzOiA1LFxuICAgICAgICBzdHJva2VDb2xvcjogbmV3IENvbG9yKGkgLyBwYXRoLnNlZ21lbnRzLmxlbmd0aCwgaSAvIHBhdGguc2VnbWVudHMubGVuZ3RoLCBpIC8gcGF0aC5zZWdtZW50cy5sZW5ndGgpXG4gICAgICB9KTtcbiAgICAgIGxvZyhwb2ludERhdGEucG9pbnQpO1xuICAgICAgaWYgKCFwcmV2KSB7XG4gICAgICAgIC8vIGZpcnN0IHBvaW50XG4gICAgICAgIC8vIGxvZygncHVzaGluZyBmaXJzdCBwb2ludCB0byBzaWRlJyk7XG4gICAgICAgIHNpZGUucHVzaChwb2ludERhdGEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gbGV0IGFuZ2xlRm9vID0gaW50ZWdlclBvaW50LmdldERpcmVjdGVkQW5nbGUocHJldik7XG4gICAgICAgIGxldCBhbmdsZSA9IE1hdGguYXRhbjIoaW50ZWdlclBvaW50LnksIGludGVnZXJQb2ludC54KSAtIE1hdGguYXRhbjIocHJldi55LCBwcmV2LngpO1xuICAgICAgICBpZiAoYW5nbGUgPCAwKSBhbmdsZSArPSAoMiAqIE1hdGguUEkpOyAvLyBub3JtYWxpemUgdG8gWzAsIDLPgClcbiAgICAgICAgLy8gbG9nKGFuZ2xlRm9vLCBhbmdsZUJhcik7XG4gICAgICAgIC8vIGxldCBhbmdsZSA9IE1hdGguYXRhbjIoaW50ZWdlclBvaW50LnkgLSBwcmV2LnksIGludGVnZXJQb2ludC54IC0gcHJldi54KTtcbiAgICAgICAgLy8gbGV0IGxpbmUgPSBuZXcgUGF0aC5MaW5lKHByZXYsIGludGVnZXJQb2ludCk7XG4gICAgICAgIC8vIGxpbmUuc3Ryb2tlV2lkdGggPSA1O1xuICAgICAgICAvLyBsaW5lLnN0cm9rZUNvbG9yID0gJ3BpbmsnO1xuICAgICAgICAvLyBsaW5lLnJvdGF0ZSh1dGlsLmRlZyhNYXRoLmNvcyhhbmdsZSkgKiBNYXRoLlBJICogMikpO1xuICAgICAgICAvLyBsb2coJ2FuZ2xlJywgYW5nbGUpO1xuICAgICAgICBpZiAodHlwZW9mIHByZXZBbmdsZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAvLyBzZWNvbmQgcG9pbnRcbiAgICAgICAgICBzaWRlLnB1c2gocG9pbnREYXRhKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxldCBhbmdsZURpZmZlcmVuY2UgPSBNYXRoLnBvdyhhbmdsZSAtIHByZXZBbmdsZSwgMik7XG4gICAgICAgICAgbG9nKCdhbmdsZURpZmZlcmVuY2UnLCBhbmdsZURpZmZlcmVuY2UpO1xuICAgICAgICAgIGlmIChhbmdsZURpZmZlcmVuY2UgPD0gdGhyZXNob2xkQW5nbGUpIHtcbiAgICAgICAgICAgIC8vIHNhbWUgc2lkZVxuICAgICAgICAgICAgLy8gbG9nKCdwdXNoaW5nIHBvaW50IHRvIHNhbWUgc2lkZScpO1xuICAgICAgICAgICAgc2lkZS5wdXNoKHBvaW50RGF0YSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIG5ldyBzaWRlXG4gICAgICAgICAgICAvLyBsb2coJ25ldyBzaWRlJyk7XG4gICAgICAgICAgICBzaWRlcy5wdXNoKHNpZGUpO1xuICAgICAgICAgICAgc2lkZSA9IFtwb2ludERhdGFdO1xuXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJldkFuZ2xlID0gYW5nbGU7XG4gICAgICB9XG5cbiAgICAgIHByZXYgPSBpbnRlZ2VyUG9pbnQ7XG4gICAgICBjb3VudCsrO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb2coJ25vIGRhdGEnKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIGxvZyhjb3VudCk7XG5cbiAgc2lkZXMucHVzaChzaWRlKTtcblxuICByZXR1cm4gc2lkZXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRJbnRlZ2VyUG9pbnQocG9pbnQpIHtcbiAgcmV0dXJuIG5ldyBQb2ludChNYXRoLmZsb29yKHBvaW50LngpLCBNYXRoLmZsb29yKHBvaW50LnkpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0cmluZ2lmeVBvaW50KHBvaW50KSB7XG4gIHJldHVybiBgJHtNYXRoLmZsb29yKHBvaW50LngpfSwke01hdGguZmxvb3IocG9pbnQueSl9YDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlUG9pbnQocG9pbnRTdHIpIHtcbiAgbGV0IHNwbGl0ID0gcG9pbnRTdHIuc3BsaXQoJywnKS5tYXAoKG51bSkgPT4gTWF0aC5mbG9vcihudW0pKTtcblxuICBpZiAoc3BsaXQubGVuZ3RoID49IDIpIHtcbiAgICByZXR1cm4gbmV3IFBvaW50KHNwbGl0WzBdLCBzcGxpdFsxXSk7XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldENsb3Nlc3RQb2ludEZyb21QYXRoRGF0YShwYXRoRGF0YSwgcG9pbnQpIHtcbiAgbGV0IGxlYXN0RGlzdGFuY2UsIGNsb3Nlc3RQb2ludDtcblxuICBCYXNlLmVhY2gocGF0aERhdGEsIChkYXR1bSwgaSkgPT4ge1xuICAgIGxldCBkaXN0YW5jZSA9IHBvaW50LmdldERpc3RhbmNlKGRhdHVtLnBvaW50KTtcbiAgICBpZiAoIWxlYXN0RGlzdGFuY2UgfHwgZGlzdGFuY2UgPCBsZWFzdERpc3RhbmNlKSB7XG4gICAgICBsZWFzdERpc3RhbmNlID0gZGlzdGFuY2U7XG4gICAgICBjbG9zZXN0UG9pbnQgPSBkYXR1bS5wb2ludDtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBjbG9zZXN0UG9pbnQgfHwgcG9pbnQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb21wdXRlZENvcm5lcnMocGF0aCkge1xuICBjb25zdCB0aHJlc2hvbGRBbmdsZSA9IHV0aWwucmFkKGNvbmZpZy5zaGFwZS5jb3JuZXJUaHJlc2hvbGREZWcpO1xuICBjb25zdCB0aHJlc2hvbGREaXN0YW5jZSA9IDAuMSAqIHBhdGgubGVuZ3RoO1xuXG4gIGxldCBjb3JuZXJzID0gW107XG5cbiAgaWYgKHBhdGgubGVuZ3RoID4gMCkge1xuICAgIGxldCBwb2ludCwgcHJldjtcbiAgICBsZXQgYW5nbGUsIHByZXZBbmdsZSwgYW5nbGVEZWx0YTtcblxuICAgIEJhc2UuZWFjaChwYXRoLnNlZ21lbnRzLCAoc2VnbWVudCwgaSkgPT4ge1xuICAgICAgbGV0IHBvaW50ID0gZ2V0SW50ZWdlclBvaW50KHNlZ21lbnQucG9pbnQpO1xuICAgICAgaWYgKCEhcHJldikge1xuICAgICAgICBsZXQgYW5nbGUgPSBNYXRoLmF0YW4yKHBvaW50LnkgLSBwcmV2LnksIHBvaW50LnggLSBwcmV2LngpO1xuICAgICAgICBpZiAoYW5nbGUgPCAwKSBhbmdsZSArPSAoMiAqIE1hdGguUEkpOyAvLyBub3JtYWxpemUgdG8gWzAsIDLPgClcbiAgICAgICAgaWYgKCEhcHJldkFuZ2xlKSB7XG4gICAgICAgICAgYW5nbGVEZWx0YSA9IHV0aWwuYW5nbGVEZWx0YShhbmdsZSwgcHJldkFuZ2xlKTtcbiAgICAgICAgICBpZiAoYW5nbGVEZWx0YSA+PSB0aHJlc2hvbGRBbmdsZSkge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ2Nvcm5lcicpO1xuICAgICAgICAgICAgLy8gbmV3IFBhdGguQ2lyY2xlKHtcbiAgICAgICAgICAgIC8vICAgY2VudGVyOiBwcmV2LFxuICAgICAgICAgICAgLy8gICByYWRpdXM6IDEwLFxuICAgICAgICAgICAgLy8gICBmaWxsQ29sb3I6ICdwaW5rJ1xuICAgICAgICAgICAgLy8gfSk7XG4gICAgICAgICAgICBjb3JuZXJzLnB1c2gocHJldik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGFuZ2xlRGVsdGEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByZXZBbmdsZSA9IGFuZ2xlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZmlyc3QgcG9pbnRcbiAgICAgICAgY29ybmVycy5wdXNoKHBvaW50KTtcbiAgICAgICAgLy8gbmV3IFBhdGguQ2lyY2xlKHtcbiAgICAgICAgLy8gICBjZW50ZXI6IHBvaW50LFxuICAgICAgICAvLyAgIHJhZGl1czogMTAsXG4gICAgICAgIC8vICAgZmlsbENvbG9yOiAncGluaydcbiAgICAgICAgLy8gfSlcbiAgICAgIH1cbiAgICAgIHByZXYgPSBwb2ludDtcbiAgICB9KTtcblxuICAgIGxldCBsYXN0U2VnbWVudFBvaW50ID0gZ2V0SW50ZWdlclBvaW50KHBhdGgubGFzdFNlZ21lbnQucG9pbnQpO1xuICAgIGNvcm5lcnMucHVzaChsYXN0U2VnbWVudFBvaW50KTtcblxuICAgIGxldCByZXR1cm5Db3JuZXJzID0gW107XG4gICAgbGV0IHNraXBwZWRJZHMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvcm5lcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBwb2ludCA9IGNvcm5lcnNbaV07XG5cbiAgICAgIGlmIChpICE9PSAwKSB7XG4gICAgICAgIGxldCBkaXN0ID0gcG9pbnQuZ2V0RGlzdGFuY2UocHJldik7XG4gICAgICAgIGxldCBjbG9zZXN0UG9pbnRzID0gW107XG4gICAgICAgIHdoaWxlIChkaXN0IDwgdGhyZXNob2xkRGlzdGFuY2UpIHtcbiAgICAgICAgICBjbG9zZXN0UG9pbnRzLnB1c2goe1xuICAgICAgICAgICAgcG9pbnQ6IHBvaW50LFxuICAgICAgICAgICAgaW5kZXg6IGlcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIGlmIChpIDwgY29ybmVycy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgICAgICBwcmV2ID0gcG9pbnQ7XG4gICAgICAgICAgICBwb2ludCA9IGNvcm5lcnNbaV07XG4gICAgICAgICAgICBkaXN0ID0gcG9pbnQuZ2V0RGlzdGFuY2UocHJldik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoY2xvc2VzdFBvaW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgbGV0IFtzdW1YLCBzdW1ZXSA9IFswLCAwXTtcblxuICAgICAgICAgIEJhc2UuZWFjaChjbG9zZXN0UG9pbnRzLCAocG9pbnRPYmopID0+IHtcbiAgICAgICAgICAgIHN1bVggKz0gcG9pbnRPYmoucG9pbnQueDtcbiAgICAgICAgICAgIHN1bVkgKz0gcG9pbnRPYmoucG9pbnQueTtcbiAgICAgICAgICB9KTtcblxuXG4gICAgICAgICAgbGV0IFthdmdYLCBhdmdZXSA9IFtzdW1YIC8gY2xvc2VzdFBvaW50cy5sZW5ndGgsIHN1bVkgLyBjbG9zZXN0UG9pbnRzLmxlbmd0aF07XG4gICAgICAgICAgcmV0dXJuQ29ybmVycy5wdXNoKG5ldyBQb2ludChhdmdYLCBhdmdZKSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybkNvcm5lcnMucHVzaChwb2ludCk7XG4gICAgICB9XG5cbiAgICAgIHByZXYgPSBwb2ludDtcbiAgICB9XG5cbiAgICAvLyBCYXNlLmVhY2goY29ybmVycywgKGNvcm5lciwgaSkgPT4ge1xuICAgIC8vICAgbGV0IHBvaW50ID0gY29ybmVyO1xuICAgIC8vXG4gICAgLy8gICBpZiAoaSAhPT0gMCkge1xuICAgIC8vICAgICBsZXQgZGlzdCA9IHBvaW50LmdldERpc3RhbmNlKHByZXYpO1xuICAgIC8vICAgICBsZXQgY2xvc2VzdFBvaW50cyA9IFtdO1xuICAgIC8vICAgICBsZXQgaW5kZXggPSBpO1xuICAgIC8vICAgICB3aGlsZSAoZGlzdCA8IHRocmVzaG9sZERpc3RhbmNlKSB7XG4gICAgLy8gICAgICAgY2xvc2VzdFBvaW50cy5wdXNoKHtcbiAgICAvLyAgICAgICAgIHBvaW50OiBwb2ludCxcbiAgICAvLyAgICAgICAgIGluZGV4OiBpbmRleFxuICAgIC8vICAgICAgIH0pO1xuICAgIC8vICAgICB9XG4gICAgLy8gICAgIGNvbnNvbGUubG9nKGRpc3QsIHRocmVzaG9sZERpc3RhbmNlKTtcbiAgICAvLyAgICAgd2hpbGUgKGRpc3QgPCB0aHJlc2hvbGREaXN0YW5jZSkge1xuICAgIC8vXG4gICAgLy8gICAgIH1cbiAgICAvLyAgIH0gZWxzZSB7XG4gICAgLy8gICAgIHJldHVybkNvcm5lcnMucHVzaChjb3JuZXIpO1xuICAgIC8vICAgfVxuICAgIC8vXG4gICAgLy8gICBwcmV2ID0gcG9pbnQ7XG4gICAgLy8gfSk7XG4gICAgLy8gbmV3IFBhdGguQ2lyY2xlKHtcbiAgICAvLyAgIGNlbnRlcjogbGFzdFNlZ21lbnRQb2ludCxcbiAgICAvLyAgIHJhZGl1czogMTAsXG4gICAgLy8gICBmaWxsQ29sb3I6ICdwaW5rJ1xuICAgIC8vIH0pO1xuICB9XG5cbiAgcmV0dXJuIGNvcm5lcnM7XG59XG4iLCJjb25zdCBjb25maWcgPSByZXF1aXJlKCcuLy4uLy4uL2NvbmZpZycpO1xuXG5leHBvcnQgZnVuY3Rpb24gbG9nKC4uLnRoaW5nKSB7XG4gIGlmIChjb25maWcubG9nKSB7XG4gICAgY29uc29sZS5sb2coLi4udGhpbmcpO1xuICB9XG59XG5cbi8vIENvbnZlcnRzIGZyb20gZGVncmVlcyB0byByYWRpYW5zLlxuZXhwb3J0IGZ1bmN0aW9uIHJhZChkZWdyZWVzKSB7XG4gIHJldHVybiBkZWdyZWVzICogTWF0aC5QSSAvIDE4MDtcbn07XG5cbi8vIENvbnZlcnRzIGZyb20gcmFkaWFucyB0byBkZWdyZWVzLlxuZXhwb3J0IGZ1bmN0aW9uIGRlZyhyYWRpYW5zKSB7XG4gIHJldHVybiByYWRpYW5zICogMTgwIC8gTWF0aC5QSTtcbn07XG5cbi8vIHJldHVybnMgYWJzb2x1dGUgdmFsdWUgb2YgdGhlIGRlbHRhIG9mIHR3byBhbmdsZXMgaW4gcmFkaWFuc1xuZXhwb3J0IGZ1bmN0aW9uIGFuZ2xlRGVsdGEoeCwgeSkge1xuICByZXR1cm4gTWF0aC5hYnMoTWF0aC5hdGFuMihNYXRoLnNpbih5IC0geCksIE1hdGguY29zKHkgLSB4KSkpOztcbn1cblxuLy8gZGlzdGFuY2UgYmV0d2VlbiB0d28gcG9pbnRzXG5leHBvcnQgZnVuY3Rpb24gZGVsdGEocDEsIHAyKSB7XG4gIHJldHVybiBNYXRoLnNxcnQoTWF0aC5wb3cocDEueCAtIHAyLngsIDIpICsgTWF0aC5wb3cocDEueSAtIHAyLnksIDIpKTsgLy8gcHl0aGFnb3JlYW4hXG59XG5cbi8vIHJldHVybnMgYW4gYXJyYXkgb2YgdGhlIGludGVyaW9yIGN1cnZlcyBvZiBhIGdpdmVuIGNvbXBvdW5kIHBhdGhcbmV4cG9ydCBmdW5jdGlvbiBmaW5kSW50ZXJpb3JDdXJ2ZXMocGF0aCkge1xuICBsZXQgaW50ZXJpb3JDdXJ2ZXMgPSBbXTtcbiAgaWYgKCFwYXRoIHx8ICFwYXRoLmNoaWxkcmVuIHx8ICFwYXRoLmNoaWxkcmVuLmxlbmd0aCkgcmV0dXJuO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcGF0aC5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgIGxldCBjaGlsZCA9IHBhdGguY2hpbGRyZW5baV07XG5cbiAgICBpZiAoY2hpbGQuY2xvc2VkKXtcbiAgICAgIGludGVyaW9yQ3VydmVzLnB1c2gobmV3IFBhdGgoY2hpbGQuc2VnbWVudHMpKTtcbiAgICB9XG4gIH1cblxuICBwYXRoLnJlbW92ZSgpO1xuICByZXR1cm4gaW50ZXJpb3JDdXJ2ZXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cnVlR3JvdXAoZ3JvdXAsIGNvcm5lcnMpIHtcbiAgbGV0IG1pZGRsZSA9IGdyb3VwLl9uYW1lZENoaWxkcmVuLm1pZGRsZVswXTtcblxuICBsZXQgaW50ZXJzZWN0aW9ucyA9IG1pZGRsZS5nZXRJbnRlcnNlY3Rpb25zKCk7XG4gIGxldCB0cnVlTmVjZXNzYXJ5ID0gZmFsc2U7XG5cbiAgbGV0IG1pZGRsZUNvcHkgPSBuZXcgUGF0aCgpO1xuICBtaWRkbGVDb3B5LmNvcHlDb250ZW50KG1pZGRsZSk7XG4gIC8vIGRlYnVnZ2VyO1xuXG4gIGlmIChpbnRlcnNlY3Rpb25zLmxlbmd0aCA+IDApIHtcbiAgICAvLyBzZWUgaWYgd2UgY2FuIHRyaW0gdGhlIHBhdGggd2hpbGUgbWFpbnRhaW5pbmcgaW50ZXJzZWN0aW9uc1xuICAgIC8vIGxvZygnaW50ZXJzZWN0aW9ucyEnKTtcbiAgICAvLyBtaWRkbGVDb3B5LnN0cm9rZUNvbG9yID0gJ3llbGxvdyc7XG4gICAgW21pZGRsZUNvcHksIHRydWVOZWNlc3NhcnldID0gdHJpbVBhdGgobWlkZGxlQ29weSwgbWlkZGxlKTtcbiAgICAvLyBtaWRkbGVDb3B5LnN0cm9rZUNvbG9yID0gJ29yYW5nZSc7XG4gIH0gZWxzZSB7XG4gICAgLy8gZXh0ZW5kIGZpcnN0IGFuZCBsYXN0IHNlZ21lbnQgYnkgdGhyZXNob2xkLCBzZWUgaWYgaW50ZXJzZWN0aW9uXG4gICAgLy8gbG9nKCdubyBpbnRlcnNlY3Rpb25zLCBleHRlbmRpbmcgZmlyc3QhJyk7XG4gICAgLy8gbWlkZGxlQ29weS5zdHJva2VDb2xvciA9ICd5ZWxsb3cnO1xuICAgIG1pZGRsZUNvcHkgPSBleHRlbmRQYXRoKG1pZGRsZUNvcHkpO1xuICAgIC8vIG1pZGRsZUNvcHkuc3Ryb2tlQ29sb3IgPSAnb3JhbmdlJztcbiAgICBsZXQgaW50ZXJzZWN0aW9ucyA9IG1pZGRsZUNvcHkuZ2V0SW50ZXJzZWN0aW9ucygpO1xuICAgIGlmIChpbnRlcnNlY3Rpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgIC8vIG1pZGRsZUNvcHkuc3Ryb2tlQ29sb3IgPSAncGluayc7XG4gICAgICBbbWlkZGxlQ29weSwgdHJ1ZU5lY2Vzc2FyeV0gPSB0cmltUGF0aChtaWRkbGVDb3B5LCBtaWRkbGUpO1xuICAgICAgLy8gbWlkZGxlQ29weS5zdHJva2VDb2xvciA9ICdncmVlbic7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIG1pZGRsZUNvcHkuc3Ryb2tlQ29sb3IgPSAncmVkJztcbiAgICAgIG1pZGRsZUNvcHkgPSByZW1vdmVQYXRoRXh0ZW5zaW9ucyhtaWRkbGVDb3B5KTtcbiAgICAgIC8vIG1pZGRsZUNvcHkuc3Ryb2tlQ29sb3IgPSAnYmx1ZSc7XG4gICAgfVxuICB9XG5cbiAgbWlkZGxlQ29weS5uYW1lID0gJ21pZGRsZSc7IC8vIG1ha2Ugc3VyZVxuXG4gIC8vIGdyb3VwLmFkZENoaWxkKG1pZGRsZUNvcHkpO1xuICAvLyBncm91cC5fbmFtZWRDaGlsZHJlbi5taWRkbGVbMF0gPSBtaWRkbGVDb3B5O1xuICBncm91cC5fbmFtZWRDaGlsZHJlbi5taWRkbGVbMF0ucmVwbGFjZVdpdGgobWlkZGxlQ29weSk7O1xuXG4gIHJldHVybiBbZ3JvdXAsIHRydWVOZWNlc3NhcnldO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXh0ZW5kUGF0aChwYXRoKSB7XG4gIGlmIChwYXRoLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBsZW5ndGhUb2xlcmFuY2UgPSBjb25maWcuc2hhcGUudHJpbW1pbmdUaHJlc2hvbGQgKiBwYXRoLmxlbmd0aDtcblxuICAgIGxldCBmaXJzdFNlZ21lbnQgPSBwYXRoLmZpcnN0U2VnbWVudDtcbiAgICBsZXQgbmV4dFNlZ21lbnQgPSBmaXJzdFNlZ21lbnQubmV4dDtcbiAgICBsZXQgc3RhcnRBbmdsZSA9IE1hdGguYXRhbjIobmV4dFNlZ21lbnQucG9pbnQueSAtIGZpcnN0U2VnbWVudC5wb2ludC55LCBuZXh0U2VnbWVudC5wb2ludC54IC0gZmlyc3RTZWdtZW50LnBvaW50LngpOyAvLyByYWRcbiAgICBsZXQgaW52ZXJzZVN0YXJ0QW5nbGUgPSBzdGFydEFuZ2xlICsgTWF0aC5QSTtcbiAgICBsZXQgZXh0ZW5kZWRTdGFydFBvaW50ID0gbmV3IFBvaW50KGZpcnN0U2VnbWVudC5wb2ludC54ICsgKE1hdGguY29zKGludmVyc2VTdGFydEFuZ2xlKSAqIGxlbmd0aFRvbGVyYW5jZSksIGZpcnN0U2VnbWVudC5wb2ludC55ICsgKE1hdGguc2luKGludmVyc2VTdGFydEFuZ2xlKSAqIGxlbmd0aFRvbGVyYW5jZSkpO1xuICAgIHBhdGguaW5zZXJ0KDAsIGV4dGVuZGVkU3RhcnRQb2ludCk7XG5cbiAgICBsZXQgbGFzdFNlZ21lbnQgPSBwYXRoLmxhc3RTZWdtZW50O1xuICAgIGxldCBwZW5TZWdtZW50ID0gbGFzdFNlZ21lbnQucHJldmlvdXM7IC8vIHBlbnVsdGltYXRlXG4gICAgbGV0IGVuZEFuZ2xlID0gTWF0aC5hdGFuMihsYXN0U2VnbWVudC5wb2ludC55IC0gcGVuU2VnbWVudC5wb2ludC55LCBsYXN0U2VnbWVudC5wb2ludC54IC0gcGVuU2VnbWVudC5wb2ludC54KTsgLy8gcmFkXG4gICAgbGV0IGV4dGVuZGVkRW5kUG9pbnQgPSBuZXcgUG9pbnQobGFzdFNlZ21lbnQucG9pbnQueCArIChNYXRoLmNvcyhlbmRBbmdsZSkgKiBsZW5ndGhUb2xlcmFuY2UpLCBsYXN0U2VnbWVudC5wb2ludC55ICsgKE1hdGguc2luKGVuZEFuZ2xlKSAqIGxlbmd0aFRvbGVyYW5jZSkpO1xuICAgIHBhdGguYWRkKGV4dGVuZGVkRW5kUG9pbnQpO1xuICB9XG4gIHJldHVybiBwYXRoO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJpbVBhdGgocGF0aCwgb3JpZ2luYWwpIHtcbiAgLy8gb3JpZ2luYWxQYXRoLnN0cm9rZUNvbG9yID0gJ3BpbmsnO1xuICB0cnkge1xuICAgIGxldCBpbnRlcnNlY3Rpb25zID0gcGF0aC5nZXRJbnRlcnNlY3Rpb25zKCk7XG4gICAgbGV0IGRpdmlkZWRQYXRoID0gcGF0aC5yZXNvbHZlQ3Jvc3NpbmdzKCk7XG5cbiAgICBpZiAoaW50ZXJzZWN0aW9ucy5sZW5ndGggPiAxKSB7XG4gICAgICByZXR1cm4gW29yaWdpbmFsLCBmYWxzZV07IC8vIG1vcmUgdGhhbiBvbmUgaW50ZXJzZWN0aW9uLCBkb24ndCB3b3JyeSBhYm91dCB0cmltbWluZ1xuICAgIH1cblxuICAgIGNvbnN0IGV4dGVuZGluZ1RocmVzaG9sZCA9IGNvbmZpZy5zaGFwZS5leHRlbmRpbmdUaHJlc2hvbGQ7XG4gICAgY29uc3QgdG90YWxMZW5ndGggPSBwYXRoLmxlbmd0aDtcblxuICAgIC8vIHdlIHdhbnQgdG8gcmVtb3ZlIGFsbCBjbG9zZWQgbG9vcHMgZnJvbSB0aGUgcGF0aCwgc2luY2UgdGhlc2UgYXJlIG5lY2Vzc2FyaWx5IGludGVyaW9yIGFuZCBub3QgZmlyc3Qgb3IgbGFzdFxuICAgIEJhc2UuZWFjaChkaXZpZGVkUGF0aC5jaGlsZHJlbiwgKGNoaWxkLCBpKSA9PiB7XG4gICAgICBpZiAoY2hpbGQuY2xvc2VkKSB7XG4gICAgICAgIC8vIGxvZygnc3VidHJhY3RpbmcgY2xvc2VkIGNoaWxkJyk7XG4gICAgICAgIGRpdmlkZWRQYXRoID0gZGl2aWRlZFBhdGguc3VidHJhY3QoY2hpbGQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZGl2aWRlZFBhdGggPSBkaXZpZGVkUGF0aC51bml0ZShjaGlsZCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBsb2coZGl2aWRlZFBhdGgpO1xuXG4gICAgaWYgKCEhZGl2aWRlZFBhdGguY2hpbGRyZW4gJiYgZGl2aWRlZFBhdGguY2hpbGRyZW4ubGVuZ3RoID4gMSkge1xuICAgICAgLy8gZGl2aWRlZCBwYXRoIGlzIGEgY29tcG91bmQgcGF0aFxuICAgICAgbGV0IHVuaXRlZERpdmlkZWRQYXRoID0gbmV3IFBhdGgoKTtcbiAgICAgIC8vIHVuaXRlZERpdmlkZWRQYXRoLmNvcHlBdHRyaWJ1dGVzKGRpdmlkZWRQYXRoKTtcbiAgICAgIC8vIGxvZygnYmVmb3JlJywgdW5pdGVkRGl2aWRlZFBhdGgpO1xuICAgICAgQmFzZS5lYWNoKGRpdmlkZWRQYXRoLmNoaWxkcmVuLCAoY2hpbGQsIGkpID0+IHtcbiAgICAgICAgaWYgKCFjaGlsZC5jbG9zZWQpIHtcbiAgICAgICAgICB1bml0ZWREaXZpZGVkUGF0aCA9IHVuaXRlZERpdmlkZWRQYXRoLnVuaXRlKGNoaWxkKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBkaXZpZGVkUGF0aCA9IHVuaXRlZERpdmlkZWRQYXRoO1xuICAgICAgLy8gbG9nKCdhZnRlcicsIHVuaXRlZERpdmlkZWRQYXRoKTtcbiAgICAgIC8vIHJldHVybjtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gbG9nKCdkaXZpZGVkUGF0aCBoYXMgb25lIGNoaWxkJyk7XG4gICAgfVxuXG4gICAgaWYgKGludGVyc2VjdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgLy8gd2UgaGF2ZSB0byBnZXQgdGhlIG5lYXJlc3QgbG9jYXRpb24gYmVjYXVzZSB0aGUgZXhhY3QgaW50ZXJzZWN0aW9uIHBvaW50IGhhcyBhbHJlYWR5IGJlZW4gcmVtb3ZlZCBhcyBhIHBhcnQgb2YgcmVzb2x2ZUNyb3NzaW5ncygpXG4gICAgICBsZXQgZmlyc3RJbnRlcnNlY3Rpb24gPSBkaXZpZGVkUGF0aC5nZXROZWFyZXN0TG9jYXRpb24oaW50ZXJzZWN0aW9uc1swXS5wb2ludCk7XG4gICAgICAvLyBsb2coZGl2aWRlZFBhdGgpO1xuICAgICAgbGV0IHJlc3QgPSBkaXZpZGVkUGF0aC5zcGxpdEF0KGZpcnN0SW50ZXJzZWN0aW9uKTsgLy8gZGl2aWRlZFBhdGggaXMgbm93IHRoZSBmaXJzdCBzZWdtZW50XG4gICAgICBsZXQgZmlyc3RTZWdtZW50ID0gZGl2aWRlZFBhdGg7XG4gICAgICBsZXQgbGFzdFNlZ21lbnQ7XG5cbiAgICAgIC8vIGZpcnN0U2VnbWVudC5zdHJva2VDb2xvciA9ICdwaW5rJztcblxuICAgICAgLy8gbGV0IGNpcmNsZU9uZSA9IG5ldyBQYXRoLkNpcmNsZSh7XG4gICAgICAvLyAgIGNlbnRlcjogZmlyc3RJbnRlcnNlY3Rpb24ucG9pbnQsXG4gICAgICAvLyAgIHJhZGl1czogNSxcbiAgICAgIC8vICAgc3Ryb2tlQ29sb3I6ICdyZWQnXG4gICAgICAvLyB9KTtcblxuICAgICAgLy8gbG9nKGludGVyc2VjdGlvbnMpO1xuICAgICAgaWYgKGludGVyc2VjdGlvbnMubGVuZ3RoID4gMSkge1xuICAgICAgICAvLyBsb2coJ2ZvbycpO1xuICAgICAgICAvLyByZXN0LnJldmVyc2UoKTsgLy8gc3RhcnQgZnJvbSBlbmRcbiAgICAgICAgbGV0IGxhc3RJbnRlcnNlY3Rpb24gPSByZXN0LmdldE5lYXJlc3RMb2NhdGlvbihpbnRlcnNlY3Rpb25zW2ludGVyc2VjdGlvbnMubGVuZ3RoIC0gMV0ucG9pbnQpO1xuICAgICAgICAvLyBsZXQgY2lyY2xlVHdvID0gbmV3IFBhdGguQ2lyY2xlKHtcbiAgICAgICAgLy8gICBjZW50ZXI6IGxhc3RJbnRlcnNlY3Rpb24ucG9pbnQsXG4gICAgICAgIC8vICAgcmFkaXVzOiA1LFxuICAgICAgICAvLyAgIHN0cm9rZUNvbG9yOiAnZ3JlZW4nXG4gICAgICAgIC8vIH0pO1xuICAgICAgICBsYXN0U2VnbWVudCA9IHJlc3Quc3BsaXRBdChsYXN0SW50ZXJzZWN0aW9uKTsgLy8gcmVzdCBpcyBub3cgZXZlcnl0aGluZyBCVVQgdGhlIGZpcnN0IGFuZCBsYXN0IHNlZ21lbnRzXG4gICAgICAgIGlmICghbGFzdFNlZ21lbnQgfHwgIWxhc3RTZWdtZW50Lmxlbmd0aCkgbGFzdFNlZ21lbnQgPSByZXN0O1xuICAgICAgICByZXN0LnJldmVyc2UoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxhc3RTZWdtZW50ID0gcmVzdDtcbiAgICAgIH1cblxuICAgICAgaWYgKCEhZmlyc3RTZWdtZW50ICYmIGZpcnN0U2VnbWVudC5sZW5ndGggPD0gZXh0ZW5kaW5nVGhyZXNob2xkICogdG90YWxMZW5ndGgpIHtcbiAgICAgICAgcGF0aCA9IHBhdGguc3VidHJhY3QoZmlyc3RTZWdtZW50KTtcbiAgICAgICAgaWYgKHBhdGguY2xhc3NOYW1lID09PSAnQ29tcG91bmRQYXRoJykge1xuICAgICAgICAgIEJhc2UuZWFjaChwYXRoLmNoaWxkcmVuLCAoY2hpbGQsIGkpID0+IHtcbiAgICAgICAgICAgIGlmICghY2hpbGQuY2xvc2VkKSB7XG4gICAgICAgICAgICAgIGNoaWxkLnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICghIWxhc3RTZWdtZW50ICYmIGxhc3RTZWdtZW50Lmxlbmd0aCA8PSBleHRlbmRpbmdUaHJlc2hvbGQgKiB0b3RhbExlbmd0aCkge1xuICAgICAgICBwYXRoID0gcGF0aC5zdWJ0cmFjdChsYXN0U2VnbWVudCk7XG4gICAgICAgIGlmIChwYXRoLmNsYXNzTmFtZSA9PT0gJ0NvbXBvdW5kUGF0aCcpIHtcbiAgICAgICAgICBCYXNlLmVhY2gocGF0aC5jaGlsZHJlbiwgKGNoaWxkLCBpKSA9PiB7XG4gICAgICAgICAgICBpZiAoIWNoaWxkLmNsb3NlZCkge1xuICAgICAgICAgICAgICBjaGlsZC5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHRoaXMgaXMgaGFja3kgYnV0IEknbSBub3Qgc3VyZSBob3cgdG8gZ2V0IGFyb3VuZCBpdFxuICAgIC8vIHNvbWV0aW1lcyBwYXRoLnN1YnRyYWN0KCkgcmV0dXJucyBhIGNvbXBvdW5kIHBhdGgsIHdpdGggY2hpbGRyZW4gY29uc2lzdGluZyBvZiB0aGUgY2xvc2VkIHBhdGggSSB3YW50IGFuZCBhbm90aGVyIGV4dHJhbmVvdXMgY2xvc2VkIHBhdGhcbiAgICAvLyBpdCBhcHBlYXJzIHRoYXQgdGhlIGNvcnJlY3QgcGF0aCBhbHdheXMgaGFzIGEgaGlnaGVyIHZlcnNpb24sIHRob3VnaCBJJ20gbm90IDEwMCUgc3VyZSB0aGF0IHRoaXMgaXMgYWx3YXlzIHRoZSBjYXNlXG5cbiAgICBpZiAocGF0aC5jbGFzc05hbWUgPT09ICdDb21wb3VuZFBhdGgnICYmIHBhdGguY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgaWYgKHBhdGguY2hpbGRyZW4ubGVuZ3RoID4gMSkge1xuICAgICAgICBsZXQgbGFyZ2VzdENoaWxkO1xuICAgICAgICBsZXQgbGFyZ2VzdENoaWxkQXJlYSA9IDA7XG5cbiAgICAgICAgQmFzZS5lYWNoKHBhdGguY2hpbGRyZW4sIChjaGlsZCwgaSkgPT4ge1xuICAgICAgICAgIGlmIChjaGlsZC5hcmVhID4gbGFyZ2VzdENoaWxkQXJlYSkge1xuICAgICAgICAgICAgbGFyZ2VzdENoaWxkQXJlYSA9IGNoaWxkLmFyZWE7XG4gICAgICAgICAgICBsYXJnZXN0Q2hpbGQgPSBjaGlsZDtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChsYXJnZXN0Q2hpbGQpIHtcbiAgICAgICAgICBwYXRoID0gbGFyZ2VzdENoaWxkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBhdGggPSBwYXRoLmNoaWxkcmVuWzBdO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYXRoID0gcGF0aC5jaGlsZHJlblswXTtcbiAgICAgIH1cbiAgICAgIC8vIGxvZyhwYXRoKTtcbiAgICAgIC8vIGxvZyhwYXRoLmxhc3RDaGlsZCk7XG4gICAgICAvLyBwYXRoLmZpcnN0Q2hpbGQuc3Ryb2tlQ29sb3IgPSAncGluayc7XG4gICAgICAvLyBwYXRoLmxhc3RDaGlsZC5zdHJva2VDb2xvciA9ICdncmVlbic7XG4gICAgICAvLyBwYXRoID0gcGF0aC5sYXN0Q2hpbGQ7IC8vIHJldHVybiBsYXN0IGNoaWxkP1xuICAgICAgLy8gZmluZCBoaWdoZXN0IHZlcnNpb25cbiAgICAgIC8vXG4gICAgICAvLyBsb2cocmVhbFBhdGhWZXJzaW9uKTtcbiAgICAgIC8vXG4gICAgICAvLyBCYXNlLmVhY2gocGF0aC5jaGlsZHJlbiwgKGNoaWxkLCBpKSA9PiB7XG4gICAgICAvLyAgIGlmIChjaGlsZC52ZXJzaW9uID09IHJlYWxQYXRoVmVyc2lvbikge1xuICAgICAgLy8gICAgIGxvZygncmV0dXJuaW5nIGNoaWxkJyk7XG4gICAgICAvLyAgICAgcmV0dXJuIGNoaWxkO1xuICAgICAgLy8gICB9XG4gICAgICAvLyB9KVxuICAgIH1cbiAgICBsb2coJ29yaWdpbmFsIGxlbmd0aDonLCB0b3RhbExlbmd0aCk7XG4gICAgbG9nKCdlZGl0ZWQgbGVuZ3RoOicsIHBhdGgubGVuZ3RoKTtcbiAgICBpZiAocGF0aC5sZW5ndGggLyB0b3RhbExlbmd0aCA8PSAwLjc1KSB7XG4gICAgICBsb2coJ3JldHVybmluZyBvcmlnaW5hbCcpO1xuICAgICAgcmV0dXJuIFtvcmlnaW5hbCwgZmFsc2VdO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gW3BhdGgsIHRydWVdO1xuICAgIH1cbiAgfSBjYXRjaChlKSB7XG4gICAgY29uc29sZS5lcnJvcihlKTtcbiAgICByZXR1cm4gW29yaWdpbmFsLCBmYWxzZV07XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZVBhdGhFeHRlbnNpb25zKHBhdGgpIHtcbiAgcGF0aC5yZW1vdmVTZWdtZW50KDApO1xuICBwYXRoLnJlbW92ZVNlZ21lbnQocGF0aC5zZWdtZW50cy5sZW5ndGggLSAxKTtcbiAgcmV0dXJuIHBhdGg7XG59XG5cbi8vIGV4cG9ydCBmdW5jdGlvbiB0cnVlUGF0aChwYXRoKSB7XG4vLyAgIC8vIGxvZyhncm91cCk7XG4vLyAgIC8vIGlmIChwYXRoICYmIHBhdGguY2hpbGRyZW4gJiYgcGF0aC5jaGlsZHJlbi5sZW5ndGggPiAwICYmIHBhdGguX25hbWVkQ2hpbGRyZW5bJ21pZGRsZSddKSB7XG4vLyAgIC8vICAgbGV0IHBhdGhDb3B5ID0gbmV3IFBhdGgoKTtcbi8vICAgLy8gICBsb2cocGF0aC5fbmFtZWRDaGlsZHJlblsnbWlkZGxlJ10pO1xuLy8gICAvLyAgIHBhdGhDb3B5LmNvcHlDb250ZW50KHBhdGguX25hbWVkQ2hpbGRyZW5bJ21pZGRsZSddKTtcbi8vICAgLy8gICBsb2cocGF0aENvcHkpO1xuLy8gICAvLyB9XG4vLyB9XG5cbmV4cG9ydCBmdW5jdGlvbiBjaGVja1BvcHMoKSB7XG4gIGxldCBncm91cHMgPSBwYXBlci5wcm9qZWN0LmdldEl0ZW1zKHtcbiAgICBjbGFzc05hbWU6ICdHcm91cCcsXG4gICAgbWF0Y2g6IGZ1bmN0aW9uKGVsKSB7XG4gICAgICByZXR1cm4gKCEhZWwuZGF0YSAmJiBlbC5kYXRhLnVwZGF0ZSk7XG4gICAgfVxuICB9KTtcbn1cblxuLy8gaHR0cHM6Ly9ncm91cHMuZ29vZ2xlLmNvbS9mb3J1bS8jIXRvcGljL3BhcGVyanMvVUQ4TDBNVHlSZVFcbmV4cG9ydCBmdW5jdGlvbiBvdmVybGFwcyhwYXRoLCBvdGhlcikge1xuICByZXR1cm4gIShwYXRoLmdldEludGVyc2VjdGlvbnMob3RoZXIpLmxlbmd0aCA9PT0gMCk7XG59XG5cbi8vIGh0dHBzOi8vZ3JvdXBzLmdvb2dsZS5jb20vZm9ydW0vIyF0b3BpYy9wYXBlcmpzL1VEOEwwTVR5UmVRXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VPbmVQYXRoKHBhdGgsIG90aGVycykge1xuICBsZXQgaSwgbWVyZ2VkLCBvdGhlciwgdW5pb24sIF9pLCBfbGVuLCBfcmVmO1xuICBmb3IgKGkgPSBfaSA9IDAsIF9sZW4gPSBvdGhlcnMubGVuZ3RoOyBfaSA8IF9sZW47IGkgPSArK19pKSB7XG4gICAgb3RoZXIgPSBvdGhlcnNbaV07XG4gICAgaWYgKG92ZXJsYXBzKHBhdGgsIG90aGVyKSkge1xuICAgICAgdW5pb24gPSBwYXRoLnVuaXRlKG90aGVyKTtcbiAgICAgIG1lcmdlZCA9IG1lcmdlT25lUGF0aCh1bmlvbiwgb3RoZXJzLnNsaWNlKGkgKyAxKSk7XG4gICAgICByZXR1cm4gKF9yZWYgPSBvdGhlcnMuc2xpY2UoMCwgaSkpLmNvbmNhdC5hcHBseShfcmVmLCBtZXJnZWQpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gb3RoZXJzLmNvbmNhdChwYXRoKTtcbn07XG5cbi8vIGh0dHBzOi8vZ3JvdXBzLmdvb2dsZS5jb20vZm9ydW0vIyF0b3BpYy9wYXBlcmpzL1VEOEwwTVR5UmVRXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VQYXRocyhwYXRocykge1xuICB2YXIgcGF0aCwgcmVzdWx0LCBfaSwgX2xlbjtcbiAgcmVzdWx0ID0gW107XG4gIGZvciAoX2kgPSAwLCBfbGVuID0gcGF0aHMubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICBwYXRoID0gcGF0aHNbX2ldO1xuICAgIHJlc3VsdCA9IG1lcmdlT25lUGF0aChwYXRoLCByZXN1bHQpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gaGl0VGVzdEJvdW5kcyhwb2ludCwgY2hpbGRyZW4pIHtcbiAgaWYgKCFwb2ludCkgcmV0dXJuIG51bGw7XG5cbiAgZm9yIChsZXQgaSA9IGNoaWxkcmVuLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgbGV0IGNoaWxkID0gY2hpbGRyZW5baV07XG4gICAgbGV0IGJvdW5kcyA9IGNoaWxkLnN0cm9rZUJvdW5kcztcbiAgICBpZiAocG9pbnQuaXNJbnNpZGUoY2hpbGQuc3Ryb2tlQm91bmRzKSkge1xuICAgICAgcmV0dXJuIGNoaWxkO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuIl19
