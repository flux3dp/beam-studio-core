import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import { CanvasContext } from 'app/contexts/CanvasContext';

import SelectMachineButton from './SelectMachineButton';

jest.mock('helpers/useI18n', () => () => ({
  topbar: {
    select_machine: 'Select a machine',
  },
}));

const mockSetupPreviewMode = jest.fn();
jest.mock('app/contexts/CanvasContext', () => ({
  CanvasContext: React.createContext({
    isPreviewing: false,
    selectedDevice: null,
    setupPreviewMode: (...args) => mockSetupPreviewMode(...args),
  }),
}));

const useIsMobile = jest.fn();
jest.mock('helpers/system-helper', () => ({
  useIsMobile: () => useIsMobile(),
}));

const mockGetDevice = jest.fn();
jest.mock(
  'helpers/device/get-device',
  () =>
    (...args) =>
      mockGetDevice(...args)
);

describe('test SelectMachineButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useIsMobile.mockReturnValue(false);
  });

  test('should render correctly', () => {
    const { container } = render(
      <CanvasContext.Provider
        value={
          {
            isPreviewing: false,
            selectedDevice: null,
            setupPreviewMode: mockSetupPreviewMode,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any
        }
      >
        <SelectMachineButton />
      </CanvasContext.Provider>
    );
    expect(container).toMatchSnapshot();
    fireEvent.click(container.querySelector('div[class*="button"]'));
    expect(mockGetDevice).toBeCalledTimes(1);
    expect(mockSetupPreviewMode).toBeCalledTimes(0);
  });

  test('mobile', () => {
    useIsMobile.mockReturnValue(true);
    const { container } = render(
      <CanvasContext.Provider
        value={
          {
            isPreviewing: false,
            selectedDevice: null,
            setupPreviewMode: mockSetupPreviewMode,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any
        }
      >
        <SelectMachineButton />
      </CanvasContext.Provider>
    );
    expect(container).toMatchSnapshot();
    fireEvent.click(container.querySelector('div[class*="button"]'));
    expect(mockGetDevice).toBeCalledTimes(1);
    expect(mockSetupPreviewMode).toBeCalledTimes(0);
  });

  test('with device', () => {
    const { container } = render(
      <CanvasContext.Provider
        value={
          {
            isPreviewing: false,
            selectedDevice: { model: 'fbm1', name: 'device name' },
            setupPreviewMode: mockSetupPreviewMode,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any
        }
      >
        <SelectMachineButton />
      </CanvasContext.Provider>
    );
    expect(container).toMatchSnapshot();
    fireEvent.click(container.querySelector('div[class*="button"]'));
    expect(mockGetDevice).toBeCalledTimes(1);
    expect(mockSetupPreviewMode).toBeCalledTimes(0);
  });

  test('when previewing', () => {
    const { container } = render(
      <CanvasContext.Provider
        value={
          {
            isPreviewing: true,
            selectedDevice: null,
            setupPreviewMode: mockSetupPreviewMode,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any
        }
      >
        <SelectMachineButton />
      </CanvasContext.Provider>
    );
    expect(container).toMatchSnapshot();
    fireEvent.click(container.querySelector('div[class*="button"]'));
    expect(mockGetDevice).toBeCalledTimes(0);
    expect(mockSetupPreviewMode).toBeCalledTimes(1);
  });
});
