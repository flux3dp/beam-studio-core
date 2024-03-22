import React, { useCallback, useEffect, useState } from 'react';
import { Button, Modal } from 'antd';

import alertCaller from 'app/actions/alert-caller';
import deviceMaster from 'helpers/device-master';
import progressCaller from 'app/actions/progress-caller';
import useI18n from 'helpers/useI18n';
import { FisheyeCameraParametersV2Cali } from 'interfaces/FisheyePreview';
import { calculateCameraPosition } from 'helpers/camera-calibration-helper';

import styles from './CalculateCameraPosition.module.scss';

const PROGRESS_ID = 'camera-find-corner';

interface Props {
  dh: number;
  withPitch?: boolean;
  updateParam: (param: FisheyeCameraParametersV2Cali) => void;
  onClose: (complete: boolean) => void;
  onBack: () => void;
  onFinish: () => void;
}

const CalculateCameraPosition = ({ dh, withPitch, updateParam, onClose, onBack, onFinish }: Props): JSX.Element => {
  const [img, setImg] = useState<{ blob: Blob; url: string; success: boolean }>(null);
  const lang = useI18n();

  const initSetup = useCallback(async () => {
    progressCaller.openNonstopProgress({
      id: PROGRESS_ID,
      message: lang.calibration.taking_picture,
    });
    try {
      await deviceMaster.connectCamera();
    } finally {
      progressCaller.popById(PROGRESS_ID);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTakePicture = async (retryTimes = 0) => {
    progressCaller.openNonstopProgress({
      id: PROGRESS_ID,
      message: lang.calibration.taking_picture,
    });
    const { imgBlob } = (await deviceMaster.takeOnePicture()) || {};
    if (!imgBlob) {
      if (retryTimes < 3) handleTakePicture(retryTimes + 1);
      else alertCaller.popUpError({ message: 'Unable to get image' });
    } else {
      try {
        const { success, blob, data } = await calculateCameraPosition(imgBlob, dh, withPitch);
        if (!success) {
          if (retryTimes < 3) handleTakePicture(retryTimes + 1);
          else alertCaller.popUpError({ message: 'Failed to get correct corners' });
        }
        setImg({ blob, url: URL.createObjectURL(blob), success });
        if (success) {
          console.log(data);
          updateParam({ xc: data.xc, yc: data.yc, hx: data.hx, hy: data.hy, imageScale: data.s });
        }
      } catch (err) {
        alertCaller.popUpError({ message: err.message });
      }
    }
    progressCaller.popById(PROGRESS_ID);
  };

  useEffect(() => {
    initSetup().then(() => {
      handleTakePicture();
    });
    return () => deviceMaster.disconnectCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Modal
      open
      centered
      onCancel={() => onClose(false)}
      title={lang.calibration.camera_calibration}
      footer={[
        <Button className={styles['footer-button']} onClick={onBack} key="back">
          {lang.buttons.back}
        </Button>,
        <Button className={styles['footer-button']} onClick={() => handleTakePicture(0)} key="retry">
          Retry
        </Button>,
        <Button
          className={styles['footer-button']}
          onClick={onFinish}
          disabled={!img?.success}
          key="done"
          type="primary"
        >
          {lang.buttons.done}
        </Button>,
      ]}
      closable
      maskClosable={false}
    >
      {'tPlease Check Detected Corners'}
      <div className={styles['img-container']}>
        <img src={img?.url} />
      </div>
    </Modal>
  );
};

export default CalculateCameraPosition;
