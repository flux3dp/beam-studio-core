/* eslint-disable import/first */
import * as React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

jest.mock('app/views/beambox/Right-Panels/ActionsPanel', () => function DummyActionsPanel() {
  return (
    <div>
      This is dummy ActionsPanel
    </div>
  );
});

jest.mock('app/views/beambox/Right-Panels/DimensionPanel', () => function DummyDimensionPanel() {
  return (
    <div>
      This is dummy DimensionPanel
    </div>
  );
});

jest.mock('app/views/beambox/Right-Panels/OptionsPanel', () => function DummyOptionsPanel() {
  return (
    <div>
      This is dummy OptionsPanel
    </div>
  );
});

jest.mock('helpers/i18n', () => ({
  lang: {
    beambox: {
      right_panel: {
        object_panel: {
          group: 'Group',
          ungroup: 'Ungroup',
          hdist: 'Horizontal Distribute',
          vdist: 'Vertical Distribute',
          left_align: 'Left Align',
          center_align: 'Center Align',
          right_align: 'Right Align',
          top_align: 'Top Align',
          middle_align: 'Middle Align',
          bottom_align: 'Bottom Align',
          union: 'Union',
          subtract: 'Subtract',
          intersect: 'Intersect',
          difference: 'Difference',
        },
      },
    },
  },
}));

const alignTop = jest.fn();
const alignMiddle = jest.fn();
const alignBottom = jest.fn();
const alignLeft = jest.fn();
const alignCenter = jest.fn();
const alignRight = jest.fn();
jest.mock('app/actions/beambox/svgeditor-function-wrapper', () => ({
  alignTop,
  alignMiddle,
  alignBottom,
  alignLeft,
  alignCenter,
  alignRight,
}));

const getSVGAsync = jest.fn();
jest.mock('helpers/svg-editor-helper', () => ({
  getSVGAsync,
}));

const isElemFillable = jest.fn();
const distHori = jest.fn();
const distVert = jest.fn();
const groupSelectedElements = jest.fn();
const ungroupSelectedElement = jest.fn();
const booleanOperationSelectedElements = jest.fn();
getSVGAsync.mockImplementation((callback) => {
  callback({
    Canvas: {
      isElemFillable,
      distHori,
      distVert,
      groupSelectedElements,
      ungroupSelectedElement,
      booleanOperationSelectedElements,

    },
  });
});

import { ObjectPanelContext } from 'app/views/beambox/Right-Panels/contexts/ObjectPanelContext';

import ObjectPanel from './ObjectPanel';

