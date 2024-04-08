import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Col, Modal, Row } from 'antd';

import alertCaller from 'app/actions/alert-caller';
import alertConstants from 'app/constants/alert-constants';
import dialog from 'implementations/dialog';
import deviceMaster from 'helpers/device-master';
import progressCaller from 'app/actions/progress-caller';
import useI18n from 'helpers/useI18n';
import { calibrateChessboard, startFisheyeCalibrate } from 'helpers/camera-calibration-helper';
import { FisheyeCameraParametersV2Cali } from 'interfaces/FisheyePreview';

import styles from './CalibrateChessBoard.module.scss';
import { getMaterialHeight, prepareToTakePicture } from './utils';

interface Props {
  updateParam: (param: FisheyeCameraParametersV2Cali) => void;
  onClose: (complete?: boolean) => void;
  onBack: () => void;
  onNext: () => void;
}

const CalibrateChessBoard = ({ updateParam, onClose, onBack, onNext }: Props): JSX.Element => {
  const lang = useI18n();
  const progressId = useMemo(() => 'ador-calibration-v2', []);
  const [res, setRes] = useState<{
    success: boolean;
    imgblob: Blob;
    imgUrl: string;
    data: FisheyeCameraParametersV2Cali;
  }>(null);

  useEffect(() => () => URL.revokeObjectURL(res?.imgUrl), [res]);

  const initSetup = useCallback(async () => {
    progressCaller.openNonstopProgress({
      id: progressId,
      message: lang.calibration.taking_picture,
    });
    try {
      await deviceMaster.connectCamera();
    } finally {
      progressCaller.popById(progressId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCalibrate = async (retryTimes = 0) => {
    progressCaller.openNonstopProgress({
      id: progressId,
      message: lang.calibration.getting_plane_height,
    });
    const height = await getMaterialHeight();
    console.log('height', height);
    progressCaller.update(progressId, { message: lang.calibration.preparing_to_take_picture });
    await prepareToTakePicture();
    progressCaller.update(progressId, { message: lang.calibration.taking_picture });
    const { imgBlob } = (await deviceMaster.takeOnePicture()) || {};
    if (!imgBlob) {
      if (retryTimes < 3) handleCalibrate(retryTimes + 1);
      else alertCaller.popUpError({ message: 'Unable to get image' });
    } else {
      try {
        await startFisheyeCalibrate();
        const calibrateRes = await calibrateChessboard(imgBlob, height);
        console.log(calibrateRes);
        let displayBlob = imgBlob;
        if (calibrateRes.success === false) {
          if (retryTimes < 3) handleCalibrate(retryTimes + 1);
          else
            alertCaller.popUpError({
              message: `Failed to get correct corners ${calibrateRes.data.reason}`,
            });
        } else {
          displayBlob = calibrateRes.blob;
          if (calibrateRes.data.ret > 3) {
            alertCaller.popUp({
              type: alertConstants.WARNING,
              message: `Large deviation: ${calibrateRes.data.ret}, please chessboard.`,
            });
          }
        }
        setRes({
          success: calibrateRes.success,
          imgblob: displayBlob,
          imgUrl: URL.createObjectURL(displayBlob),
          data: calibrateRes.success ? calibrateRes.data : null,
        });
      } catch (err) {
        alertCaller.popUpError({ message: err.message || 'Fail to find corners' });
      }
    }
    progressCaller.popById(progressId);
  };

  useEffect(() => {
    initSetup().then(() => {
      handleCalibrate();
    });
    return () => deviceMaster.disconnectCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNext = useCallback(() => {
    if (!res.success) return;
    updateParam({
      k: res.data.k,
      d: res.data.d,
      rvec: res.data.rvec,
      tvec: res.data.tvec,
      refHeight: 0,
      // Assuming chessboard is flat
      levelingData: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, I: 0 },
      source: 'device',
    });
    // TODO: override device images
    onNext();
  }, [updateParam, onNext, res]);

  const handleDownloadImage = useCallback(async () => {
    const tFile = lang.topmenu.file;
    dialog.writeFileDialog(() => res.imgblob, 'Download Image', 'chessboard.jpg', [
      { name: window.os === 'MacOS' ? `${tFile.jpg_files} (*.jpg)` : tFile.jpg_files, extensions: ['jpg'] },
      { name: tFile.all_files, extensions: ['*'] },
    ]);
  }, [res?.imgblob, lang]);

  const renderFooter = () =>
    [
      <Button onClick={onBack} key="back">
        {lang.buttons.back}
      </Button>,
      <Button onClick={() => handleCalibrate(0)} key="retry">
        Retry
      </Button>,
      res?.imgblob ? <Button onClick={handleDownloadImage} key="download">
        Download Image
      </Button> : null,
      <Button onClick={handleNext} disabled={!res?.success} key="next" type="primary">
        {lang.buttons.next}
      </Button>,
    ].filter((btn) => btn);

  return (
    <Modal
      open
      centered
      onCancel={() => onClose(false)}
      title={lang.calibration.camera_calibration}
      footer={renderFooter}
      closable
      maskClosable={false}
    >
      {lang.calibration.align_points}
      <Row gutter={[16, 0]}>
        <Col span={18}>
          <div className={styles['img-container']}>
            <img src={res?.imgUrl} />
          </div>
        </Col>
        <Col span={6}>
          {res?.success && (
            <div>
              <div>
                <span>Ret: </span>
                <span>{res.data.ret.toFixed(2)}</span>
              </div>
            </div>
          )}
        </Col>
      </Row>
    </Modal>
  );
};

export default CalibrateChessBoard;
