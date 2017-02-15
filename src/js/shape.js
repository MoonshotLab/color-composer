const ShapeDetector = require('./lib/shape-detector');

const util = require('./util');
const color = require('./color');

export const cornerThresholdDeg = 50;
// export const cornerThresholdDeg = 30;
export const thresholdDistMultiplier = 0.1;

export const detector = new ShapeDetector(ShapeDetector.defaultShapes);

export const shapeNames = {
  "line": {
    sprite: true,
  },
  "circle": {
    sprite: true,
  },
  "square": {
    sprite: true,
  },
  "triangle": {
    sprite: true,
  },
  "other": {
    sprite: true,
  }
};

export function addTestShape(truedShape) {
  console.log('--- addTestShape begin ---');
  console.log('truedShape', truedShape);
  truedShape.visible = false;

  let shapeJSON = truedShape.exportJSON();
  let shapeData = processShapeData(shapeJSON);
  console.log('shapeData', shapeData);

  let pathData = window.kan.pathData;
  console.log('pathData', pathData);

  let corners = window.kan.corners;
  console.log('corners', corners);

  let sides = window.kan.sides;
  console.log('sides', sides);


  // Calculate average speed for one side
  const sideSpeeds = [];
  sides.forEach((side, index) => {
    let minSpeed = 100;
    let maxSpeed = 0;
    side.forEach((point, pointIndex) => {
      const speed = pathData[stringifyPoint(point)].speed;
      if (typeof(speed) === 'undefined') { // FIXME: figure out why these are undefined. Maybe a simplified point?
        return;
      }
      minSpeed = Math.min(pathData[stringifyPoint(point)].speed, minSpeed);
      maxSpeed = Math.max(pathData[stringifyPoint(point)].speed, maxSpeed);
    });
    sideSpeeds.push({
      minSpeed: minSpeed,
      maxSpeed: maxSpeed
    });
  });
  // End calculating side speeds

  // Split paths at each corner
  const sidePaths = [];
  let pathRemainder = truedShape.clone({insert: true});
  // pathRemainder.selected = true;
  corners.forEach((corner, cornerIndex) => {
    // Don't split the first
    if (cornerIndex == 0) {
      return;
    }

    // Here's where we're splitting the path
    const nearestLocation = pathRemainder.getNearestLocation(corner);

    const pathSegment = pathRemainder.splitAt(nearestLocation);
    if (pathSegment === null) {
      console.log('%c no pathSegment', 'color: red;');
      return;
    }

    const sidePath = pathRemainder.clone({insert: true});
    sidePaths.push(sidePath);
    pathRemainder.remove();
    pathRemainder = pathSegment.clone({insert: true});
  });
  sidePaths.push(pathRemainder);
  console.log('split sidePaths', sidePaths);
  // End splitting path at corners


  // Start recreating a shape based on the sides
  const guessedSides = [];
  sidePaths.forEach((sidePath, sidePathIndex) => {
    console.log('------- sidePath -----');
    const firstPoint = sidePath.firstSegment.point;
    const lastPoint = sidePath.lastSegment.point;

    const calcLength = corners[sidePathIndex].getDistance(corners[sidePathIndex + 1]);
    // console.log(`  ${sidePathIndex} length`, sidePath.length);
    // console.log(`  calculated length`, calcLength);

    // Find straights and curves
    // TODO: determine best margin of error for distance
    if (sidePath.length > (calcLength * 0.9) && sidePath.length < (calcLength * 1.1)) {
      // This is probably a straight line
      // console.log('Guessed a straight line between', firstPoint, lastPoint);
      var path = new Path.Line(firstPoint, lastPoint);
      
      guessedSides.push({
        type: 'line',
        path: path,
        minSpeed: sideSpeeds[sidePathIndex].minSpeed,
        maxSpeed: sideSpeeds[sidePathIndex].maxSpeed,
      });
    } else {
      // Assume this is a curve
      if (sidePath.layer === null) {
        // no idea why the clone sometimes gets separated from the layer, but it happens if the curve does not self intersect
        window.kan.canvasLayer.addChild(sidePath);
      }

      // console.log('Guessed a curve. sidePath:', sidePath, sidePath.length);

      var path = sidePath.clone({insert: true});
      guessedSides.push({
        type: 'curve',
        path: path,
        minSpeed: sideSpeeds[sidePathIndex].minSpeed,
        maxSpeed: sideSpeeds[sidePathIndex].maxSpeed,
      });
    }
  });
  // console.log('guessedSides', guessedSides);
  // End recreating the shape


  const outerPath = new Path();

  // Now calculate thicker line points from each side
  guessedSides.forEach((guessedSide, guessedSideIndex) => {
    console.log('---');
    console.log('guessedSide', guessedSide);

    // pathData[stringifyPoint(point)].speed

    if (guessedSide.type == 'line') {
      // Line
      console.log('real side', sides[guessedSideIndex]);
      let currentPosition = 0;
      
      sides[guessedSideIndex].forEach((point, pointIndex) => {
        // let pointSpeed = pathData[stringifyPoint(point)].speed;
        // console.log('pointSpeed', pointSpeed);
        
        const angle = pathData[stringifyPoint(point)].angle;
        const pointSpeed = pathData[stringifyPoint(point)].speed;

        const avgSize = Math.max(5, 30 - (10 * pointSpeed));

        const bottomX = point.x + Math.cos(angle + Math.PI/2) * avgSize;
        const bottomY = point.y + Math.sin(angle + Math.PI/2) * avgSize;
        const bottom = new Point(bottomX, bottomY);
        outerPath.add(bottom);

        const topX = point.x + Math.cos(angle - Math.PI/2) * avgSize;
        const topY = point.y + Math.sin(angle - Math.PI/2) * avgSize;
        const top = new Point(topX, topY);
        outerPath.insert(0, top);
        
        // Debug: draw a connector line
        // const connectorLine = new Path.Line(top, bottom);
        // connectorLine.strokeWidth = 2;
        // connectorLine.strokeColor = 'black';

        // new Path.Circle({
        //   center: point,
        //   radius: avgSize,
        //   fillColor: new Color(1, 0, 0, 0.1),
        // });
        
        currentPosition += 0.1;
      });
    } else {
      // Curve
      console.log('real side', sides[guessedSideIndex]);
      let currentPosition = 0;

      sides[guessedSideIndex].forEach((point, pointIndex) => {
        const angle = pathData[stringifyPoint(point)].angle;
        const pointSpeed = pathData[stringifyPoint(point)].speed;
        const maxSpeed = sideSpeeds[guessedSideIndex].maxSpeed;
        const minSpeed = sideSpeeds[guessedSideIndex].minSpeed;
        const deltaSpeed = maxSpeed - minSpeed;
        // console.log(`${pointIndex}: min:${minSpeed} max:${maxSpeed}`);
        
        // const percentage = sidePaths[guessedSideIndex].getNearestLocation(pathData[stringifyPoint(point)].point);
        // const currentPosition = percentage.time;
        // console.log('point:', pathData[stringifyPoint(point)].point);

        // const avgSize = currentPosition * deltaSpeed + minSpeed;
        const avgSize = 10;

        const topX = point.x + Math.cos(angle - Math.PI/2) * avgSize;
        const topY = point.y + Math.sin(angle - Math.PI/2) * avgSize;
        const top = new Point(topX, topY);

        const bottomX = point.x + Math.cos(angle + Math.PI/2) * avgSize;
        const bottomY = point.y + Math.sin(angle + Math.PI/2) * avgSize;
        const bottom = new Point(bottomX, bottomY);

        outerPath.add(top);
        outerPath.insert(0, bottom);


        // Debug: draw a connector line
        // const connectorLine = new Path.Line(top, bottom);
        // connectorLine.strokeWidth = 2;
        // connectorLine.strokeColor = 'red';

        // new Path.Circle({
        //   center: point,
        //   radius: avgSize,
        //   fillColor: new Color(1, 0, 0, 0.2),
        // });

        currentPosition += 0.1; // FIXME: this'll get way out of whack quickly
      });
    }
  });
  // End calculating thicker line points
  
  // console.log('pathData', pathData);
  // Add first and last points
  for (let point in pathData) {
    if (pathData[point].first) {
      // outerPath.add(pathData[point].point);
      // topPath.add(pathData[point].point);
    }
    if (pathData[point].last) {
      // outerPath.insert(0, pathData[point].point);
      outerPath.add(pathData[point].point);
    }
  }
  outerPath.closed = true;
  // outerPath.simplify();
  console.log('post simplify', outerPath);
  // outerPath.smooth({type: 'continuous'});
  outerPath.selected = true;
  outerPath.fillColor = new Color(0, 1, 0, 0.4);

  console.log('--- addTestShape end ---');
}

