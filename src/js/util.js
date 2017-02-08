const config = require('./../../config');

export function log(...thing) {
  if (config.log) {
    console.log(...thing);
  }
}

// Converts from degrees to radians.
export function rad(degrees) {
  return degrees * Math.PI / 180;
};

// Converts from radians to degrees.
export function deg(radians) {
  return radians * 180 / Math.PI;
};

// returns absolute value of the delta of two angles in radians
export function angleDelta(x, y) {
  return Math.abs(Math.atan2(Math.sin(y - x), Math.cos(y - x)));;
}

// distance between two points
export function delta(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)); // pythagorean!
}

// returns an array of the interior curves of a given compound path
export function findInteriorCurves(path) {
  let interiorCurves = [];
  if (!path || !path.children || !path.children.length) return;

  for (let i = 0; i < path.children.length; i++) {
    let child = path.children[i];

    if (child.closed){
      interiorCurves.push(new Path(child.segments));
    }
  }

  path.remove();
  return interiorCurves;
}

export function trueGroup(group, corners) {
  let middle = group._namedChildren.middle[0];
  console.log('num corners', corners.length);

  let intersections = middle.getIntersections();
  let trueNecessary = false;

  let middleCopy = middle.clone();
  middleCopy.visible = false;
  // debugger;

  if (intersections.length > 0) {
    // see if we can trim the path while maintaining intersections
    // log('intersections!');
    // middleCopy.strokeColor = 'yellow';
    [middleCopy, trueNecessary] = trimPath(middleCopy, middle);
    // middleCopy.strokeColor = 'orange';
  } else {
    // extend first and last segment by threshold, see if intersection
    // log('no intersections, extending first!');
    // middleCopy.strokeColor = 'yellow';
    middleCopy = extendPath(middleCopy);
    // middleCopy.strokeColor = 'orange';
    let intersections = middleCopy.getIntersections();
    if (intersections.length > 0) {
      // middleCopy.strokeColor = 'pink';
      [middleCopy, trueNecessary] = trimPath(middleCopy, middle);
      // middleCopy.strokeColor = 'green';
    } else {
      // middleCopy.strokeColor = 'red';
      middleCopy = removePathExtensions(middleCopy);
      // middleCopy.strokeColor = 'blue';
    }
  }

  console.log('original length:', middle.length);
  console.log('trued length:', middleCopy.length);

  middleCopy.name = 'middle'; // make sure
  middleCopy.visible = true;

  // group.addChild(middleCopy);
  // group._namedChildren.middle[0] = middleCopy;
  group._namedChildren.middle[0].replaceWith(middleCopy);


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
    if (Math.abs(path.length - totalLength) / totalLength <= 0.01) {
      log('returning original');
      return [original, false];
    } else {
      return [path, true];
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

// export function truePath(path) {
//   // log(group);
//   // if (path && path.children && path.children.length > 0 && path._namedChildren['middle']) {
//   //   let pathCopy = new Path();
//   //   log(path._namedChildren['middle']);
//   //   pathCopy.copyContent(path._namedChildren['middle']);
//   //   log(pathCopy);
//   // }
// }

export function checkPops() {
  let groups = paper.project.getItems({
    className: 'Group',
    match: function(el) {
      return (!!el.data && el.data.update);
    }
  });
}

// https://groups.google.com/forum/#!topic/paperjs/UD8L0MTyReQ
export function overlaps(path, other) {
  return !(path.getIntersections(other).length === 0);
}

// https://groups.google.com/forum/#!topic/paperjs/UD8L0MTyReQ
export function mergeOnePath(path, others) {
  let i, merged, other, union, _i, _len, _ref;
  for (i = _i = 0, _len = others.length; _i < _len; i = ++_i) {
    other = others[i];
    if (overlaps(path, other)) {
      union = path.unite(other);
      merged = mergeOnePath(union, others.slice(i + 1));
      return (_ref = others.slice(0, i)).concat.apply(_ref, merged);
    }
  }
  return others.concat(path);
};

// https://groups.google.com/forum/#!topic/paperjs/UD8L0MTyReQ
export function mergePaths(paths) {
  var path, result, _i, _len;
  result = [];
  for (_i = 0, _len = paths.length; _i < _len; _i++) {
    path = paths[_i];
    result = mergeOnePath(path, result);
  }
  return result;
};

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
