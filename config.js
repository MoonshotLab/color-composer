exports.runAnimations = false;
exports.pop = true;
exports.canvasId = 'canvas';
exports.maxShapes = 5;

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
  gradients: {
    '#20171C': ['#20171C', '#000000'],
    '#1E2A43': ['#1E2A43', '#263166'],
    '#28377D': ['#28377D', '#1E4695'],
    '#352747': ['#352747', '#45005B'],
    '#CA2E26': ['#CA2E26', '#9B352F'],
    '#9A2A1F': ['#9A2A1F', '#CD3621'],
    '#DA6C26': ['#DA6C26', '#BD4820'],
    '#453121': ['#453121', '#281806'],
    '#916A47': ['#916A47', '#623A22'],
    '#DAAD27': ['#DAAD27', '#AF871D'],
    '#7F7D31': ['#7F7D31', '#555827'],
    '#2B5E2E': ['#2B5E2E', '#16451D'],
  },
  pops: ["#00ADEF", "#F285A5", "#7DC57F", "#F6EB16", "#F4EAE0"],
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
