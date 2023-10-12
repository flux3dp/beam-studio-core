import {
  cloneLayerConfig,
  DataType,
  getLayerConfig,
  getLayersConfig,
  initLayerConfig,
  writeData,
  toggleFullColorAfterWorkareaChange,
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

const mockToggleFullColorLayer = jest.fn();
jest.mock(
  'helpers/layer/full-color/toggleFullColorLayer',
  () =>
    (...args) =>
      mockToggleFullColorLayer(...args)
);

const mockGetAllPresets = jest.fn();
jest.mock('app/constants/right-panel-constants', () => ({
  getAllPresets: () => mockGetAllPresets(),
}));

const defaultLaserConfigs = {
  speed: { value: 20 },
  printingSpeed: { value: 60 },
  power: { value: 15 },
  ink: { value: 1 },
  repeat: { value: 1 },
  height: { value: -3 },
  zStep: { value: 0 },
  diode: { value: 0 },
  configName: { value: '' },
  module: { value: 1 },
  backlash: { value: 0 },
  multipass: { value: 3 },
  uv: { value: 0 },
};

const defaultMultiValueLaserConfigs = {
  speed: { value: 20, hasMultiValue: false },
  printingSpeed: { value: 60, hasMultiValue: false },
  power: { value: 15, hasMultiValue: false },
  ink: { value: 1, hasMultiValue: false },
  repeat: { value: 1, hasMultiValue: false },
  height: { value: -3, hasMultiValue: false },
  zStep: { value: 0, hasMultiValue: false },
  diode: { value: 0, hasMultiValue: false },
  configName: { value: '', hasMultiValue: false },
  module: { value: 1, hasMultiValue: false },
  backlash: { value: 0, hasMultiValue: false },
  multipass: { value: 3, hasMultiValue: false },
  uv: { value: 0, hasMultiValue: false },
};

describe('test layer-config-helper', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <g class="layer"></g>
      <g class="layer"><title>layer 1</title></g>
      <g class="layer"><title>layer 2</title></g>
      <g class="layer"><title>layer 3</title></g>
    `;
  });

  it('should return null layer when layer does not exist', () => {
    expect(getLayerConfig('layer 0')).toBeNull();
  });

  test('initLayerConfig', () => {
    initLayerConfig('layer 1');
    expect(getLayerConfig('layer 1')).toEqual(defaultLaserConfigs);
  });

  test('write zstep data', () => {
    writeData('layer 1', DataType.zstep, 1);
    expect(getLayerConfig('layer 1')).toEqual({
      ...defaultLaserConfigs,
      zStep: { value: 1 },
    });
  });

  test('cloneLayerConfig', () => {
    writeData('layer 1', DataType.speed, 30);
    cloneLayerConfig('layer 3', 'layer 1');
    expect(getLayerConfig('layer 3')).toEqual({
      ...defaultLaserConfigs,
      speed: { value: 30 },
    });
  });

  test('getLayersConfig', () => {
    expect(getLayersConfig(['layer 0', 'layer 1', 'layer 2', 'layer 3'])).toEqual(
      defaultMultiValueLaserConfigs
    );
    writeData('layer 1', DataType.speed, 30);
    expect(getLayersConfig(['layer 0', 'layer 1', 'layer 2', 'layer 3'])).toEqual({
      ...defaultMultiValueLaserConfigs,
      speed: { value: 30, hasMultiValue: true },
    });
  });

  test('getLayersConfig with diode and height', () => {
    writeData('layer 1', DataType.diode, 1);
    writeData('layer 1', DataType.height, -1);
    writeData('layer 1', DataType.strength, 20);

    expect(getLayersConfig(['layer 0', 'layer 1', 'layer 2', 'layer 3'])).toEqual({
      ...defaultMultiValueLaserConfigs,
      power: { value: 20, hasMultiValue: true },
      height: { value: -1, hasMultiValue: true },
      diode: { value: 1, hasMultiValue: true },
    });
    writeData('layer 1', DataType.height, 1);
    expect(getLayersConfig(['layer 0', 'layer 1', 'layer 2', 'layer 3'])).toEqual({
      ...defaultMultiValueLaserConfigs,
      power: { value: 20, hasMultiValue: true },
      height: { value: 1, hasMultiValue: true },
      diode: { value: 1, hasMultiValue: true },
    });
    expect(getLayersConfig(['layer 0', 'layer 1', 'layer 2', 'layer 3'], 'layer 2')).toEqual({
      ...defaultMultiValueLaserConfigs,
      power: { value: 15, hasMultiValue: true },
      height: { value: 1, hasMultiValue: true },
      diode: { value: 1, hasMultiValue: true },
    });
  });

  test('getLayerConfig of printing layer', () => {
    writeData('layer 1', DataType.module, 5);
    expect(getLayerConfig('layer 1')).toEqual({
      ...defaultLaserConfigs,
      speed: { value: 60 },
      module: { value: 5 },
    });
    writeData('layer 1', DataType.speed, 30, true);
    expect(getLayerConfig('layer 1')).toEqual({
      ...defaultLaserConfigs,
      speed: { value: 30 },
      printingSpeed: { value: 30 },
      module: { value: 5 },
    });
  });

  test('toggleFullColorAfterWorkareaChange', () => {
    mockRead.mockReturnValue('fbm1');
    mockGetAllLayerNames.mockReturnValue(['layer 1', 'layer 2', 'layer 3']);
    const mockLayer = {
      setAttribute: jest.fn(),
    };
    mockGetLayerByName.mockReturnValue(mockLayer);
    toggleFullColorAfterWorkareaChange();
    expect(mockToggleFullColorLayer).toBeCalledTimes(3);
    expect(mockLayer.setAttribute).toBeCalledTimes(3);
    expect(mockLayer.setAttribute).toHaveBeenNthCalledWith(1, 'data-module', '1');
    expect(mockLayer.setAttribute).toHaveBeenNthCalledWith(2, 'data-module', '1');
    expect(mockLayer.setAttribute).toHaveBeenNthCalledWith(3, 'data-module', '1');
  });
});
