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
  currentColor: '#20171C',
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
    return shape.hitTestBounds(point, paper.project.activeLayer.children);
  }

  function hitTestGroupBounds(point) {
    let groups = paper.project.getItems({
      className: 'Group'
    });
    return shape.hitTestBounds(point, groups);
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
      if (!$body.hasClass(playingClass)) {
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
      };
    });
  }

  function initCanvasDraw() {

    paper.setup($canvas[0]);

    let shapePath;
    let touch = false;
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
      // paper.project.activeLayer.removeChildren(); // REMOVE

      // ignore other touch inputs
      if (pinching) return;
      if (!(event.changedPointers && event.changedPointers.length > 0)) return;
      if (event.changedPointers.length > 1) {
        log('event.changedPointers > 1');
      }

      stopPlaying();

      prevAngle = Math.atan2(event.velocityY, event.velocityX);

      const pointer = event.center;
      const point = new Point(pointer.x, pointer.y);

      shapePath = new Path({
        strokeColor: window.kan.currentColor,
        name: 'shapePath',
        strokeWidth: 5,
        visible: true,
        strokeCap: 'round'
      });

      shapePath.add(point);

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

      let angle = Math.atan2(event.velocityY, event.velocityX);
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

      pathData[shape.stringifyPoint(point)] = {
        point: point,
        speed: Math.abs(event.overallVelocity),
        angle: angle
      };

      shapePath.add(point);

      paper.view.draw();

      prevPoint = point;
    }

    function panEnd(event) {
      if (pinching) return;

      const pointer = event.center;
      const point = new Point(pointer.x, pointer.y);

      let group = new Group([shapePath]);
      group.data.color = shapePath.strokeColor;
      group.data.update = true; // used for pops
      group.data.scale = 1; // init variable to track scale changes
      group.data.rotation = 0; // init variable to track rotation changes

      shapePath.add(point);
      // shapePath.simplify();

      side.push(point);
      sides.push(side);

      pathData[shape.stringifyPoint(point)] = {
        point: point,
        last: true
      };

      corners.push(point);

      shapePath.simplify();

      let shapeJSON = shapePath.exportJSON();
      let shapeData = shape.processShapeData(shapeJSON);
      console.log(shapeData);
      let shapePrediction = detector.spot(shapeData);
      let shapePattern;
      if (shapePrediction.score > 0.5) {
        shapePattern = shapePrediction.pattern;
      } else {
        shapePattern = "other";
      }

      console.log('shape before', shapePattern, shapePrediction.score);;
      // shapePath.reduce();
      let [truedGroup, trueWasNecessary] = shape.trueGroup(group, corners);
      group.replaceWith(truedGroup);
      shapePath = group._namedChildren.shapePath[0];
      shapePath.strokeColor = group.strokeColor;
      // shapePath.selected = true;

      // shapePath.flatten(4);
      // shapePath.reduce();

      // shapePath.simplify();
      if (trueWasNecessary) {
        let computedCorners = shape.getComputedCorners(shapePath);
        let computedCornersPath = new Path(computedCorners);
        computedCornersPath.visible = false;
        let computedCornersPathLength = computedCornersPath.length;
        if (Math.abs(computedCornersPathLength - shapePath.length) / shapePath.length <= 0.1) {
          shapePath.removeSegments();
          // console.log(computedCorners);
          shapePath.segments = computedCorners;
          // shapePath.reduce();
        }
      }

      // check shape
      shapeJSON = shapePath.exportJSON();
      shapeData = shape.processShapeData(shapeJSON);
      shapePrediction = detector.spot(shapeData);
      if (shapePrediction.score > 0.6) {
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

      let intersections = shapePath.getCrossings();
      if (intersections.length > 0) {
        // we create a copy of the path because resolveCrossings() splits source path
        let pathCopy = new Path();
        pathCopy.copyContent(shapePath);
        pathCopy.visible = false;

        let enclosedLoops = shape.findInteriorCurves(pathCopy);

        if (enclosedLoops.length > 0) {
          for (let i = 0; i < enclosedLoops.length; i++) {
            if (shapePath.closed) {
              enclosedLoops[i].fillColor = shapePath.strokeColor;
              enclosedLoops[i].data.interior = true;
              enclosedLoops[i].data.transparent = false;
            } else {
              enclosedLoops[i].fillColor = transparent;
              enclosedLoops[i].data.transparent = true;
            }
            enclosedLoops[i].data.interior = true;
            enclosedLoops[i].visible = true;
            enclosedLoops[i].closed = true;
            group.addChild(enclosedLoops[i]);
            enclosedLoops[i].sendToBack();
          }
        }
        // pathCopy.remove();
      } else {
        if (shapePath.closed) {
          let enclosedLoop = shapePath.clone();
          enclosedLoop.visible = true;
          enclosedLoop.fillColor = group.strokeColor;
          enclosedLoop.data.interior = true;
          enclosedLoop.data.transparent = false;
          group.addChild(enclosedLoop);
          enclosedLoop.sendToBack();
        }
      }

      let children = group.getItems({
        match: function(item) {
          return item.name !== 'shapePath'
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

      // shapePath.selected = true

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
              easing: "easeIn",
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
      event.preventDefault();
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
      stopPlaying();

      const pointer = event.center,
          point = new Point(pointer.x, pointer.y),
          hitResult = paper.project.hitTest(point, hitOptions);

      if (hitResult) {
        let item = hitResult.item;
        // item.selected = !item.selected;
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

  const playingClass = 'playing';
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
    $body.removeClass(playingClass);

    playing = false;
    sound.stopComposition(compositionInterval);
  }

  function startPlaying() {
    $body.addClass(playingClass);
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
    $('.main-controls .new').on('click tap touch', function() {
      if (!$body.hasClass(playingClass)) {
        newPressed();
      }
    });
  }

  function initUndo() {
    $('.main-controls .undo').on('click', function() {
      if (!$body.hasClass(playingClass)) {
        undoPressed()
      }
    });
  }

  function initPlay() {
    $('.main-controls .play-stop').on('click', playPressed);
  }

  function initTips() {
    $('.aux-controls .tips').on('click', function() {
      if (!$body.hasClass(playingClass)) {
        tipsPressed();
      }
    });
  }

  function initShare() {
    $('.aux-controls .share').on('click', function() {
      if (!$body.hasClass(playingClass)) {
        sharePressed();
      }
    });
  }

  function main() {
    initControlPanel();
    initViewVars();
  }

  main();
});
