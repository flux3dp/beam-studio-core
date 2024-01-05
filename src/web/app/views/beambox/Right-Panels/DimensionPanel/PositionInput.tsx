import React, { memo, useCallback, useMemo } from 'react';

import ObjectPanelItem from 'app/views/beambox/Right-Panels/ObjectPanelItem';
import UnitInput from 'app/widgets/Unit-Input-v2';
import storage from 'implementations/storage';
import { useIsMobile } from 'helpers/system-helper';

import styles from './DimensionPanel.module.scss';

interface Props {
  type: 'x' | 'y' | 'x1' | 'y1' | 'x2' | 'y2' | 'cx' | 'cy';
  value: number;
  onChange: (type: string, value: number) => void;
}

const PositionInput = ({ type, value, onChange }: Props): JSX.Element => {
  const isMobile = useIsMobile();
  const unit = useMemo(() => (storage.get('default-units') === 'inches' ? 'in' : 'mm'), []);
  const label = useMemo<string | JSX.Element>(() => {
    if (type === 'x') return 'X';
    if (type === 'y') return 'Y';
    if (type === 'x1')
      return (
        <>
          X<sub>1</sub>
        </>
      );
    if (type === 'y1')
      return (
        <>
          Y<sub>1</sub>
        </>
      );
    if (type === 'x2')
      return (
        <>
          X<sub>2</sub>
        </>
      );
    if (type === 'y2')
      return (
        <>
          Y<sub>2</sub>
        </>
      );
    if (type === 'cx')
      return (
        <>
          X<sub>C</sub>
        </>
      );
    if (type === 'cy')
      return (
        <>
          Y<sub>C</sub>
        </>
      );
    return null;
  }, [type]);
  const inputId = useMemo(() => `${type}_position`, [type]);
  const handleChange = useCallback((val: number) => onChange(type, val), [type, onChange]);
  if (isMobile)
    return (
      <ObjectPanelItem.Number id={inputId} value={value} updateValue={handleChange} label={label} />
    );
  return (
    <div className={styles.dimension}>
      <div className={styles.label}>{label}</div>
      <UnitInput id={inputId} unit={unit} defaultValue={value} getValue={handleChange} />
    </div>
  );
};

export default memo(PositionInput);
