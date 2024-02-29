/* eslint-disable import/first */
import React from 'react';
import { render } from '@testing-library/react';

jest.mock('helpers/useI18n', () => () => ({
  topbar: {
    untitled: 'Untitled',
  },
}));

const mockSvgCanvas = { currentFilePath: '/local/file' };
jest.mock('helpers/svg-editor-helper', () => ({
  getSVGAsync: (callback) =>
    callback({
      Canvas: mockSvgCanvas,
    }),
}));

import FileName from './FileName';

describe('test FileName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    const { container, rerender } = render(<FileName fileName="abc.svg" hasUnsavedChange />);
    expect(container).toMatchSnapshot();

    rerender(<FileName fileName="" hasUnsavedChange={false} />);
    expect(container).toMatchSnapshot();

    rerender(<FileName fileName="" hasUnsavedChange={false} isTitle />);
    expect(container).toMatchSnapshot();
  });

  it('should render correctly with cloud file', () => {
    mockSvgCanvas.currentFilePath = 'cloud:uuid';
    const { container, rerender } = render(<FileName fileName="abc.svg" hasUnsavedChange />);
    expect(container).toMatchSnapshot();

    rerender(<FileName fileName="" hasUnsavedChange={false} />);
    expect(container).toMatchSnapshot();

    rerender(<FileName fileName="" hasUnsavedChange={false} isTitle />);
    expect(container).toMatchSnapshot();
  });
});
