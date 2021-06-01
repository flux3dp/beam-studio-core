/* eslint-disable no-console */
import beamFileHelper from 'helpers/beam-file-helper';
import fs from 'implementations/fileSystem';
import storage from 'implementations/storage';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { IConfig } from 'interfaces/IAutosave';

let svgCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

let autoSaveInterval = null;

const useDefaultConfig = async (): Promise<void> => {
  const getDefaultPath = () => {
    const electron = requireNode('electron');
    try {
      return fs.join(electron.remote.app.getPath('documents'), 'Beam Studio', 'auto-save');
    } catch (err) {
      console.error('Unable to get documents path', err);
    }
    try {
      return electron.remote.app.getPath('userData');
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
  await fs.mkdir(directory, true);
  // Create a dumb file to prompt mac permission
  const tempFilePath = fs.join(directory, 'beam-studio auto-save-1.beam');
  fs.writeStream(tempFilePath, 'a');
  storage.set('auto-save-config', defaultConfig);
};

const init = (): void => {
  if (!storage.isExisting('auto-save-config')) {
    // Rename after fixing eslint of Setting-General.tsx
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useDefaultConfig();
  }
};

const getConfig = (): IConfig => storage.get('auto-save-config') as IConfig;

const setConfig = (config: IConfig): void => {
  storage.set('auto-save-config', config);
};

const startAutoSave = (): void => {
  const config = storage.get('auto-save-config');
  if (config) {
    const { directory, fileNumber, timeInterval } = config;
    console.log('auto save service started');
    autoSaveInterval = setInterval(async () => {
      if (window.location.hash === '#studio/beambox') {
        console.log('auto save triggered');
        const svgString = svgCanvas.getSvgString();
        const imageSource = await svgCanvas.getImageSource();
        for (let i = fileNumber - 1; i >= 1; i -= 1) {
          const from = fs.join(directory, `beam-studio auto-save-${i}.beam`);
          if (fs.exists(from)) {
            const to = fs.join(directory, `beam-studio auto-save-${i + 1}.beam`);
            // eslint-disable-next-line no-await-in-loop
            await fs.rename(from, to);
          }
        }
        const target = fs.join(directory, 'beam-studio auto-save-1.beam');
        beamFileHelper.saveBeam(target, svgString, imageSource);
      }
    }, timeInterval * 60 * 1000);
  }
};

const stopAutoSave = (): void => {
  console.log('auto save service stopped due to file saved');
  clearInterval(autoSaveInterval);
};

const toggleAutoSave = (start = false): void => {
  if (start) {
    const config = storage.get('auto-save-config');
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
  startAutoSave,
  stopAutoSave,
};
