const config = require('./../../config');

export const transparent = new Color(0, 0);

export function getColorName(color) {
  if (color in config.palette.colorNames) {
    return config.palette.colorNames[color];
  } else {
    return null;
  }
}
