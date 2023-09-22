import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import ColorPanel from './ColorPanel';

jest.mock('app/actions/beambox/constant', () => ({
  dpmm: 10,
}));

const mockShowColorPicker = jest.fn();
jest.mock('app/actions/dialog-caller', () => ({
  showColorPicker: (...args) => mockShowColorPicker(...args),
}));

const mockCreateBatchCommand = jest.fn();
jest.mock('app/svgedit/HistoryCommandFactory', () => ({
  createBatchCommand: (...args) => mockCreateBatchCommand(...args),
}));
const mockAddSubCommand = jest.fn();
const mockBatchCommand = {
  addSubCommand: (...args) => mockAddSubCommand(...args),
};

jest.mock(
  'app/widgets/Unit-Input-v2',
  () =>
    ({
      id,
      defaultValue,
      getValue,
    }: {
      id: string;
      defaultValue: number;
      getValue: (val: number) => void;
    }) =>
      (
        <div>
          <input
            id={id}
            data-testid={id}
            type="number"
            value={defaultValue}
            onChange={(e) => getValue(parseFloat(e.target.value))}
          />
        </div>
      )
);

const mockGet = jest.fn();
jest.mock('implementations/storage', () => ({
  get: (...args) => mockGet(...args),
}));

const mockDeleteElements = jest.fn();
jest.mock('app/svgedit/operations/delete', () => ({
  deleteElements: (...args) => mockDeleteElements(...args),
}));

const mockChangeSelectedAttribute = jest.fn();
const mockChangeSelectedAttributeNoUndo = jest.fn();
const mockBeginUndoableChange = jest.fn();
const mockFinishUndoableChange = jest.fn();
const mockAddCommandToHistory = jest.fn();
jest.mock('helpers/svg-editor-helper', () => ({
  getSVGAsync: (callback) => {
    callback({
      Canvas: {
        changeSelectedAttribute: (...args) => mockChangeSelectedAttribute(...args),
        changeSelectedAttributeNoUndo: (...args) => mockChangeSelectedAttributeNoUndo(...args),
        undoMgr: {
          beginUndoableChange: (...args) => mockBeginUndoableChange(...args),
          finishUndoableChange: (...args) => mockFinishUndoableChange(...args),
          addCommandToHistory: (...args) => mockAddCommandToHistory(...args),
        },
      },
    });
  },
}));

const mockElem = {
  getAttribute: jest.fn(),
};

