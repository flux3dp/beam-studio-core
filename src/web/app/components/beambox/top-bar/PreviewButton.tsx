import classNames from 'classnames';
import React, { useContext } from 'react';

import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import LeftPanelIcons from 'app/icons/left-panel/LeftPanelIcons';
import TopBarIcons from 'app/icons/top-bar/TopBarIcons';
import useI18n from 'helpers/useI18n';
import { CanvasContext } from 'app/contexts/CanvasContext';
import { CanvasMode } from 'app/constants/canvasMode';
import { getSupportInfo } from 'app/constants/add-on';
import { useIsMobile } from 'helpers/system-helper';

import styles from './PreviewButton.module.scss';

function PreviewButton(): JSX.Element {
  const lang = useI18n().topbar;
  const isMobile = useIsMobile();
  const { mode, changeToPreviewMode, setupPreviewMode } = useContext(CanvasContext);
  if (isMobile || mode === CanvasMode.PathPreview) return null;

  if (mode === CanvasMode.CurveEngraving) {
    return (
      <div className={classNames(styles.container, styles.active)} title={lang.curve_engrave}>
        <div className={styles.button}>
          <LeftPanelIcons.Curve3D />
          <div className={styles.title}>{lang.curve_engrave}</div>
        </div>
      </div>
    );
  }
  const isPreviewing = mode === CanvasMode.Preview;

  const borderless = BeamboxPreference.read('borderless') || false;
  const previewText =
    borderless && getSupportInfo(BeamboxPreference.read('workarea')).openBottom
      ? `${lang.preview} ${lang.borderless}`
      : lang.preview;
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
