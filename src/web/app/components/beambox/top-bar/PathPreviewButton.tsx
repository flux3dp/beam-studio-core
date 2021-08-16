import classNames from 'classnames';
import React from 'react';

import Alert from 'app/actions/alert-caller';
import checkWebGL from 'helpers/check-webgl';
import i18n from 'helpers/i18n';
import { getSVGAsync } from 'helpers/svg-editor-helper';

let svgCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const { lang } = i18n;

interface Props {
  isPathPreviewing: boolean;
  isDeviceConnected: boolean;
  togglePathPreview: () => void;
}

function PathPreviewButton({
  isPathPreviewing,
  isDeviceConnected,
  togglePathPreview,
}: Props): JSX.Element {
  if (!checkWebGL()) return null;

  const changeToPathPreviewMode = (): void => {
    if (isDeviceConnected || window.FLUX.version !== 'web') {
      if (!isPathPreviewing) {
        svgCanvas.clearSelection();
        togglePathPreview();
      }
    } else {
      Alert.popUp({
        caption: lang.alert.oops,
        message: lang.device_selection.no_beambox,
      });
    }
  };

  return (
    <div className={classNames('path-preview-button-container', { highlighted: isPathPreviewing })}>
      <div className="path-preview-button" onClick={changeToPathPreviewMode}>
        <img src="img/path-preview.svg" draggable={false} />
      </div>
    </div>
  );
}

export default PathPreviewButton;
