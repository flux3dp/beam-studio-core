import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Col, InputNumber, Modal, Row } from 'antd';

import { RotationParameters3DCalibration } from 'interfaces/FisheyePreview';

interface Props {
  initialParams?: RotationParameters3DCalibration;
  onApply: (params: RotationParameters3DCalibration) => void;
  onSave: (params: RotationParameters3DCalibration) => void;
  onClose: () => void;
}

const RotationParameters3DPanel = ({
  initialParams,
  onApply,
  onClose,
  onSave,
}: Props): JSX.Element => {
  const onChangeApplyTimeout = useRef<NodeJS.Timeout>(null);
  const [params, setParams] = useState<RotationParameters3DCalibration>(
    initialParams || {
      rx: 0,
      ry: 0,
      rz: 0,
      sh: 6,
      ch: 182,
      dh: 0,
      tx: 0,
      ty: 0,
    }
  );
  useEffect(() => {
    if (onChangeApplyTimeout.current) {
      clearTimeout(onChangeApplyTimeout.current);
    }
    onChangeApplyTimeout.current = setTimeout(() => {
      onApply(params);
    }, 1000);
  }, [onApply, params]);
  const handleValueChange = (key: keyof RotationParameters3DCalibration, value: number) => {
    setParams({
      ...params,
      [key]: value,
    });
  };

  const handleApply = useCallback(() => {
    onApply(params);
  }, [params, onApply]);

  const handleSave = useCallback(() => {
    onClose();
    onSave(params);
  }, [params, onSave, onClose]);

  return (
    <Modal
      mask={false}
      width={242}
      open
      style={{ right: 0, position: 'absolute' }}
      maskClosable={false}
      onCancel={onClose}
      title="3D Rotation Adjustment"
      footer={[
        <Button key="apply" onClick={handleApply}>
          Apply
        </Button>,
        <Button key="download" type="primary" onClick={handleSave}>
          Save
        </Button>,
      ]}
    >
      <Row gutter={[8, 8]}>
        <Col span={8}>rx</Col>
        <Col span={16}>
          <InputNumber
            step={0.1}
            precision={2}
            value={params.rx}
            onChange={(val) => handleValueChange('rx', val)}
          />
        </Col>
        <Col span={8}>ry</Col>
        <Col span={16}>
          <InputNumber
            step={0.1}
            precision={2}
            value={params.ry}
            onChange={(val) => handleValueChange('ry', val)}
          />
        </Col>
        <Col span={8}>rz</Col>
        <Col span={16}>
          <InputNumber
            step={0.1}
            precision={2}
            value={params.rz}
            onChange={(val) => handleValueChange('rz', val)}
          />
        </Col>
        <Col span={8}>tx</Col>
        <Col span={16}>
          <InputNumber
            step={1}
            precision={0}
            value={params.tx}
            onChange={(val) => handleValueChange('tx', val)}
          />
        </Col>
        <Col span={8}>ty</Col>
        <Col span={16}>
          <InputNumber
            step={1}
            precision={0}
            value={params.ty}
            onChange={(val) => handleValueChange('ty', val)}
          />
        </Col>
        <Col span={8}>dh</Col>
        <Col span={16}>
          <InputNumber
            step={0.1}
            precision={1}
            value={params.dh}
            onChange={(val) => handleValueChange('dh', val)}
          />
        </Col>
        <Col span={8}>sh</Col>
        <Col span={16}>
          <InputNumber
            step={0.1}
            value={params.sh}
            onChange={(val) => handleValueChange('sh', val)}
          />
        </Col>
        <Col span={8}>ch</Col>
        <Col span={16}>
          <InputNumber value={params.ch} onChange={(val) => handleValueChange('ch', val)} />
        </Col>
      </Row>
    </Modal>
  );
};

export default RotationParameters3DPanel;
