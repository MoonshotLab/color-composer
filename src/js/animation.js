const sound = require('./sound');
const color = require('./color');

const Promise = require('bluebird');

function asyncAnimateScale(item, totalDuration) {
  return new Promise(function(resolve, reject) {
    try {
      if (item.data.animating === true) {
        resolve('shape already animating, ignoring');
      }
      item.data.animating = true;
      item.stop({
        goToEnd: true
      });
      item.animate([
        {
          properties: {
            scale: 1.15,
          },
          settings: {
            duration: totalDuration / 4,
            easing: "easeOut",
          }
        },
        {
          properties: {
            scale: 1,
          },
          settings: {
            duration: totalDuration - (totalDuration / 4),
            easing: "easeIn",
            complete: function() {
              item.data.animating = false;
              resolve('asyncAnimateScale done');
            }
          }
        },
      ]);
    } catch(e) {
      item.stop({
        goToEnd: true
      });
      reject(e);
    }
  })
}

function asyncAnimateBrightness(item, totalDuration, finalColor) {
  return new Promise(function(resolve, reject) {
    try {
      if (item.data.animating === true) {
        resolve('shape already animating, ignoring');
      }
      item.data.animating = true;
      item.data.originalFillColor = item.fillColor;
      item.stop({
        goToEnd: true
      });
      item.animate([
        {
          properties: {
            fillColor: {
              brightness: "+0.2",
            }
          },
          settings: {
            duration: totalDuration / 4,
            easing: "easeInOut",
          }
        },
        {
          properties: {
            fillColor: {
              brightness: "-0.2",
            }
          },
          settings: {
            duration: totalDuration - (totalDuration / 4),
            easing: "easeInOut",
            complete: function() {
              item.data.animating = false;
              item.fillColor = finalColor;
              resolve('asyncAnimateBrightness done');
            }
          }
        },
      ]);
    } catch(e) {
      item.stop({
        goToEnd: true
      });
      reject(e);
    }
  })
}

export function asyncPlayShapeAnimation(shapeId) {
  return new Promise(function(resolve, reject, onCancel) {
    try {
      const item = paper.project.getItem({
        match: function(el) {
          return (el.id === shapeId);
        }
      });

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
          if (group.data.animating === true) {
            resolve('group already animating, ignoring');
          }
          const totalDuration = sound.measureLength * 0.75;
          const transparent = color.transparent;
          let animationPromises = [];

          const namedChildren = group._namedChildren;

          animationPromises.push(asyncAnimateScale(group, totalDuration));
          // if ('outer' in namedChildren && namedChildren.outer.length > 0) {
          //   const outer = namedChildren.outer[0];
          //   outer.fillColor = group.data.originalColor;
          //   animationPromises.push(asyncAnimateBrightness(outer, totalDuration, group.data.color));
          // }
          //
          // if ('loop' in namedChildren && namedChildren.loop.length > 0) {
          //   namedChildren.loop.forEach(function(loop) {
          //     if (!!loop.fillColor && loop.fillColor !== transparent) {
          //       loop.fillColor = group.data.originalColor;
          //       animationPromises.push(asyncAnimateBrightness(loop, totalDuration, group.data.color));
          //     }
          //   })
          // }
          //
          // if ('pop' in namedChildren && namedChildren.pop.length > 0) {
          //   namedChildren.pop.forEach(function(pop) {
          //     animationPromises.push(asyncAnimateBrightness(pop, totalDuration, pop.fillColor));
          //   })
          // }

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

// function initAnimateShadowBlur() {
//   animatePaper.extendPropHooks({
//     "shadowBlur": {
//       get: function(tween) {
//         // console.log('get', tween);
//         if (!tween.item.data._animatePaperVals) {
//           tween.item.data._animatePaperVals = {};
//         }
//         if (typeof tween.item.data._animatePaperVals.shadowBlur === "undefined") {
//             tween.item.data._animatePaperVals.shadowBlur = tween.item.shadowBlur;
//         }
//         // console.log('get', tween.item.shadowBlur);
//         var output = tween.item.data._animatePaperVals.shadowBlur;
//         return output;
//       },
//       set: function(tween) {
//         // console.log('set', tween);
//         var curBlur = tween.item.data._animatePaperVals.shadowBlur;
//         var trueBlur = tween.now - curBlur;
//         //
//         tween.item.data._animatePaperVals.shadowBlur = tween.now;
//         tween.item.shadowBlur += trueBlur;
//         // console.log('set', tween.item.shadowBlur);
//       },
//     }
//   })
// }
