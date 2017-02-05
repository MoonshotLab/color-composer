const config = require('./../../config');

export function initShapeSounds() {
  let returnSounds = {};
  const extensions = ['ogg', 'm4a', 'mp3', 'ac3'];

  let shapePromises = [];
  Base.each(config.shapes, (shape, shapeName) => {
    // console.log(shape, shapeName);
    if (shape.sprite) {
      let shapeSoundJSONPath = `./audio/shapes/${shapeName}/${shapeName}.json`;
      let shapePromise = $.getJSON(shapeSoundJSONPath, (resp) => {
        let shapeSoundData = formatShapeSoundData(shapeName, resp);
        console.log(JSON.stringify(shapeSoundData));
        let sound = new Howl(shapeSoundData);
        returnSounds[shapeName] = sound;
      });
      shapePromises.push(shapePromise);
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

  return $.when(shapePromises)
    .then(() => {
      return returnSounds;
    })

}

export function formatShapeSoundData(shapeName, data) {
  let returnData = {};

  returnData.src = data.resources.map((resource) => `./audio/shapes/${shapeName}/${resource}`);

  returnData.sprite = {};
  Base.each(data.spritemap, (sprite, spriteName) => {
    returnData.sprite[spriteName] = [sprite.start, sprite.end - sprite.start];
  });
  returnData.onend = function() {
    console.log('done');
  }
  returnData.html5 = true;

  return returnData;
}
