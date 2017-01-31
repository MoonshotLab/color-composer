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
  Base.each(groups, function(group, i) {
    console.log(group);
  });
}
