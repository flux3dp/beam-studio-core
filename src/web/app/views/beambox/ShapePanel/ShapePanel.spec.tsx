/* eslint-disable import/first */
import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';

import ShapePanel from './ShapePanel';

window.innerHeight = 667;
const mockSVGElement = (
  <svg width="1em" height="1em" fill="currentColor" viewBox="0 0 50 50">
    mock-svg
  </svg>
);
const mockElement = document.createElement('use');
const addSvgElementFromJson = jest.fn().mockReturnValue(mockElement);
const getSvgRealLocation = jest.fn().mockReturnValue({ x: 15, y: 10, width: 15, height: 25 });
const mockOnClose = jest.fn();
const selectOnly = jest.fn();
const setSvgElemPosition = jest.fn();
const setSvgElemSize = jest.fn();
const disassembleUse2Group = jest.fn();
const addCommandToHistory = jest.fn();
const getCurrentLayerName = jest.fn();
jest.mock('helpers/svg-editor-helper', () => ({
  getSVGAsync: (callback) =>
    callback({
      Canvas: {
        addSvgElementFromJson: (...args) => addSvgElementFromJson(...args),
        getNextId: jest.fn(),
        getSvgRealLocation: (...args) => getSvgRealLocation(...args),
        isUsingLayerColor: true,
        selectOnly: (...args) => selectOnly(...args),
        setSvgElemPosition: (...args) => setSvgElemPosition(...args),
        setSvgElemSize: (...args) => setSvgElemSize(...args),
        disassembleUse2Group: (...args) => disassembleUse2Group(...args),
        addCommandToHistory: (...args) => addCommandToHistory(...args),
        getCurrentDrawing: () => ({ getCurrentLayerName }),
      },
    }),
}));

const mockUpdateElementColor = jest.fn();
jest.mock(
  'helpers/color/updateElementColor',
  () =>
    (...args) =>
      mockUpdateElementColor(...args)
);

const mockImportSvgString = jest.fn().mockResolvedValue(mockElement);
jest.mock(
  'app/svgedit/operations/import/importSvgString',
  () =>
    (...args) =>
      mockImportSvgString(...args)
);

const mockGetData = jest.fn();
jest.mock('helpers/layer/layer-config-helper', () => ({
  DataType: {
    module: 'module',
  },
  getData: (...args) => mockGetData(...args),
}));

const mockGetLayerByName = jest.fn().mockReturnValue('mock-layer-elem');
jest.mock('helpers/layer/layer-helper', () => ({
  getLayerByName: (...args) => mockGetLayerByName(...args),
}));

jest.mock('app/constants/shape-panel-constants', () => ({
  __esModule: true,
  ShapeTabs: ['shape', 'graphics'],
  default: {
    shape: [
      {
        name: 'Circle',
        jsonMap: {
          element: 'ellipse',
          attr: { cx: 250, cy: 250, rx: 250, ry: 250, 'data-ratiofixed': true },
        },
      },
      { name: 'Triangle' },
    ],
    graphics: [{ name: 'Minus' }],
  },
}));

jest.mock('app/icons/shape/ShapeIcon', () => ({
  Circle: () => mockSVGElement,
  Minus: () => mockSVGElement,
  Triangle: () => mockSVGElement,
}));

jest.mock('helpers/i18n', () => ({
  lang: {
    beambox: {
      shapes_panel: {
        title: 'Elements',
        shape: 'Shape',
        graphics: 'Graphics',
      },
    },
  },
}));

const useIsMobile = jest.fn();
jest.mock('helpers/system-helper', () => ({
  useIsMobile: () => useIsMobile(),
}));

