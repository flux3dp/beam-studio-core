import React, { memo, useCallback, useMemo } from 'react';

import ObjectPanelItem from 'app/views/beambox/Right-Panels/ObjectPanelItem';
import storage from 'implementations/storage';
import UnitInput from 'app/widgets/UnitInput';
import { useIsMobile } from 'helpers/system-helper';

import styles from './DimensionPanel.module.scss';

interface Props {
  type: 'w' | 'h' | 'rx' | 'ry';
  value: number;
  onChange: (type: string, value: number) => void;
  onBlur?: () => void;
}

const SizeInput = ({ type, value, onChange, onBlur }: Props): JSX.Element => {
  const isMobile = useIsMobile();
  const isInch = useMemo(() => storage.get('default-units') === 'inches', []);
  const unit = useMemo(() => (isInch ? 'in' : 'mm'), [isInch]);
  const label = useMemo<string | JSX.Element>(() => {
    if (type === 'w') return 'W';
    if (type === 'h') return 'H';
    if (type === 'rx') return 'W';
    if (type === 'ry') return 'H';
    return null;
  }, [type]);
  const handleChange = useCallback(
    (val: number) => {
      const changeKey = {
        w: 'width',
        h: 'height',
        rx: 'rx',
        ry: 'ry',
      }[type];
      const newVal = type === 'rx' || type === 'ry' ? val / 2 : val;
      onChange(changeKey, newVal);
    },
    [onChange, type]
  );

  if (isMobile) {
    return (
      <ObjectPanelItem.Number
        id={`${type}_size`}
        value={value}
        updateValue={handleChange}
        label={label}
      />
    );
  }
  return (
    <div className={styles.dimension}>
      <div className={styles.label}>{label}</div>
        <UnitInput
          id={`${type}_size`}
          className={styles.input}
          width={66}
          fontSize={12}
          unit={unit}
          isInch={isInch}
          precision={isInch ? 4 : 2}
          step={isInch ? 2.54 : 1}
          value={value}
          onBlur={onBlur}
          controls={false}
          onChange={handleChange}
          min={0}
        />
    </div>
  );
};

export default memo(SizeInput);
