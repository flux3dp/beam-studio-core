import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import constant from 'app/actions/beambox/constant';
import LayerModule, { modelsWithModules } from 'app/constants/layer-module/layer-modules';
import storage from 'implementations/storage';
import { getAllLayerNames, getLayerByName } from 'helpers/layer/layer-helper';
import { getAllPresets } from 'app/constants/right-panel-constants';
import { ILaserConfig } from 'interfaces/ILaserConfig';
import { ILayerConfig } from 'interfaces/ILayerConfig';

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

export enum DataType {
  speed = 'speed',
  printingSpeed = 'printingSpeed',
  strength = 'strength',
  ink = 'ink',
  repeat = 'repeat',
  height = 'height',
  zstep = 'zstep',
  diode = 'diode',
  configName = 'configName',
  module = 'module',
  backlash = 'backlash',
  multipass = 'multipass',
  UV = 'uv',
}

export const dataKey = {
  [DataType.module]: 'module',
  [DataType.speed]: 'speed',
  [DataType.printingSpeed]: 'printingSpeed',
  [DataType.strength]: 'power',
  [DataType.ink]: 'ink',
  [DataType.repeat]: 'repeat',
  [DataType.height]: 'height',
  [DataType.zstep]: 'zStep',
  [DataType.diode]: 'diode',
  [DataType.configName]: 'configName',
  [DataType.backlash]: 'backlash',
  [DataType.multipass]: 'multipass',
  [DataType.UV]: 'uv',
};

export const CUSTOM_PRESET_CONSTANT = ' ';

export const defaultConfig = {
  [DataType.speed]: 20,
  [DataType.printingSpeed]: 60,
  [DataType.strength]: 15,
  [DataType.ink]: 1,
  [DataType.repeat]: 1,
  [DataType.height]: -3,
  [DataType.zstep]: 0,
  [DataType.diode]: 0,
  [DataType.configName]: '',
  [DataType.module]: LayerModule.LASER_10W_DIODE,
  [DataType.backlash]: 0,
  [DataType.multipass]: 3,
  [DataType.UV]: 0,
};

/**
 * getData from layer element
 * @param layer layer Element
 * @param dataType DataType
 * @param applyPrinting if true, return printingSpeed if module is printer and type is speed
 * @returns data value in type T
 */
export const getData = <T>(layer: Element, dataType: DataType, applyPrinting = false): T => {
  let targetDataType = dataType;
  if (
    targetDataType === DataType.speed &&
    applyPrinting &&
    layer.getAttribute(`data-${DataType.module}`) === String(LayerModule.PRINTER)
  ) {
    targetDataType = DataType.printingSpeed;
  }
  if (![DataType.configName].includes(targetDataType)) {
    return Number(layer.getAttribute(`data-${targetDataType}`) || defaultConfig[targetDataType]) as T;
  }
  return (layer.getAttribute(`data-${targetDataType}`) as T) || (defaultConfig[targetDataType] as T);
};

export const writeData = (
  layerName: string,
  dataType: DataType,
  value: number | string,
  applyPrinting = false
): void => {
  const layer = getLayerElementByName(layerName);
  if (!layer) {
    return;
  }
  let targetDataType = dataType;
  if (
    targetDataType === DataType.speed &&
    applyPrinting &&
    layer.getAttribute(`data-${DataType.module}`) === String(LayerModule.PRINTER)
  ) {
    targetDataType = DataType.printingSpeed;
  }
  layer.setAttribute(`data-${targetDataType}`, String(value));
};

const getMultiSelectData = <T = number>(
  layers: Element[],
  currentLayerIdx: number,
  dataType: DataType
): { value: T; hasMultiValue: boolean } => {
  const mainIndex = currentLayerIdx > -1 ? currentLayerIdx : 0;
  const mainLayer = layers[mainIndex] || layers.find((l) => !!l);
  if (!mainLayer) return { value: undefined, hasMultiValue: false };
  let value = getData<T>(mainLayer, dataType, true);
  let hasMultiValue = false;
  for (let i = 0; i < layers.length; i += 1) {
    // eslint-disable-next-line no-continue
    if (i === currentLayerIdx) continue;
    const layer = layers[i];
    if (layer) {
      const layerValue = getData<T>(layer, dataType, true);
      if (value !== layerValue) {
        hasMultiValue = true;
        if ([DataType.height].includes(dataType)) {
          // Always use the max value
          value = Math.max(value as number, layerValue as number) as T;
          if ((value as number) > 0) break;
        } else if ([DataType.diode].includes(dataType)) {
          // Always use on if there is any on
          value = 1 as T;
          break;
        } else break;
      }
    }
  }
  return { value, hasMultiValue };
};

