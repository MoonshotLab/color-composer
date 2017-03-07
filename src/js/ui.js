const config = require('./config');
require('howler');

const sound = require('./sound');
const tutorial = require('./tutorial');
const overlays = require('./overlays');
const util = require('./util');
const color = require('./color');
const shape = require('./shape');
const share = require('./share');
const touch = require('./touch');

const $body = $('body');
const tapEvent = 'click tap touch';

const playingClass = sound.playingClass;
const playEnabledClass = sound.playEnabledClass;

const $newButton = $('.controls .new');
const $undoButton = $('.controls .undo');
const $playButton = $('.controls .play-stop');
const $shareButton = $('.controls .share');
const $tipsButton = $('.controls .tips');

export const drawCanvas = $('#canvas')[0];
export const tipsOverlay = $('.overlay.tips')[0];

const ditheredClass = 'dithered';
const shareModeClass = 'share-mode';

export function init() {
  initLogoRefresh();
  initColorPalette();
  initNewButton();
  initUndoButton();
  initPlayButton();
  initTipsButton();
  initShareButton();
  initContextualTuts();
  resetCanvas();
}

function ditherAllButtons() {
  $('.controls > *').addClass(ditheredClass);
}

function unditherAllButtons() {
  $(`.controls .${ditheredClass}`).removeClass(ditheredClass);
}

export function ditherButtonsByName(buttonNames, undither = false) {
  if (buttonNames.length > 0) {
    if ($.isArray(buttonNames)) {
      buttonNames.forEach((name) => ditherButtonByName(name, undither));
    } else {
      ditherButtonByName(buttonNames, undither);
    }
  }
}

export function unditherButtonsByName(buttonNames) {
  ditherButtonsByName(buttonNames, true);
}

export function ditherButtonByName(buttonName, undither = false) {
  let $button = $(`.controls .${buttonName}`);
  // console.log($button);
  if ($button.length > 0) {
    if (undither !== true) {
      $button.addClass(ditheredClass);
    } else {
      $button.removeClass(ditheredClass);
    }
  }
}

export function unditherButtonByName(buttonName) {
  ditherButtonByName(buttonName, true);
}

function unditherButtonsByName(buttonNames) {
  ditherButtonsByName(buttonNames, true);
}

export function enterShareMode() {
  sound.stopPlaying(true);
  ditherAllButtons();
  clearTimeout(window.kan.playPromptTimeout);
  touch.disableAllEvents();
}

export function exitShareMode() {
  unditherAllButtons();
  Howler.mute(false);
  touch.enableAllEvents();
}

function newPressed() {
  // console.log('new pressed');
  window.kan.composition = [];
  paper.project.activeLayer.removeChildren();
  tutorial.hideContextualTuts();
  ditherButtonsByName(['undo', 'new', 'play-stop', 'share']);
  sound.stopPlaying();
  // window.kan.userHasDrawnFirstShape = false;
  // tutorial.resetContextualTuts();
}

function undoPressed() {
  sound.stopPlaying();
  tutorial.hideContextualTuts();

  const transparent = new Color(0, 0);
  // console.log('undo pressed');
  if (!(window.kan.moves.length > 0)) {
    // console.log('no moves yet');
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
        // console.log('removing group');
        sound.removeShapeFromComposition(item);
        util.clearGroupPops(item);
        item.remove();

        if ('removedGroup' in lastMove) {
          // bring back removed group
          lastMove.removedGroup.visible = true;
          lastMove.removedGroup.data.fresh = true;
          shape.updatePops();
        }


        const numGroups = util.getNumGroups();
        // console.log('numGroups', numGroups);

        if (numGroups <= 0) {
          ditherButtonsByName(['undo', 'new', 'play-stop', 'share']);
          $body.removeClass(sound.playEnabledClass);
        } else {
          unditherButtonsByName(['undo', 'new', 'play-stop', 'share']);
          $body.addClass(sound.playEnabledClass);
        }

        break;
      case 'fillChange':
        if (lastMove.transparent) {
          item.fillColor = lastMove.fill;
        } else {
          item.fillColor = transparent;
        }
        item.strokeColor = transparent;
      case 'transform':
        item.data.fresh = true;
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
        if (config.pop === true) {
          shape.updatePops();
        }
        break;
      default:
        // console.log('unknown case');
    }
  } else {
    // console.log('could not find matching item');
  }
}

function playPressed() {
  // console.log('play pressed');
  // sound.stopComposition();
  // overlays.closeAndResetOverlays();
  // tutorial.hideContextualTuts();
  let playing = window.kan.playing;
  // console.log(playing, util.getNumGroups() > 2, !playing && util.getNumGroups() > 2, $body);

  clearTimeout(window.kan.playPromptTimeout);
  if (!playing && util.getNumGroups() > 2) {
    // console.log('starting playing');
    sound.startPlaying();
  } else {
    // console.log('stopping playing');
    sound.stopPlaying(true);
  }
}

function tipsPressed() {
  sound.stopPlaying();
  overlays.openOverlay('tips');
  // console.log('tips pressed');
}

function initLogoRefresh() {
  $('.main-logo').on(tapEvent, function() {
    location.reload();
  });
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
        // console.log('%ccolor', 'color:red', color.getColorName(window.kan.currentColor));
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
      undoPressed();
    }
  });
}

function initPlayButton() {
  $('.main-controls .play-stop .play').on(tapEvent, sound.startPlaying);
  $('.main-controls .play-stop .stop').on(tapEvent, sound.stopPlaying);
}

function initTipsButton() {
  $('.controls .tips').on(tapEvent, function() {
    if (!$body.hasClass(playingClass)) {
      tipsPressed();
    }
  });
}

function initShareButton() {
  $('.controls .share').on(tapEvent, share.handleSharePressed);
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
