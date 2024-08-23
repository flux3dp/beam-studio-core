import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import history from 'app/svgedit/history/history';
import LayerModule, { modelsWithModules } from 'app/constants/layer-module/layer-modules';
import layerModuleHelper from 'helpers/layer-module/layer-module-helper';
import storage from 'implementations/storage';
import toggleFullColorLayer from 'helpers/layer/full-color/toggleFullColorLayer';
import updateLayerColorFilter from 'helpers/color/updateLayerColorFilter';
import { getAllLayerNames, getLayerByName } from 'helpers/layer/layer-helper';
import { getAllPresets } from 'app/constants/right-panel-constants';
import { getWorkarea, WorkAreaModel } from 'app/constants/workarea-constants';
import { IBatchCommand } from 'interfaces/IHistory';
import { ConfigKey, ConfigKeyTypeMap, ILayerConfig } from 'interfaces/ILayerConfig';

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
  module: layerModuleHelper.getDefaultLaserModule(),
  backlash: 0,
  multipass: 3,
  uv: 0,
  // 1 for fm, 2 for am
  halftone: 1,
  // parameters for white ink
  wSpeed: 100,
  wInk: BeamboxPreference.read('multipass-compensation') !== false ? -9 : -3,
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
  if (
    key === 'speed' &&
    applyPrinting &&
    layer.getAttribute(attributeMap.module) === String(LayerModule.PRINTER)
  ) {
    attr = attributeMap.printingSpeed;
  }
  if (['configName', 'color', 'clipRect'].includes(key)) {
    return (layer.getAttribute(attr) || defaultConfig[key]) as ConfigKeyTypeMap[T];
  }
  if (key === 'fullcolor' || key === 'ref') return (layer.getAttribute(attr) === '1') as ConfigKeyTypeMap[T];
  if (key === 'module') return Number(layer.getAttribute(attr) || LayerModule.LASER_UNIVERSAL) as ConfigKeyTypeMap[T];
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
  if (
    key === 'speed' &&
    opts?.applyPrinting &&
    layer.getAttribute(attributeMap.module) === String(LayerModule.PRINTER)
  ) {
    attr = attributeMap.printingSpeed;
  }
  const originalValue = layer.getAttribute(attr);
  // eslint-disable-next-line no-param-reassign
  if (key === 'fullcolor' || key === 'ref') value = (value ? '1' : undefined) as ConfigKeyTypeMap[T];
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
        } else break;
      }
    }
  }
  return { value, hasMultiValue };
};

export const initLayerConfig = (layerName: string): void => {
  const keys = Object.keys(defaultConfig) as ConfigKey[];
  const layer = getLayerElementByName(layerName);
  for (let i = 0; i < keys.length; i += 1) {
    if (defaultConfig[keys[i]] !== undefined)
      writeDataLayer(layer, keys[i], defaultConfig[keys[i]] as number | string);
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
          if (value) writeDataLayer(targetLayer, keys[i], getData(baseLayer, keys[i]) as number | string);
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

/**
 * Update all layer configs values due to preset and custom config value change
 */
export const postPresetChange = (): void => {
  // TODO: add test
  const customizedLaserConfigs = (storage.get('customizedLaserConfigs') as ILaserConfig[]) || [];
  const workarea: WorkAreaModel =
    BeamboxPreference.read('workarea') || BeamboxPreference.read('model');
  const parametersSet = getAllPresets(workarea);
  const layerNames = getAllLayerNames();

  for (let i = 0; i < layerNames.length; i += 1) {
    const layerName = layerNames[i];
    const layer = getLayerByName(layerName);
    // eslint-disable-next-line no-continue
    if (!layer) continue;

    const configName = getData<string>(layer, DataType.configName);
    const layerModule = getData<LayerModule>(layer, DataType.module);
    const speedAttributeName =
      layerModule === LayerModule.PRINTER ? 'data-printingSpeed' : 'data-speed';
    // Looking for preset with same name and correct module
    const configIndex = customizedLaserConfigs.findIndex((config) =>
      modelsWithModules.has(workarea)
        ? config.name === configName && config.module === layerModule
        : config.name === configName
    );
    if (configIndex >= 0) {
      const config = customizedLaserConfigs[configIndex];
      if (config.isDefault) {
        if (parametersSet[config.key]) {
          const {
            speed,
            power = defaultConfig.strength,
            repeat = defaultConfig.repeat,
            ink = defaultConfig.ink,
            multipass = defaultConfig.multipass,
          } = parametersSet[config.key];
          layer.setAttribute(speedAttributeName, String(speed));
          layer.setAttribute('data-strength', String(power));
          layer.setAttribute('data-repeat', String(repeat));
          layer.setAttribute('data-ink', String(ink));
          layer.setAttribute('data-multipass', String(multipass));
        } else {
          layer.removeAttribute('data-configName');
        }
      } else {
        const {
          speed,
          power = defaultConfig.strength,
          repeat = defaultConfig.repeat,
          zStep,
          ink = defaultConfig.ink,
          multipass = defaultConfig.multipass,
        } = config;
        layer.setAttribute(speedAttributeName, String(speed));
        layer.setAttribute('data-strength', String(power));
        layer.setAttribute('data-repeat', String(repeat));
        layer.setAttribute('data-ink', String(ink));
        layer.setAttribute('data-multipass', String(multipass));
        if (zStep !== undefined) layer.setAttribute('data-zstep', String(zStep || 0));
      }
    }
    const { maxSpeed } = getWorkarea(workarea);
    if (Number(layer.getAttribute(speedAttributeName)) > maxSpeed) {
      layer.setAttribute(speedAttributeName, String(maxSpeed));
    }
  }
};

export default {
  CUSTOM_PRESET_CONSTANT,
  initLayerConfig,
  cloneLayerConfig,
  getLayerConfig,
  getLayersConfig,
  writeData,
};
