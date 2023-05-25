import React, { useContext } from 'react';

import UnitInput from 'app/widgets/Unit-Input-v2';
import useI18n from 'helpers/useI18n';
import { CUSTOM_PRESET_CONSTANT, DataType, writeData } from 'helpers/layer/layer-config-helper';

import ConfigPanelContext from './ConfigPanelContext';
import styles from './Block.module.scss';

const MAX_VALUE = 100;
const MIN_VALUE = 1;

function PowerBlock(): JSX.Element {
  const lang = useI18n();
  const t = lang.beambox.right_panel.laser_panel;

  const { selectedLayers, state, dispatch } = useContext(ConfigPanelContext);
  const { power } = state;
  const handleChange = (value: number) => {
    dispatch({
      type: 'change',
      payload: { power: value, configName: CUSTOM_PRESET_CONSTANT },
    });
    selectedLayers.forEach((layerName) => {
      writeData(layerName, DataType.strength, value);
      writeData(layerName, DataType.configName, CUSTOM_PRESET_CONSTANT);
    });
  };

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
        getValue={handleChange}
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
        onChange={(e) => handleChange(parseInt(e.target.value, 10))}
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
