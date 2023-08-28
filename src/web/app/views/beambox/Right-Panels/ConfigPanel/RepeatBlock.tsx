import classNames from 'classnames';
import React, { memo, useContext, useMemo } from 'react';

import eventEmitterFactory from 'helpers/eventEmitterFactory';
import ObjectPanelItem from 'app/views/beambox/Right-Panels/ObjectPanelItem';
import UnitInput from 'app/widgets/Unit-Input-v2';
import useI18n from 'helpers/useI18n';
import { CUSTOM_PRESET_CONSTANT, DataType, writeData } from 'helpers/layer/layer-config-helper';

import ConfigPanelContext from './ConfigPanelContext';
import styles from './Block.module.scss';

const RepeatBlock = ({
  type = 'default',
}: {
  type?: 'default' | 'panel-item' | 'modal';
}): JSX.Element => {
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
    if (type !== 'modal')
      selectedLayers.forEach((layerName) => {
        writeData(layerName, DataType.repeat, value);
        writeData(layerName, DataType.configName, CUSTOM_PRESET_CONSTANT);
      });
  };

  return type === 'panel-item' ? (
    <ObjectPanelItem.Number
      id="repeat"
      label={t.repeat}
      value={repeat.value}
      updateValue={handleChange}
      unit={t.times}
      decimal={0}
    />
  ) : (
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

export default memo(RepeatBlock);
