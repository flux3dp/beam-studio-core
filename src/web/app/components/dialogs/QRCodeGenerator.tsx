import React, { useState } from 'react';
import { Checkbox, Input, Modal, QRCode, QRCodeProps, Radio } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

import ISVGCanvas from 'interfaces/ISVGCanvas';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import FnWrapper from 'app/actions/beambox/svgeditor-function-wrapper';
import importSvgString from 'app/svgedit/operations/import/importSvgString';
import browser from 'implementations/browser';
import useI18n from 'helpers/useI18n';

import styles from './QRCodeGenerator.module.scss';

interface Props {
  onClose: () => void;
}

let svgCanvas: ISVGCanvas;

getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const QRCodeGenerator = ({ onClose }: Props): JSX.Element => {
  const { alert: tAlert, qr_code_generator: tQrCode } = useI18n();
  const [text, setText] = useState('');
  const [errorLevel, setErrorLevel] = useState<QRCodeProps['errorLevel']>('L');
  const [isInvert, setIsInvert] = useState(false);

  const handleOk = () => {
    const svg = document.getElementById('qrcode-container')?.querySelector<SVGElement>('svg');

    if (!svg) {
      return;
    }

    const svgString = new XMLSerializer().serializeToString(svg);

    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    console.log('svgString', svgString);

    importSvgString(svgString, { type: 'layer' });

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
      title={tQrCode.title}
      onCancel={onClose}
      onOk={handleOk}
      okButtonProps={{ disabled: !text }}
      cancelText={tAlert.cancel}
      okText={tAlert.confirm}
    >
      <Input.TextArea
        className={styles.input}
        rows={5}
        maxLength={200}
        value={text}
        onKeyDown={(e) => e.stopPropagation()}
        onChange={(e) => setText(e.target.value)}
        placeholder={tQrCode.placeholder}
        showCount
      />
      <div className={styles.content}>
        <div id="qrcode-container" className={styles['qrcode-container']}>
          {text ? (
            <QRCode
              type="svg"
              className={styles.qrcode}
              value={text}
              size={1000}
              errorLevel={errorLevel}
              color={isInvert ? 'white' : 'black'}
              bgColor={isInvert ? 'black' : 'transparent'}
            />
          ) : (
            <div className={styles.placeholder}>{tQrCode.preview}</div>
          )}
        </div>
        <div className={styles.settings}>
          <div className={styles.label}>
            {tQrCode.error_tolerance}{' '}
            <InfoCircleOutlined onClick={() => browser.open(tQrCode.error_tolerance_link)} />
          </div>
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
            {tQrCode.invert}
          </Checkbox>
        </div>
      </div>
    </Modal>
  );
};

export default QRCodeGenerator;
