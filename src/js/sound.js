require('howler');

const ui = require('./ui');
const shape = require('./shape');
const color = require('./color');
const overlays = require('./overlays');

const sounds = initShapeSounds();

const $body = $('body');

const measures = 4;
const bpm = 120;
const beatLength = (60 / bpm) * 1000; // ms
const measureLength = beatLength * 4;
export const compositionLength = measureLength * measures;

export const playingClass = 'playing';
export const playEnabledClass = 'play-enabled';

export function getShapeSoundObj(path) {
  const viewWidth = paper.view.viewSize.width;
  const viewHeight = paper.view.viewSize.height;

  console.log('shape sound obj path', path);

  let shapePrediction = shape.getShapePrediction(path);
  let colorName = color.getPathColorName(path);

  const quantizedSoundStartTime = quantizeLength(path.bounds.x / viewWidth * compositionLength); // ms
  const quantizedSoundDuration = quantizeLength(path.bounds.width / viewWidth * compositionLength); // ms

  let soundObj = {};
  soundObj.sound = sounds[shapePrediction.pattern];
  soundObj.startTime = quantizedSoundStartTime;
  soundObj.duration = quantizedSoundDuration;
  soundObj.pathId = path.id;
  soundObj.spriteName = colorName;

  return soundObj;
}

export function startPlaying() {
  if ($body.hasClass(playEnabledClass)) {
    $('body').addClass(playingClass);

    Howler.mute(false);

    window.kan.playing = true;

    if (window.kan.firstTimePlaying === true) {
      window.kan.firstTimePlaying = false;
      window.kan.compositionInterval = startComposition(window.kan.composition, false);
    } else {
      window.kan.compositionInterval = startComposition(window.kan.composition, true);
    }
  } else {
    console.log('play is not enabled');
  }
}

export function stopPlaying(mute = false) {
  if (!!mute) {
    Howler.mute(true);
  }

  $('body').removeClass(playingClass);

  window.kan.playing = false;
  stopComposition();
}

export function initShapeSounds() {
  let returnSounds = {};
  const extensions = ['ogg', 'm4a', 'mp3', 'ac3'];

  const shapeNames = shape.shapeNames;
  Base.each(shapeNames, (shapeName) => {
    let shapeSoundJSONPath = `./audio/shapes/${shapeName}/${shapeName}.json`;

    $.getJSON(shapeSoundJSONPath, (resp) => {
      let shapeSoundData = formatShapeSoundData(shapeName, resp);
      let sound = new Howl(shapeSoundData);
      returnSounds[shapeName] = sound;
    });
  });

  return returnSounds;

}

export function formatShapeSoundData(shapeName, data) {
  let returnData = {};

  returnData.src = data.urls.map((url) => `./audio/shapes/${shapeName}/${url}`);
  returnData.sprite = data.sprite;
  returnData.loop = false;

  return returnData;
}

export function quantizeLength(duration) {
  const smallestDuration = (60 / bpm);
  const returnDuration = Math.floor(duration / smallestDuration) * smallestDuration;

  if (returnDuration > 0) {
    return returnDuration;
  } else {
    // always return something greater than zero
    return smallestDuration;
  }
}

export function quantizePosition(position, viewWidth) {
  const smallestInterval = viewWidth / (4 * measures);
  return returnPosition = Math.floor(position / smallestInterval) * smallestInterval;
}

function animateNote(shape) {
  const item = paper.project.getItem({
    className: 'Path',
    match: function(el) {
      return (el.id === shape.pathId);
    }
  });
  let group = item.parent;
  try {
    group.animate([
      {
        properties: {
          scale: 1.15,
          translate: new paper.Point(20, 0),
          rotate: -10,
        },
        settings: {
          duration: 100,
          easing: "easeInOut",
        }
      },
      {
        properties: {
          scale: 1.25,
          translate: new paper.Point(10, 0),
          rotate: 10,
        },
        settings: {
          duration: 100,
          easing: "easeInOut",
        }
      },
      {
        properties: {
          scale: 1,
          translate: new paper.Point(0, 0),
          rotate: 0,
        },
        settings: {
          duration: 100,
          easing: "easeInOut",
        }
      },
    ]);
  } catch(e) {
    console.error('Error animating shape:', e);
  }
}

export function startComposition(composition, loop = false) {
  let iterations = 0;

  function playCompositionOnce() {
    if (loop !== true && iterations >= 2) {
      stopPlaying();
      overlays.openOverlay('share-prompt');
    } else {
      console.log('repeat');
      console.log(composition);
      console.log(window.kan.playing);
      Base.each(composition, (shape, i) => {
        setTimeout(() => {
          if (!window.kan.playing) {
            console.log('not playing, returing');
            return;
          }

          shape.sound.play(shape.spriteName);
          animateNote(shape);
        }, shape.startTime);
      });
      iterations++;
    }
  }

  playCompositionOnce();
  return setInterval(playCompositionOnce, compositionLength);
}

export function stopComposition() {
  clearInterval(window.kan.compositionInterval);
}
