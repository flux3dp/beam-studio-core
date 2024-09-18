import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import history from 'app/svgedit/history/history';
import LayerModule, { modelsWithModules } from 'app/constants/layer-module/layer-modules';
import layerModuleHelper from 'helpers/layer-module/layer-module-helper';
import presetHelper from 'helpers/presets/preset-helper';
import toggleFullColorLayer from 'helpers/layer/full-color/toggleFullColorLayer';
import updateLayerColorFilter from 'helpers/color/updateLayerColorFilter';
import { getAllLayerNames, getLayerByName } from 'helpers/layer/layer-helper';
import { getWorkarea, WorkAreaModel } from 'app/constants/workarea-constants';
import { IBatchCommand } from 'interfaces/IHistory';
import { ConfigKey, ConfigKeyTypeMap, ILayerConfig, Preset } from 'interfaces/ILayerConfig';

const getLayerElementByName = (layerName: string) => {
  const allLayers = Array.from(document.querySelectorAll('g.layer'));
  const layer = allLayers.find((l) => {
    const title = l.querySelector('title');
    if (title) {
      return title.textContent === layerName;
    }
    return false;
  });
  return layer;
};

const attributeMap: { [key in ConfigKey]: string } = {
  speed: 'data-speed',
  printingSpeed: 'data-printingSpeed',
  power: 'data-strength',
  minPower: 'data-minPower',
  ink: 'data-ink',
  repeat: 'data-repeat',
  height: 'data-height',
  zStep: 'data-zstep',
  diode: 'data-diode',
  configName: 'data-configName',
  module: 'data-module',
  backlash: 'data-backlash',
  multipass: 'data-multipass',
  uv: 'data-uv',
  halftone: 'data-halftone',
  wInk: 'data-wInk',
  wSpeed: 'data-wSpeed',
  wMultipass: 'data-wMultipass',
  wRepeat: 'data-wRepeat',
  color: 'data-color',
  fullcolor: 'data-fullcolor',
  split: 'data-split',
  cRatio: 'data-cRatio',
  mRatio: 'data-mRatio',
  yRatio: 'data-yRatio',
  kRatio: 'data-kRatio',
  printingStrength: 'data-printingStrength',
  clipRect: 'data-clipRect',
  ref: 'data-ref',
  focus: 'data-focus',
  focusStep: 'data-focusStep',
};

export const CUSTOM_PRESET_CONSTANT = ' ';

export const defaultConfig: { [key in ConfigKey]?: ConfigKeyTypeMap[key] } = {
  speed: 20,
  printingSpeed: 60,
  power: 15,
  minPower: 0,
  ink: BeamboxPreference.read('multipass-compensation') !== false ? 3 : 1,
  repeat: 1,
  height: -3,
  zStep: 0,
  diode: 0,
  configName: '',
  module: LayerModule.LASER_UNIVERSAL,
  backlash: 0,
  multipass: 3,
  uv: 0,
  // 1 for fm, 2 for am
  halftone: 1,
  // parameters for white ink
  wSpeed: 100,
  wInk: BeamboxPreference.read('multipass-compensation') !== false ? -12 : -4,
  wMultipass: 3,
  wRepeat: 1,
  // parameters for split color
  cRatio: 100,
  mRatio: 100,
  yRatio: 100,
  kRatio: 100,
  // parameters single color printing image processing
  printingStrength: 100,
  // lower focus parameters
  focus: -2,
  focusStep: -2,
};

/**
 * getData from layer element
 * @param layer layer Element
 * @param key data key
 * @param applyPrinting if true, return printingSpeed if module is printer and type is speed
 * @returns data value in type T
 */
export const getData = <T extends ConfigKey>(
  layer: Element,
  key: T,
  applyPrinting = false
): ConfigKeyTypeMap[T] => {
  let attr = attributeMap[key];
  if (!attr || !layer) return undefined;
  if (
    key === 'speed' &&
    applyPrinting &&
    layer.getAttribute(attributeMap.module) === String(LayerModule.PRINTER)
  ) {
    // eslint-disable-next-line no-param-reassign
    key = 'printingSpeed' as T;
    attr = attributeMap.printingSpeed;
  }
  if (['configName', 'color', 'clipRect'].includes(key)) {
    return (layer.getAttribute(attr) || defaultConfig[key]) as ConfigKeyTypeMap[T];
  }
  if (key === 'fullcolor' || key === 'ref' || key === 'split')
    return (layer.getAttribute(attr) === '1') as ConfigKeyTypeMap[T];
  if (key === 'module')
    return Number(layer.getAttribute(attr) || LayerModule.LASER_UNIVERSAL) as ConfigKeyTypeMap[T];
  return Number(layer.getAttribute(attr) || defaultConfig[key]) as ConfigKeyTypeMap[T];
};

