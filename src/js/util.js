const config = require('./../../config');

// Converts from degrees to radians.
export function rad(degrees) {
  return degrees * Math.PI / 180;
};

// Converts from radians to degrees.
export function deg(radians) {
  return radians * 180 / Math.PI;
};

export function hypot(a, b) {
  return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2)); // pythagorean!
}

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

export function getNumVisibleGroups() {
  const groups = getVisibleGroups();
  return groups.length;
}

export function getVisibleGroups() {
  return paper.project.getItems({
    className: 'Group',
    match: (el) => el.visible === true
  });
}

export function getAllGroups() {
  return paper.project.getItems({
    className: 'Group'
  });
}

export function anyShapesOnCanvas() {
  const groups = getVisibleGroups();
  return groups.length > 0;
}

export function getNumGroups() {
  const groups = getVisibleGroups();
  // console.log('numgroups', groups.length);
  return groups.length;
}

export function getFreshGroups() {
  return paper.project.getItems({
    className: 'Group',
    match: (el) => el.data && el.data.line === false && el.data.fresh === true
  });
}

export function getAllPops() {
  return paper.project.getItems({
    match: (el) => el.data && el.data.pop === true
  });
}

export function clearGroupPops(group) {
  const pops = getGroupPops(group);
  pops.forEach((pop) => pop.remove());
}

export function getGroupPops(group) {
  // console.log('group pop group', group.id, group);
  let returnPops = [];

  if (group.children.length > 0) {
    const groupPops = group.getItems({
      match: (el) => el.data && el.data.pop === true
    });
    returnPops = returnPops.concat(groupPops);
  }

  const intersectingPops = paper.project.getItems({
    match: (el) => el.data && el.data.pop === true && el.data.intersectingGroup === group.id
  });

  if (intersectingPops.length > 0) {
    returnPops = returnPops.concat(intersectingPops);
  }

  return returnPops;
}

export function getPopCandidates() {
  return paper.project.getItems({
    className: 'Group',
    match: (el) => el.data && el.data.line === false
  });
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

// http://blog.soulserv.net/understanding-object-cloning-in-javascript-part-i/
export function shallowCopy( original ) {
    // First create an empty object with
    // same prototype of our original source
    var clone = Object.create( Object.getPrototypeOf( original ) ) ;

    var i, keys = Object.getOwnPropertyNames( original ) ;

    for ( i = 0 ; i < keys.length ; i ++ ) {
      // copy each property into the clone
      Object.defineProperty( clone , keys[ i ] ,
        Object.getOwnPropertyDescriptor( original , keys[ i ] )
      ) ;
    }

    return clone ;
}

export function randomPick(array) {
  if (array.length > 0) {
    return array[Math.floor(Math.random() * array.length)];
  }

  return null;
}
