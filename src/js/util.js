// Converts from degrees to radians.
export function rad(degrees) {
  return degrees * Math.PI / 180;
};

// Converts from radians to degrees.
export function deg(radians) {
  return radians * 180 / Math.PI;
};

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

export function trueGroup(group) {
  let bounds = group._namedChildren.bounds[0],
      middle = group._namedChildren.middle[0];

  let middleCopy = new Path();
  middleCopy.copyContent(middle);
  middleCopy.visible = false;
  let dividedPath = middleCopy.resolveCrossings();
  dividedPath.visible = false;
  Base.each(dividedPath.children, function(child, i) {
    if (child.closed) {
      child.selected = false;
    } else {
      child.selected = true;
    }
    // console.log(child, i);
  })
}

export function truePath(path) {
  // console.log(group);
  // if (path && path.children && path.children.length > 0 && path._namedChildren['middle']) {
  //   let pathCopy = new Path();
  //   console.log(path._namedChildren['middle']);
  //   pathCopy.copyContent(path._namedChildren['middle']);
  //   console.log(pathCopy);
  // }
}

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