export function getTruedShape(path) {
  let pathClone = path.clone();
  pathClone.visible = false;
  let completedPath = getCompletedPath(pathClone);
  // console.log('completedPath', completedPath);

  // true the path!
  let truedPath = completedPath;

  truedPath.strokeWidth = pathClone.strokeWidth;

  pathClone.remove();
  return truedPath;
}

// extend or trim path if the ends are close
export function getCompletedPath(path) {
  let pathClone = path.clone();
  pathClone.visible = false;
  pathClone.reduce();
  pathClone.simplify();

  let intersections = pathClone.getIntersections();

  if (intersections.length > 0) {
    // trim path if ends are close
    let trimmedPath = getTrimmedPath(pathClone);

    pathClone.remove();

    return trimmedPath;
  } else {
    // extend path to see if an intersection is near
    let extendedPath = getExtendedPath(pathClone);
    let intersections = extendedPath.getIntersections();

    pathClone.remove();

    if (intersections.length > 0) {
      // trim extra extended path
      let trimmedPath = getTrimmedPath(extendedPath);
      extendedPath.remove();
      return trimmedPath;
    } else {
      // extended path does not intersect, return the original path
      return pathClone;
    }
  }
}

export function getShapePrediction(path) {
  let prediction = {};

  let shapeJSON = path.exportJSON();
  let shapeData = processShapeData(shapeJSON);
  let shapePrediction = detector.spot(shapeData);

  if (shapePrediction.score > 0.5) {
    prediction.pattern = shapePrediction.pattern;
  } else {
    prediction.pattern = "other";
  }
  prediction.score = shapePrediction.score;

  return prediction;
}

