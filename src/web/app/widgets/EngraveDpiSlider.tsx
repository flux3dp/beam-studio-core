import React from 'react';
import { Col, Form, Input, Row, Slider } from 'antd';

import constant from 'app/actions/beambox/constant';
import i18n from 'helpers/i18n';

const LANG = i18n.lang.beambox.document_panel;

interface Props {
  value: string;
  onChange: (value: string) => void;
}

function EngraveDpiSlider({ value, onChange }: Props): JSX.Element {
  const dpiMap = ['low', 'medium', 'high', 'ultra'];

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
            tooltip={{ formatter: (num: number) => constant.dpiValueMap[dpiMap[num]] }}
          />
        </Col>
        <Col span={12}>
          <Input value={`${LANG[value]} (${constant.dpiValueMap[value]} DPI)`} disabled />
        </Col>
      </Row>
    </Form.Item>
  );
}

export default EngraveDpiSlider;
