import {
  cloneLayerConfig,
  DataType,
  getLayerConfig,
  getLayersConfig,
  initLayerConfig,
  writeData,
} from './layer-config-helper';

test('test laser-config-helper', () => {
  expect(getLayerConfig('layer 0')).toBeNull();

  document.body.innerHTML = `
    <g class="layer"></g>
    <g class="layer"><title>layer 1</title></g>
    <g class="layer"><title>layer 2</title></g>
    <g class="layer"><title>layer 3</title></g>
  `;
  initLayerConfig('layer 1');
  expect(getLayerConfig('layer 1')).toEqual({
    speed: 20,
    power: 15,
    repeat: 1,
    height: -3,
    zStep: 0,
    diode: 0,
    configName: '',
  });

  writeData('layer 1', DataType.zstep, 1);
  expect(getLayerConfig('layer 1')).toEqual({
    speed: 20,
    power: 15,
    repeat: 1,
    height: -3,
    zStep: 1,
    diode: 0,
    configName: '',
  });

  cloneLayerConfig('layer 2', 'layer 0');
  expect(getLayerConfig('layer 2')).toEqual({
    speed: 20,
    power: 15,
    repeat: 1,
    height: -3,
    zStep: 0,
    diode: 0,
    configName: '',
  });

  cloneLayerConfig('layer 3', 'layer 1');
  expect(getLayerConfig('layer 3')).toEqual({
    speed: 20,
    power: 15,
    repeat: 1,
    height: -3,
    zStep: 1,
    diode: 0,
    configName: '',
  });

  expect(getLayersConfig(['layer 0', 'layer 1', 'layer 2', 'layer 3'])).toEqual({
    speed: 20,
    hasMultiSpeed: false,
    power: 15,
    hasMultiPower: false,
    repeat: 1,
    hasMultiRepeat: false,
    height: -3,
    hasMultiHeight: false,
    zStep: 1,
    hasMultiZStep: true,
    diode: 0,
    hasMultiDiode: false,
    configName: '',
    hasMultiConfigName: false,
  });

  writeData('layer 1', DataType.diode, 2);
  writeData('layer 1', DataType.height, -1);
  expect(getLayersConfig(['layer 0', 'layer 1', 'layer 2', 'layer 3'])).toEqual({
    speed: 20,
    hasMultiSpeed: false,
    power: 15,
    hasMultiPower: false,
    repeat: 1,
    hasMultiRepeat: false,
    height: -1,
    hasMultiHeight: true,
    zStep: 1,
    hasMultiZStep: true,
    diode: 1,
    hasMultiDiode: true,
    configName: '',
    hasMultiConfigName: false,
  });

  writeData('layer 1', DataType.height, 1);
  expect(getLayersConfig(['layer 0', 'layer 1', 'layer 2', 'layer 3'])).toEqual({
    speed: 20,
    hasMultiSpeed: false,
    power: 15,
    hasMultiPower: false,
    repeat: 1,
    hasMultiRepeat: false,
    height: 1,
    hasMultiHeight: true,
    zStep: 1,
    hasMultiZStep: true,
    diode: 1,
    hasMultiDiode: true,
    configName: '',
    hasMultiConfigName: false,
  });
});
