import React, { useCallback } from 'react';

import { Button, Flex } from 'antd';
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  MinusOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import classNames from 'classnames';

import { HistoryState } from '../../hooks/useHistory';

import styles from './index.module.scss';

interface Props {
  handleReset: () => void;
  handleZoomByScale: (scale: number) => void;
  zoomScale: number;
  history: HistoryState;
  handleHistoryChange: (type: 'undo' | 'redo') => () => void;
}

export default function TopBar({
  handleReset,
  handleZoomByScale,
  zoomScale,
  history: { index, items },
  handleHistoryChange,
}: Props): JSX.Element {
  // to realtime update zoom scale display
  const renderZoomButton = useCallback(
    () => (
      <div className={styles['dp-flex']}>
        <Button
          className={styles['mr-8px']}
          shape="round"
          icon={<MinusOutlined />}
          onClick={() => handleZoomByScale(0.8)}
        />
        <Button className={styles['mr-8px']} shape="round" onClick={handleReset}>
          {Math.round(zoomScale * 100)}%
        </Button>
        <Button shape="round" icon={<PlusOutlined />} onClick={() => handleZoomByScale(1.2)} />
      </div>
    ),
    [handleReset, handleZoomByScale, zoomScale]
  );

  return (
    <Flex
      justify="space-between"
      className={classNames(styles['w-100'], styles['top-bar'], styles.bdb)}
    >
      <div>
        <Button
          className={styles['mr-8px']}
          shape="round"
          icon={<ArrowLeftOutlined />}
          disabled={index === 0}
          onClick={handleHistoryChange('undo')}
        />
        <Button
          shape="round"
          icon={<ArrowRightOutlined />}
          disabled={index === items.length - 1}
          onClick={handleHistoryChange('redo')}
        />
      </div>
      {renderZoomButton()}
    </Flex>
  );
}
