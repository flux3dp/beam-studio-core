import classNames from 'classnames';
import React, { useContext } from 'react';
import { Select } from 'antd';

import useI18n from 'helpers/useI18n';
import { DataType, Module, writeData } from 'helpers/layer/layer-config-helper';

import ConfigPanelContext from './ConfigPanelContext';
import styles from './ModuleBlock.module.scss';

// TODO: Current use a checkbox for demo, need to change to dropdown in the future
const ModuleBlock = (): JSX.Element => {
  const lang = useI18n();
  const t = lang.beambox.right_panel.laser_panel;
  const { selectedLayers, state, dispatch } = useContext(ConfigPanelContext);
  const { module } = state;
  const { value } = module;

  const handleChange = (val: number) => {
    dispatch({ type: 'change', payload: { module: val } });
    selectedLayers.forEach((layerName) => writeData(layerName, DataType.module, val));
  };

  const options = [
    { label: 'Laser', value: Module.LASER },
    { label: 'Printing', value: Module.PRINTER },
  ];

  return (
    <div className={styles.panel}>
      <div className={styles.title}>{t.module}</div>
      <Select className={styles.select} onChange={handleChange} value={value as Module}>
        {options.map((option) => (
          <Select.Option key={option.value} value={option.value}>
            {option.label}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};

export default ModuleBlock;
