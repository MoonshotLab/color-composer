require('hammerjs');

const config = require('./../../config');
const sound = require('./sound');
const color = require('./color');
const shape = require('./shape');
const util = require('./util');

const sounds = sound.initShapeSounds();

const canvas = document.getElementById(config.canvasId);

const viewWidth = paper.view.viewSize.width;
const viewHeight = paper.view.viewSize.height;

const compositionLength = sound.compositionLength;

const hitOptions = {
  segments: false,
  stroke: true,
  fill: true,
  tolerance: 5
};

let hammerManager;

export function init() {
  hammerManager = new Hammer.Manager(canvas);

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

function addTestShape(innerShapePath, shapeData, pathData, corners, sides) {
  console.log('innerShapePath', innerShapePath);
  console.log('shapeData', shapeData);
  console.log('pathData', pathData);
  console.log('corners', corners);
  console.log('sides', sides);
  
  let maxSpeed = 0;
  for (let dataPoint in pathData) {
    if (!!pathData[dataPoint].speed) {
      // console.log(pathData[dataPoint]);
      maxSpeed = Math.max(pathData[dataPoint].speed, maxSpeed);
    }
  }
  
  const sideSpeeds = [];
  sides.forEach((side, index) => {
    let thisSideSpeed = 0;
    side.forEach((point, pointIndex) => {
      const speed = pathData[shape.stringifyPoint(point)].speed;
      if (typeof(speed) === 'undefined') { // FIXME: figure out why these are undefined. Maybe a simplified point?
        return;
      }
      thisSideSpeed += pathData[shape.stringifyPoint(point)].speed;
    });
    console.log('max', maxSpeed, 'this', thisSideSpeed);
    // const lineWidth = Math.min(Math.max((thisSideSpeed / maxSpeed) * 5, 2) / 3, 20);
    const lineWidth = 20; // FIXME: this should be a variable width
    sideSpeeds.push(lineWidth);
  });
  
  console.log('sideSpeeds', sideSpeeds);

  let shapePath = new Path({
    strokeColor: window.kan.currentColor,
    name: 'shapePath',
    strokeWidth: 5,
    visible: false,
    strokeCap: 'round',
    selected: true,
    segments: shapeData,
    closed: true,
  });
  const shapeCenter = {
    x: shapePath.position._x,
    y: shapePath.position._y
  };
  
  const outerPoints = [];
  
  // Split paths from each corner
  const sidePaths = [];
  let pathRemainder = innerShapePath.clone({insert: true});
  corners.forEach((corner, cornerIndex) => {
    new Path.Circle({
      center: corner,
      radius: 15,
      fillColor: new Color(1, 0, 0.5, 0.5)
    });

    // Don't split the first
    if (cornerIndex == 0) {
      return;
    }

    pathRemainder = pathRemainder.clone({insert: true});
    // pathRemainder.selected = true;
    const nearestLocation = pathRemainder.getNearestLocation(corner);
    console.log('corner', corner);
    console.log('nearestLocation', nearestLocation);
    const pathSegment = pathRemainder.splitAt(nearestLocation);
    sidePaths.push(pathRemainder);
  });
  
  console.log('sidePaths', sidePaths);
  const guessedSides = [];
  sidePaths.forEach((sidePath, sidePathIndex) => {
    // sidePath.selected = true;
    sidePath.strokeColor = 'green';
    if (!corners[sidePathIndex + 1]) {
      return;
    }
    console.log(`sidepath ${sidePathIndex} length`, sidePath.length);
    const calcLength = corners[sidePathIndex].getDistance(corners[sidePathIndex + 1]);
    console.log(`calculated length`, calcLength);
    if (sidePath.length > (calcLength * 0.9) && sidePath.length < (calcLength * 1.1)) {
      // This is probably a straight line
      console.log('segments', sidePath._segments);
      console.log('last', sidePath.length - 1, sidePath.segments[sidePath.length - 1]);
      const first = sidePath._segments[0]._point;
      const last = sidePath._segments[sidePath.length - 1]._point;
      console.log('Guessed a straight line between', first, last);
      guessedSides.push(first, last);
    } else {
      guessedSides.push(sidePath);
    }
  });
  console.log('guessedSides', guessedSides);
  // console.log('pathRemainder', pathRemainder);

  // console.log('center', shapeCenter);
  sides.forEach((side, sideIndex) => {
    side.forEach((point, pointIndex) => {
      if (((sideIndex == sides.length - 1) && (pointIndex == side.length - 1)) || ((sideIndex == 0) && (pointIndex == 0))) {
        // Mark the beginning and ends
        new Path.Circle({
          center: point,
          radius: 15,
          fillColor: new Color(0, 0, 1, 0.5)
        });
        return;
      }
      // console.log('point', pointIndex, point);
      
      const pointsDistanceFromCenter = Math.sqrt(
        Math.pow(shapeCenter.x - point.x, 2) + Math.pow(shapeCenter.y - point.y, 2)
      );
      // console.log('distance', pointsDistanceFromCenter);
      
      const distanceRatio = (pointsDistanceFromCenter + sideSpeeds[sideIndex]) / pointsDistanceFromCenter;
      const newPoint = new Point(
        ((1 - distanceRatio) * shapeCenter.x) + (distanceRatio * point.x),
        ((1 - distanceRatio) * shapeCenter.y) + (distanceRatio * point.y)
      );
      // console.log('newPoint', newPoint);
      
      outerPoints.push(newPoint);
    });
  });

  let outerShapePath = new Path({
    strokeColor: new Color(1, 0, 0, 0.8),
    name: 'shapePath',
    strokeWidth: 1,
    visible: true,
    strokeCap: 'round',
    selected: true,
    segments: outerPoints,
    closed: true,
  });
  
  let innerPath = outerShapePath.subtract(shapePath);
  innerPath.strokeWidth = 0;
  innerPath.fillColor = new Color(1, 0.5, 0.5, 0.2);
  innerPath.visible = true;
  // innerPath.selected = true;
  // innerPath.smooth(); // This makes it an ovoid
  
  // console.log('shapePath', shapePath);
}

function singleTap(event) {
  console.log('singleTap');
  sound.stopPlaying();

  const pointer = event.center,
      point = new Point(pointer.x, pointer.y),
      hitResult = paper.project.hitTest(point, hitOptions);

  if (hitResult) {
    let item = hitResult.item;
    // item.selected = !item.selected;
    console.log(item);
  }
}

function doubleTap(event) {
  const pointer = event.center,
      point = new Point(pointer.x, pointer.y),
      hitResult = paper.project.hitTest(point, hitOptions);

  const transparent = color.transparent;

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

      window.kan.moves.push({
        type: 'fillChange',
        id: item.id,
        fill: parent.data.color,
        transparent: item.data.transparent
      });
    } else {
      console.log('not interior')
    }

  } else {
    window.kan.pinchedGroup = null;
    console.log('hit no item');
  }
}

