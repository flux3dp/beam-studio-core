/* eslint-disable import/first */
import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const emitShowCropper = jest.fn();
jest.mock('app/stores/beambox-store', () => ({
  emitShowCropper,
}));

jest.mock('helpers/i18n', () => ({
  lang: {
    beambox: {
      left_panel: {
        label: {
          preview: 'Camera Preview',
          trace: 'Trace Image',
          end_preview: 'End Preview',
          clear_preview: 'Clear Preview',
        },
      },
    },
  },
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

import PreviewToolButtonGroup from './PreviewToolButtonGroup';

test('should render correctly', () => {
  const endPreviewMode = jest.fn();
  const setShouldStartPreviewController = jest.fn();
  const wrapper = shallow(
    <PreviewToolButtonGroup
      className="left-toolbar"
      endPreviewMode={endPreviewMode}
      setShouldStartPreviewController={setShouldStartPreviewController}
    />
  );
  expect(toJson(wrapper)).toMatchSnapshot();
});
