const config = require('./../../config');

const contextualTuts = config.contextualTuts;
const tutArrowHeight = 16;

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
  if (!!window.kan.shapePath && window.kan.shapePath.length > 0) {
    hideContextualTuts();
    window.kan.shapesSinceTut = 0;

    let shapePath = window.kan.shapePath;
    let shapeCenter = shapePath.bounds.center;

    let tutCopy = getTutByName(tutName);

    if (tutCopy !== null) {
      const $tut = $(`.tut[data-tut-type='${tutName}']`);
      if ($tut.length > 0) {
        const tutPos = getTutPositionFromCenter($tut, shapeCenter);
        $tut.css({top: `${tutPos.y}px`, left: `${tutPos.x}px`, visibility: 'visible'});
        $tut.addClass('animated bounceIn');
      }
    }
  }
}

export function hideContextualTut($tut) {
  $tut.css({visibility: 'hidden'});
}

export function hideContextualTutByName(tutName) {
  const $tut = $(`.tut[data-tut-type='${tutName}']`);
  hideContextualTut($tut);
}

export function hideContextualTuts() {
  const $tuts = $('.contextual-tuts .tut');
  $tuts.css({visibility: 'hidden'});
}

export function resetContextualTuts() {
  hideContextualTuts();
  window.kan.tutorialCompletion = {
    "fill": false,
    "pinch": false,
    "swipe": false
  };
}

export function moveContextualTut($tut, centerPoint) {
  let tutPos = getTutPositionFromCenter($tut, centerPoint);
  $tut.css({top: `${tutPos.y}px`, left: `${tutPos.x}px`});
}

export function getTutPositionFromCenter($tut, centerPoint) {
  const tutWidth = $tut.outerWidth();
  const tutHeight = $tut.outerHeight();
  const leftPos = centerPoint.x - (tutWidth / 2);
  const topPos = centerPoint.y - tutHeight - tutArrowHeight;
  return new Point(leftPos, topPos);
}
