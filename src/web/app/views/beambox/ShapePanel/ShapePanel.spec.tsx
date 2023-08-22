/* eslint-disable import/first */
import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';

import ShapePanel from './ShapePanel';

window.innerHeight = 667;
const mockElement = (
  <svg width="1em" height="1em" fill="currentColor" viewBox="0 0 50 50">
    mock-svg
  </svg>
);
const addSvgElementFromJson = jest.fn().mockReturnValue(mockElement);
const getSvgRealLocation = jest.fn().mockReturnValue({ x: 15, y: 10, width: 15, height: 25 });
const importSvgString = jest.fn().mockResolvedValue(mockElement);
const mockOnClose = jest.fn();
const selectOnly = jest.fn();
const setSvgElemPosition = jest.fn();
const setSvgElemSize = jest.fn();
const disassembleUse2Group = jest.fn();
jest.mock('helpers/svg-editor-helper', () => ({
  getSVGAsync: (callback) => callback({
    Canvas: {
      addSvgElementFromJson: (...args) => addSvgElementFromJson(...args),
      getNextId: jest.fn(),
      getSvgRealLocation: (...args) => getSvgRealLocation(...args),
      importSvgString: (...args) => importSvgString(...args),
      isUsingLayerColor: true,
      selectOnly: (...args) => selectOnly(...args),
      setSvgElemPosition: (...args) => setSvgElemPosition(...args),
      setSvgElemSize: (...args) => setSvgElemSize(...args),
      updateElementColor: jest.fn(),
      disassembleUse2Group: (...args) => disassembleUse2Group(...args),
    },
  }),
}));

jest.mock('app/constants/shape-panel-constants', () => ({
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
}));

jest.mock('app/icons/shape/ShapeIcon', () => ({
  Circle: () => mockElement,
  Minus: () => mockElement,
  Triangle: () => mockElement,
}));

describe('test ShapePanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    expect(getSvgRealLocation).not.toBeCalled();
    expect(importSvgString).not.toBeCalled();
    expect(selectOnly).toBeCalledTimes(2);
    expect(selectOnly).toBeCalledWith([mockElement]);
    expect(setSvgElemPosition).not.toBeCalled();
    expect(setSvgElemSize).not.toBeCalled();
    expect(disassembleUse2Group).not.toBeCalled();
    expect(mockOnClose).toBeCalledTimes(1);
  });

  it('should import svg object, update location and disassemble', async () => {
    const { container, getByText } = render(<ShapePanel onClose={mockOnClose} />);
    const panelEl = container.querySelector('.adm-floating-panel') as HTMLElement;
    await waitFor(() => expect(panelEl.style.transform).toBe('translateY(calc(100% + (-627px)))'));
    expect(mockOnClose).not.toBeCalled();
    const graphicsTab = getByText('graphics');
    fireEvent.click(graphicsTab);
    expect(graphicsTab).toHaveClass('adm-capsule-tabs-tab-active');
    const shapeIcons = container.querySelectorAll('.icon');
    expect(shapeIcons.length).toBe(1);
    fireEvent.click(shapeIcons[0]);
    await waitFor(() => expect(panelEl.style.transform).toBe('translateY(calc(100% + (0px)))'));
    expect(addSvgElementFromJson).not.toBeCalled();
    expect(getSvgRealLocation).toBeCalledTimes(1);
    expect(getSvgRealLocation).toBeCalledWith(mockElement);
    expect(importSvgString).toBeCalledTimes(1);
    expect(selectOnly).toBeCalledTimes(1);
    expect(selectOnly).toBeCalledWith([mockElement]);
    expect(setSvgElemPosition).toBeCalledTimes(2);
    expect(setSvgElemPosition).toHaveBeenNthCalledWith(1, 'x', 0);
    expect(setSvgElemPosition).toHaveBeenNthCalledWith(2, 'y', 0);
    expect(setSvgElemSize).toBeCalledTimes(2);
    expect(setSvgElemSize).toHaveBeenNthCalledWith(1, 'width', 300);
    expect(setSvgElemSize).toHaveBeenNthCalledWith(2, 'height', 500);
    expect(disassembleUse2Group).toBeCalledTimes(1);
    expect(disassembleUse2Group).toHaveBeenNthCalledWith(1, [mockElement], true);
    expect(mockOnClose).toBeCalledTimes(1);
  });
});
