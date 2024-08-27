import i18n from 'helpers/i18n';
import LayerModule from 'app/constants/layer-module/layer-modules';
import storage from 'implementations/storage';
import { getAllKeys, presets as defaultPresets } from 'app/constants/presets';
import { Preset } from 'interfaces/ILayerConfig';
import { WorkAreaModel } from 'app/constants/workarea-constants';

const migrateStorage = () => {
  const allKeys = getAllKeys();
  const allKeysList = Array.from(allKeys);
  let presets: Preset[] = storage.get('presets');
  if (presets) {
    const existingKeys = new Set<string>();
    presets = presets.filter((c) => {
      if (!c.isDefault) return true;
      existingKeys.add(c.key);
      return allKeys.has(c.key);
    });
    allKeysList.forEach((key, idx) => {
      if (!existingKeys.has(key)) {
        let inserIdx = -1;
        if (idx > 0) {
          const prevKey = allKeysList[idx - 1];
          inserIdx = presets.findIndex((p) => p.key === prevKey && p.isDefault);
        }
        const newPreset = { key, isDefault: true, hide: false };
        presets.splice(inserIdx + 1, 0, newPreset);
      }
    });
  } else {
    const customizedLaserConfigs = storage.get('customizedLaserConfigs');
    // For version <= 2.3.9, maybe we can remove this in the future
    if (customizedLaserConfigs) {
      presets = [...customizedLaserConfigs];
      const defaultLaserConfigsInUse = storage.get('defaultLaserConfigsInUse') || {};
      allKeysList.forEach((key, idx) => {
        if (!defaultLaserConfigsInUse[key]) {
          const hide = defaultLaserConfigsInUse[key] === false;
          let inserIdx = -1;
          if (idx > 0) {
            const prevKey = allKeysList[idx - 1];
            inserIdx = presets.findIndex((p) => p.key === prevKey && p.isDefault);
          }
          const newPreset = { key, isDefault: true, hide };
          presets.splice(inserIdx + 1, 0, newPreset);
        }
      });
      presets = presets.filter((c) => !(c.isDefault && !allKeys.has(c.key)));
      presets.forEach((p, idx) => {
        const { isDefault, key, hide } = p;
        if (isDefault) presets[idx] = { key, isDefault, hide: !!hide };
      });
    } else {
      presets = allKeysList.map((key) => ({ key, isDefault: true }));
    }
  }
  storage.set('presets', presets);
  return presets;
};

// default + customized
let allPresets: Preset[];
const getAllPresets = (): Preset[] => allPresets;

let presetsCache: {
  [model in WorkAreaModel]?: {
    [module in LayerModule]?: Preset[];
  };
} = {};
const initPresets = (migrate = false) => {
  if (!allPresets) {
    if (migrate) allPresets = migrateStorage();
    else allPresets = storage.get('presets') || migrateStorage();
    // translate name
    const unit = storage.get('default-units') || 'mm';
    const LANG = i18n.lang.beambox.right_panel.laser_panel;
    allPresets.forEach((preset) => {
      if (preset.isDefault && preset.key) {
        const { key } = preset;
        const translated = LANG.dropdown[unit][key];
        // eslint-disable-next-line no-param-reassign
        preset.name = translated || key;
      }
    });
    console.log('presets', allPresets);
  }
};

const clearPresetsCache = () => {
  presetsCache = {};
};

const reloadPresets = (): void => {
  allPresets = null;
  clearPresetsCache();
  initPresets();
};

const getDefaultPreset = (
  key: string,
  model: WorkAreaModel,
  layerModule: LayerModule = LayerModule.LASER_UNIVERSAL
): Preset | null =>
  defaultPresets[model]?.[key]?.[layerModule] ||
  defaultPresets[model]?.[key]?.[LayerModule.LASER_UNIVERSAL] ||
  null;

const modelHasPreset = (model: WorkAreaModel, key: string): boolean =>
  !!defaultPresets[model]?.[key];

const getPresetsList = (
  model: WorkAreaModel,
  layerModule: LayerModule = LayerModule.LASER_UNIVERSAL
): Preset[] => {
  if (presetsCache[model]?.[layerModule]) {
    return presetsCache[model][layerModule];
  }
  const res =
    allPresets
      ?.map((preset) => {
        const { key, isDefault, hide, module } = preset;
        if (hide) return null;
        if (isDefault) {
          const defaultPreset = getDefaultPreset(key, model, layerModule);
          if (defaultPreset) return { ...defaultPreset, ...preset };
          return null;
        }
        if ((module === LayerModule.PRINTER) !== (layerModule === LayerModule.PRINTER)) {
          return null;
        }
        return preset;
      })
      .filter((e) => e) || [];
  if (!presetsCache[model]) {
    presetsCache[model] = {};
  }
  presetsCache[model][layerModule] = res;
  return res;
};

const savePreset = (preset: Preset): void => {
  allPresets.push(preset);
  storage.set('presets', allPresets);
  clearPresetsCache();
};

const savePresetList = (presets: Preset[]): void => {
  allPresets = presets;
  storage.set('presets', allPresets);
  clearPresetsCache();
};

const resetPresetList = (): void => {
  const customPresets = allPresets.filter((p) => !p.isDefault);
  const allKeys = getAllKeys();
  const allKeysList = Array.from(allKeys);
  const newPresets = [
    ...customPresets,
    ...allKeysList.map((key) => ({ key, isDefault: true, hide: false })),
  ];
  storage.set('presets', newPresets);
  initPresets(false);
  clearPresetsCache();
};

initPresets();

export default {
  getAllPresets,
  getDefaultPreset,
  getPresetsList,
  modelHasPreset,
  reloadPresets,
  resetPresetList,
  savePreset,
  savePresetList,
};
