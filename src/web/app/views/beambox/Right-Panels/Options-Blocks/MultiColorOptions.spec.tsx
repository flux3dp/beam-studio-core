import React from 'react';
import { act, fireEvent, render } from '@testing-library/react';

import MultiColorOptions from './MultiColorOptions';

jest.mock(
  'app/widgets/ColorPicker',
  () =>
    ({ allowClear, initColor, triggerType, onChange }: any) =>
      (
        <div>
          Mock ColorPicker
          <p>allowClear: {allowClear ? 't' : 'f'}</p>
          <p>initColor: {initColor}</p>
          <p>triggerType: {triggerType}</p>
          <button type="button" onClick={() => onChange('#AAAAFF')}>
            onChange
          </button>
        </div>
      )
);

const mockColloectColors = jest.fn();
jest.mock(
  'helpers/color/collectColors',
  () =>
    (...args) =>
      mockColloectColors(...args)
);

const mockCreateBatchCommand = jest.fn();
jest.mock('app/svgedit/HistoryCommandFactory', () => ({
  createBatchCommand: (...args) => mockCreateBatchCommand(...args),
}));

const mockAddSubCommand = jest.fn();
const mockBatchCommand = {
  addSubCommand: (...args) => mockAddSubCommand(...args),
  isEmpty: () => false,
};

const mockReRenderImageSymbol = jest.fn();
jest.mock('helpers/symbol-maker', () => ({
  reRenderImageSymbol: (...args) => mockReRenderImageSymbol(...args),
}));

const mockChangeSelectedAttributeNoUndo = jest.fn();
const mockBeginUndoableChange = jest.fn();
const mockFinishUndoableChange = jest.fn();
const mockAddCommandToHistory = jest.fn();
jest.mock('helpers/svg-editor-helper', () => ({
  getSVGAsync: (callback) => {
    callback({
      Canvas: {
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

jest.mock('app/widgets/HorizontalScrollContainer', () => ({ className, children }: any) => (
  <div className={className}>{children}</div>
));

describe('test MultiColorOptions', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockColloectColors.mockReturnValue({
      '#AAFFFF': [{ element: '1', attribute: 'fill' }],
      '#FFAAFF': [
        { element: '2', attribute: 'fill' },
        { element: '3', attribute: 'stroke' },
      ],
    });
    mockCreateBatchCommand.mockReturnValue(mockBatchCommand);
  });

  it('should render correctly', () => {
    const { container } = render(<MultiColorOptions elem={document.createElement('rect')} />);
    expect(container).toMatchSnapshot();
  });

  test('editing color in use element should work', async () => {
    const { getByText, getAllByText } = render(
      <MultiColorOptions elem={document.createElement('use')} />
    );
    const mockChangeCmd = { isEmpty: () => false };
    mockColloectColors.mockReturnValue({
      '#AAFFFF': [{ element: '1', attribute: 'fill' }],
      '#AAAAFF': [
        { element: '2', attribute: 'fill' },
        { element: '3', attribute: 'stroke' },
      ],
    });
    mockFinishUndoableChange.mockReturnValue(mockChangeCmd);
    await act(async () => {
      fireEvent.click(getAllByText('onChange')[1]);
    });
    expect(mockCreateBatchCommand).toBeCalledTimes(1);
    expect(mockCreateBatchCommand).toHaveBeenLastCalledWith('Update Color');
    expect(mockBeginUndoableChange).toBeCalledTimes(2);
    expect(mockBeginUndoableChange).toHaveBeenNthCalledWith(1, 'fill', ['2']);
    expect(mockBeginUndoableChange).toHaveBeenNthCalledWith(2, 'stroke', ['3']);
    expect(mockChangeSelectedAttributeNoUndo).toHaveBeenCalledTimes(2);
    expect(mockChangeSelectedAttributeNoUndo).toHaveBeenNthCalledWith(1, 'fill', '#AAAAFF', ['2']);
    expect(mockChangeSelectedAttributeNoUndo).toHaveBeenNthCalledWith(2, 'stroke', '#AAAAFF', [
      '3',
    ]);
    expect(mockFinishUndoableChange).toHaveBeenCalledTimes(2);
    expect(mockAddSubCommand).toBeCalledTimes(2);
    expect(mockAddSubCommand).toHaveBeenNthCalledWith(1, mockChangeCmd);
    expect(mockAddSubCommand).toHaveBeenNthCalledWith(2, mockChangeCmd);
    expect(mockAddCommandToHistory).toBeCalledTimes(1);
    expect(mockAddCommandToHistory).toHaveBeenLastCalledWith(mockBatchCommand);
    expect(mockReRenderImageSymbol).toBeCalledTimes(1);
    expect(mockReRenderImageSymbol).toHaveBeenLastCalledWith(expect.anything(), { force: true });
    expect(getByText('initColor: #AAAAFF')).toMatchSnapshot();
  });
});
