import React, { useEffect, useRef, useState } from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { Modal, Spin } from 'antd';

import alertCaller from 'app/actions/alert-caller';
import progressCaller from 'app/actions/progress-caller';
import useI18n from 'helpers/useI18n';
import webcamHelper from 'helpers/webcam-helper';
import { calibrateChessboard } from 'helpers/camera-calibration-helper';
import { FisheyeCameraParametersV3Cali } from 'interfaces/FisheyePreview';

import styles from './Chessboard.module.scss';

interface Props {
  chessboard: [number, number];
  updateParam: (param: FisheyeCameraParametersV3Cali) => void;
  onNext: () => void;
  onClose: (complete?: boolean) => void;
}

const Chessboard = ({ chessboard, updateParam, onNext, onClose }: Props): JSX.Element => {
  const lang = useI18n().calibration;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [webcamConnected, setWebcamConnected] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    webcamHelper.connectWebcam({ video }).then((res) => {
      setWebcamConnected(!!res);
    });
    return () => {
      webcamHelper.disconnectWebcam(video);
    };
  }, []);

  const handleCalibrate = async () => {
    progressCaller.openNonstopProgress({ id: 'calibrate-chessboard', message: lang.calibrating });
    videoRef.current.pause();
    let success = false;
    try {
      const imgBlob = await webcamHelper.getPictureFromWebcam({ video: videoRef.current });
      const res = await calibrateChessboard(imgBlob, 0, chessboard);
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
      if (!success) videoRef.current.play();
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
      okButtonProps={{ disabled: !webcamConnected }}
    >
      <div className={styles.container}>
        <div className={styles.desc}>
          <div>1. {lang.put_chessboard_1}</div>
          <div>2. {lang.put_chessboard_2}</div>
        </div>
        <div className={styles.imgContainer}>
          <video ref={videoRef} />
          {webcamConnected ? (
            <>
              <div className={styles.indicator} />
            </>
          ) : (
            <Spin
              className={styles.spin}
              indicator={<LoadingOutlined className={styles.spinner} spin />}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default Chessboard;
