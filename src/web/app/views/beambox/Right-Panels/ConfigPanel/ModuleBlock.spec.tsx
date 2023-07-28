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
  },
}));

const mockUpdateLayerColor = jest.fn();
jest.mock('helpers/svg-editor-helper', () => ({
  getSVGAsync: (callback) => {
    callback({
      Canvas: {
        updateLayerColor: (...args) => mockUpdateLayerColor(...args),
      },
    });
  },
}));

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
jest.mock('helpers/layer/layer-config-helper', () => ({
  DataType: {
    module: 'module',
  },
  writeData: (...args) => mockWriteData(...args),
}));

const mockGetLayerElementByName = jest.fn();
jest.mock('helpers/layer/layer-helper', () => ({
  getLayerElementByName: (...args) => mockGetLayerElementByName(...args),
}));

jest.mock('app/constants/right-panel-constants', () => ({
  modelsWithModules: ['ado1'],
}));

jest.mock('app/constants/color-constants', () => ({
  printingLayerColor: ['#123'],
}));

const mockSelectedLayers = ['layer1', 'layer2'];
const mockContextState = {
  module: { value: LayerModule.LASER, hasMultiValue: false },
};

const mockDispatch = jest.fn();

describe('test ModuleBlock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRead.mockReturnValue('ado1');
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
    expect(mockUpdate).toHaveBeenLastCalledWith(LayerModule.LASER);
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

  test('change to printer should work', () => {
    const { baseElement, getByText } = render(
      <ConfigPanelContext.Provider
        value={{ state: mockContextState as any, dispatch: mockDispatch, selectedLayers: mockSelectedLayers }}
      >
        <ModuleBlock />
      </ConfigPanelContext.Provider>
    );
    expect(mockUpdate).toBeCalledTimes(1);
    expect(mockUpdate).toHaveBeenLastCalledWith(LayerModule.LASER);
    expect(mockOnUpdateWorkArea).toBeCalledTimes(1);
    act(() => {
      fireEvent.mouseDown(baseElement.querySelector('.ant-select-selector'));
    });
    const mockElem = {
      getAttribute: jest.fn(),
      setAttribute: jest.fn(),
    };
    mockElem.getAttribute.mockReturnValueOnce('#456');
    mockGetLayerElementByName.mockReturnValue(mockElem);
    act(() => {
      fireEvent.click(getByText('Print'));
    });
    expect(mockDispatch).toBeCalledTimes(1);
    expect(mockDispatch).toHaveBeenLastCalledWith({ type: 'change', payload: { module: LayerModule.PRINTER } });
    expect(mockWriteData).toBeCalledTimes(2);
    expect(mockWriteData).toHaveBeenNthCalledWith(1, 'layer1', 'module', LayerModule.PRINTER);
    expect(mockWriteData).toHaveBeenNthCalledWith(2, 'layer2', 'module', LayerModule.PRINTER);
    expect(mockGetLayerElementByName).toBeCalledTimes(2);
    expect(mockGetLayerElementByName).toHaveBeenNthCalledWith(1, 'layer1');
    expect(mockGetLayerElementByName).toHaveBeenNthCalledWith(2, 'layer2');
    expect(mockElem.getAttribute).toBeCalledTimes(2);
    expect(mockElem.getAttribute).toHaveBeenLastCalledWith('data-color');
    expect(mockElem.setAttribute).toBeCalledTimes(2);
    expect(mockElem.setAttribute).toHaveBeenNthCalledWith(1, 'data-color', '#1D1D1B');
    expect(mockElem.setAttribute).toHaveBeenNthCalledWith(2, 'data-color', '#1D1D1B');
    expect(mockUpdateLayerColor).toBeCalledTimes(2);

    expect(baseElement).toMatchSnapshot();
  });
});