export const writeDataLayer = <T extends ConfigKey>(
  layer: Element,
  key: T,
  value: ConfigKeyTypeMap[T] | undefined,
  opts?: { applyPrinting?: boolean; batchCmd?: IBatchCommand }
): void => {
  if (!layer) return;
  let attr = attributeMap[key];
  if (!attr) return;
  if (
    key === 'speed' &&
    opts?.applyPrinting &&
    layer.getAttribute(attributeMap.module) === String(LayerModule.PRINTER)
  )
    attr = attributeMap.printingSpeed;
  const originalValue = layer.getAttribute(attr);
  if (key === 'fullcolor' || key === 'ref' || key === 'split')
    // eslint-disable-next-line no-param-reassign
    value = (value ? '1' : undefined) as ConfigKeyTypeMap[T];
  if (value === undefined) layer.removeAttribute(attr);
  else layer.setAttribute(attr, String(value));
  if (opts?.batchCmd) {
    const cmd = new history.ChangeElementCommand(layer, { [attr]: originalValue });
    opts.batchCmd.addSubCommand(cmd);
  }
};

export const writeData = <T extends ConfigKey>(
  layerName: string,
  key: ConfigKey,
  value: ConfigKeyTypeMap[T] | undefined,
  opts?: { applyPrinting?: boolean; batchCmd?: IBatchCommand }
): void => {
  const layer = getLayerElementByName(layerName);
  if (!layer) return;
  writeDataLayer(layer, key, value, opts);
};

export const getMultiSelectData = <T extends ConfigKey>(
  layers: Element[],
  currentLayerIdx: number,
  key: T
): { value: ConfigKeyTypeMap[T]; hasMultiValue: boolean } => {
  const mainIndex = currentLayerIdx > -1 ? currentLayerIdx : 0;
  const mainLayer = layers[mainIndex] || layers.find((l) => !!l);
  if (!mainLayer) return { value: undefined, hasMultiValue: false };
  let value = getData(mainLayer, key, true);
  let hasMultiValue = false;
  for (let i = 0; i < layers.length; i += 1) {
    // eslint-disable-next-line no-continue
    if (i === currentLayerIdx) continue;
    const layer = layers[i];
    if (layer) {
      const layerValue = getData(layer, key, true);
      if (value !== layerValue) {
        hasMultiValue = true;
        if (key === 'height') {
          // Always use the max value
          value = Math.max(value as number, layerValue as number) as ConfigKeyTypeMap[T];
          if ((value as number) > 0) break;
        } else if (key === 'diode') {
          // Always use on if there is any on
          value = 1 as ConfigKeyTypeMap[T];
          break;
        } else if (key === 'fullcolor' || key === 'ref' || key === 'split') {
          // Always use true if there is any true
          value = true as ConfigKeyTypeMap[T];
          break;
        } else break;
      }
    }
  }
  return { value, hasMultiValue };
};

export const initLayerConfig = (layerName: string): void => {
  const workarea = BeamboxPreference.read('workarea');
  const keys = Object.keys(defaultConfig) as ConfigKey[];
  const layer = getLayerElementByName(layerName);
  const defaultLaserModule = layerModuleHelper.getDefaultLaserModule();
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    if (defaultConfig[key] !== undefined) {
      if (key === 'module' && modelsWithModules.has(workarea)) {
        writeDataLayer(layer, key, defaultLaserModule);
      } else writeDataLayer(layer, key, defaultConfig[keys[i]] as number | string);
    }
  }
};

export const cloneLayerConfig = (targetLayerName: string, baseLayerName: string): void => {
  const baseLayer = getLayerElementByName(baseLayerName);
  if (!baseLayer) {
    initLayerConfig(targetLayerName);
  } else {
    const keys = Object.keys(attributeMap) as ConfigKey[];
    const targetLayer = getLayerElementByName(targetLayerName);
    if (targetLayer) {
      for (let i = 0; i < keys.length; i += 1) {
        if (keys[i] === 'fullcolor' || keys[i] === 'ref') {
          if (getData(baseLayer, keys[i])) writeDataLayer(targetLayer, keys[i], true);
        } else {
          const value = getData(baseLayer, keys[i]);
          if (value)
            writeDataLayer(targetLayer, keys[i], getData(baseLayer, keys[i]) as number | string);
        }
      }
      updateLayerColorFilter(targetLayer as SVGGElement);
    }
  }
};

export const getLayerConfig = (layerName: string): ILayerConfig => {
  const layer = getLayerElementByName(layerName);
  if (!layer) {
    return null;
  }

  const data = {};
  const keys = Object.keys(attributeMap) as ConfigKey[];
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    data[key] = { value: getData(layer, key, true) };
  }

  return data as ILayerConfig;
};

export const getLayersConfig = (layerNames: string[], currentLayerName?: string): ILayerConfig => {
  const layers = layerNames.map((layerName) => getLayerElementByName(layerName));
  const currentLayerIdx = layerNames.indexOf(currentLayerName);
  const data = {};
  const keys = Object.keys(attributeMap) as ConfigKey[];
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    data[key] = getMultiSelectData(layers, currentLayerIdx, key);
  }

  return data as ILayerConfig;
};

