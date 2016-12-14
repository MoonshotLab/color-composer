var d3 = require('d3');

var line = d3.line()
  .curve(d3.curveBasis);

var svg = d3.select("svg")
  .call(d3.drag()
    .container(function() { return this; })
    .subject(function() { var p = [d3.event.x, d3.event.y]; return [p, p]; })
    .on("start", dragstarted));

function dragstarted() {
  var d = d3.event.subject,
    active = svg.append("path").datum(d),
    x0 = d3.event.x,
    y0 = d3.event.y;

  d3.event.on("drag", function() {
    var x1 = d3.event.x,
      y1 = d3.event.y,
      dx = x1 - x0,
      dy = y1 - y0;

    if (dx * dx + dy * dy > 100) d.push([x0 = x1, y0 = y1]);
    else d[d.length - 1] = [x1, y1];
    active.attr("d", line);
  });
}

console.log('hi');
