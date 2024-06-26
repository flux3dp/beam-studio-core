/* eslint-disable import/first */
import React from 'react';
import { render } from '@testing-library/react';

jest.mock('helpers/useI18n', () => () => ({
  topbar: {
    untitled: 'Untitled',
  },
}));

const mockGetName = jest.fn();
const mockGetIsCloudFile = jest.fn();
jest.mock('app/svgedit/currentFileManager', () => ({
  __esModule: true,
  default: {
    get isCloudFile() {
      return mockGetIsCloudFile();
    },
    getName: () => mockGetName(),
  },
}));

import FileName from './FileName';

describe('test FileName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    mockGetIsCloudFile.mockReturnValue(false);
    mockGetName.mockReturnValue('abc');
    const { container, rerender } = render(<FileName hasUnsavedChange />);
    expect(container).toMatchSnapshot();

    mockGetName.mockReturnValue(null);
    rerender(<FileName hasUnsavedChange={false} />);
    expect(container).toMatchSnapshot();

    mockGetName.mockReturnValue(null);
    rerender(<FileName hasUnsavedChange={false} isTitle />);
    expect(container).toMatchSnapshot();
  });

  it('should render correctly with cloud file', () => {
    mockGetIsCloudFile.mockReturnValue(true);
    mockGetName.mockReturnValue('abc');
    const { container, rerender } = render(<FileName hasUnsavedChange />);
    expect(container).toMatchSnapshot();

    mockGetName.mockReturnValue(null);
    rerender(<FileName hasUnsavedChange={false} />);
    expect(container).toMatchSnapshot();

    mockGetName.mockReturnValue(null);
    rerender(<FileName hasUnsavedChange={false} isTitle />);
    expect(container).toMatchSnapshot();
  });
});
