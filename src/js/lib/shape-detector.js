(function(root, factory) {

  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module !== "undefined" && module.exports) {
    module.exports = factory();
  } else {
    root.ShapeDetector = factory();
  }
}(this, function() {

  var _nbSamplePoints;
  var _squareSize = 250;
  var _phi = 0.5 * (-1.0 + Math.sqrt(5.0));
  var _angleRange = deg2Rad(45.0);
  var _anglePrecision = deg2Rad(2.0);
  var _halfDiagonal = Math.sqrt(_squareSize * _squareSize + _squareSize * _squareSize) * 0.5;
  var _origin = {
    x: 0,
    y: 0
  };

  function deg2Rad(d) {

    return d * Math.PI / 180.0;
  };

  function getDistance(a, b) {

    var dx = b.x - a.x;
    var dy = b.y - a.y;

    return Math.sqrt(dx * dx + dy * dy);
  };

  function Stroke(points, name) {

    this.points = points;
    this.name = name;
    this.processStroke();
  };

  Stroke.prototype.processStroke = function() {

    this.points = this.resample();
    this.setCentroid();
    this.points = this.rotateBy(-this.indicativeAngle());
    this.points = this.scaleToSquare();
    this.setCentroid();
    this.points = this.translateToOrigin();

    return this;
  };

  Stroke.prototype.resample = function() {

    var localDistance, q;
    var interval = this.strokeLength() / (_nbSamplePoints - 1);
    var distance = 0.0;
    var newPoints = [this.points[0]];

    for (var i = 1; i < this.points.length; i++) {
      localDistance = getDistance(this.points[i - 1], this.points[i]);

      if (distance + localDistance >= interval) {
        q = {
          x: this.points[i - 1].x + ((interval - distance) / localDistance) * (this.points[i].x - this.points[i - 1].x),
          y: this.points[i - 1].y + ((interval - distance) / localDistance) * (this.points[i].y - this.points[i - 1].y)
        };

        newPoints.push(q);
        this.points.splice(i, 0, q);
        distance = 0.0;
      } else {
        distance += localDistance;
      }
    }

    if (newPoints.length === _nbSamplePoints - 1) {
      newPoints.push(this.points[this.points.length - 1]);
    }

    return newPoints;
  };

  Stroke.prototype.rotateBy = function(angle) {

    var point;
    var cos = Math.cos(angle);
    var sin = Math.sin(angle);
    var newPoints = [];

    for (var i = 0; i < this.points.length; i++) {
      point = this.points[i];

      newPoints.push({
        x: (point.x - this.c.x) * cos - (point.y - this.c.y) * sin + this.c.x,
        y: (point.x - this.c.x) * sin + (point.y - this.c.y) * cos + this.c.y
      });
    }

    return newPoints;
  };

  Stroke.prototype.scaleToSquare = function() {

    var point;
    var newPoints = []
    var box = {
      minX: +Infinity,
      maxX: -Infinity,
      minY: +Infinity,
      maxY: -Infinity
    };

    for (var i = 0; i < this.points.length; i++) {
      point = this.points[i];

      box.minX = Math.min(box.minX, point.x);
      box.minY = Math.min(box.minY, point.y);
      box.maxX = Math.max(box.maxX, point.x);
      box.maxY = Math.max(box.maxY, point.y);
    }

    box.width = box.maxX - box.minX;
    box.height = box.maxY - box.minY;

    for (i = 0; i < this.points.length; i++) {
      point = this.points[i];

      newPoints.push({
        x: point.x * (_squareSize / box.width),
        y: point.y * (_squareSize / box.height)
      });
    }

    return newPoints;
  };

  Stroke.prototype.translateToOrigin = function(points) {

    var point;
    var newPoints = [];

    for (var i = 0; i < this.points.length; i++) {
      point = this.points[i];

      newPoints.push({
        x: point.x + _origin.x - this.c.x,
        y: point.y + _origin.y - this.c.y
      });
    }

    return newPoints;
  };

  Stroke.prototype.setCentroid = function() {

    var point;
    this.c = {
      x: 0.0,
      y: 0.0
    };

    for (var i = 0; i < this.points.length; i++) {
      point = this.points[i];

      this.c.x += point.x;
      this.c.y += point.y;
    }

    this.c.x /= this.points.length;
    this.c.y /= this.points.length;

    return this;
  };

  Stroke.prototype.indicativeAngle = function() {

    return Math.atan2(this.c.y - this.points[0].y, this.c.x - this.points[0].x);
  };

  Stroke.prototype.strokeLength = function() {

    var d = 0.0;

    for (var i = 1; i < this.points.length; i++) {
      d += getDistance(this.points[i - 1], this.points[i]);
    }

    return d;
  };

  Stroke.prototype.distanceAtBestAngle = function(pattern) {

    var a = -_angleRange;
    var b = _angleRange;
    var x1 = _phi * a + (1.0 - _phi) * b;
    var f1 = this.distanceAtAngle(pattern, x1);
    var x2 = (1.0 - _phi) * a + _phi * b;
    var f2 = this.distanceAtAngle(pattern, x2);

    while (Math.abs(b - a) > _anglePrecision) {

      if (f1 < f2) {
        b = x2;
        x2 = x1;
        f2 = f1;
        x1 = _phi * a + (1.0 - _phi) * b;
        f1 = this.distanceAtAngle(pattern, x1);
      } else {
        a = x1;
        x1 = x2;
        f1 = f2;
        x2 = (1.0 - _phi) * a + _phi * b;
        f2 = this.distanceAtAngle(pattern, x2);
      }
    }

    return Math.min(f1, f2);
  };

  Stroke.prototype.distanceAtAngle = function(pattern, angle) {

    var strokePoints = this.rotateBy(angle);
    var patternPoints = pattern.points;
    var d = 0.0;

    for (var i = 0; i < strokePoints.length; i++) {
      d += getDistance(strokePoints[i], patternPoints[i]);
    }

    return d / strokePoints.length;
  };

  function ShapeDetector(patterns, options) {

    options = options || {};
    this.threshold = options.threshold || 0;
    _nbSamplePoints = options.nbSamplePoints || 64;

    this.patterns = [];

    for (var i = 0; i < patterns.length; i++) {
      this.learn(patterns[i].name, patterns[i].points);
    }
  }

  ShapeDetector.defaultShapes = [
    {
      points: [{ x: 0, y: 50 }, { x: 100, y: 50 }],
      name: "line"
    },
    {
      points: [{ x: 50, y: 0 }, { x: 50, y: 100 }],
      name: "line"
    },
    {
      points: [{ x: 0, y: 0 }, { x: 100, y: 100 }],
      name: "line"
    },
    {
      points: [{"x": 89,"y": 164},{"x": 90,"y": 162},{"x": 92,"y": 162},{"x": 94,"y": 164},{"x": 95,"y": 166},{"x": 96,"y": 169},{"x": 97,"y": 171},{"x": 99,"y": 175},{"x": 101,"y": 178},{"x": 103,"y": 182},{"x": 106,"y": 189},{"x": 108,"y": 194},{"x": 111,"y": 199},{"x": 114,"y": 204},{"x": 117,"y": 209},{"x": 119,"y": 214},{"x": 122,"y": 218},{"x": 124,"y": 222},{"x": 126,"y": 225},{"x": 128,"y": 228},{"x": 130,"y": 229},{"x": 133,"y": 233},{"x": 134,"y": 236},{"x": 136,"y": 239},{"x": 138,"y": 240},{"x": 139,"y": 242},{"x": 140,"y": 244},{"x": 142,"y": 242},{"x": 142,"y": 240},{"x": 142,"y": 237},{"x": 143,"y": 235},{"x": 143,"y": 233},{"x": 145,"y": 229},{"x": 146,"y": 226},{"x": 148,"y": 217},{"x": 149,"y": 208},{"x": 149,"y": 205},{"x": 151,"y": 196},{"x": 151,"y": 193},{"x": 153,"y": 182},{"x": 155,"y": 172},{"x": 157,"y": 165},{"x": 159,"y": 160},{"x": 162,"y": 155},{"x": 164,"y": 150},{"x": 165,"y": 148},{"x": 166,"y": 146}],
      name: "line"
    },
    {
      points: [{"x": 91,"y": 185},{"x": 93,"y": 185},{"x": 95,"y": 185},{"x": 97,"y": 185},{"x": 100,"y": 188},{"x": 102,"y": 189},{"x": 104,"y": 190},{"x": 106,"y": 193},{"x": 108,"y": 195},{"x": 110,"y": 198},{"x": 112,"y": 201},{"x": 114,"y": 204},{"x": 115,"y": 207},{"x": 117,"y": 210},{"x": 118,"y": 212},{"x": 120,"y": 214},{"x": 121,"y": 217},{"x": 122,"y": 219},{"x": 123,"y": 222},{"x": 124,"y": 224},{"x": 126,"y": 226},{"x": 127,"y": 229},{"x": 129,"y": 231},{"x": 130,"y": 233},{"x": 129,"y": 231},{"x": 129,"y": 228},{"x": 129,"y": 226},{"x": 129,"y": 224},{"x": 129,"y": 221},{"x": 129,"y": 218},{"x": 129,"y": 212},{"x": 129,"y": 208},{"x": 130,"y": 198},{"x": 132,"y": 189},{"x": 134,"y": 182},{"x": 137,"y": 173},{"x": 143,"y": 164},{"x": 147,"y": 157},{"x": 151,"y": 151},{"x": 155,"y": 144},{"x": 161,"y": 137},{"x": 165,"y": 131},{"x": 171,"y": 122},{"x": 174,"y": 118},{"x": 176,"y": 114},{"x": 177,"y": 112},{"x": 177,"y": 114},{"x": 175,"y": 116},{"x": 173,"y": 118}],
      name: "line"
    },
    {
      points: [{"x":113,"y":68},{"x":86,"y":79},{"x":63,"y":131},{"x":78,"y":147},{"x":156,"y":149},{"x":195,"y":100},{"x":189,"y":79},{"x":125.73497,"y":62.81168}],
      name: "circle"
    },
    {
      points: [{"x":98,"y":67},{"x":77,"y":85},{"x":77,"y":162},{"x":179,"y":156},{"x":197,"y":123},{"x":167,"y":63},{"x":141,"y":61},{"x":110,"y":59},{"x":106.51192,"y":59.70407}],
      name: "circle"
    },
    {
      points: [{"x":60,"y":47},{"x":43,"y":96},{"x":52,"y":206},{"x":63,"y":246},{"x":118,"y":296},{"x":144,"y":246},{"x":141,"y":147},{"x":133,"y":129},{"x":113,"y":80},{"x":60.42738,"y":45.76813}],
      name: "circle"
    },
    {
      points: [{"x": 127,"y": 141},{"x": 124,"y": 140},{"x": 120,"y": 139},{"x": 118,"y": 139},{"x": 116,"y": 139},{"x": 111,"y": 140},{"x": 109,"y": 141},{"x": 104,"y": 144},{"x": 100,"y": 147},{"x": 96,"y": 152},{"x": 93,"y": 157},{"x": 90,"y": 163},{"x": 87,"y": 169},{"x": 85,"y": 175},{"x": 83,"y": 181},{"x": 82,"y": 190},{"x": 82,"y": 195},{"x": 83,"y": 200},{"x": 84,"y": 205},{"x": 88,"y": 213},{"x": 91,"y": 216},{"x": 96,"y": 219},{"x": 103,"y": 222},{"x": 108,"y": 224},{"x": 111,"y": 224},{"x": 120,"y": 224},{"x": 133,"y": 223},{"x": 142,"y": 222},{"x": 152,"y": 218},{"x": 160,"y": 214},{"x": 167,"y": 210},{"x": 173,"y": 204},{"x": 178,"y": 198},{"x": 179,"y": 196},{"x": 182,"y": 188},{"x": 182,"y": 177},{"x": 178,"y": 167},{"x": 170,"y": 150},{"x": 163,"y": 138},{"x": 152,"y": 130},{"x": 143,"y": 129},{"x": 140,"y": 131},{"x": 129,"y": 136},{"x": 126,"y": 139}],
      name: "circle"
    },
    {
      points: [{"x":516,"y":284},{"x":496,"y":319},{"x":496,"y":329},{"x":513,"y":329},{"x":550,"y":324},{"x":696,"y":305},{"x":737,"y":298},{"x":746,"y":292},{"x":734,"y":278},{"x":709,"y":252},{"x":664,"y":193}],
      name: "triangle"
    },
    {
      points: [{"x":179,"y":159},{"x":152,"y":290},{"x":143,"y":336},{"x":142,"y":355},{"x":160,"y":348},{"x":208,"y":337},{"x":241,"y":330},{"x":256,"y":328},{"x":254,"y":315},{"x":238,"y":277},{"x":210,"y":200},{"x":182.94356,"y":110.45656}],
      name: "triangle"
    },
    {
      points: [{"x":105,"y":335},{"x":115,"y":362},{"x":128,"y":338},{"x":163,"y":271},{"x":241,"y":135},{"x":261,"y":104},{"x":267,"y":98},{"x":261,"y":102},{"x":236,"y":119},{"x":151,"y":195},{"x":108,"y":235},{"x":83,"y":267},{"x":79.92616,"y":270.93451}],
      name: "triangle"
    },
    {
      points: [{"x": 137,"y": 139},{"x": 135,"y": 141},{"x": 133,"y": 144},{"x": 132,"y": 146},{"x": 130,"y": 149},{"x": 128,"y": 151},{"x": 126,"y": 155},{"x": 123,"y": 160},{"x": 120,"y": 166},{"x": 116,"y": 171},{"x": 112,"y": 177},{"x": 107,"y": 183},{"x": 102,"y": 188},{"x": 100,"y": 191},{"x": 95,"y": 195},{"x": 90,"y": 199},{"x": 86,"y": 203},{"x": 82,"y": 206},{"x": 80,"y": 209},{"x": 75,"y": 213},{"x": 73,"y": 213},{"x": 70,"y": 216},{"x": 67,"y": 219},{"x": 64,"y": 221},{"x": 61,"y": 223},{"x": 60,"y": 225},{"x": 62,"y": 226},{"x": 65,"y": 225},{"x": 67,"y": 226},{"x": 74,"y": 226},{"x": 77,"y": 227},{"x": 85,"y": 229},{"x": 91,"y": 230},{"x": 99,"y": 231},{"x": 108,"y": 232},{"x": 116,"y": 233},{"x": 125,"y": 233},{"x": 134,"y": 234},{"x": 145,"y": 233},{"x": 153,"y": 232},{"x": 160,"y": 233},{"x": 170,"y": 234},{"x": 177,"y": 235},{"x": 179,"y": 236},{"x": 186,"y": 237},{"x": 193,"y": 238},{"x": 198,"y": 239},{"x": 200,"y": 237},{"x": 202,"y": 239},{"x": 204,"y": 238},{"x": 206,"y": 234},{"x": 205,"y": 230},{"x": 202,"y": 222},{"x": 197,"y": 216},{"x": 192,"y": 207},{"x": 186,"y": 198},{"x": 179,"y": 189},{"x": 174,"y": 183},{"x": 170,"y": 178},{"x": 164,"y": 171},{"x": 161,"y": 168},{"x": 154,"y": 160},{"x": 148,"y": 155},{"x": 143,"y": 150},{"x": 138,"y": 148},{"x": 136,"y": 148}],
      name: "triangle"
    },
    {
      points: [{x: 0, y: 0}, {x: 0, y: 50}, {x: 50, y: 50}, {x: 50, y: 0}],
      name: "square"
    },
    {
      points: [{x: 0, y: 0}, {x: 0, y: 100}, {x: 50, y: 100}, {x: 50, y: 0}],
      name: "square"
    },
    {
      points: [{"x": 78,"y": 149},{"x": 78,"y": 153},{"x": 78,"y": 157},{"x": 78,"y": 160},{"x": 79,"y": 162},{"x": 79,"y": 164},{"x": 79,"y": 167},{"x": 79,"y": 169},{"x": 79,"y": 173},{"x": 79,"y": 178},{"x": 79,"y": 183},{"x": 80,"y": 189},{"x": 80,"y": 193},{"x": 80,"y": 198},{"x": 80,"y": 202},{"x": 81,"y": 208},{"x": 81,"y": 210},{"x": 81,"y": 216},{"x": 82,"y": 222},{"x": 82,"y": 224},{"x": 82,"y": 227},{"x": 83,"y": 229},{"x": 83,"y": 231},{"x": 85,"y": 230},{"x": 88,"y": 232},{"x": 90,"y": 233},{"x": 92,"y": 232},{"x": 94,"y": 233},{"x": 99,"y": 232},{"x": 102,"y": 233},{"x": 106,"y": 233},{"x": 109,"y": 234},{"x": 117,"y": 235},{"x": 123,"y": 236},{"x": 126,"y": 236},{"x": 135,"y": 237},{"x": 142,"y": 238},{"x": 145,"y": 238},{"x": 152,"y": 238},{"x": 154,"y": 239},{"x": 165,"y": 238},{"x": 174,"y": 237},{"x": 179,"y": 236},{"x": 186,"y": 235},{"x": 191,"y": 235},{"x": 195,"y": 233},{"x": 197,"y": 233},{"x": 200,"y": 233},{"x": 201,"y": 235},{"x": 201,"y": 233},{"x": 199,"y": 231},{"x": 198,"y": 226},{"x": 198,"y": 220},{"x": 196,"y": 207},{"x": 195,"y": 195},{"x": 195,"y": 181},{"x": 195,"y": 173},{"x": 195,"y": 163},{"x": 194,"y": 155},{"x": 192,"y": 145},{"x": 192,"y": 143},{"x": 192,"y": 138},{"x": 191,"y": 135},{"x": 191,"y": 133},{"x": 191,"y": 130},{"x": 190,"y": 128},{"x": 188,"y": 129},{"x": 186,"y": 129},{"x": 181,"y": 132},{"x": 173,"y": 131},{"x": 162,"y": 131},{"x": 151,"y": 132},{"x": 149,"y": 132},{"x": 138,"y": 132},{"x": 136,"y": 132},{"x": 122,"y": 131},{"x": 120,"y": 131},{"x": 109,"y": 130},{"x": 107,"y": 130},{"x": 90,"y": 132},{"x": 81,"y": 133},{"x": 76,"y": 133}],
      name: "square"
    },
    {
      points: [{"x":67,"y":172},{"x":80,"y":85},{"x":83,"y":58},{"x":83,"y":54},{"x":136,"y":110},{"x":157,"y":136},{"x":162,"y":140},{"x":166,"y":143},{"x":80,"y":124},{"x":45,"y":116},{"x":37,"y":114},{"x":31,"y":113},{"x":52,"y":106},{"x":101,"y":86},{"x":131,"y":75},{"x":157,"y":63},{"x":163,"y":62},{"x":158,"y":64},{"x":153,"y":73},{"x":128,"y":103},{"x":71,"y":170}],
      name: "other"
    },
    {
      points: [{"x":30,"y":69},{"x":116,"y":118},{"x":90,"y":164},{"x":75,"y":117},{"x":157,"y":83},{"x":182,"y":140},{"x":155,"y":163},{"x":144,"y":119},{"x":221,"y":54}],
      name: "other"
    },
    {
      points: [{"x":87,"y":76},{"x":62,"y":73},{"x":100,"y":98},{"x":107,"y":57},{"x":61,"y":38},{"x":73,"y":137}],
      name: "other"
    },
    {
      points: [{"x": 123,"y": 129},{"x": 123,"y": 131},{"x": 124,"y": 133},{"x": 125,"y": 136},{"x": 127,"y": 140},{"x": 129,"y": 142},{"x": 133,"y": 148},{"x": 137,"y": 154},{"x": 143,"y": 158},{"x": 145,"y": 161},{"x": 148,"y": 164},{"x": 153,"y": 170},{"x": 158,"y": 176},{"x": 160,"y": 178},{"x": 164,"y": 183},{"x": 168,"y": 188},{"x": 171,"y": 191},{"x": 175,"y": 196},{"x": 178,"y": 200},{"x": 180,"y": 202},{"x": 181,"y": 205},{"x": 184,"y": 208},{"x": 186,"y": 210},{"x": 187,"y": 213},{"x": 188,"y": 215},{"x": 186,"y": 212},{"x": 183,"y": 211},{"x": 177,"y": 208},{"x": 169,"y": 206},{"x": 162,"y": 205},{"x": 154,"y": 207},{"x": 145,"y": 209},{"x": 137,"y": 210},{"x": 129,"y": 214},{"x": 122,"y": 217},{"x": 118,"y": 218},{"x": 111,"y": 221},{"x": 109,"y": 222},{"x": 110,"y": 219},{"x": 112,"y": 217},{"x": 118,"y": 209},{"x": 120,"y": 207},{"x": 128,"y": 196},{"x": 135,"y": 187},{"x": 138,"y": 183},{"x": 148,"y": 167},{"x": 157,"y": 153},{"x": 163,"y": 145},{"x": 165,"y": 142},{"x": 172,"y": 133},{"x": 177,"y": 127},{"x": 179,"y": 127},{"x": 180,"y": 125}],
      name: "other"
    },
    {
      points: [{"x": 81,"y": 219},{"x": 84,"y": 218},{"x": 86,"y": 220},{"x": 88,"y": 220},{"x": 90,"y": 220},{"x": 92,"y": 219},{"x": 95,"y": 220},{"x": 97,"y": 219},{"x": 99,"y": 220},{"x": 102,"y": 218},{"x": 105,"y": 217},{"x": 107,"y": 216},{"x": 110,"y": 216},{"x": 113,"y": 214},{"x": 116,"y": 212},{"x": 118,"y": 210},{"x": 121,"y": 208},{"x": 124,"y": 205},{"x": 126,"y": 202},{"x": 129,"y": 199},{"x": 132,"y": 196},{"x": 136,"y": 191},{"x": 139,"y": 187},{"x": 142,"y": 182},{"x": 144,"y": 179},{"x": 146,"y": 174},{"x": 148,"y": 170},{"x": 149,"y": 168},{"x": 151,"y": 162},{"x": 152,"y": 160},{"x": 152,"y": 157},{"x": 152,"y": 155},{"x": 152,"y": 151},{"x": 152,"y": 149},{"x": 152,"y": 146},{"x": 149,"y": 142},{"x": 148,"y": 139},{"x": 145,"y": 137},{"x": 141,"y": 135},{"x": 139,"y": 135},{"x": 134,"y": 136},{"x": 130,"y": 140},{"x": 128,"y": 142},{"x": 126,"y": 145},{"x": 122,"y": 150},{"x": 119,"y": 158},{"x": 117,"y": 163},{"x": 115,"y": 170},{"x": 114,"y": 175},{"x": 117,"y": 184},{"x": 120,"y": 190},{"x": 125,"y": 199},{"x": 129,"y": 203},{"x": 133,"y": 208},{"x": 138,"y": 213},{"x": 145,"y": 215},{"x": 155,"y": 218},{"x": 164,"y": 219},{"x": 166,"y": 219},{"x": 177,"y": 219},{"x": 182,"y": 218},{"x": 192,"y": 216},{"x": 196,"y": 213},{"x": 199,"y": 212},{"x": 201,"y": 211}],
      name: "other"
    },
    {
      points: [{"x": 75,"y": 250},{"x": 75,"y": 247},{"x": 77,"y": 244},{"x": 78,"y": 242},{"x": 79,"y": 239},{"x": 80,"y": 237},{"x": 82,"y": 234},{"x": 82,"y": 232},{"x": 84,"y": 229},{"x": 85,"y": 225},{"x": 87,"y": 222},{"x": 88,"y": 219},{"x": 89,"y": 216},{"x": 91,"y": 212},{"x": 92,"y": 208},{"x": 94,"y": 204},{"x": 95,"y": 201},{"x": 96,"y": 196},{"x": 97,"y": 194},{"x": 98,"y": 191},{"x": 100,"y": 185},{"x": 102,"y": 178},{"x": 104,"y": 173},{"x": 104,"y": 171},{"x": 105,"y": 164},{"x": 106,"y": 158},{"x": 107,"y": 156},{"x": 107,"y": 152},{"x": 108,"y": 145},{"x": 109,"y": 141},{"x": 110,"y": 139},{"x": 112,"y": 133},{"x": 113,"y": 131},{"x": 116,"y": 127},{"x": 117,"y": 125},{"x": 119,"y": 122},{"x": 121,"y": 121},{"x": 123,"y": 120},{"x": 125,"y": 122},{"x": 125,"y": 125},{"x": 127,"y": 130},{"x": 128,"y": 133},{"x": 131,"y": 143},{"x": 136,"y": 153},{"x": 140,"y": 163},{"x": 144,"y": 172},{"x": 145,"y": 175},{"x": 151,"y": 189},{"x": 156,"y": 201},{"x": 161,"y": 213},{"x": 166,"y": 225},{"x": 169,"y": 233},{"x": 171,"y": 236},{"x": 174,"y": 243},{"x": 177,"y": 247},{"x": 178,"y": 249},{"x": 179,"y": 251},{"x": 180,"y": 253},{"x": 180,"y": 255},{"x": 179,"y": 257},{"x": 177,"y": 257},{"x": 174,"y": 255},{"x": 169,"y": 250},{"x": 164,"y": 247},{"x": 160,"y": 245},{"x": 149,"y": 238},{"x": 138,"y": 230},{"x": 127,"y": 221},{"x": 124,"y": 220},{"x": 112,"y": 212},{"x": 110,"y": 210},{"x": 96,"y": 201},{"x": 84,"y": 195},{"x": 74,"y": 190},{"x": 64,"y": 182},{"x": 55,"y": 175},{"x": 51,"y": 172},{"x": 49,"y": 170},{"x": 51,"y": 169},{"x": 56,"y": 169},{"x": 66,"y": 169},{"x": 78,"y": 168},{"x": 92,"y": 166},{"x": 107,"y": 164},{"x": 123,"y": 161},{"x": 140,"y": 162},{"x": 156,"y": 162},{"x": 171,"y": 160},{"x": 173,"y": 160},{"x": 186,"y": 160},{"x": 195,"y": 160},{"x": 198,"y": 161},{"x": 203,"y": 163},{"x": 208,"y": 163},{"x": 206,"y": 164},{"x": 200,"y": 167},{"x": 187,"y": 172},{"x": 174,"y": 179},{"x": 172,"y": 181},{"x": 153,"y": 192},{"x": 137,"y": 201},{"x": 123,"y": 211},{"x": 112,"y": 220},{"x": 99,"y": 229},{"x": 90,"y": 237},{"x": 80,"y": 244},{"x": 73,"y": 250},{"x": 69,"y": 254},{"x": 69,"y": 252}],
      name: "other"
    },
  ];

  ShapeDetector.prototype.spot = function(points, patternName) {

    if (patternName == null) {
      patternName = '';
    }

    var distance, pattern, score;
    var stroke = new Stroke(points);
    var bestDistance = +Infinity;
    var bestPattern = null;
    var bestScore = 0;

    for (var i = 0; i < this.patterns.length; i++) {
      pattern = this.patterns[i];

      if (pattern.name.indexOf(patternName) > -1) {
        distance = stroke.distanceAtBestAngle(pattern);
        score = 1.0 - distance / _halfDiagonal;

        if (distance < bestDistance && score > this.threshold) {
          bestDistance = distance;
          bestPattern = pattern.name;
          bestScore = score;
        }
      }
    }

    return {
      pattern: bestPattern,
      score: bestScore
    };
  };

  ShapeDetector.prototype.learn = function(name, points) {

    return this.patterns.push(new Stroke(points, name));
  };

  return ShapeDetector;
}));