describe('test ShapePanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    const { baseElement } = render(<ShapePanel onClose={mockOnClose} />);
    expect(baseElement).toMatchSnapshot();
    expect(mockOnClose).not.toBeCalled();
  });

  it('should import predefined object', async () => {
    const { baseElement } = render(<ShapePanel onClose={mockOnClose} />);
    const modalEl = baseElement.querySelector('.ant-modal-wrap') as HTMLElement;
    expect(modalEl).toBeVisible();
    expect(mockOnClose).not.toBeCalled();
    const shapeIcons = baseElement.querySelectorAll('.icon');
    expect(shapeIcons.length).toBe(2);
    fireEvent.click(shapeIcons[0]);
    await waitFor(() => expect(modalEl).not.toBeVisible());
    expect(addSvgElementFromJson).toBeCalledTimes(1);
    expect(getCurrentLayerName).not.toBeCalled();
    expect(mockGetLayerByName).not.toBeCalled();
    expect(mockGetData).not.toBeCalled();
    expect(mockImportSvgString).not.toBeCalled();
    expect(getSvgRealLocation).not.toBeCalled();
    expect(selectOnly).toBeCalledTimes(2);
    expect(selectOnly).toBeCalledWith([mockElement]);
    expect(setSvgElemPosition).not.toBeCalled();
    expect(setSvgElemSize).not.toBeCalled();
    expect(disassembleUse2Group).not.toBeCalled();
    expect(addCommandToHistory).toBeCalledTimes(1);
    expect(mockOnClose).toBeCalledTimes(1);
  });

  it('should import svg object, update location and disassemble', async () => {
    const { baseElement, getByText } = render(<ShapePanel onClose={mockOnClose} />);
    const modalEl = baseElement.querySelector('.ant-modal-wrap') as HTMLElement;
    expect(modalEl).toBeVisible();
    expect(mockOnClose).not.toBeCalled();
    const graphicsTab = getByText('Graphics');
    fireEvent.click(graphicsTab);
    expect(graphicsTab).toHaveClass('adm-capsule-tabs-tab-active');
    const shapeIcons = baseElement.querySelectorAll('.icon');
    expect(shapeIcons.length).toBe(1);
    fireEvent.click(shapeIcons[0]);
    await waitFor(() => expect(modalEl).not.toBeVisible());
    expect(addSvgElementFromJson).not.toBeCalled();
    expect(getCurrentLayerName).toBeCalledTimes(1);
    expect(mockGetLayerByName).toBeCalledTimes(1);
    expect(mockGetData).toBeCalledTimes(1);
    expect(mockGetData).toBeCalledWith('mock-layer-elem', 'module');
    expect(mockImportSvgString).toBeCalledTimes(1);
    expect(getSvgRealLocation).toBeCalledTimes(1);
    expect(getSvgRealLocation).toBeCalledWith(mockElement);
    expect(selectOnly).toBeCalledTimes(1);
    expect(selectOnly).toBeCalledWith([mockElement]);
    expect(setSvgElemPosition).toBeCalledTimes(2);
    expect(setSvgElemPosition).toHaveBeenNthCalledWith(1, 'x', 0, mockElement, false);
    expect(setSvgElemPosition).toHaveBeenNthCalledWith(2, 'y', 0, mockElement, false);
    expect(setSvgElemSize).toBeCalledTimes(2);
    expect(setSvgElemSize).toHaveBeenNthCalledWith(1, 'width', 300);
    expect(setSvgElemSize).toHaveBeenNthCalledWith(2, 'height', 500);
    expect(disassembleUse2Group).toBeCalledTimes(1);
    expect(disassembleUse2Group).toHaveBeenNthCalledWith(1, [mockElement], true, false);
    expect(addCommandToHistory).toBeCalledTimes(1);
    expect(mockOnClose).toBeCalledTimes(1);
  });
});

