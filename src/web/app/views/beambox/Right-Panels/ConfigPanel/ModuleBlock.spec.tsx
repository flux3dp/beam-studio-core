import React from 'react';
import { act, fireEvent, render } from '@testing-library/react';

import LayerModule from 'app/constants/layer-module/layer-modules';

import ConfigPanelContext from './ConfigPanelContext';
import ModuleBlock from './ModuleBlock';

jest.mock('helpers/useI18n', () => () => ({
  beambox: {
    right_panel: {
      laser_panel: {
        module: 'module',
      },
    },
    popup: {
      dont_show_again: 'dont_show_again',
    }
  },
  layer_module: {
    laser_10w_diode: 'laser_10w_diode',
    printing: 'printing',
    laser_2w_infrared: 'laser_2w_infrared',
    laser_20w_diode: 'laser_20w_diode',
    notification: {
      convertFromPrintingModuleTitle: 'convertFromPrintingModuleTitle',
      convertFromPrintingModuleMsg: 'convertFromPrintingModuleMsg',
    },
  },
}));

const mockUpdateLayerColor = jest.fn();
const mockGetCurrentDrawing = jest.fn();
jest.mock('helpers/svg-editor-helper', () => ({
  getSVGAsync: (callback) => {
    callback({
      Canvas: {
        updateLayerColor: (...args) => mockUpdateLayerColor(...args),
        getCurrentDrawing: (...args) => mockGetCurrentDrawing(...args),
      },
    });
  },
}));

const mockGetCurrentLayerName = jest.fn();

const mockRead = jest.fn();
jest.mock('app/actions/beambox/beambox-preference', () => ({
  read: (...args) => mockRead(...args),
}));

const mockUpdate = jest.fn();
jest.mock('app/actions/canvas/module-boundary-drawer', () => ({
  update: (...args) => mockUpdate(...args),
}));

const mockEmit = jest.fn();
jest.mock('helpers/eventEmitterFactory', () => ({
  createEventEmitter: () => ({
    emit: (...args) => mockEmit(...args),
  }),
}));

const mockGet = jest.fn();
jest.mock('implementations/storage', () => ({
  get: (...args) => mockGet(...args),
}));

const mockOnUpdateWorkArea = jest.fn();
const mockRemoveUpdateWorkAreaListener = jest.fn();
jest.mock('app/stores/beambox-store', () => ({
  onUpdateWorkArea: (...args) => mockOnUpdateWorkArea(...args),
  removeUpdateWorkAreaListener: (...args) => mockRemoveUpdateWorkAreaListener(...args),
}));

const mockTogglePresprayArea = jest.fn();
jest.mock('app/actions/beambox/prespray-area', () => ({
  togglePresprayArea: (...args) => mockTogglePresprayArea(...args),
}));

const mockWriteData = jest.fn();
const mockGetData = jest.fn();
const mockGetLayerConfig = jest.fn();
const mockGetLayersConfig = jest.fn();
jest.mock('helpers/layer/layer-config-helper', () => ({
  DataType: {
    module: 'module',
    configName: 'configName',
  },
  defaultConfig: {
    speed: 20,
    printingSpeed: 60,
    strength: 15,
    ink: 3,
    multipass: 3,
  },
  getData: (...args) => mockGetData(...args),
  getLayerConfig: (...args) => mockGetLayerConfig(...args),
  getLayersConfig: (...args) => mockGetLayersConfig(...args),
  writeData: (...args) => mockWriteData(...args),
}));

const mockGetLayerElementByName = jest.fn();
jest.mock('helpers/layer/layer-helper', () => ({
  getLayerElementByName: (...args) => mockGetLayerElementByName(...args),
}));

const mockToggleFullColorLayer = jest.fn();
jest.mock('helpers/layer/full-color/toggleFullColorLayer', () => (...args) => mockToggleFullColorLayer(...args));

jest.mock('app/constants/color-constants', () => ({
  printingLayerColor: ['#123'],
}));

const mockPopUp = jest.fn();
jest.mock('app/actions/alert-caller', () => ({
  popUp: (...args) => mockPopUp(...args),
}));

const mockSelectedLayers = ['layer1', 'layer2'];
const mockContextState = {
  module: { value: LayerModule.LASER_10W_DIODE, hasMultiValue: false },
};

const mockAlertConfigRead = jest.fn();
const mockAlertConfigWrite = jest.fn();
jest.mock('helpers/api/alert-config', () => ({
  read: (...args) => mockAlertConfigRead(...args),
  write: (...args) => mockAlertConfigWrite(...args),
}));

const mockDispatch = jest.fn();

