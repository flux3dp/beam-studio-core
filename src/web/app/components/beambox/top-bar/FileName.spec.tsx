/* eslint-disable import/first */
import React from 'react';
import { render } from '@testing-library/react';

jest.mock('helpers/useI18n', () => () => ({
  topbar: {
    untitled: 'Untitled',
  },
}));

const mockGetIsCloudFile = jest.fn();
jest.mock('app/svgedit/currentFileManager', () => ({
  __esModule: true,
  default: {
    get isCloudFile() {
      return mockGetIsCloudFile();
    },
  },
}));

import FileName from './FileName';

describe('test FileName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    mockGetIsCloudFile.mockReturnValue(false);
    const { container, rerender } = render(<FileName fileName="abc.svg" hasUnsavedChange />);
    expect(container).toMatchSnapshot();

    rerender(<FileName fileName="" hasUnsavedChange={false} />);
    expect(container).toMatchSnapshot();

    rerender(<FileName fileName="" hasUnsavedChange={false} isTitle />);
    expect(container).toMatchSnapshot();
  });

  it('should render correctly with cloud file', () => {
    mockGetIsCloudFile.mockReturnValue(true);
    const { container, rerender } = render(<FileName fileName="abc.svg" hasUnsavedChange />);
    expect(container).toMatchSnapshot();

    rerender(<FileName fileName="" hasUnsavedChange={false} />);
    expect(container).toMatchSnapshot();

    rerender(<FileName fileName="" hasUnsavedChange={false} isTitle />);
    expect(container).toMatchSnapshot();
  });
});
