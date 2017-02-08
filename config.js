exports.palette = {
  colors: ["#20171C", "#1E2A43", "#28377D", "#352747", "#CA2E26", "#9A2A1F", "#DA6C26", "#453121", "#916A47", "#DAAD27", "#7F7D31","#2B5E2E"],
  colorNames: {
    "#20171C": "black",
    "#1E2A43": "blue",
    "#28377D": "blue",
    "#352747": "blue",
    "#CA2E26": "red",
    "#9A2A1F": "red",
    "#DA6C26": "orange",
    "#453121": "brown",
    "#916A47": "brown",
    "#DAAD27": "orange",
    "#7F7D31": "green",
    "#2B5E2E": "green"
  },
  pops: ["#00ADEF", "#F285A5", "#7DC57F", "#F6EB16", "#F4EAE0"],
  colorSize: 20,
  selectedColorSize: 30
}

exports.shape = {
  extendingThreshold: 0.1,
  trimmingThreshold: 0.075,
  cornerThresholdDeg: 30
}

exports.shapes = {
  "line": {
    sprite: false,
  },
  "circle": {
    sprite: true,
  },
  "square": {
    sprite: true,
  },
  "triangle": {
    sprite: false,
  },
  "other": {
    sprite: false,
  }
};

exports.log = true;

exports.runAnimations = false;

exports.sound = {
  bpm: 140,
  measures: 4
}