describe('test ColorPanel', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockElem.getAttribute
      .mockReturnValueOnce('#ff0000')
      .mockReturnValueOnce('#00ff00')
      .mockReturnValueOnce('1');
    mockGet.mockReturnValueOnce('mm');
    mockCreateBatchCommand.mockReturnValue(mockBatchCommand);
  });

  it('should render correctly', () => {
    const { container } = render(<ColorPanel elem={mockElem as any} />);
    expect(container).toMatchSnapshot();
    expect(mockElem.getAttribute).toHaveBeenCalledTimes(3);
    expect(mockElem.getAttribute).toHaveBeenNthCalledWith(1, 'fill');
    expect(mockElem.getAttribute).toHaveBeenNthCalledWith(2, 'stroke');
    expect(mockElem.getAttribute).toHaveBeenNthCalledWith(3, 'stroke-width');
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenNthCalledWith(1, 'default-units');
  });

  test('set stroke width should work', () => {
    const { container } = render(<ColorPanel elem={mockElem as any} />);
    const input = container.querySelector('#stroke-width');
    fireEvent.change(input, { target: { value: '2' } });
    expect(mockChangeSelectedAttribute).toHaveBeenCalledTimes(1);
    expect(mockChangeSelectedAttribute).toHaveBeenNthCalledWith(1, 'stroke-width', 20, [mockElem]);
    expect(container).toMatchSnapshot();
  });

  test('set fill color should work', () => {
    const { container } = render(<ColorPanel elem={mockElem as any} />);
    expect(mockShowColorPicker).not.toHaveBeenCalled();
    const fillBlock = container.querySelectorAll('.color')[0];
    fireEvent.click(fillBlock);
    expect(mockShowColorPicker).toHaveBeenCalledTimes(1);
    const opts = mockShowColorPicker.mock.calls[0][0];
    const { originalColor, allowNone, onNewColor } = opts;
    expect(originalColor).toBe('#ff0000');
    expect(allowNone).toBe(true);
    const mockCmd1 = { id: '1', isEmpty: () => false };
    const mockCmd2 = { id: '2', isEmpty: () => false };
    mockFinishUndoableChange.mockReturnValueOnce(mockCmd1).mockReturnValueOnce(mockCmd2);
    onNewColor('#0000ff');
    expect(mockCreateBatchCommand).toBeCalledTimes(1);
    expect(mockCreateBatchCommand).toHaveBeenNthCalledWith(1, 'Color Panel Fill');
    expect(mockBeginUndoableChange).toBeCalledTimes(2);
    expect(mockBeginUndoableChange).toHaveBeenNthCalledWith(1, 'fill', [mockElem]);
    expect(mockBeginUndoableChange).toHaveBeenNthCalledWith(2, 'fill-opacity', [mockElem]);
    expect(mockChangeSelectedAttributeNoUndo).toHaveBeenCalledTimes(2);
    expect(mockChangeSelectedAttributeNoUndo).toHaveBeenNthCalledWith(1, 'fill', '#0000ff', [
      mockElem,
    ]);
    expect(mockChangeSelectedAttributeNoUndo).toHaveBeenNthCalledWith(2, 'fill-opacity', '1', [
      mockElem,
    ]);
    expect(mockFinishUndoableChange).toHaveBeenCalledTimes(2);
    expect(mockAddSubCommand).toBeCalledTimes(2);
    expect(mockAddSubCommand).toHaveBeenNthCalledWith(1, mockCmd1);
    expect(mockAddSubCommand).toHaveBeenNthCalledWith(2, mockCmd2);
    expect(mockAddCommandToHistory).toBeCalledTimes(1);
    expect(mockAddCommandToHistory).toHaveBeenNthCalledWith(1, mockBatchCommand);
  });

  test('set fill color to none should work', () => {
    const { container } = render(<ColorPanel elem={mockElem as any} />);
    expect(mockShowColorPicker).not.toHaveBeenCalled();
    const fillBlock = container.querySelectorAll('.color')[0];
    fireEvent.click(fillBlock);
    expect(mockShowColorPicker).toHaveBeenCalledTimes(1);
    const opts = mockShowColorPicker.mock.calls[0][0];
    const { originalColor, allowNone, onNewColor } = opts;
    expect(originalColor).toBe('#ff0000');
    expect(allowNone).toBe(true);
    const mockCmd1 = { id: '1', isEmpty: () => false };
    const mockCmd2 = { id: '2', isEmpty: () => false };
    mockFinishUndoableChange.mockReturnValueOnce(mockCmd1).mockReturnValueOnce(mockCmd2);
    onNewColor('none');
    expect(mockCreateBatchCommand).toBeCalledTimes(1);
    expect(mockCreateBatchCommand).toHaveBeenNthCalledWith(1, 'Color Panel Fill');
    expect(mockBeginUndoableChange).toBeCalledTimes(2);
    expect(mockBeginUndoableChange).toHaveBeenNthCalledWith(1, 'fill', [mockElem]);
    expect(mockBeginUndoableChange).toHaveBeenNthCalledWith(2, 'fill-opacity', [mockElem]);
    expect(mockChangeSelectedAttributeNoUndo).toHaveBeenCalledTimes(2);
    expect(mockChangeSelectedAttributeNoUndo).toHaveBeenNthCalledWith(1, 'fill', 'none', [
      mockElem,
    ]);
    expect(mockChangeSelectedAttributeNoUndo).toHaveBeenNthCalledWith(2, 'fill-opacity', '0', [
      mockElem,
    ]);
    expect(mockFinishUndoableChange).toHaveBeenCalledTimes(2);
    expect(mockAddSubCommand).toBeCalledTimes(2);
    expect(mockAddSubCommand).toHaveBeenNthCalledWith(1, mockCmd1);
    expect(mockAddSubCommand).toHaveBeenNthCalledWith(2, mockCmd2);
    expect(mockAddCommandToHistory).toBeCalledTimes(1);
    expect(mockAddCommandToHistory).toHaveBeenNthCalledWith(1, mockBatchCommand);
    expect(container).toMatchSnapshot();
  });

  test('set fill to none when stroke is none should delete element', () => {
    mockElem.getAttribute
      .mockReset()
      .mockReturnValueOnce('#ff0000')
      .mockReturnValueOnce('none')
      .mockReturnValueOnce('1');
    const { container } = render(<ColorPanel elem={mockElem as any} />);
    expect(mockShowColorPicker).not.toHaveBeenCalled();
    const fillBlock = container.querySelectorAll('.color')[0];
    fireEvent.click(fillBlock);
    expect(mockShowColorPicker).toHaveBeenCalledTimes(1);
    const opts = mockShowColorPicker.mock.calls[0][0];
    const { originalColor, allowNone, onNewColor } = opts;
    expect(originalColor).toBe('#ff0000');
    expect(allowNone).toBe(true);
    expect(mockDeleteElements).not.toHaveBeenCalled();
    onNewColor('none');
    expect(mockDeleteElements).toHaveBeenCalledTimes(1);
    expect(mockDeleteElements).toHaveBeenNthCalledWith(1, [mockElem]);
  });

  test('set stroke color should work', () => {
    const { container } = render(<ColorPanel elem={mockElem as any} />);
    expect(mockShowColorPicker).not.toHaveBeenCalled();
    const strokeBlock = container.querySelectorAll('.color')[1];
    fireEvent.click(strokeBlock);
    expect(mockShowColorPicker).toHaveBeenCalledTimes(1);
    const opts = mockShowColorPicker.mock.calls[0][0];
    const { originalColor, allowNone, onNewColor } = opts;
    expect(originalColor).toBe('#00ff00');
    expect(allowNone).toBe(true);
    expect(mockChangeSelectedAttribute).not.toHaveBeenCalled();
    onNewColor('#aaaaff');
    expect(mockChangeSelectedAttribute).toHaveBeenCalledTimes(1);
    expect(mockChangeSelectedAttribute).toHaveBeenNthCalledWith(1, 'stroke', '#aaaaff', [mockElem]);
  });

  test('set stroke color to none when fill is none should delete element', () => {
    mockElem.getAttribute
      .mockReset()
      .mockReturnValueOnce('none')
      .mockReturnValueOnce('#00ff00')
      .mockReturnValueOnce('1');
    const { container } = render(<ColorPanel elem={mockElem as any} />);
    expect(mockShowColorPicker).not.toHaveBeenCalled();
    const strokeBlock = container.querySelectorAll('.color')[1];
    fireEvent.click(strokeBlock);
    expect(mockShowColorPicker).toHaveBeenCalledTimes(1);
    const opts = mockShowColorPicker.mock.calls[0][0];
    const { originalColor, allowNone, onNewColor } = opts;
    expect(originalColor).toBe('#00ff00');
    expect(allowNone).toBe(true);
    expect(mockDeleteElements).not.toHaveBeenCalled();
    onNewColor('none');
    expect(mockDeleteElements).toHaveBeenCalledTimes(1);
    expect(mockDeleteElements).toHaveBeenNthCalledWith(1, [mockElem]);
  });
});
