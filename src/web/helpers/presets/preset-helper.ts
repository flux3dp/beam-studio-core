import alertCaller from 'app/actions/alert-caller';
import alertConstants from 'app/constants/alert-constants';
import dialog from 'implementations/dialog';
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
      presets = allKeysList.map((key) => ({ key, isDefault: true, hide: false }));
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
  }
};

const clearPresetsCache = () => {
  presetsCache = {};
};

const reloadPresets = (migrate = false): void => {
  allPresets = null;
  clearPresetsCache();
  initPresets(migrate);
};

const getDefaultPreset = (
  key: string,
  model: WorkAreaModel,
  layerModule: LayerModule = LayerModule.LASER_UNIVERSAL
): Preset | null =>
  defaultPresets[key]?.[model]?.[layerModule] ||
  defaultPresets[key]?.[model]?.[LayerModule.LASER_UNIVERSAL] ||
  null;

const modelHasPreset = (model: WorkAreaModel, key: string): boolean =>
  !!defaultPresets[key]?.[model];

const getPresetsList = (
  model: WorkAreaModel,
  layerModule: LayerModule = LayerModule.LASER_UNIVERSAL
): Preset[] => {
  if (presetsCache[model]?.[layerModule]) {
    return presetsCache[model][layerModule];
  }
  console.log(allPresets);
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
  console.log(res);
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
  const allKeys = getAllKeys();
  const allKeysList = Array.from(allKeys);
  const newPresets = [...allKeysList.map((key) => ({ key, isDefault: true, hide: false }))];
  storage.set('presets', newPresets);
  reloadPresets();
};

export const importPresets = async (file?: Blob): Promise<boolean> => {
  const fileBlob =
    file ??
    (await dialog.getFileFromDialog({
      filters: [{ name: 'JSON', extensions: ['json', 'JSON'] }],
    }));
  if (fileBlob) {
    const res = await new Promise<boolean>((resolve) => {
      alertCaller.popUp({
        buttonType: alertConstants.CONFIRM_CANCEL,
        message: i18n.lang.beambox.right_panel.laser_panel.preset_management.sure_to_import_presets,
        onConfirm: () => {
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
              let currentConfig = storage.get('customizedLaserConfigs') || [];
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
            reloadPresets(true);
            resolve(true);
          };
          reader.readAsText(fileBlob);
        },
      });
    });
    return res;
  }
  return false;
};

const exportPresets = async (presets?: Preset[]): Promise<void> => {
  const isLinux = window.os === 'Linux';
  const getContent = () => {
    const laserConfig = {
      presets: presets ?? (storage.get('presets') as Preset[]),
    };
    return JSON.stringify(laserConfig);
  };
  await dialog.writeFileDialog(
    getContent,
    i18n.lang.beambox.right_panel.laser_panel.preset_management.export_preset_title,
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

initPresets(true);

export default {
  exportPresets,
  getAllPresets,
  getDefaultPreset,
  getPresetsList,
  importPresets,
  modelHasPreset,
  reloadPresets,
  resetPresetList,
  savePreset,
  savePresetList,
};
