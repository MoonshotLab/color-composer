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
      elasticity = 1;
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
        originalRotation = void 0;
    function pinchStart(event) {
      console.log('pinchstart', event);
      hammerManager.get('pan').set({ enable: false });
      var pointer = event.center,
          point = new Point(pointer.x, pointer.y),
          hitResult = paper.project.hitTest(point, hitOptions);

      if (hitResult) {
        pinching = true;
        pinchedGroup = hitResult.item.parent;
        lastScale = 1;
        lastRotation = pinchedGroup.rotation;

        originalPosition = pinchedGroup.position;
        originalRotation = pinchedGroup.rotation;

        console.log('pinchStart lastScale:', lastScale);
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
        console.log('hit no item');
      }
    }

    function pinchMove(event) {
      if (pinchedGroup) {
        // console.log('pinchmove', event);
        // console.log(pinchedGroup);
        var currentScale = event.scale;
        var scaleDelta = currentScale / lastScale;
        // console.log(lastScale, currentScale, scaleDelta);
        lastScale = currentScale;

        var currentRotation = event.rotation;
        var rotationDelta = currentRotation - lastRotation;
        // console.log(lastRotation, currentRotation, rotationDelta);
        lastRotation = currentRotation;

        // console.log(`scaling by ${scaleDelta}`);
        // console.log(`rotating by ${rotationDelta}`);

        pinchedGroup.position = event.center;
        pinchedGroup.scale(scaleDelta);
        pinchedGroup.rotate(rotationDelta);
      }
    }

    function pinchEnd(event) {
      console.log('pinchend', event);
      // wait 250 ms to prevent mistaken pan readings
      if (pinchedGroup) {
        pinchedGroup.data.update = true;

        var move = {
          id: pinchedGroup.id,
          type: 'transform'
        };
        if (pinchedGroup.position != originalPosition) {
          move.position = originalPosition;
        }
        if (pinchedGroup.rotation != originalRotation) {
          move.rotation = originalRotation;
        }
        // if (pinchedGroup.scale != originalScale) {
        //   move.scale = originalScale;
        // }
        console.log('pushing move:', move);
        MOVES.push(move);
        if (runAnimations) {
          pinchedGroup.animate({
            properties: {
              scale: 0.8
            },
            settings: {
              duration: 100,
              easing: "easeOut"
            }
          });
        }
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
        console.log('hit no item');
      }
    }

    // var animationId;
    var elasticity = 0;

    function bounce(event) {

      // console.log(paper.project.activeLayer.firstChild);
      // paper.project.activeLayer.firstChild.rotate(3);
      if (!!lastChild) {
        if (elasticity > 0) {
          // console.log(lastChild);
          for (var i = 0; i < lastChild.segments.length; i++) {
            var segment = lastChild.segments[i];
            var timeConst = 16;
            var divConst = 2;
            var cos = Math.cos(event.time * timeConst + i);
            var sin = Math.sin(event.time * timeConst + i);
            segment.point.x += cos / divConst * elasticity;
            segment.point.y += sin / divConst * elasticity;
            // console.log(cos, sin, elasticity);
            elasticity -= 0.001;
          }
        }
      } else {
        // console.log('no children yet');
      }
    }

    // paper.view.onFrame = jiggle;

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
          // if (!!lastMove.scale) {
          //   item.scale //???
          // }
          break;
        default:
          console.log('unknown case');
      }
    } else {
      console.log('could not find matching item');
    }

    // d3.selectAll('svg.main path:last-child').remove();
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
    console.log(child, i);
  });
}

