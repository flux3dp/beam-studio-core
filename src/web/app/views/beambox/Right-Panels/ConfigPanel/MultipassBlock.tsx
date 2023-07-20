import classNames from 'classnames';
import React, { useContext, useMemo } from 'react';

import eventEmitterFactory from 'helpers/eventEmitterFactory';
import UnitInput from 'app/widgets/Unit-Input-v2';
import useI18n from 'helpers/useI18n';
import { DataType, writeData } from 'helpers/layer/layer-config-helper';

import ConfigPanelContext from './ConfigPanelContext';
import styles from './Block.module.scss';

// TODO: add unit test
const MultipassBlock = (): JSX.Element => {
  const lang = useI18n();
  const t = lang.beambox.right_panel.laser_panel;

  const { selectedLayers, state, dispatch } = useContext(ConfigPanelContext);
  const { multipass } = state;
  const timeEstimationButtonEventEmitter = useMemo(
    () => eventEmitterFactory.createEventEmitter('time-estimation-button'), []
  );

  const handleChange = (value: number) => {
    dispatch({
      type: 'change',
      payload: { multipass: value },
    });
    timeEstimationButtonEventEmitter.emit('SET_ESTIMATED_TIME', null);
    selectedLayers.forEach((layerName) => {
      writeData(layerName, DataType.multipass, value);
    });
  };

  return (
    <div className={classNames(styles.panel, styles['without-drag'])}>
      <span className={styles.title}>{t.print_multipass}</span>
      <UnitInput
        id="multipass"
        className={{ [styles.input]: true }}
        min={1}
        max={10}
        unit={t.times}
        defaultValue={multipass.value}
        getValue={handleChange}
        decimal={0}
        displayMultiValue={multipass.hasMultiValue}
      />
    </div>
  );
};

export default MultipassBlock;
