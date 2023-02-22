import React from 'react';
import { Col, Form, Input, Row, Slider } from 'antd';

import i18n from 'helpers/i18n';

const LANG = i18n.lang.beambox.document_panel;

interface Props {
  value: string;
  onChange: (value: string) => void;
}

function EngraveDpiSlider({ value, onChange }: Props): JSX.Element {
  const dpiMap = [
    'low',
    'medium',
    'high',
    'ultra',
  ];

  const dpiValueMap = {
    low: 100,
    medium: 250,
    high: 500,
    ultra: 1000,
  };

  const onSliderValueChange = (num: number) => {
    onChange(dpiMap[num]);
  };

  return (
    <Form.Item label={LANG.engrave_dpi}>
      <Row gutter={[8, 0]}>
        <Col span={12}>
          <Slider
            min={0}
            max={3}
            value={dpiMap.indexOf(value)}
            onChange={onSliderValueChange}
          />
        </Col>
        <Col span={12}>
          <Input value={`${LANG[value]} (${dpiValueMap[value]} DPI)`} disabled />
        </Col>
      </Row>
    </Form.Item>
  );
}

export default EngraveDpiSlider;
