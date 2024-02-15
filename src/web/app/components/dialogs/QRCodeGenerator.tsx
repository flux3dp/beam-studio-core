import React, { useState } from 'react';
import { Checkbox, Input, Modal, QRCode, QRCodeProps, Radio } from 'antd';

import FnWrapper from 'app/actions/beambox/svgeditor-function-wrapper';
import useI18n from 'helpers/useI18n';

import styles from './QRCodeGenerator.module.scss';

interface Props {
  onClose: () => void;
}

const QRCodeGenerator = ({ onClose }: Props): JSX.Element => {
  const LANG = useI18n();
  const lang = LANG.qr_code_generator;
  const [text, setText] = useState('');
  const [errorLevel, setErrorLevel] = useState<QRCodeProps['errorLevel']>('L');
  const [isInvert, setIsInvert] = useState(false);

  const handleOk = () => {
    const canvas = document.querySelector<HTMLCanvasElement>(`.${styles.qrcode} canvas`);
    const url = canvas.toDataURL('image/png', 1);
    FnWrapper.insertImage(url, { x: 0, y: 0, width: 500, height: 500 }, 127, {
      useCurrentLayer: true,
      ratioFixed: true,
    });
    onClose();
  };

  return (
    <Modal
      open
      centered
      title={lang.title}
      onCancel={onClose}
      onOk={handleOk}
      okButtonProps={{ disabled: !text }}
      cancelText={LANG.alert.cancel}
      okText={LANG.alert.confirm}
    >
      <Input.TextArea
        className={styles.input}
        rows={5}
        maxLength={200}
        value={text}
        onKeyDown={(e) => e.stopPropagation()}
        onChange={(e) => setText(e.target.value)}
        placeholder={lang.placeholder}
        showCount
      />
      <div className={styles.content}>
        <div className={styles['qrcode-container']}>
          {text ? (
            <QRCode
              className={styles.qrcode}
              value={text}
              size={1000}
              errorLevel={errorLevel}
              color={isInvert ? 'white' : 'black'}
              bgColor={isInvert ? 'black' : 'transparent'}
            />
          ) : (
            <div className={styles.placeholder}>{lang.preview}</div>
          )}
        </div>
        <div className={styles.settings}>
          <div className={styles.label}>{lang.error_tolerance}</div>
          <Radio.Group
            value={errorLevel}
            onChange={(e) => setErrorLevel(e.target.value)}
            options={[
              { label: '7%', value: 'L' },
              { label: '15%', value: 'M' },
              { label: '20%', value: 'Q' },
              { label: '30%', value: 'H' },
            ]}
          />
          <Checkbox
            className={styles.checkbox}
            checked={isInvert}
            onChange={() => setIsInvert(!isInvert)}
          >
            {lang.invert}
          </Checkbox>
        </div>
      </div>
    </Modal>
  );
};

export default QRCodeGenerator;
