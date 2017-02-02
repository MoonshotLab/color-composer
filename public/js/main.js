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
          point = new Point(pointer.x, pointer.y);
      hitResult = hitTestBounds(point);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxPQUFPLEdBQVAsR0FBYSxPQUFPLEdBQVAsSUFBYztBQUN6QixXQUFTLENBQUMsU0FBRCxFQUFZLFNBQVosRUFBdUIsU0FBdkIsRUFBa0MsU0FBbEMsRUFBNkMsU0FBN0MsRUFBd0QsU0FBeEQsRUFBbUUsU0FBbkUsRUFBOEUsU0FBOUUsRUFBeUYsU0FBekYsRUFBb0csU0FBcEcsRUFBK0csU0FBL0csRUFBMEgsU0FBMUgsRUFBcUksU0FBckksRUFBZ0osU0FBaEosRUFBMkosU0FBM0osRUFBc0ssU0FBdEssQ0FEZ0I7QUFFekIsZ0JBQWMsU0FGVztBQUd6QixZQUFVLEVBSGU7QUFJekIsU0FBTztBQUprQixDQUEzQjs7QUFPQSxNQUFNLE9BQU4sQ0FBYyxNQUFkOztBQUVBLElBQU0sT0FBTyxRQUFRLFFBQVIsQ0FBYjtBQUNBOztBQUVBLEVBQUUsUUFBRixFQUFZLEtBQVosQ0FBa0IsWUFBVztBQUMzQixNQUFJLFFBQVEsRUFBWixDQUQyQixDQUNYO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxNQUFNLFVBQVUsRUFBRSxNQUFGLENBQWhCO0FBQ0EsTUFBTSxRQUFRLEVBQUUsTUFBRixDQUFkO0FBQ0EsTUFBTSxVQUFVLEVBQUUsbUJBQUYsQ0FBaEI7QUFDQSxNQUFNLGdCQUFnQixLQUF0QjtBQUNBLE1BQU0sY0FBYyxJQUFJLEtBQUosQ0FBVSxDQUFWLEVBQWEsQ0FBYixDQUFwQjs7QUFFQSxNQUFJLGtCQUFKO0FBQUEsTUFBZSxtQkFBZjs7QUFFQSxXQUFTLGFBQVQsQ0FBdUIsS0FBdkIsRUFBOEI7QUFDNUIsV0FBTyxLQUFLLGFB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QW5CLENBQVQ7QUFDRDtBQUNELFNBQU8sTUFBUDtBQUNEOztBQUVNLFNBQVMsYUFBVCxDQUF1QixLQUF2QixFQUE4QixRQUE5QixFQUF3QztBQUM3QyxNQUFJLENBQUMsS0FBTCxFQUFZLE9BQU8sSUFBUDs7QUFFWixPQUFLLElBQUksSUFBSSxTQUFTLE1BQVQsR0FBa0IsQ0FBL0IsRUFBa0MsS0FBSyxDQUF2QyxFQUEwQyxHQUExQyxFQUErQztBQUM3QyxRQUFJLFFBQVEsU0FBUyxDQUFULENBQVo7QUFDQSxRQUFJLFNBQVMsTUFBTSxZQUFuQjtBQUNBLFFBQUksTUFBTSxRQUFOLENBQWUsTUFBTSxZQUFyQixDQUFKLEVBQXdDO0FBQ3RDLGFBQU8sS0FBUDtBQUNEO0FBQ0Y7O0FBRUQsU0FBTyxJQUFQO0FBQ0QiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwid2luZG93LmthbiA9IHdpbmRvdy5rYW4gfHwge1xuICBwYWxldHRlOiBbXCIjMjAxNzFDXCIsIFwiIzFFMkE0M1wiLCBcIiMyODM3N0RcIiwgXCIjMzUyNzQ3XCIsIFwiI0YyODVBNVwiLCBcIiNDQTJFMjZcIiwgXCIjQjg0NTI2XCIsIFwiI0RBNkMyNlwiLCBcIiM0NTMxMjFcIiwgXCIjOTE2QTQ3XCIsIFwiI0VFQjY0MVwiLCBcIiNGNkVCMTZcIiwgXCIjN0Y3RDMxXCIsIFwiIzZFQUQ3OVwiLCBcIiMyQTQ2MjFcIiwgXCIjRjRFQUUwXCJdLFxuICBjdXJyZW50Q29sb3I6ICcjMjAxNzFDJyxcbiAgbnVtUGF0aHM6IDEwLFxuICBwYXRoczogW10sXG59O1xuXG5wYXBlci5pbnN0YWxsKHdpbmRvdyk7XG5cbmNvbnN0IHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcbi8vIHJlcXVpcmUoJ3BhcGVyLWFuaW1hdGUnKTtcblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gIGxldCBNT1ZFUyA9IFtdOyAvLyBzdG9yZSBnbG9iYWwgbW92ZXMgbGlzdFxuICAvLyBtb3ZlcyA9IFtcbiAgLy8gICB7XG4gIC8vICAgICAndHlwZSc6ICdjb2xvckNoYW5nZScsXG4gIC8vICAgICAnb2xkJzogJyMyMDE3MUMnLFxuICAvLyAgICAgJ25ldyc6ICcjRjI4NUE1J1xuICAvLyAgIH0sXG4gIC8vICAge1xuICAvLyAgICAgJ3R5cGUnOiAnbmV3UGF0aCcsXG4gIC8vICAgICAncmVmJzogJz8/PycgLy8gdXVpZD8gZG9tIHJlZmVyZW5jZT9cbiAgLy8gICB9LFxuICAvLyAgIHtcbiAgLy8gICAgICd0eXBlJzogJ3BhdGhUcmFuc2Zvcm0nLFxuICAvLyAgICAgJ3JlZic6ICc/Pz8nLCAvLyB1dWlkPyBkb20gcmVmZXJlbmNlP1xuICAvLyAgICAgJ29sZCc6ICdyb3RhdGUoOTBkZWcpc2NhbGUoMS41KScsIC8vID8/P1xuICAvLyAgICAgJ25ldyc6ICdyb3RhdGUoMTIwZGVnKXNjYWxlKC0wLjUpJyAvLyA/Pz9cbiAgLy8gICB9LFxuICAvLyAgIC8vIG90aGVycz9cbiAgLy8gXVxuXG4gIGNvbnN0ICR3aW5kb3cgPSAkKHdpbmRvdyk7XG4gIGNvbnN0ICRib2R5ID0gJCgnYm9keScpO1xuICBjb25zdCAkY2FudmFzID0gJCgnY2FudmFzI21haW5DYW52YXMnKTtcbiAgY29uc3QgcnVuQW5pbWF0aW9ucyA9IGZhbHNlO1xuICBjb25zdCB0cmFuc3BhcmVudCA9IG5ldyBDb2xvcigwLCAwKTtcblxuICBsZXQgdmlld1dpZHRoLCB2aWV3SGVpZ2h0O1xuXG4gIGZ1bmN0aW9uIGhpdFRlc3RCb3VuZHMocG9pbnQpIHtcbiAgICByZXR1cm4gdXRpbC5oaXRUZXN0Qm91bmRzKHBvaW50LCBwYXBlci5wcm9qZWN0LmFjdGl2ZUxheWVyLmNoaWxkcmVuKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRWaWV3VmFycygpIHtcbiAgICB2aWV3V2lkdGggPSBwYXBlci52aWV3LnZpZXdTaXplLndpZHRoO1xuICAgIHZpZXdIZWlnaHQgPSBwYXBlci52aWV3LnZpZXdTaXplLmhlaWdodDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRDb250cm9sUGFuZWwoKSB7XG4gICAgaW5pdENvbG9yUGFsZXR0ZSgpO1xuICAgIGluaXRDYW52YXNEcmF3KCk7XG4gICAgaW5pdE5ldygpO1xuICAgIGluaXRVbmRvKCk7XG4gICAgaW5pdFBsYXkoKTtcbiAgICBpbml0VGlwcygpO1xuICAgIGluaXRTaGFyZSgpO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdENvbG9yUGFsZXR0ZSgpIHtcbiAgICBjb25zdCAkcGFsZXR0ZVdyYXAgPSAkKCd1bC5wYWxldHRlLWNvbG9ycycpO1xuICAgIGNvbnN0ICRwYWxldHRlQ29sb3JzID0gJHBhbGV0dGVXcmFwLmZpbmQoJ2xpJyk7XG4gICAgY29uc3QgcGFsZXR0ZUNvbG9yU2l6ZSA9IDIwO1xuICAgIGNvbnN0IHBhbGV0dGVTZWxlY3RlZENvbG9yU2l6ZSA9IDMwO1xuICAgIGNvbnN0IHBhbGV0dGVTZWxlY3RlZENsYXNzID0gJ3BhbGV0dGUtc2VsZWN0ZWQnO1xuXG4gICAgLy8gaG9vayB1cCBjbGlja1xuICAgICAgJHBhbGV0dGVDb2xvcnMub24oJ2NsaWNrIHRhcCB0b3VjaCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGxldCAkc3ZnID0gJCh0aGlzKS5maW5kKCdzdmcucGFsZXR0ZS1jb2xvcicpO1xuXG4gICAgICAgICAgaWYgKCEkc3ZnLmhhc0NsYXNzKHBhbGV0dGVTZWxlY3RlZENsYXNzKSkge1xuICAgICAgICAgICAgJCgnLicgKyBwYWxldHRlU2VsZWN0ZWRDbGFzcylcbiAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKHBhbGV0dGVTZWxlY3RlZENsYXNzKVxuICAgICAgICAgICAgICAuYXR0cignd2lkdGgnLCBwYWxldHRlQ29sb3JTaXplKVxuICAgICAgICAgICAgICAuYXR0cignaGVpZ2h0JywgcGFsZXR0ZUNvbG9yU2l6ZSlcbiAgICAgICAgICAgICAgLmZpbmQoJ3JlY3QnKVxuICAgICAgICAgICAgICAuYXR0cigncngnLCAwKVxuICAgICAgICAgICAgICAuYXR0cigncnknLCAwKTtcblxuICAgICAgICAgICAgJHN2Zy5hZGRDbGFzcyhwYWxldHRlU2VsZWN0ZWRDbGFzcylcbiAgICAgICAgICAgICAgLmF0dHIoJ3dpZHRoJywgcGFsZXR0ZVNlbGVjdGVkQ29sb3JTaXplKVxuICAgICAgICAgICAgICAuYXR0cignaGVpZ2h0JywgcGFsZXR0ZVNlbGVjdGVkQ29sb3JTaXplKVxuICAgICAgICAgICAgICAuZmluZCgncmVjdCcpXG4gICAgICAgICAgICAgIC5hdHRyKCdyeCcsIHBhbGV0dGVTZWxlY3RlZENvbG9yU2l6ZSAvIDIpXG4gICAgICAgICAgICAgIC5hdHRyKCdyeScsIHBhbGV0dGVTZWxlY3RlZENvbG9yU2l6ZSAvIDIpXG5cbiAgICAgICAgICAgIHdpbmRvdy5rYW4uY3VycmVudENvbG9yID0gJHN2Zy5maW5kKCdyZWN0JykuYXR0cignZmlsbCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0Q2FudmFzRHJhdygpIHtcblxuICAgIHBhcGVyLnNldHVwKCRjYW52YXNbMF0pO1xuXG4gICAgbGV0IG1pZGRsZSwgYm91bmRzO1xuICAgIGxldCBwYXN0O1xuICAgIGxldCBzaXplcztcbiAgICAvLyBsZXQgcGF0aHMgPSBnZXRGcmVzaFBhdGhzKHdpbmRvdy5rYW4ubnVtUGF0aHMpO1xuICAgIGxldCB0b3VjaCA9IGZhbHNlO1xuICAgIGxldCBsYXN0Q2hpbGQ7XG5cbiAgICBmdW5jdGlvbiBwYW5TdGFydChldmVudCkge1xuICAgICAgcGFwZXIucHJvamVjdC5hY3RpdmVMYXllci5yZW1vdmVDaGlsZHJlbigpOyAvLyBSRU1PVkVcbiAgICAgIC8vIGRyYXdDaXJjbGUoKTtcblxuICAgICAgc2l6ZXMgPSBbXTtcblxuICAgICAgaWYgKHBpbmNoaW5nKSByZXR1cm47XG4gICAgICBpZiAoIShldmVudC5jaGFuZ2VkUG9pbnRlcnMgJiYgZXZlbnQuY2hhbmdlZFBvaW50ZXJzLmxlbmd0aCA+IDApKSByZXR1cm47XG4gICAgICBpZiAoZXZlbnQuY2hhbmdlZFBvaW50ZXJzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2V2ZW50LmNoYW5nZWRQb2ludGVycyA+IDEnKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcG9pbnRlciA9IGV2ZW50LmNlbnRlcjtcbiAgICAgIGNvbnN0IHBvaW50ID0gbmV3IFBvaW50KHBvaW50ZXIueCwgcG9pbnRlci55KTtcblxuICAgICAgYm91bmRzID0gbmV3IFBhdGgoe1xuICAgICAgICBzdHJva2VDb2xvcjogd2luZG93Lmthbi5jdXJyZW50Q29sb3IsXG4gICAgICAgIGZpbGxDb2xvcjogd2luZG93Lmthbi5jdXJyZW50Q29sb3IsXG4gICAgICAgIG5hbWU6ICdib3VuZHMnLFxuICAgICAgfSk7XG5cbiAgICAgIG1pZGRsZSA9IG5ldyBQYXRoKHtcbiAgICAgICAgc3Ryb2tlQ29sb3I6IHdpbmRvdy5rYW4uY3VycmVudENvbG9yLFxuICAgICAgICBuYW1lOiAnbWlkZGxlJyxcbiAgICAgICAgc3Ryb2tlV2lkdGg6IDEsXG4gICAgICAgIHZpc2libGU6IGZhbHNlXG4gICAgICB9KTtcblxuICAgICAgYm91bmRzLmFkZChwb2ludCk7XG4gICAgICBtaWRkbGUuYWRkKHBvaW50KTtcbiAgICB9XG5cbiAgICBjb25zdCBtaW4gPSAwO1xuICAgIGNvbnN0IG1heCA9IDIwO1xuICAgIGNvbnN0IGFscGhhID0gMC4zO1xuICAgIGNvbnN0IG1lbW9yeSA9IDEwO1xuICAgIHZhciBjdW1EaXN0YW5jZSA9IDA7XG4gICAgbGV0IGN1bVNpemUsIGF2Z1NpemU7XG4gICAgZnVuY3Rpb24gcGFuTW92ZShldmVudCkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGlmIChwaW5jaGluZykgcmV0dXJuO1xuICAgICAgLy8gY29uc29sZS5sb2coZXZlbnQub3ZlcmFsbFZlbG9jaXR5KTtcbiAgICAgIC8vIGxldCB0aGlzRGlzdCA9IHBhcnNlSW50KGV2ZW50LmRpc3RhbmNlKTtcbiAgICAgIC8vIGN1bURpc3RhbmNlICs9IHRoaXNEaXN0O1xuICAgICAgLy9cbiAgICAgIC8vIGlmIChjdW1EaXN0YW5jZSA8IDEwMCkge1xuICAgICAgLy8gICBjb25zb2xlLmxvZygnaWdub3JpbmcnKTtcbiAgICAgIC8vICAgcmV0dXJuO1xuICAgICAgLy8gfSBlbHNlIHtcbiAgICAgIC8vICAgY3VtRGlzdGFuY2UgPSAwO1xuICAgICAgLy8gICBjb25zb2xlLmxvZygnbm90IGlnbm9yaW5nJyk7XG4gICAgICAvLyB9XG5cbiAgICAgIGNvbnN0IHBvaW50ZXIgPSBldmVudC5jZW50ZXI7XG4gICAgICBjb25zdCBwb2ludCA9IG5ldyBQb2ludChwb2ludGVyLngsIHBvaW50ZXIueSk7XG5cbiAgICAgIHdoaWxlIChzaXplcy5sZW5ndGggPiBtZW1vcnkpIHtcbiAgICAgICAgc2l6ZXMuc2hpZnQoKTtcbiAgICAgIH1cblxuICAgICAgbGV0IGJvdHRvbVgsIGJvdHRvbVksIGJvdHRvbSxcbiAgICAgICAgdG9wWCwgdG9wWSwgdG9wLFxuICAgICAgICBwMCwgcDEsXG4gICAgICAgIHN0ZXAsIGFuZ2xlLCBkaXN0LCBzaXplO1xuXG4gICAgICBpZiAoc2l6ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAvLyBub3QgdGhlIGZpcnN0IHBvaW50LCBzbyB3ZSBoYXZlIG90aGVycyB0byBjb21wYXJlIHRvXG4gICAgICAgIHAwID0gcGFzdDtcbiAgICAgICAgZGlzdCA9IHV0aWwuZGVsdGEocG9pbnQsIHAwKTtcbiAgICAgICAgc2l6ZSA9IGRpc3QgKiBhbHBoYTtcbiAgICAgICAgaWYgKHNpemUgPj0gbWF4KSBzaXplID0gbWF4O1xuICAgICAgICAvLyBzaXplID0gTWF0aC5tYXgoTWF0aC5taW4oc2l6ZSwgbWF4KSwgbWluKTsgLy8gY2xhbXAgc2l6ZSB0byBbbWluLCBtYXhdXG4gICAgICAgIC8vIHNpemUgPSBtYXggLSBzaXplO1xuXG4gICAgICAgIGN1bVNpemUgPSAwO1xuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHNpemVzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgY3VtU2l6ZSArPSBzaXplc1tqXTtcbiAgICAgICAgfVxuICAgICAgICBhdmdTaXplID0gTWF0aC5yb3VuZCgoKGN1bVNpemUgLyBzaXplcy5sZW5ndGgpICsgc2l6ZSkgLyAyKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coYXZnU2l6ZSk7XG5cbiAgICAgICAgYW5nbGUgPSBNYXRoLmF0YW4yKHBvaW50LnkgLSBwMC55LCBwb2ludC54IC0gcDAueCk7IC8vIHJhZFxuXG4gICAgICAgIC8vIFBvaW50KGJvdHRvbVgsIGJvdHRvbVkpIGlzIGJvdHRvbSwgUG9pbnQodG9wWCwgdG9wWSkgaXMgdG9wXG4gICAgICAgIGJvdHRvbVggPSBwb2ludC54ICsgTWF0aC5jb3MoYW5nbGUgKyBNYXRoLlBJLzIpICogYXZnU2l6ZTtcbiAgICAgICAgYm90dG9tWSA9IHBvaW50LnkgKyBNYXRoLnNpbihhbmdsZSArIE1hdGguUEkvMikgKiBhdmdTaXplO1xuICAgICAgICBib3R0b20gPSBuZXcgUG9pbnQoYm90dG9tWCwgYm90dG9tWSk7XG5cbiAgICAgICAgdG9wWCA9IHBvaW50LnggKyBNYXRoLmNvcyhhbmdsZSAtIE1hdGguUEkvMikgKiBhdmdTaXplO1xuICAgICAgICB0b3BZID0gcG9pbnQueSArIE1hdGguc2luKGFuZ2xlIC0gTWF0aC5QSS8yKSAqIGF2Z1NpemU7XG4gICAgICAgIHRvcCA9IG5ldyBQb2ludCh0b3BYLCB0b3BZKTtcblxuICAgICAgICBib3VuZHMuYWRkKHRvcCk7XG4gICAgICAgIGJvdW5kcy5pbnNlcnQoMCwgYm90dG9tKTtcbiAgICAgICAgLy8gYm91bmRzLnNtb290aCgpO1xuXG4gICAgICAgIG1pZGRsZS5hZGQocG9pbnQpO1xuICAgICAgICAvLyBtaWRkbGUuc21vb3RoKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBkb24ndCBoYXZlIGFueXRoaW5nIHRvIGNvbXBhcmUgdG9cbiAgICAgICAgZGlzdCA9IDE7XG4gICAgICAgIGFuZ2xlID0gMDtcblxuICAgICAgICBzaXplID0gZGlzdCAqIGFscGhhO1xuICAgICAgICBzaXplID0gTWF0aC5tYXgoTWF0aC5taW4oc2l6ZSwgbWF4KSwgbWluKTsgLy8gY2xhbXAgc2l6ZSB0byBbbWluLCBtYXhdXG4gICAgICB9XG5cbiAgICAgIHBhcGVyLnZpZXcuZHJhdygpO1xuXG4gICAgICBwYXN0ID0gcG9pbnQ7XG4gICAgICBzaXplcy5wdXNoKHNpemUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhbkVuZChldmVudCkge1xuICAgICAgaWYgKHBpbmNoaW5nKSByZXR1cm47XG5cbiAgICAgIGNvbnN0IHBvaW50ZXIgPSBldmVudC5jZW50ZXI7XG4gICAgICBjb25zdCBwb2ludCA9IG5ldyBQb2ludChwb2ludGVyLngsIHBvaW50ZXIueSk7XG5cbiAgICAgIGNvbnN0IGdyb3VwID0gbmV3IEdyb3VwKFtib3VuZHMsIG1pZGRsZV0pO1xuICAgICAgZ3JvdXAuZGF0YS5jb2xvciA9IGJvdW5kcy5maWxsQ29sb3I7XG4gICAgICBncm91cC5kYXRhLnVwZGF0ZSA9IHRydWU7XG5cbiAgICAgIGJvdW5kcy5hZGQocG9pbnQpO1xuICAgICAgYm91bmRzLmZsYXR0ZW4oNCk7XG4gICAgICBib3VuZHMuc21vb3RoKCk7XG4gICAgICBib3VuZHMuc2ltcGxpZnkoKTtcbiAgICAgIGJvdW5kcy5jbG9zZWQgPSB0cnVlO1xuXG4gICAgICBtaWRkbGUuYWRkKHBvaW50KTtcbiAgICAgIG1pZGRsZS5mbGF0dGVuKDQpO1xuICAgICAgbWlkZGxlLnNtb290aCgpO1xuICAgICAgbWlkZGxlLnNpbXBsaWZ5KCk7XG5cbiAgICAgIC8vIHV0aWwudHJ1ZUdyb3VwKGdyb3VwKTtcblxuICAgICAgbGV0IGludGVyc2VjdGlvbnMgPSBtaWRkbGUuZ2V0Q3Jvc3NpbmdzKCk7XG4gICAgICBpZiAoaW50ZXJzZWN0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgIC8vIHdlIGNyZWF0ZSBhIGNvcHkgb2YgdGhlIHBhdGggYmVjYXVzZSByZXNvbHZlQ3Jvc3NpbmdzKCkgc3BsaXRzIHNvdXJjZSBwYXRoXG4gICAgICAgIGxldCBwYXRoQ29weSA9IG5ldyBQYXRoKCk7XG4gICAgICAgIHBhdGhDb3B5LmNvcHlDb250ZW50KG1pZGRsZSk7XG4gICAgICAgIHBhdGhDb3B5LnZpc2libGUgPSBmYWxzZTtcblxuICAgICAgICBsZXQgZGl2aWRlZFBhdGggPSBwYXRoQ29weS5yZXNvbHZlQ3Jvc3NpbmdzKCk7XG4gICAgICAgIGRpdmlkZWRQYXRoLnZpc2libGUgPSBmYWxzZTtcblxuXG4gICAgICAgIGxldCBlbmNsb3NlZExvb3BzID0gdXRpbC5maW5kSW50ZXJpb3JDdXJ2ZXMoZGl2aWRlZFBhdGgpO1xuXG4gICAgICAgIGlmIChlbmNsb3NlZExvb3BzKSB7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbmNsb3NlZExvb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBlbmNsb3NlZExvb3BzW2ldLnZpc2libGUgPSB0cnVlO1xuICAgICAgICAgICAgZW5jbG9zZWRMb29wc1tpXS5jbG9zZWQgPSB0cnVlO1xuICAgICAgICAgICAgZW5jbG9zZWRMb29wc1tpXS5maWxsQ29sb3IgPSBuZXcgQ29sb3IoMCwgMCk7IC8vIHRyYW5zcGFyZW50XG4gICAgICAgICAgICBlbmNsb3NlZExvb3BzW2ldLmRhdGEuaW50ZXJpb3IgPSB0cnVlO1xuICAgICAgICAgICAgZW5jbG9zZWRMb29wc1tpXS5kYXRhLnRyYW5zcGFyZW50ID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vIGVuY2xvc2VkTG9vcHNbaV0uYmxlbmRNb2RlID0gJ211bHRpcGx5JztcbiAgICAgICAgICAgIGdyb3VwLmFkZENoaWxkKGVuY2xvc2VkTG9vcHNbaV0pO1xuICAgICAgICAgICAgZW5jbG9zZWRMb29wc1tpXS5zZW5kVG9CYWNrKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHBhdGhDb3B5LnJlbW92ZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ25vIGludGVyc2VjdGlvbnMnKTtcbiAgICAgIH1cblxuICAgICAgZ3JvdXAuZGF0YS5jb2xvciA9IGJvdW5kcy5maWxsQ29sb3I7XG4gICAgICBncm91cC5kYXRhLnNjYWxlID0gMTsgLy8gaW5pdCB2YXJpYWJsZSB0byB0cmFjayBzY2FsZSBjaGFuZ2VzXG4gICAgICBncm91cC5kYXRhLnJvdGF0aW9uID0gMDsgLy8gaW5pdCB2YXJpYWJsZSB0byB0cmFjayByb3RhdGlvbiBjaGFuZ2VzXG5cbiAgICAgIGxldCBjaGlsZHJlbiA9IGdyb3VwLmdldEl0ZW1zKHtcbiAgICAgICAgbWF0Y2g6IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICByZXR1cm4gaXRlbS5uYW1lICE9PSAnbWlkZGxlJ1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gY29uc29sZS5sb2coJy0tLS0tJyk7XG4gICAgICAvLyBjb25zb2xlLmxvZyhncm91cCk7XG4gICAgICAvLyBjb25zb2xlLmxvZyhjaGlsZHJlbik7XG4gICAgICAvLyBncm91cC5zZWxlY3RlZCA9IHRydWU7XG4gICAgICBsZXQgdW5pdGVkUGF0aCA9IG5ldyBQYXRoKCk7XG4gICAgICBpZiAoY2hpbGRyZW4ubGVuZ3RoID4gMSkge1xuICAgICAgICBsZXQgYWNjdW11bGF0b3IgPSBuZXcgUGF0aCgpO1xuICAgICAgICBhY2N1bXVsYXRvci5jb3B5Q29udGVudChjaGlsZHJlblswXSk7XG4gICAgICAgIGFjY3VtdWxhdG9yLnZpc2libGUgPSBmYWxzZTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgbGV0IG90aGVyUGF0aCA9IG5ldyBQYXRoKCk7XG4gICAgICAgICAgb3RoZXJQYXRoLmNvcHlDb250ZW50KGNoaWxkcmVuW2ldKTtcbiAgICAgICAgICBvdGhlclBhdGgudmlzaWJsZSA9IGZhbHNlO1xuXG4gICAgICAgICAgdW5pdGVkUGF0aCA9IGFjY3VtdWxhdG9yLnVuaXRlKG90aGVyUGF0aCk7XG4gICAgICAgICAgb3RoZXJQYXRoLnJlbW92ZSgpO1xuICAgICAgICAgIGFjY3VtdWxhdG9yID0gdW5pdGVkUGF0aDtcbiAgICAgICAgfVxuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBjaGlsZHJlblswXSBpcyB1bml0ZWQgZ3JvdXBcbiAgICAgICAgdW5pdGVkUGF0aC5jb3B5Q29udGVudChjaGlsZHJlblswXSk7XG4gICAgICB9XG5cbiAgICAgIHVuaXRlZFBhdGgudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgdW5pdGVkUGF0aC5kYXRhLm5hbWUgPSAnbWFzayc7XG5cbiAgICAgIGdyb3VwLmFkZENoaWxkKHVuaXRlZFBhdGgpO1xuICAgICAgdW5pdGVkUGF0aC5zZW5kVG9CYWNrKCk7XG5cbiAgICAgIGxhc3RDaGlsZCA9IGdyb3VwO1xuXG4gICAgICBNT1ZFUy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ25ld0dyb3VwJyxcbiAgICAgICAgaWQ6IGdyb3VwLmlkXG4gICAgICB9KTtcblxuICAgICAgaWYgKHJ1bkFuaW1hdGlvbnMpIHtcbiAgICAgICAgZ3JvdXAuYW5pbWF0ZShcbiAgICAgICAgICBbe1xuICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICBzY2FsZTogMC45XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgICAgICAgZHVyYXRpb246IDEwMCxcbiAgICAgICAgICAgICAgZWFzaW5nOiBcImVhc2VPdXRcIixcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgc2NhbGU6IDEuMTFcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXR0aW5nczoge1xuICAgICAgICAgICAgICBkdXJhdGlvbjogMTAwLFxuICAgICAgICAgICAgICBlYXNpbmc6IFwiZWFzZUluXCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxldCBwaW5jaGluZztcbiAgICBsZXQgcGluY2hlZEdyb3VwLCBsYXN0U2NhbGUsIGxhc3RSb3RhdGlvbjtcbiAgICBsZXQgb3JpZ2luYWxQb3NpdGlvbiwgb3JpZ2luYWxSb3RhdGlvbiwgb3JpZ2luYWxTY2FsZTtcblxuICAgIGZ1bmN0aW9uIHBpbmNoU3RhcnQoZXZlbnQpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdwaW5jaFN0YXJ0JywgZXZlbnQuY2VudGVyKTtcbiAgICAgIGhhbW1lck1hbmFnZXIuZ2V0KCdwYW4nKS5zZXQoe2VuYWJsZTogZmFsc2V9KTtcbiAgICAgIGNvbnN0IHBvaW50ZXIgPSBldmVudC5jZW50ZXIsXG4gICAgICAgICAgcG9pbnQgPSBuZXcgUG9pbnQocG9pbnRlci54LCBwb2ludGVyLnkpO1xuICAgICAgICAgIGhpdFJlc3VsdCA9IGhpdFRlc3RCb3VuZHMocG9pbnQpO1xuXG4gICAgICBpZiAoaGl0UmVzdWx0KSB7XG4gICAgICAgIHBpbmNoaW5nID0gdHJ1ZTtcbiAgICAgICAgcGluY2hlZEdyb3VwID0gaGl0UmVzdWx0Lml0ZW0ucGFyZW50O1xuICAgICAgICBsYXN0U2NhbGUgPSAxO1xuICAgICAgICBsYXN0Um90YXRpb24gPSBldmVudC5yb3RhdGlvbjtcblxuICAgICAgICBvcmlnaW5hbFBvc2l0aW9uID0gcGluY2hlZEdyb3VwLnBvc2l0aW9uO1xuICAgICAgICAvLyBvcmlnaW5hbFJvdGF0aW9uID0gcGluY2hlZEdyb3VwLnJvdGF0aW9uO1xuICAgICAgICBvcmlnaW5hbFJvdGF0aW9uID0gcGluY2hlZEdyb3VwLmRhdGEucm90YXRpb247XG4gICAgICAgIG9yaWdpbmFsU2NhbGUgPSBwaW5jaGVkR3JvdXAuZGF0YS5zY2FsZTtcblxuICAgICAgICBpZiAocnVuQW5pbWF0aW9ucykge1xuICAgICAgICAgIHBpbmNoZWRHcm91cC5hbmltYXRlKHtcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgc2NhbGU6IDEuMjVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXR0aW5nczoge1xuICAgICAgICAgICAgICBkdXJhdGlvbjogMTAwLFxuICAgICAgICAgICAgICBlYXNpbmc6IFwiZWFzZU91dFwiLFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwaW5jaGVkR3JvdXAgPSBudWxsO1xuICAgICAgICBjb25zb2xlLmxvZygnaGl0IG5vIGl0ZW0nKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwaW5jaE1vdmUoZXZlbnQpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdwaW5jaE1vdmUnKTtcbiAgICAgIGlmICghIXBpbmNoZWRHcm91cCkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZygncGluY2htb3ZlJywgZXZlbnQpO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhwaW5jaGVkR3JvdXApO1xuICAgICAgICBsZXQgY3VycmVudFNjYWxlID0gZXZlbnQuc2NhbGU7XG4gICAgICAgIGxldCBzY2FsZURlbHRhID0gY3VycmVudFNjYWxlIC8gbGFzdFNjYWxlO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhsYXN0U2NhbGUsIGN1cnJlbnRTY2FsZSwgc2NhbGVEZWx0YSk7XG4gICAgICAgIGxhc3RTY2FsZSA9IGN1cnJlbnRTY2FsZTtcblxuICAgICAgICBsZXQgY3VycmVudFJvdGF0aW9uID0gZXZlbnQucm90YXRpb247XG4gICAgICAgIGxldCByb3RhdGlvbkRlbHRhID0gY3VycmVudFJvdGF0aW9uIC0gbGFzdFJvdGF0aW9uO1xuICAgICAgICBjb25zb2xlLmxvZyhsYXN0Um90YXRpb24sIGN1cnJlbnRSb3RhdGlvbiwgcm90YXRpb25EZWx0YSk7XG4gICAgICAgIGxhc3RSb3RhdGlvbiA9IGN1cnJlbnRSb3RhdGlvbjtcblxuICAgICAgICAvLyBjb25zb2xlLmxvZyhgc2NhbGluZyBieSAke3NjYWxlRGVsdGF9YCk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGByb3RhdGluZyBieSAke3JvdGF0aW9uRGVsdGF9YCk7XG5cbiAgICAgICAgcGluY2hlZEdyb3VwLnBvc2l0aW9uID0gZXZlbnQuY2VudGVyO1xuICAgICAgICBwaW5jaGVkR3JvdXAuc2NhbGUoc2NhbGVEZWx0YSk7XG4gICAgICAgIHBpbmNoZWRHcm91cC5yb3RhdGUocm90YXRpb25EZWx0YSk7XG5cbiAgICAgICAgcGluY2hlZEdyb3VwLmRhdGEuc2NhbGUgKj0gc2NhbGVEZWx0YTtcbiAgICAgICAgcGluY2hlZEdyb3VwLmRhdGEucm90YXRpb24gKz0gcm90YXRpb25EZWx0YTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgbGFzdEV2ZW50O1xuICAgIGZ1bmN0aW9uIHBpbmNoRW5kKGV2ZW50KSB7XG4gICAgICAvLyB3YWl0IDI1MCBtcyB0byBwcmV2ZW50IG1pc3Rha2VuIHBhbiByZWFkaW5nc1xuICAgICAgbGFzdEV2ZW50ID0gZXZlbnQ7XG4gICAgICBpZiAoISFwaW5jaGVkR3JvdXApIHtcbiAgICAgICAgcGluY2hlZEdyb3VwLmRhdGEudXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgbGV0IG1vdmUgPSB7XG4gICAgICAgICAgaWQ6IHBpbmNoZWRHcm91cC5pZCxcbiAgICAgICAgICB0eXBlOiAndHJhbnNmb3JtJ1xuICAgICAgICB9O1xuICAgICAgICBpZiAocGluY2hlZEdyb3VwLnBvc2l0aW9uICE9IG9yaWdpbmFsUG9zaXRpb24pIHtcbiAgICAgICAgICBtb3ZlLnBvc2l0aW9uID0gb3JpZ2luYWxQb3NpdGlvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwaW5jaGVkR3JvdXAuZGF0YS5yb3RhdGlvbiAhPSBvcmlnaW5hbFJvdGF0aW9uKSB7XG4gICAgICAgICAgbW92ZS5yb3RhdGlvbiA9IG9yaWdpbmFsUm90YXRpb24gLSBwaW5jaGVkR3JvdXAuZGF0YS5yb3RhdGlvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwaW5jaGVkR3JvdXAuZGF0YS5zY2FsZSAhPSBvcmlnaW5hbFNjYWxlKSB7XG4gICAgICAgICAgbW92ZS5zY2FsZSA9IG9yaWdpbmFsU2NhbGUgLyBwaW5jaGVkR3JvdXAuZGF0YS5zY2FsZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnNvbGUubG9nKCdmaW5hbCBzY2FsZScsIHBpbmNoZWRHcm91cC5kYXRhLnNjYWxlKTtcbiAgICAgICAgY29uc29sZS5sb2cobW92ZSk7XG5cbiAgICAgICAgTU9WRVMucHVzaChtb3ZlKTtcblxuICAgICAgICBpZiAoTWF0aC5hYnMoZXZlbnQudmVsb2NpdHkpID4gMSkge1xuICAgICAgICAgIC8vIGRpc3Bvc2Ugb2YgZ3JvdXAgb2Zmc2NyZWVuXG4gICAgICAgICAgdGhyb3dQaW5jaGVkR3JvdXAoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIChydW5BbmltYXRpb25zKSB7XG4gICAgICAgIC8vICAgcGluY2hlZEdyb3VwLmFuaW1hdGUoe1xuICAgICAgICAvLyAgICAgcHJvcGVydGllczoge1xuICAgICAgICAvLyAgICAgICBzY2FsZTogMC44XG4gICAgICAgIC8vICAgICB9LFxuICAgICAgICAvLyAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgLy8gICAgICAgZHVyYXRpb246IDEwMCxcbiAgICAgICAgLy8gICAgICAgZWFzaW5nOiBcImVhc2VPdXRcIixcbiAgICAgICAgLy8gICAgIH1cbiAgICAgICAgLy8gICB9KTtcbiAgICAgICAgLy8gfVxuICAgICAgfVxuICAgICAgcGluY2hpbmcgPSBmYWxzZTtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIGhhbW1lck1hbmFnZXIuZ2V0KCdwYW4nKS5zZXQoe2VuYWJsZTogdHJ1ZX0pO1xuICAgICAgfSwgMjUwKTtcbiAgICB9XG5cbiAgICBjb25zdCBoaXRPcHRpb25zID0ge1xuICAgICAgc2VnbWVudHM6IGZhbHNlLFxuICAgICAgc3Ryb2tlOiB0cnVlLFxuICAgICAgZmlsbDogdHJ1ZSxcbiAgICAgIHRvbGVyYW5jZTogNVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBzaW5nbGVUYXAoZXZlbnQpIHtcbiAgICAgIGNvbnN0IHBvaW50ZXIgPSBldmVudC5jZW50ZXIsXG4gICAgICAgICAgcG9pbnQgPSBuZXcgUG9pbnQocG9pbnRlci54LCBwb2ludGVyLnkpLFxuICAgICAgICAgIGhpdFJlc3VsdCA9IHBhcGVyLnByb2plY3QuaGl0VGVzdChwb2ludCwgaGl0T3B0aW9ucyk7XG5cbiAgICAgIGlmIChoaXRSZXN1bHQpIHtcbiAgICAgICAgbGV0IGl0ZW0gPSBoaXRSZXN1bHQuaXRlbTtcbiAgICAgICAgaXRlbS5zZWxlY3RlZCA9ICFpdGVtLnNlbGVjdGVkO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRvdWJsZVRhcChldmVudCkge1xuICAgICAgY29uc3QgcG9pbnRlciA9IGV2ZW50LmNlbnRlcixcbiAgICAgICAgICBwb2ludCA9IG5ldyBQb2ludChwb2ludGVyLngsIHBvaW50ZXIueSksXG4gICAgICAgICAgaGl0UmVzdWx0ID0gcGFwZXIucHJvamVjdC5oaXRUZXN0KHBvaW50LCBoaXRPcHRpb25zKTtcblxuICAgICAgaWYgKGhpdFJlc3VsdCkge1xuICAgICAgICBsZXQgaXRlbSA9IGhpdFJlc3VsdC5pdGVtO1xuICAgICAgICBsZXQgcGFyZW50ID0gaXRlbS5wYXJlbnQ7XG5cbiAgICAgICAgaWYgKGl0ZW0uZGF0YS5pbnRlcmlvcikge1xuICAgICAgICAgIGl0ZW0uZGF0YS50cmFuc3BhcmVudCA9ICFpdGVtLmRhdGEudHJhbnNwYXJlbnQ7XG5cbiAgICAgICAgICBpZiAoaXRlbS5kYXRhLnRyYW5zcGFyZW50KSB7XG4gICAgICAgICAgICBpdGVtLmZpbGxDb2xvciA9IHRyYW5zcGFyZW50O1xuICAgICAgICAgICAgaXRlbS5zdHJva2VDb2xvciA9IHRyYW5zcGFyZW50O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpdGVtLmZpbGxDb2xvciA9IHBhcmVudC5kYXRhLmNvbG9yO1xuICAgICAgICAgICAgaXRlbS5zdHJva2VDb2xvciA9IHBhcmVudC5kYXRhLmNvbG9yO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIE1PVkVTLnB1c2goe1xuICAgICAgICAgICAgdHlwZTogJ2ZpbGxDaGFuZ2UnLFxuICAgICAgICAgICAgaWQ6IGl0ZW0uaWQsXG4gICAgICAgICAgICBmaWxsOiBwYXJlbnQuZGF0YS5jb2xvcixcbiAgICAgICAgICAgIHRyYW5zcGFyZW50OiBpdGVtLmRhdGEudHJhbnNwYXJlbnRcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnbm90IGludGVyaW9yJylcbiAgICAgICAgfVxuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwaW5jaGVkR3JvdXAgPSBudWxsO1xuICAgICAgICBjb25zb2xlLmxvZygnaGl0IG5vIGl0ZW0nKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCB2ZWxvY2l0eU11bHRpcGxpZXIgPSAyNTtcbiAgICBmdW5jdGlvbiB0aHJvd1BpbmNoZWRHcm91cCgpIHtcbiAgICAgIGNvbnNvbGUubG9nKHBpbmNoZWRHcm91cC5wb3NpdGlvbik7XG4gICAgICBpZiAocGluY2hlZEdyb3VwLnBvc2l0aW9uLnggPD0gMCAtIHBpbmNoZWRHcm91cC5ib3VuZHMud2lkdGggfHxcbiAgICAgICAgICBwaW5jaGVkR3JvdXAucG9zaXRpb24ueCA+PSB2aWV3V2lkdGggKyBwaW5jaGVkR3JvdXAuYm91bmRzLndpZHRoIHx8XG4gICAgICAgICAgcGluY2hlZEdyb3VwLnBvc2l0aW9uLnkgPD0gMCAtIHBpbmNoZWRHcm91cC5ib3VuZHMuaGVpZ2h0IHx8XG4gICAgICAgICAgcGluY2hlZEdyb3VwLnBvc2l0aW9uLnkgPj0gdmlld0hlaWdodCArIHBpbmNoZWRHcm91cC5ib3VuZHMuaGVpZ2h0KSB7XG4gICAgICAgICAgICBwaW5jaGVkR3JvdXAuZGF0YS5vZmZTY3JlZW4gPSB0cnVlO1xuICAgICAgICAgICAgcGluY2hlZEdyb3VwLnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRocm93UGluY2hlZEdyb3VwKTtcbiAgICAgIHBpbmNoZWRHcm91cC5wb3NpdGlvbi54ICs9IGxhc3RFdmVudC52ZWxvY2l0eVggKiB2ZWxvY2l0eU11bHRpcGxpZXI7XG4gICAgICBwaW5jaGVkR3JvdXAucG9zaXRpb24ueSArPSBsYXN0RXZlbnQudmVsb2NpdHlZICogdmVsb2NpdHlNdWx0aXBsaWVyO1xuICAgIH1cblxuICAgIHZhciBoYW1tZXJNYW5hZ2VyID0gbmV3IEhhbW1lci5NYW5hZ2VyKCRjYW52YXNbMF0pO1xuXG4gICAgaGFtbWVyTWFuYWdlci5hZGQobmV3IEhhbW1lci5UYXAoeyBldmVudDogJ2RvdWJsZXRhcCcsIHRhcHM6IDIgfSkpO1xuICAgIGhhbW1lck1hbmFnZXIuYWRkKG5ldyBIYW1tZXIuVGFwKHsgZXZlbnQ6ICdzaW5nbGV0YXAnIH0pKTtcbiAgICBoYW1tZXJNYW5hZ2VyLmFkZChuZXcgSGFtbWVyLlBhbih7IGRpcmVjdGlvbjogSGFtbWVyLkRJUkVDVElPTl9BTEwgfSkpO1xuICAgIGhhbW1lck1hbmFnZXIuYWRkKG5ldyBIYW1tZXIuUGluY2goKSk7XG5cbiAgICBoYW1tZXJNYW5hZ2VyLmdldCgnZG91YmxldGFwJykucmVjb2duaXplV2l0aCgnc2luZ2xldGFwJyk7XG4gICAgaGFtbWVyTWFuYWdlci5nZXQoJ3NpbmdsZXRhcCcpLnJlcXVpcmVGYWlsdXJlKCdkb3VibGV0YXAnKTtcbiAgICBoYW1tZXJNYW5hZ2VyLmdldCgncGFuJykucmVxdWlyZUZhaWx1cmUoJ3BpbmNoJyk7XG5cbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdzaW5nbGV0YXAnLCBzaW5nbGVUYXApO1xuICAgIGhhbW1lck1hbmFnZXIub24oJ2RvdWJsZXRhcCcsIGRvdWJsZVRhcCk7XG5cbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdwYW5zdGFydCcsIHBhblN0YXJ0KTtcbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdwYW5tb3ZlJywgcGFuTW92ZSk7XG4gICAgaGFtbWVyTWFuYWdlci5vbigncGFuZW5kJywgcGFuRW5kKTtcblxuICAgIGhhbW1lck1hbmFnZXIub24oJ3BpbmNoc3RhcnQnLCBwaW5jaFN0YXJ0KTtcbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdwaW5jaG1vdmUnLCBwaW5jaE1vdmUpO1xuICAgIGhhbW1lck1hbmFnZXIub24oJ3BpbmNoZW5kJywgcGluY2hFbmQpO1xuICAgIGhhbW1lck1hbmFnZXIub24oJ3BpbmNoY2FuY2VsJywgZnVuY3Rpb24oKSB7IGhhbW1lck1hbmFnZXIuZ2V0KCdwYW4nKS5zZXQoe2VuYWJsZTogdHJ1ZX0pOyB9KTsgLy8gbWFrZSBzdXJlIGl0J3MgcmVlbmFibGVkXG4gIH1cblxuICBmdW5jdGlvbiBuZXdQcmVzc2VkKCkge1xuICAgIGNvbnNvbGUubG9nKCduZXcgcHJlc3NlZCcpO1xuXG4gICAgcGFwZXIucHJvamVjdC5hY3RpdmVMYXllci5yZW1vdmVDaGlsZHJlbigpO1xuICB9XG5cbiAgZnVuY3Rpb24gdW5kb1ByZXNzZWQoKSB7XG4gICAgY29uc29sZS5sb2coJ3VuZG8gcHJlc3NlZCcpO1xuICAgIGlmICghKE1PVkVTLmxlbmd0aCA+IDApKSB7XG4gICAgICBjb25zb2xlLmxvZygnbm8gbW92ZXMgeWV0Jyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IGxhc3RNb3ZlID0gTU9WRVMucG9wKCk7XG4gICAgbGV0IGl0ZW0gPSBwcm9qZWN0LmdldEl0ZW0oe1xuICAgICAgaWQ6IGxhc3RNb3ZlLmlkXG4gICAgfSk7XG5cbiAgICBpZiAoaXRlbSkge1xuICAgICAgaXRlbS52aXNpYmxlID0gdHJ1ZTsgLy8gbWFrZSBzdXJlXG4gICAgICBzd2l0Y2gobGFzdE1vdmUudHlwZSkge1xuICAgICAgICBjYXNlICduZXdHcm91cCc6XG4gICAgICAgICAgY29uc29sZS5sb2coJ3JlbW92aW5nIGdyb3VwJyk7XG4gICAgICAgICAgaXRlbS5yZW1vdmUoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZmlsbENoYW5nZSc6XG4gICAgICAgICAgaWYgKGxhc3RNb3ZlLnRyYW5zcGFyZW50KSB7XG4gICAgICAgICAgICBpdGVtLmZpbGxDb2xvciA9IGxhc3RNb3ZlLmZpbGw7XG4gICAgICAgICAgICBpdGVtLnN0cm9rZUNvbG9yID0gbGFzdE1vdmUuZmlsbDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaXRlbS5maWxsQ29sb3IgPSB0cmFuc3BhcmVudDtcbiAgICAgICAgICAgIGl0ZW0uc3Ryb2tlQ29sb3IgPSB0cmFuc3BhcmVudDtcbiAgICAgICAgICB9XG4gICAgICAgIGNhc2UgJ3RyYW5zZm9ybSc6XG4gICAgICAgICAgaWYgKCEhbGFzdE1vdmUucG9zaXRpb24pIHtcbiAgICAgICAgICAgIGl0ZW0ucG9zaXRpb24gPSBsYXN0TW92ZS5wb3NpdGlvblxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoISFsYXN0TW92ZS5yb3RhdGlvbikge1xuICAgICAgICAgICAgaXRlbS5yb3RhdGlvbiA9IGxhc3RNb3ZlLnJvdGF0aW9uO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoISFsYXN0TW92ZS5zY2FsZSkge1xuICAgICAgICAgICAgaXRlbS5zY2FsZShsYXN0TW92ZS5zY2FsZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGNvbnNvbGUubG9nKCd1bmtub3duIGNhc2UnKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coJ2NvdWxkIG5vdCBmaW5kIG1hdGNoaW5nIGl0ZW0nKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBwbGF5UHJlc3NlZCgpIHtcbiAgICBjb25zb2xlLmxvZygncGxheSBwcmVzc2VkJyk7XG4gIH1cblxuICBmdW5jdGlvbiB0aXBzUHJlc3NlZCgpIHtcbiAgICBjb25zb2xlLmxvZygndGlwcyBwcmVzc2VkJyk7XG4gIH1cblxuICBmdW5jdGlvbiBzaGFyZVByZXNzZWQoKSB7XG4gICAgY29uc29sZS5sb2coJ3NoYXJlIHByZXNzZWQnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXROZXcoKSB7XG4gICAgJCgnLm1haW4tY29udHJvbHMgLm5ldycpLm9uKCdjbGljayB0YXAgdG91Y2gnLCBuZXdQcmVzc2VkKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRVbmRvKCkge1xuICAgICQoJy5tYWluLWNvbnRyb2xzIC51bmRvJykub24oJ2NsaWNrJywgdW5kb1ByZXNzZWQpO1xuICB9XG4gIGZ1bmN0aW9uIGluaXRQbGF5KCkge1xuICAgICQoJy5tYWluLWNvbnRyb2xzIC5wbGF5Jykub24oJ2NsaWNrJywgcGxheVByZXNzZWQpO1xuICB9XG4gIGZ1bmN0aW9uIGluaXRUaXBzKCkge1xuICAgICQoJy5hdXgtY29udHJvbHMgLnRpcHMnKS5vbignY2xpY2snLCB0aXBzUHJlc3NlZCk7XG4gIH1cbiAgZnVuY3Rpb24gaW5pdFNoYXJlKCkge1xuICAgICQoJy5hdXgtY29udHJvbHMgLnNoYXJlJykub24oJ2NsaWNrJywgc2hhcmVQcmVzc2VkKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRyYXdDaXJjbGUoKSB7XG4gICAgbGV0IGNpcmNsZSA9IG5ldyBQYXRoLkNpcmNsZSh7XG4gICAgICBjZW50ZXI6IFs0MDAsIDQwMF0sXG4gICAgICByYWRpdXM6IDEwMCxcbiAgICAgIHN0cm9rZUNvbG9yOiAnZ3JlZW4nLFxuICAgICAgZmlsbENvbG9yOiAnZ3JlZW4nXG4gICAgfSk7XG4gICAgbGV0IGdyb3VwID0gbmV3IEdyb3VwKGNpcmNsZSk7XG4gIH1cblxuICBmdW5jdGlvbiBtYWluKCkge1xuICAgIGluaXRDb250cm9sUGFuZWwoKTtcbiAgICAvLyBkcmF3Q2lyY2xlKCk7XG4gICAgaW5pdFZpZXdWYXJzKCk7XG4gIH1cblxuICBtYWluKCk7XG59KTtcbiIsIi8vIENvbnZlcnRzIGZyb20gZGVncmVlcyB0byByYWRpYW5zLlxuZXhwb3J0IGZ1bmN0aW9uIHJhZChkZWdyZWVzKSB7XG4gIHJldHVybiBkZWdyZWVzICogTWF0aC5QSSAvIDE4MDtcbn07XG5cbi8vIENvbnZlcnRzIGZyb20gcmFkaWFucyB0byBkZWdyZWVzLlxuZXhwb3J0IGZ1bmN0aW9uIGRlZyhyYWRpYW5zKSB7XG4gIHJldHVybiByYWRpYW5zICogMTgwIC8gTWF0aC5QSTtcbn07XG5cbi8vIGRpc3RhbmNlIGJldHdlZW4gdHdvIHBvaW50c1xuZXhwb3J0IGZ1bmN0aW9uIGRlbHRhKHAxLCBwMikge1xuICByZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KHAxLnggLSBwMi54LCAyKSArIE1hdGgucG93KHAxLnkgLSBwMi55LCAyKSk7IC8vIHB5dGhhZ29yZWFuIVxufVxuXG4vLyByZXR1cm5zIGFuIGFycmF5IG9mIHRoZSBpbnRlcmlvciBjdXJ2ZXMgb2YgYSBnaXZlbiBjb21wb3VuZCBwYXRoXG5leHBvcnQgZnVuY3Rpb24gZmluZEludGVyaW9yQ3VydmVzKHBhdGgpIHtcbiAgbGV0IGludGVyaW9yQ3VydmVzID0gW107XG4gIGlmICghcGF0aCB8fCAhcGF0aC5jaGlsZHJlbiB8fCAhcGF0aC5jaGlsZHJlbi5sZW5ndGgpIHJldHVybjtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHBhdGguY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICBsZXQgY2hpbGQgPSBwYXRoLmNoaWxkcmVuW2ldO1xuXG4gICAgaWYgKGNoaWxkLmNsb3NlZCl7XG4gICAgICBpbnRlcmlvckN1cnZlcy5wdXNoKG5ldyBQYXRoKGNoaWxkLnNlZ21lbnRzKSk7XG4gICAgfVxuICB9XG5cbiAgcGF0aC5yZW1vdmUoKTtcbiAgcmV0dXJuIGludGVyaW9yQ3VydmVzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJ1ZUdyb3VwKGdyb3VwKSB7XG4gIGxldCBib3VuZHMgPSBncm91cC5fbmFtZWRDaGlsZHJlbi5ib3VuZHNbMF0sXG4gICAgICBtaWRkbGUgPSBncm91cC5fbmFtZWRDaGlsZHJlbi5taWRkbGVbMF07XG5cbiAgbGV0IG1pZGRsZUNvcHkgPSBuZXcgUGF0aCgpO1xuICBtaWRkbGVDb3B5LmNvcHlDb250ZW50KG1pZGRsZSk7XG4gIG1pZGRsZUNvcHkudmlzaWJsZSA9IGZhbHNlO1xuICBsZXQgZGl2aWRlZFBhdGggPSBtaWRkbGVDb3B5LnJlc29sdmVDcm9zc2luZ3MoKTtcbiAgZGl2aWRlZFBhdGgudmlzaWJsZSA9IGZhbHNlO1xuICBCYXNlLmVhY2goZGl2aWRlZFBhdGguY2hpbGRyZW4sIGZ1bmN0aW9uKGNoaWxkLCBpKSB7XG4gICAgaWYgKGNoaWxkLmNsb3NlZCkge1xuICAgICAgY2hpbGQuc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2hpbGQuc2VsZWN0ZWQgPSB0cnVlO1xuICAgIH1cbiAgICAvLyBjb25zb2xlLmxvZyhjaGlsZCwgaSk7XG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cnVlUGF0aChwYXRoKSB7XG4gIC8vIGNvbnNvbGUubG9nKGdyb3VwKTtcbiAgLy8gaWYgKHBhdGggJiYgcGF0aC5jaGlsZHJlbiAmJiBwYXRoLmNoaWxkcmVuLmxlbmd0aCA+IDAgJiYgcGF0aC5fbmFtZWRDaGlsZHJlblsnbWlkZGxlJ10pIHtcbiAgLy8gICBsZXQgcGF0aENvcHkgPSBuZXcgUGF0aCgpO1xuICAvLyAgIGNvbnNvbGUubG9nKHBhdGguX25hbWVkQ2hpbGRyZW5bJ21pZGRsZSddKTtcbiAgLy8gICBwYXRoQ29weS5jb3B5Q29udGVudChwYXRoLl9uYW1lZENoaWxkcmVuWydtaWRkbGUnXSk7XG4gIC8vICAgY29uc29sZS5sb2cocGF0aENvcHkpO1xuICAvLyB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjaGVja1BvcHMoKSB7XG4gIGxldCBncm91cHMgPSBwYXBlci5wcm9qZWN0LmdldEl0ZW1zKHtcbiAgICBjbGFzc05hbWU6ICdHcm91cCcsXG4gICAgbWF0Y2g6IGZ1bmN0aW9uKGVsKSB7XG4gICAgICByZXR1cm4gKCEhZWwuZGF0YSAmJiBlbC5kYXRhLnVwZGF0ZSk7XG4gICAgfVxuICB9KTtcbn1cblxuLy8gaHR0cHM6Ly9ncm91cHMuZ29vZ2xlLmNvbS9mb3J1bS8jIXRvcGljL3BhcGVyanMvVUQ4TDBNVHlSZVFcbmV4cG9ydCBmdW5jdGlvbiBvdmVybGFwcyhwYXRoLCBvdGhlcikge1xuICByZXR1cm4gIShwYXRoLmdldEludGVyc2VjdGlvbnMob3RoZXIpLmxlbmd0aCA9PT0gMCk7XG59XG5cbi8vIGh0dHBzOi8vZ3JvdXBzLmdvb2dsZS5jb20vZm9ydW0vIyF0b3BpYy9wYXBlcmpzL1VEOEwwTVR5UmVRXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VPbmVQYXRoKHBhdGgsIG90aGVycykge1xuICBsZXQgaSwgbWVyZ2VkLCBvdGhlciwgdW5pb24sIF9pLCBfbGVuLCBfcmVmO1xuICBmb3IgKGkgPSBfaSA9IDAsIF9sZW4gPSBvdGhlcnMubGVuZ3RoOyBfaSA8IF9sZW47IGkgPSArK19pKSB7XG4gICAgb3RoZXIgPSBvdGhlcnNbaV07XG4gICAgaWYgKG92ZXJsYXBzKHBhdGgsIG90aGVyKSkge1xuICAgICAgdW5pb24gPSBwYXRoLnVuaXRlKG90aGVyKTtcbiAgICAgIG1lcmdlZCA9IG1lcmdlT25lUGF0aCh1bmlvbiwgb3RoZXJzLnNsaWNlKGkgKyAxKSk7XG4gICAgICByZXR1cm4gKF9yZWYgPSBvdGhlcnMuc2xpY2UoMCwgaSkpLmNvbmNhdC5hcHBseShfcmVmLCBtZXJnZWQpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gb3RoZXJzLmNvbmNhdChwYXRoKTtcbn07XG5cbi8vIGh0dHBzOi8vZ3JvdXBzLmdvb2dsZS5jb20vZm9ydW0vIyF0b3BpYy9wYXBlcmpzL1VEOEwwTVR5UmVRXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VQYXRocyhwYXRocykge1xuICB2YXIgcGF0aCwgcmVzdWx0LCBfaSwgX2xlbjtcbiAgcmVzdWx0ID0gW107XG4gIGZvciAoX2kgPSAwLCBfbGVuID0gcGF0aHMubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICBwYXRoID0gcGF0aHNbX2ldO1xuICAgIHJlc3VsdCA9IG1lcmdlT25lUGF0aChwYXRoLCByZXN1bHQpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gaGl0VGVzdEJvdW5kcyhwb2ludCwgY2hpbGRyZW4pIHtcbiAgaWYgKCFwb2ludCkgcmV0dXJuIG51bGw7XG5cbiAgZm9yIChsZXQgaSA9IGNoaWxkcmVuLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgbGV0IGNoaWxkID0gY2hpbGRyZW5baV07XG4gICAgbGV0IGJvdW5kcyA9IGNoaWxkLnN0cm9rZUJvdW5kcztcbiAgICBpZiAocG9pbnQuaXNJbnNpZGUoY2hpbGQuc3Ryb2tlQm91bmRzKSkge1xuICAgICAgcmV0dXJuIGNoaWxkO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuIl19
