import React, { memo, useCallback, useContext } from 'react';
import { Button, Col, Space } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

import Context from './Context';
import styles from './ArrowButtons.module.scss';

const ArrowButtons = () => {
  const { dispatch } = useContext(Context);
  const addPresetToUse = useCallback(() => dispatch({ type: 'add-preset' }), [dispatch]);
  const removePresetFromUse = useCallback(() => dispatch({ type: 'remove-preset' }), [dispatch]);

  return (
    <Col span={2}>
      <Space align="center" className={styles.space}>
        <div>
          <Button className={styles.btn} size="small" onClick={addPresetToUse}>
            <RightOutlined />
          </Button>
          <Button className={styles.btn} size="small" onClick={removePresetFromUse}>
            <LeftOutlined />
          </Button>
        </div>
      </Space>
    </Col>
  );
};

export default memo(ArrowButtons);
