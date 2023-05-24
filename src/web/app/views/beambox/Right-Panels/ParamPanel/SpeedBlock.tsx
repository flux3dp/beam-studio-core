import classNames from 'classnames';
import React, { useMemo } from 'react';

import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import constant from 'app/actions/beambox/constant';
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
  const model = BeamboxPreference.read('workarea');
  const enableLowSpeed = BeamboxPreference.read('enable-low-speed');
  const maxValue = constant.dimension.getMaxSpeed(model);
  const minValue = enableLowSpeed ? 1 : 3;
  const hasVector = doLayersContainsVector(layerNames);
  let warningText = '';
  if (hasVector && value > 20 && BeamboxPreference.read('vector_speed_contraint') !== false) {
    warningText = t.speed_contrain_warning;
  } else if (value < 3 && enableLowSpeed) {
    warningText = t.low_speed_warning;
  }

  return (
    <div className={styles.panel}>
      <span className={styles.title}>{t.speed}</span>
      <UnitInput
        id="speed"
        className={{ [styles.input]: true }}
        min={minValue}
        max={maxValue}
        unit={displayUnit}
        defaultValue={value}
        getValue={onChange}
        decimal={decimal}
        displayMultiValue={hasMultiValue}
        step={10 ** -decimal}
      />
      <input
        id="speed_value"
        className={classNames({ [styles['speed-for-vector']]: hasVector })}
        type="range"
        min={minValue}
        max={maxValue}
        step={0.1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {warningText ? (
        <div className={styles.warning}>
          <div className={styles['warning-icon']}>!</div>
          <div className={styles['warning-text']}>{warningText}</div>
        </div>
      ) : null}
    </div>
  );
};

export default SpeedBlock;
