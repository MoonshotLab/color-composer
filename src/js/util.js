const config = require('./../../config');

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

export function getTime() {
  return new Date().toLocaleTimeString();
}

export function getAllGroups() {
  return paper.project.getItems({
    match: (el) => el.className === 'Group'
  });
}

export function anyShapesOnCanvas() {
  const groups = getAllGroups();
  return groups.length > 0;
}

export function getNumGroups() {
  const groups = getAllGroups();
  console.log('numgroups', groups.length);
  return groups.length;
}

export function setSha() {
  $.get('/hash')
    .done(function(res) {
      console.log('current hash:', res);
      window.kan.hash = res;
    })
    .fail(function(e) {
      console.error('error getting hash:', e);
    });
}