export const toggleFullColorAfterWorkareaChange = (): void => {
  const workarea = BeamboxPreference.read('workarea') || BeamboxPreference.read('model');
  const layerNames = getAllLayerNames();
  const defaultLaserModule = layerModuleHelper.getDefaultLaserModule();
  for (let i = 0; i < layerNames.length; i += 1) {
    const layerName = layerNames[i];
    const layer = getLayerByName(layerName);
    // eslint-disable-next-line no-continue
    if (!layer) continue;
    if (!modelsWithModules.has(workarea)) {
      writeDataLayer(layer, 'module', LayerModule.LASER_UNIVERSAL);
      toggleFullColorLayer(layer, { val: false });
    } else {
      writeDataLayer(layer, 'module', defaultLaserModule);
    }
  }
};

export const applyDefaultLaserModule = (): void => {
  const workarea = BeamboxPreference.read('workarea');
  if (modelsWithModules.has(workarea)) {
    const layerNames = getAllLayerNames();
    const defaultLaserModule = layerModuleHelper.getDefaultLaserModule();
    for (let i = 0; i < layerNames.length; i += 1) {
      const layerName = layerNames[i];
      const layer = getLayerByName(layerName);
      // eslint-disable-next-line no-continue
      if (!layer) continue;
      if (getData(layer, 'module') === LayerModule.LASER_UNIVERSAL) {
        writeDataLayer(layer, 'module', defaultLaserModule);
      }
    }
  }
};

export const laserConfigKeys: ConfigKey[] = [
  'speed',
  'power',
  'minPower',
  'repeat',
  'height',
  'zStep',
  'focus',
  'focusStep',
];

export const printerConfigKeys: ConfigKey[] = [
  'speed',
  'printingSpeed',
  'ink',
  'multipass',
  'cRatio',
  'mRatio',
  'yRatio',
  'kRatio',
  'printingStrength',
  'halftone',
  'wInk',
  'wSpeed',
  'wMultipass',
  'wRepeat',
  'uv',
  'repeat',
];

// Forced Keys: If not set, use default value
export const forcedKeys = ['speed', 'power', 'ink', 'multipass', 'halftone', 'repeat'];

export const applyPreset = (
  layer: Element,
  preset: Preset,
  opts: { applyName?: boolean; batchCmd?: IBatchCommand } = {}
): void => {
  const workarea: WorkAreaModel = BeamboxPreference.read('workarea');
  const { maxSpeed, minSpeed } = getWorkarea(workarea);
  const { applyName = true, batchCmd } = opts;
  const { module } = preset;
  const keys = module === LayerModule.PRINTER ? printerConfigKeys : laserConfigKeys;
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    let value = preset[key];
    if (value === undefined) {
      if (forcedKeys.includes(key)) value = defaultConfig[key];
      // eslint-disable-next-line no-continue
      else continue;
    }
    if (key === 'speed' || key === 'printingSpeed')
      value = Math.max(minSpeed, Math.min(value as number, maxSpeed));
    writeDataLayer(layer, key, value, {
      applyPrinting: module === LayerModule.PRINTER,
      batchCmd,
    });
  }
  if (applyName)
    writeDataLayer(
      layer,
      'configName',
      (preset.isDefault ? preset.key : preset.name) || CUSTOM_PRESET_CONSTANT
    );
};

/**
 * Update all layer configs values due to preset and custom config value change
 */
export const postPresetChange = (): void => {
  // TODO: add test
  const workarea: WorkAreaModel = BeamboxPreference.read('workarea');
  const { maxSpeed, minSpeed } = getWorkarea(workarea);
  const layerNames = getAllLayerNames();
  const allPresets = presetHelper.getAllPresets();

  for (let i = 0; i < layerNames.length; i += 1) {
    const layerName = layerNames[i];
    const layer = getLayerByName(layerName);
    // eslint-disable-next-line no-continue
    if (!layer) continue;

    const configName = getData(layer, 'configName');
    const preset = allPresets.find(
      (c) => !c.hide && (configName === c.key || configName === c.name)
    );
    if (preset?.isDefault) {
      const layerModule = getData(layer, 'module') as LayerModule;
      const defaultPreset = presetHelper.getDefaultPreset(preset.key, workarea, layerModule);
      if (!defaultPreset) {
        // Config exists but preset not found: no preset for module
        writeDataLayer(layer, 'configName', undefined);
      } else {
        applyPreset(layer, defaultPreset, { applyName: false });
      }
    } else if (preset) {
      applyPreset(layer, preset, { applyName: false });
    } else {
      writeDataLayer(layer, 'configName', undefined);
    }
    const speed = getData(layer, 'speed');
    if (speed > maxSpeed) writeDataLayer(layer, 'speed', maxSpeed);
    if (speed < minSpeed) writeDataLayer(layer, 'speed', minSpeed);
    const printingSpeed = getData(layer, 'printingSpeed');
    if (printingSpeed > maxSpeed) writeDataLayer(layer, 'printingSpeed', maxSpeed);
    if (printingSpeed < minSpeed) writeDataLayer(layer, 'printingSpeed', minSpeed);
  }
};

export default {
  applyPreset,
  CUSTOM_PRESET_CONSTANT,
  initLayerConfig,
  cloneLayerConfig,
  getLayerConfig,
  getLayersConfig,
  writeData,
};
