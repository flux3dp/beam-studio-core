import classNames from 'classnames';
import React from 'react';

import * as TutorialController from 'app/views/tutorials/tutorialController';
import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import Constant from 'app/actions/beambox/constant';
import i18n from 'helpers/i18n';
import TutorialConstants from 'app/constants/tutorial-constants';
import { getSVGAsync } from 'helpers/svg-editor-helper';

let svgCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const LANG = i18n.lang.topbar;

interface Props {
  isPreviewing: boolean;
  isPathPreviewing: boolean;
  showCameraPreviewDeviceList: () => void;
  endPreviewMode: () => void;
  setTopBarPreviewMode: (topBarPreviewMode: boolean) => void;
  enterPreviewMode: () => void;
}

function PreviewButton({
  isPreviewing,
  isPathPreviewing,
  showCameraPreviewDeviceList,
  endPreviewMode,
  setTopBarPreviewMode,
  enterPreviewMode,
}: Props): JSX.Element {
  if (isPathPreviewing) return null;

  const borderless = BeamboxPreference.read('borderless') || false;
  const supportOpenBottom = Constant.addonsSupportList.openBottom.includes(BeamboxPreference.read('workarea'));
  const previewText = (borderless && supportOpenBottom) ? `${LANG.preview} ${LANG.borderless}` : LANG.preview;

  const changeToPreviewMode = (): void => {
    svgCanvas.setMode('select');
    $('#workarea').contextMenu({ menu: [] }, () => { });
    $('#workarea').contextmenu(() => {
      endPreviewMode();
      return false;
    });
    setTopBarPreviewMode(true);
    const workarea = document.getElementById('workarea');
    if (workarea) {
      $(workarea).css('cursor', 'url(img/camera-cursor.svg), cell');
    }
    enterPreviewMode();
    if (TutorialController.getNextStepRequirement() === TutorialConstants.TO_PREVIEW_MODE) {
      TutorialController.handleNextStep();
    }
  };

  return (
    <div className={classNames('preview-button-container', { previewing: isPreviewing })}>
      <div className="img-container" onClick={isPreviewing ? showCameraPreviewDeviceList : changeToPreviewMode}>
        <img src="img/top-bar/icon-camera.svg" draggable={false} />
      </div>
      {isPreviewing ? <div className="title" onClick={showCameraPreviewDeviceList}>{previewText}</div> : null}
    </div>
  );
}

export default PreviewButton;