function panStart(event) {
  // paper.project.activeLayer.removeChildren(); // REMOVE

  // ignore other touch inputs
  if (window.kan.pinching) return;
  if (!(event.changedPointers && event.changedPointers.length > 0)) return;
  if (event.changedPointers.length > 1) {
    console.log('event.changedPointers > 1');
  }

  sound.stopPlaying();

  window.kan.prevAngle = Math.atan2(event.velocityY, event.velocityX);

  const pointer = event.center;
  const point = new Point(pointer.x, pointer.y);

  let shapePath = new Path({
    strokeColor: window.kan.currentColor,
    name: 'shapePath',
    strokeWidth: 5,
    visible: true,
    strokeCap: 'round'
  });

  shapePath.add(point);

  window.kan.corners = [point];

  window.kan.sides = [];
  window.kan.side = [point];

  window.kan.pathData[shape.stringifyPoint(point)] = {
    point: point,
    first: true
  };

  window.kan.shapePath = shapePath;
}

function panMove(event) {
  event.preventDefault();
  if (window.kan.pinching) return;

  const thresholdAngleRad = util.rad(shape.cornerThresholdDeg);
  const thresholdLength = 30; // TODO: we might consider using a more dynamic value, but this seems decent

  const pointer = event.center;
  let point = new Point(pointer.x, pointer.y);

  let angle = Math.atan2(event.velocityY, event.velocityX);
  let prevAngle = window.kan.prevAngle;
  let angleDelta = util.angleDelta(angle, prevAngle);
  window.kan.prevAngle = angle;

  let side = window.kan.side;
  let sides = window.kan.sides;

  const pointDistance = point.getDistance(window.kan.corners[window.kan.corners.length - 1]);
  if ((angleDelta > thresholdAngleRad)) {
    if (side.length > 0) {
      // console.log('corner');
      let cornerPoint = point;
      new Path.Circle({
        center: cornerPoint,
        radius: 5,
        fillColor: new Color(0, 1, 0, 0.5)
      });
      if (pointDistance > thresholdLength) {
        window.kan.corners.push(cornerPoint);
        sides.push(side);
        side = [];
      }
    }
  }

  side.push(point);

  window.kan.pathData[shape.stringifyPoint(point)] = {
    point: point,
    speed: Math.abs(event.overallVelocity),
    angle: angle
  };

  window.kan.shapePath.add(point);
  window.kan.sides = sides;
  window.kan.side = side;

  paper.view.draw();
}

