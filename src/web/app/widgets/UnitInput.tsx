/* eslint-disable react/jsx-props-no-spreading */
import React, { forwardRef, useCallback, useRef, useImperativeHandle } from 'react';
import { ConfigProvider, InputNumber, InputNumberProps } from 'antd';

import styles from './UnitInput.module.scss';

interface Props extends InputNumberProps<number> {
  unit: string;
  isInch?: boolean;
  width?: number;
  fontSize?: number;
}

// TODO: add test
/**
 * Unit Input by Antd InputNumber
 * using formatter and parser to display unit
 * if isInch is true, the unit will be inch but the value will still be mm,
 * the transfer will be handled by formatter and parser
 */
const UnitInput = forwardRef<HTMLInputElement, Props>(({
  unit,
  isInch,
  onBlur,
  onChange,
  width = 70,
  fontSize = 14,
  precision = 4,
  ...props
}: Props, outerRef): JSX.Element => {
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(outerRef, () => inputRef.current, []);
  const formatter = useCallback(
    (value: string | number) => {
      let newVal = typeof value === 'string' ? parseFloat(value) : value;
      if (isInch) newVal /= 25.4;
      const res = String(Math.floor(newVal * 10 ** precision) / 10 ** precision);
      return res;
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

  const handlePressEnter = useCallback(() => {
    const value = parser(inputRef.current?.value);
    if (!Number.isNaN(value)) onChange?.(value);
  }, [parser, onChange]);

  const handleBlur = useCallback((e) => {
    const value = parser(inputRef.current?.value);
    if (!Number.isNaN(value)) onChange?.(value);
    onBlur?.(e);
  }, [parser, onBlur, onChange]);

  return (
    <div className={styles.input}>
      <ConfigProvider
        theme={{
          token: {
            lineWidth: 0,
            colorBgContainer: 'transparent',
            colorBgContainerDisabled: 'transparent',
            controlPaddingHorizontal: 6,
            fontSize,
          },
          components: {
            InputNumber: {
              activeShadow: 'none',
              controlWidth: width,
            },
          },
        }}
      >
        <InputNumber
          ref={inputRef}
          onPressEnter={handlePressEnter}
          {...props}
          onBlur={handleBlur}
          onChange={onChange}
          formatter={formatter}
          parser={parser}
        />
        <span className={styles.unit}>{unit}</span>
      </ConfigProvider>
    </div>
  );
});

export default UnitInput;
