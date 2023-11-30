import React, { useCallback, useState } from 'react';
import { Button, Col, InputNumber, Modal, Row } from 'antd';

import { RotationParameters3D } from 'app/constants/camera-calibration-constants';

interface Props {
  initialParams?: RotationParameters3D;
  onApply: (params: RotationParameters3D) => void;
  onSave: (params: RotationParameters3D) => void;
  onClose: () => void;
}

const RotationParameters3DPanel = ({ initialParams, onApply, onClose, onSave }: Props): JSX.Element => {
  const [params, setParams] = useState<RotationParameters3D>(
    initialParams || {
      rx: 0,
      ry: 0,
      rz: 0,
      sh: 6,
      ch: 182,
      dh: 0,
    }
  );

  const handleValueChange = (key: keyof RotationParameters3D, value: number) => {
    setParams({
      ...params,
      [key]: value,
    });
  };

  const handleApply = useCallback(() => {
    onClose();
    onApply(params);
  }, [params, onApply, onClose]);

  const handleSave = useCallback(() => {
    onClose();
    onSave(params);
  }, [params, onSave, onClose]);

  return (
    <Modal
      open
      centered
      maskClosable={false}
      onCancel={onClose}
      title="3D Rotation Adjustment"
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="apply" onClick={handleApply}>
          Apply
        </Button>,
        <Button key="download" type="primary" onClick={handleSave}>
          Save To Machine
        </Button>,
      ]}
    >
      <Row gutter={[8, 8]}>
        <Col span={8}>Rx</Col>
        <Col span={16}>
          <InputNumber step={0.1} value={params.rx} onChange={(val) => handleValueChange('rx', val)} />
        </Col>
        <Col span={8}>Ry</Col>
        <Col span={16}>
          <InputNumber step={0.1} value={params.ry} onChange={(val) => handleValueChange('ry', val)} />
        </Col>
        <Col span={8}>Rz</Col>
        <Col span={16}>
          <InputNumber step={0.1} value={params.rz} onChange={(val) => handleValueChange('rz', val)} />
        </Col>
        <Col span={8}>dh</Col>
        <Col span={16}>
          <InputNumber step={0.1} value={params.dh} onChange={(val) => handleValueChange('dh', val)} />
        </Col>
        <Col span={8}>Sh</Col>
        <Col span={16}>
          <InputNumber step={0.1} value={params.sh} onChange={(val) => handleValueChange('sh', val)} />
        </Col>
        <Col span={8}>Ch</Col>
        <Col span={16}>
          <InputNumber value={params.ch} onChange={(val) => handleValueChange('ch', val)} />
        </Col>
      </Row>
    </Modal>
  );
};

export default RotationParameters3DPanel;
