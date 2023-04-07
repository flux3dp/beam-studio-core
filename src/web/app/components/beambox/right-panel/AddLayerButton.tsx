import React from 'react';

import TutorialConstants from 'app/constants/tutorial-constants';
import TutorialController from 'app/views/tutorials/tutorialController';
import useI18n from 'helpers/useI18n';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { initLayerConfig } from 'helpers/layer/layer-config-helper';

let svgCanvas;
let svgEditor;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
  svgEditor = globalSVG.Editor;
});

interface Props {
  setSelectedLayers: (selectedLayers: string[]) => void;
}

function AddLayerButton({ setSelectedLayers }: Props): JSX.Element {
  const lang = useI18n().beambox.right_panel.layer_panel;

  const addNewLayer = (): void => {
    let i = 1;
    let uniqName = `${lang.layers.layer} ${i}`;
    while (svgCanvas.getCurrentDrawing().hasLayer(uniqName)) {
      i += 1;
      uniqName = `${lang.layers.layer} ${i}`;
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
