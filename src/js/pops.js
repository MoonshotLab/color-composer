const config = require('./../../config');
const util = require('./util');
let curFrame = 40;
let updateFrames = 40;

const pops = {
  // cyan: {},
  // pink: {},
  // green: {},
  yellow: {},
  // tan: {},
};

export function init() {
  const pop = 'yellow';
  for (let pop in pops) {
    const rect = new Rectangle(0, 0, paper.view.viewSize.width, paper.view.viewSize.height);

    pops[pop].path = new Path.Rectangle(rect);
    pops[pop].path.visible = true;
    pops[pop].path.fillColor = config.palette.pops[pop];
    // pops[pop].path.fillColor = new Color(1, 0, 0, 0.5);

    pops[pop].clipPath = new Path();
    pops[pop].group = new Group(pops[pop].clipPath, pops[pop].path);
  }
  
  paper.view.onFrame = drawPops;
}

function drawPops(event) {
  curFrame++;
  if (curFrame < updateFrames)
    return;
  curFrame = 0;

  const shapes = util.getShapes();

  // Loop over all shapes
  shapes.forEach((shape, shapeIndex) => {
    pops['yellow'].clipPath.remove();
    let overlapPath = new CompoundPath();
    // Loop over all other shapes
    shapes.forEach((otherShape, otherShapeIndex) => {
      if (otherShapeIndex == shapeIndex)
        return;
      overlapPath.addChild(shape.intersect(otherShape));
    });
    overlapPath.selected = true;
    pops['yellow'].clipPath = overlapPath;
    pops['yellow'].group.insertChild(0, pops['yellow'].clipPath);
    pops['yellow'].group.clipped = true;
    pops['yellow'].clipPath.selected = true;
  });
}
