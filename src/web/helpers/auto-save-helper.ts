/* eslint-disable no-console */
import fs from 'implementations/fileSystem';
import storage from 'implementations/storage';
import { generateBeamBuffer } from 'helpers/file-export-helper';
import { IConfig } from 'interfaces/IAutosave';

let autoSaveInterval = null;

const AUTO_SAVE_CONFIG_STORAGE_KEY = 'auto-save-config';

const getConfig = (): IConfig => storage.get(AUTO_SAVE_CONFIG_STORAGE_KEY) as IConfig;

const setConfig = (config: IConfig): void => {
  storage.set(AUTO_SAVE_CONFIG_STORAGE_KEY, config);
};

const useDefaultConfig = async (): Promise<void> => {
  const getDefaultPath = () => {
    try {
      return fs.join(fs.getPath('documents'), 'Beam Studio', 'auto-save');
    } catch (err) {
      console.error('Unable to get documents path', err);
    }
    try {
      return fs.getPath('userData');
    } catch (err) {
      console.error('Unable to get userData path', err);
    }
    return null;
  };

  const directory = getDefaultPath();
  const defaultConfig = {
    enabled: true,
    directory,
    fileNumber: 5,
    timeInterval: 10,
  };
  try {
    await fs.mkdir(directory, true);
  } catch (e) {
    console.error('Failed to create auto save directory, disabled auto save');
    defaultConfig.enabled = false;
  }
  // Create a dumb file to prompt mac permission
  const tempFilePath = fs.join(directory, 'beam-studio auto-save-1.beam');
  fs.writeStream(tempFilePath, 'a');
  setConfig(defaultConfig);
};

const init = (): void => {
  if (!storage.isExisting(AUTO_SAVE_CONFIG_STORAGE_KEY)) {
    // Rename after fixing eslint of Setting-General.tsx
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useDefaultConfig();
  }
};

const startAutoSave = (): void => {
  const config = getConfig();
  if (config) {
    const { directory, fileNumber, timeInterval } = config;
    console.log('auto save service started');
    autoSaveInterval = setInterval(async () => {
      if (window.location.hash === '#/studio/beambox') {
        console.log('auto save triggered');
        const files = fs.readdirSync(directory).sort((a, b) => {
          const oldPrefix = 'beam-studio auto-save-';
          const aIsOld = a.startsWith(oldPrefix);
          const bIsOld = b.startsWith(oldPrefix);
          if (aIsOld && !bIsOld) return -1;
          if (!aIsOld && bIsOld) return 1;
          if (aIsOld && bIsOld) return -a.localeCompare(b);
          return a.localeCompare(b);
        });
        for (let i = 0; i <= files.length - fileNumber; i += 1) {
          fs.delete(fs.join(directory, files[i]));
        }
        const time = new Date().toISOString().split('.')[0].replace('T', ' ').replaceAll(':', '-');
        const target = fs.join(directory, `beam-studio ${time}.beam`);
        const buffer = await generateBeamBuffer();
        fs.writeStream(target, 'w', [buffer]);
      }
    }, timeInterval * 60 * 1000);
  }
};

const stopAutoSave = (): void => {
  console.log('auto save service stopped due to file saved');
  clearInterval(autoSaveInterval);
};

const toggleAutoSave = (start = false): void => {
  if (window.FLUX.version === 'web') return;
  if (start) {
    const config = getConfig();
    const { enabled } = config;
    if (enabled && !autoSaveInterval) {
      startAutoSave();
    }
  } else {
    stopAutoSave();
  }
};

export default {
  init,
  useDefaultConfig,
  getConfig,
  setConfig,
  toggleAutoSave,
};