export const initLayerConfig = (layerName: string): void => {
  const dataTypes = Object.values(DataType);
  for (let i = 0; i < dataTypes.length; i += 1) {
    writeData(layerName, dataTypes[i], defaultConfig[dataTypes[i]]);
  }
};

export const cloneLayerConfig = (targetLayerName: string, baseLayerName: string): void => {
  const baseLayer = getLayerElementByName(baseLayerName);
  if (!baseLayer) {
    initLayerConfig(targetLayerName);
  } else {
    const dataTypes = Object.values(DataType);
    for (let i = 0; i < dataTypes.length; i += 1) {
      writeData(targetLayerName, dataTypes[i], getData(baseLayer, dataTypes[i]));
    }
  }
};

export const getLayerConfig = (layerName: string): ILayerConfig => {
  const layer = getLayerElementByName(layerName);
  if (!layer) {
    return null;
  }

  const data = {} as ILayerConfig;
  const dataTypes = Object.values(DataType);
  for (let i = 0; i < dataTypes.length; i += 1) {
    const type = dataTypes[i];
    data[dataKey[type]] = { value: getData(layer, dataTypes[i], true) };
  }

  return data;
};

export const getLayersConfig = (layerNames: string[], currentLayerName?: string): ILayerConfig => {
  const layers = layerNames.map((layerName) => getLayerElementByName(layerName));
  const currentLayerIdx = layerNames.indexOf(currentLayerName);
  const data = {} as ILayerConfig;
  const dataTypes = Object.values(DataType);
  for (let i = 0; i < dataTypes.length; i += 1) {
    const type = dataTypes[i];
    data[dataKey[type]] = getMultiSelectData(layers, currentLayerIdx, dataTypes[i]);
  }

  return data;
};

/**
 * Update all layer configs values due to preset and custom config value change
 */
export const postPresetChange = (): void => {
  // TODO: add test
  const customizedLaserConfigs = (storage.get('customizedLaserConfigs') as ILaserConfig[]) || [];
  const workarea = BeamboxPreference.read('workarea') || BeamboxPreference.read('model');
  const parametersSet = getAllPresets(workarea);
  const layerNames = getAllLayerNames();

  for (let i = 0; i < layerNames.length; i += 1) {
    const layerName = layerNames[i];
    const layer = getLayerByName(layerName);
    // eslint-disable-next-line no-continue
    if (!layer) continue;

    const configName = getData<string>(layer, DataType.configName);
    const layerModule = getData<LayerModule>(layer, DataType.module);
    // Looking for preset with same name and correct module
    const configIndex = customizedLaserConfigs.findIndex((config) =>
      modelsWithModules.includes(workarea)
        ? config.name === configName && config.module === layerModule
        : config.name === configName
    );
    if (configIndex >= 0) {
      const config = customizedLaserConfigs[configIndex];
      if (config.isDefault) {
        if (parametersSet[config.key]) {
          const { speed, power, repeat } = parametersSet[config.key];
          layer.setAttribute('data-speed', String(speed));
          layer.setAttribute('data-strength', String(power));
          layer.setAttribute('data-repeat', String(repeat || 1));
        } else {
          layer.removeAttribute('data-configName');
        }
      } else {
        const { speed, power, repeat, zStep } = config;
        layer.setAttribute('data-speed', String(speed));
        layer.setAttribute('data-strength', String(power));
        layer.setAttribute('data-repeat', String(repeat || 1));
        if (zStep !== undefined) layer.setAttribute('data-zstep', String(zStep || 0));
      }
    }
    const maxSpeed = constant.dimension.getMaxSpeed(workarea);
    if (Number(layer.getAttribute('data-speed')) > maxSpeed) {
      layer.setAttribute('data-speed', String(maxSpeed));
    }
    if (!modelsWithModules.includes(workarea))
      layer.setAttribute(`data-${DataType.module}`, String(LayerModule.LASER_10W_DIODE));
  }
};

export default {
  DataType,
  CUSTOM_PRESET_CONSTANT,
  initLayerConfig,
  cloneLayerConfig,
  getLayerConfig,
  getLayersConfig,
  writeData,
};
