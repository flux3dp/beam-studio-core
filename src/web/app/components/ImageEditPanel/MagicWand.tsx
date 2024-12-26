import React from 'react';

import { Col, Form, InputNumber, Row, Slider } from 'antd';
import useI18n from 'helpers/useI18n';

import { QuestionCircleOutlined } from '@ant-design/icons';
import styles from './PanelContent.module.scss';

interface Props {
  tolerance: number;
  setTolerance: (tolerance: number) => void;
}

export default function MagicWand({ tolerance, setTolerance }: Props): JSX.Element {
  const lang = useI18n();
  const t = lang.beambox.photo_edit_panel;

  return (
    <div className={styles.wrapper}>
      <div className={styles['hint-text']}>
        <QuestionCircleOutlined className={styles.icon} />
        <span>
          Click on an area and press the “Delete Selection” button or press the ‘delete’ key on your
          computer.
        </span>
      </div>
      <Form layout="vertical">
        <Form.Item label="Tolerance:">
          <Row>
            <Col flex="auto">
              <Slider
                min={0}
                max={100}
                step={1}
                value={tolerance}
                onChange={(v: number) => setTolerance(v)}
              />
            </Col>
            <Col flex="100px">
              <InputNumber
                min={0}
                max={255}
                step={1}
                value={tolerance}
                onChange={(v) => setTolerance(v)}
              />
            </Col>
          </Row>
        </Form.Item>
      </Form>
    </div>
  );
}
