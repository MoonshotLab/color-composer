console.log('hi');

// let audioDataPath = './audio/shapes/circle/circle.json';
let sound = new Howl({
  src: '/audio/shapes/circle/circle.mp3',
  sprite: {
    black: [0,0.47634920634920636 * 1000],
    blue: [2 * 1000, 0.47798185941043103 * 1000],
    red: [4 * 1000, 0.4775736961451251 * 1000],
    orange: [6 * 1000, 0.4775736961451251 * 1000],
    brown: [8 * 1000, 0.4780045351473916 * 1000],
    green: [10 * 1000, 0.4771655328798179 * 1000]
  },
  onend: function() {
    console.log('done');
  }
});

sound.play('black');
