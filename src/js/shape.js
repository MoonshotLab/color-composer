const util = require('./util');
const config = require('./../../config');

function log(...thing) {
  util.log(...thing);
}

export function getStrokes(path, pathData) {
  let pathClone = path.clone();
  let strokes = new Path();

  const minSize = 1;
  const maxSize = 5;

  let prev;
  let firstPoint, lastPoint;

  let cumSpeed = 0;
  let totalPoints = 0;

  Base.each(pathClone.segments, (segment, i) => {
    let point = segment.point;
    let pointStr = stringifyPoint(point);
    let pointData;
    if (pointStr in pathData) {
      pointData = pathData[pointStr];
    } else {
      let nearestPoint = getClosestPointFromPathData(point, pathData);
      pointStr = stringifyPoint(nearestPoint);
      if (pointStr in pathData) {
        pointData = pathData[pointStr];
      } else {
        log('could not find close point');
      }
    }

    if (pointData) {
      console.log(pointData);
      let top, bottom;
      let bottomX, bottomY, topX, topY;
      if (pointData.speed) {
        cumSpeed += parseInt(pointData.speed * 10);
        totalPoints++;
      }
    }

    prev = point;
  });

  let avgSpeed = cumSpeed / totalPoints;
  console.log(avgSpeed);

  let size = avgSpeed;
  size = maxSize - size;
  size = Math.max(Math.min(size, maxSize), minSize); // clamp size to [min, max)

  let bigClone = path.clone();
  let smallClone = path.clone();
  bigClone.scale(1.5);
  smallClone.scale(0.5);

  let overlap = bigClone.subtract(smallClone);
  overlap.strokeColor = 'pink';

  console.log(size);


  // strokes.closed = true;
  // strokes.fillColor = 'pink';
  // strokes.selected = true;
  // strokes.reduce();

  return pathClone;
}

export function oldgetStrokes(path, pathData) {
  let pathClone = path.clone();
  let strokes = new Path();

  const minSize = 2;
  const maxSize = 8;

  let prev;
  let firstPoint, lastPoint;
  Base.each(pathClone.segments, (segment, i) => {
    let point = segment.point;
    let pointStr = stringifyPoint(point);
    let pointData;
    if (pointStr in pathData) {
      pointData = pathData[pointStr];
    } else {
      let nearestPoint = getClosestPointFromPathData(point, pathData);
      pointStr = stringifyPoint(nearestPoint);
      if (pointStr in pathData) {
        pointData = pathData[pointStr];
      } else {
        log('could not find close point');
      }
    }

    if (pointData) {
      console.log(pointData);
      let top, bottom;
      let bottomX, bottomY, topX, topY;
      if (pointData.first) {
        firstPoint = pointData.point;
        strokes.add(point);
      } else if (pointData.last) {
        lastPoint = pointData.point;
        strokes.add(point);
      } else {
        let angle = pointData.angle;
        let size = pointData.speed * 10;
        size = maxSize - size;
        size = Math.max(Math.min(size, maxSize), minSize); // clamp size to [min, max)
        console.log(size);

        let bottomX = point.x + Math.cos(angle + Math.PI/2) * size;
        let bottomY = point.y + Math.sin(angle + Math.PI/2) * size;
        let bottom = new Point(bottomX, bottomY);

        let topX = point.x + Math.cos(angle - Math.PI/2) * size;
        let topY = point.y + Math.sin(angle - Math.PI/2) * size;
        let top = new Point(topX, topY);

        strokes.add(top);
        strokes.insert(0, bottom);
      }
    }

    prev = point;
  });

  strokes.closed = true;
  strokes.fillColor = 'pink';
  strokes.selected = true;
  strokes.reduce();

  return pathClone;
}

