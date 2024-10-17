import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, InputNumber, Modal, Segmented, Spin, Tooltip } from 'antd';
import { LoadingOutlined, QuestionCircleOutlined } from '@ant-design/icons';

import beamboxPreference from 'app/actions/beambox/beambox-preference';
import FramingIcons from 'app/icons/framing/FramingIcons';
import FramingTaskManager, { FramingType } from 'helpers/device/framing';
import getDevice from 'helpers/device/get-device';
import icons from 'app/icons/icons';
import MessageCaller, { MessageLevel } from 'app/actions/message-caller';
import useI18n from 'helpers/useI18n';
import { addDialogComponent, isIdExist, popDialogById } from 'app/actions/dialog-controller';
import { getSupportInfo } from 'app/constants/add-on';
import { IDeviceInfo } from 'interfaces/IDevice';
import { promarkModels } from 'app/actions/beambox/constant';

import styles from './FramingModal.module.scss';

interface Props {
  device: IDeviceInfo;
  onClose: () => void;
}

// TODO: add unit test
const FramingModal = ({ device, onClose }: Props): JSX.Element => {
  const lang = useI18n();
  const t = lang.framing;
  const [playing, setPlaying] = useState<boolean>(false);
  const manager = useRef<FramingTaskManager>(null);
  useEffect(() => {
    manager.current = new FramingTaskManager(device);
    manager.current.on('status-change', (status: boolean) => setPlaying(status));
    const messageKey = 'framing';
    manager.current.on('close-message', () => MessageCaller.closeMessage(messageKey));
    manager.current.on('message', (message: string) => {
      MessageCaller.closeMessage(messageKey);
      MessageCaller.openMessage({ key: messageKey, level: MessageLevel.LOADING, content: message });
    });
    return () => {
      manager.current?.stopFraming();
      MessageCaller.closeMessage(messageKey);
    };
  }, [device]);
  const supportInfo = useMemo(() => getSupportInfo(device.model), [device]);

  const [lowLaser, setLowLaser] = useState<number>(beamboxPreference.read('low_power') ?? 10);
  const [type, setType] = useState<FramingType>(FramingType.Framing);
  const options: FramingType[] = useMemo(() => {
    if (promarkModels.has(device.model)) return [FramingType.Framing];
    return [FramingType.Framing, FramingType.Hull, FramingType.AreaCheck];
  }, [device.model]);

  const handleOk = () => {
    manager.current?.startFraming(type, { lowPower: supportInfo.framingLowLaser ? lowLaser : 0 });
  };
  const handleStop = () => {
    manager.current?.stopFraming();
  };

  return (
    <Modal
      open
      centered
      width={360}
      title={t.framing}
      maskClosable={false}
      onCancel={onClose}
      onOk={playing ? handleStop : handleOk}
      footer={
        <div className={styles.footer}>
          <Button className={styles.button} onClick={onClose}>
            {lang.alert.cancel}
          </Button>
          <Button
            className={styles.button}
            onClick={playing ? handleStop : handleOk}
            type="primary"
          >
            {playing ? lang.alert.stop : lang.device.start}
            {playing ? (
              <Spin indicator={<LoadingOutlined className={styles.icon} spin />} />
            ) : (
              <icons.Play className={styles.icon} />
            )}
          </Button>
        </div>
      }
    >
      <div className={styles.container}>
        {supportInfo.framingLowLaser && (
          <div className={styles['low-laser']}>
            <div className={styles.left}>
              <Tooltip title={t.low_laser_desc}>
                <QuestionCircleOutlined className={styles.icon} />
              </Tooltip>
              {t.low_laser}:
            </div>
            <InputNumber
              className={styles.input}
              min={0}
              max={20}
              value={lowLaser}
              onChange={(val) => setLowLaser(val)}
              addonAfter="%"
              controls={false}
              precision={0}
            />
          </div>
        )}
        <Segmented
          className={styles.segmented}
          value={type}
          onChange={(val: FramingType) => setType(val)}
          options={options.map((opt) => ({
            label: (
              <div className={styles.seg}>
                {
                  {
                    [FramingType.Framing]: <FramingIcons.Framing />,
                    [FramingType.Hull]: <FramingIcons.Hull />,
                    [FramingType.AreaCheck]: <FramingIcons.AreaCheck />,
                  }[opt]
                }
                <div>
                  {
                    {
                      [FramingType.Framing]: t.framing,
                      [FramingType.Hull]: t.hull,
                      [FramingType.AreaCheck]: t.area_check,
                    }[opt]
                  }
                </div>
              </div>
            ),
            value: opt,
          }))}
        />
        <div className={styles.desc}>
          <div className={styles.title}>
            {{
              [FramingType.Framing]: t.framing,
              [FramingType.Hull]: t.hull,
              [FramingType.AreaCheck]: t.area_check,
            }[type] ?? t.framing}
          </div>
          <div className={styles.content}>
            {{
              [FramingType.Framing]: t.framing_desc,
              [FramingType.Hull]: t.hull_desc,
              [FramingType.AreaCheck]: t.areacheck_desc,
            }[type] ?? t.framing_desc}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default FramingModal;

export const showFramingModal = async (): Promise<void> => {
  const { device } = await getDevice();
  if (!device) return;
  if (isIdExist('framing-modal')) return;
  addDialogComponent(
    'framing-modal',
    <FramingModal device={device} onClose={() => popDialogById('framing-modal')} />
  );
};
