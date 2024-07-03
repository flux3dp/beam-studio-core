/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { act, fireEvent, render } from '@testing-library/react';

import LayerModule from 'app/constants/layer-module/layer-modules';

import ConfigPanelContext from './ConfigPanelContext';

jest.mock('helpers/useI18n', () => () => ({
  beambox: {
    right_panel: {
      laser_panel: {
        module: 'module',
      },
    },
    popup: {
      dont_show_again: 'dont_show_again',
    },
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

const mockAddCommandToHistory = jest.fn();
jest.mock('helpers/svg-editor-helper', () => ({
  getSVGAsync: (callback) => {
    callback({
      Canvas: {
        addCommandToHistory: mockAddCommandToHistory,
      },
    });
  },
}));

const mockUseWorkarea = jest.fn();
jest.mock('helpers/hooks/useWorkarea', () => () => mockUseWorkarea());

const mockUpdate = jest.fn();
jest.mock('app/actions/canvas/module-boundary-drawer', () => ({
  update: (...args: any) => mockUpdate(...args),
}));

const mockOn = jest.fn();
const mockOff = jest.fn();
const mockEmit = jest.fn();
jest.mock('helpers/eventEmitterFactory', () => ({
  createEventEmitter: () => ({
    on: (...args) => mockOn(...args),
    off: (...args) => mockOff(...args),
    emit: (...args) => mockEmit(...args),
  }),
}));

const mockGet = jest.fn();
jest.mock('implementations/storage', () => ({
  get: (...args) => mockGet(...args),
}));

const mockTogglePresprayArea = jest.fn();
jest.mock('app/actions/canvas/prespray-area', () => ({
  togglePresprayArea: (...args) => mockTogglePresprayArea(...args),
}));

const mockWriteDataLayer = jest.fn();
const mockGetData = jest.fn().mockReturnValue('configName');
jest.mock('helpers/layer/layer-config-helper', () => ({
  DataType: {
    speed: 'speed',
    printingSpeed: 'printingSpeed',
    strength: 'strength',
    ink: 'ink',
    repeat: 'repeat',
    configName: 'configName',
    module: 'module',
    multipass: 'multipass',
  },
  defaultConfig: {
    speed: 20,
    printingSpeed: 60,
    strength: 15,
    ink: 3,
    multipass: 3,
  },
  getData: (...args) => mockGetData(...args),
  writeDataLayer: (...args) => mockWriteDataLayer(...args),
}));

const mockGetLayerElementByName = jest.fn();
jest.mock('helpers/layer/layer-helper', () => ({
  getLayerElementByName: (...args) => mockGetLayerElementByName(...args),
}));

const mockToggleFullColorLayer = jest.fn();
jest.mock(
  'helpers/layer/full-color/toggleFullColorLayer',
  () =>
    (...args) =>
      mockToggleFullColorLayer(...args)
);

const mockPopUp = jest.fn();
jest.mock('app/actions/alert-caller', () => ({
  popUp: (...args) => mockPopUp(...args),
}));

const mockUpdateLayerPanel = jest.fn();
jest.mock('app/views/beambox/Right-Panels/contexts/LayerPanelController', () => ({
  updateLayerPanel: mockUpdateLayerPanel,
}));

let batchCmd = null;
const mockBatchCommand = jest.fn().mockImplementation(() => {
  batchCmd = { onAfter: null, addSubCommand: jest.fn() };
  return batchCmd;
});
const mockChangeElementCommand = jest.fn().mockReturnValue('mock-change-element-cmd');
jest.mock('app/svgedit/history/history', () => ({
  BatchCommand: mockBatchCommand,
  ChangeElementCommand: mockChangeElementCommand,
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
const mockInitState = jest.fn();

// eslint-disable-next-line import/first
import ModuleBlock from './ModuleBlock';

describe('test ModuleBlock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseWorkarea.mockReturnValue('ado1');
    mockAlertConfigRead.mockReturnValue(false);
  });

  it('should render correctly', () => {
    const { container, unmount } = render(
      <ConfigPanelContext.Provider
        value={{
          state: mockContextState as any,
          dispatch: mockDispatch,
          selectedLayers: mockSelectedLayers,
          initState: mockInitState,
        }}
      >
        <ModuleBlock />
      </ConfigPanelContext.Provider>
    );
    expect(container).toMatchSnapshot();
    expect(mockUseWorkarea).toBeCalledTimes(1);
    expect(mockUpdate).toBeCalledTimes(1);
    expect(mockUpdate).toHaveBeenLastCalledWith(LayerModule.LASER_10W_DIODE);
    expect(mockOn).toBeCalledTimes(1);
    expect(mockOn).toHaveBeenLastCalledWith('canvas-change', expect.any(Function));
    expect(mockOff).not.toBeCalled();
    unmount();
    expect(mockOff).toBeCalledTimes(1);
    expect(mockOff).toHaveBeenLastCalledWith('canvas-change', expect.any(Function));
  });

  it('should not render when workarea does not support module', () => {
    mockUseWorkarea.mockReturnValue('ado2');

    const { container } = render(
      <ConfigPanelContext.Provider
        value={{
          state: mockContextState as any,
          dispatch: mockDispatch,
          selectedLayers: mockSelectedLayers,
          initState: mockInitState,
        }}
      >
        <ModuleBlock />
      </ConfigPanelContext.Provider>
    );
    expect(container).toBeEmptyDOMElement();
  });

  test('change to 20w should work when selecting 1 layer', () => {
    const { baseElement, getByText } = render(
      <ConfigPanelContext.Provider
        value={{
          state: mockContextState as any,
          dispatch: mockDispatch,
          selectedLayers: ['layer1'],
          initState: mockInitState,
        }}
      >
        <ModuleBlock />
      </ConfigPanelContext.Provider>
    );
    expect(mockUpdate).toBeCalledTimes(1);
    expect(mockUpdate).toHaveBeenLastCalledWith(LayerModule.LASER_10W_DIODE);
    expect(mockOn).toBeCalledTimes(1);
    act(() => {
      fireEvent.mouseDown(baseElement.querySelector('.ant-select-selector'));
    });
    const mockElem = { removeAttribute: jest.fn() };
    mockGetLayerElementByName.mockReturnValue(mockElem);
    mockGet.mockReturnValueOnce([{ name: 'config1', speed: 87, power: 88, repeat: 89 }]);
    mockGetData.mockReturnValueOnce('config1');
    act(() => {
      fireEvent.click(getByText('laser_20w_diode'));
    });
    expect(mockGetData).toBeCalledTimes(1);
    expect(mockGetData).toHaveBeenNthCalledWith(1, mockElem, 'configName');
    expect(mockBatchCommand).toBeCalledTimes(1);
    expect(mockBatchCommand).lastCalledWith('Change layer module');
    expect(mockGetLayerElementByName).toBeCalledTimes(1);
    expect(mockGetLayerElementByName).toHaveBeenNthCalledWith(1, 'layer1');
    expect(mockWriteDataLayer).toBeCalledTimes(4);
    expect(mockWriteDataLayer).toHaveBeenNthCalledWith(
      1,
      mockElem,
      'module',
      LayerModule.LASER_20W_DIODE,
      { batchCmd }
    );
    expect(mockWriteDataLayer).toHaveBeenNthCalledWith(2, mockElem, 'speed', 87, { batchCmd });
    expect(mockWriteDataLayer).toHaveBeenNthCalledWith(3, mockElem, 'strength', 88, { batchCmd });
    expect(mockWriteDataLayer).toHaveBeenNthCalledWith(4, mockElem, 'repeat', 89, { batchCmd });
    expect(mockToggleFullColorLayer).toBeCalledTimes(1);
    expect(mockToggleFullColorLayer).toHaveBeenNthCalledWith(1, mockElem, { val: false });
    expect(batchCmd.addSubCommand).toBeCalledTimes(1);
    expect(mockInitState).toBeCalledTimes(1);
    expect(mockInitState).toHaveBeenNthCalledWith(1, ['layer1']);
    expect(mockUpdateLayerPanel).toBeCalledTimes(1);
    expect(mockTogglePresprayArea).toBeCalledTimes(1);
    expect(mockAddCommandToHistory).toBeCalledTimes(1);
    expect(mockAddCommandToHistory).toHaveBeenNthCalledWith(1, batchCmd);
    expect(mockElem.removeAttribute).not.toBeCalled();
    expect(mockChangeElementCommand).not.toBeCalled();
    expect(baseElement).toMatchSnapshot();

    batchCmd.onAfter();
    expect(mockInitState).toBeCalledTimes(2);
    expect(mockUpdateLayerPanel).toBeCalledTimes(2);
    expect(mockTogglePresprayArea).toBeCalledTimes(2);
    expect(mockDispatch).not.toBeCalled();
  });

  test('change to printer should work when selecting 2 layer', async () => {
    const { baseElement, getByText } = render(
      <ConfigPanelContext.Provider
        value={{
          state: mockContextState as any,
          dispatch: mockDispatch,
          selectedLayers: mockSelectedLayers,
          initState: mockInitState,
        }}
      >
        <ModuleBlock />
      </ConfigPanelContext.Provider>
    );
    expect(mockUpdate).toBeCalledTimes(1);
    expect(mockUpdate).toHaveBeenLastCalledWith(LayerModule.LASER_10W_DIODE);
    expect(mockOn).toBeCalledTimes(1);
    act(() => {
      fireEvent.mouseDown(baseElement.querySelector('.ant-select-selector'));
    });
    const mockElem1 = { removeAttribute: jest.fn(), name: 'layer1' };
    const mockElem2 = { removeAttribute: jest.fn(), name: 'layer2' };
    mockGetLayerElementByName.mockReturnValueOnce(mockElem1).mockReturnValue(mockElem2);
    mockGet.mockReturnValueOnce([]);
    act(() => {
      fireEvent.click(getByText('printing'));
    });
    expect(mockPopUp).toBeCalledTimes(1);
    await mockPopUp.mock.calls[0][0].onConfirm();
    expect(mockGetLayerElementByName).toBeCalledTimes(2);
    expect(mockGetLayerElementByName).toHaveBeenNthCalledWith(1, 'layer1');
    expect(mockGetLayerElementByName).toHaveBeenNthCalledWith(2, 'layer2');
    expect(mockGetData).toBeCalledTimes(2);
    expect(mockGetData).toHaveBeenNthCalledWith(1, mockElem1, 'configName');
    expect(mockGetData).toHaveBeenNthCalledWith(2, mockElem2, 'configName');
    expect(mockBatchCommand).toBeCalledTimes(1);
    expect(mockBatchCommand).lastCalledWith('Change layer module');
    expect(mockWriteDataLayer).toHaveBeenNthCalledWith(
      1,
      mockElem1,
      'module',
      LayerModule.PRINTER,
      { batchCmd }
    );
    expect(mockWriteDataLayer).toHaveBeenNthCalledWith(2, mockElem1, 'printingSpeed', 60, {
      batchCmd,
    });
    expect(mockWriteDataLayer).toHaveBeenNthCalledWith(3, mockElem1, 'ink', 3, { batchCmd });
    expect(mockWriteDataLayer).toHaveBeenNthCalledWith(4, mockElem1, 'multipass', 3, { batchCmd });
    expect(mockWriteDataLayer).toHaveBeenNthCalledWith(
      5,
      mockElem2,
      'module',
      LayerModule.PRINTER,
      { batchCmd }
    );
    expect(mockWriteDataLayer).toHaveBeenNthCalledWith(6, mockElem2, 'printingSpeed', 60, {
      batchCmd,
    });
    expect(mockWriteDataLayer).toHaveBeenNthCalledWith(7, mockElem2, 'ink', 3, { batchCmd });
    expect(mockWriteDataLayer).toHaveBeenNthCalledWith(8, mockElem2, 'multipass', 3, { batchCmd });
    expect(mockElem1.removeAttribute).toBeCalledTimes(1);
    expect(mockElem1.removeAttribute).toHaveBeenNthCalledWith(1, 'data-configName');
    expect(mockElem2.removeAttribute).toBeCalledTimes(1);
    expect(mockElem2.removeAttribute).toHaveBeenNthCalledWith(1, 'data-configName');
    expect(mockChangeElementCommand).toBeCalledTimes(2);
    expect(mockChangeElementCommand).toHaveBeenNthCalledWith(1, mockElem1, {
      'data-configName': 'configName',
    });
    expect(mockChangeElementCommand).toHaveBeenNthCalledWith(2, mockElem2, {
      'data-configName': 'configName',
    });
    expect(mockToggleFullColorLayer).toBeCalledTimes(2);
    expect(mockToggleFullColorLayer).toHaveBeenNthCalledWith(1, mockElem1, { val: true });
    expect(mockToggleFullColorLayer).toHaveBeenNthCalledWith(2, mockElem2, { val: true });
    expect(batchCmd.addSubCommand).toBeCalledTimes(4);
    expect(mockInitState).toBeCalledTimes(1);
    expect(mockInitState).toHaveBeenNthCalledWith(1, ['layer1', 'layer2']);
    expect(mockUpdateLayerPanel).toBeCalledTimes(1);
    expect(mockTogglePresprayArea).toBeCalledTimes(1);
    expect(mockAddCommandToHistory).toBeCalledTimes(1);
    expect(mockAddCommandToHistory).toHaveBeenNthCalledWith(1, batchCmd);
    expect(baseElement).toMatchSnapshot();

    batchCmd.onAfter();
    expect(mockInitState).toBeCalledTimes(2);
    expect(mockUpdateLayerPanel).toBeCalledTimes(2);
    expect(mockTogglePresprayArea).toBeCalledTimes(2);
    expect(mockDispatch).not.toBeCalled();
  });
});
