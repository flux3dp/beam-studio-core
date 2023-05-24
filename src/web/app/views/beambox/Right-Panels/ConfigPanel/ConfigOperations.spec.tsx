import React from 'react';
import { act, fireEvent, render } from '@testing-library/react';

import ConfigOperations from './ConfigOperations';

const mockImportLaserConfig = jest.fn();
jest.mock('helpers/svg-editor-helper', () => ({
  getSVGAsync: (callback) => (callback({
    Editor: {
      importLaserConfig: (...args) => mockImportLaserConfig(...args),
    },
  })),
}));

jest.mock('helpers/i18n', () => ({
  lang: {
    beambox: {
      right_panel: {
        laser_panel: {
          export_config: 'export_config',
        },
      },
    },
    topmenu: {
      file: {
        all_files: 'all_files',
      },
    },
  }
}));

jest.mock('helpers/useI18n', () => () => ({
  beambox: {
    right_panel: {
      laser_panel: {
        dropdown: {
          import: 'import',
          export: 'export',
          more: 'more',
        },
      },
    },
  },
}));

const mockGetFileFromDialog = jest.fn();
const mockWriteFileDialog = jest.fn();
jest.mock('implementations/dialog', () => ({
  getFileFromDialog: (...args) => mockGetFileFromDialog(...args),
  writeFileDialog: (...args) => mockWriteFileDialog(...args),
}));

const mockGet = jest.fn();
jest.mock('implementations/storage', () => ({
  get: (...args) => mockGet(...args),
}));

const mockOnMoreClick = jest.fn();

describe('test ConfigOperations', () => {
  it('should render correctly', () => {
    const { container } = render(<ConfigOperations onMoreClick={mockOnMoreClick} />);
    expect(container).toMatchSnapshot();
  });

  test('import config should work', async () => {
    const { container } = render(<ConfigOperations onMoreClick={mockOnMoreClick} />);
    const importButton = container.querySelectorAll('.button')[0];
    mockGetFileFromDialog.mockReturnValue('mock-blob');
    expect(mockGetFileFromDialog).not.toBeCalled();
    await act(async () => {
      fireEvent.click(importButton);
    });
    expect(mockGetFileFromDialog).toBeCalledTimes(1);
    expect(mockGetFileFromDialog).toHaveBeenLastCalledWith({
      filters: [{ name: 'JSON', extensions: ['json', 'JSON'] }],
    });
    expect(mockImportLaserConfig).toBeCalledTimes(1);
    expect(mockImportLaserConfig).toHaveBeenLastCalledWith('mock-blob');
  });

  test('export config should work', async () => {
    const { container } = render(<ConfigOperations onMoreClick={mockOnMoreClick} />);
    const exportButton = container.querySelectorAll('.button')[1];
    expect(mockWriteFileDialog).not.toBeCalled();
    await act(async () => {
      fireEvent.click(exportButton);
    });
    expect(mockWriteFileDialog).toBeCalledTimes(1);
    const getContent = mockWriteFileDialog.mock.calls[0][0];
    mockGet.mockReturnValueOnce('c').mockReturnValueOnce('d');
    expect(mockGet).not.toBeCalled();
    const content = getContent();
    expect(mockGet).toBeCalledTimes(2);
    expect(mockGet).toHaveBeenNthCalledWith(1, 'customizedLaserConfigs');
    expect(mockGet).toHaveBeenNthCalledWith(2, 'defaultLaserConfigsInUse');
    expect(content).toBe('{"customizedLaserConfigs":"c","defaultLaserConfigsInUse":"d"}');
  });

  test('more button should work', () => {
    const { container } = render(<ConfigOperations onMoreClick={mockOnMoreClick} />);
    const moreButton = container.querySelectorAll('.button')[2];
    expect(mockOnMoreClick).not.toBeCalled();
    fireEvent.click(moreButton);
    expect(mockOnMoreClick).toBeCalledTimes(1);
  });
});
