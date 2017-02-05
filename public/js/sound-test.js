console.log('hi');

// let audioDataPath = './audio/shapes/circle/circle.json';
let sound = new Howl({
  src: '/audio/shapes/circle/circle.mp3',
  sprite: {
    black: [0,0.47634920634920636],
    blue: [2,0.47798185941043103],
    red: [4,0.4775736961451251],
    orange: [6,0.4775736961451251],
    brown: [8,0.4780045351473916],
    green: [10,0.4771655328798179]
  },
  onend: function() {
    console.log('done');
  }
});

sound.play('black');
