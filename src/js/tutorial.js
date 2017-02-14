export const contextualTips = [
  {
    type: "fill",
    copy: "Tap twice to fill or unfill a shape.",
  },
  {
    type: "pinch",
    copy: "Pinch shapes with two fingers to resize and move them.",
  },
  {
    type: "swipe",
    copy: "Swipe with two fingers to remove shapes from the canvas."
  },
];

export function getTipByName(tipName) {
  for (let i = 0; i < contextualTips.length; i++) {
    let tipObj = contextualTips[i];

    if (tipObj.type === tipName) {
      return tipObj.copy;
    }
  }

  return null;
}

export function allTutorialsCompleted() {
  const tutorialCompletionObj = window.kan.tutorialCompletion;
  let completion = true;

  Object.keys(tutorialCompletionObj).forEach((key, val) => {
    completion = completion && tutorialCompletionObj[key];
  });

  return completion === true;
}

export function addContextualTutorial(tipName) {
  const $tutWrapper = $('.contextual-tutorial-tips');
  if (!!window.kan.shapePath && window.kan.shapePath.length > 0) {
    let shapePath = window.kan.shapePath;
    let shapeCenter = shapePath.bounds.center;
    console.log(shapeCenter);

    let centerPoint = new Path.Circle({
      center: shapeCenter,
      radius: 5,
      fillColor: 'black'
    });

    let tipCopy = getTipByName(tipName);

    if (tipCopy !== null) {
      let $newTip = $(`<li>${tipCopy}</li>`);
      $tutWrapper.append($newTip);
      const tipWidth = $newTip.outerWidth();
      const tipHeight = $newTip.outerHeight();
      console.log(tipWidth, tipHeight);
      const leftPos = shapeCenter.x - (tipWidth / 2);
      const topPos = shapeCenter.y - tipHeight - 32;
      console.log(topPos, leftPos);
      $newTip.css({top: `${topPos}px`, left: `${leftPos}px`});
    }
  }
}
