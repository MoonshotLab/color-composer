exports.runAnimations = false;
exports.canvasId = 'canvas';

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
  pops: {
    cyan: "#00ADEF",
    pink: "#F285A5",
    green: "#7DC57F",
    yellow: "#F6EB16",
    tan: "#F4EAE0"
  },
  colorSize: 20,
  selectedColorSize: 30
};

exports.contextualTuts = [
  {
    type: "fill",
    copy: "<strong>Double-tap</strong> a filled shape to <strong>UNFILL</strong> it. Repeat to <strong>FILL</strong> an unfilled shape.",
  },
  {
    type: "pinch",
    copy: "<strong>Pinch</strong> shapes with <strong>TWO FINGERS</strong> to <strong>resize</strong> and <strong>move</strong> them.",
  },
  {
    type: "swipe",
    copy: "To <strong>remove</strong> shapes, <strong>pinch</strong> with <strong>two fingers</strong> then <strong>swipe</strong> or hit <strong>undo</strong>."
  },
];
