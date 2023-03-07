import React from 'react';

import dialog from 'implementations/dialog';
import i18n from 'helpers/i18n';
import storage from 'implementations/storage';
import useI18n from 'helpers/useI18n';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { ILaserConfig } from 'interfaces/ILaserConfig';

import styles from './ConfigOperations.module.scss';

let svgEditor;
getSVGAsync((globalSVG) => { svgEditor = globalSVG.Editor; });

interface Props {
  onMoreClick: () => void;
}

const importLaserConfig = async (): Promise<void> => {
  const dialogOptions = {
    filters: [{ name: 'JSON', extensions: ['json', 'JSON'] }],
  };
  const fileBlob = await dialog.getFileFromDialog(dialogOptions);
  if (fileBlob) svgEditor.importLaserConfig(fileBlob);
};

const exportLaserConfigs = async (): Promise<void> => {
  const isLinux = window.os === 'Linux';
  const getContent = () => {
    const laserConfig = {} as {
      customizedLaserConfigs?: ILaserConfig[];
      defaultLaserConfigsInUse?: { [name: string]: boolean };
    };

    laserConfig.customizedLaserConfigs = storage.get('customizedLaserConfigs');
    laserConfig.defaultLaserConfigsInUse = storage.get('defaultLaserConfigsInUse');
    return JSON.stringify(laserConfig);
  };
  await dialog.writeFileDialog(
    getContent,
    i18n.lang.beambox.right_panel.laser_panel.export_config,
    isLinux ? '.json' : '',
    [{
      name: window.os === 'MacOS' ? 'JSON (*.json)' : 'JSON',
      extensions: ['json'],
    }, {
      name: i18n.lang.topmenu.file.all_files,
      extensions: ['*'],
    }]
  );
};

// TODO: add unit test change class to module.scss
const ConfigOperations = ({ onMoreClick }: Props): JSX.Element => {
  const lang = useI18n();
  const t = lang.beambox.right_panel.laser_panel.dropdown;

  return (
    <div className={styles.container}>
      <div>
        <div className={styles.button} title={t.import} onClick={importLaserConfig}>
          <img src="img/right-panel/icon-import.svg" />
        </div>
        <div className={styles.button} title={t.export} onClick={exportLaserConfigs}>
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

export default ConfigOperations;
