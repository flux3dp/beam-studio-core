import React, { useCallback } from 'react';
import { InputNumber, InputNumberProps } from 'antd';

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
      if (isInch) return `${(value / 25.4).toFixed(precision)} ${unit}`;
      return `${value.toFixed(precision)} ${unit}`;
    },
    [isInch, unit, precision]
  );

  const parser = useCallback(
    (value: string) => {
      const newVal = value.replace(unit, '').trim();
      if (isInch) return parseFloat(newVal) * 25.4;
      return parseFloat(newVal);
    },
    [isInch, unit]
  );

  // eslint-disable-next-line react/jsx-props-no-spreading
  return <InputNumber {...Props} formatter={formatter} parser={parser} />;
};

export default UnitInput;