describe('test ShapePanel in mobile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useIsMobile.mockReturnValue(true);
  });

  it('should render correctly', async () => {
    const { container } = render(<ShapePanel onClose={mockOnClose} />);
    const panelEl = container.querySelector('.adm-floating-panel') as HTMLElement;
    await waitFor(() => expect(panelEl.style.transform).toBe('translateY(calc(100% + (-627px)))'), {
      timeout: 3000,
    });
    await waitFor(() => expect(panelEl.getAttribute('data-animating')).toBe('false'));
    expect(container).toMatchSnapshot();
    expect(mockOnClose).not.toBeCalled();
  });

  it('should import predefined object', async () => {
    const { container } = render(<ShapePanel onClose={mockOnClose} />);
    const panelEl = container.querySelector('.adm-floating-panel') as HTMLElement;
    await waitFor(() => expect(panelEl.style.transform).toBe('translateY(calc(100% + (-627px)))'));
    expect(mockOnClose).not.toBeCalled();
    const shapeIcons = container.querySelectorAll('.icon');
    expect(shapeIcons.length).toBe(2);
    fireEvent.click(shapeIcons[0]);
    await waitFor(() => expect(panelEl.style.transform).toBe('translateY(calc(100% + (0px)))'));
    expect(addSvgElementFromJson).toBeCalledTimes(1);
    expect(getCurrentLayerName).not.toBeCalled();
    expect(mockGetLayerByName).not.toBeCalled();
    expect(mockGetData).not.toBeCalled();
    expect(mockImportSvgString).not.toBeCalled();
    expect(getSvgRealLocation).not.toBeCalled();
    expect(selectOnly).toBeCalledTimes(2);
    expect(selectOnly).toBeCalledWith([mockElement]);
    expect(setSvgElemPosition).not.toBeCalled();
    expect(setSvgElemSize).not.toBeCalled();
    expect(disassembleUse2Group).not.toBeCalled();
    expect(addCommandToHistory).toBeCalledTimes(1);
    expect(mockOnClose).toBeCalledTimes(1);
  });

  it('should import svg object, update location and disassemble', async () => {
    const { container, getByText } = render(<ShapePanel onClose={mockOnClose} />);
    const panelEl = container.querySelector('.adm-floating-panel') as HTMLElement;
    await waitFor(() => expect(panelEl.style.transform).toBe('translateY(calc(100% + (-627px)))'));
    expect(mockOnClose).not.toBeCalled();
    const graphicsTab = getByText('Graphics');
    fireEvent.click(graphicsTab);
    expect(graphicsTab).toHaveClass('adm-capsule-tabs-tab-active');
    const shapeIcons = container.querySelectorAll('.icon');
    expect(shapeIcons.length).toBe(1);
    fireEvent.click(shapeIcons[0]);
    await waitFor(() => expect(panelEl.style.transform).toBe('translateY(calc(100% + (0px)))'));
    expect(addSvgElementFromJson).not.toBeCalled();
    expect(getCurrentLayerName).toBeCalledTimes(1);
    expect(mockGetLayerByName).toBeCalledTimes(1);
    expect(mockGetData).toBeCalledTimes(1);
    expect(mockGetData).toBeCalledWith('mock-layer-elem', 'module');
    expect(mockImportSvgString).toBeCalledTimes(1);
    expect(getSvgRealLocation).toBeCalledTimes(1);
    expect(getSvgRealLocation).toBeCalledWith(mockElement);
    expect(selectOnly).toBeCalledTimes(1);
    expect(selectOnly).toBeCalledWith([mockElement]);
    expect(setSvgElemPosition).toBeCalledTimes(2);
    expect(setSvgElemPosition).toHaveBeenNthCalledWith(1, 'x', 0, mockElement, false);
    expect(setSvgElemPosition).toHaveBeenNthCalledWith(2, 'y', 0, mockElement, false);
    expect(setSvgElemSize).toBeCalledTimes(2);
    expect(setSvgElemSize).toHaveBeenNthCalledWith(1, 'width', 300);
    expect(setSvgElemSize).toHaveBeenNthCalledWith(2, 'height', 500);
    expect(disassembleUse2Group).toBeCalledTimes(1);
    expect(disassembleUse2Group).toHaveBeenNthCalledWith(1, [mockElement], true, false);
    expect(addCommandToHistory).toBeCalledTimes(1);
    expect(mockOnClose).toBeCalledTimes(1);
  });
});