export function getIdealGeometry(pathData, sides, simplifiedPath) {
  const thresholdDist = 0.05 * simplifiedPath.length;

  let returnPath = new Path({
    strokeWidth: 5,
    strokeColor: 'pink'
  });

  let truedPath = new Path({
    strokeWidth: 5,
    strokeColor: 'green'
  });

  // new Path.Circle({
  //   center: simplifiedPath.firstSegment.point,
  //   radius: 3,
  //   fillColor: 'black'
  // });

  let firstPoint = new Path.Circle({
    center: simplifiedPath.firstSegment.point,
    radius: 10,
    strokeColor: 'blue'
  });

  let lastPoint = new Path.Circle({
    center: simplifiedPath.lastSegment.point,
    radius: 10,
    strokeColor: 'red'
  });


  let angle, prevAngle, angleDelta;
  Base.each(sides, (side, i) => {
    let firstPoint = side[0];
    let lastPoint = side[side.length - 1];

    angle = Math.atan2(lastPoint.y - firstPoint.y, lastPoint.x - firstPoint.x);

    if (!!prevAngle) {
      angleDelta = util.angleDelta(angle, prevAngle);
      console.log(angleDelta);
      returnPath.add(firstPoint);
      returnPath.add(lastPoint);
    }

    prevAngle = angle;
  });

  Base.each(simplifiedPath.segments, (segment, i) => {
    let integerPoint = getIntegerPoint(segment.point);
    let nearestPoint = returnPath.getNearestPoint(integerPoint);
    // console.log(integerPoint.getDistance(nearestPoint), thresholdDist);
    if (integerPoint.getDistance(nearestPoint) <= thresholdDist) {
      truedPath.add(nearestPoint);
      new Path.Circle({
        center: nearestPoint,
        radius: 3,
        fillColor: 'black'
      });
    } else {
      console.log('off path');
      truedPath.add(integerPoint);
      new Path.Circle({
        center: integerPoint,
        radius: 3,
        fillColor: 'green'
      });
    }
  });

  // truedPath.add(simplifiedPath.lastSegment.point);
  // new Path.Circle({
  //   center: simplifiedPath.lastSegment.point,
  //   radius: 3,
  //   fillColor: 'black'
  // });

  if (simplifiedPath.closed) {
    truedPath.closed = true;
  }

  // Base.each(truedPath, (point, i) => {
  //   truedPath.removeSegment(i);
  // });

  return truedPath;
}

