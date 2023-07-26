import React, { memo, useContext } from 'react';

import UnitInput from 'app/widgets/Unit-Input-v2';
import useI18n from 'helpers/useI18n';
import { CUSTOM_PRESET_CONSTANT, DataType, writeData } from 'helpers/layer/layer-config-helper';

import ConfigPanelContext from './ConfigPanelContext';
import styles from './Block.module.scss';

const MAX_VALUE = 9;
const MIN_VALUE = 1;

// TODO: add unit test after UI confirmed
function InkBlock(): JSX.Element {
  const lang = useI18n();
  // TODO: add ink translation to i18n
  const t = lang.beambox.right_panel.laser_panel;

  const { selectedLayers, state, dispatch } = useContext(ConfigPanelContext);
  const { ink } = state;
  const handleChange = (value: number) => {
    dispatch({
      type: 'change',
      payload: { ink: value, configName: CUSTOM_PRESET_CONSTANT },
    });
    selectedLayers.forEach((layerName) => {
      writeData(layerName, DataType.ink, value);
    });
  };

  return (
    <div className={styles.panel}>
      <span className={styles.title}>tInk</span>
      <UnitInput
        id="power"
        className={{ [styles.input]: true }}
        min={MIN_VALUE}
        max={MAX_VALUE}
        defaultValue={ink.value}
        getValue={handleChange}
        decimal={0}
        displayMultiValue={ink.hasMultiValue}
      />
      <input
        id="power_value"
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
