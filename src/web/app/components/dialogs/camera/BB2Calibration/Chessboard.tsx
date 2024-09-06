import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { Modal, Spin } from 'antd';

import alertCaller from 'app/actions/alert-caller';
import progressCaller from 'app/actions/progress-caller';
import useI18n from 'helpers/useI18n';
import { calibrateChessboard } from 'helpers/camera-calibration-helper';
import { FisheyeCameraParametersV3Cali } from 'interfaces/FisheyePreview';

import ExposureSlider from '../common/ExposureSlider';
import styles from './Chessboard.module.scss';
import useCamera from '../common/useCamera';

interface Props {
  chessboard: [number, number];
  updateParam: (param: FisheyeCameraParametersV3Cali) => void;
  onNext: () => void;
  onClose: (complete?: boolean) => void;
}

const Chessboard = ({ chessboard, updateParam, onNext, onClose }: Props): JSX.Element => {
  const lang = useI18n().calibration;
  const [img, setImg] = useState<{ blob: Blob; url: string }>(null);
  const cameraLive = useRef(true);
  const liveTimeout = useRef(null);
  const handleImg = useCallback((imgBlob: Blob) => {
    const url = URL.createObjectURL(imgBlob);
    setImg({ blob: imgBlob, url });
    return true;
  }, []);

  const { exposureSetting, setExposureSetting, handleTakePicture } = useCamera(handleImg);

  useEffect(() => {
    if (cameraLive.current) {
      liveTimeout.current = setTimeout(() => {
        handleTakePicture({ silent: true });
        liveTimeout.current = null;
      }, 1000);
    }
  }, [img, handleTakePicture]);

  const handleCalibrate = async () => {
    progressCaller.openNonstopProgress({ id: 'calibrate-chessboard', message: lang.calibrating });
    clearTimeout(liveTimeout.current);
    cameraLive.current = false;
    let success = false;
    try {
      const res = await calibrateChessboard(img.blob, 0, chessboard);
      if (res.success === true) {
        const { ret, k, d, rvec, tvec } = res.data;
        updateParam({ ret, k, d, rvec, tvec });
        onNext();
        success = true;
        return;
      }
      const { reason } = res.data;
      alertCaller.popUpError({ message: `${lang.failed_to_calibrate_chessboard} ${reason}` });
    } catch (error) {
      console.error(error);
    } finally {
      progressCaller.popById('calibrate-chessboard');
      if (!success) {
        cameraLive.current = true;
        handleTakePicture({ silent: true });
      }
    }
  };

  return (
    <Modal
      width="80vw"
      open
      centered
      maskClosable={false}
      title={lang.camera_calibration}
      okText={lang.next}
      cancelText={lang.cancel}
      onOk={handleCalibrate}
      onCancel={() => onClose(false)}
      okButtonProps={{ disabled: !img }}
    >
      <div className={styles.container}>
        <div className={styles.desc}>
          <div>1. {lang.put_chessboard_1}</div>
          <div>2. {lang.put_chessboard_2}</div>
        </div>
        <div className={styles.imgContainer}>
          {img ? (
            <>
              <img src={img?.url} alt="Chessboard" />
              <div className={styles.indicator} />
            </>
          ) : (
            <Spin indicator={<LoadingOutlined className={styles.spinner} spin />} />
          )}
        </div>
        <ExposureSlider
          className={styles.slider}
          exposureSetting={exposureSetting}
          setExposureSetting={setExposureSetting}
          onChanged={handleTakePicture}
        />
      </div>
    </Modal>
  );
};

export default Chessboard;
