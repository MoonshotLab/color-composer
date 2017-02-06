const config = require('./../../config');

export function initShapeSounds() {
  let returnSounds = {};
  const extensions = ['ogg', 'm4a', 'mp3', 'ac3'];

  Base.each(config.shapes, (shape, shapeName) => {
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

  return returnData;
}

export function quantizeLength(duration) {
  const smallestDuration = (60 / config.sound.bpm);
  const returnDuration = Math.floor(duration / smallestDuration) * smallestDuration;

  if (returnDuration > 0) {
    return returnDuration;
  } else {
    // always return something greater than zero
    return smallestDuration;
  }
}

export function quantizePosition(position, viewWidth) {
  const smallestInterval = viewWidth / (4 * config.sound.measures);
  return returnPosition = Math.floor(position / smallestInterval) * smallestInterval;
}

export function startComposition(composition) {
  const beatLength = (60 / config.sound.bpm) * 1000;
  const measureLength = beatLength * 4;
  const compositionLength = measureLength * config.sound.measures - 250; // adjust for time to set up

  function playCompositionOnce() {
    console.log('repeat');
    Base.each(composition, (shape, i) => {
      console.log(shape);
      if (shape.sprite) {
        setTimeout(() => {
          console.log(`playing shape ${shape.groupId}`);
          shape.sound.loop(true);
          shape.sound.play(shape.spriteName);
        }, shape.startTime);

        setTimeout(() => {
          console.log(`stopping shape ${shape.groupId}`);
          shape.sound.stop();
        }, shape.startTime + shape.duration)
      } else {
        setTimeout(() => {
          console.log(`playing shape ${shape.groupId}`);
          shape.sound.loop(true);
          shape.sound.play();
        }, shape.startTime);

        setTimeout(() => {
          console.log(`stopping shape ${shape.groupId}`);
          shape.sound.stop();
        }, shape.startTime + shape.duration)
      }
    });
  }

  playCompositionOnce();
  return setInterval(playCompositionOnce, compositionLength);
}

export function stopComposition(interval) {
  clearInterval(interval);
}
