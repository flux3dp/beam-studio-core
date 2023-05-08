import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import { LayerPanelContext } from 'app/views/beambox/Right-Panels/contexts/LayerPanelContext';

import LayerContextMenu from './LayerContextMenu';

const mockClearSelection = jest.fn();
jest.mock('helpers/svg-editor-helper', () => ({
  getSVGAsync: (cb) => cb({
    Canvas: {
      clearSelection: () => mockClearSelection(),
    },
  }),
}));

const mockCloneLayers = jest.fn();
const mockDeleteLayers = jest.fn();
const mockGetAllLayerNames = jest.fn();
const mockGetLayerPosition = jest.fn();
const mockMergeLayers = jest.fn();
const mockSetLayersLock = jest.fn();
jest.mock('helpers/layer/layer-helper', () => ({
  cloneLayers: (...args) => mockCloneLayers(...args),
  deleteLayers: (...args) => mockDeleteLayers(...args),
  getAllLayerNames: () => mockGetAllLayerNames(),
  getLayerPosition: (...args) => mockGetLayerPosition(...args),
  mergeLayers: (...args) => mockMergeLayers(...args),
  setLayersLock: (...args) => mockSetLayersLock(...args),
}));

jest.mock('helpers/useI18n', () => () => ({
  beambox: {
    right_panel: {
      layer_panel: {
        layers: {
          rename: 'rename',
          dupe: 'dupe',
          lock: 'lock',
          del: 'del',
          merge_down: 'merge_down',
          merge_all: 'merge_all',
          merge_selected: 'merge_selected',
        }
      },
    },
  },
}));

jest.mock('app/views/beambox/Right-Panels/contexts/LayerPanelContext', () => ({
  LayerPanelContext: React.createContext(null),
}));

const mockDrawing = {
  getLayerName: jest.fn(),
  getCurrentLayerName: jest.fn(),
};

