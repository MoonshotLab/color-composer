require('hammerjs');

const config = require('./../../config');
const sound = require('./sound');
const color = require('./color');
const shape = require('./shape');
const util = require('./util');

const canvas = document.getElementById(config.canvasId);

const hitOptions = {
  segments: false,
  stroke: true,
  fill: true,
  tolerance: 5
};

let hammerManager;
let outerPath;
let sizes;
let cumSize;
let prevPoint;

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

function singleTap(event) {
  console.log('singleTap');
  sound.stopPlaying();

  const pointer = event.center,
      point = new Point(pointer.x, pointer.y),
      hitResult = paper.project.hitTest(point, hitOptions);

  if (hitResult) {
    let item = hitResult.item;
    item.selected = !item.selected;
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
  console.log('---------------PANSTART---------------');
  paper.project.activeLayer.removeChildren(); // REMOVE
  outerPath = new Path();
  // outerPath.selected = true;
  outerPath.fillColor = new Color(0, 0, 0, 0.2);
  // outerPath.fillColor = {
  //       gradient: {
  //           stops: ['yellow', 'red', 'blue']
  //       },
  //       origin: new Point(0, 0),
  //       destination: new Point(500, 500)
  //   };
  outerPath.shadowColor = new Color(0, 0, 0, 0.5);
  outerPath.shadowBlur = 2;
  outerPath.shadowOffset = -1;
  // outerPath.fillColor = window.kan.currentColor;

  sizes = [];

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
  outerPath.add(point);

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
  let size;
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
  
  while (sizes.length > 10) {
    sizes.shift();
  }
  if (sizes.length > 0) {
    const dist = prevPoint.getDistance(point);

    // These are based on acceleration
    // size = 30 - Math.min(dist * 0.3, 30);
    // size = dist * 3 + 5;
    size = Math.random() * 10; // This is just random variance

    cumSize = 0;
    for (let j = 0; j < sizes.length; j++) {
      cumSize += sizes[j];
    }
    // const avgSize = ((cumSize / sizes.length) + size) / 2;
    const avgSize = Math.max(5, ((cumSize / sizes.length) + size) / 2);

    const halfPointX = (point.x + prevPoint.x) / 2;
    const halfPointY = (point.y + prevPoint.y) / 2;
    const halfPoint = new Point(halfPointX, halfPointY);
    
    const topX = halfPoint.x + Math.cos(angle - Math.PI/2) * avgSize;
    const topY = halfPoint.y + Math.sin(angle - Math.PI/2) * avgSize;
    const top = new Point(topX, topY);
    
    const bottomX = halfPoint.x + Math.cos(angle + Math.PI/2) * avgSize;
    const bottomY = halfPoint.y + Math.sin(angle + Math.PI/2) * avgSize;
    const bottom = new Point(bottomX, bottomY);

    outerPath.add(top);
    outerPath.insert(0, bottom);
    outerPath.smooth();
    
    // // Debug info
    // const connectorLine = new Path.Line(top, bottom);
    // connectorLine.strokeWidth = 1;
    // connectorLine.strokeColor = 'red';
    // const arrowStart = halfPoint;
    // const arrowEndX = halfPoint.x + Math.cos(angle) * 10;
    // const arrowEndY = halfPoint.y + Math.sin(angle) * 10;
    // const arrowEnd = new Point(arrowEndX, arrowEndY);
    // const arrow = new Path.Line(arrowStart, arrowEnd);
    // arrow.strokeWidth = 1;
    // arrow.strokeColor = 'green';
  } else {
    size = 5;
  }

  const pointDistance = point.getDistance(window.kan.corners[window.kan.corners.length - 1]);
  if ((angleDelta > thresholdAngleRad)) {
    if (side.length > 0) {
      // console.log('corner');
      let cornerPoint = point;
      if (pointDistance > thresholdLength) {
        // Debug: draw a circle when a corner has been detected
        new Path.Circle({
          center: cornerPoint,
          radius: 20,
          fillColor: new Color(0, 1, 0, 0.5)
        });
        window.kan.corners.push(cornerPoint);
        sides.push(side);
        side = [];
      }
    }
  }

  side.push(point);
  
  prevPoint = point;
  sizes.push(size);

  window.kan.pathData[shape.stringifyPoint(point)] = {
    point: point,
    speed: Math.abs(event.velocity),
    angle: angle
  };
  // console.log('velocity: ', event.velocity);
  // console.log('overallVelocity: ', event.overallVelocity);

  window.kan.shapePath.add(point);
  window.kan.sides = sides;
  window.kan.side = side;

  paper.view.draw();
}

function panEnd(event) {
  if (window.kan.pinching) return;

  const pointer = event.center;
  const point = new Point(pointer.x, pointer.y);

  const transparent = color.transparent;
  const colorName = color.getColorName(window.kan.currentColor);

  let shapePath = window.kan.shapePath;
  let side = window.kan.side;
  let sides = window.kan.sides;
  let corners = window.kan.corners;

  shapePath.add(point);
  outerPath.add(point);
  // outerPath.visible = false;
  // outerPath.closed = true;
  // outerPath.smooth();
  // outerPath.simplify();
  // TODO: define proper gradients
  // outerPath.fillColor = {
  //       gradient: {
  //           stops: ['yellow', 'red', 'blue']
  //       },
  //       origin: new Point(0, 0),
  //       destination: new Point(500, 500)
  //   };
  outerPath.fillColor = new Color(0, 0, 0, 0.4);

  let truedShape = shape.getTruedShape(shapePath);
  shapePath.remove();
  truedShape.visible = false;

  let shapeSoundObj = sound.getShapeSoundObj(truedShape);
  window.kan.composition.push(shapeSoundObj);

  side.push(point);
  sides.push(side);
  corners.push(point);

  let group = new Group();
  // group.data.color = {
  //       gradient: {
  //           stops: ['yellow', 'red', 'blue']
  //       },
  //       origin: new Point(0, 0),
  //       destination: new Point(500, 500)
  //   };
  group.data.color = new Color(1, 1, 1, 0.5);
  group.data.scale = 1; // init variable to track scale changes
  group.data.rotation = 0; // init variable to track rotation changes

  // group.addChild(outerPath);
  
  truedShape.fillColor = group.data.color;
  truedShape.strokeColor = group.data.color;
  group.addChild(truedShape);
  let enclosedLoops = shape.findInteriorCurves(truedShape);
  Base.each(enclosedLoops, (loop, i) => {
    group.addChild(loop);
    loop.sendToBack();
  });

  window.kan.shapePath = shapePath;
  window.kan.side = side;
  window.kan.sides = sides;
  window.kan.corners = corners;

  window.kan.pathData[shape.stringifyPoint(point)] = {
    point: point,
    last: true
  };
  
  // outerPath.fillColor = new Color(0, 0, 0, 0.1);
  // group.addChild(outerPath);
  // outerPath.sendToBack();

  // TODO: run through this to true the straight edges
  outerPath.fillColor = new Color(0, 0, 0, 0.1);
  const truedOuterPath = shape.getTruedOuterPath(truedShape);
  // truedOuterPath.fillColor = 'red';
  group.addChild(truedOuterPath);
  truedOuterPath.sendToBack();
  // truedOuterPath.fullySelected = true;
  truedOuterPath.selected = true;

  window.kan.moves.push({
    type: 'newGroup',
    id: group.id
  });

  if (config.runAnimations) {
    let scaleFactor = 0.9
    group.animate(
      [{
        properties: {
          scale: scaleFactor
        },
        settings: {
          duration: 100,
          easing: "easeOut",
        }
      },
      {
        properties: {
          scale: 1 / scaleFactor
        },
        settings: {
          duration: 100,
          easing: "easeIn",
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

  console.log('---------------PANEND---------------');
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
  event.preventDefault();

  const viewWidth = paper.view.viewSize.width;
  const viewHeight = paper.view.viewSize.height;
  let pinchedGroup = window.kan.pinchedGroup;

  if (!!pinchedGroup) {
    let currentScale = event.scale;
    let scaleDelta;

    if (pinchedGroup.bounds.width < paper.view.viewSize.width &&
        pinchedGroup.bounds.height < paper.view.viewSize.height) {
        // only allow shape to scale if it fits in the viewport
        scaleDelta = currentScale / window.kan.lastScale;
      } else {
        scaleDelta = 0.99;
      }

    window.kan.lastScale = currentScale;

    let currentRotation = event.rotation;
    let rotationDelta = currentRotation - window.kan.lastRotation;
    window.kan.lastRotation = currentRotation;

    // console.log(`scaling by ${scaleDelta}`);
    // console.log(`rotating by ${rotationDelta}`);

    pinchedGroup.position = event.center;
    if (scaleDelta !== 1) {
      pinchedGroup.scale(scaleDelta);
    }
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
