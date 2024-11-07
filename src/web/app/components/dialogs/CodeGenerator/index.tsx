import React, { useState, useMemo } from 'react';
import { Flex, Radio } from 'antd';
import useI18n from 'helpers/useI18n';
import DraggableModal from 'app/widgets/DraggableModal';
import styles from './index.module.scss';

import QRCodeGenerator from './QRCodeGenerator';
import BarcodeGenerator from './BarcodeGenerator';
import { importBarcodeSvgString, importQrCodeSvgString } from './svgOperation';

interface Props {
  onClose: () => void;
}

export default function CodeGenerator({ onClose }: Props): JSX.Element {
  const {
    alert: tAlert,
    topbar: {
      menu: { tools: tTools },
    },
    code_generator: tCodeGenerator,
  } = useI18n();
  const [tabKey, setTabKey] = useState('qrcode');
  const [isInvert, setIsInvert] = useState(false);

  const handleOk = async () => {
    const svgElement = document.querySelector<SVGElement>(`#${tabKey}-container svg`);

    if (!svgElement) {
      return;
    }

    const svgString = new XMLSerializer().serializeToString(svgElement);

    if (tabKey === 'barcode') {
      await importBarcodeSvgString(svgString, isInvert);
    } else {
      const viewBoxWidth = svgElement.getAttribute('viewBox')?.split(' ')[2];

      importQrCodeSvgString(svgString, viewBoxWidth, isInvert);
    }

    onClose();
  };

  const options = useMemo(
    () => [
      { label: tCodeGenerator.qr_code, value: 'qrcode' },
      { label: tCodeGenerator.barcode, value: 'barcode' },
    ],
    [tCodeGenerator]
  );

  const renderContent = () =>
    tabKey === 'barcode' ? (
      <BarcodeGenerator isInvert={isInvert} setIsInvert={setIsInvert} />
    ) : (
      <QRCodeGenerator isInvert={isInvert} setIsInvert={setIsInvert} />
    );

  const titleStyle = { lineHeight: '24px', marginBottom: 20 };

  return (
    <DraggableModal
      open
      centered
      title={
        <Flex gap={12} style={titleStyle}>
          <div>{tTools.code_generator}</div>
          <Radio.Group
            style={{ fontWeight: 'normal' }}
            size="small"
            optionType="button"
            options={options}
            defaultValue={tabKey}
            onChange={(e) => {
              setTabKey(e.target.value);
              setIsInvert(false);
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
    </DraggableModal>
  );
}
