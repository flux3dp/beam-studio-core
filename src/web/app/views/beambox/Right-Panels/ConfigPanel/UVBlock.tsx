import classNames from 'classnames';
import React, { memo, useContext } from 'react';

import ObjectPanelItem from 'app/views/beambox/Right-Panels/ObjectPanelItem';
import useI18n from 'helpers/useI18n';
import { DataType, writeData } from 'helpers/layer/layer-config-helper';
import { useIsMobile } from 'helpers/system-helper';

import ConfigPanelContext from './ConfigPanelContext';
import styles from './Block.module.scss';

const UVBlock = (): JSX.Element => {
  const isMobile = useIsMobile();
  const lang = useI18n();
  const t = lang.beambox.right_panel.laser_panel.ink_type;
  const { selectedLayers, state, dispatch } = useContext(ConfigPanelContext);
  const { uv } = state;

  const handleToggle = () => {
    const newValue = uv.value === 1 ? 0 : 1;
    dispatch({ type: 'change', payload: { uv: newValue } });
    selectedLayers.forEach((layerName) => writeData(layerName, DataType.UV, newValue));
  };

  const options = [
    { value: 0, label: t.normal },
    { value: 1, label: t.UV },
  ];

  return isMobile ? (
    <ObjectPanelItem.Select
      id="ink-type"
      selected={uv.value === 1 ? options[1] : options[0]}
      onChange={handleToggle}
      options={options}
      label={t.text}
    />
  ) : (
    <div className={classNames(styles.panel, styles.checkbox)} onClick={handleToggle}>
      <span className={styles.title}>UV</span>
      <input type="checkbox" checked={uv.value === 1} readOnly />
    </div>
  );
};

export default memo(UVBlock);
