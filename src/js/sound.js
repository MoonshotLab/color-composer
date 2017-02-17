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
  if (!!path.parent && path.parent.className === 'Group') {
    soundObj.groupId = path.parent.id;
  }

  return soundObj;
}

export function startPlaying() {
  if ($body.hasClass(playEnabledClass)) {
    $('body').addClass(playingClass);

    Howler.mute(false);

    window.kan.playing = true;

    if (window.kan.firstTimePlaying === true) {
      window.kan.firstTimePlaying = false;
      startComposition(window.kan.composition, false);
    } else {
      startComposition(window.kan.composition, true);
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
  if (!!item) {
    let group = item.parent;
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
  }
}

export function removeShapeFromComposition(shapeGroup) {
  for (let i = 0; i < window.kan.composition.length; i++) {
    let sound = window.kan.composition[i];

    if ('groupId' in sound) {
      if (sound.groupId === shapeGroup.id) {
        window.kan.composition.splice(i, 1);
        return;
      }
    } else if ('pathId' in sound) {
      let item = getItems({
        match: function(el) {
          return el.id === sound.pathId
        }
      });
      if (item.length > 0) {
        if (!!item.parent && item.parent.className === 'Group' && item.parent.id === shapeGroup.id) {
          window.kan.composition.splice(i, 1);
          return;
        }
      }
    }
  }
}

export function clearSoundTimeouts() {
  if (window.kan.soundTimeouts.length > 0) {
    window.kan.soundTimeouts.forEach((soundTimeout) => {
      clearTimeout(soundTimeout);
    });
  }

  window.kan.soundTimeouts = [];
}

export function startComposition(composition, loop = false) {
  stopComposition();

  let iterations = 0;
  playCompositionFirstTime();

  function playCompositionFirstTime() {
    clearSoundTimeouts();
    console.log('playing composition first time');
    let trimmedCompositionObj = getTrimmedCompositionObj(composition);

    Base.each(trimmedCompositionObj.composition, (shape, i) => {
      let soundTimeout = setTimeout(() => {
        if (!window.kan.playing) {
          console.log('not playing, returing');
          return;
        }

        shape.sound.play(shape.spriteName);
        animateNote(shape);
      }, shape.startTime);
      window.kan.soundTimeouts.push(soundTimeout);
    });

    iterations++;
    window.kan.compositionTimeout = setTimeout(repeatComposition, compositionLength - trimmedCompositionObj.startTime);
  }

  function playCompositionOnce() {
    clearSoundTimeouts();
    console.log('repeat');
    Base.each(composition, (shape, i) => {
      let soundTimeout = setTimeout(() => {
        if (!window.kan.playing) {
          console.log('not playing, returing');
          return;
        }

        shape.sound.play(shape.spriteName);
        animateNote(shape);
      }, shape.startTime);
      window.kan.soundTimeouts.push(soundTimeout);
    });
    iterations++;
  }

  function repeatComposition() {
    if (loop === true) {
      playCompositionOnce();
      window.kan.compositionInterval = setInterval(playCompositionOnce, compositionLength);
    } else {
      if (iterations < 2) {
        playCompositionOnce();
        setTimeout(repeatComposition, compositionLength);
      } else {
        stopPlaying();
        overlays.openOverlay('share-prompt');
      }
    }
  }
}

export function stopComposition() {
  clearInterval(window.kan.compositionInterval);
  clearTimeout(window.kan.compositionTimeout);
  clearSoundTimeouts();
}

export function getTrimmedCompositionObj(composition) {
  let firstTime = 0;
  let trimmedComposition = [];
  let startTime = getCompositionStartTime(composition);

  composition.forEach((sound) => {
    let modifiedSound = sound;
    modifiedSound.startTime -= startTime;
    if (modifiedSound.startTime < 0) modifiedSound.startTime = 0; // this shouldn't happen
    trimmedComposition.push(modifiedSound);
  });

  return {
    composition: trimmedComposition,
    startTime: startTime
  }
}

function getCompositionStartTime(composition) {
  let startTime = compositionLength;

  composition.forEach((sound) => {
    console.log(sound);
    console.log(sound.startTime)
    if ('startTime' in sound && sound.startTime < startTime) {
      startTime = sound.startTime;
    }
  });

  console.log('start time', startTime);

  if (startTime !== compositionLength) {
    return startTime;
  } else {
    return 0;
  }
}
