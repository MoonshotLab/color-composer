window.kan = window.kan || {
  palette: ["#20171C", "#1E2A43", "#28377D", "#352747", "#F285A5", "#CA2E26", "#B84526", "#DA6C26", "#453121", "#916A47", "#EEB641", "#F6EB16", "#7F7D31", "#6EAD79", "#2A4621", "#F4EAE0"],
  currentColor: '#20171C',
  numPaths: 10,
  paths: [],
};

paper.install(window);

$(document).ready(function() {
  // window.kan.currentColor = window.kan.palette[0];
  var MOVES = []; // store global moves list
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

  var $window = $(window);
  var $body = $('body');
  var $canvas = $('canvas#mainCanvas');

  // $(document).on('mousedown', touchStart);
  // $(document).on('mousemove', touchMove);
  // $(document).on('mouseup', touchEnd);


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
    var $paletteWrap = $('ul.palette-colors');
    var $paletteColors = $paletteWrap.find('li');
    var paletteColorSize = 20;
    var paletteSelectedColorSize = 30;
    var paletteSelectedClass = 'palette-selected';

    // hook up click
      $paletteColors.on('click tap touch', function() {
          var $svg = $(this).find('svg.palette-color');

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

  function getFreshPaths(numPaths) {
    var paths = [];

    for (var i = 0; i < numPaths; i++) {
      paths.push(new paper.Path({
        strokeColor: window.kan.currentColor,
        // fillColor: window.kan.currentColor,
        strokeWidth: 5,
        // selected: true
      }));
    }

    return paths;
  }

  function initCanvasDraw() {

    paper.setup($canvas[0]);

    var path;
    var pasts = [];
    var sizes = [];
    var paths = getFreshPaths(window.kan.numPaths);
    var touch = false;

    function touchStart(ev) {
      touch = true;
      for (var i = 0; i < ev.touches.length; i++) {
        paths[i].strokeColor = window.kan.currentColor;
        // paths[i].fillColor = window.kan.currentColor;
        paths[i].add(new Point(ev.touches[i].pageX, ev.touches[i].pageY));

        // for (var j = 0; j < paths[i].children.length; j++) {
        //   // start all paths on the same point
        //   paths[i].children[j].add(new Point(ev.touches[i].pageX, ev.touches[i].pageY));
        // }
      }
    }

    var threshold = 20;
    var alpha = 1;
    var memory = 10;
    var cumSize, avgSize;
    function touchMove(ev) {
      ev.preventDefault();
      if (!touch) return;

      while (sizes.length > memory) {
        sizes.shift();
      }
      // console.log(sizes);

      for (var i = 0; i < ev.touches.length; i++) {
        if (!ev.touches[i]) continue;

        var x1, y1,
          bottomX, bottomY, bottom,
          topX, topY, top,
          p0, p1,
          step, angle, dist, size;

        x1 = ev.touches[i].pageX;
        y1 = ev.touches[i].pageY;
        p1 = new Point(x1, y1);

        if (pasts.length > i) {
          p0 = pasts[i];
          dist = delta(p1, p0);
          size = dist * alpha;
          if (size >= threshold) size = threshold;

          cumSize = 0;
          for (var j = 0; j < sizes.length; j++) {
            cumSize += sizes[j];
          }
          avgSize = Math.round(((cumSize / sizes.length) + size) / 2);
          // console.log(avgSize);

          angle = Math.atan2(p1.y - p0.y, p1.x - p0.x); // rad

          // Point(bottomX, bottomY) is bottom, Point(topX, topY) is top
          bottomX = x1 + Math.cos(angle + Math.PI/2) * avgSize;
          bottomY = y1 + Math.sin(angle + Math.PI/2) * avgSize;
          bottom = new Point(bottomX, bottomY);

          topX = x1 + Math.cos(angle - Math.PI/2) * avgSize;
          topY = y1 + Math.sin(angle - Math.PI/2) * avgSize;
          top = new Point(topX, topY);

          // paths[i].add(top);
          // paths[i].insert(0, bottom);
          paths[i].add(p1);

          paths[i].smooth({type: 'continuous'});

        } else {
          // don't have anything to compare to
          dist = 1;
          angle = 0;

          size = dist * alpha;
          if (size >= threshold) size = threshold;
          // console.log('first point:', p1);
        }

        paper.view.draw();

        pasts[i] = p1;
        sizes.push(size);
      }
    }

    function touchEnd(ev) {
      touch = false;
      console.log(ev);

      for (var i = 0; i < paths.length; i++) {
        if (paths[i].segments.length > 0) {
          paths[i].smooth({type: 'continuous'});
          paths[i].simplify();
          console.log(paths[i]);
        } else {
          paths[i].remove();
        }
      }

      // reset paths
      var path;

      paths = getFreshPaths(window.kan.numPaths);
      pasts = [];
      sizes = [];
    }

    $canvas.on('touchstart', touchStart);
    $canvas.on('touchmove', touchMove);
    $canvas.on('touchend', touchEnd);
  }

  function delta(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)); // pythagorean!
  }

  function initCanvasDrawD3() {
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
      var active = svg.append("path").datum(d).style("stroke", function() { return window.kan.currentColor });
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
    // d3.selectAll('svg.main path').remove();
    moves = [];
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
