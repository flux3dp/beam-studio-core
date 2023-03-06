import React from 'react';

import UnitInput from 'app/widgets/Unit-Input-v2';
import useI18n from 'helpers/useI18n';

import styles from './Block.module.scss';

interface Props {
  power: number;
  hasMultipleValue: boolean;
  onChange: (val: number) => void;
}

const MAX_VALUE = 100;
const MIN_VALUE = 1;

function PowerBlock({ power, hasMultipleValue, onChange }: Props): JSX.Element {
  const lang = useI18n();
  const t = lang.beambox.right_panel.laser_panel;

  return (
    <div className={styles.panel}>
      <span className={styles.title}>{t.strength}</span>
      <UnitInput
        id="power"
        className={{ [styles.input]: true }}
        min={MIN_VALUE}
        max={MAX_VALUE}
        unit="%"
        defaultValue={power}
        getValue={onChange}
        decimal={1}
        displayMultiValue={hasMultipleValue}
      />
      <input
        id="power_value"
        type="range"
        min={MIN_VALUE}
        max={MAX_VALUE}
        step={1}
        value={power}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
      />
      {power < 10 && (
        <div className={styles.warning}>
          <div className={styles['warning-icon']}>!</div>
          <div className={styles['warning-text']}>{t.low_power_warning}</div>
        </div>
      )}
    </div>
  );
}

export default PowerBlock;
