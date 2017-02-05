const config = require('./../../config');

export function initShapeSounds() {
  let returnSounds = {};
  const extensions = ['ogg', 'm4a', 'mp3', 'ac3'];

  Base.each(config.shapes, (shape, shapeName) => {
    console.log(shape, shapeName);
    if (shape.sprite) {
      let shapeSoundJSONPath = `./audio/shapes/${shapeName}/${shapeName}.json`;
      $.getJSON(shapeSoundJSONPath)
        .then((resp) => {
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
      // })
      let sound = new Howl({
        src: `./audio/shapes/${shapeName}/${shapeName}.mp3`
      });
      returnSounds[shapeName] = sound;
    }
  });

  console.log(returnSounds);
  return returnSounds;
}

export function formatShapeSoundData(shapeName, data) {
  let returnData = {};

  returnData.src = data.resources.map((resource) => `./audio/shapes/${shapeName}/${resource}`);

  returnData.sprite = {};
  Base.each(data.spritemap, (sprite, spriteName) => {
    returnData.sprite[spriteName] = [sprite.start, sprite.end];
  });

  return returnData;
}
