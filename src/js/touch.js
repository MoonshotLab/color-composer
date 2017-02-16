require('hammerjs');

const config = require('./../../config');
const sound = require('./sound');
const color = require('./color');
const shape = require('./shape');
const util = require('./util');
const tutorial = require('./tutorial');
const timing = require('./timing');
const overlays = require('./overlays');
const ui = require('./ui');

const canvas = document.getElementById(config.canvasId);

const $body = $('body');

const hitOptions = {
  segments: false,
  stroke: true,
  fill: true,
  tolerance: 5
};

const minShapeSize = 50;

export let hammerManager;

export function init() {
  const body = document.getElementById('body');
  hammerManager = new Hammer.Manager(body);
  // hammerManager = new Hammer.Manager(canvas);

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
  if (!eventTargetIsOnCanvas(event)) return;
  console.log(event);

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

  if (!eventTargetIsOnCanvas(event)) return;

  const transparent = color.transparent;

  if (hitResult) {
    let item = hitResult.item;
    let parent = item.parent;

    tutorial.hideContextualTutByName('fill');

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

  if (!eventTargetIsOnCanvas(event)) return;

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

  // window.kan.corners = [point];

  // window.kan.sides = [];
  // window.kan.side = [point];

  window.kan.pathData[shape.stringifyPoint(point)] = {
    point: point,
    first: true
  };

  window.kan.shapePath = shapePath;
}

function panMove(event) {
  event.preventDefault();
  if (window.kan.pinching) return;

  if (!eventTargetIsOnCanvas(event)) return;

  const thresholdAngleRad = util.rad(shape.cornerThresholdDeg);

  const pointer = event.center;
  let point = new Point(pointer.x, pointer.y);

  let angle = Math.atan2(event.velocityY, event.velocityX);
  let prevAngle = window.kan.prevAngle;
  let angleDelta = util.angleDelta(angle, prevAngle);
  window.kan.prevAngle = angle;

  // let side = window.kan.side;
  // let sides = window.kan.sides;

  // if (angleDelta > thresholdAngleRad) {
  //   if (side.length > 0) {
  //     // console.log('corner');
  //     let cornerPoint = point;
  //     // new Path.Circle({
  //     //   center: cornerPoint,
  //     //   radius: 15,
  //     //   strokeColor: 'black'
  //     // });
  //     // window.kan.corners.push(cornerPoint);
  //     sides.push(side);
  //     side = [];
  //   }
  // }

  // side.push(point);

  window.kan.pathData[shape.stringifyPoint(point)] = {
    point: point,
    speed: Math.abs(event.overallVelocity),
    angle: angle
  };

  window.kan.shapePath.add(point);
  // window.kan.sides = sides;
  // window.kan.side = side;

  paper.view.draw();
}

function panEnd(event) {
  if (window.kan.pinching) return;
  if (!eventTargetIsOnCanvas(event)) return;

  const pointer = event.center;
  const point = new Point(pointer.x, pointer.y);

  const transparent = color.transparent;
  const colorName = color.getColorName(window.kan.currentColor);

  let shapePath = window.kan.shapePath;
  // let side = window.kan.side;
  // let sides = window.kan.sides;
  // let corners = window.kan.corners;

  shapePath.add(point);

  if (shapePath.length < minShapeSize) {
    console.log('path is too short');
    shapePath.remove();
    return;
  }

  window.kan.pathData[shape.stringifyPoint(point)] = {
    point: point,
    last: true
  };

  let truedShape = shape.getTruedShape(shapePath);
  shapePath.remove();
  truedShape.visible = true;
  window.kan.shapePath = truedShape;

  // side.push(point);
  // sides.push(side);
  // corners.push(point);

  let group = new Group();
  group.data.color = truedShape.strokeColor;
  group.data.scale = 1; // init variable to track scale changes
  group.data.rotation = 0; // init variable to track rotation changes
  group.addChild(truedShape);

  let shapeSoundObj = sound.getShapeSoundObj(truedShape);
  window.kan.composition.push(shapeSoundObj);

  let enclosedLoops = shape.findInteriorCurves(truedShape);
  Base.each(enclosedLoops, (loop, i) => {
    group.addChild(loop);
    loop.sendToBack();
  });

  window.kan.moves.push({
    type: 'newGroup',
    id: group.id
  });

  ui.unditherUndoButton();

  if (window.kan.userHasDrawnFirstShape !== true) {
    // first shape!
    // set play prompt timeout
    window.kan.playPromptTimeout = setTimeout(() => {
      overlays.openOverlay('play-prompt');
    }, timing.playPromptDelay);

    window.kan.userHasDrawnFirstShape = true;
  } else {
    const groups = util.getAllGroups();
    if (groups.length >= 3 && !$body.hasClass(sound.playEnabledClass)) {
      $body.addClass(sound.playEnabledClass);
      ui.unditherPlayAndShareButtons();
    }
    console.log(groups.length, $body.hasClass(sound.playEnabledClass));
  }

  if (config.runAnimations) {
    const scaleFactor = 0.9;
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
      }]
    );
  }

  if (!tutorial.allTutsCompleted()) {
    const tutorialCompletion = window.kan.tutorialCompletion;
    let tutName = null;

    if (!tutorialCompletion['fill'] && truedShape.closed) {
      tutName = 'fill';
    } else {
      let groups = paper.project.getItems({
        match: function(el) {
          return el.className === 'Group'
        }
      });
      if (!tutorialCompletion['pinch'] && groups.length >= 3) {
        tutName = 'pinch';
      } else if (!tutorialCompletion['swipe'] && groups.length >= 5) {
        tutName = 'swipe';
      }
    }

    if (tutName !== null) {
      console.log(`${tutName} tutorial`);
      tutorial.addContextualTut(tutName);
      window.kan.tutorialCompletion[tutName] = true;
      group.data.tut = tutName;
    }
  }

  // window.kan.side = side;
  // window.kan.sides = sides;
  // window.kan.corners = corners;
}

