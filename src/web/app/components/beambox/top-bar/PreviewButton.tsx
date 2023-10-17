import classNames from 'classnames';
import React, { useContext } from 'react';

import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import Constant from 'app/actions/beambox/constant';
import i18n from 'helpers/i18n';
import TopBarIcons from 'app/icons/top-bar/TopBarIcons';
import { CanvasContext } from 'app/contexts/CanvasContext';
import { useIsMobile } from 'helpers/system-helper';

import styles from './PreviewButton.module.scss';

const LANG = i18n.lang.topbar;

function PreviewButton(): JSX.Element {
  const isMobile = useIsMobile();
  const { changeToPreviewMode, isPathPreviewing, isPreviewing, setupPreviewMode } =
    useContext(CanvasContext);
  if (isMobile || isPathPreviewing) return null;

  const borderless = BeamboxPreference.read('borderless') || false;
  const supportOpenBottom = Constant.addonsSupportList.openBottom.includes(BeamboxPreference.read('workarea'));
  const previewText = (borderless && supportOpenBottom) ? `${LANG.preview} ${LANG.borderless}` : LANG.preview;
  const startPreview = () => {
    if (!isPreviewing) {
      changeToPreviewMode();
      setupPreviewMode();
    }
  };

  return (
    <div
      className={classNames(styles.container, { [styles.previewing]: isPreviewing })}
      title={i18n.lang.tutorial.newInterface.camera_preview}
    >
      <div className={styles.button} onClick={startPreview}>
        <TopBarIcons.Camera />
        {isPreviewing && <div className={styles.title}>{previewText}</div>}
      </div>
    </div>
  );
}

export default PreviewButton;
