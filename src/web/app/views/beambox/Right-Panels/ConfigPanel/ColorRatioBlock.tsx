import classNames from 'classnames';
import React, { useEffect, useMemo, useState } from 'react';
import { ConfigProvider, InputNumber, Slider } from 'antd';

import styles from './ColorRatioModal.module.scss';

interface Props {
  value: number;
  setValue: (value: number) => void;
  color: 'c' | 'm' | 'y' | 'k';
}

const ColorRatioBlock = ({ value, setValue, color }: Props): JSX.Element => {
  const [displayValue, setDisplayValue] = useState(value);
  useEffect(() => setDisplayValue(value), [value]);
  const { title } = useMemo(() => {
    switch (color) {
      case 'c':
        return { title: 'Cyan' };
      case 'm':
        return { title: 'Magenta' };
      case 'y':
        return { title: 'Yellow' };
      case 'k':
        return { title: 'Black' };
      default:
        return { title: 'Cyan' };
    }
  }, [color]);

  return (
    <div className={classNames(styles.block, styles[color])}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        <span className={styles.input}>
          <ConfigProvider
            theme={{
              token: {
                lineWidth: 0,
              },
            }}
          >
            <InputNumber
              size="small"
              value={value}
              controls={false}
              min={0}
              max={100}
              onChange={setValue}
            />
          </ConfigProvider>
          <span className={styles.unit}>%</span>
        </span>
      </div>
      <Slider
        min={0}
        max={100}
        step={1}
        value={displayValue}
        onAfterChange={setValue}
        onChange={(v: number) => setDisplayValue(v)}
        tooltip={{
          formatter: (v: number) => `${v}%`,
        }}
      />
    </div>
  );
};

export default ColorRatioBlock;
