/* eslint-disable import/first */
import React from 'react';
import { fireEvent, render } from '@testing-library/react';

const checkWebGL = jest.fn();
jest.mock('helpers/check-webgl', () => checkWebGL);

const getSVGAsync = jest.fn();
jest.mock('helpers/svg-editor-helper', () => ({
  getSVGAsync,
}));

const clearSelection = jest.fn();
getSVGAsync.mockImplementation((callback) => {
  callback({
    Canvas: {
      clearSelection,
    },
  });
});

jest.mock('helpers/useI18n', () => () => ({
  topbar: {
    task_preview: 'task_preview',
  },
}));

import PathPreviewButton from './PathPreviewButton';

const mockTogglePathPreview = jest.fn();

describe('test PathPreviewButton', () => {
  test('no WebGL', () => {
    checkWebGL.mockReturnValue(false);
    const { container } = render(
      <PathPreviewButton
        isPathPreviewing
        isDeviceConnected
        togglePathPreview={jest.fn()}
      />
    );
    expect(container).toMatchSnapshot();
  });

  describe('has WebGL', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      checkWebGL.mockReturnValue(true);
    });

    test('no devices connected in web version', () => {
      window.FLUX.version = 'web';
      const { container } = render(
        <PathPreviewButton
          isPathPreviewing
          isDeviceConnected={false}
          togglePathPreview={mockTogglePathPreview}
        />
      );
      expect(container).toMatchSnapshot();
    });

    test('no devices connected in desktop version', () => {
      window.FLUX.version = '1.2.3';
      const { container } = render(
        <PathPreviewButton
          isPathPreviewing
          isDeviceConnected={false}
          togglePathPreview={mockTogglePathPreview}
        />
      );
      fireEvent.click(container.querySelector('div.path-preview-button'));
      expect(mockTogglePathPreview).not.toHaveBeenCalled();
    });

    test('is path previewing with devices connected', () => {
      const { container } = render(
        <PathPreviewButton
          isPathPreviewing
          isDeviceConnected
          togglePathPreview={mockTogglePathPreview}
        />
      );
      fireEvent.click(container.querySelector('div.path-preview-button'));
      expect(clearSelection).not.toHaveBeenCalled();
      expect(mockTogglePathPreview).not.toHaveBeenCalled();
    });

    test('is not path previewing with devices connected', () => {
      const { container } = render(
        <PathPreviewButton
          isPathPreviewing={false}
          isDeviceConnected
          togglePathPreview={mockTogglePathPreview}
        />
      );
      fireEvent.click(container.querySelector('div.path-preview-button'));
      expect(clearSelection).toHaveBeenCalledTimes(1);
      expect(mockTogglePathPreview).toHaveBeenCalledTimes(1);
    });
  });
});
