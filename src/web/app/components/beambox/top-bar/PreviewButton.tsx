import classNames from 'classnames';
import React, { useContext } from 'react';

import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import Constant from 'app/actions/beambox/constant';
import LeftPanelIcons from 'app/icons/left-panel/LeftPanelIcons';
import TopBarIcons from 'app/icons/top-bar/TopBarIcons';
import useI18n from 'helpers/useI18n';
import { CanvasContext, CanvasMode } from 'app/contexts/CanvasContext';
import { useIsMobile } from 'helpers/system-helper';

import styles from './PreviewButton.module.scss';

function PreviewButton(): JSX.Element {
  const lang = useI18n().topbar;
  const isMobile = useIsMobile();
  const { mode, changeToPreviewMode, setupPreviewMode } = useContext(CanvasContext);
  if (isMobile || mode === CanvasMode.PathPreview) return null;

  if (mode === CanvasMode.CurveEngraving) {
    return (
      <div className={classNames(styles.container, styles.active)} title="3D Curve">
        <div className={styles.button}>
          <LeftPanelIcons.Curve3D />
          <div className={styles.title}>3D CURVE</div>
        </div>
      </div>
    );
  }
  const isPreviewing = mode === CanvasMode.Preview;

  const borderless = BeamboxPreference.read('borderless') || false;
  const supportOpenBottom = Constant.addonsSupportList.openBottom.includes(
    BeamboxPreference.read('workarea')
  );
  const previewText =
    borderless && supportOpenBottom ? `${lang.preview} ${lang.borderless}` : lang.preview;
  const startPreview = () => {
    if (!isPreviewing) {
      changeToPreviewMode();
      setupPreviewMode();
    }
  };

  return (
    <div
      className={classNames(styles.container, { [styles.active]: isPreviewing })}
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
