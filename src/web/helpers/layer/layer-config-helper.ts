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

const getMultiSelectData = (
  layers: Element[],
  dataType: DataType,
): { data: string | number; hasMultiValue: boolean } => {
  let data;
  let hasMultiValue = false;
  for (let i = 0; i < layers.length; i += 1) {
    const layer = layers[i];
    if (layer) {
      if (data === undefined) {
        data = getData(layer, dataType);
      } else if (data !== getData(layer, dataType)) {
        hasMultiValue = true;
        if ([DataType.height].includes(dataType)) {
          data = Math.max(data, getData(layer, dataType) as number);
          if (data > 0) {
            break;
          }
        } else if ([DataType.diode].includes(dataType)) {
          data = 1;
          break;
        } else {
          break;
        }
      }
    }
  }
  return { data, hasMultiValue };
};

export const initLayerConfig = (layerName: string): void => {
  writeData(layerName, DataType.speed, defaultConfig.speed);
  writeData(layerName, DataType.strength, defaultConfig.strength);
  writeData(layerName, DataType.repeat, defaultConfig.repeat);
  writeData(layerName, DataType.height, defaultConfig.height);
  writeData(layerName, DataType.zstep, defaultConfig.zstep);
  writeData(layerName, DataType.diode, defaultConfig.diode);
  writeData(layerName, DataType.configName, defaultConfig.configName);
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
  }
};

export const getLayerConfig = (layerName: string) => {
  const layer = getLayerElementByName(layerName);
  if (!layer) {
    return null;
  }
  const speed = getData(layer, DataType.speed);
  const power = getData(layer, DataType.strength);
  const repeat = getData(layer, DataType.repeat);
  const height = getData(layer, DataType.height);
  const zStep = getData(layer, DataType.zstep);
  const diode = getData(layer, DataType.diode);
  const configName = getData(layer, DataType.configName);

  return {
    speed,
    power,
    repeat,
    height,
    zStep,
    diode,
    configName,
  };
};

export const getLayersConfig = (layerNames: string[]) => {
  const layers = layerNames.map((layerName) => getLayerElementByName(layerName));
  const { data: speed, hasMultiValue: hasMultiSpeed } = getMultiSelectData(layers, DataType.speed);
  const { data: power, hasMultiValue: hasMultiPower } = getMultiSelectData(
    layers,
    DataType.strength
  );
  const { data: repeat, hasMultiValue: hasMultiRepeat } = getMultiSelectData(
    layers,
    DataType.repeat
  );
  const { data: height, hasMultiValue: hasMultiHeight } = getMultiSelectData(
    layers,
    DataType.height
  );
  const { data: zStep, hasMultiValue: hasMultiZStep } = getMultiSelectData(layers, DataType.zstep);
  const { data: diode, hasMultiValue: hasMultiDiode } = getMultiSelectData(layers, DataType.diode);
  const { data: configName, hasMultiValue: hasMultiConfigName } = getMultiSelectData(
    layers,
    DataType.configName
  );

  return {
    speed,
    hasMultiSpeed,
    power,
    hasMultiPower,
    repeat,
    hasMultiRepeat,
    height,
    hasMultiHeight,
    zStep,
    hasMultiZStep,
    diode,
    hasMultiDiode,
    configName,
    hasMultiConfigName,
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
