import React from 'react';

import i18n from 'helpers/i18n';
import { Col, Form, Input, Row, Slider } from 'antd';

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
      <Row>
        <Col span={16}>
          <Slider
            min={0}
            max={3}
            value={dpiMap.indexOf(value)}
            onChange={onSliderValueChange}
          />
        </Col>
        <Col span={8}>
          <Input value={`${LANG[value]} (${dpiValueMap[value]} DPI)`} disabled />
        </Col>
      </Row>
    </Form.Item>
  );
}

export default EngraveDpiSlider;
