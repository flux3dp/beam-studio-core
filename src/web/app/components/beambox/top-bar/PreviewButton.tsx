import classNames from 'classnames';
import React, { useContext } from 'react';

import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import Constant from 'app/actions/beambox/constant';
import { CanvasContext } from 'app/contexts/CanvasContext';
import i18n from 'helpers/i18n';

const LANG = i18n.lang.topbar;

function PreviewButton(props: { showCameraPreviewDeviceList: () => void }): JSX.Element {
  const {
    isPreviewing,
    isPathPreviewing,
    changeToPreviewMode,
  } = useContext(CanvasContext);
  if (isPathPreviewing) return null;

  const borderless = BeamboxPreference.read('borderless') || false;
  const supportOpenBottom = Constant.addonsSupportList.openBottom.includes(BeamboxPreference.read('workarea'));
  const previewText = (borderless && supportOpenBottom) ? `${LANG.preview} ${LANG.borderless}` : LANG.preview;
  const { showCameraPreviewDeviceList } = props;

  return (
    <div className={classNames('preview-button-container', 'hidden-mobile', { previewing: isPreviewing })}>
      <div className="img-container" onClick={isPreviewing ? showCameraPreviewDeviceList : changeToPreviewMode}>
        <img src="img/top-bar/icon-camera.svg" draggable={false} />
      </div>
      {isPreviewing ? <div className="title" onClick={showCameraPreviewDeviceList}>{previewText}</div> : null}
    </div>
  );
}

export default PreviewButton;
