import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal } from 'antd';

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
  const [checking, setChecking] = useState(true);
  const lang = useI18n();
  const checkPictures = useCallback(async () => {
    progressCaller.openNonstopProgress({
      id: progressId,
      message: 'Checking pictures...',
    });
    let hasPictures = false;
    try {
      const ls = await deviceMaster.ls('camera_calib');
      hasPictures = ls.files.length > 0;
    } catch {
      /* do nothing */
    }
    progressCaller.popById(progressId);
    if (!hasPictures) {
      onNext(false);
    } else {
      setChecking(false);
    }
  }, [progressId, onNext]);

  const handleNext = async (usePictures: boolean) => {
    progressCaller.openNonstopProgress({
      id: progressId,
      message: lang.device.processing,
    });
    const levelingData = await getLevelingData(usePictures ? 'hexa_platform' : 'bottom_cover');
    const refHeight = usePictures ? levelingData.A : levelingData.E;
    Object.keys(levelingData).forEach((key) => {
      levelingData[key] = refHeight - levelingData[key];
    });
    updateParam({ levelingData });
    if (usePictures) {
      progressCaller.update(progressId, { message: 'tCalibrating with device pictures' });
      const res = await calibrateWithDevicePictures();
      if (res) {
        updateParam({ ...res, source: 'device', refHeight: 0 });
        await updateData(res);
      }
    }
    progressCaller.popById(progressId);
    onNext(usePictures);
  };

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
      title="tCheck Pictures"
      closable={!!onClose}
      okText={lang.alert.yes}
      cancelText={lang.alert.no}
      onOk={() => handleNext(true)}
      onCancel={() => handleNext(false)}
    >
      {checking ? 'tChecking device pictures...' : 'tDevice has pictures. Use device pictures?'}
    </Modal>
  );
};

export default CheckPictures;
