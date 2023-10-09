import React, { memo, useContext } from 'react';

import useI18n from 'helpers/useI18n';
import { DataType, writeData } from 'helpers/layer/layer-config-helper';

import ConfigPanelContext from './ConfigPanelContext';
import ConfigSlider from './ConfigSlider';
import ConfigValueDisplay from './ConfigValueDisplay';
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
      <ConfigValueDisplay
        inputId='backlash-input'
        type='default'
        max={10}
        min={0}
        value={backlash.value}
        hasMultiValue={backlash.hasMultiValue}
        decimal={2}
        onChange={handleChange}
      />
      <ConfigSlider
        id="backlash"
        value={backlash.value}
        onChange={handleChange}
        min={0}
        max={10}
        step={0.1}
      />
    </div>
  );
};

export default memo(Backlash);
