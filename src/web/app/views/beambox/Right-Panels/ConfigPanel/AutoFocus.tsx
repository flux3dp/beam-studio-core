import classNames from 'classnames';
import React, { memo, useContext } from 'react';

import UnitInput from 'app/widgets/Unit-Input-v2';
import useI18n from 'helpers/useI18n';
import { CUSTOM_PRESET_CONSTANT, DataType, writeData } from 'helpers/layer/layer-config-helper';

import ConfigPanelContext from './ConfigPanelContext';
import styles from './Block.module.scss';

const AutoFocus = (): JSX.Element => {
  const lang = useI18n();
  const t = lang.beambox.right_panel.laser_panel;
  const { selectedLayers, state, dispatch } = useContext(ConfigPanelContext);
  const { height, repeat, zStep } = state;

  const handleToggle = () => {
    const value = -height.value;
    dispatch({ type: 'change', payload: { height: value } });
    selectedLayers.forEach((layerName) => writeData(layerName, DataType.height, value));
  };

  const handleHeightChange = (value: number) => {
    dispatch({ type: 'change', payload: { height: value } });
    selectedLayers.forEach((layerName) => writeData(layerName, DataType.height, value));
  };

  const handleZStepChange = (value: number) => {
    dispatch({ type: 'change', payload: { zStep: value, configName: CUSTOM_PRESET_CONSTANT } });
    selectedLayers.forEach((layerName) => {
      writeData(layerName, DataType.zstep, value);
      writeData(layerName, DataType.configName, CUSTOM_PRESET_CONSTANT);
    });
  };

  return (
    <>
      <div className={classNames(styles.panel, styles.checkbox)} onClick={handleToggle}>
        <span className={styles.title}>{t.focus_adjustment}</span>
        <input type="checkbox" checked={height.value > 0} readOnly />
      </div>
      {height.value > 0 ? (
        <div className={classNames(styles.panel, styles['without-drag'])}>
          <span className={styles.title}>{t.height}</span>
          <UnitInput
            id="height"
            className={{ [styles.input]: true }}
            min={0.01}
            max={20}
            unit="mm"
            defaultValue={height.value}
            getValue={handleHeightChange}
            displayMultiValue={height.hasMultiValue}
          />
        </div>
      ) : null}
      {repeat.value > 1 && height.value > 0 ? (
        <div className={classNames(styles.panel, styles['without-drag'])}>
          <span className={styles.title}>{t.z_step}</span>
          <UnitInput
            id="z_step"
            className={{ [styles.input]: true }}
            min={0}
            max={20}
            unit="mm"
            defaultValue={zStep.value}
            getValue={handleZStepChange}
            displayMultiValue={zStep.hasMultiValue}
          />
        </div>
      ) : null}
    </>
  );
};

export default memo(AutoFocus);
