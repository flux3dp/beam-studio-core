import classNames from 'classnames';
import React, { useContext } from 'react';

import checkWebGL from 'helpers/check-webgl';
import TopBarIcons from 'app/icons/top-bar/TopBarIcons';
import useI18n from 'helpers/useI18n';
import { CanvasContext } from 'app/contexts/CanvasContext';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { useIsMobile } from 'helpers/system-helper';

import styles from './PathPreviewButton.module.scss';

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
  const i18n = useI18n();
  const isMobile = useIsMobile();
  const { isPreviewing } = useContext(CanvasContext);
  if (isMobile || !checkWebGL()) return null;

  const changeToPathPreviewMode = (): void => {
    if (!isPathPreviewing) {
      svgCanvas.clearSelection();
      togglePathPreview();
    }
  };
  const className = classNames(styles.button, {
    [styles.highlighted]: isPathPreviewing,
    [styles.disabled]: isPreviewing || (!isDeviceConnected && window.FLUX.version === 'web'),
  });
  return (
    <div
      className={className}
      onClick={changeToPathPreviewMode}
      title={i18n.tutorial.newInterface.path_preview}
    >
      <TopBarIcons.PathPreview />
    </div>
  );
}

export default PathPreviewButton;
