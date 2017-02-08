const config = require('./../../config');

require('hammerjs');
require('howler');

const ShapeDetector = require('./lib/shape-detector');

const util = require('./util');
const shape = require('./shape');
const color = require('./color');
const sound = require('./sound');

window.kan = window.kan || {
  palette: ["#20171C", "#1E2A43", "#28377D", "#352747", "#CA2E26", "#9A2A1F", "#DA6C26", "#453121", "#916A47", "#DAAD27", "#7F7D31","#2B5E2E"],
  paletteNames: [],
  currentColor: '#20171C',
  numPaths: 10,
  paths: [],
};

paper.install(window);

function log(thing) {
  util.log(thing);
}

$(document).ready(function() {
  let MOVES = []; // store global moves list
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

  const $window = $(window);
  const $body = $('body');
  const $canvas = $('canvas#mainCanvas');
  const runAnimations = config.runAnimations;
  const transparent = new Color(0, 0);
  const thresholdAngle = util.rad(config.shape.cornerThresholdDeg);
  const detector = new ShapeDetector(ShapeDetector.defaultShapes);
  let composition = [];
  let compositionInterval;

  let viewWidth, viewHeight;

  let playing = false;

  function quantizePosition(position) {
    return sound.quantizePosition(position, viewWidth);
  }


  function hitTestBounds(point) {
    return util.hitTestBounds(point, paper.project.activeLayer.children);
  }

  function hitTestGroupBounds(point) {
    let groups = paper.project.getItems({
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
    const $paletteWrap = $('ul.palette-colors');
    const $paletteColors = $paletteWrap.find('li');
    const paletteColorSize = 20;
    const paletteSelectedColorSize = 30;
    const paletteSelectedClass = 'palette-selected';

    // hook up click
      $paletteColors.on('click tap touch', function() {
          let $svg = $(this).find('svg.palette-color');

          if (!$svg.hasClass(paletteSelectedClass)) {
            $('.' + paletteSelectedClass)
              .removeClass(paletteSelectedClass)
              .attr('width', paletteColorSize)
              .attr('height', paletteColorSize)
              .find('rect')
              .attr('rx', 0)
              .attr('ry', 0);

            $svg.addClass(paletteSelectedClass)
              .attr('width', paletteSelectedColorSize)
              .attr('height', paletteSelectedColorSize)
              .find('rect')
              .attr('rx', paletteSelectedColorSize / 2)
              .attr('ry', paletteSelectedColorSize / 2)

            window.kan.currentColor = $svg.find('rect').attr('fill');
          }
        });
  }

  function initCanvasDraw() {

    paper.setup($canvas[0]);

    let middle, bounds;
    let sizes;
    // let paths = getFreshPaths(window.kan.numPaths);
    let touch = false;
    let lastChild;
    let pathData = {};
    let prevAngle, prevPoint;

    let sides;
    let side;

    let corners;

    const sounds = sound.initShapeSounds();
    const beatLength = (60 / config.sound.bpm);
    const measureLength = beatLength * 4;
    const compositionLength = measureLength * config.sound.measures;

    function panStart(event) {
      paper.project.activeLayer.removeChildren(); // REMOVE
      // drawCircle();

      sizes = [];
      prevAngle = Math.atan2(event.velocityY, event.velocityX);

      stopPlaying();
      if (pinching) return;
      if (!(event.changedPointers && event.changedPointers.length > 0)) return;
      if (event.changedPointers.length > 1) {
        log('event.changedPointers > 1');
      }

      const pointer = event.center;
      const point = new Point(pointer.x, pointer.y);

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

    const min = 1;
    const max = 15;
    const alpha = 0.3;
    const memory = 10;
    var cumDistance = 0;
    let cumSize, avgSize;
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

      const pointer = event.center;
      let point = new Point(pointer.x, pointer.y);

      // angle = -1 * event.angle; // make up positive rather than negative
      // angle = angle += 180;
      // console.log(event.velocityX, event.velocityY);
      angle = Math.atan2(event.velocityY, event.velocityX);
      let angleDelta = util.angleDelta(angle, prevAngle);
      prevAngle = angle;

      if (angleDelta > thresholdAngle) {
        if (side.length > 0) {
          // console.log('corner');
          let cornerPoint = point;
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

      let bottomX, bottomY, bottom,
        topX, topY, top,
        p0, p1,
        step, angle, dist, size;

      if (sizes.length > 0) {
        // not the first point, so we have others to compare to
        p0 = prevPoint;
        dist = util.delta(point, p0);
        size = dist * alpha;
        // if (size >= max) size = max;
        size = Math.max(Math.min(size, max), min); // clamp size to [min, max]
        // size = max - size;

        cumSize = 0;
        for (let j = 0; j < sizes.length; j++) {
          cumSize += sizes[j];
        }
        avgSize = Math.round(((cumSize / sizes.length) + size) / 2);
        // log(avgSize);

        angle = Math.atan2(point.y - p0.y, point.x - p0.x); // rad

        // Point(bottomX, bottomY) is bottom, Point(topX, topY) is top
        bottomX = point.x + Math.cos(angle + Math.PI/2) * avgSize;
        bottomY = point.y + Math.sin(angle + Math.PI/2) * avgSize;
        bottom = new Point(bottomX, bottomY);

        topX = point.x + Math.cos(angle - Math.PI/2) * avgSize;
        topY = point.y + Math.sin(angle - Math.PI/2) * avgSize;
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

      const pointer = event.center;
      const point = new Point(pointer.x, pointer.y);

      let group = new Group([bounds, middle]);
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

      middle.simplify();
      // middle.reduce();
      let [truedGroup, trueWasNecessary] = util.trueGroup(group, corners);
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
        let computedCorners = shape.getComputedCorners(middle);
        let computedCornersPath = new Path(computedCorners);
        computedCornersPath.visible = false;
        let computedCornersPathLength = computedCornersPath.length;
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


      let intersections = middle.getCrossings();
      if (intersections.length > 0) {
        // we create a copy of the path because resolveCrossings() splits source path
        let pathCopy = new Path();
        pathCopy.copyContent(middle);
        pathCopy.visible = false;

        let dividedPath = pathCopy.resolveCrossings();
        dividedPath.visible = false;


        let enclosedLoops = util.findInteriorCurves(dividedPath);

        if (enclosedLoops) {
          for (let i = 0; i < enclosedLoops.length; i++) {
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
          let enclosedLoop = middle.clone();
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

      let children = group.getItems({
        match: function(item) {
          return item.name !== 'middle'
        }
      });

      // log('-----');
      // log(group);
      // log(children);
      // group.selected = true;
      let unitedPath = new Path();
      if (children.length > 1) {
        let accumulator = new Path();
        accumulator.copyContent(children[0]);
        accumulator.visible = false;

        for (let i = 1; i < children.length; i++) {
          let otherPath = new Path();
          otherPath.copyContent(children[i]);
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

      // check shape
      const shapeJSON = middle.exportJSON();
      console.log(shapeJSON);
      const shapeData = shape.processShapeData(shapeJSON);
      const shapePrediction = detector.spot(shapeData);
      let shapePattern;
      if (shapePrediction.score > 0.5) {
        shapePattern = shapePrediction.pattern;
      } else {
        shapePattern = "other";
      }
      const colorName = color.getColorName(window.kan.currentColor);

      // get size
      const quantizedSoundStartTime = sound.quantizeLength(group.bounds.x / viewWidth * compositionLength) * 1000; // ms
      const quantizedSoundDuration = sound.quantizeLength(group.bounds.width / viewWidth * compositionLength) * 1000; // ms

      // console.log(config.shapes[shapePattern]);
      // console.log(sounds[shapePattern]);
      const playSounds = false;
      let compositionObj = {};
      compositionObj.sound = sounds[shapePattern];
      compositionObj.startTime = quantizedSoundStartTime;
      compositionObj.duration = quantizedSoundDuration;
      compositionObj.groupId = group.id;
      if (config.shapes[shapePattern].sprite) {
        compositionObj.sprite = true;
        compositionObj.spriteName = colorName;

        if (playSounds) {
          sounds[shapePattern].play(colorName);
        }
      } else {
        compositionObj.sprite = false;

        if (playSounds) {
          sounds[shapePattern].play();
        }
      }

      composition.push(compositionObj);

      // set sound to loop again
      console.log(`${shapePattern}-${colorName}`);

      lastChild = group;

      MOVES.push({
        type: 'newGroup',
        id: group.id
      });

      if (runAnimations) {
        group.animate(
          [{
            properties: {
              scale: 0.9
            },
            settings: {
              duration: 100,
              easing: "easeOut",
            }
          },
          {
            properties: {
              scale: 1.11
            },
            settings: {
              duration: 100,
              easing: "easeIn"
            }
          }]
        );
      }
    }

    let pinching;
    let pinchedGroup, lastScale, lastRotation;
    let originalPosition, originalRotation, originalScale;

    function pinchStart(event) {
      console.log('pinchStart', event.center);
      stopPlaying();

      hammerManager.get('pan').set({enable: false});
      const pointer = event.center,
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
              easing: "easeOut",
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
        let currentScale = event.scale;
        let scaleDelta = currentScale / lastScale;
        // log(lastScale, currentScale, scaleDelta);
        lastScale = currentScale;

        let currentRotation = event.rotation;
        let rotationDelta = currentRotation - lastRotation;
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

    let lastEvent;
    function pinchEnd(event) {
      // wait 250 ms to prevent mistaken pan readings
      lastEvent = event;
      if (!!pinchedGroup) {
        pinchedGroup.data.update = true;
        let move = {
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
      setTimeout(function() {
        hammerManager.get('pan').set({enable: true});
      }, 250);
    }

    const hitOptions = {
      segments: false,
      stroke: true,
      fill: true,
      tolerance: 5
    };

    function singleTap(event) {
      const pointer = event.center,
          point = new Point(pointer.x, pointer.y),
          hitResult = paper.project.hitTest(point, hitOptions);

      if (hitResult) {
        let item = hitResult.item;
        item.selected = !item.selected;
        log(item);
      }
    }

    function doubleTap(event) {
      const pointer = event.center,
          point = new Point(pointer.x, pointer.y),
          hitResult = paper.project.hitTest(point, hitOptions);

      if (hitResult) {
        let item = hitResult.item;
        let parent = item.parent;

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
          log('not interior')
        }

      } else {
        pinchedGroup = null;
        log('hit no item');
      }
    }

    const velocityMultiplier = 25;
    function throwPinchedGroup() {
      log(pinchedGroup.position);
      if (pinchedGroup.position.x <= 0 - pinchedGroup.bounds.width ||
          pinchedGroup.position.x >= viewWidth + pinchedGroup.bounds.width ||
          pinchedGroup.position.y <= 0 - pinchedGroup.bounds.height ||
          pinchedGroup.position.y >= viewHeight + pinchedGroup.bounds.height) {
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
    hammerManager.on('pinchcancel', function() { hammerManager.get('pan').set({enable: true}); }); // make sure it's reenabled
  }

  function newPressed() {
    log('new pressed');

    composition = [];
    paper.project.activeLayer.removeChildren();
  }

  function undoPressed() {
    log('undo pressed');
    if (!(MOVES.length > 0)) {
      log('no moves yet');
      return;
    }

    let lastMove = MOVES.pop();
    let item = project.getItem({
      id: lastMove.id
    });

    if (item) {
      item.visible = true; // make sure
      switch(lastMove.type) {
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
            item.position = lastMove.position
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

  function stopPlaying(mute = false) {
    if (!!mute) {
      Howler.mute(true);
    }

    playing = false;
    sound.stopComposition(compositionInterval);
  }

  function startPlaying() {
    Howler.mute(false);
    playing = true;
    compositionInterval = sound.startComposition(composition);
  }

  function playPressed() {
    log('play pressed');
    if (playing) {
      stopPlaying(true);
    } else {
      startPlaying();
    }
    console.log('play pressed');
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
    let circle = new Path.Circle({
      center: [400, 400],
      radius: 100,
      strokeColor: 'green',
      fillColor: 'green'
    });
    let group = new Group(circle);
  }

  function main() {
    initControlPanel();
    // drawCircle();
    initViewVars();
  }

  main();
});
