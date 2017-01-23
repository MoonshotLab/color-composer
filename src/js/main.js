window.kan = window.kan || {
  palette: ["#20171C", "#1E2A43", "#28377D", "#352747", "#F285A5", "#CA2E26", "#B84526", "#DA6C26", "#453121", "#916A47", "#EEB641", "#F6EB16", "#7F7D31", "#6EAD79", "#2A4621", "#F4EAE0"],
  currentColor: '#20171C',
  numPaths: 10,
  paths: [],
};

paper.install(window);

const util = require('./util');

$(document).ready(function() {
  let MOVES = []; // store global moves list
  // moves = [
  //   {
  //     'type': 'colorChange',
  //     'old': '#20171C',
  //     'new': '#F285A5'
  //   },
  //   {
  //     'type': 'newPath',
  //     'ref': '???' // uuid? dom reference?
  //   },
  //   {
  //     'type': 'pathTransform',
  //     'ref': '???', // uuid? dom reference?
  //     'old': 'rotate(90deg)scale(1.5)', // ???
  //     'new': 'rotate(120deg)scale(-0.5)' // ???
  //   },
  //   // others?
  // ]

  const $window = $(window);
  const $body = $('body');
  const $canvas = $('canvas#mainCanvas');

  function initControlPanel() {
    initColorPalette();
    initCanvasDraw();
    initNew();
    initUndo();
    initPlay();
    initTips();
    initShare();
  }

  function initColorPalette() {
    const $paletteWrap = $('ul.palette-colors');
    const $paletteColors = $paletteWrap.find('li');
    const paletteColorSize = 20;
    const paletteSelectedColorSize = 30;
    const paletteSelectedClass = 'palette-selected';

    // hook up click
      $paletteColors.on('click tap touch', function() {
          let $svg = $(this).find('svg.palette-color');

          if (!$svg.hasClass(paletteSelectedClass)) {
            $('.' + paletteSelectedClass)
              .removeClass(paletteSelectedClass)
              .attr('width', paletteColorSize)
              .attr('height', paletteColorSize)
              .find('rect')
              .attr('rx', 0)
              .attr('ry', 0);

            $svg.addClass(paletteSelectedClass)
              .attr('width', paletteSelectedColorSize)
              .attr('height', paletteSelectedColorSize)
              .find('rect')
              .attr('rx', paletteSelectedColorSize / 2)
              .attr('ry', paletteSelectedColorSize / 2)

            window.kan.currentColor = $svg.find('rect').attr('fill');
          }
        });
  }

  function initCanvasDraw() {

    paper.setup($canvas[0]);

    let path;
    let past;
    let pasts = [];
    let sizes;
    // let paths = getFreshPaths(window.kan.numPaths);
    let touch = false;
    let lastChild;

    function panStart(event) {
      sizes = [];

      if (!(event.gesture.changedPointers && event.gesture.changedPointers.length > 0)) return;
      if (event.gesture.changedPointers.length > 1) {
        console.log('event.gesture.changedPointers > 1');
      }

      const pointer = event.gesture.center;
      const point = new Point(pointer.x, pointer.y);

      // the first path is what is actually drawn, the second path keeps track of center points
      path = new CompoundPath({
        children: [
          new Path({
            name: 'bounds'
          }),
          new Path({
            name: 'middle'
          })
        ],
        strokeColor: window.kan.currentColor,
        fillColor: window.kan.currentColor
      });

      path.children['bounds'].add(point);

      path.children['middle'].add(point);
      path.children['middle'].visible = false; // second path is only for internal use, hide it
    }

    const threshold = 20;
    const alpha = 0.3;
    const memory = 10;
    let cumSize, avgSize;
    function panMove(event) {
      event.preventDefault();

      const pointer = event.gesture.center;
      const point = new Point(pointer.x, pointer.y);

      while (sizes.length > memory) {
        sizes.shift();
      }

      let bottomX, bottomY, bottom,
        topX, topY, top,
        p0, p1,
        step, angle, dist, size;

      if (sizes.length > 0) {
        // not the first point, so we have others to compare to
        p0 = past;
        dist = util.delta(point, p0);
        size = dist * alpha;
        if (size >= threshold) size = threshold;

        cumSize = 0;
        for (let j = 0; j < sizes.length; j++) {
          cumSize += sizes[j];
        }
        avgSize = Math.round(((cumSize / sizes.length) + size) / 2);
        // console.log(avgSize);

        angle = Math.atan2(point.y - p0.y, point.x - p0.x); // rad

        // Point(bottomX, bottomY) is bottom, Point(topX, topY) is top
        bottomX = point.x + Math.cos(angle + Math.PI/2) * avgSize;
        bottomY = point.y + Math.sin(angle + Math.PI/2) * avgSize;
        bottom = new Point(bottomX, bottomY);

        topX = point.x + Math.cos(angle - Math.PI/2) * avgSize;
        topY = point.y + Math.sin(angle - Math.PI/2) * avgSize;
        top = new Point(topX, topY);

        path.children['bounds'].add(top);
        path.children['bounds'].insert(0, bottom);
        path.children['bounds'].smooth();

        path.children['middle'].add(point);
      } else {
        // don't have anything to compare to
        dist = 1;
        angle = 0;

        size = dist * alpha;
        if (size >= threshold) size = threshold;
      }

      paper.view.draw();

      past = point;
      sizes.push(size);
    }

    function panEnd(event) {
      elasticity = 1;

      const pointer = event.gesture.center;
      const point = new Point(pointer.x, pointer.y);

      path.children['bounds'].add(point);
      path.children['bounds'].smooth();
      path.children['bounds'].simplify(0);
      path.children['bounds'].closed = true;

      path.children['middle'].add(point);
      path.children['middle'].smooth();
      // path.children['middle'].simplify(0);
      path.children['middle'].closed = false;
      lastChild = path;

      let intersections = path.children['middle'].getCrossings();
      if (false && intersections && intersections.length > 0) {
        for (let i = 0; i < intersections.length; i++) {
          console.log('----------------');
          let intersection = intersections[i];
          let location = path.children['middle'].getLocationOf(intersection.point);
          console.log(location);
          let index = location.curve.index + 1;
          console.log(index);
          // for (let j = index; j < path.children['middle'].segments.length; j++) {
          //   console.log(path.children['middle'].segments[j].point);
          //   new Path.Circle({
          //     center: path.children['middle'].segments[j].point,
          //     radius: 3,
          //     fillColor: 'pink'
          //   });
          // }
          // let locationPath = new Path({
          //   strokeColor: window.kan.currentColor,
          //   fillColor: window.kan.currentColor
          // });
          // for (let j = 0; j < location.path.segments.length; j++) {
          //   locationPath.add(location.path.segments[j].point);
          // }
          // locationPath.closed = false;
          // console.log(intersection);
          // const circle = new Path.Circle({
          //     center: intersection.point,
          //     radius: 3,
          //     fillColor: 'pink'
          // });
        }
      }

      // console.log(path.children['middle']);
      for (let i = 0; i < path.children['middle'].segments.length; i++) {
        let segment = path.children['middle'].segments[i];
        // console.log(segment);
      }
    }

    const hitOptions = {
      segments: false,
      stroke: true,
      fill: true,
      tolerance: 5
    };

    function tap(event) {
      const pointer = event.gesture.center,
          point = new Point(pointer.x, pointer.y),
          hitResult = paper.project.hitTest(point, hitOptions);

      if (hitResult) {
        hitResult.item.selected = !hitResult.item.selected;
      }
    }

    // var animationId;
    let elasticity = 0;

    function jiggle(event) {

      // console.log(paper.project.activeLayer.firstChild);
      // paper.project.activeLayer.firstChild.rotate(3);
      if (!!lastChild) {
        if (elasticity > 0) {
          // console.log(lastChild);
          for (let i = 0; i < lastChild.segments.length; i++) {
            const segment = lastChild.segments[i];
            const timeConst = 16;
            const divConst = 2;
            const cos = Math.cos(event.time * timeConst + i);
            const sin = Math.sin(event.time * timeConst + i);
            segment.point.x += (cos / divConst) * elasticity;
            segment.point.y += (sin / divConst) * elasticity;
            // console.log(cos, sin, elasticity);
            elasticity -= 0.001;
          }
        }
      } else {
        // console.log('no children yet');
      }
    }

    // paper.view.onFrame = jiggle;

    $canvas.hammer()
      .on('panstart', panStart)
      .on('panmove', panMove)
      .on('panend', panEnd)
      .on('tap', tap);

    $canvas.data('hammer').get('pan').set({ direction: Hammer.DIRECTION_ALL });
  }

  function newPressed() {
    console.log('new pressed');

    paper.project.activeLayer.removeChildren();
  }

  function undoPressed() {
    console.log('undo pressed');
    // d3.selectAll('svg.main path:last-child').remove();
  }

  function playPressed() {
    console.log('play pressed');
  }

  function tipsPressed() {
    console.log('tips pressed');
  }

  function sharePressed() {
    console.log('share pressed');
  }

  function initNew() {
    $('.main-controls .new').on('click tap touch', newPressed);
  }

  function initUndo() {
    $('.main-controls .undo').on('click', undoPressed);
  }
  function initPlay() {
    $('.main-controls .play').on('click', playPressed);
  }
  function initTips() {
    $('.aux-controls .tips').on('click', tipsPressed);
  }
  function initShare() {
    $('.aux-controls .share').on('click', sharePressed);
  }

  function main() {
    initControlPanel();
  }

  main();
});
