import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import i18n from 'helpers/i18n';
import LayerModule from 'app/constants/layer-module/layer-modules';
import storage from 'implementations/storage';
import { getAllKeys, getAllPresets } from 'app/constants/right-panel-constants';
import { ILaserConfig } from 'interfaces/ILaserConfig';

export const getDefaultPresetData = (
  presetKey: string
): {
  speed: number;
  power?: number;
  ink?: number;
  multipass?: number;
  repeat: number;
  module?: LayerModule;
  name?: string;
} => {
  const presets = getAllPresets(BeamboxPreference.read('workarea') || BeamboxPreference.read('model'));
  if (!presets[presetKey]) {
    // eslint-disable-next-line no-console
    console.error(`Unable to get default preset key: ${presetKey}`);
    return { speed: 20, power: 15, repeat: 1 };
  }
  const { speed, power, name, module, ink, multipass } = presets[presetKey];
  const repeat = presets[presetKey].repeat || 1;
  const presetModule = module || LayerModule.LASER_10W_DIODE;
  if (presetModule === LayerModule.PRINTER) {
    return {
      speed,
      ink: ink || 3,
      multipass: multipass || 3,
      repeat: 1,
      module: presetModule,
      name: name || presetKey,
    };
  }
  return {
    speed,
    power,
    repeat,
    module: presetModule,
    name: name || presetKey,
  };
};

const initStorage = (defaultPresetKeys: string[], unit: string) => {
  const LANG = i18n.lang.beambox.right_panel.laser_panel;
  const defaultPresets = defaultPresetKeys.map((key) => {
    const { speed, power, repeat, name, module, ink, multipass } = getDefaultPresetData(key);
    return {
      name: LANG.dropdown[unit][name],
      speed,
      power,
      repeat,
      module,
      isDefault: true,
      key,
      ink,
      multipass,
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
        const { speed, power, repeat, name, module, ink, multipass } = getDefaultPresetData(
          customized[i].key
        );
        customized[i].name = LANG.dropdown[unit][name];
        customized[i].speed = speed;
        customized[i].power = power;
        customized[i].repeat = repeat || 1;
        customized[i].module = module || LayerModule.LASER_10W_DIODE;
        customized[i].ink = ink;
        customized[i].multipass = multipass;
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
  newPreset.forEach((presetKey) => {
    if (defaultPresetKeys.includes(presetKey)) {
      const { speed, power, repeat, name, module, ink, multipass } =
        getDefaultPresetData(presetKey);
      customized.push({
        name: LANG.dropdown[unit][name],
        speed,
        power,
        repeat,
        module: module || LayerModule.LASER_10W_DIODE,
        isDefault: true,
        key: presetKey,
        ink,
        multipass,
      });
      defaultLaserConfigsInUse[presetKey] = true;
    } else {
      delete defaultLaserConfigsInUse[presetKey];
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
  const parametersSet = getAllPresets(BeamboxPreference.read('workarea') || BeamboxPreference.read('model'));
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
