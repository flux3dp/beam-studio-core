/* eslint-disable import/first */
import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const mockUseSelectTool = jest.fn();
const mockImportImage = jest.fn();
const mockInsertText = jest.fn();
const mockInsertRectangle = jest.fn();
const mockInsertEllipse = jest.fn();
const mockInsertLine = jest.fn();
const mockInsertPath = jest.fn();
const mockInsertPolygon = jest.fn();
jest.mock('app/actions/beambox/svgeditor-function-wrapper', () => ({
  useSelectTool: mockUseSelectTool,
  importImage: mockImportImage,
  insertText: mockInsertText,
  insertRectangle: mockInsertRectangle,
  insertEllipse: mockInsertEllipse,
  insertLine: mockInsertLine,
  insertPath: mockInsertPath,
  insertPolygon: mockInsertPolygon,
}));

const mockOpen = jest.fn();
jest.mock('implementations/browser', () => ({
  open: mockOpen,
}));

const showShapePanel = jest.fn();
jest.mock('app/actions/dialog-caller', () => ({
  showShapePanel: (...args) => showShapePanel(...args),
}));

jest.mock('helpers/i18n', () => ({
  lang: {
    beambox: {
      left_panel: {
        label: {
          cursor: 'Select',
          photo: 'Image',
          text: 'Text',
          line: 'Line',
          rect: 'Rectangle',
          oval: 'Oval',
          polygon: 'Polygon',
          pen: 'Pen',
          shapes: 'Elements',
        },
      },
    },
    topbar: {
      menu: {
        link: {
          design_market: 'https://dmkt.io',
        },
      },
    },
  },
}));

import DrawingToolButtonGroup from './DrawingToolButtonGroup';

test('should render correctly', () => {
  const wrapper = shallow(
    <DrawingToolButtonGroup
      className="flux"
    />,
  );
  expect(toJson(wrapper)).toMatchSnapshot();

  wrapper.find('#left-Photo').simulate('click');
  expect(toJson(wrapper)).toMatchSnapshot();
  expect(mockImportImage).toHaveBeenCalledTimes(1);

  wrapper.find('#left-Text').simulate('click');
  expect(toJson(wrapper)).toMatchSnapshot();
  expect(mockInsertText).toHaveBeenCalledTimes(1);

  wrapper.find('#left-Rectangle').simulate('click');
  expect(toJson(wrapper)).toMatchSnapshot();
  expect(mockInsertRectangle).toHaveBeenCalledTimes(1);

  wrapper.find('#left-Ellipse').simulate('click');
  expect(toJson(wrapper)).toMatchSnapshot();
  expect(mockInsertEllipse).toHaveBeenCalledTimes(1);

  wrapper.find('#left-Polygon').simulate('click');
  expect(toJson(wrapper)).toMatchSnapshot();
  expect(mockInsertPolygon).toHaveBeenCalledTimes(1);

  wrapper.find('#left-Line').simulate('click');
  expect(toJson(wrapper)).toMatchSnapshot();
  expect(mockInsertLine).toHaveBeenCalledTimes(1);

  wrapper.find('#left-Element').simulate('click');
  expect(toJson(wrapper)).toMatchSnapshot();
  expect(showShapePanel).toHaveBeenCalledTimes(1);

  wrapper.find('#left-Pen').simulate('click');
  expect(toJson(wrapper)).toMatchSnapshot();
  expect(mockInsertPath).toHaveBeenCalledTimes(1);

  wrapper.find('#left-Cursor').simulate('click');
  expect(toJson(wrapper)).toMatchSnapshot();
  expect(mockUseSelectTool).toHaveBeenCalledTimes(1);

  wrapper.find('#left-DM').simulate('click');
  expect(toJson(wrapper)).toMatchSnapshot();
  expect(mockOpen).toHaveBeenCalledTimes(1);
  expect(mockOpen).toHaveBeenLastCalledWith('https://dmkt.io');
});
