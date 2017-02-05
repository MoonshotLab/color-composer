export function processShapeData(json) {
  let returnShape = [];
  let jsonObj = JSON.parse(json)[1]; // zero index is stringified type (e.g. "Path")

  if ('segments' in jsonObj) {
    let segments = jsonObj.segments;
    Base.each(segments, (segment, i) => {
      let positionInfo = segment[0]; // indexes 1 and 2 are superfluous matrix details
      returnShape.push({
        x: positionInfo[0],
        y: positionInfo[1]
      })
    });
  }
  return returnShape;
}
