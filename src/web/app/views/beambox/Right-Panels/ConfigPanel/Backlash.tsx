import React, { useContext } from 'react';

import UnitInput from 'app/widgets/Unit-Input-v2';
import useI18n from 'helpers/useI18n';
import { DataType, writeData } from 'helpers/layer/layer-config-helper';

import ConfigPanelContext from './ConfigPanelContext';
import styles from './Block.module.scss';

const Backlash = (): JSX.Element => {
  const lang = useI18n();
  const t = lang.beambox.right_panel.laser_panel;

  const { selectedLayers, state, dispatch } = useContext(ConfigPanelContext);
  const { backlash } = state;
  const handleChange = (value: number) => {
    dispatch({
      type: 'change',
      payload: { backlash: value },
    });
    selectedLayers.forEach((layerName) => {
      writeData(layerName, DataType.backlash, value);
    });
  };

  return (
    <div className={styles.panel}>
      <span className={styles.title}>{t.backlash}</span>
      <UnitInput
        id="backlash"
        className={{ [styles.input]: true }}
        min={0}
        max={10}
        unit="mm"
        defaultValue={backlash.value}
        getValue={handleChange}
        decimal={2}
        displayMultiValue={backlash.hasMultiValue}
      />
      <input
        type="range"
        min={0}
        max={10}
        step={0.1}
        value={backlash.value}
        onChange={(e) => handleChange(Number(e.target.value))}
      />
    </div>
  );
};

export default Backlash;