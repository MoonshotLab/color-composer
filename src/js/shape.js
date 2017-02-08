const util = require('./util');
const config = require('./../../config');

function log(...thing) {
  util.log(...thing);
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

export function getClosestPointFromPathData(pathData, point) {
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

export function getSides(path) {
  const thresholdAngle = util.rad(config.shape.cornerThresholdDeg);

  if (!path.length > 0) return [];

  let corners = [];

  let point, prev;
  let angle, prevAngle, angleDelta;

  Base.each(path.segments, (segment, i) => {
    let point = segment.point;
    // log(point);
    if (!!prev) {
      let angle = Math.atan2(point.y - prev.y, point.x - prev.x);
      if (angle < 0) angle += (2 * Math.PI); // normalize to [0, 2π)

      if (!!prevAngle) {
        angleDelta = util.angleDelta(angle, prevAngle);
        if (angleDelta >= thresholdAngle) {
          console.log('corner');
          new Path.Circle({
            center: prev,
            radius: 10,
            fillColor: 'pink'
          });
          corners.push(prev);
        } else {
          console.log(angleDelta);
        }
      }

      prevAngle = angle;
    } else {
      // first point
      corners.push(point);
      new Path.Circle({
        center: point,
        radius: 10,
        fillColor: 'pink'
      })
    }
    prev = point;
  });

  corners.push(path.lastSegment.point);
  new Path.Circle({
    center: path.lastSegment.point,
    radius: 10,
    fillColor: 'pink'
  });

  return corners;
}
