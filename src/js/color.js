const config = require('./../../config');

export const transparent = new Color(0, 0);

export function getPathColorName(path) {
  let hexColor = path.parent.data.originalColor;
  // let hexColor = path.strokeColor.toCSS(true); // This fails when it's a gradient
  return getColorName(hexColor);
}

export function getColorName(color) {
  if (color) {
    color = color.toUpperCase(); // make sure
    if (color in config.palette.colorNames) {
      return config.palette.colorNames[color];
    } else {
      return null;
    }
  } else {
    return null;
  }
}

export function getRandomPop() {
  const pops = config.palette.pops;
  return pops[Math.floor(Math.random() * pops.length)];
}

export function getIndexedPopColor(index) {
  const pops = config.palette.pops;
  return pops[index % pops.length];
}
