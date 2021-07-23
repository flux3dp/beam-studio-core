/* eslint-disable import/first */
import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

jest.mock('helpers/i18n', () => ({
  lang: {
    beambox: {
      tool_panels: {
        cancel: 'Cancel',
        confirm: 'Confirm',
        grid_array: 'Create Grid Array',
        offset: 'Offset',
      },
    },
  },
}));

const get = jest.fn();
jest.mock('implementations/storage', () => ({
  get,
}));

const getSVGAsync = jest.fn();
jest.mock('helpers/svg-editor-helper', () => ({
  getSVGAsync,
}));

const setMode = jest.fn();
const gridArraySelectedElement = jest.fn();
const setHasUnsavedChange = jest.fn();
const offsetElements = jest.fn();
const nestElements = jest.fn();
getSVGAsync.mockImplementation((callback) => {
  callback({
    Canvas: {
      setMode,
      gridArraySelectedElement,
      setHasUnsavedChange,
      offsetElements,
      nestElements,
    },
  });
});

jest.mock('app/views/beambox/ToolPanels/Interval', () => function DummyInterval() {
  return (<div>This is dummy Interval</div>);
});

jest.mock('app/views/beambox/ToolPanels/NestGAPanel', () => function DummyNestGAPanel() {
  return (<div>This is dummy NestGAPanel</div>);
});

jest.mock('app/views/beambox/ToolPanels/NestRotationPanel', () => function DummyNestRotationPanel() {
  return (<div>This is dummy NestRotationPanel</div>);
});

jest.mock('app/views/beambox/ToolPanels/NestSpacingPanel', () => function DummyNestSpacingPanel() {
  return (<div>This is dummy NestSpacingPanel</div>);
});

jest.mock('app/views/beambox/ToolPanels/OffsetCornerPanel', () => function DummyOffsetCornerPanel() {
  return (<div>This is dummy OffsetCornerPanel</div>);
});

jest.mock('app/views/beambox/ToolPanels/OffsetDirectionPanel', () => function DummyOffsetDirectionPanel() {
  return (<div>This is dummy OffsetDirectionPanel</div>);
});

jest.mock('app/views/beambox/ToolPanels/OffsetDistancePanel', () => function DummyOffsetDistancePanel() {
  return (<div>This is dummy OffsetDistancePanel</div>);
});

jest.mock('app/views/beambox/ToolPanels/RowColumn', () => function DummyRowColumn() {
  return (<div>This is dummy RowColumn</div>);
});

jest.mock('app/actions/beambox/toolPanelsController', () => ({
}));

import ToolPanels from './ToolPanels';

describe('should render correctly', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('type is gridArray', () => {
    const unmount = jest.fn();
    const wrapper = shallow(<ToolPanels
      type="gridArray"
      data={{
        rowcolumn: {
          row: 1,
          column: 1,
        },
        distance: {
          dx: 0,
          dy: 0,
        },
      }}
      unmount={unmount}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('type is offset', () => {
    const unmount = jest.fn();
    const wrapper = shallow(<ToolPanels
      type="offset"
      data={{
        rowcolumn: {
          row: 1,
          column: 1,
        },
        distance: {
          dx: 0,
          dy: 0,
        },
      }}
      unmount={unmount}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('type is nest', () => {
    const unmount = jest.fn();
    const wrapper = shallow(<ToolPanels
      type="nest"
      data={{
        rowcolumn: {
          row: 1,
          column: 1,
        },
        distance: {
          dx: 0,
          dy: 0,
        },
      }}
      unmount={unmount}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
