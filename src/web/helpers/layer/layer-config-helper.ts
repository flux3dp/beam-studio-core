import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import constant from 'app/actions/beambox/constant';
import storage from 'implementations/storage';
import { getAllLayerNames, getLayerByName } from 'helpers/layer/layer-helper';
import { getParametersSet } from 'app/constants/right-panel-constants';
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

export enum Module {
  LASER = 1,
  PRINTER = 2,
}

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
}

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
  [DataType.module]: Module.LASER,
  [DataType.backlash]: 0,
};

export const getData = (layer: Element, dataType: DataType) => {
  if (![DataType.configName].includes(dataType)) {
    return Number(layer.getAttribute(`data-${dataType}`) || defaultConfig[dataType]);
  }
  return layer.getAttribute(`data-${dataType}`) || defaultConfig[dataType];
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
  const speed = getData(layer, DataType.speed) as number;
  const power = getData(layer, DataType.strength) as number;
  const ink = getData(layer, DataType.ink) as number;
  const repeat = getData(layer, DataType.repeat) as number;
  const height = getData(layer, DataType.height) as number;
  const zStep = getData(layer, DataType.zstep) as number;
  const diode = getData(layer, DataType.diode) as number;
  const configName = getData(layer, DataType.configName) as string;
  const module = getData(layer, DataType.module) as number;
  const backlash = getData(layer, DataType.backlash) as number;

  return {
    speed: { value: speed },
    power: { value: power },
    ink: { value: ink },
    repeat: { value: repeat },
    height: { value: height },
    zStep: { value: zStep },
    diode: { value: diode },
    configName: { value: configName },
    module: { value: module },
    backlash: { value: backlash },
  };
};

export const getLayersConfig = (layerNames: string[]): ILayerConfig => {
  const layers = layerNames.map((layerName) => getLayerElementByName(layerName));
  const speedData = getMultiSelectData(layers, DataType.speed);
  const powerData = getMultiSelectData(layers, DataType.strength);
  const inkData = getMultiSelectData(layers, DataType.ink);
  const repeatData = getMultiSelectData(layers, DataType.repeat);
  const heightData = getMultiSelectData(layers, DataType.height);
  const zStepData = getMultiSelectData(layers, DataType.zstep);
  const diodeData = getMultiSelectData(layers, DataType.diode);
  const configNameData = getMultiSelectData<string>(layers, DataType.configName);
  const moduleData = getMultiSelectData(layers, DataType.module);
  const backlashData = getMultiSelectData(layers, DataType.backlash);

  return {
    speed: speedData,
    power: powerData,
    ink: inkData,
    repeat: repeatData,
    height: heightData,
    zStep: zStepData,
    diode: diodeData,
    configName: configNameData,
    module: moduleData,
    backlash: backlashData,
  };
};

/**
 * Update all layer configs values due to preset and custom config value change
 */
export const postPresetChange = (): void => {
  // TODO: add test
  const customizedLaserConfigs = storage.get('customizedLaserConfigs') as ILaserConfig[] || [];
  const workarea = BeamboxPreference.read('workarea') || BeamboxPreference.read('model');
  const parametersSet = getParametersSet(workarea);
  const layerNames = getAllLayerNames();

  for (let i = 0; i < layerNames.length; i += 1) {
    const layerName = layerNames[i];
    const layer = getLayerByName(layerName);
    // eslint-disable-next-line no-continue
    if (!layer) continue;

    const configName = layer.getAttribute('data-configName');
    const configIndex = customizedLaserConfigs.findIndex((config) => config.name === configName);
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
