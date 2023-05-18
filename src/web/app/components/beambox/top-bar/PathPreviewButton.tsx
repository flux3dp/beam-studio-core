import classNames from 'classnames';
import React from 'react';

import checkWebGL from 'helpers/check-webgl';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { useIsMobile } from 'helpers/system-helper';

let svgCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

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
  const isMobile = useIsMobile();
  if (isMobile || !checkWebGL()) return null;

  const changeToPathPreviewMode = (): void => {
    if (!isPathPreviewing) {
      svgCanvas.clearSelection();
      togglePathPreview();
    }
  };
  const className = classNames(
    'path-preview-button-container',
    {
      highlighted: isPathPreviewing,
      disabled: !isDeviceConnected && window.FLUX.version === 'web',
    }
  );
  return (
    <div className={className}>
      <div className="path-preview-button" onClick={changeToPathPreviewMode}>
        <img src="img/path-preview.svg" draggable={false} />
      </div>
    </div>
  );
}

export default PathPreviewButton;
