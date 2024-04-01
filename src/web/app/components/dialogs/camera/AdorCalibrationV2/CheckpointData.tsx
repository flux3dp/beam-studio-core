import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal } from 'antd';

import alertCaller from 'app/actions/alert-caller';
import deviceMaster from 'helpers/device-master';
import progressCaller from 'app/actions/progress-caller';
import useI18n from 'helpers/useI18n';
import { FisheyeCameraParametersV2Cali } from 'interfaces/FisheyePreview';
import { updateData } from 'helpers/camera-calibration-helper';

interface Props {
  updateParam: (param: FisheyeCameraParametersV2Cali) => void;
  onClose: (complete: boolean) => void;
  onNext: (res: boolean) => void;
}

const CheckpointData = ({ updateParam, onClose, onNext }: Props): JSX.Element => {
  const progressId = useMemo(() => 'camera-check-point', []);
  const [checking, setChecking] = useState(true);
  const lang = useI18n();
  const checkData = useCallback(async () => {
    progressCaller.openNonstopProgress({
      id: progressId,
      message: lang.calibration.checking_checkpoint,
    });
    let res = false;
    try {
      const ls = await deviceMaster.ls('fisheye');
      res = ls.files.includes('checkpoint.json');
    } catch {
      /* do nothing */
    }
    progressCaller.popById(progressId);
    if (!res) {
      onNext(false);
    } else {
      setChecking(false);
    }
  }, [lang, progressId, onNext]);

  const handleOk = async () => {
    progressCaller.openNonstopProgress({
      id: progressId,
      message: lang.calibration.downloading_checkpoint,
    });
    try {
      const data = await deviceMaster.downloadFile('fisheye', 'checkpoint.json');
      const [, blob] = data;
      const dataString = await (blob as Blob).text();
      try {
        const jsonData = JSON.parse(dataString);
        await updateData(jsonData);
        updateParam(jsonData);
      } catch (e) {
        console.error(e);
        alertCaller.popUpError({ message: lang.calibration.failed_to_parse_checkpoint });
        onNext(false);
      }
      onNext(true);
    } finally {
      progressCaller.popById(progressId);
    }
  };

  useEffect(() => {
    checkData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Modal
      width={400}
      open
      centered
      maskClosable={false}
      title={lang.calibration.check_checkpoint_data}
      closable={!!onClose}
      okText={lang.alert.yes}
      cancelText={lang.alert.no}
      onOk={handleOk}
      onCancel={() => onNext(false)}
    >
      {checking ? lang.calibration.checking_checkpoint : lang.calibration.found_checkpoint}
    </Modal>
  );
};

export default CheckpointData;
