const sound = require('./sound');
const color = require('./color');

function animateShadowBlur(item, totalDuration) {
  item.animate([
    {
      properties: {
        shadowBlur: 30
      },
      settings: {
        duration: totalDuration / 4,
        easing: "easeInOut",
        complete: function() {
          console.log('animation step 1')
        },
      }
    },
    {
      properties: {
        shadowBlur: 15
      },
      settings: {
        duration: totalDuration / 2,
        easing: "easeInOut",
        // complete: function() {
        //   console.log('animation step 2')
        // },
      }
    },
    {
      properties: {
        shadowBlur: 0
      },
      settings: {
        duration: totalDuration / 4,
        easing: "easeInOut",
        complete: function() {
          item.data.animating = false;
        }
      }
    },
  ]);
}

function animateSaturationAndBrightness(item, totalDuration, finalColor) {
  item.animate([
    {
      properties: {
        // scale: 1,
        // rotate: -5,
        fillColor: {
          // hue: "+1"
          // saturation: "+10",
          brightness: "+0.2",
        }
      },
      settings: {
        duration: totalDuration / 4,
        easing: "easeInOut",
        complete: function() {
          console.log('animation step 1')
        },
      }
    },
    {
      properties: {
        // scale: 1,
        // rotate: 0,
        fillColor: {
          // hue: "0",
          // saturation: group.data.originalColor.saturation,
          // brightness: group.data.originalColor.brightness,
          // saturation: "-10",
          brightness: "-0.2",
        }
      },
      settings: {
        duration: totalDuration - (totalDuration / 4),
        easing: "easeInOut",
        complete: function() {
          item.data.animating = false;
          item.fillColor = finalColor;
          // console.log('animation step 3')
        }
      }
    },
  ]);
}

export function animateShapePlay(shape) {
  const totalDuration = sound.measureLength;

  const item = paper.project.getItem({
    className: 'Path',
    match: function(el) {
      return (el.id === shape.pathId);
    }
  });

  if (!!item) {
    let group = item.parent;
    console.log(group);
    let outer = group._namedChildren.outer[0];
    // outer.fillColor = 'pink';
    console.log(outer);
    group.data.animating = true;
    animateShadowBlur(group, totalDuration);

    outer.fillColor = group.data.originalColor;
    console.log('outer.fillColor', outer.fillColor);
    animateSaturationAndBrightness(outer, totalDuration, group.data.color);

    console.log('group._namedChildren', group._namedChildren);
    if (!!group._namedChildren && !!group._namedChildren.loop && !!group._namedChildren.loop.length > 0) {
      group._namedChildren.loop.forEach(function(loop) {
        console.log('loop', loop);
        if (!!loop.fillColor && loop.fillColor !== color.transparent) {
          console.log('loop.fillColor', loop.fillColor);
          loop.fillColor = group.data.originalColor;
          animateSaturationAndBrightness(loop, totalDuration, group.data.color);
        }
      })
    }

    if (!!group._namedChildren && !!group._namedChildren.pop && !!group._namedChildren.pop.length > 0) {
      group._namedChildren.pop.forEach(function(pop) {
        console.log('pop.fillColor', pop.fillColor);
        animateSaturationAndBrightness(pop, totalDuration, pop.fillColor);
      })
    }
  }
}

function initAnimateShadowBlur() {
  animatePaper.extendPropHooks({
    "shadowBlur": {
      get: function(tween) {
        // console.log('get', tween);
        if (!tween.item.data._animatePaperVals) {
          tween.item.data._animatePaperVals = {};
        }
        if (typeof tween.item.data._animatePaperVals.shadowBlur === "undefined") {
            tween.item.data._animatePaperVals.shadowBlur = tween.item.shadowBlur;
        }
        // console.log('get', tween.item.shadowBlur);
        var output = tween.item.data._animatePaperVals.shadowBlur;
        return output;
      },
      set: function(tween) {
        // console.log('set', tween);
        var curBlur = tween.item.data._animatePaperVals.shadowBlur;
        var trueBlur = tween.now - curBlur;
        //
        tween.item.data._animatePaperVals.shadowBlur = tween.now;
        tween.item.shadowBlur += trueBlur;
        // console.log('set', tween.item.shadowBlur);
      },
      // ease: function(tween, easedPercent) {
      //   console.log('ease', tween, easedPercent);
      //   console.log('ease', tween.item.shadowBlur);
      //   tween.now = (tween.end - tween.start) * easedPercent;
      //   console.log('tween.now', tween.now);
      //   return tween.now;
      // }
    }
  })
}

export function init() {
  initAnimateShadowBlur();
}