describe('should render correctly', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('no elements', () => {
    const wrapper = mount(
      <ObjectPanelContext.Provider value={{
        polygonSides: 5,
        dimensionValues: {
          rx: 1,
        },
        updateDimensionValues: jest.fn(),
        getDimensionValues: jest.fn(),
        updateObjectPanel: jest.fn(),
      }}
      >
        <ObjectPanel
          elem={document.getElementById('svg_1')}
        />
      </ObjectPanelContext.Provider>,
    );
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  describe('one element', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    test('not g element', () => {
      document.body.innerHTML = '<rect id="svg_1" />';
      const wrapper = mount(
        <ObjectPanelContext.Provider value={{
          polygonSides: 5,
          dimensionValues: {
            rx: 1,
          },
          updateDimensionValues: jest.fn(),
          getDimensionValues: jest.fn(),
          updateObjectPanel: jest.fn(),
        }}
        >
          <ObjectPanel
            elem={document.getElementById('svg_1')}
          />
        </ObjectPanelContext.Provider>,
      );

      expect(toJson(wrapper)).toMatchSnapshot();

      wrapper.find('div[title="Top Align"]').simulate('click');
      expect(alignTop).toHaveBeenCalledTimes(1);
      wrapper.find('div[title="Middle Align"]').simulate('click');
      expect(alignMiddle).toHaveBeenCalledTimes(1);
      wrapper.find('div[title="Bottom Align"]').simulate('click');
      expect(alignBottom).toHaveBeenCalledTimes(1);
      wrapper.find('div[title="Left Align"]').simulate('click');
      expect(alignLeft).toHaveBeenCalledTimes(1);
      wrapper.find('div[title="Center Align"]').simulate('click');
      expect(alignCenter).toHaveBeenCalledTimes(1);
      wrapper.find('div[title="Right Align"]').simulate('click');
      expect(alignRight).toHaveBeenCalledTimes(1);
      wrapper.find('div[title="Group"]').simulate('click');
      expect(groupSelectedElements).toHaveBeenCalledTimes(1);
    });

    test('is g element', () => {
      document.body.innerHTML = '<g id="svg_1" />';
      const wrapper = mount(
        <ObjectPanelContext.Provider value={{
          polygonSides: 5,
          dimensionValues: {
            rx: 1,
          },
          updateDimensionValues: jest.fn(),
          getDimensionValues: jest.fn(),
          updateObjectPanel: jest.fn(),
        }}
        >
          <ObjectPanel
            elem={document.getElementById('svg_1')}
          />
        </ObjectPanelContext.Provider>,
      );

      expect(toJson(wrapper)).toMatchSnapshot();

      wrapper.find('div[title="Ungroup"]').simulate('click');
      expect(ungroupSelectedElement).toHaveBeenCalledTimes(1);
    });
  });

  describe('two elements', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    test('contains rect, polygon or ellipse elements', () => {
      document.body.innerHTML = '<g id="svg_3" data-tempgroup="true"><rect id="svg_1"></rect><ellipse id="svg_2"></ellipse></g>';
      const wrapper = mount(
        <ObjectPanelContext.Provider value={{
          polygonSides: 5,
          dimensionValues: {
            rx: 1,
          },
          updateDimensionValues: jest.fn(),
          getDimensionValues: jest.fn(),
          updateObjectPanel: jest.fn(),
        }}
        >
          <ObjectPanel
            elem={document.getElementById('svg_3')}
          />
        </ObjectPanelContext.Provider>,
      );

      expect(toJson(wrapper)).toMatchSnapshot();

      wrapper.find('div[title="Top Align"]').simulate('click');
      expect(alignTop).toHaveBeenCalledTimes(1);
      wrapper.find('div[title="Middle Align"]').simulate('click');
      expect(alignMiddle).toHaveBeenCalledTimes(1);
      wrapper.find('div[title="Bottom Align"]').simulate('click');
      expect(alignBottom).toHaveBeenCalledTimes(1);
      wrapper.find('div[title="Left Align"]').simulate('click');
      expect(alignLeft).toHaveBeenCalledTimes(1);
      wrapper.find('div[title="Center Align"]').simulate('click');
      expect(alignCenter).toHaveBeenCalledTimes(1);
      wrapper.find('div[title="Right Align"]').simulate('click');
      expect(alignRight).toHaveBeenCalledTimes(1);
      wrapper.find('div[title="Group"]').simulate('click');
      expect(groupSelectedElements).toHaveBeenCalledTimes(1);
      wrapper.find('div[title="Union"]').simulate('click');
      expect(booleanOperationSelectedElements).toHaveBeenCalledTimes(1);
      expect(booleanOperationSelectedElements).toHaveBeenNthCalledWith(1, 'union');
      wrapper.find('div[title="Subtract"]').simulate('click');
      expect(booleanOperationSelectedElements).toHaveBeenCalledTimes(2);
      expect(booleanOperationSelectedElements).toHaveBeenNthCalledWith(2, 'diff');
      wrapper.find('div[title="Intersect"]').simulate('click');
      expect(booleanOperationSelectedElements).toHaveBeenCalledTimes(3);
      expect(booleanOperationSelectedElements).toHaveBeenNthCalledWith(3, 'intersect');
      wrapper.find('div[title="Difference"]').simulate('click');
      expect(booleanOperationSelectedElements).toHaveBeenCalledTimes(4);
      expect(booleanOperationSelectedElements).toHaveBeenNthCalledWith(4, 'xor');
    });

    test('contains other types of elements', () => {
      document.body.innerHTML = '<g id="svg_3" data-tempgroup="true"><path id="svg_1"></path><line id="svg_2"></line></g>';
      isElemFillable.mockReturnValue(true);
      const wrapper = mount(
        <ObjectPanelContext.Provider value={{
          polygonSides: 5,
          dimensionValues: {
            rx: 1,
          },
          updateDimensionValues: jest.fn(),
          getDimensionValues: jest.fn(),
          updateObjectPanel: jest.fn(),
        }}
        >
          <ObjectPanel
            elem={document.getElementById('svg_3')}
          />
        </ObjectPanelContext.Provider>,
      );

      expect(toJson(wrapper)).toMatchSnapshot();
      expect(isElemFillable).toHaveBeenCalledTimes(4);
      expect(isElemFillable).toHaveBeenNthCalledWith(1, document.getElementById('svg_1'));
      expect(isElemFillable).toHaveBeenNthCalledWith(2, document.getElementById('svg_1'));
      expect(isElemFillable).toHaveBeenNthCalledWith(3, document.getElementById('svg_1'));
      expect(isElemFillable).toHaveBeenNthCalledWith(4, document.getElementById('svg_1'));
    });
  });
});
