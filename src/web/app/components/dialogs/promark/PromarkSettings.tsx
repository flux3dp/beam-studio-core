import React, { useMemo, useState } from 'react';
import { Button, Flex, Modal } from 'antd';

import icons from 'app/icons/icons';
import promarkDataStore from 'helpers/device/promark-data-store';
import storage from 'implementations/storage';
import useI18n from 'helpers/useI18n';
import { addDialogComponent, isIdExist, popDialogById } from 'app/actions/dialog-controller';
import { Field, PromarkStore, RedDot, LensCorrection } from 'interfaces/Promark';
import { IDeviceInfo } from 'interfaces/IDevice';
import { WorkAreaModel } from 'app/constants/workarea-constants';

import FieldBlock from './FieldBlock';
import LensBlock from './LensBlock';
import RedDotBlock from './RedDotBlock';
import styles from './PromarkSettings.module.scss';

interface Props {
  model: WorkAreaModel;
  serial: string;
  initData: PromarkStore;
  onClose: () => void;
}

const PromarkSettings = ({ model, serial, initData, onClose }: Props) => {
  const { global: tGlobal, promark_settings: t } = useI18n();
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

  const handleSave = () => {
    promarkDataStore.update(serial, { field, redDot, lensCorrection });
    // TODO: reset machine parameters?
    onClose();
  };

  const footer = (
    <Flex className={styles.footer} justify="space-between" align="center">
      <Flex gap={8} align="center">
        <Button className={styles.button}>{t.preview}</Button>
        <Button className={styles.button}>
          {t.mark}
          <icons.Play className={styles.icon} />
        </Button>
      </Flex>
      <Flex gap={8} align="center">
        <Button className={styles.button} onClick={onClose}>
          {tGlobal.cancel}
        </Button>
        <Button className={styles.button} type="primary" onClick={handleSave}>
          {tGlobal.save}
        </Button>
      </Flex>
    </Flex>
  );

  return (
    <Modal
      open
      centered
      width={620}
      title={t.title}
      onOk={handleSave}
      onCancel={onClose}
      okText={tGlobal.save}
      cancelText={tGlobal.cancel}
      footer={footer}
    >
      <div className={styles.container}>
        <FieldBlock model={model} isInch={isInch} field={field} setField={setField} />
        <RedDotBlock isInch={isInch} redDot={redDot} setRedDot={setRedDot} />
        <LensBlock data={lensCorrection} setData={setLensCorrection} />
      </div>
    </Modal>
  );
};

export const showPromarkSettings = (device: IDeviceInfo): void => {
  const { model, serial } = device;
  const data = promarkDataStore.get(serial) as PromarkStore;
  const id = 'promark-settings';
  if (!isIdExist(id)) {
    addDialogComponent(
      id,
      <PromarkSettings
        model={model}
        serial={serial}
        initData={data}
        onClose={() => popDialogById(id)}
      />
    );
  }
};

export default PromarkSettings;
