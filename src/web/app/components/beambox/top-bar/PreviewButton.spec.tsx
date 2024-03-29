/* eslint-disable import/first */
import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import { CanvasContext } from 'app/contexts/CanvasContext';

import PreviewButton from './PreviewButton';

const getNextStepRequirement = jest.fn();
const handleNextStep = jest.fn();
jest.mock('app/views/tutorials/tutorialController', () => ({
  getNextStepRequirement: (...args) => getNextStepRequirement(...args),
  handleNextStep: (...args) => handleNextStep(...args),
}));

const read = jest.fn();
jest.mock('app/actions/beambox/beambox-preference', () => ({
  read: (...args) => read(...args),
}));

jest.mock('helpers/useI18n', () => () => ({
  topbar: {
    preview: 'PREVIEW',
    borderless: '(OPEN BOTTOM)',
    preview_title: 'preview_title',
  },
}));

jest.mock('app/constants/tutorial-constants', () => ({
  TO_PREVIEW_MODE: 'TO_PREVIEW_MODE',
}));

const setMode = jest.fn();
jest.mock('helpers/svg-editor-helper', () => ({
  getSVGAsync: (callback) => callback({
    Canvas: {
      setMode: (...args) => setMode(...args),
    },
  }),
}));

const mockSetupPreviewMode = jest.fn();
const mockChangeToPreviewMode = jest.fn();
jest.mock('app/contexts/CanvasContext', () => ({
  CanvasContext: React.createContext({
    isPreviewing: false,
    isPathPreviewing: false,
    changeToPreviewMode: (...args) => mockChangeToPreviewMode(...args),
  }),
}));

describe('test PreviewButton', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('when path previewing', () => {
    const { container } = render(
      <CanvasContext.Provider
        value={
          {
            isPreviewing: false,
            isPathPreviewing: true,
            changeToPreviewMode: mockChangeToPreviewMode,
            setupPreviewMode: mockSetupPreviewMode,
          } as any
        }
      >
        <PreviewButton />
      </CanvasContext.Provider>
    );
    expect(container).toMatchSnapshot();
  });

  test('when previewing and support borderless', () => {
    read.mockReturnValueOnce(true).mockReturnValueOnce('fbm1');
    const { container } = render(
      <CanvasContext.Provider
        value={
          {
            isPreviewing: true,
            isPathPreviewing: false,
            changeToPreviewMode: mockChangeToPreviewMode,
            setupPreviewMode: mockSetupPreviewMode,
          } as any
        }
      >
        <PreviewButton />
      </CanvasContext.Provider>
    );
    expect(container).toMatchSnapshot();
  });

  test('when previewing and not support borderless', () => {
    read.mockReturnValueOnce(false).mockReturnValueOnce('fbm1');
    const { container } = render(
      <CanvasContext.Provider
        value={
          {
            isPreviewing: true,
            isPathPreviewing: false,
            changeToPreviewMode: mockChangeToPreviewMode,
            setupPreviewMode: mockSetupPreviewMode,
          } as any
        }
      >
        <PreviewButton />
      </CanvasContext.Provider>
    );
    expect(container).toMatchSnapshot();
  });

  test('when not previewing', () => {
    const { container } = render(
      <CanvasContext.Provider
        value={
          {
            isPreviewing: false,
            isPathPreviewing: false,
            changeToPreviewMode: mockChangeToPreviewMode,
            setupPreviewMode: mockSetupPreviewMode,
          } as any
        }
      >
        <PreviewButton />
      </CanvasContext.Provider>
    );
    expect(container).toMatchSnapshot();

    fireEvent.click(container.querySelector('div[class*="button"]'));
    expect(mockSetupPreviewMode).toHaveBeenCalledTimes(1);
  });
});
