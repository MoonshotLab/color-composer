require('howler');

const ui = require('./ui');
const shape = require('./shape');

const measures = 4;
const bpm = 120;
const beatLength = (60 / bpm) * 1000; // ms
const measureLength = beatLength * 4;
export const compositionLength = measureLength * measures;

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
  Base.each(shapeNames, (shape, shapeName) => {
    // console.log(shape, shapeName);
    if (shape.sprite) {
      let shapeSoundJSONPath = `./audio/shapes/${shapeName}/${shapeName}.json`;
      $.getJSON(shapeSoundJSONPath, (resp) => {
        let shapeSoundData = formatShapeSoundData(shapeName, resp);
        let sound = new Howl(shapeSoundData);
        returnSounds[shapeName] = sound;
      });
    } else {
      // let sound = new Howl({
      //   src: extensions.map((extension) => `./audio/shapes/${shape.name}/${shape.name}.${extension}`),
      // });
      // console.log({
      //   src: extensions.map((extension) => `./audio/shapes/${shape.name}/${shape.name}.${extension}`),
      // }) Math.
      let sound = new Howl({
        src: `./audio/shapes/${shapeName}/${shapeName}.mp3`,
      });
      returnSounds[shapeName] = sound;
    }
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

export function startComposition(composition) {
  function playCompositionOnce() {
    console.log('repeat');
    Base.each(composition, (shape, i) => {
      console.log(shape);
      if (shape.sprite) {
        setTimeout(() => {
          console.log(`playing shape ${shape.groupId}`);
          shape.sound.play(shape.spriteName);
        }, shape.startTime);
      } else {
        setTimeout(() => {
          console.log(`playing shape ${shape.groupId}`);
          shape.sound.play();
        }, shape.startTime);
      }
    });
  }

  playCompositionOnce();
  return setInterval(playCompositionOnce, compositionLength);
}

export function stopComposition(interval) {
  clearInterval(interval);
}
