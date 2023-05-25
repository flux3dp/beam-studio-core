import classNames from 'classnames';
import React, { useContext, useMemo } from 'react';

import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import constant from 'app/actions/beambox/constant';
import doLayersContainsVector from 'helpers/layer/check-vector';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import UnitInput from 'app/widgets/Unit-Input-v2';
import useI18n from 'helpers/useI18n';
import storage from 'implementations/storage';
import { CUSTOM_PRESET_CONSTANT, DataType, writeData } from 'helpers/layer/layer-config-helper';

import ConfigPanelContext from './ConfigPanelContext';
import styles from './Block.module.scss';

const SpeedBlock = (): JSX.Element => {
  const lang = useI18n();
  const t = lang.beambox.right_panel.laser_panel;
  const { selectedLayers, state, dispatch } = useContext(ConfigPanelContext);
  const timeEstimationButtonEventEmitter = useMemo(
    () => eventEmitterFactory.createEventEmitter('time-estimation-button'), []
  );

  const { value, hasMultiValue } = state.speed;

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
  const hasVector = doLayersContainsVector(selectedLayers);
  let warningText = '';
  if (hasVector && value > 20 && BeamboxPreference.read('vector_speed_contraint') !== false) {
    warningText = t.speed_contrain_warning;
  } else if (value < 3 && enableLowSpeed) {
    warningText = t.low_speed_warning;
  }

  const handleChange = (val: number) => {
    dispatch({
      type: 'change',
      payload: { speed: val, configName: CUSTOM_PRESET_CONSTANT },
    });
    timeEstimationButtonEventEmitter.emit('SET_ESTIMATED_TIME', null);
    selectedLayers.forEach((layerName) => {
      writeData(layerName, DataType.speed, val);
      writeData(layerName, DataType.configName, CUSTOM_PRESET_CONSTANT);
    });
  };

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
        getValue={handleChange}
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
        onChange={(e) => handleChange(Number(e.target.value))}
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
