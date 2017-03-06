const sound = require('./sound');
const color = require('./color');

const Promise = require('bluebird');
Promise.config({
  cancellation: true
})

function asyncAnimateShadowBlur(item, totalDuration) {
  return new Promise(function(resolve, reject, onCancel) {
    item.data.originalShadowBlur = item.shadowBlur;

    try {
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
              resolve('asyncAnimateShadowBlur done');
            }
          }
        },
      ]);
    } catch(e) {
      item.shadowBlur = item.data.originalShadowBlur;
      reject(e);
    }

    onCancel(function() {
      item.shadowBlur = item.data.originalShadowBlur;
    })
  })
}

function asyncAnimateSaturationAndBrightness(item, totalDuration, finalColor) {
  return new Promise(function(resolve, reject, onCancel) {
    item.data.originalFillColor = item.fillColor;

    try {
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
              resolve('asyncAnimateSaturationAndBrightness done');
            }
          }
        },
      ]);
    } catch(e) {
      item.fillColor = item.data.originalFillColor;
      reject(e);
    }

    onCancel(function() {
      item.fillColor = item.data.originalFillColor;
    });
  })
}

export function asyncPlayShapeAnimation(shapeId) {
  return new Promise(function(resolve, reject, onCancel) {
    try {
      console.log('asyncPlayShapeAnimation shapeId', shapeId);
      const item = paper.project.getItem({
        match: function(el) {
          return (el.id === shapeId);
        }
      });

      console.log('item', item);

      if (!!item) {
        let group = null;
        if (item.className === 'Group') {
          group = item;
        } else {
          if (item.parent.className === 'Group') {
            group = item.parent;
          }
        }

        if (group !== null && group.children.length > 0 && Object.keys(group._namedChildren).length > 0) {
          const totalDuration = sound.measureLength;
          const transparent = color.transparent;
          let animationPromises = [];

          const namedChildren = group._namedChildren;

          animationPromises.push(asyncAnimateShadowBlur(group, totalDuration));
          if ('outer' in namedChildren && namedChildren.outer.length > 0) {
            const outer = namedChildren.outer[0];
            outer.fillColor = group.data.originalColor;
            animationPromises.push(asyncAnimateSaturationAndBrightness(outer, totalDuration, group.data.color));
          }

          if ('loop' in namedChildren && namedChildren.loop.length > 0) {
            namedChildren.loop.forEach(function(loop) {
              if (!!loop.fillColor && loop.fillColor !== transparent) {
                loop.fillColor = group.data.originalColor;
                animationPromises.push(asyncAnimateSaturationAndBrightness(loop, totalDuration, group.data.color));
              }
            })
          }

          if ('pop' in namedChildren && namedChildren.pop.length > 0) {
            namedChildren.pop.forEach(function(pop) {
              animationPromises.push(asyncAnimateSaturationAndBrightness(pop, totalDuration, pop.fillColor));
            })
          }

          Promise.all(animationPromises)
            .then(function() {
              resolve(`shape ${shapeId} done animating`);
            })
            .catch(function(e) {
              reject(e);
            });
        } else {
          reject('could not find relevant group, cannot animate');
        }
      } else {
        reject(`could not find item with id ${shapeId}`);
      }

    } catch(e) {
      reject(e);
    }
  });
}

// export function animateShapePlay(shape) {
//   const totalDuration = sound.measureLength;
//
//   const item = paper.project.getItem({
//     className: 'Path',
//     match: function(el) {
//       return (el.id === shape.pathId);
//     }
//   });
//
//   if (!!item) {
//     let group = item.parent;
//     console.log(group);
//     let outer = group._namedChildren.outer[0];
//     // outer.fillColor = 'pink';
//     console.log(outer);
//     group.data.animating = true;
//     asyncAnimateShadowBlur(group, totalDuration);
//
//     outer.fillColor = group.data.originalColor;
//     console.log('outer.fillColor', outer.fillColor);
//     asyncAnimateSaturationAndBrightness(outer, totalDuration, group.data.color);
//
//     console.log('group._namedChildren', group._namedChildren);
//     if (!!group._namedChildren && !!group._namedChildren.loop && !!group._namedChildren.loop.length > 0) {
//       group._namedChildren.loop.forEach(function(loop) {
//         console.log('loop', loop);
//         if (!!loop.fillColor && loop.fillColor !== color.transparent) {
//           console.log('loop.fillColor', loop.fillColor);
//           loop.fillColor = group.data.originalColor;
//           asyncAnimateSaturationAndBrightness(loop, totalDuration, group.data.color);
//         }
//       })
//     }
//
//     if (!!group._namedChildren && !!group._namedChildren.pop && !!group._namedChildren.pop.length > 0) {
//       group._namedChildren.pop.forEach(function(pop) {
//         console.log('pop.fillColor', pop.fillColor);
//         asyncAnimateSaturationAndBrightness(pop, totalDuration, pop.fillColor);
//       })
//     }
//   }
// }

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
