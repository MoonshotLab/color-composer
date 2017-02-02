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
      // paper.project.activeLayer.removeChildren(); // REMOVE
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
      return;
      // const pointer = event.center,
      //     point = new Point(pointer.x, pointer.y),
      //     hitResult = paper.project.hitTest(point, hitOptions);
      //
      // if (hitResult) {
      //   let item = hitResult.item;
      //   item.selected = !item.selected;
      // }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxPQUFPLEdBQVAsR0FBYSxPQUFPLEdBQVAsSUFBYztBQUN6QixXQUFTLENBQUMsU0FBRCxFQUFZLFNBQVosRUFBdUIsU0FBdkIsRUFBa0MsU0FBbEMsRUFBNkMsU0FBN0MsRUFBd0QsU0FBeEQsRUFBbUUsU0FBbkUsRUFBOEUsU0FBOUUsRUFBeUYsU0FBekYsRUFBb0csU0FBcEcsRUFBK0csU0FBL0csRUFBMEgsU0FBMUgsRUFBcUksU0FBckksRUFBZ0osU0FBaEosRUFBMkosU0FBM0osRUFBc0ssU0FBdEssQ0FEZ0I7QUFFekIsZ0JBQWMsU0FGVztBQUd6QixZQUFVLEVBSGU7QUFJekIsU0FBTztBQUprQixDQUEzQjs7QUFPQSxNQUFNLE9BQU4sQ0FBYyxNQUFkOztBQUVBLElBQU0sT0FBTyxRQUFRLFFBQVIsQ0FBYjtBQUNBOztBQUVBLEVBQUUsUUFBRixFQUFZLEtBQVosQ0FBa0IsWUFBVztBQUMzQixNQUFJLFFBQVEsRUFBWixDQUQyQixDQUNYO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxNQUFNLFVBQVUsRUFBRSxNQUFGLENBQWhCO0FBQ0EsTUFBTSxRQUFRLEVBQUUsTUFBRixDQUFkO0FBQ0EsTUFBTSxVQUFVLEVBQUUsbUJBQUYsQ0FBaEI7QUFDQSxNQUFNLGdCQUFnQixJQUF0QjtBQUNBLE1BQU0sY0FBYyxJQUFJLEtBQUosQ0FBVSxDQUFWLEVBQWEsQ0FBYixDQUFwQjs7QUFFQSxNQUFJLGtCQUFKO0FBQUEsTUFBZSxtQkFBZjs7QUFFQSxXQUFTLGFBQVQsQ0FBdUIsS0FBdkIsRUFBOEI7QUFDNUIsV0FBTyxLQUFLLGFB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TUFBSSxDQUFDLEtBQUwsRUFBWSxPQUFPLElBQVA7O0FBRVosT0FBSyxJQUFJLElBQUksU0FBUyxNQUFULEdBQWtCLENBQS9CLEVBQWtDLEtBQUssQ0FBdkMsRUFBMEMsR0FBMUMsRUFBK0M7QUFDN0MsUUFBSSxRQUFRLFNBQVMsQ0FBVCxDQUFaO0FBQ0EsUUFBSSxTQUFTLE1BQU0sWUFBbkI7QUFDQSxRQUFJLE1BQU0sUUFBTixDQUFlLE1BQU0sWUFBckIsQ0FBSixFQUF3QztBQUN0QyxhQUFPLEtBQVA7QUFDRDtBQUNGOztBQUVELFNBQU8sSUFBUDtBQUNEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIndpbmRvdy5rYW4gPSB3aW5kb3cua2FuIHx8IHtcbiAgcGFsZXR0ZTogW1wiIzIwMTcxQ1wiLCBcIiMxRTJBNDNcIiwgXCIjMjgzNzdEXCIsIFwiIzM1Mjc0N1wiLCBcIiNGMjg1QTVcIiwgXCIjQ0EyRTI2XCIsIFwiI0I4NDUyNlwiLCBcIiNEQTZDMjZcIiwgXCIjNDUzMTIxXCIsIFwiIzkxNkE0N1wiLCBcIiNFRUI2NDFcIiwgXCIjRjZFQjE2XCIsIFwiIzdGN0QzMVwiLCBcIiM2RUFENzlcIiwgXCIjMkE0NjIxXCIsIFwiI0Y0RUFFMFwiXSxcbiAgY3VycmVudENvbG9yOiAnIzIwMTcxQycsXG4gIG51bVBhdGhzOiAxMCxcbiAgcGF0aHM6IFtdLFxufTtcblxucGFwZXIuaW5zdGFsbCh3aW5kb3cpO1xuXG5jb25zdCB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG4vLyByZXF1aXJlKCdwYXBlci1hbmltYXRlJyk7XG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICBsZXQgTU9WRVMgPSBbXTsgLy8gc3RvcmUgZ2xvYmFsIG1vdmVzIGxpc3RcbiAgLy8gbW92ZXMgPSBbXG4gIC8vICAge1xuICAvLyAgICAgJ3R5cGUnOiAnY29sb3JDaGFuZ2UnLFxuICAvLyAgICAgJ29sZCc6ICcjMjAxNzFDJyxcbiAgLy8gICAgICduZXcnOiAnI0YyODVBNSdcbiAgLy8gICB9LFxuICAvLyAgIHtcbiAgLy8gICAgICd0eXBlJzogJ25ld1BhdGgnLFxuICAvLyAgICAgJ3JlZic6ICc/Pz8nIC8vIHV1aWQ/IGRvbSByZWZlcmVuY2U/XG4gIC8vICAgfSxcbiAgLy8gICB7XG4gIC8vICAgICAndHlwZSc6ICdwYXRoVHJhbnNmb3JtJyxcbiAgLy8gICAgICdyZWYnOiAnPz8/JywgLy8gdXVpZD8gZG9tIHJlZmVyZW5jZT9cbiAgLy8gICAgICdvbGQnOiAncm90YXRlKDkwZGVnKXNjYWxlKDEuNSknLCAvLyA/Pz9cbiAgLy8gICAgICduZXcnOiAncm90YXRlKDEyMGRlZylzY2FsZSgtMC41KScgLy8gPz8/XG4gIC8vICAgfSxcbiAgLy8gICAvLyBvdGhlcnM/XG4gIC8vIF1cblxuICBjb25zdCAkd2luZG93ID0gJCh3aW5kb3cpO1xuICBjb25zdCAkYm9keSA9ICQoJ2JvZHknKTtcbiAgY29uc3QgJGNhbnZhcyA9ICQoJ2NhbnZhcyNtYWluQ2FudmFzJyk7XG4gIGNvbnN0IHJ1bkFuaW1hdGlvbnMgPSB0cnVlO1xuICBjb25zdCB0cmFuc3BhcmVudCA9IG5ldyBDb2xvcigwLCAwKTtcblxuICBsZXQgdmlld1dpZHRoLCB2aWV3SGVpZ2h0O1xuXG4gIGZ1bmN0aW9uIGhpdFRlc3RCb3VuZHMocG9pbnQpIHtcbiAgICByZXR1cm4gdXRpbC5oaXRUZXN0Qm91bmRzKHBvaW50LCBwYXBlci5wcm9qZWN0LmFjdGl2ZUxheWVyLmNoaWxkcmVuKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhpdFRlc3RHcm91cEJvdW5kcyhwb2ludCkge1xuICAgIGxldCBncm91cHMgPSBwYXBlci5wcm9qZWN0LmdldEl0ZW1zKHtcbiAgICAgIGNsYXNzTmFtZTogJ0dyb3VwJ1xuICAgIH0pO1xuICAgIHJldHVybiB1dGlsLmhpdFRlc3RCb3VuZHMocG9pbnQsIGdyb3Vwcyk7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0Vmlld1ZhcnMoKSB7XG4gICAgdmlld1dpZHRoID0gcGFwZXIudmlldy52aWV3U2l6ZS53aWR0aDtcbiAgICB2aWV3SGVpZ2h0ID0gcGFwZXIudmlldy52aWV3U2l6ZS5oZWlnaHQ7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0Q29udHJvbFBhbmVsKCkge1xuICAgIGluaXRDb2xvclBhbGV0dGUoKTtcbiAgICBpbml0Q2FudmFzRHJhdygpO1xuICAgIGluaXROZXcoKTtcbiAgICBpbml0VW5kbygpO1xuICAgIGluaXRQbGF5KCk7XG4gICAgaW5pdFRpcHMoKTtcbiAgICBpbml0U2hhcmUoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRDb2xvclBhbGV0dGUoKSB7XG4gICAgY29uc3QgJHBhbGV0dGVXcmFwID0gJCgndWwucGFsZXR0ZS1jb2xvcnMnKTtcbiAgICBjb25zdCAkcGFsZXR0ZUNvbG9ycyA9ICRwYWxldHRlV3JhcC5maW5kKCdsaScpO1xuICAgIGNvbnN0IHBhbGV0dGVDb2xvclNpemUgPSAyMDtcbiAgICBjb25zdCBwYWxldHRlU2VsZWN0ZWRDb2xvclNpemUgPSAzMDtcbiAgICBjb25zdCBwYWxldHRlU2VsZWN0ZWRDbGFzcyA9ICdwYWxldHRlLXNlbGVjdGVkJztcblxuICAgIC8vIGhvb2sgdXAgY2xpY2tcbiAgICAgICRwYWxldHRlQ29sb3JzLm9uKCdjbGljayB0YXAgdG91Y2gnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBsZXQgJHN2ZyA9ICQodGhpcykuZmluZCgnc3ZnLnBhbGV0dGUtY29sb3InKTtcblxuICAgICAgICAgIGlmICghJHN2Zy5oYXNDbGFzcyhwYWxldHRlU2VsZWN0ZWRDbGFzcykpIHtcbiAgICAgICAgICAgICQoJy4nICsgcGFsZXR0ZVNlbGVjdGVkQ2xhc3MpXG4gICAgICAgICAgICAgIC5yZW1vdmVDbGFzcyhwYWxldHRlU2VsZWN0ZWRDbGFzcylcbiAgICAgICAgICAgICAgLmF0dHIoJ3dpZHRoJywgcGFsZXR0ZUNvbG9yU2l6ZSlcbiAgICAgICAgICAgICAgLmF0dHIoJ2hlaWdodCcsIHBhbGV0dGVDb2xvclNpemUpXG4gICAgICAgICAgICAgIC5maW5kKCdyZWN0JylcbiAgICAgICAgICAgICAgLmF0dHIoJ3J4JywgMClcbiAgICAgICAgICAgICAgLmF0dHIoJ3J5JywgMCk7XG5cbiAgICAgICAgICAgICRzdmcuYWRkQ2xhc3MocGFsZXR0ZVNlbGVjdGVkQ2xhc3MpXG4gICAgICAgICAgICAgIC5hdHRyKCd3aWR0aCcsIHBhbGV0dGVTZWxlY3RlZENvbG9yU2l6ZSlcbiAgICAgICAgICAgICAgLmF0dHIoJ2hlaWdodCcsIHBhbGV0dGVTZWxlY3RlZENvbG9yU2l6ZSlcbiAgICAgICAgICAgICAgLmZpbmQoJ3JlY3QnKVxuICAgICAgICAgICAgICAuYXR0cigncngnLCBwYWxldHRlU2VsZWN0ZWRDb2xvclNpemUgLyAyKVxuICAgICAgICAgICAgICAuYXR0cigncnknLCBwYWxldHRlU2VsZWN0ZWRDb2xvclNpemUgLyAyKVxuXG4gICAgICAgICAgICB3aW5kb3cua2FuLmN1cnJlbnRDb2xvciA9ICRzdmcuZmluZCgncmVjdCcpLmF0dHIoJ2ZpbGwnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdENhbnZhc0RyYXcoKSB7XG5cbiAgICBwYXBlci5zZXR1cCgkY2FudmFzWzBdKTtcblxuICAgIGxldCBtaWRkbGUsIGJvdW5kcztcbiAgICBsZXQgcGFzdDtcbiAgICBsZXQgc2l6ZXM7XG4gICAgLy8gbGV0IHBhdGhzID0gZ2V0RnJlc2hQYXRocyh3aW5kb3cua2FuLm51bVBhdGhzKTtcbiAgICBsZXQgdG91Y2ggPSBmYWxzZTtcbiAgICBsZXQgbGFzdENoaWxkO1xuXG4gICAgZnVuY3Rpb24gcGFuU3RhcnQoZXZlbnQpIHtcbiAgICAgIC8vIHBhcGVyLnByb2plY3QuYWN0aXZlTGF5ZXIucmVtb3ZlQ2hpbGRyZW4oKTsgLy8gUkVNT1ZFXG4gICAgICAvLyBkcmF3Q2lyY2xlKCk7XG5cbiAgICAgIHNpemVzID0gW107XG5cbiAgICAgIGlmIChwaW5jaGluZykgcmV0dXJuO1xuICAgICAgaWYgKCEoZXZlbnQuY2hhbmdlZFBvaW50ZXJzICYmIGV2ZW50LmNoYW5nZWRQb2ludGVycy5sZW5ndGggPiAwKSkgcmV0dXJuO1xuICAgICAgaWYgKGV2ZW50LmNoYW5nZWRQb2ludGVycy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdldmVudC5jaGFuZ2VkUG9pbnRlcnMgPiAxJyk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHBvaW50ZXIgPSBldmVudC5jZW50ZXI7XG4gICAgICBjb25zdCBwb2ludCA9IG5ldyBQb2ludChwb2ludGVyLngsIHBvaW50ZXIueSk7XG5cbiAgICAgIGJvdW5kcyA9IG5ldyBQYXRoKHtcbiAgICAgICAgc3Ryb2tlQ29sb3I6IHdpbmRvdy5rYW4uY3VycmVudENvbG9yLFxuICAgICAgICBmaWxsQ29sb3I6IHdpbmRvdy5rYW4uY3VycmVudENvbG9yLFxuICAgICAgICBuYW1lOiAnYm91bmRzJyxcbiAgICAgIH0pO1xuXG4gICAgICBtaWRkbGUgPSBuZXcgUGF0aCh7XG4gICAgICAgIHN0cm9rZUNvbG9yOiB3aW5kb3cua2FuLmN1cnJlbnRDb2xvcixcbiAgICAgICAgbmFtZTogJ21pZGRsZScsXG4gICAgICAgIHN0cm9rZVdpZHRoOiAxLFxuICAgICAgICB2aXNpYmxlOiBmYWxzZVxuICAgICAgfSk7XG5cbiAgICAgIGJvdW5kcy5hZGQocG9pbnQpO1xuICAgICAgbWlkZGxlLmFkZChwb2ludCk7XG4gICAgfVxuXG4gICAgY29uc3QgbWluID0gMDtcbiAgICBjb25zdCBtYXggPSAyMDtcbiAgICBjb25zdCBhbHBoYSA9IDAuMztcbiAgICBjb25zdCBtZW1vcnkgPSAxMDtcbiAgICB2YXIgY3VtRGlzdGFuY2UgPSAwO1xuICAgIGxldCBjdW1TaXplLCBhdmdTaXplO1xuICAgIGZ1bmN0aW9uIHBhbk1vdmUoZXZlbnQpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBpZiAocGluY2hpbmcpIHJldHVybjtcbiAgICAgIC8vIGNvbnNvbGUubG9nKGV2ZW50Lm92ZXJhbGxWZWxvY2l0eSk7XG4gICAgICAvLyBsZXQgdGhpc0Rpc3QgPSBwYXJzZUludChldmVudC5kaXN0YW5jZSk7XG4gICAgICAvLyBjdW1EaXN0YW5jZSArPSB0aGlzRGlzdDtcbiAgICAgIC8vXG4gICAgICAvLyBpZiAoY3VtRGlzdGFuY2UgPCAxMDApIHtcbiAgICAgIC8vICAgY29uc29sZS5sb2coJ2lnbm9yaW5nJyk7XG4gICAgICAvLyAgIHJldHVybjtcbiAgICAgIC8vIH0gZWxzZSB7XG4gICAgICAvLyAgIGN1bURpc3RhbmNlID0gMDtcbiAgICAgIC8vICAgY29uc29sZS5sb2coJ25vdCBpZ25vcmluZycpO1xuICAgICAgLy8gfVxuXG4gICAgICBjb25zdCBwb2ludGVyID0gZXZlbnQuY2VudGVyO1xuICAgICAgY29uc3QgcG9pbnQgPSBuZXcgUG9pbnQocG9pbnRlci54LCBwb2ludGVyLnkpO1xuXG4gICAgICB3aGlsZSAoc2l6ZXMubGVuZ3RoID4gbWVtb3J5KSB7XG4gICAgICAgIHNpemVzLnNoaWZ0KCk7XG4gICAgICB9XG5cbiAgICAgIGxldCBib3R0b21YLCBib3R0b21ZLCBib3R0b20sXG4gICAgICAgIHRvcFgsIHRvcFksIHRvcCxcbiAgICAgICAgcDAsIHAxLFxuICAgICAgICBzdGVwLCBhbmdsZSwgZGlzdCwgc2l6ZTtcblxuICAgICAgaWYgKHNpemVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLy8gbm90IHRoZSBmaXJzdCBwb2ludCwgc28gd2UgaGF2ZSBvdGhlcnMgdG8gY29tcGFyZSB0b1xuICAgICAgICBwMCA9IHBhc3Q7XG4gICAgICAgIGRpc3QgPSB1dGlsLmRlbHRhKHBvaW50LCBwMCk7XG4gICAgICAgIHNpemUgPSBkaXN0ICogYWxwaGE7XG4gICAgICAgIGlmIChzaXplID49IG1heCkgc2l6ZSA9IG1heDtcbiAgICAgICAgLy8gc2l6ZSA9IE1hdGgubWF4KE1hdGgubWluKHNpemUsIG1heCksIG1pbik7IC8vIGNsYW1wIHNpemUgdG8gW21pbiwgbWF4XVxuICAgICAgICAvLyBzaXplID0gbWF4IC0gc2l6ZTtcblxuICAgICAgICBjdW1TaXplID0gMDtcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBzaXplcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgIGN1bVNpemUgKz0gc2l6ZXNbal07XG4gICAgICAgIH1cbiAgICAgICAgYXZnU2l6ZSA9IE1hdGgucm91bmQoKChjdW1TaXplIC8gc2l6ZXMubGVuZ3RoKSArIHNpemUpIC8gMik7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGF2Z1NpemUpO1xuXG4gICAgICAgIGFuZ2xlID0gTWF0aC5hdGFuMihwb2ludC55IC0gcDAueSwgcG9pbnQueCAtIHAwLngpOyAvLyByYWRcblxuICAgICAgICAvLyBQb2ludChib3R0b21YLCBib3R0b21ZKSBpcyBib3R0b20sIFBvaW50KHRvcFgsIHRvcFkpIGlzIHRvcFxuICAgICAgICBib3R0b21YID0gcG9pbnQueCArIE1hdGguY29zKGFuZ2xlICsgTWF0aC5QSS8yKSAqIGF2Z1NpemU7XG4gICAgICAgIGJvdHRvbVkgPSBwb2ludC55ICsgTWF0aC5zaW4oYW5nbGUgKyBNYXRoLlBJLzIpICogYXZnU2l6ZTtcbiAgICAgICAgYm90dG9tID0gbmV3IFBvaW50KGJvdHRvbVgsIGJvdHRvbVkpO1xuXG4gICAgICAgIHRvcFggPSBwb2ludC54ICsgTWF0aC5jb3MoYW5nbGUgLSBNYXRoLlBJLzIpICogYXZnU2l6ZTtcbiAgICAgICAgdG9wWSA9IHBvaW50LnkgKyBNYXRoLnNpbihhbmdsZSAtIE1hdGguUEkvMikgKiBhdmdTaXplO1xuICAgICAgICB0b3AgPSBuZXcgUG9pbnQodG9wWCwgdG9wWSk7XG5cbiAgICAgICAgYm91bmRzLmFkZCh0b3ApO1xuICAgICAgICBib3VuZHMuaW5zZXJ0KDAsIGJvdHRvbSk7XG4gICAgICAgIC8vIGJvdW5kcy5zbW9vdGgoKTtcblxuICAgICAgICBtaWRkbGUuYWRkKHBvaW50KTtcbiAgICAgICAgLy8gbWlkZGxlLnNtb290aCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZG9uJ3QgaGF2ZSBhbnl0aGluZyB0byBjb21wYXJlIHRvXG4gICAgICAgIGRpc3QgPSAxO1xuICAgICAgICBhbmdsZSA9IDA7XG5cbiAgICAgICAgc2l6ZSA9IGRpc3QgKiBhbHBoYTtcbiAgICAgICAgc2l6ZSA9IE1hdGgubWF4KE1hdGgubWluKHNpemUsIG1heCksIG1pbik7IC8vIGNsYW1wIHNpemUgdG8gW21pbiwgbWF4XVxuICAgICAgfVxuXG4gICAgICBwYXBlci52aWV3LmRyYXcoKTtcblxuICAgICAgcGFzdCA9IHBvaW50O1xuICAgICAgc2l6ZXMucHVzaChzaXplKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYW5FbmQoZXZlbnQpIHtcbiAgICAgIGlmIChwaW5jaGluZykgcmV0dXJuO1xuXG4gICAgICBjb25zdCBwb2ludGVyID0gZXZlbnQuY2VudGVyO1xuICAgICAgY29uc3QgcG9pbnQgPSBuZXcgUG9pbnQocG9pbnRlci54LCBwb2ludGVyLnkpO1xuXG4gICAgICBjb25zdCBncm91cCA9IG5ldyBHcm91cChbYm91bmRzLCBtaWRkbGVdKTtcbiAgICAgIGdyb3VwLmRhdGEuY29sb3IgPSBib3VuZHMuZmlsbENvbG9yO1xuICAgICAgZ3JvdXAuZGF0YS51cGRhdGUgPSB0cnVlO1xuXG4gICAgICBib3VuZHMuYWRkKHBvaW50KTtcbiAgICAgIGJvdW5kcy5mbGF0dGVuKDQpO1xuICAgICAgYm91bmRzLnNtb290aCgpO1xuICAgICAgYm91bmRzLnNpbXBsaWZ5KCk7XG4gICAgICBib3VuZHMuY2xvc2VkID0gdHJ1ZTtcblxuICAgICAgbWlkZGxlLmFkZChwb2ludCk7XG4gICAgICBtaWRkbGUuZmxhdHRlbig0KTtcbiAgICAgIG1pZGRsZS5zbW9vdGgoKTtcbiAgICAgIG1pZGRsZS5zaW1wbGlmeSgpO1xuXG4gICAgICAvLyB1dGlsLnRydWVHcm91cChncm91cCk7XG5cbiAgICAgIGxldCBpbnRlcnNlY3Rpb25zID0gbWlkZGxlLmdldENyb3NzaW5ncygpO1xuICAgICAgaWYgKGludGVyc2VjdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAvLyB3ZSBjcmVhdGUgYSBjb3B5IG9mIHRoZSBwYXRoIGJlY2F1c2UgcmVzb2x2ZUNyb3NzaW5ncygpIHNwbGl0cyBzb3VyY2UgcGF0aFxuICAgICAgICBsZXQgcGF0aENvcHkgPSBuZXcgUGF0aCgpO1xuICAgICAgICBwYXRoQ29weS5jb3B5Q29udGVudChtaWRkbGUpO1xuICAgICAgICBwYXRoQ29weS52aXNpYmxlID0gZmFsc2U7XG5cbiAgICAgICAgbGV0IGRpdmlkZWRQYXRoID0gcGF0aENvcHkucmVzb2x2ZUNyb3NzaW5ncygpO1xuICAgICAgICBkaXZpZGVkUGF0aC52aXNpYmxlID0gZmFsc2U7XG5cblxuICAgICAgICBsZXQgZW5jbG9zZWRMb29wcyA9IHV0aWwuZmluZEludGVyaW9yQ3VydmVzKGRpdmlkZWRQYXRoKTtcblxuICAgICAgICBpZiAoZW5jbG9zZWRMb29wcykge1xuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZW5jbG9zZWRMb29wcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZW5jbG9zZWRMb29wc1tpXS52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgIGVuY2xvc2VkTG9vcHNbaV0uY2xvc2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIGVuY2xvc2VkTG9vcHNbaV0uZmlsbENvbG9yID0gbmV3IENvbG9yKDAsIDApOyAvLyB0cmFuc3BhcmVudFxuICAgICAgICAgICAgZW5jbG9zZWRMb29wc1tpXS5kYXRhLmludGVyaW9yID0gdHJ1ZTtcbiAgICAgICAgICAgIGVuY2xvc2VkTG9vcHNbaV0uZGF0YS50cmFuc3BhcmVudCA9IHRydWU7XG4gICAgICAgICAgICAvLyBlbmNsb3NlZExvb3BzW2ldLmJsZW5kTW9kZSA9ICdtdWx0aXBseSc7XG4gICAgICAgICAgICBncm91cC5hZGRDaGlsZChlbmNsb3NlZExvb3BzW2ldKTtcbiAgICAgICAgICAgIGVuY2xvc2VkTG9vcHNbaV0uc2VuZFRvQmFjaygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBwYXRoQ29weS5yZW1vdmUoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdubyBpbnRlcnNlY3Rpb25zJyk7XG4gICAgICB9XG5cbiAgICAgIGdyb3VwLmRhdGEuY29sb3IgPSBib3VuZHMuZmlsbENvbG9yO1xuICAgICAgZ3JvdXAuZGF0YS5zY2FsZSA9IDE7IC8vIGluaXQgdmFyaWFibGUgdG8gdHJhY2sgc2NhbGUgY2hhbmdlc1xuICAgICAgZ3JvdXAuZGF0YS5yb3RhdGlvbiA9IDA7IC8vIGluaXQgdmFyaWFibGUgdG8gdHJhY2sgcm90YXRpb24gY2hhbmdlc1xuXG4gICAgICBsZXQgY2hpbGRyZW4gPSBncm91cC5nZXRJdGVtcyh7XG4gICAgICAgIG1hdGNoOiBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgcmV0dXJuIGl0ZW0ubmFtZSAhPT0gJ21pZGRsZSdcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIGNvbnNvbGUubG9nKCctLS0tLScpO1xuICAgICAgLy8gY29uc29sZS5sb2coZ3JvdXApO1xuICAgICAgLy8gY29uc29sZS5sb2coY2hpbGRyZW4pO1xuICAgICAgLy8gZ3JvdXAuc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgbGV0IHVuaXRlZFBhdGggPSBuZXcgUGF0aCgpO1xuICAgICAgaWYgKGNoaWxkcmVuLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgbGV0IGFjY3VtdWxhdG9yID0gbmV3IFBhdGgoKTtcbiAgICAgICAgYWNjdW11bGF0b3IuY29weUNvbnRlbnQoY2hpbGRyZW5bMF0pO1xuICAgICAgICBhY2N1bXVsYXRvci52aXNpYmxlID0gZmFsc2U7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGxldCBvdGhlclBhdGggPSBuZXcgUGF0aCgpO1xuICAgICAgICAgIG90aGVyUGF0aC5jb3B5Q29udGVudChjaGlsZHJlbltpXSk7XG4gICAgICAgICAgb3RoZXJQYXRoLnZpc2libGUgPSBmYWxzZTtcblxuICAgICAgICAgIHVuaXRlZFBhdGggPSBhY2N1bXVsYXRvci51bml0ZShvdGhlclBhdGgpO1xuICAgICAgICAgIG90aGVyUGF0aC5yZW1vdmUoKTtcbiAgICAgICAgICBhY2N1bXVsYXRvciA9IHVuaXRlZFBhdGg7XG4gICAgICAgIH1cblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gY2hpbGRyZW5bMF0gaXMgdW5pdGVkIGdyb3VwXG4gICAgICAgIHVuaXRlZFBhdGguY29weUNvbnRlbnQoY2hpbGRyZW5bMF0pO1xuICAgICAgfVxuXG4gICAgICB1bml0ZWRQYXRoLnZpc2libGUgPSBmYWxzZTtcbiAgICAgIHVuaXRlZFBhdGguZGF0YS5uYW1lID0gJ21hc2snO1xuXG4gICAgICBncm91cC5hZGRDaGlsZCh1bml0ZWRQYXRoKTtcbiAgICAgIHVuaXRlZFBhdGguc2VuZFRvQmFjaygpO1xuXG4gICAgICBsYXN0Q2hpbGQgPSBncm91cDtcblxuICAgICAgTU9WRVMucHVzaCh7XG4gICAgICAgIHR5cGU6ICduZXdHcm91cCcsXG4gICAgICAgIGlkOiBncm91cC5pZFxuICAgICAgfSk7XG5cbiAgICAgIGlmIChydW5BbmltYXRpb25zKSB7XG4gICAgICAgIGdyb3VwLmFuaW1hdGUoXG4gICAgICAgICAgW3tcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgc2NhbGU6IDAuOVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldHRpbmdzOiB7XG4gICAgICAgICAgICAgIGR1cmF0aW9uOiAxMDAsXG4gICAgICAgICAgICAgIGVhc2luZzogXCJlYXNlT3V0XCIsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgIHNjYWxlOiAxLjExXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgICAgICAgZHVyYXRpb246IDEwMCxcbiAgICAgICAgICAgICAgZWFzaW5nOiBcImVhc2VJblwiXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfV1cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgcGluY2hpbmc7XG4gICAgbGV0IHBpbmNoZWRHcm91cCwgbGFzdFNjYWxlLCBsYXN0Um90YXRpb247XG4gICAgbGV0IG9yaWdpbmFsUG9zaXRpb24sIG9yaWdpbmFsUm90YXRpb24sIG9yaWdpbmFsU2NhbGU7XG5cbiAgICBmdW5jdGlvbiBwaW5jaFN0YXJ0KGV2ZW50KSB7XG4gICAgICBjb25zb2xlLmxvZygncGluY2hTdGFydCcsIGV2ZW50LmNlbnRlcik7XG4gICAgICBoYW1tZXJNYW5hZ2VyLmdldCgncGFuJykuc2V0KHtlbmFibGU6IGZhbHNlfSk7XG4gICAgICBjb25zdCBwb2ludGVyID0gZXZlbnQuY2VudGVyLFxuICAgICAgICAgIHBvaW50ID0gbmV3IFBvaW50KHBvaW50ZXIueCwgcG9pbnRlci55KSxcbiAgICAgICAgICBoaXRSZXN1bHQgPSBoaXRUZXN0R3JvdXBCb3VuZHMocG9pbnQpO1xuXG4gICAgICBpZiAoaGl0UmVzdWx0KSB7XG4gICAgICAgIHBpbmNoaW5nID0gdHJ1ZTtcbiAgICAgICAgLy8gcGluY2hlZEdyb3VwID0gaGl0UmVzdWx0Lml0ZW0ucGFyZW50O1xuICAgICAgICBwaW5jaGVkR3JvdXAgPSBoaXRSZXN1bHQ7XG4gICAgICAgIGxhc3RTY2FsZSA9IDE7XG4gICAgICAgIGxhc3RSb3RhdGlvbiA9IGV2ZW50LnJvdGF0aW9uO1xuXG4gICAgICAgIG9yaWdpbmFsUG9zaXRpb24gPSBwaW5jaGVkR3JvdXAucG9zaXRpb247XG4gICAgICAgIC8vIG9yaWdpbmFsUm90YXRpb24gPSBwaW5jaGVkR3JvdXAucm90YXRpb247XG4gICAgICAgIG9yaWdpbmFsUm90YXRpb24gPSBwaW5jaGVkR3JvdXAuZGF0YS5yb3RhdGlvbjtcbiAgICAgICAgb3JpZ2luYWxTY2FsZSA9IHBpbmNoZWRHcm91cC5kYXRhLnNjYWxlO1xuXG4gICAgICAgIGlmIChydW5BbmltYXRpb25zKSB7XG4gICAgICAgICAgcGluY2hlZEdyb3VwLmFuaW1hdGUoe1xuICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICBzY2FsZTogMS4yNVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldHRpbmdzOiB7XG4gICAgICAgICAgICAgIGR1cmF0aW9uOiAxMDAsXG4gICAgICAgICAgICAgIGVhc2luZzogXCJlYXNlT3V0XCIsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBpbmNoZWRHcm91cCA9IG51bGw7XG4gICAgICAgIGNvbnNvbGUubG9nKCdoaXQgbm8gaXRlbScpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBpbmNoTW92ZShldmVudCkge1xuICAgICAgY29uc29sZS5sb2coJ3BpbmNoTW92ZScpO1xuICAgICAgaWYgKCEhcGluY2hlZEdyb3VwKSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdwaW5jaG1vdmUnLCBldmVudCk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHBpbmNoZWRHcm91cCk7XG4gICAgICAgIGxldCBjdXJyZW50U2NhbGUgPSBldmVudC5zY2FsZTtcbiAgICAgICAgbGV0IHNjYWxlRGVsdGEgPSBjdXJyZW50U2NhbGUgLyBsYXN0U2NhbGU7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGxhc3RTY2FsZSwgY3VycmVudFNjYWxlLCBzY2FsZURlbHRhKTtcbiAgICAgICAgbGFzdFNjYWxlID0gY3VycmVudFNjYWxlO1xuXG4gICAgICAgIGxldCBjdXJyZW50Um90YXRpb24gPSBldmVudC5yb3RhdGlvbjtcbiAgICAgICAgbGV0IHJvdGF0aW9uRGVsdGEgPSBjdXJyZW50Um90YXRpb24gLSBsYXN0Um90YXRpb247XG4gICAgICAgIGNvbnNvbGUubG9nKGxhc3RSb3RhdGlvbiwgY3VycmVudFJvdGF0aW9uLCByb3RhdGlvbkRlbHRhKTtcbiAgICAgICAgbGFzdFJvdGF0aW9uID0gY3VycmVudFJvdGF0aW9uO1xuXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGBzY2FsaW5nIGJ5ICR7c2NhbGVEZWx0YX1gKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coYHJvdGF0aW5nIGJ5ICR7cm90YXRpb25EZWx0YX1gKTtcblxuICAgICAgICBwaW5jaGVkR3JvdXAucG9zaXRpb24gPSBldmVudC5jZW50ZXI7XG4gICAgICAgIHBpbmNoZWRHcm91cC5zY2FsZShzY2FsZURlbHRhKTtcbiAgICAgICAgcGluY2hlZEdyb3VwLnJvdGF0ZShyb3RhdGlvbkRlbHRhKTtcblxuICAgICAgICBwaW5jaGVkR3JvdXAuZGF0YS5zY2FsZSAqPSBzY2FsZURlbHRhO1xuICAgICAgICBwaW5jaGVkR3JvdXAuZGF0YS5yb3RhdGlvbiArPSByb3RhdGlvbkRlbHRhO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxldCBsYXN0RXZlbnQ7XG4gICAgZnVuY3Rpb24gcGluY2hFbmQoZXZlbnQpIHtcbiAgICAgIC8vIHdhaXQgMjUwIG1zIHRvIHByZXZlbnQgbWlzdGFrZW4gcGFuIHJlYWRpbmdzXG4gICAgICBsYXN0RXZlbnQgPSBldmVudDtcbiAgICAgIGlmICghIXBpbmNoZWRHcm91cCkge1xuICAgICAgICBwaW5jaGVkR3JvdXAuZGF0YS51cGRhdGUgPSB0cnVlO1xuICAgICAgICBsZXQgbW92ZSA9IHtcbiAgICAgICAgICBpZDogcGluY2hlZEdyb3VwLmlkLFxuICAgICAgICAgIHR5cGU6ICd0cmFuc2Zvcm0nXG4gICAgICAgIH07XG4gICAgICAgIGlmIChwaW5jaGVkR3JvdXAucG9zaXRpb24gIT0gb3JpZ2luYWxQb3NpdGlvbikge1xuICAgICAgICAgIG1vdmUucG9zaXRpb24gPSBvcmlnaW5hbFBvc2l0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBpbmNoZWRHcm91cC5kYXRhLnJvdGF0aW9uICE9IG9yaWdpbmFsUm90YXRpb24pIHtcbiAgICAgICAgICBtb3ZlLnJvdGF0aW9uID0gb3JpZ2luYWxSb3RhdGlvbiAtIHBpbmNoZWRHcm91cC5kYXRhLnJvdGF0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBpbmNoZWRHcm91cC5kYXRhLnNjYWxlICE9IG9yaWdpbmFsU2NhbGUpIHtcbiAgICAgICAgICBtb3ZlLnNjYWxlID0gb3JpZ2luYWxTY2FsZSAvIHBpbmNoZWRHcm91cC5kYXRhLnNjYWxlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc29sZS5sb2coJ2ZpbmFsIHNjYWxlJywgcGluY2hlZEdyb3VwLmRhdGEuc2NhbGUpO1xuICAgICAgICBjb25zb2xlLmxvZyhtb3ZlKTtcblxuICAgICAgICBNT1ZFUy5wdXNoKG1vdmUpO1xuXG4gICAgICAgIGlmIChNYXRoLmFicyhldmVudC52ZWxvY2l0eSkgPiAxKSB7XG4gICAgICAgICAgLy8gZGlzcG9zZSBvZiBncm91cCBvZmZzY3JlZW5cbiAgICAgICAgICB0aHJvd1BpbmNoZWRHcm91cCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaWYgKHJ1bkFuaW1hdGlvbnMpIHtcbiAgICAgICAgLy8gICBwaW5jaGVkR3JvdXAuYW5pbWF0ZSh7XG4gICAgICAgIC8vICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIC8vICAgICAgIHNjYWxlOiAwLjhcbiAgICAgICAgLy8gICAgIH0sXG4gICAgICAgIC8vICAgICBzZXR0aW5nczoge1xuICAgICAgICAvLyAgICAgICBkdXJhdGlvbjogMTAwLFxuICAgICAgICAvLyAgICAgICBlYXNpbmc6IFwiZWFzZU91dFwiLFxuICAgICAgICAvLyAgICAgfVxuICAgICAgICAvLyAgIH0pO1xuICAgICAgICAvLyB9XG4gICAgICB9XG4gICAgICBwaW5jaGluZyA9IGZhbHNlO1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgaGFtbWVyTWFuYWdlci5nZXQoJ3BhbicpLnNldCh7ZW5hYmxlOiB0cnVlfSk7XG4gICAgICB9LCAyNTApO1xuICAgIH1cblxuICAgIGNvbnN0IGhpdE9wdGlvbnMgPSB7XG4gICAgICBzZWdtZW50czogZmFsc2UsXG4gICAgICBzdHJva2U6IHRydWUsXG4gICAgICBmaWxsOiB0cnVlLFxuICAgICAgdG9sZXJhbmNlOiA1XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIHNpbmdsZVRhcChldmVudCkge1xuICAgICAgcmV0dXJuO1xuICAgICAgLy8gY29uc3QgcG9pbnRlciA9IGV2ZW50LmNlbnRlcixcbiAgICAgIC8vICAgICBwb2ludCA9IG5ldyBQb2ludChwb2ludGVyLngsIHBvaW50ZXIueSksXG4gICAgICAvLyAgICAgaGl0UmVzdWx0ID0gcGFwZXIucHJvamVjdC5oaXRUZXN0KHBvaW50LCBoaXRPcHRpb25zKTtcbiAgICAgIC8vXG4gICAgICAvLyBpZiAoaGl0UmVzdWx0KSB7XG4gICAgICAvLyAgIGxldCBpdGVtID0gaGl0UmVzdWx0Lml0ZW07XG4gICAgICAvLyAgIGl0ZW0uc2VsZWN0ZWQgPSAhaXRlbS5zZWxlY3RlZDtcbiAgICAgIC8vIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkb3VibGVUYXAoZXZlbnQpIHtcbiAgICAgIGNvbnN0IHBvaW50ZXIgPSBldmVudC5jZW50ZXIsXG4gICAgICAgICAgcG9pbnQgPSBuZXcgUG9pbnQocG9pbnRlci54LCBwb2ludGVyLnkpLFxuICAgICAgICAgIGhpdFJlc3VsdCA9IHBhcGVyLnByb2plY3QuaGl0VGVzdChwb2ludCwgaGl0T3B0aW9ucyk7XG5cbiAgICAgIGlmIChoaXRSZXN1bHQpIHtcbiAgICAgICAgbGV0IGl0ZW0gPSBoaXRSZXN1bHQuaXRlbTtcbiAgICAgICAgbGV0IHBhcmVudCA9IGl0ZW0ucGFyZW50O1xuXG4gICAgICAgIGlmIChpdGVtLmRhdGEuaW50ZXJpb3IpIHtcbiAgICAgICAgICBpdGVtLmRhdGEudHJhbnNwYXJlbnQgPSAhaXRlbS5kYXRhLnRyYW5zcGFyZW50O1xuXG4gICAgICAgICAgaWYgKGl0ZW0uZGF0YS50cmFuc3BhcmVudCkge1xuICAgICAgICAgICAgaXRlbS5maWxsQ29sb3IgPSB0cmFuc3BhcmVudDtcbiAgICAgICAgICAgIGl0ZW0uc3Ryb2tlQ29sb3IgPSB0cmFuc3BhcmVudDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaXRlbS5maWxsQ29sb3IgPSBwYXJlbnQuZGF0YS5jb2xvcjtcbiAgICAgICAgICAgIGl0ZW0uc3Ryb2tlQ29sb3IgPSBwYXJlbnQuZGF0YS5jb2xvcjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBNT1ZFUy5wdXNoKHtcbiAgICAgICAgICAgIHR5cGU6ICdmaWxsQ2hhbmdlJyxcbiAgICAgICAgICAgIGlkOiBpdGVtLmlkLFxuICAgICAgICAgICAgZmlsbDogcGFyZW50LmRhdGEuY29sb3IsXG4gICAgICAgICAgICB0cmFuc3BhcmVudDogaXRlbS5kYXRhLnRyYW5zcGFyZW50XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ25vdCBpbnRlcmlvcicpXG4gICAgICAgIH1cblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGluY2hlZEdyb3VwID0gbnVsbDtcbiAgICAgICAgY29uc29sZS5sb2coJ2hpdCBubyBpdGVtJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgdmVsb2NpdHlNdWx0aXBsaWVyID0gMjU7XG4gICAgZnVuY3Rpb24gdGhyb3dQaW5jaGVkR3JvdXAoKSB7XG4gICAgICBjb25zb2xlLmxvZyhwaW5jaGVkR3JvdXAucG9zaXRpb24pO1xuICAgICAgaWYgKHBpbmNoZWRHcm91cC5wb3NpdGlvbi54IDw9IDAgLSBwaW5jaGVkR3JvdXAuYm91bmRzLndpZHRoIHx8XG4gICAgICAgICAgcGluY2hlZEdyb3VwLnBvc2l0aW9uLnggPj0gdmlld1dpZHRoICsgcGluY2hlZEdyb3VwLmJvdW5kcy53aWR0aCB8fFxuICAgICAgICAgIHBpbmNoZWRHcm91cC5wb3NpdGlvbi55IDw9IDAgLSBwaW5jaGVkR3JvdXAuYm91bmRzLmhlaWdodCB8fFxuICAgICAgICAgIHBpbmNoZWRHcm91cC5wb3NpdGlvbi55ID49IHZpZXdIZWlnaHQgKyBwaW5jaGVkR3JvdXAuYm91bmRzLmhlaWdodCkge1xuICAgICAgICAgICAgcGluY2hlZEdyb3VwLmRhdGEub2ZmU2NyZWVuID0gdHJ1ZTtcbiAgICAgICAgICAgIHBpbmNoZWRHcm91cC52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aHJvd1BpbmNoZWRHcm91cCk7XG4gICAgICBwaW5jaGVkR3JvdXAucG9zaXRpb24ueCArPSBsYXN0RXZlbnQudmVsb2NpdHlYICogdmVsb2NpdHlNdWx0aXBsaWVyO1xuICAgICAgcGluY2hlZEdyb3VwLnBvc2l0aW9uLnkgKz0gbGFzdEV2ZW50LnZlbG9jaXR5WSAqIHZlbG9jaXR5TXVsdGlwbGllcjtcbiAgICB9XG5cbiAgICB2YXIgaGFtbWVyTWFuYWdlciA9IG5ldyBIYW1tZXIuTWFuYWdlcigkY2FudmFzWzBdKTtcblxuICAgIGhhbW1lck1hbmFnZXIuYWRkKG5ldyBIYW1tZXIuVGFwKHsgZXZlbnQ6ICdkb3VibGV0YXAnLCB0YXBzOiAyIH0pKTtcbiAgICBoYW1tZXJNYW5hZ2VyLmFkZChuZXcgSGFtbWVyLlRhcCh7IGV2ZW50OiAnc2luZ2xldGFwJyB9KSk7XG4gICAgaGFtbWVyTWFuYWdlci5hZGQobmV3IEhhbW1lci5QYW4oeyBkaXJlY3Rpb246IEhhbW1lci5ESVJFQ1RJT05fQUxMIH0pKTtcbiAgICBoYW1tZXJNYW5hZ2VyLmFkZChuZXcgSGFtbWVyLlBpbmNoKCkpO1xuXG4gICAgaGFtbWVyTWFuYWdlci5nZXQoJ2RvdWJsZXRhcCcpLnJlY29nbml6ZVdpdGgoJ3NpbmdsZXRhcCcpO1xuICAgIGhhbW1lck1hbmFnZXIuZ2V0KCdzaW5nbGV0YXAnKS5yZXF1aXJlRmFpbHVyZSgnZG91YmxldGFwJyk7XG4gICAgaGFtbWVyTWFuYWdlci5nZXQoJ3BhbicpLnJlcXVpcmVGYWlsdXJlKCdwaW5jaCcpO1xuXG4gICAgaGFtbWVyTWFuYWdlci5vbignc2luZ2xldGFwJywgc2luZ2xlVGFwKTtcbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdkb3VibGV0YXAnLCBkb3VibGVUYXApO1xuXG4gICAgaGFtbWVyTWFuYWdlci5vbigncGFuc3RhcnQnLCBwYW5TdGFydCk7XG4gICAgaGFtbWVyTWFuYWdlci5vbigncGFubW92ZScsIHBhbk1vdmUpO1xuICAgIGhhbW1lck1hbmFnZXIub24oJ3BhbmVuZCcsIHBhbkVuZCk7XG5cbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdwaW5jaHN0YXJ0JywgcGluY2hTdGFydCk7XG4gICAgaGFtbWVyTWFuYWdlci5vbigncGluY2htb3ZlJywgcGluY2hNb3ZlKTtcbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdwaW5jaGVuZCcsIHBpbmNoRW5kKTtcbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdwaW5jaGNhbmNlbCcsIGZ1bmN0aW9uKCkgeyBoYW1tZXJNYW5hZ2VyLmdldCgncGFuJykuc2V0KHtlbmFibGU6IHRydWV9KTsgfSk7IC8vIG1ha2Ugc3VyZSBpdCdzIHJlZW5hYmxlZFxuICB9XG5cbiAgZnVuY3Rpb24gbmV3UHJlc3NlZCgpIHtcbiAgICBjb25zb2xlLmxvZygnbmV3IHByZXNzZWQnKTtcblxuICAgIHBhcGVyLnByb2plY3QuYWN0aXZlTGF5ZXIucmVtb3ZlQ2hpbGRyZW4oKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVuZG9QcmVzc2VkKCkge1xuICAgIGNvbnNvbGUubG9nKCd1bmRvIHByZXNzZWQnKTtcbiAgICBpZiAoIShNT1ZFUy5sZW5ndGggPiAwKSkge1xuICAgICAgY29uc29sZS5sb2coJ25vIG1vdmVzIHlldCcpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBsYXN0TW92ZSA9IE1PVkVTLnBvcCgpO1xuICAgIGxldCBpdGVtID0gcHJvamVjdC5nZXRJdGVtKHtcbiAgICAgIGlkOiBsYXN0TW92ZS5pZFxuICAgIH0pO1xuXG4gICAgaWYgKGl0ZW0pIHtcbiAgICAgIGl0ZW0udmlzaWJsZSA9IHRydWU7IC8vIG1ha2Ugc3VyZVxuICAgICAgc3dpdGNoKGxhc3RNb3ZlLnR5cGUpIHtcbiAgICAgICAgY2FzZSAnbmV3R3JvdXAnOlxuICAgICAgICAgIGNvbnNvbGUubG9nKCdyZW1vdmluZyBncm91cCcpO1xuICAgICAgICAgIGl0ZW0ucmVtb3ZlKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2ZpbGxDaGFuZ2UnOlxuICAgICAgICAgIGlmIChsYXN0TW92ZS50cmFuc3BhcmVudCkge1xuICAgICAgICAgICAgaXRlbS5maWxsQ29sb3IgPSBsYXN0TW92ZS5maWxsO1xuICAgICAgICAgICAgaXRlbS5zdHJva2VDb2xvciA9IGxhc3RNb3ZlLmZpbGw7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGl0ZW0uZmlsbENvbG9yID0gdHJhbnNwYXJlbnQ7XG4gICAgICAgICAgICBpdGVtLnN0cm9rZUNvbG9yID0gdHJhbnNwYXJlbnQ7XG4gICAgICAgICAgfVxuICAgICAgICBjYXNlICd0cmFuc2Zvcm0nOlxuICAgICAgICAgIGlmICghIWxhc3RNb3ZlLnBvc2l0aW9uKSB7XG4gICAgICAgICAgICBpdGVtLnBvc2l0aW9uID0gbGFzdE1vdmUucG9zaXRpb25cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCEhbGFzdE1vdmUucm90YXRpb24pIHtcbiAgICAgICAgICAgIGl0ZW0ucm90YXRpb24gPSBsYXN0TW92ZS5yb3RhdGlvbjtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCEhbGFzdE1vdmUuc2NhbGUpIHtcbiAgICAgICAgICAgIGl0ZW0uc2NhbGUobGFzdE1vdmUuc2NhbGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBjb25zb2xlLmxvZygndW5rbm93biBjYXNlJyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKCdjb3VsZCBub3QgZmluZCBtYXRjaGluZyBpdGVtJyk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcGxheVByZXNzZWQoKSB7XG4gICAgY29uc29sZS5sb2coJ3BsYXkgcHJlc3NlZCcpO1xuICB9XG5cbiAgZnVuY3Rpb24gdGlwc1ByZXNzZWQoKSB7XG4gICAgY29uc29sZS5sb2coJ3RpcHMgcHJlc3NlZCcpO1xuICB9XG5cbiAgZnVuY3Rpb24gc2hhcmVQcmVzc2VkKCkge1xuICAgIGNvbnNvbGUubG9nKCdzaGFyZSBwcmVzc2VkJyk7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0TmV3KCkge1xuICAgICQoJy5tYWluLWNvbnRyb2xzIC5uZXcnKS5vbignY2xpY2sgdGFwIHRvdWNoJywgbmV3UHJlc3NlZCk7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0VW5kbygpIHtcbiAgICAkKCcubWFpbi1jb250cm9scyAudW5kbycpLm9uKCdjbGljaycsIHVuZG9QcmVzc2VkKTtcbiAgfVxuICBmdW5jdGlvbiBpbml0UGxheSgpIHtcbiAgICAkKCcubWFpbi1jb250cm9scyAucGxheScpLm9uKCdjbGljaycsIHBsYXlQcmVzc2VkKTtcbiAgfVxuICBmdW5jdGlvbiBpbml0VGlwcygpIHtcbiAgICAkKCcuYXV4LWNvbnRyb2xzIC50aXBzJykub24oJ2NsaWNrJywgdGlwc1ByZXNzZWQpO1xuICB9XG4gIGZ1bmN0aW9uIGluaXRTaGFyZSgpIHtcbiAgICAkKCcuYXV4LWNvbnRyb2xzIC5zaGFyZScpLm9uKCdjbGljaycsIHNoYXJlUHJlc3NlZCk7XG4gIH1cblxuICBmdW5jdGlvbiBkcmF3Q2lyY2xlKCkge1xuICAgIGxldCBjaXJjbGUgPSBuZXcgUGF0aC5DaXJjbGUoe1xuICAgICAgY2VudGVyOiBbNDAwLCA0MDBdLFxuICAgICAgcmFkaXVzOiAxMDAsXG4gICAgICBzdHJva2VDb2xvcjogJ2dyZWVuJyxcbiAgICAgIGZpbGxDb2xvcjogJ2dyZWVuJ1xuICAgIH0pO1xuICAgIGxldCBncm91cCA9IG5ldyBHcm91cChjaXJjbGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gbWFpbigpIHtcbiAgICBpbml0Q29udHJvbFBhbmVsKCk7XG4gICAgLy8gZHJhd0NpcmNsZSgpO1xuICAgIGluaXRWaWV3VmFycygpO1xuICB9XG5cbiAgbWFpbigpO1xufSk7XG4iLCIvLyBDb252ZXJ0cyBmcm9tIGRlZ3JlZXMgdG8gcmFkaWFucy5cbmV4cG9ydCBmdW5jdGlvbiByYWQoZGVncmVlcykge1xuICByZXR1cm4gZGVncmVlcyAqIE1hdGguUEkgLyAxODA7XG59O1xuXG4vLyBDb252ZXJ0cyBmcm9tIHJhZGlhbnMgdG8gZGVncmVlcy5cbmV4cG9ydCBmdW5jdGlvbiBkZWcocmFkaWFucykge1xuICByZXR1cm4gcmFkaWFucyAqIDE4MCAvIE1hdGguUEk7XG59O1xuXG4vLyBkaXN0YW5jZSBiZXR3ZWVuIHR3byBwb2ludHNcbmV4cG9ydCBmdW5jdGlvbiBkZWx0YShwMSwgcDIpIHtcbiAgcmV0dXJuIE1hdGguc3FydChNYXRoLnBvdyhwMS54IC0gcDIueCwgMikgKyBNYXRoLnBvdyhwMS55IC0gcDIueSwgMikpOyAvLyBweXRoYWdvcmVhbiFcbn1cblxuLy8gcmV0dXJucyBhbiBhcnJheSBvZiB0aGUgaW50ZXJpb3IgY3VydmVzIG9mIGEgZ2l2ZW4gY29tcG91bmQgcGF0aFxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRJbnRlcmlvckN1cnZlcyhwYXRoKSB7XG4gIGxldCBpbnRlcmlvckN1cnZlcyA9IFtdO1xuICBpZiAoIXBhdGggfHwgIXBhdGguY2hpbGRyZW4gfHwgIXBhdGguY2hpbGRyZW4ubGVuZ3RoKSByZXR1cm47XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXRoLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IGNoaWxkID0gcGF0aC5jaGlsZHJlbltpXTtcblxuICAgIGlmIChjaGlsZC5jbG9zZWQpe1xuICAgICAgaW50ZXJpb3JDdXJ2ZXMucHVzaChuZXcgUGF0aChjaGlsZC5zZWdtZW50cykpO1xuICAgIH1cbiAgfVxuXG4gIHBhdGgucmVtb3ZlKCk7XG4gIHJldHVybiBpbnRlcmlvckN1cnZlcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRydWVHcm91cChncm91cCkge1xuICBsZXQgYm91bmRzID0gZ3JvdXAuX25hbWVkQ2hpbGRyZW4uYm91bmRzWzBdLFxuICAgICAgbWlkZGxlID0gZ3JvdXAuX25hbWVkQ2hpbGRyZW4ubWlkZGxlWzBdO1xuXG4gIGxldCBtaWRkbGVDb3B5ID0gbmV3IFBhdGgoKTtcbiAgbWlkZGxlQ29weS5jb3B5Q29udGVudChtaWRkbGUpO1xuICBtaWRkbGVDb3B5LnZpc2libGUgPSBmYWxzZTtcbiAgbGV0IGRpdmlkZWRQYXRoID0gbWlkZGxlQ29weS5yZXNvbHZlQ3Jvc3NpbmdzKCk7XG4gIGRpdmlkZWRQYXRoLnZpc2libGUgPSBmYWxzZTtcbiAgQmFzZS5lYWNoKGRpdmlkZWRQYXRoLmNoaWxkcmVuLCBmdW5jdGlvbihjaGlsZCwgaSkge1xuICAgIGlmIChjaGlsZC5jbG9zZWQpIHtcbiAgICAgIGNoaWxkLnNlbGVjdGVkID0gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNoaWxkLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICB9XG4gICAgLy8gY29uc29sZS5sb2coY2hpbGQsIGkpO1xuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJ1ZVBhdGgocGF0aCkge1xuICAvLyBjb25zb2xlLmxvZyhncm91cCk7XG4gIC8vIGlmIChwYXRoICYmIHBhdGguY2hpbGRyZW4gJiYgcGF0aC5jaGlsZHJlbi5sZW5ndGggPiAwICYmIHBhdGguX25hbWVkQ2hpbGRyZW5bJ21pZGRsZSddKSB7XG4gIC8vICAgbGV0IHBhdGhDb3B5ID0gbmV3IFBhdGgoKTtcbiAgLy8gICBjb25zb2xlLmxvZyhwYXRoLl9uYW1lZENoaWxkcmVuWydtaWRkbGUnXSk7XG4gIC8vICAgcGF0aENvcHkuY29weUNvbnRlbnQocGF0aC5fbmFtZWRDaGlsZHJlblsnbWlkZGxlJ10pO1xuICAvLyAgIGNvbnNvbGUubG9nKHBhdGhDb3B5KTtcbiAgLy8gfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tQb3BzKCkge1xuICBsZXQgZ3JvdXBzID0gcGFwZXIucHJvamVjdC5nZXRJdGVtcyh7XG4gICAgY2xhc3NOYW1lOiAnR3JvdXAnLFxuICAgIG1hdGNoOiBmdW5jdGlvbihlbCkge1xuICAgICAgcmV0dXJuICghIWVsLmRhdGEgJiYgZWwuZGF0YS51cGRhdGUpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8vIGh0dHBzOi8vZ3JvdXBzLmdvb2dsZS5jb20vZm9ydW0vIyF0b3BpYy9wYXBlcmpzL1VEOEwwTVR5UmVRXG5leHBvcnQgZnVuY3Rpb24gb3ZlcmxhcHMocGF0aCwgb3RoZXIpIHtcbiAgcmV0dXJuICEocGF0aC5nZXRJbnRlcnNlY3Rpb25zKG90aGVyKS5sZW5ndGggPT09IDApO1xufVxuXG4vLyBodHRwczovL2dyb3Vwcy5nb29nbGUuY29tL2ZvcnVtLyMhdG9waWMvcGFwZXJqcy9VRDhMME1UeVJlUVxuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlT25lUGF0aChwYXRoLCBvdGhlcnMpIHtcbiAgbGV0IGksIG1lcmdlZCwgb3RoZXIsIHVuaW9uLCBfaSwgX2xlbiwgX3JlZjtcbiAgZm9yIChpID0gX2kgPSAwLCBfbGVuID0gb3RoZXJzLmxlbmd0aDsgX2kgPCBfbGVuOyBpID0gKytfaSkge1xuICAgIG90aGVyID0gb3RoZXJzW2ldO1xuICAgIGlmIChvdmVybGFwcyhwYXRoLCBvdGhlcikpIHtcbiAgICAgIHVuaW9uID0gcGF0aC51bml0ZShvdGhlcik7XG4gICAgICBtZXJnZWQgPSBtZXJnZU9uZVBhdGgodW5pb24sIG90aGVycy5zbGljZShpICsgMSkpO1xuICAgICAgcmV0dXJuIChfcmVmID0gb3RoZXJzLnNsaWNlKDAsIGkpKS5jb25jYXQuYXBwbHkoX3JlZiwgbWVyZ2VkKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG90aGVycy5jb25jYXQocGF0aCk7XG59O1xuXG4vLyBodHRwczovL2dyb3Vwcy5nb29nbGUuY29tL2ZvcnVtLyMhdG9waWMvcGFwZXJqcy9VRDhMME1UeVJlUVxuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlUGF0aHMocGF0aHMpIHtcbiAgdmFyIHBhdGgsIHJlc3VsdCwgX2ksIF9sZW47XG4gIHJlc3VsdCA9IFtdO1xuICBmb3IgKF9pID0gMCwgX2xlbiA9IHBhdGhzLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgcGF0aCA9IHBhdGhzW19pXTtcbiAgICByZXN1bHQgPSBtZXJnZU9uZVBhdGgocGF0aCwgcmVzdWx0KTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGhpdFRlc3RCb3VuZHMocG9pbnQsIGNoaWxkcmVuKSB7XG4gIGlmICghcG9pbnQpIHJldHVybiBudWxsO1xuXG4gIGZvciAobGV0IGkgPSBjaGlsZHJlbi5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGxldCBjaGlsZCA9IGNoaWxkcmVuW2ldO1xuICAgIGxldCBib3VuZHMgPSBjaGlsZC5zdHJva2VCb3VuZHM7XG4gICAgaWYgKHBvaW50LmlzSW5zaWRlKGNoaWxkLnN0cm9rZUJvdW5kcykpIHtcbiAgICAgIHJldHVybiBjaGlsZDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cbiJdfQ==
