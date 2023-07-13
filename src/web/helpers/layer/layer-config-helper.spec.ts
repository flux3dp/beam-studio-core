import {
  cloneLayerConfig,
  DataType,
  getLayerConfig,
  getLayersConfig,
  initLayerConfig,
  writeData,
} from './layer-config-helper';

const mockRead = jest.fn();
jest.mock('app/actions/beambox/beambox-preference', () => ({
  read: (key: string) => mockRead(key),
}));

const mockGet = jest.fn();
jest.mock('implementations/storage', () => ({
  get: (key) => mockGet(key),
}));

const mockGetAllLayerNames = jest.fn();
const mockGetLayerByName = jest.fn();
jest.mock('helpers/layer/layer-helper', () => ({
  getAllLayerNames: () => mockGetAllLayerNames(),
  getLayerByName: (name) => mockGetLayerByName(name),
}));

test('test layer-config-helper', () => {
  expect(getLayerConfig('layer 0')).toBeNull();

  document.body.innerHTML = `
    <g class="layer"></g>
    <g class="layer"><title>layer 1</title></g>
    <g class="layer"><title>layer 2</title></g>
    <g class="layer"><title>layer 3</title></g>
  `;
  initLayerConfig('layer 1');
  expect(getLayerConfig('layer 1')).toEqual({
    speed: { value: 20 },
    power: { value: 15 },
    ink: { value: 3 },
    repeat: { value: 1 },
    height: { value: -3 },
    zStep: { value: 0 },
    diode: { value: 0 },
    configName: { value: '' },
    module: { value: 1 },
    backlash: { value: 0 },
  });

  writeData('layer 1', DataType.zstep, 1);
  expect(getLayerConfig('layer 1')).toEqual({
    speed: { value: 20 },
    power: { value: 15 },
    ink: { value: 3 },
    repeat: { value: 1 },
    height: { value: -3 },
    zStep: { value: 1 },
    diode: { value: 0 },
    configName: { value: '' },
    module: { value: 1 },
    backlash: { value: 0 },
  });

  cloneLayerConfig('layer 2', 'layer 0');
  expect(getLayerConfig('layer 2')).toEqual({
    speed: { value: 20 },
    power: { value: 15 },
    ink: { value: 3 },
    repeat: { value: 1 },
    height: { value: -3 },
    zStep: { value: 0 },
    diode: { value: 0 },
    configName: { value: '' },
    module: { value: 1 },
    backlash: { value: 0 },
  });

  cloneLayerConfig('layer 3', 'layer 1');
  expect(getLayerConfig('layer 3')).toEqual({
    speed: { value: 20 },
    power: { value: 15 },
    ink: { value: 3 },
    repeat: { value: 1 },
    height: { value: -3 },
    zStep: { value: 1 },
    diode: { value: 0 },
    configName: { value: '' },
    module: { value: 1 },
    backlash: { value: 0 },
  });

  expect(getLayersConfig(['layer 0', 'layer 1', 'layer 2', 'layer 3'])).toEqual({
    speed: { value: 20, hasMultiValue: false },
    power: { value: 15, hasMultiValue: false },
    ink: { value: 3, hasMultiValue: false },
    repeat: { value: 1, hasMultiValue: false },
    height: { value: -3, hasMultiValue: false },
    zStep: { value: 1, hasMultiValue: true },
    diode: { value: 0, hasMultiValue: false },
    configName: { value: '', hasMultiValue: false },
    module: { value: 1, hasMultiValue: false },
    backlash: { value: 0, hasMultiValue: false },
  });

  writeData('layer 1', DataType.diode, 1);
  writeData('layer 1', DataType.height, -1);
  expect(getLayersConfig(['layer 0', 'layer 1', 'layer 2', 'layer 3'])).toEqual({
    speed: { value: 20, hasMultiValue: false },
    power: { value: 15, hasMultiValue: false },
    ink: { value: 3, hasMultiValue: false },
    repeat: { value: 1, hasMultiValue: false },
    height: { value: -1, hasMultiValue: true },
    zStep: { value: 1, hasMultiValue: true },
    diode: { value: 1, hasMultiValue: true },
    configName: { value: '', hasMultiValue: false },
    module: { value: 1, hasMultiValue: false },
    backlash: { value: 0, hasMultiValue: false },
  });

  writeData('layer 1', DataType.height, 1);
  expect(getLayersConfig(['layer 0', 'layer 1', 'layer 2', 'layer 3'])).toEqual({
    speed: { value: 20, hasMultiValue: false },
    power: { value: 15, hasMultiValue: false },
    ink: { value: 3, hasMultiValue: false },
    repeat: { value: 1, hasMultiValue: false },
    height: { value: 1, hasMultiValue: true },
    zStep: { value: 1, hasMultiValue: true },
    diode: { value: 1, hasMultiValue: true },
    configName: { value: '', hasMultiValue: false },
    module: { value: 1, hasMultiValue: false },
    backlash: { value: 0, hasMultiValue: false },
  });

  writeData('layer 1', DataType.module, 2);
  expect(getLayerConfig('layer 1')).toEqual({
    speed: { value: 20 },
    power: { value: 15 },
    ink: { value: 3 },
    repeat: { value: 1 },
    height: { value: 1 },
    zStep: { value: 1 },
    diode: { value: 1 },
    configName: { value: '' },
    module: { value: 2 },
    backlash: { value: 0 },
  });

  expect(getLayersConfig(['layer 0', 'layer 1', 'layer 2', 'layer 3'])).toEqual({
    speed: { value: 20, hasMultiValue: false },
    power: { value: 15, hasMultiValue: false },
    ink: { value: 3, hasMultiValue: false },
    repeat: { value: 1, hasMultiValue: false },
    height: { value: 1, hasMultiValue: true },
    zStep: { value: 1, hasMultiValue: true },
    diode: { value: 1, hasMultiValue: true },
    configName: { value: '', hasMultiValue: false },
    module: { value: 2, hasMultiValue: true },
    backlash: { value: 0, hasMultiValue: false },
  });
});
