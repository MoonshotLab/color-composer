function initControlPanel() {
  initColorPalette();
  initNew();
  initUndo();
  initPlay();
  initTips();
  initShare();
}

function initColorPalette() {
  var palette = ["#20171C", "#1E2A43", "#28377D", "#352747", "#F285A5", "#CA2E26", "#B84526", "#DA6C26", "#453121", "#916A47", "#EEB641", "#F6EB16", "#7F7D31", "#6EAD79", "#2A4621", "#F4EAE0"];

  // var paletteColors = d3.select('ul.palette-colors')
  //       .data(palette)
  //       .enter()
  //       .append('li').append('svg').append('rect')
  //       .attr('width', 50)
  //       .attr('height', 50)
  //       .attr('fill', function(d) { return d; });

  var paletteWrap = d3.select('ul.palette-colors');
  var paletteColorSize = 20;
  var paletteSelectedColorSize = 30;
  var paletteSelectedClass = 'palette-selected';

  var CURRENT_COLOR = palette[0];

  palette.forEach(function(d, i) {
    if (i == 0) {
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

  var paletteColors = d3.selectAll('.palette-colors li')
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

  // var svg = d3.select('svg.main')
  //   .append('rect')
  //   .attr('id', 'foo')
  //   .attr('class', 'selected')
  //   .attr('width', 50)
  //   .attr('height', 50);
  //
  // var selectedPaletteClass = 'selected';
  //
  // var foo = d3.select('rect#foo')
  //   .on('click', function() {
  //     var $this = d3.select(this);
  //     if ($this.classed(selectedPaletteClass)) {
  //       $this.attr('rx', 20)
  //         .attr('ry', 20)
  //         .attr('width', 40)
  //         .attr('height', 40);
  //     } else {
  //       $this.attr('rx', 0)
  //         .attr('ry', 0)
  //         .attr('width', 50)
  //         .attr('height', 50);
  //     }
  //     $this.classed(selectedPaletteClass, !$this.classed(selectedPaletteClass));
  //   });

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
}

function undoPressed() {
  console.log('undo pressed');
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

// var white = d3.rgb("white"),
//     black = d3.rgb("black"),
//     height = d3.select("canvas#picker").property("height");
//
// var channels = {
//   h: {scale: d3.scale.linear().domain([0, 360]).range([0, height]), y: height / 2},
//   s: {scale: d3.scale.linear().domain([1, 1]).range([height, height]), y: height / 2},
//   l: {scale: d3.scale.linear().domain([1, 1]).range([height, height]), y: height / 2}
// };
//
// var channel = d3.selectAll(".channel")
//     .data(d3.entries(channels));
//
// var pickerCanvas = channel.select("canvas#picker")
//     .call(d3.behavior.drag().on("drag", pickerDragged))
//     .each(pickerRender);
//
// function pickerDragged(d) {
//   d.value.x = Math.max(0, Math.min(this.height - 1, d3.mouse(this)[0]));
//   pickerCanvas.each(pickerRender);
// }
//
// function pickerRender(d) {
//   var height = this.height,
//       context = this.getContext("2d"),
//       image = context.createImageData(height, 1),
//       i = -1;
//
//   var current = d3.hsl(
//     channels.h.scale.invert(channels.h.x),
//     channels.s.scale.invert(channels.s.x),
//     channels.l.scale.invert(channels.l.x)
//   );
//
//   for (var y = 0, v, c; y < height; ++y) {
//     if (y === d.value.y) {
//       c = white;
//     } else if (y === d.value.y - 1) {
//       c = black;
//     } else {
//       current[d.key] = d.value.scale.invert(y);
//       c = d3.rgb(current);
//     }
//     image.data[++i] = c.r;
//     image.data[++i] = c.g;
//     image.data[++i] = c.b;
//     image.data[++i] = 255;
//   }
//
//   context.putImageData(image, 0, 0);
// }
