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
  repeat = 'repeat',
  height = 'height',
  zstep = 'zstep',
  diode = 'diode',
  configName = 'configName',
  type = 'type', // 1: laser, 2: printer
}

export const CUSTOM_PRESET_CONSTANT = ' ';

const defaultConfig = {
  speed: 20,
  strength: 15,
  repeat: 1,
  height: -3,
  zstep: 0,
  diode: 0,
  configName: '',
  type: 1,
};

const getData = (layer: Element, dataType: DataType) => {
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
  writeData(layerName, DataType.speed, defaultConfig.speed);
  writeData(layerName, DataType.strength, defaultConfig.strength);
  writeData(layerName, DataType.repeat, defaultConfig.repeat);
  writeData(layerName, DataType.height, defaultConfig.height);
  writeData(layerName, DataType.zstep, defaultConfig.zstep);
  writeData(layerName, DataType.diode, defaultConfig.diode);
  writeData(layerName, DataType.configName, defaultConfig.configName);
  writeData(layerName, DataType.type, defaultConfig.type);
};

export const cloneLayerConfig = (targetLayerName: string, baseLayerName: string): void => {
  const baseLayer = getLayerElementByName(baseLayerName);
  if (!baseLayer) {
    initLayerConfig(targetLayerName);
  } else {
    writeData(targetLayerName, DataType.speed, getData(baseLayer, DataType.speed));
    writeData(targetLayerName, DataType.strength, getData(baseLayer, DataType.strength));
    writeData(targetLayerName, DataType.repeat, getData(baseLayer, DataType.repeat));
    writeData(targetLayerName, DataType.height, getData(baseLayer, DataType.height));
    writeData(targetLayerName, DataType.zstep, getData(baseLayer, DataType.zstep));
    writeData(targetLayerName, DataType.diode, getData(baseLayer, DataType.diode));
    writeData(targetLayerName, DataType.configName, getData(baseLayer, DataType.configName));
    writeData(targetLayerName, DataType.type, getData(baseLayer, DataType.type));
  }
};

export const getLayerConfig = (layerName: string): ILayerConfig => {
  const layer = getLayerElementByName(layerName);
  if (!layer) {
    return null;
  }
  const speed = getData(layer, DataType.speed) as number;
  const power = getData(layer, DataType.strength) as number;
  const repeat = getData(layer, DataType.repeat) as number;
  const height = getData(layer, DataType.height) as number;
  const zStep = getData(layer, DataType.zstep) as number;
  const diode = getData(layer, DataType.diode) as number;
  const configName = getData(layer, DataType.configName) as string;
  const type = getData(layer, DataType.type) as number;

  return {
    speed: { value: speed },
    power: { value: power },
    repeat: { value: repeat },
    height: { value: height },
    zStep: { value: zStep },
    diode: { value: diode },
    configName: { value: configName },
    type: { value: type },
  };
};

export const getLayersConfig = (layerNames: string[]): ILayerConfig => {
  const layers = layerNames.map((layerName) => getLayerElementByName(layerName));
  const speedData = getMultiSelectData(layers, DataType.speed);
  const powerData = getMultiSelectData(layers, DataType.strength);
  const repeatData = getMultiSelectData(layers, DataType.repeat);
  const heightData = getMultiSelectData(layers, DataType.height);
  const zStepData = getMultiSelectData(layers, DataType.zstep);
  const diodeData = getMultiSelectData(layers, DataType.diode);
  const configNameData = getMultiSelectData<string>(layers, DataType.configName);
  const typeData = getMultiSelectData(layers, DataType.type);

  return {
    speed: speedData,
    power: powerData,
    repeat: repeatData,
    height: heightData,
    zStep: zStepData,
    diode: diodeData,
    configName: configNameData,
    type: typeData,
  };
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