// hc svnt dracones :/
function panEnd(event) {
  if (window.kan.pinching) return;

  const pointer = event.center;
  const point = new Point(pointer.x, pointer.y);
  const transparent = color.transparent;
  let shapePath = window.kan.shapePath;
  let side = window.kan.side;
  let sides = window.kan.sides;
  let corners = window.kan.corners;

  let group = new Group([shapePath]);
  group.data.color = shapePath.strokeColor;
  group.data.update = true; // used for pops
  group.data.scale = 1; // init variable to track scale changes
  group.data.rotation = 0; // init variable to track rotation changes

  shapePath.add(point);
  // shapePath.simplify();

  side.push(point);
  sides.push(side);

  window.kan.pathData[shape.stringifyPoint(point)] = {
    point: point,
    last: true
  };

  corners.push(point);

  shapePath.simplify();


  let shapeJSON = shapePath.exportJSON();
  let shapeData = shape.processShapeData(shapeJSON);
  console.log('shapeData', shapeData);
  addTestShape(shapePath, shapeData, window.kan.pathData, corners, sides);
  let shapePrediction = shape.detector.spot(shapeData);
  let shapePattern;
  if (shapePrediction.score > 0.5) {
    shapePattern = shapePrediction.pattern;
  } else {
    shapePattern = "other";
  }

  console.log('shape before', shapePattern, shapePrediction.score);
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
  shapePrediction = shape.detector.spot(shapeData);
  if (shapePrediction.score > 0.6) {
    shapePattern = shapePrediction.pattern;
  } else {
    shapePattern = "other";
  }
  const colorName = color.getColorName(window.kan.currentColor);

  // get size

  const playSounds = false;
  const quantizedSoundStartTime = sound.quantizeLength(group.bounds.x / viewWidth * compositionLength); // ms
  const quantizedSoundDuration = sound.quantizeLength(group.bounds.width / viewWidth * compositionLength); // ms
  let compositionObj = {};
  compositionObj.sound = sounds[shapePattern];
  compositionObj.startTime = quantizedSoundStartTime;
  compositionObj.duration = quantizedSoundDuration;
  compositionObj.groupId = group.id;
  if (shape.shapeNames[shapePattern].sprite) {
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

  window.kan.composition.push(compositionObj);

  // set sound to loop again
  console.log(`Added shape: ${shapePattern}-${colorName}`);

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

  // console.log('-----');
  // console.log(group);
  // console.log(children);
  // group.selected = true;
  // let unitedPath = new Path();
  // if (children.length > 1) {
  //   let accumulator = new Path();
  //   accumulator.copyContent(children[0]);
  //   accumulator.visible = false;
  // 
  //   for (let i = 1; i < children.length; i++) {
  //     let otherPath = new Path();
  //     otherPath.copyContent(children[i]);
  //     otherPath.visible = false;
  // 
  //     unitedPath = accumulator.unite(otherPath);
  //     otherPath.remove();
  //     accumulator = unitedPath;
  //   }
  // 
  // } else if (children.length > 0) {
  //   unitedPath.copyContent(children[0]);
  // }
  // 
  // unitedPath.visible = false;
  // unitedPath.data.name = 'mask';
  // 
  // group.addChild(unitedPath);
  // unitedPath.sendToBack();

  // shapePath.selected = true

  window.kan.shapePath = shapePath;
  window.kan.side = side;
  window.kan.sides = sides;
  window.kan.corners = corners;

  window.kan.moves.push({
    type: 'newGroup',
    id: group.id
  });

  if (config.runAnimations) {
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
          scale: 1
        },
        settings: {
          duration: 100,
          easing: "easeIn",
        }
      }]
    );
  }
}

