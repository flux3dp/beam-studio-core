import React, { useCallback, useEffect, useMemo } from 'react';
import { Button, Modal } from 'antd';

import deviceMaster from 'helpers/device-master';
import getLevelingData from 'app/actions/beambox/fisheye-preview-helpers/getLevelingData';
import progressCaller from 'app/actions/progress-caller';
import useI18n from 'helpers/useI18n';
import { FisheyeCameraParametersV2Cali } from 'interfaces/FisheyePreview';
import { updateData } from 'helpers/camera-calibration-helper';

import { calibrateWithDevicePictures } from './utils';

interface Props {
  updateParam: (param: FisheyeCameraParametersV2Cali) => void;
  onClose: (complete: boolean) => void;
  onNext: (res: boolean) => void;
}
const CheckPictures = ({ updateParam, onClose, onNext }: Props): JSX.Element => {
  const progressId = useMemo(() => 'camera-check-pictures', []);
  const lang = useI18n();

  const calibrateDevicePictures = useCallback(async () => {
    progressCaller.openNonstopProgress({
      id: progressId,
      message: lang.device.processing,
    });
    const levelingData = await getLevelingData('hexa_platform');
    const refHeight = levelingData.A;
    Object.keys(levelingData).forEach((key) => {
      levelingData[key] = refHeight - levelingData[key];
    });
    try {
      progressCaller.update(progressId, {
        message: lang.calibration.calibrating_with_device_pictures,
      });
      const res = await calibrateWithDevicePictures();
      if (res) {
        updateParam({ ...res, source: 'device', refHeight: 0, levelingData });
        await updateData(res);
      } else return;
      onNext(true);
    } finally {
      progressCaller.popById(progressId);
    }
  }, [lang, onNext, progressId, updateParam]);

  const checkPictures = useCallback(async () => {
    progressCaller.openNonstopProgress({
      id: progressId,
      message: lang.calibration.checking_pictures,
    });
    let hasPictures = false;
    try {
      const ls = await deviceMaster.ls('camera_calib');
      hasPictures = ls.files.length > 0;
    } catch {
      /* do nothing */
    }
    progressCaller.popById(progressId);
    if (hasPictures) calibrateDevicePictures();
    else onNext(false);
  }, [lang, progressId, onNext, calibrateDevicePictures]);


  useEffect(() => {
    checkPictures();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Modal
      width={400}
      open
      centered
      maskClosable={false}
      title={lang.calibration.check_device_pictures}
      closable={!!onClose}
      onCancel={() => onClose?.(false)}
      footer={[
        <Button key="yes" type="primary" onClick={calibrateDevicePictures}>
          {lang.alert.yes}
        </Button>,
        <Button key="no" onClick={() => onNext(false)}>
          {lang.alert.no}
        </Button>,
      ]}
    >
      {lang.calibration.checking_pictures}
    </Modal>
  );
};

export default CheckPictures;
