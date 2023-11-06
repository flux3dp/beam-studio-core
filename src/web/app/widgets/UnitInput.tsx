/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback } from 'react';
import { ConfigProvider, InputNumber, InputNumberProps } from 'antd';

import styles from './UnitInput.module.scss';

interface Props extends InputNumberProps<number> {
  unit: string;
  isInch?: boolean;
}

// TODO: add test
/**
 * Unit Input by Antd InputNumber
 * using formatter and parser to display unit
 * if isInch is true, the unit will be inch but the value will still be mm,
 * the transfer will be handled by formatter and parser
 */
const UnitInput = ({ unit, isInch, precision = 4, ...Props }: Props): JSX.Element => {
  const formatter = useCallback(
    (value: string | number) => {
      // eslint-disable-next-line no-param-reassign
      if (typeof value === 'string') value = parseFloat(value);
      if (isInch) return (value / 25.4).toFixed(precision);
      return value.toFixed(precision);
    },
    [isInch, precision]
  );

  const parser = useCallback(
    (value: string) => {
      const newVal = value.trim();
      if (isInch) return parseFloat(newVal) * 25.4;
      return parseFloat(newVal);
    },
    [isInch]
  );

  return (
    <div className={styles.input}>
      <ConfigProvider
        theme={{
          token: {
            lineWidth: 0,
            colorBgContainerDisabled: 'none',
            controlPaddingHorizontal: 6,
          },
          components: {
            InputNumber: {
              activeShadow: 'none',
              controlWidth: 70,
            },
          },
        }}
      >
        <InputNumber {...Props} formatter={formatter} parser={parser} />
        <span className={styles.unit}>{unit}</span>
      </ConfigProvider>
    </div>
  );
};

export default UnitInput;
