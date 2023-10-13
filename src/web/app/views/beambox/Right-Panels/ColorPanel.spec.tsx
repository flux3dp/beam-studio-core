/* eslint-disable @typescript-eslint/no-explicit-any */ // for mocking props
import React from 'react';
import { act, fireEvent, render } from '@testing-library/react';

import ColorPanel from './ColorPanel';

jest.mock('app/widgets/ColorPicker', () => ({ allowClear, initColor, triggerType, onChange }: any) => (
  <div>
    Mock ColorPicker
    <p>allowClear: {allowClear ? 't' : 'f'}</p>
    <p>initColor: {initColor}</p>
    <p>triggerType: {triggerType}</p>
    <button type="button" onClick={() => onChange('#aaaaff')}>onChange</button>
  </div>
))

jest.mock('app/actions/beambox/constant', () => ({
  dpmm: 10,
}));

const mockCreateBatchCommand = jest.fn();
jest.mock('app/svgedit/HistoryCommandFactory', () => ({
  createBatchCommand: (...args) => mockCreateBatchCommand(...args),
}));
const mockAddSubCommand = jest.fn();
const mockBatchCommand = {
  addSubCommand: (...args) => mockAddSubCommand(...args),
};

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
    const { getAllByText } = render(<ColorPanel elem={mockElem as any} />);
    const mockCmd1 = { id: '1', isEmpty: () => false };
    const mockCmd2 = { id: '2', isEmpty: () => false };
    mockFinishUndoableChange.mockReturnValueOnce(mockCmd1).mockReturnValueOnce(mockCmd2);
    const changeFillBtn = getAllByText('onChange')[0];
    act(() => {
      fireEvent.click(changeFillBtn);
    });
    expect(mockCreateBatchCommand).toBeCalledTimes(1);
    expect(mockCreateBatchCommand).toHaveBeenNthCalledWith(1, 'Color Panel Fill');
    expect(mockBeginUndoableChange).toBeCalledTimes(2);
    expect(mockBeginUndoableChange).toHaveBeenNthCalledWith(1, 'fill', [mockElem]);
    expect(mockBeginUndoableChange).toHaveBeenNthCalledWith(2, 'fill-opacity', [mockElem]);
    expect(mockChangeSelectedAttributeNoUndo).toHaveBeenCalledTimes(2);
    expect(mockChangeSelectedAttributeNoUndo).toHaveBeenNthCalledWith(1, 'fill', '#aaaaff', [
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

  test('set stroke color should work', () => {
    const { getAllByText } = render(<ColorPanel elem={mockElem as any} />);
    expect(mockChangeSelectedAttribute).not.toHaveBeenCalled();
    const changeFillBtn = getAllByText('onChange')[1];
    act(() => {
      fireEvent.click(changeFillBtn);
    });
    expect(mockChangeSelectedAttribute).toHaveBeenCalledTimes(1);
    expect(mockChangeSelectedAttribute).toHaveBeenNthCalledWith(1, 'stroke', '#aaaaff', [mockElem]);
  });
});
