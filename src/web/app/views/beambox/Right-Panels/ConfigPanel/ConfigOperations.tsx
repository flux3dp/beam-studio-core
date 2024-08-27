import React, { memo } from 'react';

import alertCaller from 'app/actions/alert-caller';
import alertConstants from 'app/constants/alert-constants';
import dialog from 'implementations/dialog';
import i18n from 'helpers/i18n';
import LayerPanelController from 'app/views/beambox/Right-Panels/contexts/LayerPanelController';
import presetHelper from 'helpers/presets/preset-helper';
import storage from 'implementations/storage';
import useI18n from 'helpers/useI18n';
import { Preset } from 'interfaces/ILayerConfig';

import styles from './ConfigOperations.module.scss';


export const importPresets = async (file?: Blob): Promise<boolean> => {
  const fileBlob =
    file ??
    (await dialog.getFileFromDialog({
      filters: [{ name: 'JSON', extensions: ['json', 'JSON'] }],
    }));
  if (fileBlob) {
    alertCaller.popUp({
      buttonType: alertConstants.CONFIRM_CANCEL,
      message: i18n.lang.beambox.right_panel.laser_panel.sure_to_load_config,
      onConfirm: async () => {
        await new Promise<boolean>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = (evt) => {
            const configString = evt.target.result as string;
            const newConfigs = JSON.parse(configString);
            const { customizedLaserConfigs, defaultLaserConfigsInUse, presets } = newConfigs;
            if (presets) {
              storage.set('presets', presets);
            } else if (customizedLaserConfigs && defaultLaserConfigsInUse) {
              // For version <= 2.3.9
              const configNames = new Set(
                customizedLaserConfigs
                  .filter((config) => !config.isDefault)
                  .map((config) => config.name)
              );
              let currentConfig = storage.get('customizedLaserConfigs');
              if (typeof currentConfig === 'string') {
                currentConfig = JSON.parse(currentConfig);
              }
              for (let i = 0; i < currentConfig.length; i += 1) {
                const config = currentConfig[i];
                if (!config.isDefault && !configNames.has(config.name)) {
                  customizedLaserConfigs.push(config);
                }
              }
              storage.set('customizedLaserConfigs', customizedLaserConfigs);
              storage.set('defaultLaserConfigsInUse', defaultLaserConfigsInUse);
              storage.removeAt('presets');
            }
            presetHelper.reloadPresets();
            LayerPanelController.updateLayerPanel();
            resolve(true);
          };
          reader.readAsText(fileBlob);
        });
      },
    });
  }
  return false;
};

export const exportPresets = async (): Promise<void> => {
  const isLinux = window.os === 'Linux';
  const getContent = () => {
    const laserConfig = {
      presets: storage.get('presets') as Preset[],
    };
    return JSON.stringify(laserConfig);
  };
  await dialog.writeFileDialog(
    getContent,
    i18n.lang.beambox.right_panel.laser_panel.export_config,
    isLinux ? '.json' : '',
    [
      {
        name: window.os === 'MacOS' ? 'JSON (*.json)' : 'JSON',
        extensions: ['json'],
      },
      {
        name: i18n.lang.topmenu.file.all_files,
        extensions: ['*'],
      },
    ]
  );
};

interface Props {
  onMoreClick: () => void;
}

const ConfigOperations = ({ onMoreClick }: Props): JSX.Element => {
  const lang = useI18n();
  const t = lang.beambox.right_panel.laser_panel.dropdown;

  return (
    <div className={styles.container}>
      <div>
        <div className={styles.button} title={t.import} onClick={() => importPresets()}>
          <img src="img/right-panel/icon-import.svg" />
        </div>
        <div className={styles.button} title={t.export} onClick={exportPresets}>
          <img src="img/right-panel/icon-export.svg" />
        </div>
      </div>
      <div>
        <div className={styles.button} title={t.more} onClick={onMoreClick}>
          <img src="img/right-panel/icon-setting.svg" />
        </div>
      </div>
    </div>
  );
};

export default memo(ConfigOperations);
