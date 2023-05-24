import classNames from 'classnames';
import React, { useContext } from 'react';

import useI18n from 'helpers/useI18n';
import { DataType, writeData } from 'helpers/layer/layer-config-helper';

import ConfigPanelContext from './ConfigPanelContext';
import styles from './Block.module.scss';

// TODO: Current use a checkbox for demo, need to change to dropdown in the future
const LayerType = (): JSX.Element => {
  const lang = useI18n();
  const t = lang.beambox.right_panel.laser_panel;
  const { selectedLayers, state, dispatch } = useContext(ConfigPanelContext);
  const { type } = state;
  const { value } = type;

  const handleChange = (val: number) => {
    dispatch({ type: 'change', payload: { type: val } });
    selectedLayers.forEach((layerName) => writeData(layerName, DataType.type, val));
  };

  const handleClick = () => handleChange(value === 1 ? 2 : 1);

  return (
    <div className={classNames(styles.panel, styles.checkbox)} onClick={handleClick}>
      <span className={styles.title}>Printing</span>
      <input type="checkbox" checked={value === 2} readOnly />
    </div>
  );
};

export default LayerType;
