import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Slider, Tooltip } from 'antd';

import useI18n from 'helpers/useI18n';
import WorkareaIcons from 'app/icons/workarea/WorkareaIcons';
import { CanvasContext } from 'app/contexts/CanvasContext';

import styles from './PreviewOpacitySlider.module.scss';

const PreviewOpacitySlider = (): JSX.Element => {
  const [opacity, setOpacity] = useState(1);
  const [visible, setVisible] = useState(false);
  const { isPreviewing, isPathPreviewing } = useContext(CanvasContext);
  const lang = useI18n();

  const updateBgOpacity = useCallback((val: string) => {
    const bgImg: HTMLElement = document.querySelector('#background_image');
    if (bgImg) {
      bgImg.style.opacity = val;
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, []);

  useEffect(() => {
    updateBgOpacity(isPreviewing ? '1' : opacity.toString());
  }, [isPreviewing, opacity, updateBgOpacity]);

  if (isPreviewing || isPathPreviewing || !visible) return null;

  return (
    <div className={styles.container}>
      <Tooltip title={lang.editor.opacity}>
        <WorkareaIcons.Opacity className={styles.icon} />
      </Tooltip>
      <Slider
        className={styles.slider}
        min={0}
        max={1}
        step={0.25}
        value={opacity}
        onChange={setOpacity}
        tooltip={{ open: false }}
      />
      <div className={styles.value}>{opacity * 100}%</div>
    </div>
  );
};

export default PreviewOpacitySlider;
