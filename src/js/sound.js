require('howler');
const Promise = require("bluebird");

const ui = require('./ui');
const shape = require('./shape');
const color = require('./color');
const overlays = require('./overlays');
const tutorial = require('./tutorial');
const util = require('./util');

const $body = $('body');

const measures = 4;
const bpm = 120;
const beatLength = (60 / bpm) * 1000; // ms
const measureLength = beatLength * 4;
export const compositionLength = measureLength * measures;

export const playingClass = 'playing';
export const playEnabledClass = 'play-enabled';

export function init() {
  return asyncInitShapeSounds();
}

export function reinitShapeSounds() {
  return asyncInitShapeSounds();
}

export function getShapeSoundObj(path) {
  const viewWidth = paper.view.viewSize.width;
  const viewHeight = paper.view.viewSize.height;
  const shapeSounds = window.kan.shapeSounds || initShapeSounds();
  // alert(JSON.stringify(window.kan.shapeSounds));
  // console.log(JSON.stringify(window.kan.shapeSounds));

  let shapePrediction = shape.getShapePrediction(path);
  let colorName = color.getPathColorName(path);
  if (colorName === null) colorName = 'black'; // just in case

  const quantizedSoundStartTime = quantizeLength(path.bounds.x / viewWidth * compositionLength); // ms
  const quantizedSoundDuration = quantizeLength(path.bounds.width / viewWidth * compositionLength); // ms

  let soundObj = {};
  soundObj.sound = shapeSounds[shapePrediction.pattern];
  soundObj.startTime = quantizedSoundStartTime;
  soundObj.duration = quantizedSoundDuration;
  soundObj.pathId = path.id;
  soundObj.spriteName = colorName;
  soundObj.groupId = path.parent.id;
  soundObj.play = function() {
    return new Promise(function(resolve, reject) {
      soundObj.sound.play(soundObj.spriteName);
      soundObj.sound.on('end', function() {
        resolve(`Group ${soundObj.groupId} done playing`);
      });
      soundObj.sound.on('loaderror', function() {
        reject(`Group ${soundObj.groupId} failed to load sound`);
      });
    })
  }


  return soundObj;
}

export function startPlaying() {
  // console.log('first time', window.kan.firstTimePlaying);
  if ($body.hasClass(playEnabledClass)) {
    $body.addClass(playingClass);

    Howler.mute(false);

    window.kan.playing = true;

    if (window.kan.firstTimePlaying === true) {
      window.kan.firstTimePlaying = false;
      startComposition(window.kan.composition, false);
    } else {
      startComposition(window.kan.composition, true);
    }
  } else {
    window.kan.playing = false;
    $body.removeClass(playingClass);
  }
}

export function stopPlaying(mute = false) {
  if (!!mute) {
    Howler.mute(true);
  }

  window.kan.playing = false;
  $body.removeClass(playingClass);

  stopComposition();
}

function asyncGetShapeSoundFromShapeName(shapeName) {
  const shapeSoundJSONPath = `./audio/shapes/${shapeName}/${shapeName}.json`;
  return $.getJSON(shapeSoundJSONPath).then(function(resp) {
    const shapeSoundData = formatShapeSoundData(shapeName, resp);
    const sound = new Howl(shapeSoundData);
    return {
      shapeName: shapeName,
      sound: sound
    }
  });
}

export function asyncInitShapeSounds() {
  let returnSounds = {};
  const extensions = ['ogg', 'm4a', 'mp3', 'ac3'];

  const shapeNames = shape.shapeNames;
  let promises = [];
  Base.each(shapeNames, function(shapeName) {
    promises.push(asyncGetShapeSoundFromShapeName(shapeName));
  });

  return $.when.apply($, promises).done(function() {
    let returnSounds = {};
    for (let i = 0; i < arguments.length; i++) {
      let arg = arguments[i];
      returnSounds[arg.shapeName] = arg.sound;
    }

    window.kan.shapeSounds = returnSounds;
    return returnSounds;
  });
}

export function formatShapeSoundData(shapeName, data) {
  let returnData = {};

  returnData.src = data.urls.map((url) => `./audio/shapes/${shapeName}/${url}`);
  returnData.sprite = data.sprite;
  returnData.html5 = true;
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

function animateShapePlay(shape) {
  const item = paper.project.getItem({
    className: 'Path',
    match: function(el) {
      return (el.id === shape.pathId);
    }
  });
  if (!!item) {
    let group = item.parent;
    group.data.animating = true;
    const totalDuration = measureLength / 2;
    group.animate([
      {
        properties: {
          scale: 1.15,
        },
        settings: {
          duration: totalDuration / 4,
          easing: "easeOut",
          complete: function() {
            console.log('scale animation step 1')
          },
        }
      },
      {
        properties: {
          scale: 1,
        },
        settings: {
          duration: totalDuration - (totalDuration / 4),
          easing: "easeIn",
          complete: function() {
            this.data.animating = false;
            // console.log('animation step 3')
          }
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
    window.kan.soundTimeouts.forEach(function(soundTimeout) {
      clearTimeout(soundTimeout);
    });
  }

  window.kan.soundTimeouts = [];
}

export function startComposition(composition, loop = false) {
  stopComposition();
  tutorial.hideContextualTuts();

  clearTimeout(window.kan.playPromptTimeout);

  let iterations = 0;
  playCompositionFirstTime();

  function playCompositionFirstTime() {
    clearSoundTimeouts();
    // console.log('playing composition first time');
    let trimmedCompositionObj = getTrimmedCompositionObj(composition);

    Base.each(trimmedCompositionObj.composition, function(shape, i) {
      let soundTimeout = setTimeout(function() {
        if (!window.kan.playing) {
          // console.log('not playing, returning');
          return;
        }

        if (shape.spriteName === null) {
          // console.log('%cshape is null', 'color:red', shape);
          return;
        }

        // console.log('playing: ', shape.sound, shape.spriteName, shape.startTime);
        shape.play();
        animateShapePlay(shape);
      }, shape.startTime);
      window.kan.soundTimeouts.push(soundTimeout);
    });

    iterations++;
    window.kan.compositionTimeout = setTimeout(repeatComposition, compositionLength - trimmedCompositionObj.startTime);
  }

  function playCompositionOnce() {
    clearSoundTimeouts();
    // console.log('repeat');
    Base.each(composition, function(shape, i) {
      let soundTimeout = setTimeout(function() {
        if (!window.kan.playing) {
          // console.log('not playing, returing');
          return;
        }

        // console.log('playing: ', shape.sound, shape.spriteName, shape.startTime);
        shape.sound.play(shape.spriteName);
        animateShapePlay(shape);
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

  composition.forEach(function(sound) {
    let modifiedSound = util.shallowCopy(sound);
    modifiedSound.startTime = sound.startTime - startTime;
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

  composition.forEach(function(sound) {
    // console.log(sound);
    // console.log(sound.startTime)
    if ('startTime' in sound && sound.startTime < startTime) {
      startTime = sound.startTime;
    }
  });

  // console.log('start time', startTime);

  if (startTime !== compositionLength) {
    return startTime;
  } else {
    return 0;
  }
}
