const sound = require('./sound');
const tutorial = require('./tutorial');
const overlays = require('./overlays');

const $body = $('body');
const tapEvent = 'click tap touch';

export const playingClass = 'playing';

export function init() {
  initColorPalette();
  initNewButton();
  initUndoButton();
  initPlayButton();
  initTipsButton();
  initShareButton();
  initContextualTuts();
  addCanvasBackground();
}

function newPressed() {
  console.log('new pressed');
  window.kan.composition = [];
  paper.project.activeLayer.removeChildren();
  // window.kan.userHasDrawnFirstShape = false;
  // tutorial.resetContextualTuts();
}

function undoPressed() {
  const transparent = new Color(0, 0);
  console.log('undo pressed');
  if (!(window.kan.moves.length > 0)) {
    console.log('no moves yet');
    window.kan.userHasDrawnFirstShape = false;
    return;
  }

  let lastMove = window.kan.moves.pop();
  let item = project.getItem({
    id: lastMove.id
  });

  if (item) {
    item.visible = true; // make sure
    switch(lastMove.type) {
      case 'newGroup':
        console.log('removing group');
        item.remove();
        break;
      case 'fillChange':
        if (lastMove.transparent) {
          item.fillColor = lastMove.fill;
          item.strokeColor = lastMove.fill;
        } else {
          item.fillColor = transparent;
          item.strokeColor = transparent;
        }
      case 'transform':
        if (!!lastMove.position) {
          item.position = lastMove.position
          if (item.data && item.data.tut && item.data.tut.length > 0) {
            // item has connected contextual tut, move it to the right place
            const $tut = $(`.tut[data-tut-type='${tutName}']`);
            tutorial.moveContextualTut($tut, lastMove.position);
          }
        }
        if (!!lastMove.rotation) {
          item.rotation = lastMove.rotation;
        }
        if (!!lastMove.scale) {
          item.scale(lastMove.scale);
        }
        break;
      default:
        console.log('unknown case');
    }
  } else {
    console.log('could not find matching item');
  }
}

function playPressed() {
  console.log('play pressed');
  overlays.closeAndResetOverlays();
  clearTimeout(window.kan.playPromptTimeout);
  if (window.kan.playing) {
    console.log('starting playing');
    sound.stopPlaying(true);
  } else {
    console.log('starting playing');
    sound.startPlaying();
  }
}

function tipsPressed() {
  overlays.openOverlay('tips');
  console.log('tips pressed');
}

function sharePressed() {
  overlays.openOverlay('share');
  console.log('share pressed');
}

function initColorPalette() {
  const $paletteWrap = $('ul.palette-colors');
  const $paletteColors = $paletteWrap.find('li');
  const paletteColorSize = 20;
  const paletteSelectedColorSize = 30;
  const paletteSelectedClass = 'palette-selected';

  // hook up click
  $paletteColors.on('click tap touch', function() {
    if (!$body.hasClass(playingClass)) {
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
    };
  });
}

function initNewButton() {
  $('.main-controls .new').on(tapEvent, function() {
    if (!$body.hasClass(playingClass)) {
      newPressed();
    }
  });
}

function initUndoButton() {
  $('.main-controls .undo').on(tapEvent, function() {
    if (!$body.hasClass(playingClass)) {
      undoPressed()
    }
  });
}

function initPlayButton() {
  $('.main-controls .play-stop').on(tapEvent, playPressed);
}

function initTipsButton() {
  $('.controls .tips').on(tapEvent, function() {
    if (!$body.hasClass(playingClass)) {
      tipsPressed();
    }
  });
}

function initShareButton() {
  $('.controls .share').on(tapEvent, function() {
    if (!$body.hasClass(playingClass)) {
      sharePressed();
    }
  });
}

function initContextualTuts() {
  const $tuts = $('.contextual-tuts .tut');
  $tuts.on(tapEvent, function() {
    $(this).css({visibility: 'hidden'});
  });
}

function addCanvasBackground() {
  paper.project.activeLayer.name = 'background';
  const canvasBg = new Raster('canvas-bg');
  canvasBg.name = 'canvasBg';
  canvasBg.position = paper.view.center;

  const scaleFactorHorizontal = paper.view.viewSize.width / canvasBg.size.width;
  const scaleFactorVertical = paper.view.viewSize.height / canvasBg.size.height;
  canvasBg.scale(Math.max(scaleFactorHorizontal, scaleFactorVertical));
  let layer = new Layer(); // init new layer that all other shapes will be drawn upon
  paper.project.activeLayer.name = 'canvas';
}
