import classNames from 'classnames';
import React, { useEffect, useMemo, useState } from 'react';
import { ConfigProvider, InputNumber, Slider } from 'antd';

import useI18n from 'helpers/useI18n';
import styles from './ColorRatioModal.module.scss';

interface Props {
  ratio: number;
  setRatio: (value: number) => void;
  smooth: number;
  setSmooth: (value: number) => void;
  color?: 'c' | 'm' | 'y' | 'k';
}

// TODO: fix test
const ColorRatioBlock = ({ ratio, setRatio, smooth, setSmooth, color }: Props): JSX.Element => {
  const lang = useI18n().beambox.right_panel.laser_panel;
  const [displayRatio, setDisplayRatio] = useState(ratio);
  const [displaySmooth, setDisplaySmooth] = useState(smooth);
  useEffect(() => setDisplayRatio(ratio), [ratio]);
  useEffect(() => setDisplaySmooth(smooth), [smooth]);

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
        return { title: '' };
    }
  }, [color]);

  return (
    <div className={classNames(styles.block, styles[color])}>
      <div>{title}</div>
      <div className={styles.header}>
        <span className={styles.title}>{lang.color_strength}</span>
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
              value={ratio}
              controls={false}
              min={0}
              max={200}
              onChange={setRatio}
            />
          </ConfigProvider>
          <span className={styles.unit}>%</span>
        </span>
      </div>
      <Slider
        min={0}
        max={200}
        step={1}
        value={displayRatio}
        onAfterChange={setRatio}
        onChange={(v: number) => setDisplayRatio(v)}
        tooltip={{
          formatter: (v: number) => `${v}%`,
        }}
      />
      <div className={styles.header}>
        <span className={styles.title}>{lang.color_smooth}</span>
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
              value={smooth}
              controls={false}
              min={0}
              max={2}
              step={0.1}
              precision={1}
              onChange={setSmooth}
            />
          </ConfigProvider>
        </span>
      </div>
      <Slider
        min={0}
        max={2}
        step={0.1}
        value={displaySmooth}
        onAfterChange={setSmooth}
        onChange={(v: number) => setDisplaySmooth(v)}
      />
    </div>
  );
};

export default ColorRatioBlock;
