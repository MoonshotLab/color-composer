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
      } else {}
      // console.log('no intersections');

      // console.log(group.rotation);
      lastChild = group;
      // console.log(group);

      // let unitedGroupIds = [paper.project.activeLayer.id, group.id];
      // group.children.map(function(el) {
      //   unitedGroupIds.push(el.id);
      // });
      // console.log('unitedGroupIds', unitedGroupIds);


      // let unitedGroup = group.children.reduce(function(a, b) {
      //   return a.unite(b);
      // }, new Path({
      //   fillColor: 'pink',
      //   strokeWidth: 1,
      //   strokeColor: 'pink',
      //   fillRule: 'evenodd'
      // }));
      // console.log('unitedGroup', unitedGroup);
      //
      // unitedGroup.selected = false;
      // unitedGroup.visible = false;
      // // group.selected = true;
      //
      // let neighbors = project.getItems({
      //   overlapping: unitedGroup.strokeBounds,
      //   match: function(el) {
      //     return unitedGroupIds.includes(el.id);
      //   }
      // });
      // if (neighbors.length > 0) {
      //   console.log('neighbors', neighbors);
      // } else {
      //   console.log('no neighbors');
      // }
      // let rect = new Path.Rectangle(group.strokeBounds);
      // rect.strokeColor = 'pink';
      // rect.strokeWidth = 2;

      util.checkPops();

      group.data.color = bounds.fillColor;
      group.data.scale = 1; // init variable to track scale changes
      group.data.rotation = 0; // init variable to track rotation changes

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
          console.log('interior');
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
  Base.each(groups, function (group, i) {
    console.log(group);
  });
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxPQUFPLEdBQVAsR0FBYSxPQUFPLEdBQVAsSUFBYztBQUN6QixXQUFTLENBQUMsU0FBRCxFQUFZLFNBQVosRUFBdUIsU0FBdkIsRUFBa0MsU0FBbEMsRUFBNkMsU0FBN0MsRUFBd0QsU0FBeEQsRUFBbUUsU0FBbkUsRUFBOEUsU0FBOUUsRUFBeUYsU0FBekYsRUFBb0csU0FBcEcsRUFBK0csU0FBL0csRUFBMEgsU0FBMUgsRUFBcUksU0FBckksRUFBZ0osU0FBaEosRUFBMkosU0FBM0osRUFBc0ssU0FBdEssQ0FEZ0I7QUFFekIsZ0JBQWMsU0FGVztBQUd6QixZQUFVLEVBSGU7QUFJekIsU0FBTztBQUprQixDQUEzQjs7QUFPQSxNQUFNLE9BQU4sQ0FBYyxNQUFkOztBQUVBLElBQU0sT0FBTyxRQUFRLFFBQVIsQ0FBYjtBQUNBOztBQUVBLEVBQUUsUUFBRixFQUFZLEtBQVosQ0FBa0IsWUFBVztBQUMzQixNQUFJLFFBQVEsRUFBWixDQUQyQixDQUNYO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxNQUFNLFVBQVUsRUFBRSxNQUFGLENBQWhCO0FBQ0EsTUFBTSxRQUFRLEVBQUUsTUFBRixDQUFkO0FBQ0EsTUFBTSxVQUFVLEVBQUUsbUJBQUYsQ0FBaEI7QUFDQSxNQUFNLGdCQUFnQixLQUF0QjtBQUNBLE1BQU0sY0FBYyxJQUFJLEtBQUosQ0FBVSxDQUFWLEVBQWEsQ0FBYixDQUFwQjs7QUFFQSxNQUFJLGtCQUFKO0FBQUEsTUFBZSxtQkFBZjs7QUFFQSxXQUFTLFlBQVQsR0FBd0I7QUFDdEIsZ0JBQVksTUFBTSxJQUFOLENBQVcsUUFB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QUF3QjtBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNEOztBQUVNLFNBQVMsU0FBVCxHQUFxQjtBQUMxQixNQUFJLFNBQVMsTUFBTSxPQUFOLENBQWMsUUFBZCxDQUF1QjtBQUNsQyxlQUFXLE9BRHVCO0FBRWxDLFdBQU8sZUFBUyxFQUFULEVBQWE7QUFDbEIsYUFBUSxDQUFDLENBQUMsR0FBRyxJQUFMLElBQWEsR0FBRyxJQUFILENBQVEsTUFBN0I7QUFDRDtBQUppQyxHQUF2QixDQUFiO0FBTUEsT0FBSyxJQUFMLENBQVUsTUFBVixFQUFrQixVQUFTLEtBQVQsRUFBZ0IsQ0FBaEIsRUFBbUI7QUFDbkMsWUFBUSxHQUFSLENBQVksS0FBWjtBQUNELEdBRkQ7QUFHRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ3aW5kb3cua2FuID0gd2luZG93LmthbiB8fCB7XG4gIHBhbGV0dGU6IFtcIiMyMDE3MUNcIiwgXCIjMUUyQTQzXCIsIFwiIzI4Mzc3RFwiLCBcIiMzNTI3NDdcIiwgXCIjRjI4NUE1XCIsIFwiI0NBMkUyNlwiLCBcIiNCODQ1MjZcIiwgXCIjREE2QzI2XCIsIFwiIzQ1MzEyMVwiLCBcIiM5MTZBNDdcIiwgXCIjRUVCNjQxXCIsIFwiI0Y2RUIxNlwiLCBcIiM3RjdEMzFcIiwgXCIjNkVBRDc5XCIsIFwiIzJBNDYyMVwiLCBcIiNGNEVBRTBcIl0sXG4gIGN1cnJlbnRDb2xvcjogJyMyMDE3MUMnLFxuICBudW1QYXRoczogMTAsXG4gIHBhdGhzOiBbXSxcbn07XG5cbnBhcGVyLmluc3RhbGwod2luZG93KTtcblxuY29uc3QgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuLy8gcmVxdWlyZSgncGFwZXItYW5pbWF0ZScpO1xuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgbGV0IE1PVkVTID0gW107IC8vIHN0b3JlIGdsb2JhbCBtb3ZlcyBsaXN0XG4gIC8vIG1vdmVzID0gW1xuICAvLyAgIHtcbiAgLy8gICAgICd0eXBlJzogJ2NvbG9yQ2hhbmdlJyxcbiAgLy8gICAgICdvbGQnOiAnIzIwMTcxQycsXG4gIC8vICAgICAnbmV3JzogJyNGMjg1QTUnXG4gIC8vICAgfSxcbiAgLy8gICB7XG4gIC8vICAgICAndHlwZSc6ICduZXdQYXRoJyxcbiAgLy8gICAgICdyZWYnOiAnPz8/JyAvLyB1dWlkPyBkb20gcmVmZXJlbmNlP1xuICAvLyAgIH0sXG4gIC8vICAge1xuICAvLyAgICAgJ3R5cGUnOiAncGF0aFRyYW5zZm9ybScsXG4gIC8vICAgICAncmVmJzogJz8/PycsIC8vIHV1aWQ/IGRvbSByZWZlcmVuY2U/XG4gIC8vICAgICAnb2xkJzogJ3JvdGF0ZSg5MGRlZylzY2FsZSgxLjUpJywgLy8gPz8/XG4gIC8vICAgICAnbmV3JzogJ3JvdGF0ZSgxMjBkZWcpc2NhbGUoLTAuNSknIC8vID8/P1xuICAvLyAgIH0sXG4gIC8vICAgLy8gb3RoZXJzP1xuICAvLyBdXG5cbiAgY29uc3QgJHdpbmRvdyA9ICQod2luZG93KTtcbiAgY29uc3QgJGJvZHkgPSAkKCdib2R5Jyk7XG4gIGNvbnN0ICRjYW52YXMgPSAkKCdjYW52YXMjbWFpbkNhbnZhcycpO1xuICBjb25zdCBydW5BbmltYXRpb25zID0gZmFsc2U7XG4gIGNvbnN0IHRyYW5zcGFyZW50ID0gbmV3IENvbG9yKDAsIDApO1xuXG4gIGxldCB2aWV3V2lkdGgsIHZpZXdIZWlnaHQ7XG5cbiAgZnVuY3Rpb24gaW5pdFZpZXdWYXJzKCkge1xuICAgIHZpZXdXaWR0aCA9IHBhcGVyLnZpZXcudmlld1NpemUud2lkdGg7XG4gICAgdmlld0hlaWdodCA9IHBhcGVyLnZpZXcudmlld1NpemUuaGVpZ2h0O1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdENvbnRyb2xQYW5lbCgpIHtcbiAgICBpbml0Q29sb3JQYWxldHRlKCk7XG4gICAgaW5pdENhbnZhc0RyYXcoKTtcbiAgICBpbml0TmV3KCk7XG4gICAgaW5pdFVuZG8oKTtcbiAgICBpbml0UGxheSgpO1xuICAgIGluaXRUaXBzKCk7XG4gICAgaW5pdFNoYXJlKCk7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0Q29sb3JQYWxldHRlKCkge1xuICAgIGNvbnN0ICRwYWxldHRlV3JhcCA9ICQoJ3VsLnBhbGV0dGUtY29sb3JzJyk7XG4gICAgY29uc3QgJHBhbGV0dGVDb2xvcnMgPSAkcGFsZXR0ZVdyYXAuZmluZCgnbGknKTtcbiAgICBjb25zdCBwYWxldHRlQ29sb3JTaXplID0gMjA7XG4gICAgY29uc3QgcGFsZXR0ZVNlbGVjdGVkQ29sb3JTaXplID0gMzA7XG4gICAgY29uc3QgcGFsZXR0ZVNlbGVjdGVkQ2xhc3MgPSAncGFsZXR0ZS1zZWxlY3RlZCc7XG5cbiAgICAvLyBob29rIHVwIGNsaWNrXG4gICAgICAkcGFsZXR0ZUNvbG9ycy5vbignY2xpY2sgdGFwIHRvdWNoJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgbGV0ICRzdmcgPSAkKHRoaXMpLmZpbmQoJ3N2Zy5wYWxldHRlLWNvbG9yJyk7XG5cbiAgICAgICAgICBpZiAoISRzdmcuaGFzQ2xhc3MocGFsZXR0ZVNlbGVjdGVkQ2xhc3MpKSB7XG4gICAgICAgICAgICAkKCcuJyArIHBhbGV0dGVTZWxlY3RlZENsYXNzKVxuICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MocGFsZXR0ZVNlbGVjdGVkQ2xhc3MpXG4gICAgICAgICAgICAgIC5hdHRyKCd3aWR0aCcsIHBhbGV0dGVDb2xvclNpemUpXG4gICAgICAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCBwYWxldHRlQ29sb3JTaXplKVxuICAgICAgICAgICAgICAuZmluZCgncmVjdCcpXG4gICAgICAgICAgICAgIC5hdHRyKCdyeCcsIDApXG4gICAgICAgICAgICAgIC5hdHRyKCdyeScsIDApO1xuXG4gICAgICAgICAgICAkc3ZnLmFkZENsYXNzKHBhbGV0dGVTZWxlY3RlZENsYXNzKVxuICAgICAgICAgICAgICAuYXR0cignd2lkdGgnLCBwYWxldHRlU2VsZWN0ZWRDb2xvclNpemUpXG4gICAgICAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCBwYWxldHRlU2VsZWN0ZWRDb2xvclNpemUpXG4gICAgICAgICAgICAgIC5maW5kKCdyZWN0JylcbiAgICAgICAgICAgICAgLmF0dHIoJ3J4JywgcGFsZXR0ZVNlbGVjdGVkQ29sb3JTaXplIC8gMilcbiAgICAgICAgICAgICAgLmF0dHIoJ3J5JywgcGFsZXR0ZVNlbGVjdGVkQ29sb3JTaXplIC8gMilcblxuICAgICAgICAgICAgd2luZG93Lmthbi5jdXJyZW50Q29sb3IgPSAkc3ZnLmZpbmQoJ3JlY3QnKS5hdHRyKCdmaWxsJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRDYW52YXNEcmF3KCkge1xuXG4gICAgcGFwZXIuc2V0dXAoJGNhbnZhc1swXSk7XG5cbiAgICBsZXQgbWlkZGxlLCBib3VuZHM7XG4gICAgbGV0IHBhc3Q7XG4gICAgbGV0IHNpemVzO1xuICAgIC8vIGxldCBwYXRocyA9IGdldEZyZXNoUGF0aHMod2luZG93Lmthbi5udW1QYXRocyk7XG4gICAgbGV0IHRvdWNoID0gZmFsc2U7XG4gICAgbGV0IGxhc3RDaGlsZDtcblxuICAgIGZ1bmN0aW9uIHBhblN0YXJ0KGV2ZW50KSB7XG4gICAgICBwYXBlci5wcm9qZWN0LmFjdGl2ZUxheWVyLnJlbW92ZUNoaWxkcmVuKCk7IC8vIFJFTU9WRVxuICAgICAgZHJhd0NpcmNsZSgpO1xuXG4gICAgICBzaXplcyA9IFtdO1xuXG4gICAgICBpZiAocGluY2hpbmcpIHJldHVybjtcbiAgICAgIGlmICghKGV2ZW50LmNoYW5nZWRQb2ludGVycyAmJiBldmVudC5jaGFuZ2VkUG9pbnRlcnMubGVuZ3RoID4gMCkpIHJldHVybjtcbiAgICAgIGlmIChldmVudC5jaGFuZ2VkUG9pbnRlcnMubGVuZ3RoID4gMSkge1xuICAgICAgICBjb25zb2xlLmxvZygnZXZlbnQuY2hhbmdlZFBvaW50ZXJzID4gMScpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBwb2ludGVyID0gZXZlbnQuY2VudGVyO1xuICAgICAgY29uc3QgcG9pbnQgPSBuZXcgUG9pbnQocG9pbnRlci54LCBwb2ludGVyLnkpO1xuXG4gICAgICBib3VuZHMgPSBuZXcgUGF0aCh7XG4gICAgICAgIHN0cm9rZUNvbG9yOiB3aW5kb3cua2FuLmN1cnJlbnRDb2xvcixcbiAgICAgICAgZmlsbENvbG9yOiB3aW5kb3cua2FuLmN1cnJlbnRDb2xvcixcbiAgICAgICAgbmFtZTogJ2JvdW5kcycsXG4gICAgICB9KTtcblxuICAgICAgbWlkZGxlID0gbmV3IFBhdGgoe1xuICAgICAgICBzdHJva2VDb2xvcjogd2luZG93Lmthbi5jdXJyZW50Q29sb3IsXG4gICAgICAgIG5hbWU6ICdtaWRkbGUnLFxuICAgICAgICBzdHJva2VXaWR0aDogMSxcbiAgICAgICAgdmlzaWJsZTogZmFsc2VcbiAgICAgIH0pO1xuXG4gICAgICBib3VuZHMuYWRkKHBvaW50KTtcbiAgICAgIG1pZGRsZS5hZGQocG9pbnQpO1xuICAgIH1cblxuICAgIGNvbnN0IG1pbiA9IDA7XG4gICAgY29uc3QgbWF4ID0gMjA7XG4gICAgY29uc3QgYWxwaGEgPSAwLjM7XG4gICAgY29uc3QgbWVtb3J5ID0gMTA7XG4gICAgdmFyIGN1bURpc3RhbmNlID0gMDtcbiAgICBsZXQgY3VtU2l6ZSwgYXZnU2l6ZTtcbiAgICBmdW5jdGlvbiBwYW5Nb3ZlKGV2ZW50KSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgaWYgKHBpbmNoaW5nKSByZXR1cm47XG4gICAgICAvLyBjb25zb2xlLmxvZyhldmVudC5vdmVyYWxsVmVsb2NpdHkpO1xuICAgICAgLy8gbGV0IHRoaXNEaXN0ID0gcGFyc2VJbnQoZXZlbnQuZGlzdGFuY2UpO1xuICAgICAgLy8gY3VtRGlzdGFuY2UgKz0gdGhpc0Rpc3Q7XG4gICAgICAvL1xuICAgICAgLy8gaWYgKGN1bURpc3RhbmNlIDwgMTAwKSB7XG4gICAgICAvLyAgIGNvbnNvbGUubG9nKCdpZ25vcmluZycpO1xuICAgICAgLy8gICByZXR1cm47XG4gICAgICAvLyB9IGVsc2Uge1xuICAgICAgLy8gICBjdW1EaXN0YW5jZSA9IDA7XG4gICAgICAvLyAgIGNvbnNvbGUubG9nKCdub3QgaWdub3JpbmcnKTtcbiAgICAgIC8vIH1cblxuICAgICAgY29uc3QgcG9pbnRlciA9IGV2ZW50LmNlbnRlcjtcbiAgICAgIGNvbnN0IHBvaW50ID0gbmV3IFBvaW50KHBvaW50ZXIueCwgcG9pbnRlci55KTtcblxuICAgICAgd2hpbGUgKHNpemVzLmxlbmd0aCA+IG1lbW9yeSkge1xuICAgICAgICBzaXplcy5zaGlmdCgpO1xuICAgICAgfVxuXG4gICAgICBsZXQgYm90dG9tWCwgYm90dG9tWSwgYm90dG9tLFxuICAgICAgICB0b3BYLCB0b3BZLCB0b3AsXG4gICAgICAgIHAwLCBwMSxcbiAgICAgICAgc3RlcCwgYW5nbGUsIGRpc3QsIHNpemU7XG5cbiAgICAgIGlmIChzaXplcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIC8vIG5vdCB0aGUgZmlyc3QgcG9pbnQsIHNvIHdlIGhhdmUgb3RoZXJzIHRvIGNvbXBhcmUgdG9cbiAgICAgICAgcDAgPSBwYXN0O1xuICAgICAgICBkaXN0ID0gdXRpbC5kZWx0YShwb2ludCwgcDApO1xuICAgICAgICBzaXplID0gZGlzdCAqIGFscGhhO1xuICAgICAgICBpZiAoc2l6ZSA+PSBtYXgpIHNpemUgPSBtYXg7XG4gICAgICAgIC8vIHNpemUgPSBNYXRoLm1heChNYXRoLm1pbihzaXplLCBtYXgpLCBtaW4pOyAvLyBjbGFtcCBzaXplIHRvIFttaW4sIG1heF1cbiAgICAgICAgLy8gc2l6ZSA9IG1heCAtIHNpemU7XG5cbiAgICAgICAgY3VtU2l6ZSA9IDA7XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgc2l6ZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICBjdW1TaXplICs9IHNpemVzW2pdO1xuICAgICAgICB9XG4gICAgICAgIGF2Z1NpemUgPSBNYXRoLnJvdW5kKCgoY3VtU2l6ZSAvIHNpemVzLmxlbmd0aCkgKyBzaXplKSAvIDIpO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhhdmdTaXplKTtcblxuICAgICAgICBhbmdsZSA9IE1hdGguYXRhbjIocG9pbnQueSAtIHAwLnksIHBvaW50LnggLSBwMC54KTsgLy8gcmFkXG5cbiAgICAgICAgLy8gUG9pbnQoYm90dG9tWCwgYm90dG9tWSkgaXMgYm90dG9tLCBQb2ludCh0b3BYLCB0b3BZKSBpcyB0b3BcbiAgICAgICAgYm90dG9tWCA9IHBvaW50LnggKyBNYXRoLmNvcyhhbmdsZSArIE1hdGguUEkvMikgKiBhdmdTaXplO1xuICAgICAgICBib3R0b21ZID0gcG9pbnQueSArIE1hdGguc2luKGFuZ2xlICsgTWF0aC5QSS8yKSAqIGF2Z1NpemU7XG4gICAgICAgIGJvdHRvbSA9IG5ldyBQb2ludChib3R0b21YLCBib3R0b21ZKTtcblxuICAgICAgICB0b3BYID0gcG9pbnQueCArIE1hdGguY29zKGFuZ2xlIC0gTWF0aC5QSS8yKSAqIGF2Z1NpemU7XG4gICAgICAgIHRvcFkgPSBwb2ludC55ICsgTWF0aC5zaW4oYW5nbGUgLSBNYXRoLlBJLzIpICogYXZnU2l6ZTtcbiAgICAgICAgdG9wID0gbmV3IFBvaW50KHRvcFgsIHRvcFkpO1xuXG4gICAgICAgIGJvdW5kcy5hZGQodG9wKTtcbiAgICAgICAgYm91bmRzLmluc2VydCgwLCBib3R0b20pO1xuICAgICAgICAvLyBib3VuZHMuc21vb3RoKCk7XG5cbiAgICAgICAgbWlkZGxlLmFkZChwb2ludCk7XG4gICAgICAgIC8vIG1pZGRsZS5zbW9vdGgoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGRvbid0IGhhdmUgYW55dGhpbmcgdG8gY29tcGFyZSB0b1xuICAgICAgICBkaXN0ID0gMTtcbiAgICAgICAgYW5nbGUgPSAwO1xuXG4gICAgICAgIHNpemUgPSBkaXN0ICogYWxwaGE7XG4gICAgICAgIHNpemUgPSBNYXRoLm1heChNYXRoLm1pbihzaXplLCBtYXgpLCBtaW4pOyAvLyBjbGFtcCBzaXplIHRvIFttaW4sIG1heF1cbiAgICAgIH1cblxuICAgICAgcGFwZXIudmlldy5kcmF3KCk7XG5cbiAgICAgIHBhc3QgPSBwb2ludDtcbiAgICAgIHNpemVzLnB1c2goc2l6ZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGFuRW5kKGV2ZW50KSB7XG4gICAgICBpZiAocGluY2hpbmcpIHJldHVybjtcblxuICAgICAgY29uc3QgcG9pbnRlciA9IGV2ZW50LmNlbnRlcjtcbiAgICAgIGNvbnN0IHBvaW50ID0gbmV3IFBvaW50KHBvaW50ZXIueCwgcG9pbnRlci55KTtcblxuICAgICAgY29uc3QgZ3JvdXAgPSBuZXcgR3JvdXAoW2JvdW5kcywgbWlkZGxlXSk7XG4gICAgICBncm91cC5kYXRhLmNvbG9yID0gYm91bmRzLmZpbGxDb2xvcjtcbiAgICAgIGdyb3VwLmRhdGEudXBkYXRlID0gdHJ1ZTtcblxuICAgICAgYm91bmRzLmFkZChwb2ludCk7XG4gICAgICBib3VuZHMuZmxhdHRlbig0KTtcbiAgICAgIGJvdW5kcy5zbW9vdGgoKTtcbiAgICAgIGJvdW5kcy5zaW1wbGlmeSgpO1xuICAgICAgYm91bmRzLmNsb3NlZCA9IHRydWU7XG5cbiAgICAgIG1pZGRsZS5hZGQocG9pbnQpO1xuICAgICAgbWlkZGxlLmZsYXR0ZW4oNCk7XG4gICAgICBtaWRkbGUuc21vb3RoKCk7XG4gICAgICBtaWRkbGUuc2ltcGxpZnkoKTtcblxuICAgICAgLy8gdXRpbC50cnVlR3JvdXAoZ3JvdXApO1xuXG4gICAgICBsZXQgaW50ZXJzZWN0aW9ucyA9IG1pZGRsZS5nZXRDcm9zc2luZ3MoKTtcbiAgICAgIGlmIChpbnRlcnNlY3Rpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLy8gd2UgY3JlYXRlIGEgY29weSBvZiB0aGUgcGF0aCBiZWNhdXNlIHJlc29sdmVDcm9zc2luZ3MoKSBzcGxpdHMgc291cmNlIHBhdGhcbiAgICAgICAgbGV0IHBhdGhDb3B5ID0gbmV3IFBhdGgoKTtcbiAgICAgICAgcGF0aENvcHkuY29weUNvbnRlbnQobWlkZGxlKTtcbiAgICAgICAgcGF0aENvcHkudmlzaWJsZSA9IGZhbHNlO1xuXG4gICAgICAgIGxldCBkaXZpZGVkUGF0aCA9IHBhdGhDb3B5LnJlc29sdmVDcm9zc2luZ3MoKTtcbiAgICAgICAgZGl2aWRlZFBhdGgudmlzaWJsZSA9IGZhbHNlO1xuXG5cbiAgICAgICAgbGV0IGVuY2xvc2VkTG9vcHMgPSB1dGlsLmZpbmRJbnRlcmlvckN1cnZlcyhkaXZpZGVkUGF0aCk7XG5cbiAgICAgICAgaWYgKGVuY2xvc2VkTG9vcHMpIHtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVuY2xvc2VkTG9vcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGVuY2xvc2VkTG9vcHNbaV0udmlzaWJsZSA9IHRydWU7XG4gICAgICAgICAgICBlbmNsb3NlZExvb3BzW2ldLmNsb3NlZCA9IHRydWU7XG4gICAgICAgICAgICBlbmNsb3NlZExvb3BzW2ldLmZpbGxDb2xvciA9IG5ldyBDb2xvcigwLCAwKTsgLy8gdHJhbnNwYXJlbnRcbiAgICAgICAgICAgIGVuY2xvc2VkTG9vcHNbaV0uZGF0YS5pbnRlcmlvciA9IHRydWU7XG4gICAgICAgICAgICBlbmNsb3NlZExvb3BzW2ldLmRhdGEudHJhbnNwYXJlbnQgPSB0cnVlO1xuICAgICAgICAgICAgLy8gZW5jbG9zZWRMb29wc1tpXS5ibGVuZE1vZGUgPSAnbXVsdGlwbHknO1xuICAgICAgICAgICAgZ3JvdXAuYWRkQ2hpbGQoZW5jbG9zZWRMb29wc1tpXSk7XG4gICAgICAgICAgICBlbmNsb3NlZExvb3BzW2ldLnNlbmRUb0JhY2soKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcGF0aENvcHkucmVtb3ZlKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBjb25zb2xlLmxvZygnbm8gaW50ZXJzZWN0aW9ucycpO1xuICAgICAgfVxuICAgICAgLy8gY29uc29sZS5sb2coZ3JvdXAucm90YXRpb24pO1xuICAgICAgbGFzdENoaWxkID0gZ3JvdXA7XG4gICAgICAvLyBjb25zb2xlLmxvZyhncm91cCk7XG5cbiAgICAgIC8vIGxldCB1bml0ZWRHcm91cElkcyA9IFtwYXBlci5wcm9qZWN0LmFjdGl2ZUxheWVyLmlkLCBncm91cC5pZF07XG4gICAgICAvLyBncm91cC5jaGlsZHJlbi5tYXAoZnVuY3Rpb24oZWwpIHtcbiAgICAgIC8vICAgdW5pdGVkR3JvdXBJZHMucHVzaChlbC5pZCk7XG4gICAgICAvLyB9KTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCd1bml0ZWRHcm91cElkcycsIHVuaXRlZEdyb3VwSWRzKTtcblxuXG4gICAgICAvLyBsZXQgdW5pdGVkR3JvdXAgPSBncm91cC5jaGlsZHJlbi5yZWR1Y2UoZnVuY3Rpb24oYSwgYikge1xuICAgICAgLy8gICByZXR1cm4gYS51bml0ZShiKTtcbiAgICAgIC8vIH0sIG5ldyBQYXRoKHtcbiAgICAgIC8vICAgZmlsbENvbG9yOiAncGluaycsXG4gICAgICAvLyAgIHN0cm9rZVdpZHRoOiAxLFxuICAgICAgLy8gICBzdHJva2VDb2xvcjogJ3BpbmsnLFxuICAgICAgLy8gICBmaWxsUnVsZTogJ2V2ZW5vZGQnXG4gICAgICAvLyB9KSk7XG4gICAgICAvLyBjb25zb2xlLmxvZygndW5pdGVkR3JvdXAnLCB1bml0ZWRHcm91cCk7XG4gICAgICAvL1xuICAgICAgLy8gdW5pdGVkR3JvdXAuc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgIC8vIHVuaXRlZEdyb3VwLnZpc2libGUgPSBmYWxzZTtcbiAgICAgIC8vIC8vIGdyb3VwLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgIC8vXG4gICAgICAvLyBsZXQgbmVpZ2hib3JzID0gcHJvamVjdC5nZXRJdGVtcyh7XG4gICAgICAvLyAgIG92ZXJsYXBwaW5nOiB1bml0ZWRHcm91cC5zdHJva2VCb3VuZHMsXG4gICAgICAvLyAgIG1hdGNoOiBmdW5jdGlvbihlbCkge1xuICAgICAgLy8gICAgIHJldHVybiB1bml0ZWRHcm91cElkcy5pbmNsdWRlcyhlbC5pZCk7XG4gICAgICAvLyAgIH1cbiAgICAgIC8vIH0pO1xuICAgICAgLy8gaWYgKG5laWdoYm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICAvLyAgIGNvbnNvbGUubG9nKCduZWlnaGJvcnMnLCBuZWlnaGJvcnMpO1xuICAgICAgLy8gfSBlbHNlIHtcbiAgICAgIC8vICAgY29uc29sZS5sb2coJ25vIG5laWdoYm9ycycpO1xuICAgICAgLy8gfVxuICAgICAgLy8gbGV0IHJlY3QgPSBuZXcgUGF0aC5SZWN0YW5nbGUoZ3JvdXAuc3Ryb2tlQm91bmRzKTtcbiAgICAgIC8vIHJlY3Quc3Ryb2tlQ29sb3IgPSAncGluayc7XG4gICAgICAvLyByZWN0LnN0cm9rZVdpZHRoID0gMjtcblxuICAgICAgdXRpbC5jaGVja1BvcHMoKTtcblxuICAgICAgZ3JvdXAuZGF0YS5jb2xvciA9IGJvdW5kcy5maWxsQ29sb3I7XG4gICAgICBncm91cC5kYXRhLnNjYWxlID0gMTsgLy8gaW5pdCB2YXJpYWJsZSB0byB0cmFjayBzY2FsZSBjaGFuZ2VzXG4gICAgICBncm91cC5kYXRhLnJvdGF0aW9uID0gMDsgLy8gaW5pdCB2YXJpYWJsZSB0byB0cmFjayByb3RhdGlvbiBjaGFuZ2VzXG5cbiAgICAgIGxhc3RDaGlsZCA9IGdyb3VwO1xuXG4gICAgICBNT1ZFUy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ25ld0dyb3VwJyxcbiAgICAgICAgaWQ6IGdyb3VwLmlkXG4gICAgICB9KTtcblxuICAgICAgaWYgKHJ1bkFuaW1hdGlvbnMpIHtcbiAgICAgICAgZ3JvdXAuYW5pbWF0ZShcbiAgICAgICAgICBbe1xuICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICBzY2FsZTogMC45XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgICAgICAgZHVyYXRpb246IDEwMCxcbiAgICAgICAgICAgICAgZWFzaW5nOiBcImVhc2VPdXRcIixcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgc2NhbGU6IDEuMTFcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXR0aW5nczoge1xuICAgICAgICAgICAgICBkdXJhdGlvbjogMTAwLFxuICAgICAgICAgICAgICBlYXNpbmc6IFwiZWFzZUluXCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxldCBwaW5jaGluZztcbiAgICBsZXQgcGluY2hlZEdyb3VwLCBsYXN0U2NhbGUsIGxhc3RSb3RhdGlvbjtcbiAgICBsZXQgb3JpZ2luYWxQb3NpdGlvbiwgb3JpZ2luYWxSb3RhdGlvbiwgb3JpZ2luYWxTY2FsZTtcblxuICAgIGZ1bmN0aW9uIHBpbmNoU3RhcnQoZXZlbnQpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdwaW5jaFN0YXJ0JywgZXZlbnQuY2VudGVyKTtcbiAgICAgIGhhbW1lck1hbmFnZXIuZ2V0KCdwYW4nKS5zZXQoe2VuYWJsZTogZmFsc2V9KTtcbiAgICAgIGNvbnN0IHBvaW50ZXIgPSBldmVudC5jZW50ZXIsXG4gICAgICAgICAgcG9pbnQgPSBuZXcgUG9pbnQocG9pbnRlci54LCBwb2ludGVyLnkpLFxuICAgICAgICAgIGhpdFJlc3VsdCA9IHBhcGVyLnByb2plY3QuaGl0VGVzdChwb2ludCwgaGl0T3B0aW9ucyk7XG5cbiAgICAgIGlmIChoaXRSZXN1bHQpIHtcbiAgICAgICAgcGluY2hpbmcgPSB0cnVlO1xuICAgICAgICBwaW5jaGVkR3JvdXAgPSBoaXRSZXN1bHQuaXRlbS5wYXJlbnQ7XG4gICAgICAgIGxhc3RTY2FsZSA9IDE7XG4gICAgICAgIGxhc3RSb3RhdGlvbiA9IGV2ZW50LnJvdGF0aW9uO1xuXG4gICAgICAgIG9yaWdpbmFsUG9zaXRpb24gPSBwaW5jaGVkR3JvdXAucG9zaXRpb247XG4gICAgICAgIC8vIG9yaWdpbmFsUm90YXRpb24gPSBwaW5jaGVkR3JvdXAucm90YXRpb247XG4gICAgICAgIG9yaWdpbmFsUm90YXRpb24gPSBwaW5jaGVkR3JvdXAuZGF0YS5yb3RhdGlvbjtcbiAgICAgICAgb3JpZ2luYWxTY2FsZSA9IHBpbmNoZWRHcm91cC5kYXRhLnNjYWxlO1xuXG4gICAgICAgIGlmIChydW5BbmltYXRpb25zKSB7XG4gICAgICAgICAgcGluY2hlZEdyb3VwLmFuaW1hdGUoe1xuICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICBzY2FsZTogMS4yNVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldHRpbmdzOiB7XG4gICAgICAgICAgICAgIGR1cmF0aW9uOiAxMDAsXG4gICAgICAgICAgICAgIGVhc2luZzogXCJlYXNlT3V0XCIsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBpbmNoZWRHcm91cCA9IG51bGw7XG4gICAgICAgIGNvbnNvbGUubG9nKCdoaXQgbm8gaXRlbScpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBpbmNoTW92ZShldmVudCkge1xuICAgICAgY29uc29sZS5sb2coJ3BpbmNoTW92ZScpO1xuICAgICAgaWYgKCEhcGluY2hlZEdyb3VwKSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdwaW5jaG1vdmUnLCBldmVudCk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHBpbmNoZWRHcm91cCk7XG4gICAgICAgIGxldCBjdXJyZW50U2NhbGUgPSBldmVudC5zY2FsZTtcbiAgICAgICAgbGV0IHNjYWxlRGVsdGEgPSBjdXJyZW50U2NhbGUgLyBsYXN0U2NhbGU7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGxhc3RTY2FsZSwgY3VycmVudFNjYWxlLCBzY2FsZURlbHRhKTtcbiAgICAgICAgbGFzdFNjYWxlID0gY3VycmVudFNjYWxlO1xuXG4gICAgICAgIGxldCBjdXJyZW50Um90YXRpb24gPSBldmVudC5yb3RhdGlvbjtcbiAgICAgICAgbGV0IHJvdGF0aW9uRGVsdGEgPSBjdXJyZW50Um90YXRpb24gLSBsYXN0Um90YXRpb247XG4gICAgICAgIGNvbnNvbGUubG9nKGxhc3RSb3RhdGlvbiwgY3VycmVudFJvdGF0aW9uLCByb3RhdGlvbkRlbHRhKTtcbiAgICAgICAgbGFzdFJvdGF0aW9uID0gY3VycmVudFJvdGF0aW9uO1xuXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGBzY2FsaW5nIGJ5ICR7c2NhbGVEZWx0YX1gKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coYHJvdGF0aW5nIGJ5ICR7cm90YXRpb25EZWx0YX1gKTtcblxuICAgICAgICBwaW5jaGVkR3JvdXAucG9zaXRpb24gPSBldmVudC5jZW50ZXI7XG4gICAgICAgIHBpbmNoZWRHcm91cC5zY2FsZShzY2FsZURlbHRhKTtcbiAgICAgICAgcGluY2hlZEdyb3VwLnJvdGF0ZShyb3RhdGlvbkRlbHRhKTtcblxuICAgICAgICBwaW5jaGVkR3JvdXAuZGF0YS5zY2FsZSAqPSBzY2FsZURlbHRhO1xuICAgICAgICBwaW5jaGVkR3JvdXAuZGF0YS5yb3RhdGlvbiArPSByb3RhdGlvbkRlbHRhO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxldCBsYXN0RXZlbnQ7XG4gICAgZnVuY3Rpb24gcGluY2hFbmQoZXZlbnQpIHtcbiAgICAgIC8vIHdhaXQgMjUwIG1zIHRvIHByZXZlbnQgbWlzdGFrZW4gcGFuIHJlYWRpbmdzXG4gICAgICBsYXN0RXZlbnQgPSBldmVudDtcbiAgICAgIGlmICghIXBpbmNoZWRHcm91cCkge1xuICAgICAgICBwaW5jaGVkR3JvdXAuZGF0YS51cGRhdGUgPSB0cnVlO1xuICAgICAgICBsZXQgbW92ZSA9IHtcbiAgICAgICAgICBpZDogcGluY2hlZEdyb3VwLmlkLFxuICAgICAgICAgIHR5cGU6ICd0cmFuc2Zvcm0nXG4gICAgICAgIH07XG4gICAgICAgIGlmIChwaW5jaGVkR3JvdXAucG9zaXRpb24gIT0gb3JpZ2luYWxQb3NpdGlvbikge1xuICAgICAgICAgIG1vdmUucG9zaXRpb24gPSBvcmlnaW5hbFBvc2l0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBpbmNoZWRHcm91cC5kYXRhLnJvdGF0aW9uICE9IG9yaWdpbmFsUm90YXRpb24pIHtcbiAgICAgICAgICBtb3ZlLnJvdGF0aW9uID0gb3JpZ2luYWxSb3RhdGlvbiAtIHBpbmNoZWRHcm91cC5kYXRhLnJvdGF0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBpbmNoZWRHcm91cC5kYXRhLnNjYWxlICE9IG9yaWdpbmFsU2NhbGUpIHtcbiAgICAgICAgICBtb3ZlLnNjYWxlID0gb3JpZ2luYWxTY2FsZSAvIHBpbmNoZWRHcm91cC5kYXRhLnNjYWxlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc29sZS5sb2coJ2ZpbmFsIHNjYWxlJywgcGluY2hlZEdyb3VwLmRhdGEuc2NhbGUpO1xuICAgICAgICBjb25zb2xlLmxvZyhtb3ZlKTtcblxuICAgICAgICBNT1ZFUy5wdXNoKG1vdmUpO1xuXG4gICAgICAgIGlmIChldmVudC52ZWxvY2l0eSA+IDEpIHtcbiAgICAgICAgICAvLyBkaXNwb3NlIG9mIGdyb3VwIG9mZnNjcmVlblxuICAgICAgICAgIHRocm93UGluY2hlZEdyb3VwKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZiAocnVuQW5pbWF0aW9ucykge1xuICAgICAgICAvLyAgIHBpbmNoZWRHcm91cC5hbmltYXRlKHtcbiAgICAgICAgLy8gICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgLy8gICAgICAgc2NhbGU6IDAuOFxuICAgICAgICAvLyAgICAgfSxcbiAgICAgICAgLy8gICAgIHNldHRpbmdzOiB7XG4gICAgICAgIC8vICAgICAgIGR1cmF0aW9uOiAxMDAsXG4gICAgICAgIC8vICAgICAgIGVhc2luZzogXCJlYXNlT3V0XCIsXG4gICAgICAgIC8vICAgICB9XG4gICAgICAgIC8vICAgfSk7XG4gICAgICAgIC8vIH1cbiAgICAgIH1cbiAgICAgIHBpbmNoaW5nID0gZmFsc2U7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICBoYW1tZXJNYW5hZ2VyLmdldCgncGFuJykuc2V0KHtlbmFibGU6IHRydWV9KTtcbiAgICAgIH0sIDI1MCk7XG4gICAgfVxuXG4gICAgY29uc3QgaGl0T3B0aW9ucyA9IHtcbiAgICAgIHNlZ21lbnRzOiBmYWxzZSxcbiAgICAgIHN0cm9rZTogdHJ1ZSxcbiAgICAgIGZpbGw6IHRydWUsXG4gICAgICB0b2xlcmFuY2U6IDVcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gc2luZ2xlVGFwKGV2ZW50KSB7XG4gICAgICBjb25zdCBwb2ludGVyID0gZXZlbnQuY2VudGVyLFxuICAgICAgICAgIHBvaW50ID0gbmV3IFBvaW50KHBvaW50ZXIueCwgcG9pbnRlci55KSxcbiAgICAgICAgICBoaXRSZXN1bHQgPSBwYXBlci5wcm9qZWN0LmhpdFRlc3QocG9pbnQsIGhpdE9wdGlvbnMpO1xuXG4gICAgICBpZiAoaGl0UmVzdWx0KSB7XG4gICAgICAgIGxldCBpdGVtID0gaGl0UmVzdWx0Lml0ZW07XG4gICAgICAgIGl0ZW0uc2VsZWN0ZWQgPSAhaXRlbS5zZWxlY3RlZDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkb3VibGVUYXAoZXZlbnQpIHtcbiAgICAgIGNvbnN0IHBvaW50ZXIgPSBldmVudC5jZW50ZXIsXG4gICAgICAgICAgcG9pbnQgPSBuZXcgUG9pbnQocG9pbnRlci54LCBwb2ludGVyLnkpLFxuICAgICAgICAgIGhpdFJlc3VsdCA9IHBhcGVyLnByb2plY3QuaGl0VGVzdChwb2ludCwgaGl0T3B0aW9ucyk7XG5cbiAgICAgIGlmIChoaXRSZXN1bHQpIHtcbiAgICAgICAgbGV0IGl0ZW0gPSBoaXRSZXN1bHQuaXRlbTtcbiAgICAgICAgbGV0IHBhcmVudCA9IGl0ZW0ucGFyZW50O1xuXG4gICAgICAgIGlmIChpdGVtLmRhdGEuaW50ZXJpb3IpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnaW50ZXJpb3InKTtcbiAgICAgICAgICBpdGVtLmRhdGEudHJhbnNwYXJlbnQgPSAhaXRlbS5kYXRhLnRyYW5zcGFyZW50O1xuXG4gICAgICAgICAgaWYgKGl0ZW0uZGF0YS50cmFuc3BhcmVudCkge1xuICAgICAgICAgICAgaXRlbS5maWxsQ29sb3IgPSB0cmFuc3BhcmVudDtcbiAgICAgICAgICAgIGl0ZW0uc3Ryb2tlQ29sb3IgPSB0cmFuc3BhcmVudDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaXRlbS5maWxsQ29sb3IgPSBwYXJlbnQuZGF0YS5jb2xvcjtcbiAgICAgICAgICAgIGl0ZW0uc3Ryb2tlQ29sb3IgPSBwYXJlbnQuZGF0YS5jb2xvcjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBNT1ZFUy5wdXNoKHtcbiAgICAgICAgICAgIHR5cGU6ICdmaWxsQ2hhbmdlJyxcbiAgICAgICAgICAgIGlkOiBpdGVtLmlkLFxuICAgICAgICAgICAgZmlsbDogcGFyZW50LmRhdGEuY29sb3IsXG4gICAgICAgICAgICB0cmFuc3BhcmVudDogaXRlbS5kYXRhLnRyYW5zcGFyZW50XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ25vdCBpbnRlcmlvcicpXG4gICAgICAgIH1cblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGluY2hlZEdyb3VwID0gbnVsbDtcbiAgICAgICAgY29uc29sZS5sb2coJ2hpdCBubyBpdGVtJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgdmVsb2NpdHlNdWx0aXBsaWVyID0gMjU7XG4gICAgZnVuY3Rpb24gdGhyb3dQaW5jaGVkR3JvdXAoKSB7XG4gICAgICBjb25zb2xlLmxvZyhwaW5jaGVkR3JvdXAucG9zaXRpb24pO1xuICAgICAgaWYgKHBpbmNoZWRHcm91cC5wb3NpdGlvbi54IDw9IDAgLSBwaW5jaGVkR3JvdXAuYm91bmRzLndpZHRoIHx8XG4gICAgICAgICAgcGluY2hlZEdyb3VwLnBvc2l0aW9uLnggPj0gdmlld1dpZHRoICsgcGluY2hlZEdyb3VwLmJvdW5kcy53aWR0aCB8fFxuICAgICAgICAgIHBpbmNoZWRHcm91cC5wb3NpdGlvbi55IDw9IDAgLSBwaW5jaGVkR3JvdXAuYm91bmRzLmhlaWdodCB8fFxuICAgICAgICAgIHBpbmNoZWRHcm91cC5wb3NpdGlvbi55ID49IHZpZXdIZWlnaHQgKyBwaW5jaGVkR3JvdXAuYm91bmRzLmhlaWdodCkge1xuICAgICAgICAgICAgcGluY2hlZEdyb3VwLmRhdGEub2ZmU2NyZWVuID0gdHJ1ZTtcbiAgICAgICAgICAgIHBpbmNoZWRHcm91cC52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aHJvd1BpbmNoZWRHcm91cCk7XG4gICAgICBwaW5jaGVkR3JvdXAucG9zaXRpb24ueCArPSBsYXN0RXZlbnQudmVsb2NpdHlYICogdmVsb2NpdHlNdWx0aXBsaWVyO1xuICAgICAgcGluY2hlZEdyb3VwLnBvc2l0aW9uLnkgKz0gbGFzdEV2ZW50LnZlbG9jaXR5WSAqIHZlbG9jaXR5TXVsdGlwbGllcjtcbiAgICB9XG5cbiAgICB2YXIgaGFtbWVyTWFuYWdlciA9IG5ldyBIYW1tZXIuTWFuYWdlcigkY2FudmFzWzBdKTtcblxuICAgIGhhbW1lck1hbmFnZXIuYWRkKG5ldyBIYW1tZXIuVGFwKHsgZXZlbnQ6ICdkb3VibGV0YXAnLCB0YXBzOiAyIH0pKTtcbiAgICBoYW1tZXJNYW5hZ2VyLmFkZChuZXcgSGFtbWVyLlRhcCh7IGV2ZW50OiAnc2luZ2xldGFwJyB9KSk7XG4gICAgaGFtbWVyTWFuYWdlci5hZGQobmV3IEhhbW1lci5QYW4oeyBkaXJlY3Rpb246IEhhbW1lci5ESVJFQ1RJT05fQUxMIH0pKTtcbiAgICBoYW1tZXJNYW5hZ2VyLmFkZChuZXcgSGFtbWVyLlBpbmNoKCkpO1xuXG4gICAgaGFtbWVyTWFuYWdlci5nZXQoJ2RvdWJsZXRhcCcpLnJlY29nbml6ZVdpdGgoJ3NpbmdsZXRhcCcpO1xuICAgIGhhbW1lck1hbmFnZXIuZ2V0KCdzaW5nbGV0YXAnKS5yZXF1aXJlRmFpbHVyZSgnZG91YmxldGFwJyk7XG4gICAgaGFtbWVyTWFuYWdlci5nZXQoJ3BhbicpLnJlcXVpcmVGYWlsdXJlKCdwaW5jaCcpO1xuXG4gICAgaGFtbWVyTWFuYWdlci5vbignc2luZ2xldGFwJywgc2luZ2xlVGFwKTtcbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdkb3VibGV0YXAnLCBkb3VibGVUYXApO1xuXG4gICAgaGFtbWVyTWFuYWdlci5vbigncGFuc3RhcnQnLCBwYW5TdGFydCk7XG4gICAgaGFtbWVyTWFuYWdlci5vbigncGFubW92ZScsIHBhbk1vdmUpO1xuICAgIGhhbW1lck1hbmFnZXIub24oJ3BhbmVuZCcsIHBhbkVuZCk7XG5cbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdwaW5jaHN0YXJ0JywgcGluY2hTdGFydCk7XG4gICAgaGFtbWVyTWFuYWdlci5vbigncGluY2htb3ZlJywgcGluY2hNb3ZlKTtcbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdwaW5jaGVuZCcsIHBpbmNoRW5kKTtcbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdwaW5jaGNhbmNlbCcsIGZ1bmN0aW9uKCkgeyBoYW1tZXJNYW5hZ2VyLmdldCgncGFuJykuc2V0KHtlbmFibGU6IHRydWV9KTsgfSk7IC8vIG1ha2Ugc3VyZSBpdCdzIHJlZW5hYmxlZFxuICB9XG5cbiAgZnVuY3Rpb24gbmV3UHJlc3NlZCgpIHtcbiAgICBjb25zb2xlLmxvZygnbmV3IHByZXNzZWQnKTtcblxuICAgIHBhcGVyLnByb2plY3QuYWN0aXZlTGF5ZXIucmVtb3ZlQ2hpbGRyZW4oKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVuZG9QcmVzc2VkKCkge1xuICAgIGNvbnNvbGUubG9nKCd1bmRvIHByZXNzZWQnKTtcbiAgICBpZiAoIShNT1ZFUy5sZW5ndGggPiAwKSkge1xuICAgICAgY29uc29sZS5sb2coJ25vIG1vdmVzIHlldCcpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBsYXN0TW92ZSA9IE1PVkVTLnBvcCgpO1xuICAgIGxldCBpdGVtID0gcHJvamVjdC5nZXRJdGVtKHtcbiAgICAgIGlkOiBsYXN0TW92ZS5pZFxuICAgIH0pO1xuXG4gICAgaWYgKGl0ZW0pIHtcbiAgICAgIGl0ZW0udmlzaWJsZSA9IHRydWU7IC8vIG1ha2Ugc3VyZVxuICAgICAgc3dpdGNoKGxhc3RNb3ZlLnR5cGUpIHtcbiAgICAgICAgY2FzZSAnbmV3R3JvdXAnOlxuICAgICAgICAgIGNvbnNvbGUubG9nKCdyZW1vdmluZyBncm91cCcpO1xuICAgICAgICAgIGl0ZW0ucmVtb3ZlKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2ZpbGxDaGFuZ2UnOlxuICAgICAgICAgIGlmIChsYXN0TW92ZS50cmFuc3BhcmVudCkge1xuICAgICAgICAgICAgaXRlbS5maWxsQ29sb3IgPSBsYXN0TW92ZS5maWxsO1xuICAgICAgICAgICAgaXRlbS5zdHJva2VDb2xvciA9IGxhc3RNb3ZlLmZpbGw7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGl0ZW0uZmlsbENvbG9yID0gdHJhbnNwYXJlbnQ7XG4gICAgICAgICAgICBpdGVtLnN0cm9rZUNvbG9yID0gdHJhbnNwYXJlbnQ7XG4gICAgICAgICAgfVxuICAgICAgICBjYXNlICd0cmFuc2Zvcm0nOlxuICAgICAgICAgIGlmICghIWxhc3RNb3ZlLnBvc2l0aW9uKSB7XG4gICAgICAgICAgICBpdGVtLnBvc2l0aW9uID0gbGFzdE1vdmUucG9zaXRpb25cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCEhbGFzdE1vdmUucm90YXRpb24pIHtcbiAgICAgICAgICAgIGl0ZW0ucm90YXRpb24gPSBsYXN0TW92ZS5yb3RhdGlvbjtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCEhbGFzdE1vdmUuc2NhbGUpIHtcbiAgICAgICAgICAgIGl0ZW0uc2NhbGUobGFzdE1vdmUuc2NhbGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBjb25zb2xlLmxvZygndW5rbm93biBjYXNlJyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKCdjb3VsZCBub3QgZmluZCBtYXRjaGluZyBpdGVtJyk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcGxheVByZXNzZWQoKSB7XG4gICAgY29uc29sZS5sb2coJ3BsYXkgcHJlc3NlZCcpO1xuICB9XG5cbiAgZnVuY3Rpb24gdGlwc1ByZXNzZWQoKSB7XG4gICAgY29uc29sZS5sb2coJ3RpcHMgcHJlc3NlZCcpO1xuICB9XG5cbiAgZnVuY3Rpb24gc2hhcmVQcmVzc2VkKCkge1xuICAgIGNvbnNvbGUubG9nKCdzaGFyZSBwcmVzc2VkJyk7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0TmV3KCkge1xuICAgICQoJy5tYWluLWNvbnRyb2xzIC5uZXcnKS5vbignY2xpY2sgdGFwIHRvdWNoJywgbmV3UHJlc3NlZCk7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0VW5kbygpIHtcbiAgICAkKCcubWFpbi1jb250cm9scyAudW5kbycpLm9uKCdjbGljaycsIHVuZG9QcmVzc2VkKTtcbiAgfVxuICBmdW5jdGlvbiBpbml0UGxheSgpIHtcbiAgICAkKCcubWFpbi1jb250cm9scyAucGxheScpLm9uKCdjbGljaycsIHBsYXlQcmVzc2VkKTtcbiAgfVxuICBmdW5jdGlvbiBpbml0VGlwcygpIHtcbiAgICAkKCcuYXV4LWNvbnRyb2xzIC50aXBzJykub24oJ2NsaWNrJywgdGlwc1ByZXNzZWQpO1xuICB9XG4gIGZ1bmN0aW9uIGluaXRTaGFyZSgpIHtcbiAgICAkKCcuYXV4LWNvbnRyb2xzIC5zaGFyZScpLm9uKCdjbGljaycsIHNoYXJlUHJlc3NlZCk7XG4gIH1cblxuICBmdW5jdGlvbiBkcmF3Q2lyY2xlKCkge1xuICAgIGxldCBjaXJjbGUgPSBuZXcgUGF0aC5DaXJjbGUoe1xuICAgICAgY2VudGVyOiBbNDAwLCA0MDBdLFxuICAgICAgcmFkaXVzOiAxMDAsXG4gICAgICBzdHJva2VDb2xvcjogJ2dyZWVuJyxcbiAgICAgIGZpbGxDb2xvcjogJ2dyZWVuJ1xuICAgIH0pO1xuICAgIGxldCBncm91cCA9IG5ldyBHcm91cChjaXJjbGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gbWFpbigpIHtcbiAgICBpbml0Q29udHJvbFBhbmVsKCk7XG4gICAgZHJhd0NpcmNsZSgpO1xuICAgIGluaXRWaWV3VmFycygpO1xuICB9XG5cbiAgbWFpbigpO1xufSk7XG4iLCIvLyBDb252ZXJ0cyBmcm9tIGRlZ3JlZXMgdG8gcmFkaWFucy5cbmV4cG9ydCBmdW5jdGlvbiByYWQoZGVncmVlcykge1xuICByZXR1cm4gZGVncmVlcyAqIE1hdGguUEkgLyAxODA7XG59O1xuXG4vLyBDb252ZXJ0cyBmcm9tIHJhZGlhbnMgdG8gZGVncmVlcy5cbmV4cG9ydCBmdW5jdGlvbiBkZWcocmFkaWFucykge1xuICByZXR1cm4gcmFkaWFucyAqIDE4MCAvIE1hdGguUEk7XG59O1xuXG4vLyBkaXN0YW5jZSBiZXR3ZWVuIHR3byBwb2ludHNcbmV4cG9ydCBmdW5jdGlvbiBkZWx0YShwMSwgcDIpIHtcbiAgcmV0dXJuIE1hdGguc3FydChNYXRoLnBvdyhwMS54IC0gcDIueCwgMikgKyBNYXRoLnBvdyhwMS55IC0gcDIueSwgMikpOyAvLyBweXRoYWdvcmVhbiFcbn1cblxuLy8gcmV0dXJucyBhbiBhcnJheSBvZiB0aGUgaW50ZXJpb3IgY3VydmVzIG9mIGEgZ2l2ZW4gY29tcG91bmQgcGF0aFxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRJbnRlcmlvckN1cnZlcyhwYXRoKSB7XG4gIGxldCBpbnRlcmlvckN1cnZlcyA9IFtdO1xuICBpZiAoIXBhdGggfHwgIXBhdGguY2hpbGRyZW4gfHwgIXBhdGguY2hpbGRyZW4ubGVuZ3RoKSByZXR1cm47XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXRoLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IGNoaWxkID0gcGF0aC5jaGlsZHJlbltpXTtcblxuICAgIGlmIChjaGlsZC5jbG9zZWQpe1xuICAgICAgaW50ZXJpb3JDdXJ2ZXMucHVzaChuZXcgUGF0aChjaGlsZC5zZWdtZW50cykpO1xuICAgIH1cbiAgfVxuXG4gIHBhdGgucmVtb3ZlKCk7XG4gIHJldHVybiBpbnRlcmlvckN1cnZlcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRydWVHcm91cChncm91cCkge1xuICBsZXQgYm91bmRzID0gZ3JvdXAuX25hbWVkQ2hpbGRyZW4uYm91bmRzWzBdLFxuICAgICAgbWlkZGxlID0gZ3JvdXAuX25hbWVkQ2hpbGRyZW4ubWlkZGxlWzBdO1xuXG4gIGxldCBtaWRkbGVDb3B5ID0gbmV3IFBhdGgoKTtcbiAgbWlkZGxlQ29weS5jb3B5Q29udGVudChtaWRkbGUpO1xuICBtaWRkbGVDb3B5LnZpc2libGUgPSBmYWxzZTtcbiAgbGV0IGRpdmlkZWRQYXRoID0gbWlkZGxlQ29weS5yZXNvbHZlQ3Jvc3NpbmdzKCk7XG4gIGRpdmlkZWRQYXRoLnZpc2libGUgPSBmYWxzZTtcbiAgQmFzZS5lYWNoKGRpdmlkZWRQYXRoLmNoaWxkcmVuLCBmdW5jdGlvbihjaGlsZCwgaSkge1xuICAgIGlmIChjaGlsZC5jbG9zZWQpIHtcbiAgICAgIGNoaWxkLnNlbGVjdGVkID0gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNoaWxkLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICB9XG4gICAgLy8gY29uc29sZS5sb2coY2hpbGQsIGkpO1xuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJ1ZVBhdGgocGF0aCkge1xuICAvLyBjb25zb2xlLmxvZyhncm91cCk7XG4gIC8vIGlmIChwYXRoICYmIHBhdGguY2hpbGRyZW4gJiYgcGF0aC5jaGlsZHJlbi5sZW5ndGggPiAwICYmIHBhdGguX25hbWVkQ2hpbGRyZW5bJ21pZGRsZSddKSB7XG4gIC8vICAgbGV0IHBhdGhDb3B5ID0gbmV3IFBhdGgoKTtcbiAgLy8gICBjb25zb2xlLmxvZyhwYXRoLl9uYW1lZENoaWxkcmVuWydtaWRkbGUnXSk7XG4gIC8vICAgcGF0aENvcHkuY29weUNvbnRlbnQocGF0aC5fbmFtZWRDaGlsZHJlblsnbWlkZGxlJ10pO1xuICAvLyAgIGNvbnNvbGUubG9nKHBhdGhDb3B5KTtcbiAgLy8gfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tQb3BzKCkge1xuICBsZXQgZ3JvdXBzID0gcGFwZXIucHJvamVjdC5nZXRJdGVtcyh7XG4gICAgY2xhc3NOYW1lOiAnR3JvdXAnLFxuICAgIG1hdGNoOiBmdW5jdGlvbihlbCkge1xuICAgICAgcmV0dXJuICghIWVsLmRhdGEgJiYgZWwuZGF0YS51cGRhdGUpO1xuICAgIH1cbiAgfSk7XG4gIEJhc2UuZWFjaChncm91cHMsIGZ1bmN0aW9uKGdyb3VwLCBpKSB7XG4gICAgY29uc29sZS5sb2coZ3JvdXApO1xuICB9KTtcbn1cbiJdfQ==
