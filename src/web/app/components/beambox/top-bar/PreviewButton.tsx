import classNames from 'classnames';
import React, { useContext } from 'react';

import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import Constant from 'app/actions/beambox/constant';
import useI18n from 'helpers/useI18n';
import { CanvasContext } from 'app/contexts/CanvasContext';
import { useIsMobile } from 'helpers/system-helper';

function PreviewButton(props: { showCameraPreviewDeviceList: () => void }): JSX.Element {
  const lang = useI18n().topbar;
  const isMobile = useIsMobile();
  const {
    isPreviewing,
    isPathPreviewing,
    changeToPreviewMode,
  } = useContext(CanvasContext);
  if (isMobile || isPathPreviewing) return null;

  const borderless = BeamboxPreference.read('borderless') || false;
  const supportOpenBottom = Constant.addonsSupportList.openBottom.includes(BeamboxPreference.read('workarea'));
  const previewText = (borderless && supportOpenBottom) ? `${lang.preview} ${lang.borderless}` : lang.preview;
  const { showCameraPreviewDeviceList } = props;

  return (
    <div className={classNames('preview-button-container', { previewing: isPreviewing })}>
      <div
        className="img-container"
        title={lang.preview_title}
        onClick={isPreviewing ? showCameraPreviewDeviceList : changeToPreviewMode}
      >
        <img src="img/top-bar/icon-camera.svg" draggable={false} />
      </div>
      {isPreviewing ? <div className="title" onClick={showCameraPreviewDeviceList}>{previewText}</div> : null}
    </div>
  );
}

export default PreviewButton;
