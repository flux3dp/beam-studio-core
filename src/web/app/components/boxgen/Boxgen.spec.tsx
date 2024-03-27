/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';

import { BoxgenContext } from 'app/contexts/BoxgenContext';

import Boxgen from './Boxgen';

jest.mock('helpers/useI18n', () => () => ({
  boxgen: {
    back: 'Back to Beam Studio',
    title: 'BOXGEN',
  },
}));

jest.mock('app/contexts/BoxgenContext', () => ({
  BoxgenContext: React.createContext({ onClose: () => {} }),
  BoxgenProvider: ({ onClose, children }: any) => (
    <BoxgenContext.Provider value={{ onClose } as any}>{children}</BoxgenContext.Provider>
  ),
}));

const mockUseIsMobile = jest.fn();
jest.mock('helpers/system-helper', () => ({
  useIsMobile: () => mockUseIsMobile(),
}));

jest.mock('./BoxCanvas', () => 'mock-canvas');
jest.mock('./BoxSelector', () => 'mock-box-selector');
jest.mock('./CanvasController', () => 'mock-canvas-controller');
jest.mock('./Controller', () => 'mock-box-controller');
jest.mock('./ExportButton', () => 'mock-export-button');

const mockOnClose = jest.fn();

describe('test Boxgen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should rendered correctly', () => {
    const { container } = render(<Boxgen onClose={mockOnClose} />);
    expect(container).toMatchSnapshot();
    const button = container.querySelector('.back');
    fireEvent.click(button);
    expect(mockOnClose).toBeCalledTimes(1);
  });

  test('should rendered correctly in mobile', () => {
    mockUseIsMobile.mockReturnValue(true);
    const { container } = render(<Boxgen onClose={mockOnClose} />);
    expect(container).toMatchSnapshot();
    const button = container.querySelector('.close-icon');
    fireEvent.click(button);
    waitFor(() => expect(mockOnClose).toBeCalledTimes(1));
  });
});
