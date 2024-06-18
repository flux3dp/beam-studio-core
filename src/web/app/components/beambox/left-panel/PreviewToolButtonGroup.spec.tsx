/* eslint-disable import/first */
import React from 'react';
import { render } from '@testing-library/react';

const emitShowCropper = jest.fn();
jest.mock('app/stores/beambox-store', () => ({
  emitShowCropper,
}));

const isClean = jest.fn();
const resetCoordinates = jest.fn();
const clear = jest.fn();
jest.mock('app/actions/beambox/preview-mode-background-drawer', () => ({
  isClean,
  resetCoordinates,
  clear,
}));

const isPreviewMode = jest.fn();
const mockIsLiveModeOn = jest.fn();
jest.mock('app/actions/beambox/preview-mode-controller', () => ({
  isDrawing: false,
  isPreviewMode,
  isLiveModeOn: () => mockIsLiveModeOn(),
}));

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

const useWorkarea = jest.fn();
jest.mock('helpers/hooks/useWorkarea', () => useWorkarea);

jest.mock('helpers/useI18n', () => () => ({
  beambox: {
    left_panel: {
      label: {
        preview: 'Camera Preview',
        trace: 'Trace Image',
        end_preview: 'End Preview',
        clear_preview: 'Clear Preview',
        curve_engraving: {
          title: 'Curve Engraving',
        },
      },
    },
  },
}));

const mockStartCurveEngraving = jest.fn();
jest.mock('app/actions/canvas/curveEngravingModeController', () => ({
  start: mockStartCurveEngraving,
}));

import PreviewToolButtonGroup from './PreviewToolButtonGroup';

test('should render correctly', () => {
  const endPreviewMode = jest.fn();
  const setShouldStartPreviewController = jest.fn();
  const { container } = render(
    <PreviewToolButtonGroup
      className="left-toolbar"
      endPreviewMode={endPreviewMode}
      setShouldStartPreviewController={setShouldStartPreviewController}
    />
  );
  expect(container).toMatchSnapshot();
});