describe('test ModuleBlock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRead.mockReturnValue('ado1');
    mockGetCurrentDrawing.mockReturnValue({
      getCurrentLayerName: (...args) => mockGetCurrentLayerName(...args),
    });
    mockAlertConfigRead.mockReturnValue(false);
  });

  it('should render correctly', () => {
    const { container, unmount } = render(
      <ConfigPanelContext.Provider
        value={{ state: mockContextState as any, dispatch: mockDispatch, selectedLayers: mockSelectedLayers }}
      >
        <ModuleBlock />
      </ConfigPanelContext.Provider>
    );
    expect(container).toMatchSnapshot();
    expect(mockRead).toBeCalledTimes(1);
    expect(mockRead).toHaveBeenLastCalledWith('workarea');
    expect(mockUpdate).toBeCalledTimes(1);
    expect(mockUpdate).toHaveBeenLastCalledWith(LayerModule.LASER_10W_DIODE);
    expect(mockOnUpdateWorkArea).toBeCalledTimes(1);
    unmount();
    expect(mockRemoveUpdateWorkAreaListener).toBeCalledTimes(1);
  });

  it('should not render when workarea does not support module', () => {
    mockRead.mockReturnValue('ado2');

    const { container } = render(
      <ConfigPanelContext.Provider
        value={{ state: mockContextState as any, dispatch: mockDispatch, selectedLayers: mockSelectedLayers }}
      >
        <ModuleBlock />
      </ConfigPanelContext.Provider>
    );
    expect(container).toBeEmptyDOMElement();
  });

  test('change to 20w should work when selecting 1 layer', () => {
    const { baseElement, getByText } = render(
      <ConfigPanelContext.Provider
        value={{ state: mockContextState as any, dispatch: mockDispatch, selectedLayers: ['layer1'] }}
      >
        <ModuleBlock />
      </ConfigPanelContext.Provider>
    );
    expect(mockUpdate).toBeCalledTimes(1);
    expect(mockUpdate).toHaveBeenLastCalledWith(LayerModule.LASER_10W_DIODE);
    expect(mockOnUpdateWorkArea).toBeCalledTimes(1);
    act(() => {
      fireEvent.mouseDown(baseElement.querySelector('.ant-select-selector'));
    });
    const mockElem = {
      getAttribute: jest.fn(),
      setAttribute: jest.fn(),
      removeAttribute: jest.fn(),
    };
    mockGetLayerElementByName.mockReturnValue(mockElem);
    mockGet.mockReturnValueOnce([{ name: 'config1', speed: 87, power: 88, repeat: 89 }]);
    mockGetData.mockReturnValueOnce('config1');
    mockGetCurrentLayerName.mockReturnValueOnce('layer1');
    mockGetLayerConfig.mockReturnValueOnce('mock-layer-config');
    act(() => {
      fireEvent.click(getByText('laser_20w_diode'));
    });
    expect(mockGetData).toBeCalledTimes(1);
    expect(mockGetData).toHaveBeenNthCalledWith(1, mockElem, 'configName');
    expect(mockWriteData).toBeCalledTimes(1);
    expect(mockWriteData).toHaveBeenNthCalledWith(1, 'layer1', 'module', LayerModule.LASER_20W_DIODE);
    expect(mockGetLayerElementByName).toBeCalledTimes(1);
    expect(mockGetLayerElementByName).toHaveBeenNthCalledWith(1, 'layer1');
    expect(mockElem.setAttribute).toBeCalledTimes(3);
    expect(mockElem.setAttribute).toHaveBeenNthCalledWith(1, 'data-speed', '87');
    expect(mockElem.setAttribute).toHaveBeenNthCalledWith(2, 'data-strength', '88');
    expect(mockElem.setAttribute).toHaveBeenNthCalledWith(3, 'data-repeat', '89');
    expect(mockToggleFullColorLayer).toBeCalledTimes(1);
    expect(mockToggleFullColorLayer).toHaveBeenNthCalledWith(1, mockElem, { val: false });
    expect(mockUpdateLayerColor).not.toBeCalled();
    expect(mockGetCurrentDrawing).not.toBeCalled();
    expect(mockGetCurrentLayerName).not.toBeCalled();
    expect(mockGetLayersConfig).not.toBeCalled();
    expect(mockGetLayerConfig).toBeCalledTimes(1);
    expect(mockGetLayerConfig).toHaveBeenLastCalledWith('layer1');
    expect(mockDispatch).toBeCalledTimes(1);
    expect(mockDispatch).toHaveBeenLastCalledWith({ type: 'update', payload: 'mock-layer-config' });
    expect(mockEmit).toBeCalledTimes(1);
    expect(mockEmit).toHaveBeenLastCalledWith('UPDATE_LAYER_PANEL');
    expect(mockTogglePresprayArea).toBeCalledTimes(1);

    expect(baseElement).toMatchSnapshot();
  });

  test('change to printer should work when selecting 2 layer', async () => {
    const { baseElement, getByText } = render(
      <ConfigPanelContext.Provider
        value={{ state: mockContextState as any, dispatch: mockDispatch, selectedLayers: mockSelectedLayers }}
      >
        <ModuleBlock />
      </ConfigPanelContext.Provider>
    );
    expect(mockUpdate).toBeCalledTimes(1);
    expect(mockUpdate).toHaveBeenLastCalledWith(LayerModule.LASER_10W_DIODE);
    expect(mockOnUpdateWorkArea).toBeCalledTimes(1);
    act(() => {
      fireEvent.mouseDown(baseElement.querySelector('.ant-select-selector'));
    });
    const mockElem = {
      getAttribute: jest.fn(),
      setAttribute: jest.fn(),
      removeAttribute: jest.fn(),
    };
    mockElem.getAttribute.mockReturnValueOnce('#456');
    mockGetLayerElementByName.mockReturnValue(mockElem);
    mockGet.mockReturnValueOnce([]);
    mockGetCurrentLayerName.mockReturnValueOnce('layer1');
    mockGetLayersConfig.mockReturnValueOnce('mock-layers-config');
    act(() => {
      fireEvent.click(getByText('printing'));
    });
    expect(mockPopUp).toBeCalledTimes(1);
    await mockPopUp.mock.calls[0][0].onConfirm();
    expect(mockGetData).toBeCalledTimes(2);
    expect(mockGetData).toHaveBeenNthCalledWith(1, mockElem, 'configName');
    expect(mockGetData).toHaveBeenNthCalledWith(2, mockElem, 'configName');
    expect(mockWriteData).toBeCalledTimes(2);
    expect(mockWriteData).toHaveBeenNthCalledWith(1, 'layer1', 'module', LayerModule.PRINTER);
    expect(mockWriteData).toHaveBeenNthCalledWith(2, 'layer2', 'module', LayerModule.PRINTER);
    expect(mockGetLayerElementByName).toBeCalledTimes(2);
    expect(mockGetLayerElementByName).toHaveBeenNthCalledWith(1, 'layer1');
    // expect(mockGetLayerElementByName).toHaveBeenNthCalledWith(2, 'layer2');
    // expect(mockElem.getAttribute).toBeCalledTimes(2);
    // expect(mockElem.getAttribute).toHaveBeenLastCalledWith('data-color');
    // expect(mockElem.setAttribute).toBeCalledTimes(2);
    // expect(mockElem.setAttribute).toHaveBeenNthCalledWith(1, 'data-color', '#1D1D1B');
    // expect(mockElem.setAttribute).toHaveBeenNthCalledWith(2, 'data-color', '#1D1D1B');
    // expect(mockUpdateLayerColor).toBeCalledTimes(2);
    expect(mockElem.removeAttribute).toBeCalledTimes(2);
    expect(mockElem.removeAttribute).toHaveBeenNthCalledWith(1, 'data-configName');
    expect(mockElem.removeAttribute).toHaveBeenNthCalledWith(2, 'data-configName');
    expect(mockToggleFullColorLayer).toBeCalledTimes(2);
    expect(mockToggleFullColorLayer).toHaveBeenNthCalledWith(1, mockElem, { val: true });
    expect(mockToggleFullColorLayer).toHaveBeenNthCalledWith(2, mockElem, { val: true });
    expect(mockGetCurrentDrawing).toBeCalledTimes(1);
    expect(mockGetCurrentLayerName).toBeCalledTimes(1);
    expect(mockGetLayerConfig).not.toBeCalled();
    expect(mockGetLayersConfig).toBeCalledTimes(1);
    expect(mockGetLayersConfig).toHaveBeenLastCalledWith(mockSelectedLayers, 'layer1');
    expect(mockDispatch).toBeCalledTimes(1);
    expect(mockDispatch).toHaveBeenLastCalledWith({ type: 'update', payload: 'mock-layers-config' });
    expect(mockEmit).toBeCalledTimes(1);
    expect(mockEmit).toHaveBeenLastCalledWith('UPDATE_LAYER_PANEL');
    expect(mockTogglePresprayArea).toBeCalledTimes(1);

    expect(baseElement).toMatchSnapshot();
  });
});