function hitTestGroupBounds(point) {
  let groups = paper.project.getItems({
    className: 'Group'
  });
  return shape.hitTestBounds(point, groups);
}

function pinchStart(event) {
  if (!eventTargetIsOnCanvas(event)) return;

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

    if (hitResult.data.tut && hitResult.data.tut.length > 0) {
      let $tut = $(`.tut[data-tut-type='${hitResult.data.tut}']`);
      if ($tut) {
        window.kan.pinchedTut = $tut;
      } else {
        window.kan.pinchedTut = null;
      }
    } else {
      window.kan.pinchedTut = null;
    }

    // if (config.runAnimations) {
    //   hitResult.animate({
    //     properties: {
    //       scale: 1.25
    //     },
    //     settings: {
    //       duration: 100,
    //       easing: "easeOut",
    //     }
    //   });
    // }
  } else {
    window.kan.pinchedGroup = null;
    window.kan.pinchedTut = null;
    console.log('hit no item');
  }
}

function pinchMove(event) {
  event.preventDefault();

  const viewWidth = paper.view.viewSize.width;
  const viewHeight = paper.view.viewSize.height;
  let pinchedGroup = window.kan.pinchedGroup;
  let $pinchedTut = window.kan.pinchedTut;

  if (!!pinchedGroup) {
    let currentScale = event.scale;
    let scaleDelta;

    tutorial.hideContextualTutByName('pinch');

    if (pinchedGroup.bounds.width < minShapeSize || pinchedGroup.bounds.height < minShapeSize) {
      // only allow a shape to scale down if it is larger than the minimum size
      scaleDelta = 1.01;
    } else if (pinchedGroup.bounds.width >= paper.view.viewSize.width ||
        pinchedGroup.bounds.height >= paper.view.viewSize.height) {
      // only allow shape to scale up if it fits in the viewport
      scaleDelta = 0.99;
    } else {
      scaleDelta = currentScale / window.kan.lastScale;
    }

    window.kan.lastScale = currentScale;

    let currentRotation = event.rotation;
    let rotationDelta = currentRotation - window.kan.lastRotation;
    window.kan.lastRotation = currentRotation;

    // console.log(`scaling by ${scaleDelta}`);
    // console.log(`rotating by ${rotationDelta}`);

    const centerPoint = event.center;
    pinchedGroup.position = centerPoint;
    if (!!$pinchedTut) {
      tutorial.moveContextualTut($pinchedTut, centerPoint);
    }

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
  let $pinchedTut = window.kan.pinchedTut;
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
      tutorial.hideContextualTutByName('swipe');

      // hide any connected tuts
      if (!!$pinchedTut) {
        tutorial.hideContextualTut($pinchedTut);
      }
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
        sound.removeShapeFromComposition(pinchedGroup);
    return;
  }
  requestAnimationFrame(throwPinchedGroup);
  const newX = pinchedGroup.position.x + lastEvent.velocityX * velocityMultiplier;
  const newY = pinchedGroup.position.y + lastEvent.velocityY * velocityMultiplier;
  const newPos = new Point(newX, newY);
  pinchedGroup.position = newPos;
}

function eventTargetIsOnCanvas(event) {
  if (!event) return false;
  if (event.target != canvas) return false;
  return true;

}
