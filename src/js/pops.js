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

    const clipRect = new Path.Rectangle([50,50], [150,150]);
    pops[pop].clipPath = new CompoundPath();
    pops[pop].clipPath.addChild(clipRect);
    pops[pop].clipPath.selected = true;
    pops[pop].group = new Group(pops[pop].clipPath, pops[pop].path);
    pops[pop].group.clipped = true;
  }
  
  paper.view.onFrame = drawPops;
}

function drawPops(event) {
  curFrame++;
  if (curFrame < updateFrames)
    return;
  curFrame = 0;
  
  if (!util.anyShapesOnCanvas()) {
    console.log('no shapes');
    return;
  }
  
  const shapes = util.getShapes();
  console.log('shapes', shapes);

  let pop1Overlap = new CompoundPath();
  pops['yellow'].clipPath.remove();

  // Loop over all shapes
  shapes.forEach((shape, shapeIndex) => {
    if (shape._name !== 'actualShape')
      return;

    let overlapPath = new CompoundPath();
    // Loop over all other shapes
    shapes.forEach((otherShape, otherShapeIndex) => {
      // if (otherShape._name !== 'outlineShape')
        // return;
      // if ((otherShapeIndex == shapeIndex) || (shape.isGroupedWith(otherShape)))
      if (otherShapeIndex == shapeIndex)
        return;
      overlapPath.addChild(shape.intersect(otherShape));
      // console.log('%coverlapPath', 'color: red', overlapPath);
    });

    pop1Overlap.addChild(overlapPath);
  });

  pops['yellow'].clipPath = pop1Overlap;
  pops['yellow'].clipPath.selected = true;
  pops['yellow'].group.insertChild(0, pops['yellow'].clipPath);
  pops['yellow'].group.clipped = true;
  pops['yellow'].group.bringToFront();
}

// Sketch demo with clip path
// http://sketch.paperjs.org/#S/tVTBjpswEP0Vi0uIFrHE0l5Ie1qpVQ+rVk1vmz2wMAlWHBsZk6Rd5d87tjELhGR76QXh55l5857HfgtEtocgDVY70HkZREEuC7M+ZIrUZVbBdwHkMxFwJD8yXcY/IdeZ2HII39aCkEoyoVPyvEiSiODnJTJozf4AgvQBQfw4cMM4f5RcqpTMFBQzBM/z5Vp0TL+O8gZTj8uVdVU7MgM++AaGbL+Bc3mcICwVDMStdKY8Ww5Cg+oK+7q2iTolC9oCKitYUy9SjBkgNDV+THTzyhvoelmL+3tiG0JqbMVbHjPDXqMFoffGt17JavHN7zIpegLCXgy9FfNe6Z8cRweSkd2ozZ34pONbNFb0RPqe/g9bxcRuNuDaKtl02r6aRTi2LbLyvWE2gY4T6EUCNQl4ZI4gzjmrKigwT6sGLH07XxoqRJO2/D47rRxCDbRphDsWKb4ovH8hHHDa5qQ1wiTf3S3dgm1IaKt98lXmbsOOGuhGieV7WsvpDR1KjhXs5QHsBEztfzx/k1Vr4Pg3dMEEth4xUYPSjyXjRZhEF+m+7DVHzV5HTD+QMx76q3LMzb+Wd1sQnRBErwqil4LOppyWksdSPMmmhicUgdt+KMbD0NofV7Jmtr0TBtuY2N6Y+GQI+8FGXBc+DDb8+Mi/Ksh27ikL0ueX818=