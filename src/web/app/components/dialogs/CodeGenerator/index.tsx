import React, { useState } from 'react';
import { Modal, Tabs, TabsProps } from 'antd';

import ISVGCanvas from 'interfaces/ISVGCanvas';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import FnWrapper from 'app/actions/beambox/svgeditor-function-wrapper';
import useI18n from 'helpers/useI18n';
import styles from './index.module.scss';

import QRCodeGenerator from './QRCodeGenerator';
import BarcodeGenerator from './BarcodeGenerator';

interface Props {
  onClose: () => void;
}

let svgCanvas: ISVGCanvas;

getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

export default function CodeGenerator({ onClose }: Props): JSX.Element {
  const { alert: tAlert } = useI18n();
  const [tabKey, setTabKey] = useState('barcode');

  const handleOk = () => {
    const targetElement = document.getElementById(`${tabKey}-container`);
    const svg = targetElement?.querySelector<SVGElement>('svg');
    console.log(tabKey);

    if (!svg) {
      return;
    }

    const { width: w, height: h } = svg.getBoundingClientRect();
    const [width, height] = tabKey === 'qrcode' ? [500, 500] : [w * 4, h * 4];
    const svgString = new XMLSerializer().serializeToString(svg);

    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    // console.log('svgString', svgString);
    // importSvgString(svgString, { type: 'layer' });

    FnWrapper.insertImage(url, { x: 0, y: 0, width, height }, 127, {
      useCurrentLayer: true,
      ratioFixed: true,
    });

    onClose();
  };

  const items: TabsProps['items'] = [
    {
      key: 'qrcode',
      label: 'QR Code',
      children: <QRCodeGenerator />,
    },
    {
      key: 'barcode',
      label: 'Barcode',
      children: <BarcodeGenerator />,
    },
  ];

  return (
    <Modal
      open
      centered
      title="Code Generator"
      onCancel={onClose}
      onOk={handleOk}
      // okButtonProps={{ disabled: !text }}
      width="auto"
      cancelText={tAlert.cancel}
      okText={tAlert.confirm}
      className={styles.modal}
    >
      <Tabs key={tabKey} defaultActiveKey={tabKey} onChange={setTabKey} items={items} />
    </Modal>
  );
}