export function OldgetIdealGeometry(pathData, path) {
  const thresholdAngle = Math.PI / 2;
  const thresholdDist = 0.1 * path.length;
  // log(path);

  let count = 0;

  let sides = [];
  let side = [];
  let prev;
  let prevAngle;

  // log('thresholdAngle', thresholdAngle);

  let returnPath = new Path();

  Base.each(path.segments, (segment, i) => {
    let integerPoint = getIntegerPoint(segment.point);
    let pointStr = stringifyPoint(integerPoint);
    let pointData;
    if (pointStr in pathData) {
      pointData = pathData[pointStr];
    } else {
      let nearestPoint = getClosestPointFromPathData(pathData, integerPoint);
      pointStr = stringifyPoint(nearestPoint);

      if (pointStr in pathData) {
        pointData = pathData[pointStr];
      } else {
        log('could not find close point');
      }
    }

    if (pointData) {
      returnPath.add(integerPoint);
      new Path.Circle({
        center: integerPoint,
        radius: 5,
        strokeColor: new Color(i / path.segments.length, i / path.segments.length, i / path.segments.length)
      });
      log(pointData.point);
      if (!prev) {
        // first point
        // log('pushing first point to side');
        side.push(pointData);
      } else {
        // let angleFoo = integerPoint.getDirectedAngle(prev);
        let angle = Math.atan2(integerPoint.y, integerPoint.x) - Math.atan2(prev.y, prev.x);
        if (angle < 0) angle += (2 * Math.PI); // normalize to [0, 2π)
        // log(angleFoo, angleBar);
        // let angle = Math.atan2(integerPoint.y - prev.y, integerPoint.x - prev.x);
        // let line = new Path.Line(prev, integerPoint);
        // line.strokeWidth = 5;
        // line.strokeColor = 'pink';
        // line.rotate(util.deg(Math.cos(angle) * Math.PI * 2));
        // log('angle', angle);
        if (typeof prevAngle === 'undefined') {
          // second point
          side.push(pointData)
        } else {
          let angleDifference = Math.pow(angle - prevAngle, 2);
          log('angleDifference', angleDifference);
          if (angleDifference <= thresholdAngle) {
            // same side
            // log('pushing point to same side');
            side.push(pointData);
          } else {
            // new side
            // log('new side');
            sides.push(side);
            side = [pointData];

          }
        }

        prevAngle = angle;
      }

      prev = integerPoint;
      count++;
    } else {
      log('no data');
    }
  });

  // log(count);

  sides.push(side);

  return sides;
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

export function getComputedCorners(path) {
  const thresholdAngle = util.rad(config.shape.cornerThresholdDeg);
  const thresholdDistance = 0.1 * path.length;

  let corners = [];

  if (path.length > 0) {
    let point, prev;
    let angle, prevAngle, angleDelta;

    Base.each(path.segments, (segment, i) => {
      let point = getIntegerPoint(segment.point);
      if (!!prev) {
        let angle = Math.atan2(point.y - prev.y, point.x - prev.x);
        if (angle < 0) angle += (2 * Math.PI); // normalize to [0, 2π)
        if (!!prevAngle) {
          angleDelta = util.angleDelta(angle, prevAngle);
          if (angleDelta >= thresholdAngle) {
            // console.log('corner');
            // new Path.Circle({
            //   center: prev,
            //   radius: 10,
            //   fillColor: 'pink'
            // });
            corners.push(prev);
          } else {
            // console.log(angleDelta);
          }
        }

        prevAngle = angle;
      } else {
        // first point
        corners.push(point);
        // new Path.Circle({
        //   center: point,
        //   radius: 10,
        //   fillColor: 'pink'
        // })
      }
      prev = point;
    });

    let lastSegmentPoint = getIntegerPoint(path.lastSegment.point);
    corners.push(lastSegmentPoint);

    let returnCorners = [];
    let skippedIds = [];
    for (let i = 0; i < corners.length; i++) {
      let point = corners[i];

      if (i !== 0) {
        let dist = point.getDistance(prev);
        let closestPoints = [];
        while (dist < thresholdDistance) {
          closestPoints.push({
            point: point,
            index: i
          });

          if (i < corners.length - 1) {
            i++;
            prev = point;
            point = corners[i];
            dist = point.getDistance(prev);
          } else {
            break;
          }
        }
        if (closestPoints.length > 0) {
          let [sumX, sumY] = [0, 0];

          Base.each(closestPoints, (pointObj) => {
            sumX += pointObj.point.x;
            sumY += pointObj.point.y;
          });


          let [avgX, avgY] = [sumX / closestPoints.length, sumY / closestPoints.length];
          returnCorners.push(new Point(avgX, avgY));
        }
      } else {
        returnCorners.push(point);
      }

      prev = point;
    }

    return returnCorners;
  }

  return corners;
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

// returns an array of the interior curves of a given compound path
export function findInteriorCurves(path) {
  let interiorCurves = [];
  let pathClone = path.clone();
  let dividedPath = pathClone.resolveCrossings();
  console.log(dividedPath);

  if (dividedPath.children.length > 0) {
    for (let i = 0; i < dividedPath.children.length; i++) {
      let child = dividedPath.children[i];

      if (child.closed){
        interiorCurves.push(child);
      }
    }
  }

  console.log('interior', interiorCurves);

  return interiorCurves;
}

export function trueGroup(group, corners) {
  let shapePath = group._namedChildren.shapePath[0];
  console.log('num corners', corners.length);

  let intersections = shapePath.getIntersections();
  let trueNecessary = false;

  let pathCopy = shapePath.clone();
  pathCopy.visible = false;
  // debugger;

  if (intersections.length > 0) {
    // see if we can trim the path while maintaining intersections
    // log('intersections!');
    // pathCopy.strokeColor = 'yellow';
    [pathCopy, trueNecessary] = trimPath(pathCopy, shapePath);
    // pathCopy.strokeColor = 'orange';
  } else {
    // extend first and last segment by threshold, see if intersection
    // log('no intersections, extending first!');
    // pathCopy.strokeColor = 'yellow';
    pathCopy = extendPath(pathCopy);
    // pathCopy.strokeColor = 'orange';
    let intersections = pathCopy.getIntersections();
    if (intersections.length > 0) {
      // pathCopy.strokeColor = 'pink';
      [pathCopy, trueNecessary] = trimPath(pathCopy, shapePath);
      // pathCopy.strokeColor = 'green';
    } else {
      // pathCopy.strokeColor = 'red';
      pathCopy = removePathExtensions(pathCopy);
      // pathCopy.strokeColor = 'blue';
    }
  }

  console.log('original length:', shapePath.length);
  console.log('trued length:', pathCopy.length);

  pathCopy.name = 'shapePath'; // make sure
  pathCopy.visible = true;

  // group.addChild(pathCopy);
  // group._namedChildren.shapePath[0] = pathCopy;
  group._namedChildren.shapePath[0].replaceWith(pathCopy);


  return [group, trueNecessary];
}

export function extendPath(path) {
  if (path.length > 0) {
    const lengthTolerance = config.shape.trimmingThreshold * path.length;

    let firstSegment = path.firstSegment;
    let nextSegment = firstSegment.next;
    let startAngle = Math.atan2(nextSegment.point.y - firstSegment.point.y, nextSegment.point.x - firstSegment.point.x); // rad
    let inverseStartAngle = startAngle + Math.PI;
    let extendedStartPoint = new Point(firstSegment.point.x + (Math.cos(inverseStartAngle) * lengthTolerance), firstSegment.point.y + (Math.sin(inverseStartAngle) * lengthTolerance));
    path.insert(0, extendedStartPoint);

    let lastSegment = path.lastSegment;
    let penSegment = lastSegment.previous; // penultimate
    let endAngle = Math.atan2(lastSegment.point.y - penSegment.point.y, lastSegment.point.x - penSegment.point.x); // rad
    let extendedEndPoint = new Point(lastSegment.point.x + (Math.cos(endAngle) * lengthTolerance), lastSegment.point.y + (Math.sin(endAngle) * lengthTolerance));
    path.add(extendedEndPoint);
  }
  return path;
}

export function trimPath(path, original) {
  // originalPath.strokeColor = 'pink';
  try {
    let intersections = path.getIntersections();
    let dividedPath = path.resolveCrossings();

    if (intersections.length > 1) {
      return [original, false]; // more than one intersection, don't worry about trimming
    }

    const extendingThreshold = config.shape.extendingThreshold;
    const totalLength = path.length;

    // we want to remove all closed loops from the path, since these are necessarily interior and not first or last
    Base.each(dividedPath.children, (child, i) => {
      if (child.closed) {
        // log('subtracting closed child');
        dividedPath = dividedPath.subtract(child);
      } else {
        // dividedPath = dividedPath.unite(child);
      }
    });

    // log(dividedPath);

    if (!!dividedPath.children && dividedPath.children.length > 1) {
      // divided path is a compound path
      let unitedDividedPath = new Path();
      // unitedDividedPath.copyAttributes(dividedPath);
      // log('before', unitedDividedPath);
      Base.each(dividedPath.children, (child, i) => {
        if (!child.closed) {
          unitedDividedPath = unitedDividedPath.unite(child);
        }
      });
      dividedPath = unitedDividedPath;
      // log('after', unitedDividedPath);
      // return;
    } else {
      // log('dividedPath has one child');
    }

    if (intersections.length > 0) {
      // we have to get the nearest location because the exact intersection point has already been removed as a part of resolveCrossings()
      let firstIntersection = dividedPath.getNearestLocation(intersections[0].point);
      // log(dividedPath);
      let rest = dividedPath.splitAt(firstIntersection); // dividedPath is now the first segment
      let firstSegment = dividedPath;
      let lastSegment;

      // firstSegment.strokeColor = 'pink';

      // let circleOne = new Path.Circle({
      //   center: firstIntersection.point,
      //   radius: 5,
      //   strokeColor: 'red'
      // });

      // log(intersections);
      if (intersections.length > 1) {
        // log('foo');
        // rest.reverse(); // start from end
        let lastIntersection = rest.getNearestLocation(intersections[intersections.length - 1].point);
        // let circleTwo = new Path.Circle({
        //   center: lastIntersection.point,
        //   radius: 5,
        //   strokeColor: 'green'
        // });
        lastSegment = rest.splitAt(lastIntersection); // rest is now everything BUT the first and last segments
        if (!lastSegment || !lastSegment.length) lastSegment = rest;
        rest.reverse();
      } else {
        lastSegment = rest;
      }

      if (!!firstSegment && firstSegment.length <= extendingThreshold * totalLength) {
        path = path.subtract(firstSegment);
        if (path.className === 'CompoundPath') {
          Base.each(path.children, (child, i) => {
            if (!child.closed) {
              child.remove();
            }
          });
        }
      }

      if (!!lastSegment && lastSegment.length <= extendingThreshold * totalLength) {
        path = path.subtract(lastSegment);
        if (path.className === 'CompoundPath') {
          Base.each(path.children, (child, i) => {
            if (!child.closed) {
              child.remove();
            }
          });
        }
      }
    }

    // this is hacky but I'm not sure how to get around it
    // sometimes path.subtract() returns a compound path, with children consisting of the closed path I want and another extraneous closed path
    // it appears that the correct path always has a higher version, though I'm not 100% sure that this is always the case

    if (path.className === 'CompoundPath' && path.children.length > 0) {
      if (path.children.length > 1) {
        let largestChild;
        let largestChildArea = 0;

        Base.each(path.children, (child, i) => {
          if (child.area > largestChildArea) {
            largestChildArea = child.area;
            largestChild = child;
          }
        });

        if (largestChild) {
          path = largestChild;
        } else {
          path = path.children[0];
        }
      } else {
        path = path.children[0];
      }
      // log(path);
      // log(path.lastChild);
      // path.firstChild.strokeColor = 'pink';
      // path.lastChild.strokeColor = 'green';
      // path = path.lastChild; // return last child?
      // find highest version
      //
      // log(realPathVersion);
      //
      // Base.each(path.children, (child, i) => {
      //   if (child.version == realPathVersion) {
      //     log('returning child');
      //     return child;
      //   }
      // })
    }
    log('original length:', totalLength);
    log('edited length:', path.length);
    if (path.length > 0) {
      if (Math.abs(path.length - totalLength) / totalLength <= 0.01) {
        log('returning original');
        return [original, false];
      } else {
        return [path, true];
      }
    } else {
      return [original, false];
    }
  } catch(e) {
    console.error(e);
    return [original, false];
  }
}

export function removePathExtensions(path) {
  path.removeSegment(0);
  path.removeSegment(path.segments.length - 1);
  return path;
}

export function checkPops() {
  let groups = paper.project.getItems({
    className: 'Group',
    match: function(el) {
      return (!!el.data && el.data.update);
    }
  });
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
