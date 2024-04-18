import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Slider, Space, Tooltip } from 'antd';

import constant from 'app/actions/beambox/constant';
import deviceMaster from 'helpers/device-master';
import PreviewModeController from 'app/actions/beambox/preview-mode-controller';
import useI18n from 'helpers/useI18n';
import WorkareaIcons from 'app/icons/workarea/WorkareaIcons';
import { CanvasContext } from 'app/contexts/CanvasContext';

import styles from './PreviewSlider.module.scss';

interface ISetting {
  min: number;
  max: number;
  value: number;
  step: number;
}

const PreviewSlider = (): JSX.Element => {
  const [opacity, setOpacity] = useState(1);
  const [showOpacity, setShowOpacity] = useState(false);
  const [exposureSetting, setExposureSetting] = useState<ISetting | null>(null);
  const { isPreviewing, isPathPreviewing } = useContext(CanvasContext);
  const lang = useI18n();

  const getSetting = async () => {
    if (!deviceMaster?.currentDevice?.info) return;
    if (!constant.adorModels.includes(deviceMaster.currentDevice.info.model)) return;
    const exposureRes = await deviceMaster.getDeviceSetting('camera_exposure_absolute');
    setExposureSetting(JSON.parse(exposureRes.value));
  };

  const updateBgOpacity = useCallback((val: string) => {
    const bgImg: HTMLElement = document.querySelector('#background_image');
    if (bgImg) {
      bgImg.style.opacity = val;
      setShowOpacity(true);
    } else {
      setShowOpacity(false);
    }
  }, []);

  useEffect(() => {
    updateBgOpacity(isPreviewing ? '1' : opacity.toString());
  }, [isPreviewing, opacity, updateBgOpacity]);

  // this is also triggered by UPDATE_CONTEXT event in PreviewModeController.start
  useEffect(() => {
    setExposureSetting(null);
    if (isPreviewing && PreviewModeController.isPreviewModeOn) getSetting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPreviewing, PreviewModeController.isPreviewModeOn]);

  if (isPathPreviewing) return null;

  return (
    <Space className={styles.space} direction="vertical">
      {!isPreviewing && showOpacity && (
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
      )}
      {isPreviewing && exposureSetting && (
        <div className={styles.container}>
          <Tooltip title={lang.editor.exposure}>
            <WorkareaIcons.Exposure className={styles.icon} />
          </Tooltip>
          <Slider
            className={styles.slider}
            min={Math.max(exposureSetting.min, 250)}
            max={Math.min(exposureSetting.max, 650)}
            step={exposureSetting.step}
            value={exposureSetting.value}
            onChange={(value: number) => setExposureSetting({ ...exposureSetting, value })}
            onAfterChange={async (value: number) => {
              setExposureSetting({ ...exposureSetting, value });
              await deviceMaster.setDeviceSetting('camera_exposure_absolute', value.toString());
              await PreviewModeController.previewFullWorkarea();
            }}
            tooltip={{ open: false }}
          />
          <div className={styles.value}>{exposureSetting.value}</div>
        </div>
      )}
    </Space>
  );
};

export default PreviewSlider;
