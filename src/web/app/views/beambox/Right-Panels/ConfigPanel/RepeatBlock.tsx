import classNames from 'classnames';
import React, { useContext, useMemo } from 'react';

import eventEmitterFactory from 'helpers/eventEmitterFactory';
import UnitInput from 'app/widgets/Unit-Input-v2';
import useI18n from 'helpers/useI18n';
import { CUSTOM_PRESET_CONSTANT, DataType, writeData } from 'helpers/layer/layer-config-helper';

import ConfigPanelContext from './ConfigPanelContext';
import styles from './Block.module.scss';

const RepeatBlock = (): JSX.Element => {
  const lang = useI18n();
  const t = lang.beambox.right_panel.laser_panel;

  const { selectedLayers, state, dispatch } = useContext(ConfigPanelContext);
  const { repeat } = state;
  const timeEstimationButtonEventEmitter = useMemo(
    () => eventEmitterFactory.createEventEmitter('time-estimation-button'), []
  );

  const handleChange = (value: number) => {
    dispatch({
      type: 'change',
      payload: { repeat: value, configName: CUSTOM_PRESET_CONSTANT },
    });
    timeEstimationButtonEventEmitter.emit('SET_ESTIMATED_TIME', null);
    selectedLayers.forEach((layerName) => {
      writeData(layerName, DataType.repeat, value);
      writeData(layerName, DataType.configName, CUSTOM_PRESET_CONSTANT);
    });
  };

  return (
    <div className={classNames(styles.panel, styles['without-drag'])}>
      <span className={styles.title}>{t.repeat}</span>
      <UnitInput
        id="repeat"
        className={{ [styles.input]: true }}
        min={0}
        max={100}
        unit={t.times}
        defaultValue={repeat.value}
        getValue={handleChange}
        decimal={0}
        displayMultiValue={repeat.hasMultiValue}
      />
    </div>
  );
};

export default RepeatBlock;
