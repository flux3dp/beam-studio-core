import classNames from 'classnames';
import React, { useContext } from 'react';

import alertCaller from 'app/actions/alert-caller';
import alertConstants from 'app/constants/alert-constants';
import dialogCaller from 'app/actions/dialog-caller';
import storage from 'implementations/storage';
import useI18n from 'helpers/useI18n';
import { DataType, writeData } from 'helpers/layer/layer-config-helper';
import { ILaserConfig } from 'interfaces/ILaserConfig';

import ConfigPanelContext from './ConfigPanelContext';
import styles from './SaveConfigButton.module.scss';

// TODO: add test
const SaveConfigButton = (): JSX.Element => {
  const lang = useI18n().beambox.right_panel.laser_panel;
  const { selectedLayers, state, dispatch } = useContext(ConfigPanelContext);
  const disabled = selectedLayers.length !== 1;

  const handleSaveConfig = (name: string) => {
    if (!name) return;
    const { speed, power, repeat, zStep } = state;
    const customizedConfigs = storage.get('customizedLaserConfigs') as ILaserConfig[];
    if (!customizedConfigs || customizedConfigs.length < 1) {
      storage.set('customizedLaserConfigs', [{
        name, speed: speed.value, power: power.value, repeat: repeat.value, zStep: zStep.value,
      }]);
      selectedLayers.forEach((layerName) => writeData(layerName, DataType.configName, name));
      dispatch({ type: 'rename', payload: name });
      return;
    }
    const index = customizedConfigs.findIndex((e) => e.name === name);
    if (index < 0) {
      storage.set('customizedLaserConfigs', customizedConfigs.concat([{
        name, speed: speed.value, power: power.value, repeat: repeat.value, zStep: zStep.value,
      }]));
      selectedLayers.forEach((layerName) => writeData(layerName, DataType.configName, name));
      dispatch({ type: 'rename', payload: name });
      return;
    }
    alertCaller.popUp({
      type: alertConstants.SHOW_POPUP_ERROR,
      message: lang.existing_name,
    });
  };

  return (
    <div
      className={classNames(styles.btn, { [styles.disabled]: disabled })}
      onClick={() => {
        if (disabled) return;
        dialogCaller.promptDialog({
          caption: lang.dropdown.save,
          onYes: (name) => handleSaveConfig(name.trim())
        });
      }}
    >
      <img src="img/icon-plus.svg" />
    </div>
  );
};

export default SaveConfigButton;
