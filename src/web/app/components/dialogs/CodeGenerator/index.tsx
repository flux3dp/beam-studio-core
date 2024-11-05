/* eslint-disable max-len */
/* eslint-disable no-param-reassign */
import React, { useState } from 'react';
import { Flex, Modal, Radio } from 'antd';

import ISVGCanvas from 'interfaces/ISVGCanvas';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import useI18n from 'helpers/useI18n';
import importSvgString from 'app/svgedit/operations/import/importSvgString';
import styles from './index.module.scss';

import QRCodeGenerator from './QRCodeGenerator';
import BarcodeGenerator from './BarcodeGenerator';
import { extractSvgTags, removeFirstRectTag } from './svgOperation';

interface Props {
  onClose: () => void;
}

let svgCanvas: ISVGCanvas;

getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

function handleQrCodeInvertColor(svgString: string, size: string) {
  const fullPath = `<path fill="black" d="M0 0h${size}v${size}H0z" />`;
  const infoPath = extractSvgTags(svgString, 'path')[1];
  const d = svgCanvas.pathActions.booleanOperation(fullPath, infoPath, 2);

  importSvgString(
    `<svg xmlns="http://www.w3.org/2000/svg" height="1000" width="1000" viewBox="0 0 ${size} ${size}"><path fill="black" d="${d}" shape-rendering="crispEdges"/></svg>`,
    { type: 'layer' }
  );
}

function handleBarcodeInvertColor(svgString: string) {
  const fullPath = '<path fill="black" d="M0 0h21v21H0z" />';
  const infoPath = extractSvgTags(svgString, 'g')[0];
  const d = svgCanvas.pathActions.booleanOperation(fullPath, infoPath, 2);

  importSvgString(
    `<svg xmlns="http://www.w3.org/2000/svg" height="1000" width="1000" viewBox="0 0 21 21"><path fill="black" d="${d}" shape-rendering="crispEdges"/></svg>`,
    { type: 'layer' }
  );
}

export default function CodeGenerator({ onClose }: Props): JSX.Element {
  const { alert: tAlert } = useI18n();
  const [tabKey, setTabKey] = useState('barcode');
  const [isInvert, setIsInvert] = useState(false);

  const handleOk = () => {
    const svg = document.getElementById(`${tabKey}-container`)?.querySelector<SVGElement>('svg');

    if (!svg) {
      return;
    }

    const svgString = new XMLSerializer().serializeToString(svg);
    const parsedSvgString = removeFirstRectTag(svgString);
    console.log(parsedSvgString);

    if (isInvert) {
      if (tabKey === 'qrcode') {
        handleQrCodeInvertColor(parsedSvgString, svg.getAttribute('viewBox').split(' ')[2]);
      }

      if (tabKey === 'barcode') {
        handleBarcodeInvertColor(parsedSvgString);
      }

      onClose();
      return;
    }

    importSvgString(parsedSvgString, { type: 'layer' });
    onClose();
  };

  const options = [
    {
      label: 'QR Code',
      value: 'qrcode',
    },
    {
      label: 'Barcode',
      value: 'barcode',
    },
  ];

  const renderContent = () =>
    tabKey === 'barcode' ? (
      <BarcodeGenerator isInvert={isInvert} setIsInvert={setIsInvert} />
    ) : (
      <QRCodeGenerator isInvert={isInvert} setIsInvert={setIsInvert} />
    );

  return (
    <Modal
      open
      centered
      title={
        <Flex gap={12} style={{ marginBottom: 20 }}>
          <div style={{ lineHeight: '24px' }}>Code Generator</div>
          <Radio.Group
            style={{ fontWeight: 'normal' }}
            size="small"
            optionType="button"
            options={options}
            defaultValue={tabKey}
            onChange={(e) => {
              setIsInvert(false);
              setTabKey(e.target.value);
            }}
          />
        </Flex>
      }
      onCancel={onClose}
      onOk={handleOk}
      width="520"
      cancelText={tAlert.cancel}
      okText={tAlert.confirm}
      className={styles.modal}
    >
      {renderContent()}
    </Modal>
  );
}
