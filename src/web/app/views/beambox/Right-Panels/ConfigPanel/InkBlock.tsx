import React, { memo, useContext } from 'react';

import UnitInput from 'app/widgets/Unit-Input-v2';
import useI18n from 'helpers/useI18n';
import { DataType, writeData } from 'helpers/layer/layer-config-helper';

import ConfigPanelContext from './ConfigPanelContext';
import styles from './Block.module.scss';

const MAX_VALUE = 9;
const MIN_VALUE = 1;

function InkBlock(): JSX.Element {
  const lang = useI18n();
  const t = lang.beambox.right_panel.laser_panel;

  const { selectedLayers, state, dispatch } = useContext(ConfigPanelContext);
  const { ink } = state;
  const handleChange = (value: number) => {
    dispatch({
      type: 'change',
      payload: { ink: value },
    });
    selectedLayers.forEach((layerName) => {
      writeData(layerName, DataType.ink, value);
    });
  };

  return (
    <div className={styles.panel}>
      <span className={styles.title}>{t.ink_saturation}</span>
      <UnitInput
        id="satutation"
        className={{ [styles.input]: true }}
        min={MIN_VALUE}
        max={MAX_VALUE}
        defaultValue={ink.value}
        getValue={handleChange}
        decimal={0}
        displayMultiValue={ink.hasMultiValue}
      />
      <input
        id="satutation_value"
        type="range"
        min={MIN_VALUE}
        max={MAX_VALUE}
        step={1}
        value={ink.value}
        onChange={(e) => handleChange(parseInt(e.target.value, 10))}
      />
    </div>
  );
}

export default memo(InkBlock);
