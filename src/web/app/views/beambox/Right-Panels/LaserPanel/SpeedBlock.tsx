import classNames from 'classnames';
import React, { useMemo } from 'react';

import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import doLayersContainsVector from 'helpers/layer/check-vector';
import UnitInput from 'app/widgets/Unit-Input-v2';
import useI18n from 'helpers/useI18n';
import storage from 'implementations/storage';
import { IConfig } from 'interfaces/ILayerConfig';

import styles from './Block.module.scss';

interface Props {
  layerNames: string[];
  speed: IConfig<number>;
  onChange: (val: number) => void;
}

const MIN_VALUE = 1;

const SpeedBlock = ({ layerNames, speed, onChange }: Props): JSX.Element => {
  const lang = useI18n();
  const t = lang.beambox.right_panel.laser_panel;
  const { value, hasMultiValue } = speed;

  const { display: displayUnit, decimal } = useMemo(() => {
    const unit: 'mm' | 'inches' = storage.get('default-units') || 'mm';
    const display = { mm: 'mm/s', inches: 'in/s' }[unit];
    const d = { mm: 1, inches: 2 }[unit];
    return { display, decimal: d };
  }, []);
  const maxValue = BeamboxPreference.read('workarea') === 'fhexa1' ? 900 : 300;

  const hasVector = doLayersContainsVector(layerNames);

  return (
    <div className={styles.panel}>
      <span className={styles.title}>{t.speed}</span>
      <UnitInput
        id="speed"
        className={{ [styles.input]: true }}
        min={MIN_VALUE}
        max={maxValue}
        unit={displayUnit}
        defaultValue={value}
        getValue={onChange}
        decimal={decimal}
        displayMultiValue={hasMultiValue}
      />
      <input
        id="speed_value"
        className={classNames({ [styles['speed-for-vector']]: hasVector })}
        type="range"
        min={MIN_VALUE}
        max={maxValue}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {hasVector && value > 20 && BeamboxPreference.read('vector_speed_contraint') !== false ? (
        <div className={styles.warning}>
          <div className={styles['warning-icon']}>!</div>
          <div className={styles['warning-text']}>{t.speed_contrain_warning}</div>
        </div>
      ) : null}
    </div>
  );
};

export default SpeedBlock;
