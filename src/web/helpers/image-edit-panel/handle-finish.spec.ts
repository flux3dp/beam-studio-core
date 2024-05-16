import handleFinish from './handle-finish';

const mockBatchCommand = jest.fn();
jest.mock('app/svgedit/history/history', () => ({
  BatchCommand: function BatchCommand(...args) {
    return mockBatchCommand(...args);
  },
}));

const mockSelectOnly = jest.fn();
const mockBeginUndoableChange = jest.fn();
const mockFinishUndoableChange = jest.fn();
const mockAddCommandToHistory = jest.fn();
jest.mock('helpers/svg-editor-helper', () => ({
  getSVGAsync: (callback) => callback({
    Canvas: {
      selectOnly: (...args) => mockSelectOnly(...args),
      undoMgr: {
        beginUndoableChange: (...args) => mockBeginUndoableChange(...args),
        finishUndoableChange: (...args) => mockFinishUndoableChange(...args),
        addCommandToHistory: (...args) => mockAddCommandToHistory(...args),
      },
    },
  }),
}));

describe('test image-edit-panel/handle-finish', () => {
  it('should work', () => {
    const mockElement = {
      setAttribute: jest.fn(),
    };
    const mockBatchCommandInstance = {
      addSubCommand: jest.fn(),
    };
    const mockCmd = {
      isEmpty: jest.fn(),
    };
    mockBatchCommand.mockImplementationOnce(() => mockBatchCommandInstance);
    mockFinishUndoableChange.mockReturnValue(mockCmd);
    mockCmd.isEmpty.mockReturnValue(false);
    handleFinish(mockElement as unknown as SVGImageElement, 'mock-src', 'mock-base64', 100, 200);
    expect(mockBatchCommand).toBeCalledTimes(1);
    expect(mockBatchCommand).toHaveBeenLastCalledWith('Image Edit');
    expect(mockBeginUndoableChange).toBeCalledTimes(4);
    expect(mockBeginUndoableChange).toHaveBeenNthCalledWith(1, 'origImage', [mockElement]);
    expect(mockBeginUndoableChange).toHaveBeenNthCalledWith(2, 'xlink:href', [mockElement]);
    expect(mockBeginUndoableChange).toHaveBeenNthCalledWith(3, 'width', [mockElement]);
    expect(mockBeginUndoableChange).toHaveBeenNthCalledWith(4, 'height', [mockElement]);
    expect(mockElement.setAttribute).toBeCalledTimes(4);
    expect(mockElement.setAttribute).toHaveBeenNthCalledWith(1, 'origImage', 'mock-src');
    expect(mockElement.setAttribute).toHaveBeenNthCalledWith(2, 'xlink:href', 'mock-base64');
    expect(mockElement.setAttribute).toHaveBeenNthCalledWith(3, 'width', 100);
    expect(mockElement.setAttribute).toHaveBeenNthCalledWith(4, 'height', 200);
    expect(mockFinishUndoableChange).toBeCalledTimes(4);
    expect(mockCmd.isEmpty).toBeCalledTimes(4);
    expect(mockBatchCommandInstance.addSubCommand).toBeCalledTimes(4);
    expect(mockBatchCommandInstance.addSubCommand).toHaveBeenLastCalledWith(mockCmd);
    expect(mockAddCommandToHistory).toBeCalledTimes(1);
    expect(mockAddCommandToHistory).toHaveBeenLastCalledWith(mockBatchCommandInstance);
    expect(mockSelectOnly).toBeCalledTimes(1);
    expect(mockSelectOnly).toHaveBeenLastCalledWith([mockElement], true);
  });
});
