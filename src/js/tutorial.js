const config = require('./../../config');

const contextualTuts = config.contextualTuts;

export function getTutByName(tutName) {
  for (let i = 0; i < contextualTuts.length; i++) {
    let tutObj = contextualTuts[i];

    if (tutObj.type === tutName) {
      return tutObj.copy;
    }
  }

  return null;
}

export function allTutsCompleted() {
  const tutorialCompletionObj = window.kan.tutorialCompletion;
  let completion = true;

  Object.keys(tutorialCompletionObj).forEach((key, val) => {
    completion = completion && tutorialCompletionObj[key];
  });

  return completion === true;
}

export function addContextualTut(tutName) {
  const $tutWrapper = $('.contextual-tuts');
  if (!!window.kan.shapePath && window.kan.shapePath.length > 0) {
    let shapePath = window.kan.shapePath;
    let shapeCenter = shapePath.bounds.center;
    console.log(shapeCenter);

    let centerPoint = new Path.Circle({
      center: shapeCenter,
      radius: 5,
      fillColor: 'blue'
    });

    let tutCopy = getTutByName(tutName);

    if (tutCopy !== null) {
      let $tutWrap = $(`.tut[data-tut-type='${tutName}']`);
      if ($tutWrap.length > 0) {
        const tutWidth = $tutWrap.outerWidth();
        const tutHeight = $tutWrap.outerHeight();
        console.log(tutWidth, tutHeight);
        const leftPos = shapeCenter.x - (tutWidth / 2);
        const topPos = shapeCenter.y - (tutHeight / 2);
        console.log(leftPos, topPos);

        $tutWrap.css({top: `${topPos}px`, left: `${leftPos}px`, display: 'flex'});
        let tutPoint = new Path.Circle({
          center: new Point(leftPos, topPos),
          radius: 5,
          fillColor: 'red'
        });
      }
    }
  }
}

export function hideContextualTuts() {
  const $tuts = $('.contextual-tuts .tut');
  $tuts.hide();
}