// floors the coordinates of a point
export function getIntegerPoint(point) {
  return new Point(Math.floor(point.x), Math.floor(point.y));
}

export function stringifyPoint(point) {
  return `${Math.floor(point.x)},${Math.floor(point.y)}`;
}

export function parsePoint(pointStr) {
  let split = pointStr.split(',').map((num) => Math.floor(num));

  if (split.length >= 2) {
    return new Point(split[0], split[1]);
  }

  return null;
}

export function getClosestPointFromPathData(point, pathData) {
  let leastDistance, closestPoint;

  Base.each(pathData, (datum, i) => {
    let distance = point.getDistance(datum.point);
    if (!leastDistance || distance < leastDistance) {
      leastDistance = distance;
      closestPoint = datum.point;
    }
  });

  return closestPoint || point;
}

export function processShapeData(json) {
  let returnShape = [];
  let jsonObj = JSON.parse(json)[1]; // zero index is stringified type (e.g. "Path")

  if ('segments' in jsonObj) {
    let segments = jsonObj.segments;
    Base.each(segments, (segment, i) => {
      if (segment.length === 3) {
        let positionInfo = segment[0]; // indexes 1 and 2 are superfluous matrix details
        returnShape.push({
          x: positionInfo[0],
          y: positionInfo[1]
        })
      } else {
        returnShape.push({
          x: segment[0],
          y: segment[1]
        });
      };
    });
  }
  return returnShape;
}

export function findInteriorCurves(path) {
  const transparent = color.transparent;

  let interiorCurves = [];

  let pathClone = path.clone();
  let intersections = pathClone.getIntersections();

  if (intersections.length > 0) {
    let dividedPath = pathClone.resolveCrossings();
    // console.log(dividedPath);

    if (dividedPath.className === 'CompoundPath') {
      Base.each(dividedPath.children, (child, i) => {
        if (child.length > 0 && child.closed) {
          let enclosedLoop = child.clone({ insert: false });
          if (pathClone.closed) {
            enclosedLoop.fillColor = pathClone.strokeColor;
            enclosedLoop.data.interior = true;
            enclosedLoop.data.transparent = false;
          } else {
            enclosedLoop.fillColor = transparent;
            enclosedLoop.data.transparent = true;
          }
          enclosedLoop.data.interior = true;
          enclosedLoop.visible = true;
          enclosedLoop.closed = true;
          interiorCurves.push(enclosedLoop);
        }
      })
    } else {
      if (pathClone.closed) {
        let enclosedLoop = pathClone.clone({ insert: false });
        enclosedLoop.visible = true;
        enclosedLoop.fillColor = pathClone.strokeColor;
        enclosedLoop.data.interior = true;
        enclosedLoop.data.transparent = false;
        interiorCurves.push(enclosedLoop);
      }
    }
  } else {
    if (pathClone.closed) {
      let enclosedLoop = pathClone.clone({ insert: false });
      enclosedLoop.visible = true;
      enclosedLoop.fillColor = pathClone.strokeColor;
      enclosedLoop.data.interior = true;
      enclosedLoop.data.transparent = false;
      interiorCurves.push(enclosedLoop);
    }
  }

  pathClone.remove();

  return interiorCurves;
}

