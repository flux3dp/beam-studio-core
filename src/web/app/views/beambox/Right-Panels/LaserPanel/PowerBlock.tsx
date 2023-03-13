import React from 'react';

import UnitInput from 'app/widgets/Unit-Input-v2';
import useI18n from 'helpers/useI18n';
import { IConfig } from 'interfaces/ILayerConfig';

import styles from './Block.module.scss';

interface Props {
  power: IConfig<number>,
  onChange: (val: number) => void;
}

const MAX_VALUE = 100;
const MIN_VALUE = 1;

function PowerBlock({ power, onChange }: Props): JSX.Element {
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
        defaultValue={power.value}
        getValue={onChange}
        decimal={1}
        displayMultiValue={power.hasMultiValue}
      />
      <input
        id="power_value"
        type="range"
        min={MIN_VALUE}
        max={MAX_VALUE}
        step={1}
        value={power.value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
      />
      {power.value < 10 && (
        <div className={styles.warning}>
          <div className={styles['warning-icon']}>!</div>
          <div className={styles['warning-text']}>{t.low_power_warning}</div>
        </div>
      )}
    </div>
  );
}

export default PowerBlock;
