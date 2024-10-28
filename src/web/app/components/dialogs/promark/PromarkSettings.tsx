import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Flex, Modal, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import checkDeviceStatus from 'helpers/check-device-status';
import deviceMaster from 'helpers/device-master';
import icons from 'app/icons/icons';
import promarkDataStore from 'helpers/device/promark-data-store';
import storage from 'implementations/storage';
import useI18n from 'helpers/useI18n';
import { addDialogComponent, isIdExist, popDialogById } from 'app/actions/dialog-controller';
import { Field, PromarkStore, RedDot, LensCorrection } from 'interfaces/Promark';
import { getWorkarea } from 'app/constants/workarea-constants';
import { IDeviceInfo } from 'interfaces/IDevice';
import {
  calculateRedDotTransform,
  generateCalibrationTaskString,
  loadTaskToSwiftray,
} from 'helpers/device/promark/calibration';

import FieldBlock from './FieldBlock';
import LensBlock from './LensBlock';
import ParametersBlock, { MarkParameters } from './ParametersBlock';
import RedDotBlock from './RedDotBlock';
import styles from './PromarkSettings.module.scss';

interface Props {
  device: IDeviceInfo;
  initData: PromarkStore;
  onClose: () => void;
}

const PromarkSettings = ({ device, initData, onClose }: Props): JSX.Element => {
  const { global: tGlobal, promark_settings: t } = useI18n();
  const { model, serial } = device;
  const isInch = useMemo(() => storage.get('default-units') === 'inches', []);
  const [field, setField] = useState<Field>(initData.field || { offsetX: 0, offsetY: 0, angle: 0 });
  const [redDot, setRedDot] = useState<RedDot>(
    initData.redDot || { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 }
  );
  const [lensCorrection, setLensCorrection] = useState<{ x: LensCorrection; y: LensCorrection }>(
    initData.lensCorrection || {
      x: { scale: 100, bulge: 1, skew: 1, trapezoid: 1 },
      y: { scale: 100, bulge: 1, skew: 1, trapezoid: 1 },
    }
  );
  const [parameters, setParameters] = useState<MarkParameters>({ power: 20, speed: 1000 });
  const { power, speed } = parameters;
  const { width } = useMemo(() => getWorkarea(model), [model]);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const previewTask = useRef<string>('');
  const markTask = useRef<string>('');
  useEffect(() => {
    previewTask.current = '';
  }, [redDot, width]);
  const uploadPreviewTask = useCallback(async () => {
    if (!previewTask.current) {
      const transform = calculateRedDotTransform(
        width,
        redDot.offsetX,
        redDot.offsetY,
        redDot.scaleX,
        redDot.scaleY
      );
      previewTask.current = await generateCalibrationTaskString({ width, transform });
    }
    await loadTaskToSwiftray(previewTask.current, model);
  }, [model, redDot, width]);

  useEffect(() => {
    markTask.current = '';
  }, [width, power, speed]);
  const uploadMarkTask = useCallback(async () => {
    if (!markTask.current) {
      markTask.current = await generateCalibrationTaskString({ width, power, speed });
    }
    await loadTaskToSwiftray(markTask.current, model);
  }, [model, width, power, speed]);

  const handleUpdateParameter = async () => {
    // TODO: set field
    await deviceMaster.setLensCorrection(lensCorrection);
  };

  const handlePreview = async () => {
    if (!isPreviewing) {
      await uploadPreviewTask();
      await handleUpdateParameter();
      await deviceMaster.startFraming();
      setIsPreviewing(true);
    } else {
      await deviceMaster.stopFraming();
      setIsPreviewing(false);
    }
  };

  const handleMark = async () => {
    await uploadMarkTask();
    await handleUpdateParameter();
    await deviceMaster.doPromarkCalibration();
  };

  const handleSave = async () => {
    promarkDataStore.update(serial, { field, redDot, lensCorrection });
    await handleUpdateParameter();
    onClose();
  };

  const handleCancel = () => {
    // TODO: reset data
    onClose();
  };

  const footer = (
    <Flex className={styles.footer} justify="space-between" align="center">
      <Flex gap={8} align="center">
        <Button className={styles.button} onClick={handlePreview}>
          {t.preview}
          {isPreviewing ? (
            <Spin indicator={<LoadingOutlined className={styles.icon} spin />} />
          ) : (
            <icons.Play className={styles.icon} />
          )}
        </Button>
        <Button className={styles.button} onClick={handleMark}>
          {t.mark}
        </Button>
      </Flex>
      <Flex gap={8} align="center">
        <Button className={styles.button} onClick={handleCancel}>
          {tGlobal.cancel}
        </Button>
        <Button className={styles.button} type="primary" onClick={handleSave}>
          {tGlobal.save}
        </Button>
      </Flex>
    </Flex>
  );

  return (
    <Modal open centered width={620} title={t.title} onCancel={handleCancel} footer={footer}>
      <div className={styles.container}>
        <FieldBlock width={width} isInch={isInch} field={field} setField={setField} />
        <RedDotBlock isInch={isInch} redDot={redDot} setRedDot={setRedDot} />
        <LensBlock data={lensCorrection} setData={setLensCorrection} />
        <ParametersBlock isInch={isInch} parameters={parameters} setParameters={setParameters} />
      </div>
    </Modal>
  );
};

export const showPromarkSettings = async (device: IDeviceInfo): Promise<void> => {
  await deviceMaster.select(device);
  const res = await checkDeviceStatus(device);
  if (!res) return;
  const { serial } = device;
  const data = promarkDataStore.get(serial) as PromarkStore;
  const id = 'promark-settings';
  if (!isIdExist(id)) {
    addDialogComponent(
      id,
      <PromarkSettings device={device} initData={data} onClose={() => popDialogById(id)} />
    );
  }
};

export default PromarkSettings;
