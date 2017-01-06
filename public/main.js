// var throttle = require('lodash.throttle');

// var line = d3.line()
//   .curve(d3.curveBasis);
//
// var svg = d3.select("svg.main")
//   .call(d3.drag()
//   .container(function() { return this; })
//   .subject(function() { var p = [d3.event.x, d3.event.y]; return [p, p]; })
//   .on("start", dragstarted));
//
// // var color = d3.scaleOrdinal(d3.schemeCategory10);
// function dragstarted() {
//   var d = d3.event.subject;
//   // var active = svg.append("path").datum(d).style("stroke", function() { return "hsl(" + Math.random() * 360 + ",100%,50%)" });
//   var active = svg.append("path").datum(d).style("stroke", function() { return "#000" });
//   var x0 = d3.event.x;
//   var y0 = d3.event.y;
//
//   // d3.event.on("drag", function(d) {
//   //   console.log(d3.event);
//   // });
//
//   d3.event.on("drag", function() {
//     var x1 = d3.event.x;
//     var y1 = d3.event.y;
//     var dx = x1 - x0;
//     var dy = y1 - y0;
//
//     // console.log(dx, dy);
//     // console.log(dx * dx + dy * dy);
//
//     if (dx * dx + dy * dy > 100) {
//       d.push([x0 = x1, y0 = y1]);
//     } else {
//       d[d.length - 1] = [x1, y1];
//       active.attr("d", line);
//     }
//   }).on("end", function() {
//     console.log('end');
//   });
// }

var white = d3.rgb("white"),
    black = d3.rgb("black"),
    height = d3.select("canvas#picker").property("height");

var channels = {
  h: {scale: d3.scale.linear().domain([0, 360]).range([0, height]), y: height / 2},
  s: {scale: d3.scale.linear().domain([1, 1]).range([height, height]), y: height / 2},
  l: {scale: d3.scale.linear().domain([1, 1]).range([height, height]), y: height / 2}
};

var channel = d3.selectAll(".channel")
    .data(d3.entries(channels));

var pickerCanvas = channel.select("canvas#picker")
    .call(d3.behavior.drag().on("drag", pickerDragged))
    .each(pickerRender);

function pickerDragged(d) {
  d.value.x = Math.max(0, Math.min(this.height - 1, d3.mouse(this)[0]));
  pickerCanvas.each(pickerRender);
}

function pickerRender(d) {
  var height = this.height,
      context = this.getContext("2d"),
      image = context.createImageData(height, 1),
      i = -1;

  var current = d3.hsl(
    channels.h.scale.invert(channels.h.x),
    channels.s.scale.invert(channels.s.x),
    channels.l.scale.invert(channels.l.x)
  );

  for (var y = 0, v, c; y < height; ++y) {
    if (y === d.value.y) {
      c = white;
    } else if (y === d.value.y - 1) {
      c = black;
    } else {
      current[d.key] = d.value.scale.invert(y);
      c = d3.rgb(current);
    }
    image.data[++i] = c.r;
    image.data[++i] = c.g;
    image.data[++i] = c.b;
    image.data[++i] = 255;
  }

  context.putImageData(image, 0, 0);
}