const mockSetSelectedLayers = jest.fn();
const mockSelectOnlyLayer = jest.fn();
const mockRenameLayer = jest.fn();
describe('test LayerContextMenu', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should render correctly when multiselecting', () => {
    mockDrawing.getLayerName.mockReturnValue('layer1');
    const { container } = render(
      <LayerPanelContext.Provider
        value={{
          selectedLayers: ['layer1', 'layer2'],
          setSelectedLayers: mockSetSelectedLayers,
        }}
      >
        <LayerContextMenu
          drawing={mockDrawing}
          selectOnlyLayer={mockSelectOnlyLayer}
          renameLayer={mockRenameLayer}
        />
      </LayerPanelContext.Provider>
    );
    expect(container).toMatchSnapshot();
  });

  it('should render correctly when selecting last', () => {
    mockDrawing.getLayerName.mockReturnValue('layer1');
    const { container } = render(
      <LayerPanelContext.Provider
        value={{ selectedLayers: ['layer1'], setSelectedLayers: mockSetSelectedLayers }}
      >
        <LayerContextMenu
          drawing={mockDrawing}
          selectOnlyLayer={mockSelectOnlyLayer}
          renameLayer={mockRenameLayer}
        />
      </LayerPanelContext.Provider>
    );
    expect(container).toMatchSnapshot();
  });

  test('rename layer should work', () => {
    const { getByText } = render(
      <LayerPanelContext.Provider
        value={{ selectedLayers: ['layer2'], setSelectedLayers: mockSetSelectedLayers }}
      >
        <LayerContextMenu
          drawing={mockDrawing}
          selectOnlyLayer={mockSelectOnlyLayer}
          renameLayer={mockRenameLayer}
        />
      </LayerPanelContext.Provider>
    );
    expect(mockSelectOnlyLayer).not.toBeCalled();
    expect(mockRenameLayer).not.toBeCalled();
    fireEvent.click(getByText('rename'));
    expect(mockSelectOnlyLayer).toBeCalledTimes(1);
    expect(mockSelectOnlyLayer).toHaveBeenLastCalledWith('layer2');
    expect(mockRenameLayer).toBeCalledTimes(1);
  });

  test('cloneLayers should work', () => {
    const { getByText } = render(
      <LayerPanelContext.Provider
        value={{ selectedLayers: ['layer1', 'layer2'], setSelectedLayers: mockSetSelectedLayers }}
      >
        <LayerContextMenu
          drawing={mockDrawing}
          selectOnlyLayer={mockSelectOnlyLayer}
          renameLayer={mockRenameLayer}
        />
      </LayerPanelContext.Provider>
    );
    expect(mockCloneLayers).not.toBeCalled();
    mockCloneLayers.mockReturnValue(['layer1 copy', 'layer2 copy']);
    expect(mockSetSelectedLayers).not.toBeCalled();
    fireEvent.click(getByText('dupe'));
    expect(mockCloneLayers).toBeCalledWith(['layer1', 'layer2']);
    expect(mockSetSelectedLayers).toBeCalledWith(['layer1 copy', 'layer2 copy']);
  });

  test('lock layers should work', () => {
    const { getByText } = render(
      <LayerPanelContext.Provider
        value={{ selectedLayers: ['layer1', 'layer2'], setSelectedLayers: mockSetSelectedLayers }}
      >
        <LayerContextMenu
          drawing={mockDrawing}
          selectOnlyLayer={mockSelectOnlyLayer}
          renameLayer={mockRenameLayer}
        />
      </LayerPanelContext.Provider>
    );
    expect(mockClearSelection).not.toBeCalled();
    expect(mockSetLayersLock).not.toBeCalled();
    expect(mockSetSelectedLayers).not.toBeCalled();
    fireEvent.click(getByText('lock'));
    expect(mockClearSelection).toBeCalledTimes(1);
    expect(mockSetLayersLock).toBeCalledWith(['layer1', 'layer2'], true);
    expect(mockSetSelectedLayers).toBeCalledWith(['layer1', 'layer2']);
  });

  test('deleteLayers should work', () => {
    const { getByText } = render(
      <LayerPanelContext.Provider
        value={{ selectedLayers: ['layer1', 'layer2'], setSelectedLayers: mockSetSelectedLayers }}
      >
        <LayerContextMenu
          drawing={mockDrawing}
          selectOnlyLayer={mockSelectOnlyLayer}
          renameLayer={mockRenameLayer}
        />
      </LayerPanelContext.Provider>
    );
    expect(mockDeleteLayers).not.toBeCalled();
    expect(mockSetSelectedLayers).not.toBeCalled();
    fireEvent.click(getByText('del'));
    expect(mockDeleteLayers).toBeCalledWith(['layer1', 'layer2']);
    expect(mockSetSelectedLayers).toBeCalledWith([]);
  });

  test('merge down should work', () => {
    const { getByText } = render(
      <LayerPanelContext.Provider
        value={{ selectedLayers: ['layer1'], setSelectedLayers: mockSetSelectedLayers }}
      >
        <LayerContextMenu
          drawing={mockDrawing}
          selectOnlyLayer={mockSelectOnlyLayer}
          renameLayer={mockRenameLayer}
        />
      </LayerPanelContext.Provider>
    );
    mockGetLayerPosition.mockReturnValue(1);
    mockDrawing.getLayerName.mockReturnValue('layer2');
    expect(mockMergeLayers).not.toBeCalled();
    expect(mockSetSelectedLayers).not.toBeCalled();
    fireEvent.click(getByText('merge_down'));
    expect(mockGetLayerPosition).toBeCalledTimes(1);
    expect(mockGetLayerPosition).toBeCalledWith('layer1');
    expect(mockDrawing.getLayerName).toBeCalledTimes(2);
    expect(mockDrawing.getLayerName).toHaveBeenLastCalledWith(0);
    expect(mockMergeLayers).toBeCalledWith(['layer1'], 'layer2');
    expect(mockSelectOnlyLayer).toBeCalledTimes(1);
    expect(mockSelectOnlyLayer).toHaveBeenLastCalledWith('layer2');
  });

  test('merge all should work', () => {
    mockGetAllLayerNames.mockReturnValue(['layer1', 'layer2', 'layer3']);
    const { getByText } = render(
      <LayerPanelContext.Provider
        value={{ selectedLayers: ['layer2'], setSelectedLayers: mockSetSelectedLayers }}
      >
        <LayerContextMenu
          drawing={mockDrawing}
          selectOnlyLayer={mockSelectOnlyLayer}
          renameLayer={mockRenameLayer}
        />
      </LayerPanelContext.Provider>
    );
    expect(mockMergeLayers).not.toBeCalled();
    mockMergeLayers.mockReturnValue('layer1');
    expect(mockSetSelectedLayers).not.toBeCalled();
    fireEvent.click(getByText('merge_all'));
    expect(mockGetAllLayerNames).toBeCalledTimes(1);
    expect(mockMergeLayers).toBeCalledTimes(1);
    expect(mockMergeLayers).toHaveBeenLastCalledWith(['layer1', 'layer2', 'layer3']);
    expect(mockSelectOnlyLayer).toBeCalledTimes(1);
    expect(mockSelectOnlyLayer).toHaveBeenLastCalledWith('layer1');
  });

  test('merge selected should work', () => {
    const { getByText } = render(
      <LayerPanelContext.Provider
        value={{ selectedLayers: ['layer1', 'layer2'], setSelectedLayers: mockSetSelectedLayers }}
      >
        <LayerContextMenu
          drawing={mockDrawing}
          selectOnlyLayer={mockSelectOnlyLayer}
          renameLayer={mockRenameLayer}
        />
      </LayerPanelContext.Provider>
    );
    mockDrawing.getCurrentLayerName.mockReturnValue('layer2');
    mockMergeLayers.mockReturnValue('layer2');
    expect(mockDrawing.getCurrentLayerName).not.toBeCalled();
    expect(mockMergeLayers).not.toBeCalled();
    expect(mockSetSelectedLayers).not.toBeCalled();
    fireEvent.click(getByText('merge_selected'));
    expect(mockDrawing.getCurrentLayerName).toBeCalledTimes(1);
    expect(mockMergeLayers).toBeCalledTimes(1);
    expect(mockMergeLayers).toHaveBeenLastCalledWith(['layer1', 'layer2'], 'layer2');
    expect(mockSetSelectedLayers).toBeCalledTimes(1);
    expect(mockSetSelectedLayers).toHaveBeenLastCalledWith(['layer2']);
  });
});