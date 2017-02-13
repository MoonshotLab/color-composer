require('howler');

const ui = require('./ui');
const shape = require('./shape');
const color = require('./color');

const sounds = initShapeSounds();

const measures = 4;
const bpm = 120;
const beatLength = (60 / bpm) * 1000; // ms
const measureLength = beatLength * 4;
export const compositionLength = measureLength * measures;

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
  if (paper.project.activeLayer.children.length > 0) {
    $('body').addClass(ui.playingClass);

    Howler.mute(false);

    window.kan.playing = true;
    window.kan.compositionInterval = startComposition(window.kan.composition);
  }
}

export function stopPlaying(mute = false) {
  if (!!mute) {
    Howler.mute(true);
  }

  $('body').removeClass(ui.playingClass);

  window.kan.playing = false;
  stopComposition(window.kan.compositionInterval);
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

export function startComposition(composition) {
  function playCompositionOnce() {
    console.log('repeat');
    Base.each(composition, (shape, i) => {
      setTimeout(() => {
        if (!window.kan.playing) {
          return;
        }

        shape.sound.play(shape.spriteName);
        animateNote(shape);
      }, shape.startTime);
    });
  }

  playCompositionOnce();
  return setInterval(playCompositionOnce, compositionLength);
}

export function stopComposition(interval) {
  clearInterval(interval);
}
