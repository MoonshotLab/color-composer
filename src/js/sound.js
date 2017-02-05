const config = require('./../../config');

export function initShapeSounds() {
  let returnSounds = {};
  const extensions = ['ogg', 'm4a', 'mp3', 'ac3'];

  Base.each(config.shapes, (shape, i) => {
    if (shape.sprite) {
      let shapeSoundJSONPath = `./audio/shapes/${shape.name}/${shape.name}.json`;
      $.getJSON(shapeSoundJSONPath)
        .then((resp) => {
          let shapeSoundData = formatShapeSoundData(shape.name, resp);
          let sound = new Howl(shapeSoundData);
          returnSounds[shape.name] = sound;
        });
    } else {
      // let sound = new Howl({
      //   src: extensions.map((extension) => `./audio/shapes/${shape.name}/${shape.name}.${extension}`),
      // });
      // console.log({
      //   src: extensions.map((extension) => `./audio/shapes/${shape.name}/${shape.name}.${extension}`),
      // })
      let sound = new Howl({
        src: `./audio/shapes/${shape.name}/${shape.name}.mp3`
      });
      returnSounds[shape.name] = sound;
    }
  });

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
