const sound = require('./sound');
const tutorial = require('./tutorial');
const overlays = require('./overlays');

const $body = $('body');
const tapEvent = 'click tap touch';

const playingClass = sound.playingClass;
const playEnabledClass = sound.playEnabledClass;

const $newButton = $('.controls .new');
const $undoButton = $('.controls .undo');
const $playButton = $('.controls .play-stop');
const $shareButton = $('.controls .share');
const $tipsButton = $('.controls .tips');

const ditheredClass = 'dithered';

export function init() {
  initColorPalette();
  initNewButton();
  initUndoButton();
  initPlayButton();
  initTipsButton();
  initShareButton();
  initContextualTuts();
  resetCanvas();
}

function unditherAllButtons() {
  $(`.controls .${ditheredClass}`).removeClass(ditheredClass);
}

export function unditherUndoButton() {
  ditherUndoButton(true);
}

export function ditherUndoButton(undither = false) {
  if (undither !== true) {
    $undoButton.addClass(ditheredClass);
  } else {
    $undoButton.removeClass(ditheredClass);
  }
}

export function ditherPlayAndShareButtons(undither = false) {
  if (undither !== true) {
    $playButton.addClass(ditheredClass);
    $shareButton.addClass(ditheredClass);
  } else {
    $playButton.removeClass(ditheredClass);
    $shareButton.removeClass(ditheredClass);
  }
}

export function unditherPlayAndShareButtons() {
  ditherPlayAndShareButtons(true);
}

function newPressed() {
  console.log('new pressed');
  window.kan.composition = [];
  paper.project.activeLayer.removeChildren();
  tutorial.hideContextualTuts();
  ditherPlayAndShareButtons();
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
        sound.removeShapeFromComposition(item);
        item.remove();
        const numMoves = window.kan.moves.length;
        if (numMoves <= 0) {
          ditherUndoButton();
        }

        if (numMoves < 3) {
          ditherPlayAndShareButtons();
          $body.removeClass(sound.playEnabledClass);
        } else {
          $body.addClass(sound.playEnabledClass);
        }
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
  console.log('share pressed');
  if ($body.hasClass(sound.playEnabledClass)) {
    overlays.openOverlay('share');
  }
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

export function resetCanvas() {
  paper.project.clear();

  // add random background
  paper.project.activeLayer.name = 'background';
  const numCanvasses = 10;
  const randomCanvasIndex = Math.round(Math.random() * (numCanvasses - 1)) + 1; // [1, numCanvasses]
  const canvasBg = new Raster(`canvas-${randomCanvasIndex}`);
  canvasBg.name = 'canvasBg';
  canvasBg.position = paper.view.center;

  // add canvas layer
  const scaleFactorHorizontal = paper.view.viewSize.width / canvasBg.size.width;
  const scaleFactorVertical = paper.view.viewSize.height / canvasBg.size.height;
  canvasBg.scale(Math.max(scaleFactorHorizontal, scaleFactorVertical));
  let layer = new Layer(); // init new layer that all other shapes will be drawn upon
  paper.project.activeLayer.name = 'canvas';
}
