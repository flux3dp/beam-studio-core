/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';

import { IFile } from 'interfaces/IMyCloud';
import { MyCloudContext } from 'app/contexts/MyCloudContext';

import MyCloud from './MyCloud';

const mockFiles: IFile[] = [
  {
    uuid: 'mock-uuid-1111',
    name: 'File name',
    size: 5788,
    thumbnail_url: 'https://s3/url',
    workarea: 'fhexa1',
    created_at: '2024-01-09T04:14:36.801586Z',
    last_modified_at: '2024-01-09T06:42:04.824942Z',
  },
  {
    uuid: 'mock-uuid-2222',
    name: 'Another file',
    size: 5678,
    thumbnail_url: 'https://s3/url2',
    workarea: 'ado1',
    created_at: '2024-01-12T08:46:54.904853Z',
    last_modified_at: '2024-01-16T04:11:44.903500Z',
  },
];

jest.mock('helpers/useI18n', () => () => ({
  flux_id_login: {
    flux_plus: {
      website_url: 'https://website_url',
    },
  },
  my_cloud: {
    title: 'My Cloud',
    loading_file: 'Loading...',
    no_file_title: 'Save files to My Cloud to get started.',
    no_file_subtitle: 'Go to Menu > "File" > "Save to Cloud"',
  },
}));

jest.mock('app/contexts/MyCloudContext', () => ({
  MyCloudContext: React.createContext({}),
  MyCloudProvider: ({ onClose, children }: any) => (
    <MyCloudContext.Provider value={{ onClose, files: mockFiles } as any}>
      {children}
    </MyCloudContext.Provider>
  ),
}));

const mockUseIsMobile = jest.fn();
jest.mock('helpers/system-helper', () => ({
  useIsMobile: () => mockUseIsMobile(),
}));

jest.mock('./GridFile', () => ({ file }: any) => <div>Mock Grid File: {JSON.stringify(file)}</div>);
jest.mock('./Head', () => 'mock-head');

const mockOnClose = jest.fn();

describe('test MyCloud', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should rendered correctly', () => {
    const { baseElement } = render(<MyCloud onClose={mockOnClose} />);
    expect(baseElement).toMatchSnapshot();
    const upgradeButton = baseElement.querySelector('.button');
    fireEvent.click(upgradeButton);
    expect(open).toBeCalledTimes(1);
    expect(open).toBeCalledWith('https://website_url');
    const closeButton = baseElement.querySelector('.ant-modal-close');
    fireEvent.click(closeButton);
    expect(mockOnClose).toBeCalledTimes(1);
  });

  test('should rendered correctly in mobile', () => {
    mockUseIsMobile.mockReturnValue(true);
    const { container } = render(<MyCloud onClose={mockOnClose} />);
    expect(container).toMatchSnapshot();
    const button = container.querySelector('.close-icon');
    fireEvent.click(button);
    waitFor(() => expect(mockOnClose).toBeCalledTimes(1));
  });
});
