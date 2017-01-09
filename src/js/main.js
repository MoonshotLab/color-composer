var PALETTE = ["#20171C", "#1E2A43", "#28377D", "#352747", "#F285A5", "#CA2E26", "#B84526", "#DA6C26", "#453121", "#916A47", "#EEB641", "#F6EB16", "#7F7D31", "#6EAD79", "#2A4621", "#F4EAE0"];
var CURRENT_COLOR = PALETTE[0];
var MOVES = []; // store global moves list
var _R = new DollarRecognizer();

// maybe?
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
  var paletteWrap = d3.select('ul.palette-colors');
  var paletteColorSize = 20;
  var paletteSelectedColorSize = 30;
  var paletteSelectedClass = 'palette-selected';

  PALETTE.forEach(function(d, i) {
    if (i == 0) {
      // if first child, show as selected
      paletteWrap.append('li').append('svg')
        .attr('class', 'palette-color ' + paletteSelectedClass)
        .attr('width', paletteSelectedColorSize)
        .attr('height', paletteSelectedColorSize)
        .append('rect')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('fill', d)
        .attr('rx', paletteSelectedColorSize / 2)
        .attr('ry', paletteSelectedColorSize / 2);
    } else {
      paletteWrap.append('li').append('svg')
        .attr('class', 'palette-color')
        .attr('width', paletteColorSize)
        .attr('height', paletteColorSize)
        .append('rect')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('fill', d);
    }
  });

  // hook up click
  d3.selectAll('.palette-colors li')
      .on('click', function() {
        var $this = d3.select(this).select('svg.palette-color');

        if (!$this.classed(paletteSelectedClass)) {
          d3.selectAll('.' + paletteSelectedClass)
            .classed(paletteSelectedClass, false)
            .attr('width', paletteColorSize)
            .attr('height', paletteColorSize)
            .select('rect')
            .attr('rx', 0)
            .attr('ry', 0);

          $this.classed(paletteSelectedClass, true)
            .attr('width', paletteSelectedColorSize)
            .attr('height', paletteSelectedColorSize)
            .select('rect')
            .attr('rx', paletteSelectedColorSize / 2)
            .attr('ry', paletteSelectedColorSize / 2)

          CURRENT_COLOR = $this.select('rect').attr('fill');
        }
      });
}

function initCanvasDraw() {
  var line = d3.line()
    .curve(d3.curveBasis);

  var svg = d3.select("svg.main")
    .call(d3.drag()
    .container(function() { return this; })
    .subject(function() { var p = [d3.event.x, d3.event.y]; return [p, p]; })
    .on("start", dragstarted));

  // var color = d3.scaleOrdinal(d3.schemeCategory10);
  function dragstarted() {
    var d = d3.event.subject;
    // var active = svg.append("path").datum(d).style("stroke", function() { return "hsl(" + Math.random() * 360 + ",100%,50%)" });
    var active = svg.append("path").datum(d).style("stroke", function() { return CURRENT_COLOR });
    var x0 = d3.event.x;
    var y0 = d3.event.y;

    // d3.event.on("drag", function(d) {
    //   console.log(d3.event);
    // });

    d3.event.on("drag", function() {
      var x1 = d3.event.x;
      var y1 = d3.event.y;
      var dx = x1 - x0;
      var dy = y1 - y0;

      // console.log(dx, dy);
      // console.log(dx * dx + dy * dy);

      if (dx * dx + dy * dy > 100) {
        d.push([x0 = x1, y0 = y1]);
      } else {
        d[d.length - 1] = [x1, y1];
        active.attr("d", line);
      }
    }).on("end", function() {
      console.log('drag end');
    });
  }
}

function newPressed() {
  console.log('new pressed');
  d3.selectAll('svg.main path').remove();
  moves = [];
}

function undoPressed() {
  console.log('undo pressed');
  d3.selectAll('svg.main path:last-child').remove();
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
  d3.select('.main-controls .new').on('click', newPressed);
}

function initUndo() {
  d3.select('.main-controls .undo').on('click', undoPressed);
}
function initPlay() {
  d3.select('.main-controls .play').on('click', playPressed);
}
function initTips() {
  d3.select('.aux-controls .tips').on('click', tipsPressed);
}
function initShare() {
  d3.select('.aux-controls .share').on('click', sharePressed);
}

function main() {
  initControlPanel();
}

main();
