import React from 'react';

import { Col, Form, InputNumber, Row, Slider } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

import useI18n from 'helpers/useI18n';

import styles from './PanelContent.module.scss';

interface Props {
  tolerance: number;
  setTolerance: (tolerance: number) => void;
}

const MAX_TOLERANCE = 100;

export default function MagicWand({ tolerance, setTolerance }: Props): JSX.Element {
  const lang = useI18n();
  const t = lang.beambox.photo_edit_panel;

  return (
    <div className={styles.wrapper}>
      <div className={styles['hint-text']}>
        <QuestionCircleOutlined className={styles.icon} />
        <span>Select and remove adjacent areas based on color similarity.</span>
      </div>
      <Form layout="vertical">
        <Form.Item label="Tolerance:">
          <Row>
            <Col flex="auto">
              <Slider
                min={1}
                max={MAX_TOLERANCE}
                step={1}
                value={tolerance}
                onChange={setTolerance}
              />
            </Col>
            <Col flex="100px">
              <InputNumber
                min={1}
                max={MAX_TOLERANCE}
                step={1}
                value={tolerance}
                onChange={setTolerance}
              />
            </Col>
          </Row>
        </Form.Item>
      </Form>
    </div>
  );
}
