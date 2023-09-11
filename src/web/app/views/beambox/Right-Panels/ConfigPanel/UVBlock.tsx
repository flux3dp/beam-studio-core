import classNames from 'classnames';
import React, { memo, useContext } from 'react';

import { DataType, writeData } from 'helpers/layer/layer-config-helper';
// import useI18n from 'helpers/useI18n';

import ConfigPanelContext from './ConfigPanelContext';
import styles from './Block.module.scss';

const UVBlock = (): JSX.Element => {
  // const lang = useI18n();
  // const t = lang.beambox.right_panel.laser_panel;
  const { selectedLayers, state, dispatch } = useContext(ConfigPanelContext);
  const { uv } = state;

  const handleToggle = () => {
    const newValue = uv.value === 1 ? 0 : 1;
    dispatch({ type: 'change', payload: { uv: newValue } });
    selectedLayers.forEach((layerName) => writeData(layerName, DataType.UV, newValue));
  };

  return (
    <div className={classNames(styles.panel, styles.checkbox)} onClick={handleToggle}>
      <span className={styles.title}>UV</span>
      <input type="checkbox" checked={uv.value === 1} readOnly />
    </div>
  );
};

export default memo(UVBlock);
