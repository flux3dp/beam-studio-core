import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import constant from 'app/actions/beambox/constant';
import LayerModule from 'app/constants/layer-module/layer-modules';
import storage from 'implementations/storage';
import { getAllLayerNames, getLayerByName } from 'helpers/layer/layer-helper';
import { getAllPresets, modelsWithModules } from 'app/constants/right-panel-constants';
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
  strength = 'strength',
  ink = 'ink',
  repeat = 'repeat',
  height = 'height',
  zstep = 'zstep',
  diode = 'diode',
  configName = 'configName',
  module = 'module', // 1: laser, 2: printer
  backlash = 'backlash',
  multipass = 'multipass',
}

export const dataKey = {
  [DataType.speed]: 'speed',
  [DataType.strength]: 'power',
  [DataType.ink]: 'ink',
  [DataType.repeat]: 'repeat',
  [DataType.height]: 'height',
  [DataType.zstep]: 'zStep',
  [DataType.diode]: 'diode',
  [DataType.configName]: 'configName',
  [DataType.module]: 'module',
  [DataType.backlash]: 'backlash',
  [DataType.multipass]: 'multipass',
};

export const CUSTOM_PRESET_CONSTANT = ' ';

export const defaultConfig = {
  [DataType.speed]: 20,
  [DataType.strength]: 15,
  [DataType.ink]: 3,
  [DataType.repeat]: 1,
  [DataType.height]: -3,
  [DataType.zstep]: 0,
  [DataType.diode]: 0,
  [DataType.configName]: '',
  [DataType.module]: LayerModule.LASER,
  [DataType.backlash]: 0,
  [DataType.multipass]: 1,
};

export const getData = <T>(layer: Element, dataType: DataType): T => {
  if (![DataType.configName].includes(dataType)) {
    return Number(layer.getAttribute(`data-${dataType}`) || defaultConfig[dataType]) as T;
  }
  return layer.getAttribute(`data-${dataType}`) as T || defaultConfig[dataType] as T;
};

export const writeData = (layerName: string, dataType: DataType, value: number | string): void => {
  const layer = getLayerElementByName(layerName);
  if (!layer) {
    return;
  }
  layer.setAttribute(`data-${dataType}`, String(value));
};

const getMultiSelectData = <T = number>(
  layers: Element[],
  dataType: DataType,
): { value: T; hasMultiValue: boolean } => {
  let value;
  let hasMultiValue = false;
  for (let i = 0; i < layers.length; i += 1) {
    const layer = layers[i];
    if (layer) {
      if (value === undefined) {
        value = getData(layer, dataType);
      } else if (value !== getData(layer, dataType)) {
        hasMultiValue = true;
        if ([DataType.height].includes(dataType)) {
          value = Math.max(value, getData(layer, dataType) as number);
          if (value > 0) {
            break;
          }
        } else if ([DataType.diode].includes(dataType)) {
          value = 1;
          break;
        } else {
          break;
        }
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
    data[dataKey[type]] = { value: getData(layer, dataTypes[i]) };
  }

  return data;
};

export const getLayersConfig = (layerNames: string[]): ILayerConfig => {
  const layers = layerNames.map((layerName) => getLayerElementByName(layerName));
  const data = {} as ILayerConfig;
  const dataTypes = Object.values(DataType);
  for (let i = 0; i < dataTypes.length; i += 1) {
    const type = dataTypes[i];
    data[dataKey[type]] = getMultiSelectData(layers, dataTypes[i]);
  }

  return data;
};

/**
 * Update all layer configs values due to preset and custom config value change
 */
export const postPresetChange = (): void => {
  // TODO: add test
  const customizedLaserConfigs = storage.get('customizedLaserConfigs') as ILaserConfig[] || [];
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
    const configIndex = customizedLaserConfigs.findIndex((config) => (
      modelsWithModules.includes(workarea)
        ? config.name === configName && config.module === layerModule
        : config.name === configName
    ));
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
    if (!modelsWithModules.includes(workarea)) layer.setAttribute(`data-${DataType.module}`, String(LayerModule.LASER));
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
