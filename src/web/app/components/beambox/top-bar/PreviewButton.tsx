import classNames from 'classnames';
import React, { useContext } from 'react';

import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import Constant from 'app/actions/beambox/constant';
import TopBarIcons from 'app/icons/top-bar/TopBarIcons';
import useI18n from 'helpers/useI18n';
import { CanvasContext } from 'app/contexts/CanvasContext';
import { useIsMobile } from 'helpers/system-helper';

import styles from './PreviewButton.module.scss';


function PreviewButton(): JSX.Element {
  const lang = useI18n().topbar;
  const isMobile = useIsMobile();
  const { changeToPreviewMode, isPathPreviewing, isPreviewing, setupPreviewMode } =
    useContext(CanvasContext);
  if (isMobile || isPathPreviewing) return null;

  const borderless = BeamboxPreference.read('borderless') || false;
  const supportOpenBottom = Constant.addonsSupportList.openBottom.includes(BeamboxPreference.read('workarea'));
  const previewText = (borderless && supportOpenBottom) ? `${lang.preview} ${lang.borderless}` : lang.preview;
  const startPreview = () => {
    if (!isPreviewing) {
      changeToPreviewMode();
      setupPreviewMode();
    }
  };

  return (
    <div
      className={classNames(styles.container, { [styles.previewing]: isPreviewing })}
      title={lang.preview_title}
    >
      <div className={styles.button} onClick={startPreview}>
        <TopBarIcons.Camera />
        {isPreviewing && <div className={styles.title}>{previewText}</div>}
      </div>
    </div>
  );
}

export default PreviewButton;
