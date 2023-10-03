import React from 'react';
import { render } from '@testing-library/react';

import FileName from './FileName';

const mockUseIsMobile = jest.fn();
jest.mock('helpers/system-helper', () => ({
  useIsMobile: (...args) => mockUseIsMobile(...args),
}));

jest.mock('helpers/i18n', () => ({
  lang: {
    topbar: {
      untitled: 'Untitled',
    },
  },
}));

describe('test FileName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    mockUseIsMobile.mockReturnValue(false);
    const { container } = render(<FileName
      fileName="abc.svg"
      hasUnsavedChange
    />);
    expect(container).toMatchSnapshot();

    const { container: container2 } = render(<FileName
      fileName=""
      hasUnsavedChange={false}
    />);
    expect(container2).toMatchSnapshot();
  });

  it('should hide on windows', () => {
    mockUseIsMobile.mockReturnValue(false);
    window.os = 'Windows';
    const { container } = render(<FileName
      fileName="abc.svg"
      hasUnsavedChange
    />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should hide on mobile', () => {
    mockUseIsMobile.mockReturnValue(true);
    const { container } = render(<FileName
      fileName="abc.svg"
      hasUnsavedChange
    />);
    expect(container).toBeEmptyDOMElement();
  });
});
