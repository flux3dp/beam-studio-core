/* eslint-disable import/first */
import * as React from 'react';
import $ from 'jquery';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const mockClearSelection = jest.fn();
const mockUseSelectTool = jest.fn();
const mockImportImage = jest.fn();
const mockInsertText = jest.fn();
const mockInsertRectangle = jest.fn();
const mockInsertEllipse = jest.fn();
const mockInsertLine = jest.fn();
const mockInsertPath = jest.fn();
const mockInsertPolygon = jest.fn();
jest.mock('app/actions/beambox/svgeditor-function-wrapper', () => ({
  clearSelection: mockClearSelection,
  useSelectTool: mockUseSelectTool,
  importImage: mockImportImage,
  insertText: mockInsertText,
  insertRectangle: mockInsertRectangle,
  insertEllipse: mockInsertEllipse,
  insertLine: mockInsertLine,
  insertPath: mockInsertPath,
  insertPolygon: mockInsertPolygon,
}));

jest.mock('app/views/beambox/LeftPanel/DrawingToolButtonGroup', () => function DummyDrawingToolButtonGroup() {
  return (
    <div>
      This is dummy DrawingToolButtonGroup
    </div>
  );
});

jest.mock('app/views/beambox/LeftPanel/PreviewToolButtonGroup', () => function DummyPreviewToolButtonGroup() {
  return (
    <div>
      This is dummy PreviewToolButtonGroup
    </div>
  );
});

import LeftPanel from './LeftPanel';

describe('should render correctly', () => {
  test('NOT in previewing', () => {
    Object.defineProperty(window, 'os', {
      value: 'MacOS',
    });
    document.body.innerHTML = `
      <div id="layerpanel"></div>
      <div id="layer-laser-panel-placeholder"></div>
      <div id="svg_editor"></div>
    `;

    const wrapper = shallow(
      <LeftPanel
        isPreviewing={false}
        endPreviewMode={jest.fn()}
        setShouldStartPreviewController={jest.fn()}
      />,
    );
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(document.getElementById('svg_editor').className.split(' ').indexOf('color') !== -1).toBeTruthy();

    $('#layerpanel').mouseup();
    expect(mockClearSelection).toHaveBeenCalledTimes(1);

    $('#layer-laser-panel-placeholder').mouseup();
    expect(mockClearSelection).toHaveBeenCalledTimes(2);

    wrapper.unmount();
    expect(document.getElementById('svg_editor').className.split(' ').indexOf('color')).toBe(-1);
  });

  test('in previewing', () => {
    Object.defineProperty(window, 'os', {
      value: 'Windows',
    });
    document.body.innerHTML = `
      <div id="layerpanel" />
      <div id="layer-laser-panel-placeholder" />
      <div id="svg_editor" />
    `;
    expect(toJson(shallow(
      <LeftPanel
        isPreviewing
        endPreviewMode={jest.fn()}
        setShouldStartPreviewController={jest.fn()}
      />,
    ))).toMatchSnapshot();
  });
});
