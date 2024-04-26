import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Modal } from 'antd';
import { SpinLoading } from 'antd-mobile';

import alertCaller from 'app/actions/alert-caller';
import deviceMaster from 'helpers/device-master';
import progressCaller from 'app/actions/progress-caller';
import useI18n from 'helpers/useI18n';
import { FisheyeCameraParametersV2Cali } from 'interfaces/FisheyePreview';
import { updateData } from 'helpers/camera-calibration-helper';

import styles from './CheckpointData.module.scss';

interface Props {
  factoryMode?: boolean;
  updateParam: (param: FisheyeCameraParametersV2Cali) => void;
  onClose: (complete: boolean) => void;
  onNext: (res: boolean) => void;
}

const CheckpointData = ({ factoryMode, updateParam, onClose, onNext }: Props): JSX.Element => {
  const progressId = useMemo(() => 'camera-check-point', []);
  const [checkpointData, setCheckpointData] = useState<{
    file: string;
    data: FisheyeCameraParametersV2Cali;
  }>(null);
  const lang = useI18n();
  const checkData = useCallback(async () => {
    progressCaller.openNonstopProgress({
      id: progressId,
      message: lang.calibration.checking_checkpoint,
    });
    let res = null;
    try {
      const data = await deviceMaster.downloadFile('fisheye', 'fisheye_params.json');
      const [, blob] = data;
      const dataString = await (blob as Blob).text();
      res = JSON.parse(dataString);
      if (res.v === 2) {
        setCheckpointData({
          file: 'fisheye_params.json',
          data: {
            k: res.k,
            d: res.d,
            rvec: res.rvec,
            tvec: res.tvec,
            refHeight: res.refHeight,
            source: res.source,
          },
        });
        progressCaller.popById(progressId);
        return;
      }
    } catch {
      /* do nothing */
    }
    try {
      const data = await deviceMaster.downloadFile('fisheye', 'checkpoint.json');
      const [, blob] = data;
      const dataString = await (blob as Blob).text();
      res = JSON.parse(dataString);
      if (res) {
        setCheckpointData({
          file: 'checkpoint.json',
          data: res,
        });
        progressCaller.popById(progressId);
        return;
      }
    } catch {
      /* do nothing */
    }
    progressCaller.popById(progressId);
    onNext(false);
  }, [lang, progressId, onNext]);

  const handleOk = useCallback(async () => {
    progressCaller.openNonstopProgress({
      id: progressId,
      message: lang.calibration.downloading_checkpoint,
    });
    try {
      const { data } = checkpointData;
      try {
        await updateData(data);
        updateParam(data);
      } catch (e) {
        console.error(e);
        alertCaller.popUpError({ message: lang.calibration.failed_to_parse_checkpoint });
        onNext(false);
      }
      onNext(true);
    } finally {
      progressCaller.popById(progressId);
    }
  }, [checkpointData, lang, onNext, progressId, updateParam]);

  useEffect(() => {
    checkData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (checkpointData && !factoryMode) handleOk();
  }, [checkpointData, factoryMode, handleOk]);

  if (!factoryMode)
    return (
      <Modal
        width={400}
        open
        centered
        maskClosable={false}
        closable={!!onClose}
        onCancel={() => onClose?.(false)}
        footer={[]}
      >
        <SpinLoading className={styles.spinner} color="primary" style={{ '--size': '48px' }} />
      </Modal>
    );

  return (
    <Modal
      width={400}
      open
      centered
      maskClosable={false}
      title={lang.calibration.check_checkpoint_data}
      closable={!!onClose}
      onCancel={() => onClose?.(false)}
      footer={[
        <Button key="no" onClick={() => onNext(false)}>
          {lang.alert.no}
        </Button>,
        <Button key="yes" type="primary" onClick={handleOk}>
          {lang.alert.yes}
        </Button>,
      ]}
    >
      {!checkpointData && lang.calibration.checking_checkpoint}
      {checkpointData?.data &&
        (checkpointData.file === 'fisheye_params.json'
          ? lang.calibration.use_old_camera_parameter
          : lang.calibration.found_checkpoint)}
      {checkpointData?.data && (
        <>
          <br />
          Data Source: {checkpointData.data.source}
        </>
      )}
    </Modal>
  );
};

export default CheckpointData;