function truePath(path) {
  console.log(group);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxPQUFPLEdBQVAsR0FBYSxPQUFPLEdBQVAsSUFBYztBQUN6QixXQUFTLENBQUMsU0FBRCxFQUFZLFNBQVosRUFBdUIsU0FBdkIsRUFBa0MsU0FBbEMsRUFBNkMsU0FBN0MsRUFBd0QsU0FBeEQsRUFBbUUsU0FBbkUsRUFBOEUsU0FBOUUsRUFBeUYsU0FBekYsRUFBb0csU0FBcEcsRUFBK0csU0FBL0csRUFBMEgsU0FBMUgsRUFBcUksU0FBckksRUFBZ0osU0FBaEosRUFBMkosU0FBM0osRUFBc0ssU0FBdEssQ0FEZ0I7QUFFekIsZ0JBQWMsU0FGVztBQUd6QixZQUFVLEVBSGU7QUFJekIsU0FBTztBQUprQixDQUEzQjs7QUFPQSxNQUFNLE9BQU4sQ0FBYyxNQUFkOztBQUVBLElBQU0sT0FBTyxRQUFRLFFBQVIsQ0FBYjtBQUNBOztBQUVBLEVBQUUsUUFBRixFQUFZLEtBQVosQ0FBa0IsWUFBVztBQUMzQixNQUFJLFFBQVEsRUFBWixDQUQyQixDQUNYO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxNQUFNLFVBQVUsRUFBRSxNQUFGLENBQWhCO0FBQ0EsTUFBTSxRQUFRLEVBQUUsTUFBRixDQUFkO0FBQ0EsTUFBTSxVQUFVLEVBQUUsbUJBQUYsQ0FBaEI7QUFDQSxNQUFNLGdCQUFnQixLQUF0QjtBQUNBLE1BQU0sY0FBYyxJQUFJLEtBQUosQ0FBVSxDQUFWLEVBQWEsQ0FBYixDQUFwQjs7QUFFQSxXQUFTLGdCQUFULEdBQTRCO0FBQzFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Q7O0FBRUQsV0FBUyxnQkFBVCxHQUE0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QUwsQ0FBVSxZQUFZLFFBQXRCLEVBQWdDLFVBQVMsS0FBVCxFQUFnQixDQUFoQixFQUFtQjtBQUNqRCxRQUFJLE1BQU0sTUFBVixFQUFrQjtBQUNoQixZQUFNLFFBQU4sR0FBaUIsS0FBakI7QUFDRCxLQUZELE1BRU87QUFDTCxZQUFNLFFBQU4sR0FBaUIsSUFBakI7QUFDRDtBQUNELFlBQVEsR0FBUixDQUFZLEtBQVosRUFBbUIsQ0FBbkI7QUFDRCxHQVBEO0FBUUQ7O0FBRU0sU0FBUyxRQUFULENBQWtCLElBQWxCLEVBQXdCO0FBQzdCLFVBQVEsR0FBUixDQUFZLEtBQVo7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDRDs7QUFFTSxTQUFTLFNBQVQsR0FBcUI7QUFDMUIsTUFBSSxTQUFTLE1BQU0sT0FBTixDQUFjLFFBQWQsQ0FBdUI7QUFDbEMsZUFBVyxPQUR1QjtBQUVsQyxXQUFPLGVBQVMsRUFBVCxFQUFhO0FBQ2xCLGFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBTCxJQUFhLEdBQUcsSUFBSCxDQUFRLE1BQTdCO0FBQ0Q7QUFKaUMsR0FBdkIsQ0FBYjtBQU1BLE9BQUssSUFBTCxDQUFVLE1BQVYsRUFBa0IsVUFBUyxLQUFULEVBQWdCLENBQWhCLEVBQW1CO0FBQ25DLFlBQVEsR0FBUixDQUFZLEtBQVo7QUFDRCxHQUZEO0FBR0QiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwid2luZG93LmthbiA9IHdpbmRvdy5rYW4gfHwge1xuICBwYWxldHRlOiBbXCIjMjAxNzFDXCIsIFwiIzFFMkE0M1wiLCBcIiMyODM3N0RcIiwgXCIjMzUyNzQ3XCIsIFwiI0YyODVBNVwiLCBcIiNDQTJFMjZcIiwgXCIjQjg0NTI2XCIsIFwiI0RBNkMyNlwiLCBcIiM0NTMxMjFcIiwgXCIjOTE2QTQ3XCIsIFwiI0VFQjY0MVwiLCBcIiNGNkVCMTZcIiwgXCIjN0Y3RDMxXCIsIFwiIzZFQUQ3OVwiLCBcIiMyQTQ2MjFcIiwgXCIjRjRFQUUwXCJdLFxuICBjdXJyZW50Q29sb3I6ICcjMjAxNzFDJyxcbiAgbnVtUGF0aHM6IDEwLFxuICBwYXRoczogW10sXG59O1xuXG5wYXBlci5pbnN0YWxsKHdpbmRvdyk7XG5cbmNvbnN0IHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcbi8vIHJlcXVpcmUoJ3BhcGVyLWFuaW1hdGUnKTtcblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gIGxldCBNT1ZFUyA9IFtdOyAvLyBzdG9yZSBnbG9iYWwgbW92ZXMgbGlzdFxuICAvLyBtb3ZlcyA9IFtcbiAgLy8gICB7XG4gIC8vICAgICAndHlwZSc6ICdjb2xvckNoYW5nZScsXG4gIC8vICAgICAnb2xkJzogJyMyMDE3MUMnLFxuICAvLyAgICAgJ25ldyc6ICcjRjI4NUE1J1xuICAvLyAgIH0sXG4gIC8vICAge1xuICAvLyAgICAgJ3R5cGUnOiAnbmV3UGF0aCcsXG4gIC8vICAgICAncmVmJzogJz8/PycgLy8gdXVpZD8gZG9tIHJlZmVyZW5jZT9cbiAgLy8gICB9LFxuICAvLyAgIHtcbiAgLy8gICAgICd0eXBlJzogJ3BhdGhUcmFuc2Zvcm0nLFxuICAvLyAgICAgJ3JlZic6ICc/Pz8nLCAvLyB1dWlkPyBkb20gcmVmZXJlbmNlP1xuICAvLyAgICAgJ29sZCc6ICdyb3RhdGUoOTBkZWcpc2NhbGUoMS41KScsIC8vID8/P1xuICAvLyAgICAgJ25ldyc6ICdyb3RhdGUoMTIwZGVnKXNjYWxlKC0wLjUpJyAvLyA/Pz9cbiAgLy8gICB9LFxuICAvLyAgIC8vIG90aGVycz9cbiAgLy8gXVxuXG4gIGNvbnN0ICR3aW5kb3cgPSAkKHdpbmRvdyk7XG4gIGNvbnN0ICRib2R5ID0gJCgnYm9keScpO1xuICBjb25zdCAkY2FudmFzID0gJCgnY2FudmFzI21haW5DYW52YXMnKTtcbiAgY29uc3QgcnVuQW5pbWF0aW9ucyA9IGZhbHNlO1xuICBjb25zdCB0cmFuc3BhcmVudCA9IG5ldyBDb2xvcigwLCAwKTtcblxuICBmdW5jdGlvbiBpbml0Q29udHJvbFBhbmVsKCkge1xuICAgIGluaXRDb2xvclBhbGV0dGUoKTtcbiAgICBpbml0Q2FudmFzRHJhdygpO1xuICAgIGluaXROZXcoKTtcbiAgICBpbml0VW5kbygpO1xuICAgIGluaXRQbGF5KCk7XG4gICAgaW5pdFRpcHMoKTtcbiAgICBpbml0U2hhcmUoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRDb2xvclBhbGV0dGUoKSB7XG4gICAgY29uc3QgJHBhbGV0dGVXcmFwID0gJCgndWwucGFsZXR0ZS1jb2xvcnMnKTtcbiAgICBjb25zdCAkcGFsZXR0ZUNvbG9ycyA9ICRwYWxldHRlV3JhcC5maW5kKCdsaScpO1xuICAgIGNvbnN0IHBhbGV0dGVDb2xvclNpemUgPSAyMDtcbiAgICBjb25zdCBwYWxldHRlU2VsZWN0ZWRDb2xvclNpemUgPSAzMDtcbiAgICBjb25zdCBwYWxldHRlU2VsZWN0ZWRDbGFzcyA9ICdwYWxldHRlLXNlbGVjdGVkJztcblxuICAgIC8vIGhvb2sgdXAgY2xpY2tcbiAgICAgICRwYWxldHRlQ29sb3JzLm9uKCdjbGljayB0YXAgdG91Y2gnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBsZXQgJHN2ZyA9ICQodGhpcykuZmluZCgnc3ZnLnBhbGV0dGUtY29sb3InKTtcblxuICAgICAgICAgIGlmICghJHN2Zy5oYXNDbGFzcyhwYWxldHRlU2VsZWN0ZWRDbGFzcykpIHtcbiAgICAgICAgICAgICQoJy4nICsgcGFsZXR0ZVNlbGVjdGVkQ2xhc3MpXG4gICAgICAgICAgICAgIC5yZW1vdmVDbGFzcyhwYWxldHRlU2VsZWN0ZWRDbGFzcylcbiAgICAgICAgICAgICAgLmF0dHIoJ3dpZHRoJywgcGFsZXR0ZUNvbG9yU2l6ZSlcbiAgICAgICAgICAgICAgLmF0dHIoJ2hlaWdodCcsIHBhbGV0dGVDb2xvclNpemUpXG4gICAgICAgICAgICAgIC5maW5kKCdyZWN0JylcbiAgICAgICAgICAgICAgLmF0dHIoJ3J4JywgMClcbiAgICAgICAgICAgICAgLmF0dHIoJ3J5JywgMCk7XG5cbiAgICAgICAgICAgICRzdmcuYWRkQ2xhc3MocGFsZXR0ZVNlbGVjdGVkQ2xhc3MpXG4gICAgICAgICAgICAgIC5hdHRyKCd3aWR0aCcsIHBhbGV0dGVTZWxlY3RlZENvbG9yU2l6ZSlcbiAgICAgICAgICAgICAgLmF0dHIoJ2hlaWdodCcsIHBhbGV0dGVTZWxlY3RlZENvbG9yU2l6ZSlcbiAgICAgICAgICAgICAgLmZpbmQoJ3JlY3QnKVxuICAgICAgICAgICAgICAuYXR0cigncngnLCBwYWxldHRlU2VsZWN0ZWRDb2xvclNpemUgLyAyKVxuICAgICAgICAgICAgICAuYXR0cigncnknLCBwYWxldHRlU2VsZWN0ZWRDb2xvclNpemUgLyAyKVxuXG4gICAgICAgICAgICB3aW5kb3cua2FuLmN1cnJlbnRDb2xvciA9ICRzdmcuZmluZCgncmVjdCcpLmF0dHIoJ2ZpbGwnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdENhbnZhc0RyYXcoKSB7XG5cbiAgICBwYXBlci5zZXR1cCgkY2FudmFzWzBdKTtcblxuICAgIGxldCBtaWRkbGUsIGJvdW5kcztcbiAgICBsZXQgcGFzdDtcbiAgICBsZXQgc2l6ZXM7XG4gICAgLy8gbGV0IHBhdGhzID0gZ2V0RnJlc2hQYXRocyh3aW5kb3cua2FuLm51bVBhdGhzKTtcbiAgICBsZXQgdG91Y2ggPSBmYWxzZTtcbiAgICBsZXQgbGFzdENoaWxkO1xuXG4gICAgZnVuY3Rpb24gcGFuU3RhcnQoZXZlbnQpIHtcbiAgICAgIHBhcGVyLnByb2plY3QuYWN0aXZlTGF5ZXIucmVtb3ZlQ2hpbGRyZW4oKTsgLy8gUkVNT1ZFXG4gICAgICBkcmF3Q2lyY2xlKCk7XG5cbiAgICAgIHNpemVzID0gW107XG5cbiAgICAgIGlmIChwaW5jaGluZykgcmV0dXJuO1xuICAgICAgaWYgKCEoZXZlbnQuY2hhbmdlZFBvaW50ZXJzICYmIGV2ZW50LmNoYW5nZWRQb2ludGVycy5sZW5ndGggPiAwKSkgcmV0dXJuO1xuICAgICAgaWYgKGV2ZW50LmNoYW5nZWRQb2ludGVycy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdldmVudC5jaGFuZ2VkUG9pbnRlcnMgPiAxJyk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHBvaW50ZXIgPSBldmVudC5jZW50ZXI7XG4gICAgICBjb25zdCBwb2ludCA9IG5ldyBQb2ludChwb2ludGVyLngsIHBvaW50ZXIueSk7XG5cbiAgICAgIGJvdW5kcyA9IG5ldyBQYXRoKHtcbiAgICAgICAgc3Ryb2tlQ29sb3I6IHdpbmRvdy5rYW4uY3VycmVudENvbG9yLFxuICAgICAgICBmaWxsQ29sb3I6IHdpbmRvdy5rYW4uY3VycmVudENvbG9yLFxuICAgICAgICBuYW1lOiAnYm91bmRzJyxcbiAgICAgIH0pO1xuXG4gICAgICBtaWRkbGUgPSBuZXcgUGF0aCh7XG4gICAgICAgIHN0cm9rZUNvbG9yOiB3aW5kb3cua2FuLmN1cnJlbnRDb2xvcixcbiAgICAgICAgbmFtZTogJ21pZGRsZScsXG4gICAgICAgIHN0cm9rZVdpZHRoOiAxLFxuICAgICAgICB2aXNpYmxlOiBmYWxzZVxuICAgICAgfSk7XG5cbiAgICAgIGJvdW5kcy5hZGQocG9pbnQpO1xuICAgICAgbWlkZGxlLmFkZChwb2ludCk7XG4gICAgfVxuXG4gICAgY29uc3QgbWluID0gMDtcbiAgICBjb25zdCBtYXggPSAyMDtcbiAgICBjb25zdCBhbHBoYSA9IDAuMztcbiAgICBjb25zdCBtZW1vcnkgPSAxMDtcbiAgICB2YXIgY3VtRGlzdGFuY2UgPSAwO1xuICAgIGxldCBjdW1TaXplLCBhdmdTaXplO1xuICAgIGZ1bmN0aW9uIHBhbk1vdmUoZXZlbnQpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBpZiAocGluY2hpbmcpIHJldHVybjtcbiAgICAgIC8vIGNvbnNvbGUubG9nKGV2ZW50Lm92ZXJhbGxWZWxvY2l0eSk7XG4gICAgICAvLyBsZXQgdGhpc0Rpc3QgPSBwYXJzZUludChldmVudC5kaXN0YW5jZSk7XG4gICAgICAvLyBjdW1EaXN0YW5jZSArPSB0aGlzRGlzdDtcbiAgICAgIC8vXG4gICAgICAvLyBpZiAoY3VtRGlzdGFuY2UgPCAxMDApIHtcbiAgICAgIC8vICAgY29uc29sZS5sb2coJ2lnbm9yaW5nJyk7XG4gICAgICAvLyAgIHJldHVybjtcbiAgICAgIC8vIH0gZWxzZSB7XG4gICAgICAvLyAgIGN1bURpc3RhbmNlID0gMDtcbiAgICAgIC8vICAgY29uc29sZS5sb2coJ25vdCBpZ25vcmluZycpO1xuICAgICAgLy8gfVxuXG4gICAgICBjb25zdCBwb2ludGVyID0gZXZlbnQuY2VudGVyO1xuICAgICAgY29uc3QgcG9pbnQgPSBuZXcgUG9pbnQocG9pbnRlci54LCBwb2ludGVyLnkpO1xuXG4gICAgICB3aGlsZSAoc2l6ZXMubGVuZ3RoID4gbWVtb3J5KSB7XG4gICAgICAgIHNpemVzLnNoaWZ0KCk7XG4gICAgICB9XG5cbiAgICAgIGxldCBib3R0b21YLCBib3R0b21ZLCBib3R0b20sXG4gICAgICAgIHRvcFgsIHRvcFksIHRvcCxcbiAgICAgICAgcDAsIHAxLFxuICAgICAgICBzdGVwLCBhbmdsZSwgZGlzdCwgc2l6ZTtcblxuICAgICAgaWYgKHNpemVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLy8gbm90IHRoZSBmaXJzdCBwb2ludCwgc28gd2UgaGF2ZSBvdGhlcnMgdG8gY29tcGFyZSB0b1xuICAgICAgICBwMCA9IHBhc3Q7XG4gICAgICAgIGRpc3QgPSB1dGlsLmRlbHRhKHBvaW50LCBwMCk7XG4gICAgICAgIHNpemUgPSBkaXN0ICogYWxwaGE7XG4gICAgICAgIGlmIChzaXplID49IG1heCkgc2l6ZSA9IG1heDtcbiAgICAgICAgLy8gc2l6ZSA9IE1hdGgubWF4KE1hdGgubWluKHNpemUsIG1heCksIG1pbik7IC8vIGNsYW1wIHNpemUgdG8gW21pbiwgbWF4XVxuICAgICAgICAvLyBzaXplID0gbWF4IC0gc2l6ZTtcblxuICAgICAgICBjdW1TaXplID0gMDtcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBzaXplcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgIGN1bVNpemUgKz0gc2l6ZXNbal07XG4gICAgICAgIH1cbiAgICAgICAgYXZnU2l6ZSA9IE1hdGgucm91bmQoKChjdW1TaXplIC8gc2l6ZXMubGVuZ3RoKSArIHNpemUpIC8gMik7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGF2Z1NpemUpO1xuXG4gICAgICAgIGFuZ2xlID0gTWF0aC5hdGFuMihwb2ludC55IC0gcDAueSwgcG9pbnQueCAtIHAwLngpOyAvLyByYWRcblxuICAgICAgICAvLyBQb2ludChib3R0b21YLCBib3R0b21ZKSBpcyBib3R0b20sIFBvaW50KHRvcFgsIHRvcFkpIGlzIHRvcFxuICAgICAgICBib3R0b21YID0gcG9pbnQueCArIE1hdGguY29zKGFuZ2xlICsgTWF0aC5QSS8yKSAqIGF2Z1NpemU7XG4gICAgICAgIGJvdHRvbVkgPSBwb2ludC55ICsgTWF0aC5zaW4oYW5nbGUgKyBNYXRoLlBJLzIpICogYXZnU2l6ZTtcbiAgICAgICAgYm90dG9tID0gbmV3IFBvaW50KGJvdHRvbVgsIGJvdHRvbVkpO1xuXG4gICAgICAgIHRvcFggPSBwb2ludC54ICsgTWF0aC5jb3MoYW5nbGUgLSBNYXRoLlBJLzIpICogYXZnU2l6ZTtcbiAgICAgICAgdG9wWSA9IHBvaW50LnkgKyBNYXRoLnNpbihhbmdsZSAtIE1hdGguUEkvMikgKiBhdmdTaXplO1xuICAgICAgICB0b3AgPSBuZXcgUG9pbnQodG9wWCwgdG9wWSk7XG5cbiAgICAgICAgYm91bmRzLmFkZCh0b3ApO1xuICAgICAgICBib3VuZHMuaW5zZXJ0KDAsIGJvdHRvbSk7XG4gICAgICAgIC8vIGJvdW5kcy5zbW9vdGgoKTtcblxuICAgICAgICBtaWRkbGUuYWRkKHBvaW50KTtcbiAgICAgICAgLy8gbWlkZGxlLnNtb290aCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZG9uJ3QgaGF2ZSBhbnl0aGluZyB0byBjb21wYXJlIHRvXG4gICAgICAgIGRpc3QgPSAxO1xuICAgICAgICBhbmdsZSA9IDA7XG5cbiAgICAgICAgc2l6ZSA9IGRpc3QgKiBhbHBoYTtcbiAgICAgICAgc2l6ZSA9IE1hdGgubWF4KE1hdGgubWluKHNpemUsIG1heCksIG1pbik7IC8vIGNsYW1wIHNpemUgdG8gW21pbiwgbWF4XVxuICAgICAgfVxuXG4gICAgICBwYXBlci52aWV3LmRyYXcoKTtcblxuICAgICAgcGFzdCA9IHBvaW50O1xuICAgICAgc2l6ZXMucHVzaChzaXplKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYW5FbmQoZXZlbnQpIHtcbiAgICAgIGVsYXN0aWNpdHkgPSAxO1xuICAgICAgaWYgKHBpbmNoaW5nKSByZXR1cm47XG5cbiAgICAgIGNvbnN0IHBvaW50ZXIgPSBldmVudC5jZW50ZXI7XG4gICAgICBjb25zdCBwb2ludCA9IG5ldyBQb2ludChwb2ludGVyLngsIHBvaW50ZXIueSk7XG5cbiAgICAgIGNvbnN0IGdyb3VwID0gbmV3IEdyb3VwKFtib3VuZHMsIG1pZGRsZV0pO1xuICAgICAgZ3JvdXAuZGF0YS5jb2xvciA9IGJvdW5kcy5maWxsQ29sb3I7XG4gICAgICBncm91cC5kYXRhLnVwZGF0ZSA9IHRydWU7XG5cbiAgICAgIGJvdW5kcy5hZGQocG9pbnQpO1xuICAgICAgYm91bmRzLmZsYXR0ZW4oNCk7XG4gICAgICBib3VuZHMuc21vb3RoKCk7XG4gICAgICBib3VuZHMuc2ltcGxpZnkoKTtcbiAgICAgIGJvdW5kcy5jbG9zZWQgPSB0cnVlO1xuXG4gICAgICBtaWRkbGUuYWRkKHBvaW50KTtcbiAgICAgIG1pZGRsZS5mbGF0dGVuKDQpO1xuICAgICAgbWlkZGxlLnNtb290aCgpO1xuICAgICAgbWlkZGxlLnNpbXBsaWZ5KCk7XG5cbiAgICAgIC8vIHV0aWwudHJ1ZUdyb3VwKGdyb3VwKTtcblxuICAgICAgbGV0IGludGVyc2VjdGlvbnMgPSBtaWRkbGUuZ2V0Q3Jvc3NpbmdzKCk7XG4gICAgICBpZiAoaW50ZXJzZWN0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgIC8vIHdlIGNyZWF0ZSBhIGNvcHkgb2YgdGhlIHBhdGggYmVjYXVzZSByZXNvbHZlQ3Jvc3NpbmdzKCkgc3BsaXRzIHNvdXJjZSBwYXRoXG4gICAgICAgIGxldCBwYXRoQ29weSA9IG5ldyBQYXRoKCk7XG4gICAgICAgIHBhdGhDb3B5LmNvcHlDb250ZW50KG1pZGRsZSk7XG4gICAgICAgIHBhdGhDb3B5LnZpc2libGUgPSBmYWxzZTtcblxuICAgICAgICBsZXQgZGl2aWRlZFBhdGggPSBwYXRoQ29weS5yZXNvbHZlQ3Jvc3NpbmdzKCk7XG4gICAgICAgIGRpdmlkZWRQYXRoLnZpc2libGUgPSBmYWxzZTtcblxuXG4gICAgICAgIGxldCBlbmNsb3NlZExvb3BzID0gdXRpbC5maW5kSW50ZXJpb3JDdXJ2ZXMoZGl2aWRlZFBhdGgpO1xuXG4gICAgICAgIGlmIChlbmNsb3NlZExvb3BzKSB7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbmNsb3NlZExvb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBlbmNsb3NlZExvb3BzW2ldLnZpc2libGUgPSB0cnVlO1xuICAgICAgICAgICAgZW5jbG9zZWRMb29wc1tpXS5jbG9zZWQgPSB0cnVlO1xuICAgICAgICAgICAgZW5jbG9zZWRMb29wc1tpXS5maWxsQ29sb3IgPSBuZXcgQ29sb3IoMCwgMCk7IC8vIHRyYW5zcGFyZW50XG4gICAgICAgICAgICBlbmNsb3NlZExvb3BzW2ldLmRhdGEuaW50ZXJpb3IgPSB0cnVlO1xuICAgICAgICAgICAgZW5jbG9zZWRMb29wc1tpXS5kYXRhLnRyYW5zcGFyZW50ID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vIGVuY2xvc2VkTG9vcHNbaV0uYmxlbmRNb2RlID0gJ211bHRpcGx5JztcbiAgICAgICAgICAgIGdyb3VwLmFkZENoaWxkKGVuY2xvc2VkTG9vcHNbaV0pO1xuICAgICAgICAgICAgZW5jbG9zZWRMb29wc1tpXS5zZW5kVG9CYWNrKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHBhdGhDb3B5LnJlbW92ZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ25vIGludGVyc2VjdGlvbnMnKTtcbiAgICAgIH1cbiAgICAgIC8vIGNvbnNvbGUubG9nKGdyb3VwLnJvdGF0aW9uKTtcbiAgICAgIGxhc3RDaGlsZCA9IGdyb3VwO1xuICAgICAgLy8gY29uc29sZS5sb2coZ3JvdXApO1xuXG4gICAgICAvLyBsZXQgdW5pdGVkR3JvdXBJZHMgPSBbcGFwZXIucHJvamVjdC5hY3RpdmVMYXllci5pZCwgZ3JvdXAuaWRdO1xuICAgICAgLy8gZ3JvdXAuY2hpbGRyZW4ubWFwKGZ1bmN0aW9uKGVsKSB7XG4gICAgICAvLyAgIHVuaXRlZEdyb3VwSWRzLnB1c2goZWwuaWQpO1xuICAgICAgLy8gfSk7XG4gICAgICAvLyBjb25zb2xlLmxvZygndW5pdGVkR3JvdXBJZHMnLCB1bml0ZWRHcm91cElkcyk7XG5cblxuICAgICAgLy8gbGV0IHVuaXRlZEdyb3VwID0gZ3JvdXAuY2hpbGRyZW4ucmVkdWNlKGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgIC8vICAgcmV0dXJuIGEudW5pdGUoYik7XG4gICAgICAvLyB9LCBuZXcgUGF0aCh7XG4gICAgICAvLyAgIGZpbGxDb2xvcjogJ3BpbmsnLFxuICAgICAgLy8gICBzdHJva2VXaWR0aDogMSxcbiAgICAgIC8vICAgc3Ryb2tlQ29sb3I6ICdwaW5rJyxcbiAgICAgIC8vICAgZmlsbFJ1bGU6ICdldmVub2RkJ1xuICAgICAgLy8gfSkpO1xuICAgICAgLy8gY29uc29sZS5sb2coJ3VuaXRlZEdyb3VwJywgdW5pdGVkR3JvdXApO1xuICAgICAgLy9cbiAgICAgIC8vIHVuaXRlZEdyb3VwLnNlbGVjdGVkID0gZmFsc2U7XG4gICAgICAvLyB1bml0ZWRHcm91cC52aXNpYmxlID0gZmFsc2U7XG4gICAgICAvLyAvLyBncm91cC5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAvL1xuICAgICAgLy8gbGV0IG5laWdoYm9ycyA9IHByb2plY3QuZ2V0SXRlbXMoe1xuICAgICAgLy8gICBvdmVybGFwcGluZzogdW5pdGVkR3JvdXAuc3Ryb2tlQm91bmRzLFxuICAgICAgLy8gICBtYXRjaDogZnVuY3Rpb24oZWwpIHtcbiAgICAgIC8vICAgICByZXR1cm4gdW5pdGVkR3JvdXBJZHMuaW5jbHVkZXMoZWwuaWQpO1xuICAgICAgLy8gICB9XG4gICAgICAvLyB9KTtcbiAgICAgIC8vIGlmIChuZWlnaGJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgLy8gICBjb25zb2xlLmxvZygnbmVpZ2hib3JzJywgbmVpZ2hib3JzKTtcbiAgICAgIC8vIH0gZWxzZSB7XG4gICAgICAvLyAgIGNvbnNvbGUubG9nKCdubyBuZWlnaGJvcnMnKTtcbiAgICAgIC8vIH1cbiAgICAgIC8vIGxldCByZWN0ID0gbmV3IFBhdGguUmVjdGFuZ2xlKGdyb3VwLnN0cm9rZUJvdW5kcyk7XG4gICAgICAvLyByZWN0LnN0cm9rZUNvbG9yID0gJ3BpbmsnO1xuICAgICAgLy8gcmVjdC5zdHJva2VXaWR0aCA9IDI7XG5cbiAgICAgIHV0aWwuY2hlY2tQb3BzKCk7XG5cbiAgICAgIE1PVkVTLnB1c2goe1xuICAgICAgICB0eXBlOiAnbmV3R3JvdXAnLFxuICAgICAgICBpZDogZ3JvdXAuaWRcbiAgICAgIH0pO1xuXG4gICAgICBpZiAocnVuQW5pbWF0aW9ucykge1xuICAgICAgICBncm91cC5hbmltYXRlKFxuICAgICAgICAgIFt7XG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgIHNjYWxlOiAwLjlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXR0aW5nczoge1xuICAgICAgICAgICAgICBkdXJhdGlvbjogMTAwLFxuICAgICAgICAgICAgICBlYXNpbmc6IFwiZWFzZU91dFwiLFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICBzY2FsZTogMS4xMVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldHRpbmdzOiB7XG4gICAgICAgICAgICAgIGR1cmF0aW9uOiAxMDAsXG4gICAgICAgICAgICAgIGVhc2luZzogXCJlYXNlSW5cIlxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1dXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IHBpbmNoaW5nO1xuICAgIGxldCBwaW5jaGVkR3JvdXAsIGxhc3RTY2FsZSwgbGFzdFJvdGF0aW9uO1xuICAgIGxldCBvcmlnaW5hbFBvc2l0aW9uLCBvcmlnaW5hbFJvdGF0aW9uO1xuICAgIGZ1bmN0aW9uIHBpbmNoU3RhcnQoZXZlbnQpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdwaW5jaHN0YXJ0JywgZXZlbnQpO1xuICAgICAgaGFtbWVyTWFuYWdlci5nZXQoJ3BhbicpLnNldCh7ZW5hYmxlOiBmYWxzZX0pO1xuICAgICAgY29uc3QgcG9pbnRlciA9IGV2ZW50LmNlbnRlcixcbiAgICAgICAgICBwb2ludCA9IG5ldyBQb2ludChwb2ludGVyLngsIHBvaW50ZXIueSksXG4gICAgICAgICAgaGl0UmVzdWx0ID0gcGFwZXIucHJvamVjdC5oaXRUZXN0KHBvaW50LCBoaXRPcHRpb25zKTtcblxuICAgICAgaWYgKGhpdFJlc3VsdCkge1xuICAgICAgICBwaW5jaGluZyA9IHRydWU7XG4gICAgICAgIHBpbmNoZWRHcm91cCA9IGhpdFJlc3VsdC5pdGVtLnBhcmVudDtcbiAgICAgICAgbGFzdFNjYWxlID0gMTtcbiAgICAgICAgbGFzdFJvdGF0aW9uID0gcGluY2hlZEdyb3VwLnJvdGF0aW9uO1xuXG4gICAgICAgIG9yaWdpbmFsUG9zaXRpb24gPSBwaW5jaGVkR3JvdXAucG9zaXRpb247XG4gICAgICAgIG9yaWdpbmFsUm90YXRpb24gPSBwaW5jaGVkR3JvdXAucm90YXRpb247XG5cbiAgICAgICAgY29uc29sZS5sb2coJ3BpbmNoU3RhcnQgbGFzdFNjYWxlOicsIGxhc3RTY2FsZSk7XG4gICAgICAgIGlmIChydW5BbmltYXRpb25zKSB7XG4gICAgICAgICAgcGluY2hlZEdyb3VwLmFuaW1hdGUoe1xuICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICBzY2FsZTogMS4yNVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldHRpbmdzOiB7XG4gICAgICAgICAgICAgIGR1cmF0aW9uOiAxMDAsXG4gICAgICAgICAgICAgIGVhc2luZzogXCJlYXNlT3V0XCIsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdoaXQgbm8gaXRlbScpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBpbmNoTW92ZShldmVudCkge1xuICAgICAgaWYgKHBpbmNoZWRHcm91cCkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZygncGluY2htb3ZlJywgZXZlbnQpO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhwaW5jaGVkR3JvdXApO1xuICAgICAgICBsZXQgY3VycmVudFNjYWxlID0gZXZlbnQuc2NhbGU7XG4gICAgICAgIGxldCBzY2FsZURlbHRhID0gY3VycmVudFNjYWxlIC8gbGFzdFNjYWxlO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhsYXN0U2NhbGUsIGN1cnJlbnRTY2FsZSwgc2NhbGVEZWx0YSk7XG4gICAgICAgIGxhc3RTY2FsZSA9IGN1cnJlbnRTY2FsZTtcblxuICAgICAgICBsZXQgY3VycmVudFJvdGF0aW9uID0gZXZlbnQucm90YXRpb247XG4gICAgICAgIGxldCByb3RhdGlvbkRlbHRhID0gY3VycmVudFJvdGF0aW9uIC0gbGFzdFJvdGF0aW9uO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhsYXN0Um90YXRpb24sIGN1cnJlbnRSb3RhdGlvbiwgcm90YXRpb25EZWx0YSk7XG4gICAgICAgIGxhc3RSb3RhdGlvbiA9IGN1cnJlbnRSb3RhdGlvbjtcblxuICAgICAgICAvLyBjb25zb2xlLmxvZyhgc2NhbGluZyBieSAke3NjYWxlRGVsdGF9YCk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGByb3RhdGluZyBieSAke3JvdGF0aW9uRGVsdGF9YCk7XG5cbiAgICAgICAgcGluY2hlZEdyb3VwLnBvc2l0aW9uID0gZXZlbnQuY2VudGVyO1xuICAgICAgICBwaW5jaGVkR3JvdXAuc2NhbGUoc2NhbGVEZWx0YSk7XG4gICAgICAgIHBpbmNoZWRHcm91cC5yb3RhdGUocm90YXRpb25EZWx0YSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGluY2hFbmQoZXZlbnQpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdwaW5jaGVuZCcsIGV2ZW50KTtcbiAgICAgIC8vIHdhaXQgMjUwIG1zIHRvIHByZXZlbnQgbWlzdGFrZW4gcGFuIHJlYWRpbmdzXG4gICAgICBpZiAocGluY2hlZEdyb3VwKSB7XG4gICAgICAgIHBpbmNoZWRHcm91cC5kYXRhLnVwZGF0ZSA9IHRydWU7XG5cbiAgICAgICAgbGV0IG1vdmUgPSB7XG4gICAgICAgICAgaWQ6IHBpbmNoZWRHcm91cC5pZCxcbiAgICAgICAgICB0eXBlOiAndHJhbnNmb3JtJ1xuICAgICAgICB9O1xuICAgICAgICBpZiAocGluY2hlZEdyb3VwLnBvc2l0aW9uICE9IG9yaWdpbmFsUG9zaXRpb24pIHtcbiAgICAgICAgICBtb3ZlLnBvc2l0aW9uID0gb3JpZ2luYWxQb3NpdGlvbjtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGluY2hlZEdyb3VwLnJvdGF0aW9uICE9IG9yaWdpbmFsUm90YXRpb24pIHtcbiAgICAgICAgICBtb3ZlLnJvdGF0aW9uID0gb3JpZ2luYWxSb3RhdGlvbjtcbiAgICAgICAgfVxuICAgICAgICAvLyBpZiAocGluY2hlZEdyb3VwLnNjYWxlICE9IG9yaWdpbmFsU2NhbGUpIHtcbiAgICAgICAgLy8gICBtb3ZlLnNjYWxlID0gb3JpZ2luYWxTY2FsZTtcbiAgICAgICAgLy8gfVxuICAgICAgICBjb25zb2xlLmxvZygncHVzaGluZyBtb3ZlOicsIG1vdmUpO1xuICAgICAgICBNT1ZFUy5wdXNoKG1vdmUpO1xuICAgICAgICBpZiAocnVuQW5pbWF0aW9ucykge1xuICAgICAgICAgIHBpbmNoZWRHcm91cC5hbmltYXRlKHtcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgc2NhbGU6IDAuOFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldHRpbmdzOiB7XG4gICAgICAgICAgICAgIGR1cmF0aW9uOiAxMDAsXG4gICAgICAgICAgICAgIGVhc2luZzogXCJlYXNlT3V0XCIsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHBpbmNoaW5nID0gZmFsc2U7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICBoYW1tZXJNYW5hZ2VyLmdldCgncGFuJykuc2V0KHtlbmFibGU6IHRydWV9KTtcbiAgICAgIH0sIDI1MCk7XG4gICAgfVxuXG4gICAgY29uc3QgaGl0T3B0aW9ucyA9IHtcbiAgICAgIHNlZ21lbnRzOiBmYWxzZSxcbiAgICAgIHN0cm9rZTogdHJ1ZSxcbiAgICAgIGZpbGw6IHRydWUsXG4gICAgICB0b2xlcmFuY2U6IDVcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gc2luZ2xlVGFwKGV2ZW50KSB7XG4gICAgICBjb25zdCBwb2ludGVyID0gZXZlbnQuY2VudGVyLFxuICAgICAgICAgIHBvaW50ID0gbmV3IFBvaW50KHBvaW50ZXIueCwgcG9pbnRlci55KSxcbiAgICAgICAgICBoaXRSZXN1bHQgPSBwYXBlci5wcm9qZWN0LmhpdFRlc3QocG9pbnQsIGhpdE9wdGlvbnMpO1xuXG4gICAgICBpZiAoaGl0UmVzdWx0KSB7XG4gICAgICAgIGxldCBpdGVtID0gaGl0UmVzdWx0Lml0ZW07XG4gICAgICAgIGl0ZW0uc2VsZWN0ZWQgPSAhaXRlbS5zZWxlY3RlZDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkb3VibGVUYXAoZXZlbnQpIHtcbiAgICAgIGNvbnN0IHBvaW50ZXIgPSBldmVudC5jZW50ZXIsXG4gICAgICAgICAgcG9pbnQgPSBuZXcgUG9pbnQocG9pbnRlci54LCBwb2ludGVyLnkpLFxuICAgICAgICAgIGhpdFJlc3VsdCA9IHBhcGVyLnByb2plY3QuaGl0VGVzdChwb2ludCwgaGl0T3B0aW9ucyk7XG5cbiAgICAgIGlmIChoaXRSZXN1bHQpIHtcbiAgICAgICAgbGV0IGl0ZW0gPSBoaXRSZXN1bHQuaXRlbTtcbiAgICAgICAgbGV0IHBhcmVudCA9IGl0ZW0ucGFyZW50O1xuXG4gICAgICAgIGlmIChpdGVtLmRhdGEuaW50ZXJpb3IpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnaW50ZXJpb3InKTtcbiAgICAgICAgICBpdGVtLmRhdGEudHJhbnNwYXJlbnQgPSAhaXRlbS5kYXRhLnRyYW5zcGFyZW50O1xuXG4gICAgICAgICAgaWYgKGl0ZW0uZGF0YS50cmFuc3BhcmVudCkge1xuICAgICAgICAgICAgaXRlbS5maWxsQ29sb3IgPSB0cmFuc3BhcmVudDtcbiAgICAgICAgICAgIGl0ZW0uc3Ryb2tlQ29sb3IgPSB0cmFuc3BhcmVudDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaXRlbS5maWxsQ29sb3IgPSBwYXJlbnQuZGF0YS5jb2xvcjtcbiAgICAgICAgICAgIGl0ZW0uc3Ryb2tlQ29sb3IgPSBwYXJlbnQuZGF0YS5jb2xvcjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBNT1ZFUy5wdXNoKHtcbiAgICAgICAgICAgIHR5cGU6ICdmaWxsQ2hhbmdlJyxcbiAgICAgICAgICAgIGlkOiBpdGVtLmlkLFxuICAgICAgICAgICAgZmlsbDogcGFyZW50LmRhdGEuY29sb3IsXG4gICAgICAgICAgICB0cmFuc3BhcmVudDogaXRlbS5kYXRhLnRyYW5zcGFyZW50XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ25vdCBpbnRlcmlvcicpXG4gICAgICAgIH1cblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2hpdCBubyBpdGVtJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gdmFyIGFuaW1hdGlvbklkO1xuICAgIGxldCBlbGFzdGljaXR5ID0gMDtcblxuICAgIGZ1bmN0aW9uIGJvdW5jZShldmVudCkge1xuXG4gICAgICAvLyBjb25zb2xlLmxvZyhwYXBlci5wcm9qZWN0LmFjdGl2ZUxheWVyLmZpcnN0Q2hpbGQpO1xuICAgICAgLy8gcGFwZXIucHJvamVjdC5hY3RpdmVMYXllci5maXJzdENoaWxkLnJvdGF0ZSgzKTtcbiAgICAgIGlmICghIWxhc3RDaGlsZCkge1xuICAgICAgICBpZiAoZWxhc3RpY2l0eSA+IDApIHtcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZyhsYXN0Q2hpbGQpO1xuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGFzdENoaWxkLnNlZ21lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBzZWdtZW50ID0gbGFzdENoaWxkLnNlZ21lbnRzW2ldO1xuICAgICAgICAgICAgY29uc3QgdGltZUNvbnN0ID0gMTY7XG4gICAgICAgICAgICBjb25zdCBkaXZDb25zdCA9IDI7XG4gICAgICAgICAgICBjb25zdCBjb3MgPSBNYXRoLmNvcyhldmVudC50aW1lICogdGltZUNvbnN0ICsgaSk7XG4gICAgICAgICAgICBjb25zdCBzaW4gPSBNYXRoLnNpbihldmVudC50aW1lICogdGltZUNvbnN0ICsgaSk7XG4gICAgICAgICAgICBzZWdtZW50LnBvaW50LnggKz0gKGNvcyAvIGRpdkNvbnN0KSAqIGVsYXN0aWNpdHk7XG4gICAgICAgICAgICBzZWdtZW50LnBvaW50LnkgKz0gKHNpbiAvIGRpdkNvbnN0KSAqIGVsYXN0aWNpdHk7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhjb3MsIHNpbiwgZWxhc3RpY2l0eSk7XG4gICAgICAgICAgICBlbGFzdGljaXR5IC09IDAuMDAxO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ25vIGNoaWxkcmVuIHlldCcpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHBhcGVyLnZpZXcub25GcmFtZSA9IGppZ2dsZTtcblxuICAgIHZhciBoYW1tZXJNYW5hZ2VyID0gbmV3IEhhbW1lci5NYW5hZ2VyKCRjYW52YXNbMF0pO1xuXG4gICAgaGFtbWVyTWFuYWdlci5hZGQobmV3IEhhbW1lci5UYXAoeyBldmVudDogJ2RvdWJsZXRhcCcsIHRhcHM6IDIgfSkpO1xuICAgIGhhbW1lck1hbmFnZXIuYWRkKG5ldyBIYW1tZXIuVGFwKHsgZXZlbnQ6ICdzaW5nbGV0YXAnIH0pKTtcbiAgICBoYW1tZXJNYW5hZ2VyLmFkZChuZXcgSGFtbWVyLlBhbih7IGRpcmVjdGlvbjogSGFtbWVyLkRJUkVDVElPTl9BTEwgfSkpO1xuICAgIGhhbW1lck1hbmFnZXIuYWRkKG5ldyBIYW1tZXIuUGluY2goKSk7XG5cbiAgICBoYW1tZXJNYW5hZ2VyLmdldCgnZG91YmxldGFwJykucmVjb2duaXplV2l0aCgnc2luZ2xldGFwJyk7XG4gICAgaGFtbWVyTWFuYWdlci5nZXQoJ3NpbmdsZXRhcCcpLnJlcXVpcmVGYWlsdXJlKCdkb3VibGV0YXAnKTtcbiAgICBoYW1tZXJNYW5hZ2VyLmdldCgncGFuJykucmVxdWlyZUZhaWx1cmUoJ3BpbmNoJyk7XG5cbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdzaW5nbGV0YXAnLCBzaW5nbGVUYXApO1xuICAgIGhhbW1lck1hbmFnZXIub24oJ2RvdWJsZXRhcCcsIGRvdWJsZVRhcCk7XG5cbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdwYW5zdGFydCcsIHBhblN0YXJ0KTtcbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdwYW5tb3ZlJywgcGFuTW92ZSk7XG4gICAgaGFtbWVyTWFuYWdlci5vbigncGFuZW5kJywgcGFuRW5kKTtcblxuICAgIGhhbW1lck1hbmFnZXIub24oJ3BpbmNoc3RhcnQnLCBwaW5jaFN0YXJ0KTtcbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdwaW5jaG1vdmUnLCBwaW5jaE1vdmUpO1xuICAgIGhhbW1lck1hbmFnZXIub24oJ3BpbmNoZW5kJywgcGluY2hFbmQpO1xuICAgIGhhbW1lck1hbmFnZXIub24oJ3BpbmNoY2FuY2VsJywgZnVuY3Rpb24oKSB7IGhhbW1lck1hbmFnZXIuZ2V0KCdwYW4nKS5zZXQoe2VuYWJsZTogdHJ1ZX0pOyB9KTsgLy8gbWFrZSBzdXJlIGl0J3MgcmVlbmFibGVkXG4gIH1cblxuICBmdW5jdGlvbiBuZXdQcmVzc2VkKCkge1xuICAgIGNvbnNvbGUubG9nKCduZXcgcHJlc3NlZCcpO1xuXG4gICAgcGFwZXIucHJvamVjdC5hY3RpdmVMYXllci5yZW1vdmVDaGlsZHJlbigpO1xuICB9XG5cbiAgZnVuY3Rpb24gdW5kb1ByZXNzZWQoKSB7XG4gICAgY29uc29sZS5sb2coJ3VuZG8gcHJlc3NlZCcpO1xuICAgIGlmICghKE1PVkVTLmxlbmd0aCA+IDApKSB7XG4gICAgICBjb25zb2xlLmxvZygnbm8gbW92ZXMgeWV0Jyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IGxhc3RNb3ZlID0gTU9WRVMucG9wKCk7XG4gICAgbGV0IGl0ZW0gPSBwcm9qZWN0LmdldEl0ZW0oe1xuICAgICAgaWQ6IGxhc3RNb3ZlLmlkXG4gICAgfSk7XG5cbiAgICBpZiAoaXRlbSkge1xuICAgICAgc3dpdGNoKGxhc3RNb3ZlLnR5cGUpIHtcbiAgICAgICAgY2FzZSAnbmV3R3JvdXAnOlxuICAgICAgICAgIGNvbnNvbGUubG9nKCdyZW1vdmluZyBncm91cCcpO1xuICAgICAgICAgIGl0ZW0ucmVtb3ZlKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2ZpbGxDaGFuZ2UnOlxuICAgICAgICAgIGlmIChsYXN0TW92ZS50cmFuc3BhcmVudCkge1xuICAgICAgICAgICAgaXRlbS5maWxsQ29sb3IgPSBsYXN0TW92ZS5maWxsO1xuICAgICAgICAgICAgaXRlbS5zdHJva2VDb2xvciA9IGxhc3RNb3ZlLmZpbGw7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGl0ZW0uZmlsbENvbG9yID0gdHJhbnNwYXJlbnQ7XG4gICAgICAgICAgICBpdGVtLnN0cm9rZUNvbG9yID0gdHJhbnNwYXJlbnQ7XG4gICAgICAgICAgfVxuICAgICAgICBjYXNlICd0cmFuc2Zvcm0nOlxuICAgICAgICAgIGlmICghIWxhc3RNb3ZlLnBvc2l0aW9uKSB7XG4gICAgICAgICAgICBpdGVtLnBvc2l0aW9uID0gbGFzdE1vdmUucG9zaXRpb25cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCEhbGFzdE1vdmUucm90YXRpb24pIHtcbiAgICAgICAgICAgIGl0ZW0ucm90YXRpb24gPSBsYXN0TW92ZS5yb3RhdGlvbjtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gaWYgKCEhbGFzdE1vdmUuc2NhbGUpIHtcbiAgICAgICAgICAvLyAgIGl0ZW0uc2NhbGUgLy8/Pz9cbiAgICAgICAgICAvLyB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgY29uc29sZS5sb2coJ3Vua25vd24gY2FzZScpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZygnY291bGQgbm90IGZpbmQgbWF0Y2hpbmcgaXRlbScpO1xuICAgIH1cblxuICAgIC8vIGQzLnNlbGVjdEFsbCgnc3ZnLm1haW4gcGF0aDpsYXN0LWNoaWxkJykucmVtb3ZlKCk7XG4gIH1cblxuICBmdW5jdGlvbiBwbGF5UHJlc3NlZCgpIHtcbiAgICBjb25zb2xlLmxvZygncGxheSBwcmVzc2VkJyk7XG4gIH1cblxuICBmdW5jdGlvbiB0aXBzUHJlc3NlZCgpIHtcbiAgICBjb25zb2xlLmxvZygndGlwcyBwcmVzc2VkJyk7XG4gIH1cblxuICBmdW5jdGlvbiBzaGFyZVByZXNzZWQoKSB7XG4gICAgY29uc29sZS5sb2coJ3NoYXJlIHByZXNzZWQnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXROZXcoKSB7XG4gICAgJCgnLm1haW4tY29udHJvbHMgLm5ldycpLm9uKCdjbGljayB0YXAgdG91Y2gnLCBuZXdQcmVzc2VkKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRVbmRvKCkge1xuICAgICQoJy5tYWluLWNvbnRyb2xzIC51bmRvJykub24oJ2NsaWNrJywgdW5kb1ByZXNzZWQpO1xuICB9XG4gIGZ1bmN0aW9uIGluaXRQbGF5KCkge1xuICAgICQoJy5tYWluLWNvbnRyb2xzIC5wbGF5Jykub24oJ2NsaWNrJywgcGxheVByZXNzZWQpO1xuICB9XG4gIGZ1bmN0aW9uIGluaXRUaXBzKCkge1xuICAgICQoJy5hdXgtY29udHJvbHMgLnRpcHMnKS5vbignY2xpY2snLCB0aXBzUHJlc3NlZCk7XG4gIH1cbiAgZnVuY3Rpb24gaW5pdFNoYXJlKCkge1xuICAgICQoJy5hdXgtY29udHJvbHMgLnNoYXJlJykub24oJ2NsaWNrJywgc2hhcmVQcmVzc2VkKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRyYXdDaXJjbGUoKSB7XG4gICAgbGV0IGNpcmNsZSA9IG5ldyBQYXRoLkNpcmNsZSh7XG4gICAgICBjZW50ZXI6IFs0MDAsIDQwMF0sXG4gICAgICByYWRpdXM6IDEwMCxcbiAgICAgIHN0cm9rZUNvbG9yOiAnZ3JlZW4nLFxuICAgICAgZmlsbENvbG9yOiAnZ3JlZW4nXG4gICAgfSk7XG4gICAgbGV0IGdyb3VwID0gbmV3IEdyb3VwKGNpcmNsZSk7XG4gIH1cblxuICBmdW5jdGlvbiBtYWluKCkge1xuICAgIGluaXRDb250cm9sUGFuZWwoKTtcbiAgICBkcmF3Q2lyY2xlKCk7XG4gIH1cblxuICBtYWluKCk7XG59KTtcbiIsIi8vIENvbnZlcnRzIGZyb20gZGVncmVlcyB0byByYWRpYW5zLlxuZXhwb3J0IGZ1bmN0aW9uIHJhZChkZWdyZWVzKSB7XG4gIHJldHVybiBkZWdyZWVzICogTWF0aC5QSSAvIDE4MDtcbn07XG5cbi8vIENvbnZlcnRzIGZyb20gcmFkaWFucyB0byBkZWdyZWVzLlxuZXhwb3J0IGZ1bmN0aW9uIGRlZyhyYWRpYW5zKSB7XG4gIHJldHVybiByYWRpYW5zICogMTgwIC8gTWF0aC5QSTtcbn07XG5cbi8vIGRpc3RhbmNlIGJldHdlZW4gdHdvIHBvaW50c1xuZXhwb3J0IGZ1bmN0aW9uIGRlbHRhKHAxLCBwMikge1xuICByZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KHAxLnggLSBwMi54LCAyKSArIE1hdGgucG93KHAxLnkgLSBwMi55LCAyKSk7IC8vIHB5dGhhZ29yZWFuIVxufVxuXG4vLyByZXR1cm5zIGFuIGFycmF5IG9mIHRoZSBpbnRlcmlvciBjdXJ2ZXMgb2YgYSBnaXZlbiBjb21wb3VuZCBwYXRoXG5leHBvcnQgZnVuY3Rpb24gZmluZEludGVyaW9yQ3VydmVzKHBhdGgpIHtcbiAgbGV0IGludGVyaW9yQ3VydmVzID0gW107XG4gIGlmICghcGF0aCB8fCAhcGF0aC5jaGlsZHJlbiB8fCAhcGF0aC5jaGlsZHJlbi5sZW5ndGgpIHJldHVybjtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHBhdGguY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICBsZXQgY2hpbGQgPSBwYXRoLmNoaWxkcmVuW2ldO1xuXG4gICAgaWYgKGNoaWxkLmNsb3NlZCl7XG4gICAgICBpbnRlcmlvckN1cnZlcy5wdXNoKG5ldyBQYXRoKGNoaWxkLnNlZ21lbnRzKSk7XG4gICAgfVxuICB9XG5cbiAgcGF0aC5yZW1vdmUoKTtcbiAgcmV0dXJuIGludGVyaW9yQ3VydmVzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJ1ZUdyb3VwKGdyb3VwKSB7XG4gIGxldCBib3VuZHMgPSBncm91cC5fbmFtZWRDaGlsZHJlbi5ib3VuZHNbMF0sXG4gICAgICBtaWRkbGUgPSBncm91cC5fbmFtZWRDaGlsZHJlbi5taWRkbGVbMF07XG5cbiAgbGV0IG1pZGRsZUNvcHkgPSBuZXcgUGF0aCgpO1xuICBtaWRkbGVDb3B5LmNvcHlDb250ZW50KG1pZGRsZSk7XG4gIG1pZGRsZUNvcHkudmlzaWJsZSA9IGZhbHNlO1xuICBsZXQgZGl2aWRlZFBhdGggPSBtaWRkbGVDb3B5LnJlc29sdmVDcm9zc2luZ3MoKTtcbiAgZGl2aWRlZFBhdGgudmlzaWJsZSA9IGZhbHNlO1xuICBCYXNlLmVhY2goZGl2aWRlZFBhdGguY2hpbGRyZW4sIGZ1bmN0aW9uKGNoaWxkLCBpKSB7XG4gICAgaWYgKGNoaWxkLmNsb3NlZCkge1xuICAgICAgY2hpbGQuc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2hpbGQuc2VsZWN0ZWQgPSB0cnVlO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZyhjaGlsZCwgaSk7XG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cnVlUGF0aChwYXRoKSB7XG4gIGNvbnNvbGUubG9nKGdyb3VwKTtcbiAgLy8gaWYgKHBhdGggJiYgcGF0aC5jaGlsZHJlbiAmJiBwYXRoLmNoaWxkcmVuLmxlbmd0aCA+IDAgJiYgcGF0aC5fbmFtZWRDaGlsZHJlblsnbWlkZGxlJ10pIHtcbiAgLy8gICBsZXQgcGF0aENvcHkgPSBuZXcgUGF0aCgpO1xuICAvLyAgIGNvbnNvbGUubG9nKHBhdGguX25hbWVkQ2hpbGRyZW5bJ21pZGRsZSddKTtcbiAgLy8gICBwYXRoQ29weS5jb3B5Q29udGVudChwYXRoLl9uYW1lZENoaWxkcmVuWydtaWRkbGUnXSk7XG4gIC8vICAgY29uc29sZS5sb2cocGF0aENvcHkpO1xuICAvLyB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjaGVja1BvcHMoKSB7XG4gIGxldCBncm91cHMgPSBwYXBlci5wcm9qZWN0LmdldEl0ZW1zKHtcbiAgICBjbGFzc05hbWU6ICdHcm91cCcsXG4gICAgbWF0Y2g6IGZ1bmN0aW9uKGVsKSB7XG4gICAgICByZXR1cm4gKCEhZWwuZGF0YSAmJiBlbC5kYXRhLnVwZGF0ZSk7XG4gICAgfVxuICB9KTtcbiAgQmFzZS5lYWNoKGdyb3VwcywgZnVuY3Rpb24oZ3JvdXAsIGkpIHtcbiAgICBjb25zb2xlLmxvZyhncm91cCk7XG4gIH0pO1xufVxuIl19
