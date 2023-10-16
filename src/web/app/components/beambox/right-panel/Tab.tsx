import React, { useContext } from 'react';
import classNames from 'classnames';

import * as TutorialController from 'app/views/tutorials/tutorialController';
import i18n from 'helpers/i18n';
import TutorialConstants from 'app/constants/tutorial-constants';
import { SelectedElementContext } from 'app/contexts/SelectedElementContext';
import { getSVGAsync } from 'helpers/svg-editor-helper';

let svgCanvas;
getSVGAsync((globalSVG) => { svgCanvas = globalSVG.Canvas; });

const LANG = i18n.lang.beambox.right_panel;

interface Props {
  mode: 'element' | 'path-edit';
  selectedTab: 'layers' | 'objects';
  setSelectedTab: (selectedTab: 'layers' | 'objects') => void;
}

function Tab({
  mode,
  selectedTab,
  setSelectedTab,
}: Props): JSX.Element {
  const { selectedElement } = useContext(SelectedElementContext);
  const isObjectDisabled = (mode === 'element' && !selectedElement);
  let objectTitle = LANG.tabs.objects;
  const LangTopBar = i18n.lang.topbar;
  if (mode === 'path-edit') {
    objectTitle = LANG.tabs.path_edit;
  } else if (mode === 'element' && selectedElement) {
    if (selectedElement.getAttribute('data-tempgroup') === 'true') {
      objectTitle = LangTopBar.tag_names.multi_select;
    } else if (selectedElement.getAttribute('data-textpath-g')) {
      objectTitle = LangTopBar.tag_names.text_path;
    } else if (selectedElement.tagName.toLowerCase() !== 'use') {
      objectTitle = LangTopBar.tag_names[selectedElement.tagName.toLowerCase()];
    } else if (selectedElement.getAttribute('data-svg') === 'true') {
      objectTitle = LangTopBar.tag_names.svg;
    } else if (selectedElement.getAttribute('data-dxf') === 'true') {
      objectTitle = LangTopBar.tag_names.dxf;
    } else {
      objectTitle = LangTopBar.tag_names.use;
    }
  }
  return (
    <div className="right-panel-tabs">
      <div
        className={classNames('tab', 'layers', { selected: selectedTab === 'layers' })}
        onClick={() => {
          setSelectedTab('layers');
          if (TutorialController.getNextStepRequirement() === TutorialConstants.TO_LAYER_PANEL) {
            svgCanvas.clearSelection();
            TutorialController.handleNextStep();
          }
        }}
      >
        <img className="tab-icon" src="img/right-panel/icon-layers.svg" draggable={false} />
        <div className="tab-title">
          {LANG.tabs.layers}
        </div>
      </div>
      <div
        className={classNames('tab', 'objects', { disabled: isObjectDisabled, selected: selectedTab === 'objects' })}
        onClick={isObjectDisabled ? null : () => setSelectedTab('objects')}
      >
        <img className="tab-icon object" src="img/right-panel/icon-adjust.svg" draggable={false} />
        <div className="tab-title">
          {objectTitle}
        </div>
      </div>
    </div>
  );
}

export default Tab;

