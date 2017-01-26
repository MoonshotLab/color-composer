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

  for (let i = 0; i < path.children.length; i++) {
    let child = path.children[i];

    if (child.closed){
      interiorCurves.push(new Path(child.segments));
    }
  }

  path.remove();
  return interiorCurves;
}
