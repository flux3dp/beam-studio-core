import React, { memo } from 'react';
import { Button, Col, Row, Space } from 'antd';
import { DeleteFilled } from '@ant-design/icons';

import useI18n from 'helpers/useI18n';

interface Props {
  onClose: () => void;
  onDelete: () => void;
  onReset: () => void;
  onSave: () => void;
}

const Footer = ({ onClose, onDelete, onReset, onSave }: Props) => {
  const lang = useI18n();
  const t = lang.beambox.right_panel.laser_panel;

  return (
    <Row justify="space-between">
      <Col span={12}>
        <Space align="start" style={{ width: '100%' }}>
          <Button key="laser_delete" type="primary" danger onClick={onDelete}>
            <DeleteFilled />
            {t.delete}
          </Button>
          <Button key="laser_reset" type="dashed" danger onClick={onReset}>
            {t.reset}
          </Button>
        </Space>
      </Col>
      <Col span={12}>
        <Space>
          <Button key="laser_save_and_exit" type="primary" onClick={onSave}>
            {t.save_and_exit}
          </Button>
          <Button key="laser_cancel" onClick={onClose}>
            {t.cancel}
          </Button>
        </Space>
      </Col>
    </Row>
  );
};

export default memo(Footer);
