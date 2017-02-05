const config = require('./../../config');

export function getColorName(color) {
  if (color in config.palette.colorNames) {
    return config.palette.colorNames[color];
  } else {
    return null;
  }
}