function hitTestGroupBounds(point) {
  let groups = paper.project.getItems({
    className: 'Group'
  });
  return shape.hitTestBounds(point, groups);
}

function pinchStart(event) {
  console.log('pinchStart', event.center);
  sound.stopPlaying();

  hammerManager.get('pan').set({enable: false});
  const pointer = event.center,
      point = new Point(pointer.x, pointer.y),
      hitResult = hitTestGroupBounds(point);

  if (hitResult) {
    window.kan.pinching = true;
    window.kan.pinchedGroup = hitResult;
    window.kan.lastScale = 1;
    window.kan.lastRotation = event.rotation;

    window.kan.originalPosition = hitResult.position;
    window.kan.originalRotation = hitResult.data.rotation;
    window.kan.originalScale = hitResult.data.scale;

    if (config.runAnimations) {
      hitResult.animate({
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
    window.kan.pinchedGroup = null;
    console.log('hit no item');
  }
}

function pinchMove(event) {
  console.log('pinchMove');
  event.preventDefault();
  let pinchedGroup = window.kan.pinchedGroup;
  if (!!pinchedGroup) {
    // console.log('pinchmove', event);
    // console.log(pinchedGroup);
    let currentScale = event.scale;
    let scaleDelta = currentScale / window.kan.lastScale;
    // console.log(lastScale, currentScale, scaleDelta);
    window.kan.lastScale = currentScale;

    let currentRotation = event.rotation;
    let rotationDelta = currentRotation - window.kan.lastRotation;
    window.kan.lastRotation = currentRotation;

    // console.log(`scaling by ${scaleDelta}`);
    // console.log(`rotating by ${rotationDelta}`);

    pinchedGroup.position = event.center;
    pinchedGroup.scale(scaleDelta);
    pinchedGroup.rotate(rotationDelta);

    pinchedGroup.data.scale *= scaleDelta;
    pinchedGroup.data.rotation += rotationDelta;
  }
}

function pinchEnd(event) {
  window.kan.lastEvent = event;
  let pinchedGroup = window.kan.pinchedGroup;
  let originalPosition = window.kan.originalPosition;
  let originalRotation = window.kan.originalRotation;
  let originalScale = window.kan.originalScale;

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

    console.log('final scale', pinchedGroup.data.scale);
    console.log(move);

    window.kan.moves.push(move);

    if (Math.abs(event.velocity) > 1) {
      // dispose of group offscreen
      throwPinchedGroup();
    }

    // if (config.runAnimations) {
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
  window.kan.pinching = false;
  setTimeout(function() {
    hammerManager.get('pan').set({enable: true});
  }, 250);
}

function throwPinchedGroup() {
  const velocityMultiplier = 25;
  const lastEvent = window.kan.lastEvent;
  const viewWidth = paper.view.viewSize.width;
  const viewHeight = paper.view.viewSize.height;
  let pinchedGroup = window.kan.pinchedGroup;

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
