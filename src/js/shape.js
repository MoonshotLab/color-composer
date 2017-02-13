const ShapeDetector = require('./lib/shape-detector');

const util = require('./util');
const color = require('./color');

export const cornerThresholdDeg = 30;
export const thresholdDistMultiplier = 0.1;

export const detector = new ShapeDetector(ShapeDetector.defaultShapes);

export const shapeNames = ["line", "circle", "square", "triangle", "other"];

export function getTruedShape(path) {
  let pathClone = path.clone();
  pathClone.visible = false;
  let completedPath = getCompletedPath(pathClone);

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
  // console.log(JSON.stringify(shapeData));
  let shapePrediction = detector.spot(shapeData);

  if (shapePrediction.score === 0) {
    // algorithm doesn't like vertical lines for some reason
    // if the certainty is 0 it's probably a line
    prediction.pattern = "line";
    prediction.score = 0.9;
  } else {
    if (shapePrediction.score > 0.5) {
      prediction.pattern = shapePrediction.pattern;
    } else {
      prediction.pattern = "other";
    }
    prediction.score = shapePrediction.score;
  }

  console.log(prediction);

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

  let pathClone = path.clone({ insert: false });
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

        dividedPath.selected = true;

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
