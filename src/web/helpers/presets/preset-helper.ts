import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import i18n from 'helpers/i18n';
import storage from 'implementations/storage';
import { getAllKeys, getParametersSet } from 'app/constants/right-panel-constants';
import { ILaserConfig } from 'interfaces/ILaserConfig';

export const getDefaultPresetData = (paraName: string): { speed: number, power: number, repeat: number } => {
  const parametersSet = getParametersSet(BeamboxPreference.read('workarea') || BeamboxPreference.read('model'));
  if (!parametersSet[paraName]) {
    // eslint-disable-next-line no-console
    console.error(`Unable to get default preset key: ${paraName}`);
    return { speed: 20, power: 15, repeat: 1 };
  }
  const { speed, power } = parametersSet[paraName];
  const repeat = parametersSet[paraName].repeat || 1;
  return { speed, power, repeat };
};

const initStorage = (defaultPresetKeys: string[], unit: string) => {
  const LANG = i18n.lang.beambox.right_panel.laser_panel;
  const defaultPresets = defaultPresetKeys.map((key) => {
    const { speed, power, repeat } = getDefaultPresetData(key);
    return {
      name: LANG.dropdown[unit][key],
      speed,
      power,
      repeat,
      isDefault: true,
      key,
    };
  });
  let customizedLaserConfigs = storage.get('customizedLaserConfigs') || [];
  customizedLaserConfigs = customizedLaserConfigs.filter((config) => !config.isDefault);
  customizedLaserConfigs = defaultPresets.concat(customizedLaserConfigs);
  const defaultLaserConfigsInUse = {};
  defaultPresetKeys.forEach((e) => {
    defaultLaserConfigsInUse[e] = true;
  });
  storage.set('customizedLaserConfigs', customizedLaserConfigs);
  storage.set('defaultLaserConfigsInUse', defaultLaserConfigsInUse);
};

const updateStorageValue = (defaultPresetKeys: string[], unit: string) => {
  const LANG = i18n.lang.beambox.right_panel.laser_panel;
  const customized = storage.get('customizedLaserConfigs') as ILaserConfig[] || [];
  const defaultLaserConfigsInUse = storage.get('defaultLaserConfigsInUse') || {};
  // Containing keys for other models not in defaultPresetKeys
  const allKeys = getAllKeys();
  for (let i = 0; i < customized.length; i += 1) {
    if (customized[i].isDefault) {
      if (defaultPresetKeys.includes(customized[i].key)) {
        const { speed, power, repeat } = getDefaultPresetData(customized[i].key);
        customized[i].name = LANG.dropdown[unit][customized[i].key];
        customized[i].speed = speed;
        customized[i].power = power;
        customized[i].repeat = repeat || 1;
      } else if (!allKeys.has(customized[i].key)) {
        // deleting old presets remove due to software update
        delete defaultLaserConfigsInUse[customized[i].key];
        customized.splice(i, 1);
        i -= 1;
      }
    }
  }
  // migrating new added presets due to software update
  const newPreset = defaultPresetKeys.filter((option) => defaultLaserConfigsInUse[option] === undefined);
  newPreset.forEach((preset) => {
    if (defaultPresetKeys.includes(preset)) {
      const { speed, power, repeat } = getDefaultPresetData(preset);
      customized.push({
        name: LANG.dropdown[unit][preset],
        speed,
        power,
        repeat,
        isDefault: true,
        key: preset,
      });
      defaultLaserConfigsInUse[preset] = true;
    } else {
      delete defaultLaserConfigsInUse[preset];
    }
  });
  storage.set('customizedLaserConfigs', customized);
  storage.set('defaultLaserConfigsInUse', defaultLaserConfigsInUse);
};

/**
 * updateDefaultPresetData
 * update preset data in storage due to model change, preset change due to update, etc.
 */
export const updateDefaultPresetData = (): string[] => {
  const unit = storage.get('default-units') || 'mm';
  const parametersSet = getParametersSet(BeamboxPreference.read('workarea') || BeamboxPreference.read('model'));
  const defaultPresetKeys = Object.keys(parametersSet);

  if (!storage.get('defaultLaserConfigsInUse') || !storage.get('customizedLaserConfigs')) {
    initStorage(defaultPresetKeys, unit);
  } else {
    updateStorageValue(defaultPresetKeys, unit);
  }
  return defaultPresetKeys;
};

export default {
  getDefaultPresetData,
  updateDefaultPresetData,
};
