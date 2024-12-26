import React from 'react';

import { Col, Form, InputNumber, Row, Slider } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

import useI18n from 'helpers/useI18n';

import styles from './PanelContent.module.scss';

interface Props {
  brushSize: number;
  setBrushSize: (size: number) => void;
}

const MAX_BRUSH_SIZE = 128;

export default function Eraser({ brushSize, setBrushSize }: Props): JSX.Element {
  const lang = useI18n();
  const t = lang.beambox.photo_edit_panel;

  return (
    <div className={styles.wrapper}>
      <div className={styles['hint-text']}>
        <QuestionCircleOutlined className={styles.icon} />
        <span>Single click or hold and drag to erase.</span>
      </div>
      <Form layout="vertical">
        <Form.Item label="Brush Size:">
          <Row>
            <Col flex="auto">
              <Slider
                min={1}
                max={MAX_BRUSH_SIZE}
                step={1}
                value={brushSize}
                onChange={setBrushSize}
              />
            </Col>
            <Col flex="100px">
              <InputNumber
                min={1}
                max={MAX_BRUSH_SIZE}
                step={1}
                value={brushSize}
                onChange={setBrushSize}
              />
            </Col>
          </Row>
        </Form.Item>
      </Form>
    </div>
  );
}
