import React, { useMemo, useState } from 'react';
import { Button, Checkbox, Modal, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

import deviceConstants from 'app/constants/device-constants';
import deviceMaster from 'helpers/device-master';
import getDevice from 'helpers/device/get-device';
import MessageCaller, { MessageLevel } from 'app/actions/message-caller';
import progressCaller from 'app/actions/progress-caller';
import storage from 'implementations/storage';
import UnitInput from 'app/widgets/UnitInput';
import useI18n from 'helpers/useI18n';
import { ILang } from 'interfaces/ILang';

import styles from './PreviewHeight.module.scss';

enum Step {
  ASK_FOCUS = 0,
  ADJUST = 1,
}

interface Props {
  initValue?: number;
  onOk: (val: number | null) => void;
  onClose: () => void;
}

const getProbeHeight = async (lang: ILang) => {
  try {
    progressCaller.openNonstopProgress({ id: 'preview-height', message: lang.message.getProbePosition });
    if (!deviceMaster.currentDevice) await getDevice();
    const device = deviceMaster.currentDevice;
    if (device.control.getMode() !== 'raw') deviceMaster.enterRawMode();
    const { didAf, z } = await deviceMaster.rawGetProbePos();
    if (!didAf) return null;
    return deviceConstants.WORKAREA_DEEP[device.info.model] - z;
  } catch {
    return null;
  } finally {
    progressCaller.popById('preview-height');
  }
};

// TODO: add test
const PreviewHeight = ({ initValue, onOk, onClose }: Props): JSX.Element => {
  const lang = useI18n();
  const hasInitValue = useMemo(() => typeof initValue === 'number', [initValue]);
  const [adjustChecked, setAdjustChecked] = useState(!hasInitValue);
  const [step, setStep] = useState(hasInitValue ? Step.ADJUST : Step.ASK_FOCUS);
  const [value, setValue] = useState(initValue ?? 0);
  const unit = useMemo(() => (storage.get('default-units') === 'inches' ? 'in' : 'mm'), []);
  const isInch = useMemo(() => unit === 'in', [unit]);

  if (step === Step.ASK_FOCUS) {
    return (
      <Modal
        open
        centered
        closable={false}
        maskClosable={false}
        title={lang.message.preview.auto_focus}
        cancelText={lang.message.preview.enter_manually}
        onOk={async () => {
          const probeHeight = await getProbeHeight(lang);
          if (typeof probeHeight !== 'number') {
            MessageCaller.openMessage({
              level: MessageLevel.WARNING,
              duration: 3,
              content: 'get well soon',
            });
            return;
          }
          setValue(probeHeight);
          setStep(Step.ADJUST);
        }}
        onCancel={() => setStep(Step.ADJUST)}
      >
        <div className={styles.text}>
          {lang.message.preview.auto_focus_instruction}
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open
      centered
      closable={false}
      maskClosable={false}
      title={lang.message.preview.camera_preview}
      footer={[
        <Button key="cancel" onClick={() => {
          onOk(null);
          onClose();
        }}>
          {lang.alert.cancel}
        </Button>,
        <Button key="back" onClick={() => setStep(Step.ASK_FOCUS)}>
          {hasInitValue ? lang.message.preview.redo_auto_focus : lang.buttons.back}
        </Button>,
        <Button type="primary" key="ok" onClick={() => {
          onOk(value);
          onClose();
        }}>
          {lang.message.preview.save_and_use}
        </Button>,
      ]}
    >
      <div className={styles.text}>
        {hasInitValue ? lang.message.preview.already_performed_auto_focus : lang.message.preview.please_enter_height}
        <Tooltip className={styles.tooltip} trigger="hover" title={lang.message.preview.adjust_height_tooltip}>
          <QuestionCircleOutlined />
        </Tooltip>
      </div>
      <div className={styles.inputs}>
        <UnitInput
          unit={unit}
          isInch={isInch}
          value={value}
          precision={isInch ? 3 : 2}
          step={isInch ? 0.254 : 0.1}
          disabled={!adjustChecked}
          onChange={(val) => setValue(val)}
        />
        {hasInitValue && (
          <Checkbox checked={adjustChecked} onChange={(e) => setAdjustChecked(e.target.checked)}>
            {lang.message.preview.adjust}
          </Checkbox>
        )}
      </div>
    </Modal>
  );
};

export default PreviewHeight;
