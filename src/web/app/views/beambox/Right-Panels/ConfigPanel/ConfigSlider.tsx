import classNames from 'classnames';
import React, { memo, useEffect, useState } from 'react';
import { Slider } from 'antd';

import styles from './ConfigSlider.module.scss';

interface Props {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  speedLimit?: boolean;
}

const ConfigSlider = ({ id, value, onChange, min, max, step = 1, speedLimit = false }: Props) => {
  const [displayValue, setDisplayValue] = useState(value);
  useEffect(() => setDisplayValue(value), [value]);

  return (
    <div className={classNames(styles.container, { [styles.limit]: speedLimit })}>
      <Slider
        id={id}
        min={min}
        max={max}
        step={step}
        value={displayValue}
        onAfterChange={onChange}
        onChange={(val: number) => setDisplayValue(val)}
      />
    </div>
  );
};

export default memo(ConfigSlider);