export function getExtendedPath(path) {
  let extendedPath = path.clone();
  extendedPath.visible = false;

  const thresholdDist = thresholdDistMultiplier * extendedPath.length;

  const firstSegment = extendedPath.firstSegment;
  const nextSegment = firstSegment.next;
  const startAngle = Math.atan2(nextSegment.point.y - firstSegment.point.y, nextSegment.point.x - firstSegment.point.x); // rad
  const inverseStartAngle = startAngle + Math.PI;
  const extendedStartPoint = new Point(firstSegment.point.x + (Math.cos(inverseStartAngle) * thresholdDist / 2), firstSegment.point.y + (Math.sin(inverseStartAngle) * thresholdDist / 2));
  extendedPath.insert(0, extendedStartPoint);

  const lastSegment = extendedPath.lastSegment;
  const penSegment = lastSegment.previous; // penultimate
  const endAngle = Math.atan2(lastSegment.point.y - penSegment.point.y, lastSegment.point.x - penSegment.point.x); // rad
  const extendedEndPoint = new Point(lastSegment.point.x + (Math.cos(endAngle) * thresholdDist / 2), lastSegment.point.y + (Math.sin(endAngle) * thresholdDist / 2));
  extendedPath.add(extendedEndPoint);

  return extendedPath;
}

export function getTrimmedPath(path) {
  let pathClone = path.clone();
  pathClone.visible = false;

  let firstPoint = pathClone.firstSegment.point;
  let lastPoint = pathClone.lastSegment.point;
  let thresholdDist = thresholdDistMultiplier * pathClone.length;

  let intersections = pathClone.getIntersections();

  if (intersections.length > 0) {
    for (let i = 0; i < intersections.length; i++) {
      let intersectionPoint = intersections[i].point;

      // if the average of the distance between the first and last points and the intersection point is within the threshold, trim
      if (firstPoint.getDistance(intersectionPoint) + lastPoint.getDistance(intersectionPoint) < 2 * thresholdDist) {
        console.log('trimming path');
        let dividedPath = pathClone.clone(); // resolve crossings seems to modify the path it was passed, so make an extra clone to be safe
        dividedPath.visible = false;
        let pathCrossings = dividedPath.resolveCrossings();

        if (pathCrossings.className === 'CompoundPath' && pathCrossings.children.length > 0) {
          for (let j = 0; j < pathCrossings.children.length; j++) {
            let child = pathCrossings.children[j];
            if (child.closed) {
              // child.selected = true;
              dividedPath = dividedPath.subtract(child);
            }
          }
        }

        // dividedPath.selected = true;

        let trimmedPath = pathClone.subtract(dividedPath);
        if (trimmedPath.className === 'CompoundPath' && trimmedPath.children.length > 0) {
          let closedChildren = [];
          trimmedPath.children.forEach((child, i) => {
            if (child.length > 0 && child.closed) {
              let childClone = child.clone();
              childClone.visible = false;
              closedChildren.push(childClone);
            }
          });

          if (closedChildren.length > 0) {
            if (closedChildren.length > 1) {
              // for some reason there are more than one closed children, merge them
              let accumulator = closedChildren[0];

              for (let j = 1; j < closedChildren.length; j++) {
                accumulator = accumulator.unite(closedChildren[j]);
              }

              if (accumulator.length > 0 && accumulator.className === 'Path') {
                console.log('trimmed accumulator', accumulator);
                let newPath = new Path();
                newPath.copyContent(accumulator);
                newPath.copyAttributes(pathClone);
                accumulator.remove();
                pathClone.remove();
                dividedPath.remove();
                trimmedPath.remove();
                return newPath;
              }
            }

            pathClone.remove();
            dividedPath.remove();
            trimmedPath.remove();
            console.log('trimmed closedChildren[0]', closedChildren[0]);
            return closedChildren[0];
          }
        }

        console.log('trimmed path return', trimmedPath);
        console.log('path clone', pathClone);
        console.log('dividedPath', dividedPath);
        pathClone.remove();
        dividedPath.remove();
        return trimmedPath;
      }
    }

    // no close intersection were found so nothing can be trimmed
    return pathClone;
  } else {
    return pathClone;
  }
}

export function hitTestBounds(point, children) {
  if (!point) return null;

  for (let i = children.length - 1; i >= 0; i--) {
    let child = children[i];
    let bounds = child.strokeBounds;
    if (point.isInside(child.strokeBounds)) {
      return child;
    }
  }

  return null;
}
