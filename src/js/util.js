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

    if (!child.closed){
      child.remove();
    } else {
      let bounds = child.strokeBounds;
      let interior = false;

      // iterate through all other children to see if this child is entirely within another. if so, it is an interior path
      for (let j = 0; j < path.children.length; j++) {
        // don't test against itself
        if (j !== i) {
          if (child.isInside(path.children[j].strokeBounds)) {
            interior = true;
          }
        }
      }

      if (interior) {
        interiorCurves.push(new Path(child.segments));
        console.log(`child ${child.id} is interior`);
      } else {
        console.log(`child ${child.id} is exterior`);
      }
    }
  }

  path.remove();

  return interiorCurves;
}
