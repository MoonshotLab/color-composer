const ShapeDetector = require('./lib/shape-detector');

const config = require('./../../config');

const util = require('./util');
const color = require('./color');

export const cornerThresholdDeg = 30;
export const thresholdDistMultiplier = 0.1;

export const detector = new ShapeDetector(ShapeDetector.defaultShapes);

export const shapeNames = ["line", "circle", "square", "triangle", "other"];

function clearPops() {
  const pops = util.getAllPops();
  pops.forEach((pop) => pop.remove());
}

export function destroyGroupPops(group) {
  console.log('destroying pops');
  const groupPopsBefore = util.getGroupPops(group);
  console.log('pops to be destroyed', groupPopsBefore);
  if (groupPopsBefore.length > 0) {
    groupPopsBefore.forEach((pop) => pop.remove());
  }
  const groupPopsAfter = util.getGroupPops(group);
  console.log('group pops after', groupPopsAfter);
}

export function fillInGroupPopsById(groupId) {
  const group = paper.project.getItem({
    className: 'Group',
    match: (el) => el.id === groupId
  });

  if (!!group && group.children.length > 0) {
    group.children.forEach((groupChild) => {
      if (groupChild.name === 'loop') {
        toggleFill(groupChild);
      }
    });
  }
}

export function toggleFill(item) {
  const transparent = color.transparent;
  // console.log('hit');
  let parent = item.parent;

  // console.log('hit item', item);
  // console.log('hit parent', parent);

  if (item.data.interior) {
    // console.log('interior');
    item.data.transparent = !item.data.transparent;

    if (item.data.transparent) {
      // console.log('transparent');
      item.fillColor = transparent;
      item.strokeColor = transparent;
    } else {
      // console.log('not transparent');
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
    // console.log('not interior');
    // check if item is a pop, because then we'll fill the pop's parent
    if (!!item.data && item.data.pop === true) {
      if (!!item.parent) {
        if (config.pop === true) {
          fillInGroupPopsById(item.parent.id);
        }
      }
    }
  }
}

export function cleanUpGroup(group) {
  console.log('cleaning up group');
  const acceptableNames = ['mask', 'outer', 'shapePath', 'loop', 'pop'];

  group.children.forEach((groupChild) => {
    if (groupChild.name === null || !acceptableNames.includes(groupChild.name) || !groupChild.length > 0) {
      groupChild.remove();
    }
  });

  return group;
}

export function updatePops() {
  const freshGroups = util.getFreshGroups();
  const popCandidates = util.getPopCandidates();
  const allPops = util.getAllPops();
  popCandidates.reverse();
  console.log('freshGroups', freshGroups);
  console.log('popCandidates', popCandidates);
  // clearPops();

  freshGroups.forEach((freshGroup, i) => {
    // if (i >= 4) return;
    console.log('freshGroup', freshGroup);

    const freshOuter = freshGroup._namedChildren.mask[0];
    freshOuter.bringToFront();
    // freshOuter.visible = true;
    // freshOuter.fillColor = 'black';
    // freshOuter.selected = true;
    // console.log('freshOuter', freshOuter);
    // freshOuter.selected = true;
    popCandidates.forEach((otherGroup, j) => {
      const otherGroupOuter = otherGroup._namedChildren.mask[0];
      if (freshGroup.id !== otherGroup.id) {
        // console.log('otherGroup', otherGroup);
        // console.log('otherGroupOuter', otherGroupOuter);
        // otherGroupOuter.fillColor = 'white';
        otherGroupOuter.bringToFront();
        let thisPop = freshOuter.intersect(otherGroupOuter);
        if (!!thisPop && thisPop.length > 0) {
          // const popColor = color.getIndexedPopColor(i + j);
          const popColor = color.getRandomPop();
          thisPop.fillColor = popColor;
          thisPop.strokeColor = popColor;
          thisPop.data.pop = true;
          thisPop.name = 'pop';
          thisPop.data.popGroup = freshGroup.id;
          thisPop.data.intersectingGroup = otherGroup.id;
          thisPop.visible = true;
          thisPop.closed = true;
          thisPop.bringToFront();
          freshGroup.addChild(thisPop);
        } else {
          console.log('no pop');
        }

        cleanUpGroup(freshGroup);

        // figure out if this pop intersects any other pops
        // allPops.forEach((otherPop, k) => {
        //   console.log('checking other pop', otherPop);
        //   if (thisPop.id !== otherPop.id && thisPop.intersects(otherPop)) {
        //     let popIntersection = thisPop.getIntersections(otherPop);
        //     if (!!popIntersection && popIntersection.length > 0) {
        //       popIntersection = new Path([popIntersection])
        //       console.log('popIntersection', popIntersection);
        //       // const popColor = color.getIndexedPopColor(i + j + k);
        //       const popColor = color.getRandomPop();
        //       popIntersection.data.pop = true;
        //       popIntersection.fillColor = popColor
        //       popIntersection.strokeColor = popColor;
        //       popIntersection.visible = true;
        //       popIntersection.closed = true;
        //       popIntersection.bringToFront();
        //     }
        //   }
        // });

      }
    });

    freshGroup.data.fresh = false;
  });
}

export function getOutlineGroup(truedShape) {
  // console.log('truedShape', truedShape);
  let outerPath = new Path();
  outerPath.name = 'outer';

  let middlePath = new Path();
  middlePath.name = 'middle';
  let sizes = [];
  let angle;

  let firstTop = null, firstBottom = null;
  let lastTop = null, lastBottom = null;

  if (!(truedShape.length > 0)) return new Group(outerPath, middlePath);

  // outerPath.add(truedShape.firstSegment.point);
  middlePath.add(truedShape.firstSegment.point);

  for (let i = 10; i < truedShape.length - 10; i += 20) {
    while (sizes.length > 10) {
      sizes.shift();
    }

    const size = Math.random() * 8; // This is just random variance
    sizes.push(size);

    let cumSize = 0;
    for (let j = 0; j < sizes.length; j++) {
      cumSize += sizes[j];
    }
    const avgSize = Math.max(5, ((cumSize / sizes.length) + size) / 2);

    const prevPoint = truedShape.getPointAt(i - 10);
    const nextPoint = truedShape.getPointAt(i + 10);
    const point = new Point((prevPoint.x + nextPoint.x) / 2, (prevPoint.y + nextPoint.y) / 2);

    angle = Math.atan2(nextPoint.y - prevPoint.y, nextPoint.x - prevPoint.x);

    const topX = point.x + Math.cos(angle - Math.PI/2) * avgSize;
    const topY = point.y + Math.sin(angle - Math.PI/2) * avgSize;
    const top = new Point(topX, topY);

    const bottomX = point.x + Math.cos(angle + Math.PI/2) * avgSize;
    const bottomY = point.y + Math.sin(angle + Math.PI/2) * avgSize;
    const bottom = new Point(bottomX, bottomY);

    outerPath.add(top);
    outerPath.insert(0, bottom);
    middlePath.add(point);

    if (i == 10) {
      firstTop = top;
      firstBottom = bottom;
      // new Path.Line({
      //   from: bottom,
      //   to: top,
      //   strokeWidth: 5,
      //   strokeColor: 'red'
      // });
    } else {
      lastTop = top;
      lastBottom = bottom;
      // new Path.Line({
      //   from: bottom,
      //   to: top,
      //   strokeWidth: 5,
      //   strokeColor: new Color(0, i / truedShape.length)
      // });
    }
  }

  // new Path.Line({
  //   from: lastBottom,
  //   to: lastTop,
  //   strokeWidth: 5,
  //   strokeColor: 'blue'
  // });

  if (truedShape.closed === true) {
    const centerTop = new Point((firstTop.x + lastTop.x) / 2, (firstTop.y + lastTop.y) / 2);
    const centerBottom = new Point((firstBottom.x + lastBottom.x) / 2, (firstBottom.y + lastBottom.y) / 2);
    const center = new Point((centerTop.x + centerBottom.x) / 2, (centerTop.y + centerBottom.y) / 2);

    outerPath.add(centerTop);
    outerPath.insert(0, centerBottom);
    middlePath.add(center);
    // new Path.Line({
    //   from: centerBottom,
    //   to: centerTop,
    //   strokeWidth: 5,
    //   strokeColor: 'yellow'
    // });
    outerPath.add(firstTop);
    outerPath.insert(0, firstBottom);
    middlePath.closed = true;
    // middlePath.add(point);
    // console.log('closed');
  }
  //  else {
  //   const lastCenter = ((lastTop.x + lastBottom.x) / 2, (lastTop.y + lastBottom.y) / 2);
  //   const lastPoint = truedShape.lastSegment.point;
  //   const adjustedLastPoint = new Point((lastCenter.x + lastPoint.x) / 2, (lastCenter.y + lastPoint.y) / 2);
  //   // outerPath.add(adjustedLastPoint);
  //   // outerPath.lastSegment.smooth();
  // }

  // outerPath.selected = true;

  // new Path.Circle({
  //   center: outerPath.firstSegment.point,
  //   radius: 3,
  //   fillColor: 'red'
  // });
  // new Path.Circle({
  //   center: outerPath.firstSegment.next.point,
  //   radius: 3,
  //   fillColor: 'red'
  // });
  //
  // new Path.Circle({
  //   center: outerPath.lastSegment.point,
  //   radius: 3,
  //   fillColor: 'blue'
  // });
  // new Path.Circle({
  //   center: outerPath.lastSegment.previous.point,
  //   radius: 3,
  //   fillColor: 'blue'
  // });

  outerPath.smooth();
  middlePath.smooth();
  outerPath.name = 'outer';
  middlePath.name = 'middle';
  const returnGroup = new Group(outerPath, middlePath);
  return returnGroup;
}

export function getTruedShape(path) {
  let pathClone = path.clone();
  pathClone.visible = false;
  // console.log('pathClone', pathClone);
  let completedPath = getCompletedPath(pathClone);
  // completedPath.reduce();

  // true the path!
  let truedPath = completedPath;
  // console.log('truedPath', truedPath);

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

    // pathClone.remove();

    if (intersections.length > 0) {
      // trim extra extended path
      let trimmedPath = getTrimmedPath(extendedPath);
      extendedPath.remove();
      return trimmedPath;
    } else {
      // extended path does not intersect, return the original path
      extendedPath.replaceWith(getBruteExtendedPath(pathClone));
      if (extendedPath !== null) {
        let intersections = extendedPath.getIntersections();

        if (intersections.length > 0) {
          let trimmedPath = getTrimmedPath(extendedPath);
          extendedPath.remove();
          return trimmedPath;
        }

        if (!!extendedPath && extendedPath.length > 0) {
          extendedPath.remove();
        }
      }

      pathClone.visible = true;
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

  console.log('shape prediction', prediction);

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
          let enclosedLoop = child.clone();
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
        let enclosedLoop = pathClone.clone();
        enclosedLoop.visible = true;
        enclosedLoop.fillColor = pathClone.strokeColor;
        enclosedLoop.data.interior = true;
        enclosedLoop.data.transparent = false;
        interiorCurves.push(enclosedLoop);
      }
    }
  } else {
    if (pathClone.closed) {
      let enclosedLoop = pathClone.clone();
      enclosedLoop.visible = true;
      enclosedLoop.fillColor = pathClone.strokeColor;
      enclosedLoop.data.interior = true;
      enclosedLoop.data.transparent = false;
      interiorCurves.push(enclosedLoop);
    }
  }

  return interiorCurves;
}

