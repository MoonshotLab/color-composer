const util = require('./util');

export function getIdealGeometry(pathData, path) {
  Base.each(path.segments, (segment, i) => {
    let pointStr = util.stringifyPoint(segment.point);
    if (pointStr in pathData) {
      let pointData = pathData[pointStr];
    }
  });

  return null;
}
