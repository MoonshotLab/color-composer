// var $window = $(window);
//
// $('canvas#mainCanvas')
//   .css('width', $window.outerWidth())
//   .css('height', $window.outerHeight());

tool.minDistance = 2;
// tool.maxDistance = 20;

var path;

function onMouseDown(event) {
	path = new Path();
	path.fillColor = window.kan.current_color;

	path.add(event.point);
}

var past = [];
var avgStep, cumStep;
function onMouseDrag(event) {
	var step = event.delta / 2;
	step.angle += 90;

  console.log(event);

  // past.push(step);
  //
  // while (past.length > 5) {
  //   past.shift();
  // }
  //
  // for (var i = 0; i < past.length; i++) {
  //   if (i == 0) {
  //     cumStep = step;
  //   } else {
  //     cumStep += step;
  //   }
  // }
  //
  // avgStep = cumStep / 5;

	var top = event.middlePoint + step;
	var bottom = event.middlePoint - step;

  console.log(top);
  console.log(bottom);

	path.add(top);
	path.insert(0, bottom);
	path.smooth();
}

function onMouseUp(event) {
	path.add(event.point);
	path.closed = true;
	path.smooth();
}
