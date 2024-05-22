import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import { CanvasContext, CanvasMode } from 'app/contexts/CanvasContext';

import LeftPanel from './LeftPanel';

const on = jest.fn();
jest.mock('helpers/shortcuts', () => ({
  on: (...args) => on(...args),
}));

const clearSelection = jest.fn();
const useSelectTool = jest.fn();
const importImage = jest.fn();
const insertText = jest.fn();
const insertRectangle = jest.fn();
const insertEllipse = jest.fn();
const insertLine = jest.fn();
const insertPath = jest.fn();
const insertPolygon = jest.fn();
jest.mock('app/actions/beambox/svgeditor-function-wrapper', () => ({
  clearSelection: () => clearSelection(),
  useSelectTool: () => useSelectTool(),
  importImage: () => importImage(),
  insertText: () => insertText(),
  insertRectangle: () => insertRectangle(),
  insertEllipse: () => insertEllipse(),
  insertLine: () => insertLine(),
  insertPath: () => insertPath(),
  insertPolygon: () => insertPolygon(),
}));

jest.mock('app/components/beambox/left-panel/DrawingToolButtonGroup', () => function DrawingToolButtonGroup() {
  return (
    <div>
      This is dummy DrawingToolButtonGroup
    </div>
  );
});

jest.mock('app/components/beambox/left-panel/PreviewToolButtonGroup', () => (
  { endPreviewMode, setShouldStartPreviewController }: any
) => (
  <div>
    This is dummy PreviewToolButtonGroup
    <button onClick={endPreviewMode} type="button">
      endPreviewMode
    </button>
    <button onClick={setShouldStartPreviewController} type="button">
      setShouldStartPreviewController
    </button>
  </div>
));

jest.mock('app/contexts/CanvasContext', () => ({
  CanvasContext: React.createContext(null),
  CanvasMode: {
    Draw: 1,
    Preview: 2,
    PathPreview: 3,
  },
}));

jest.mock('helpers/i18n', () => ({
  lang: {
    beambox: {
      left_panel: {
        label: {
          end_preview: 'End Preview',
        },
      },
    },
  },
}));

describe('test LeftPanel', () => {
  test('neither in previewing nor in path previewing', () => {
    Object.defineProperty(window, 'os', {
      value: 'MacOS',
    });
    document.body.innerHTML = '<div id="svg_editor" />';

    const { container, unmount } = render(
      <CanvasContext.Provider value={{
        setShouldStartPreviewController: jest.fn(),
        endPreviewMode: jest.fn(),
        togglePathPreview: jest.fn(),
        mode: CanvasMode.Draw,
      } as any}
      >
        <LeftPanel />
      </CanvasContext.Provider>,
    );
    expect(container).toMatchSnapshot();
    expect(document.getElementById('svg_editor').className.split(' ').indexOf('color') !== -1).toBeTruthy();

    unmount();
    expect(document.getElementById('svg_editor').className.split(' ').indexOf('color')).toBe(-1);
  });

  test('not in path previewing', () => {
    Object.defineProperty(window, 'os', {
      value: 'Windows',
    });
    document.body.innerHTML = '<div id="svg_editor" />';
    const setShouldStartPreviewController = jest.fn();
    const endPreviewMode = jest.fn();
    const { container, getByText } = render(
      <CanvasContext.Provider value={{
        setShouldStartPreviewController,
        endPreviewMode,
        togglePathPreview: jest.fn(),
        mode: CanvasMode.Preview,
      } as any}
      >
        <LeftPanel />
      </CanvasContext.Provider>,
    );
    expect(container).toMatchSnapshot();

    expect(endPreviewMode).not.toBeCalled();
    fireEvent.click(getByText('endPreviewMode'));
    expect(endPreviewMode).toHaveBeenCalledTimes(1);

    expect(setShouldStartPreviewController).not.toBeCalled();
    fireEvent.click(getByText('setShouldStartPreviewController'));
    expect(setShouldStartPreviewController).toHaveBeenCalledTimes(1);
  });

  test('in path previewing', () => {
    Object.defineProperty(window, 'os', {
      value: 'Windows',
    });
    document.body.innerHTML = '<div id="svg_editor" />';
    const togglePathPreview = jest.fn();
    const { container } = render(
      <CanvasContext.Provider value={{
        setShouldStartPreviewController: jest.fn(),
        endPreviewMode: jest.fn(),
        togglePathPreview,
        mode: CanvasMode.PathPreview,
      } as any}
      >
        <LeftPanel />
      </CanvasContext.Provider>,
    );
    expect(container).toMatchSnapshot();

    expect(togglePathPreview).not.toBeCalled();
    const div = container.querySelector('div#Exit-Preview');
    fireEvent.click(div);
    expect(togglePathPreview).toHaveBeenCalledTimes(1);
  });
});
