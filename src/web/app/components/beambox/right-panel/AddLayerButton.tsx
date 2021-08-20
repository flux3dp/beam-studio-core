import * as React from 'react';

import * as TutorialController from 'app/views/tutorials/tutorialController';
import i18n from 'helpers/i18n';
import TutorialConstants from 'app/constants/tutorial-constants';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { initLayerConfig } from 'helpers/laser-config-helper';

let svgCanvas;
let svgEditor;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
  svgEditor = globalSVG.Editor;
});

const LANG = i18n.lang.beambox.right_panel.layer_panel;

interface Props {
  setSelectedLayers: (selectedLayers: string[]) => void;
}

function AddLayerButton({ setSelectedLayers }: Props): JSX.Element {
  const addNewLayer = (): void => {
    let i = 1;
    let uniqName = `${LANG.layers.layer} ${i}`;
    while (svgCanvas.getCurrentDrawing().hasLayer(uniqName)) {
      i += 1;
      uniqName = `${LANG.layers.layer} ${i}`;
    }
    svgCanvas.createLayer(uniqName);
    if (TutorialController.getNextStepRequirement() === TutorialConstants.ADD_NEW_LAYER) {
      TutorialController.handleNextStep();
    }
    svgEditor.updateContextPanel();
    initLayerConfig(uniqName);
    setSelectedLayers([uniqName]);
  };

  return (
    <div className="add-layer-btn" onClick={addNewLayer}>
      <div className="bar bar1" />
      <div className="bar bar2" />
      <div className="bar bar3" />
    </div>
  );
}

export default AddLayerButton;
