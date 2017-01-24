// Converts from degrees to radians.
export function rad(degrees) {
  return degrees * Math.PI / 180;
};

// Converts from radians to degrees.
export function deg(radians) {
  return radians * 180 / Math.PI;
};


export function delta(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)); // pythagorean!
}

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
      }
    }
  }

  let newPath = new Path({
    fillColor: 'pink',
    strokeColor: 'pink'
  });
  for (let i = 0; i < path.children.length; i++) {
    // console.log(path.children[i]);
    console.log(newPath.unite(path.children[i]));
  }

  path.remove();

  console.log('newPath', newPath);
  console.log('path', path);

  if (interiorCurves.length > 0) {
    return interiorCurves;
  } else {
    return null;
  }
}

export function getInteriorPaths(path) {
  // let intersections = path.getCrossings();
  // for (let i = 0; i < intersections.length; i++) {
  //   let intersection = intersections[i];
  //   intersection.path.resolveCrossings();
  // }
  // path.visible = false;
  // let secondaryPath = path.clone();
  // secondaryPath.visible = false;
  // secondaryPath.resolveCrossings();
  // let oldPath = path;
  // console.log(oldPath);
  // path.resolveCrossings();
  // console.log(path);
  // console.log(path == oldPath);
  return null;
}

// export function getInteriorPaths(path) {
//   if (!path || !path.segments || !(path.segments.length > 0)) return null;
//
//   let intersections = path.getCrossings();
//   // console.log('length', intersections.length);
//   if (intersections && intersections.length > 0) {
//     for (let i = 0; i < intersections.length; i++) {
//       console.log('----------------');
//       let intersection = intersections[i];
//       let location = path.getLocationOf(intersection.point);
//       console.log('location', location.toString());
//       let index = location.curve.index;
//       console.log('index', index.toString());
//       let lastAngle;
//       var intersectionPath;
//       let interior = false;
//       console.log('path', path.toString());
//       console.log('intersection', intersection.toString());
//       for (let j = 0; j < path.segments.length; j++) {
//         let point = path.segments[j].point;
//         let angle = intersection.point.getDirectedAngle(point);
//
//         if (lastAngle) {
//           // ignore the first point, since there's no previous angle to compare to
//           if ((angle * lastAngle) < 0) {
//             console.log('cross');
//
//             // product of angle and lastAngle will only be negative if one is positive and the other is negative
//             if (!interior) {
//               interior = true;
//               var intersectionPath = new Path({
//                 strokeColor: window.kan.currentColor,
//                 fillColor: window.kan.currentColor
//               });
//               intersectionPath.add(intersection.point);
//             } else {
//               interior = false;
//               // intersectionPath.add(intersection.point);
//               // intersectionPath.closed = false;
//               intersectionPath.smooth();
//               intersectionPath.selected = true;
//               // break;
//               // break;
//             }
//           }
//         }
//
//         if (interior) {
//           intersectionPath.add(point);
//           new Path.Circle({
//             center: point,
//             radius: 3,
//             fillColor: 'pink'
//           });
//         }
//
//         lastAngle = angle;
//         // if (closest) {
//         //   if (distance < closest) {
//         //     closest = distance;
//         //   }
//         //   // console.log(distance);
//         //   // if (distance > lastDistance) {
//         //   //   console.log('colder');
//         //   // } else if (distance < lastDistance){
//         //   //   console.log('warmer');
//         //   // } else {
//         //   //   console.log('same');
//         //   // }
//         // } else {
//         //   closest = distance;
//         //   // first point, start new path
//         //   // let intersectionPath = new Path({
//         //   //   strokeColor: window.kan.currentColor,
//         //   //   fillColor: window.kan.currentColor
//         //   // });
//         //   // intersectionPath.add(intersection.point);
//         //
//         // }
//
//         // new Path.Circle({
//         //   center: point,
//         //   radius: 3,
//         //   fillColor: 'pink'
//         // });
//       }
//     }
//   } else {
//     return null;
//   }
// }
