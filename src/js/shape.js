export function getIdealGeometry(pathData) {
  return null;
  
  let pathClone = pathData.clone();
  pathClone.strokeColor = 'pink';
  pathClone.strokeWidth = 5;
  pathClone.strokeCap = 'round';
  pathClone.selected = true;

  let sides = [];
  let side = [];
  let prev;

  Base.each(pathClone.segments, (segment, i) => {
    if (!prev) {
      side.push({
        point: segment.point,

      })
    }
  });
  return null;
}