export function getExtendedPath(path, bruteForce = false) {
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

  // extendedPath.visible = true;

  return extendedPath;
}

export function getBruteExtendedPath(path) {
  let extendedPath = path.clone();
  extendedPath.visible = false;

  const thresholdDist = thresholdDistMultiplier * extendedPath.length;
  const firstPoint = extendedPath.firstSegment.point;
  const lastPoint = extendedPath.lastSegment.point;

  if (firstPoint.getDistance(lastPoint) < thresholdDist) {
    extendedPath.insert(0, lastPoint);
    extendedPath.add(firstPoint);
    extendedPath.closed = true;
    extendedPath.unite();
    let crossings = extendedPath.resolveCrossings();
    if (!!crossings && !!crossings.children && crossings.children.length > 0) {
      let maxArea = 0, maxChild = null;
      crossings.children.forEach((child) => {
        if (child.area > maxArea) {
          maxChild = child;
          maxArea = child.area;
        }
      });

      extendedPath = maxChild;
    }
  }

  return extendedPath;
}

export function getTrimmedPath(path) {
  let pathClone = path.clone();
  pathClone.visible = false;

  let firstPoint = pathClone.firstSegment.point;
  let lastPoint = pathClone.lastSegment.point;
  let thresholdDist = thresholdDistMultiplier * pathClone.length;

  let intersections = pathClone.getIntersections();
  intersections.forEach((intersection, i) => {
    if (intersection.offset === 0) {
      intersections.splice(i, 1);
    }
  });

  console.log('intersections', intersections);

  if (intersections.length == 1) {
    for (let i = 0; i < intersections.length; i++) {
      let intersectionPoint = intersections[i].point;

      // if the average of the distance between the first and last points and the intersection point is within the threshold, trim
      if (firstPoint.getDistance(intersectionPoint) + lastPoint.getDistance(intersectionPoint) < 2 * thresholdDist) {
        // console.log('trimming path');
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
        if (trimmedPath.length === 0) return pathClone;
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
                // console.log('trimmed accumulator', accumulator);
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
            // console.log('trimmed closedChildren[0]', closedChildren[0]);
            return closedChildren[0];
          }
        }

        // console.log('trimmed path return', trimmedPath);
        // console.log('path clone', pathClone);
        // console.log('dividedPath', dividedPath);
        pathClone.remove();
        dividedPath.remove();
        return trimmedPath;
      }
    }

    // no close intersection were found so nothing can be trimmed
    return pathClone;
  } else {
    return path;
  }
}


export function hitTestGroupBounds(point) {
  let groups = util.getAllGroups();
  return hitTestBounds(point, groups);
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
