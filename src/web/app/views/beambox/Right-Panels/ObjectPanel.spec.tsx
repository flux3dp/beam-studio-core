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

jest.mock('app/views/beambox/Right-Panels/ObjectPanelItem', () => ({
  Item: function DummyObjectPanelItem() {
    return <div>This is dummy ObjectPanelItem</div>;
  },
  ActionList: function DummyObjectPanelActionList() {
    return <div>This is dummy ObjectPanelActionList</div>;
  },
  Divider: function DummyObjectPanelDivider() {
    return <div>This is dummy ObjectPanelDivider</div>;
  },
}));

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
    topbar:{
      menu:{
        delete:'Delete',
        duplicate:'Duplicate'
      }
    }
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

const useIsMobile = jest.fn();
jest.mock('helpers/system-helper', () => ({
  useIsMobile: () => useIsMobile(),
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
        activeKey: null,
        polygonSides: 5,
        dimensionValues: {
          rx: 1,
        },
        updateActiveKey: jest.fn(),
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
          activeKey: null,
          polygonSides: 5,
          dimensionValues: {
            rx: 1,
          },
          updateActiveKey: jest.fn(),
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
          activeKey: null,
          polygonSides: 5,
          dimensionValues: {
            rx: 1,
          },
          updateActiveKey: jest.fn(),
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
          activeKey: null,
          polygonSides: 5,
          dimensionValues: {
            rx: 1,
          },
          updateActiveKey: jest.fn(),
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
          activeKey: null,
          polygonSides: 5,
          dimensionValues: {
            rx: 1,
          },
          updateActiveKey: jest.fn(),
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
      expect(isElemFillable).toHaveBeenCalledTimes(5);
      expect(isElemFillable).toHaveBeenNthCalledWith(1, document.getElementById('svg_1'));
      expect(isElemFillable).toHaveBeenNthCalledWith(2, document.getElementById('svg_1'));
      expect(isElemFillable).toHaveBeenNthCalledWith(3, document.getElementById('svg_1'));
      expect(isElemFillable).toHaveBeenNthCalledWith(4, document.getElementById('svg_1'));
    });
  });
});

describe('should render correctly in mobile', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useIsMobile.mockReturnValue(true);
  });

  test('no elements', () => {
    const wrapper = mount(
      <ObjectPanelContext.Provider value={{
        activeKey: null,
        polygonSides: 5,
        dimensionValues: {
          rx: 1,
        },
        updateActiveKey: jest.fn(),
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
      useIsMobile.mockReturnValue(true);
    });

    test('not g element', () => {
      document.body.innerHTML = '<rect id="svg_1" />';
      const wrapper = mount(
        <ObjectPanelContext.Provider value={{
          activeKey: null,
          polygonSides: 5,
          dimensionValues: {
            rx: 1,
          },
          updateActiveKey: jest.fn(),
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

      const alignActions = wrapper.find('DummyObjectPanelActionList[id="align"]').props().actions;
      expect(alignActions[0].label).toBe('Top Align');
      alignActions[0].onClick();
      expect(alignTop).toHaveBeenCalledTimes(1);
      expect(alignActions[1].label).toBe('Middle Align');
      alignActions[1].onClick();
      expect(alignMiddle).toHaveBeenCalledTimes(1);
      expect(alignActions[2].label).toBe('Bottom Align');
      alignActions[2].onClick();
      expect(alignBottom).toHaveBeenCalledTimes(1);
      expect(alignActions[3].label).toBe('Left Align');
      alignActions[3].onClick();
      expect(alignLeft).toHaveBeenCalledTimes(1);
      expect(alignActions[4].label).toBe('Center Align');
      alignActions[4].onClick();
      expect(alignCenter).toHaveBeenCalledTimes(1);
      expect(alignActions[5].label).toBe('Right Align');
      alignActions[5].onClick();
      expect(alignRight).toHaveBeenCalledTimes(1);
      wrapper.find('DummyObjectPanelItem[id="group"]').props().onClick();
      expect(groupSelectedElements).toHaveBeenCalledTimes(1);
    });

    test('is g element', () => {
      document.body.innerHTML = '<g id="svg_1" />';
      const wrapper = mount(
        <ObjectPanelContext.Provider value={{
          activeKey: null,
          polygonSides: 5,
          dimensionValues: {
            rx: 1,
          },
          updateActiveKey: jest.fn(),
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

      wrapper.find('DummyObjectPanelItem[id="ungroup"]').props().onClick();
      expect(ungroupSelectedElement).toHaveBeenCalledTimes(1);
    });
  });

  describe('two elements', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      useIsMobile.mockReturnValue(true);
    });

    test('contains rect, polygon or ellipse elements', () => {
      document.body.innerHTML = '<g id="svg_3" data-tempgroup="true"><rect id="svg_1"></rect><ellipse id="svg_2"></ellipse></g>';
      const wrapper = mount(
        <ObjectPanelContext.Provider value={{
          activeKey: null,
          polygonSides: 5,
          dimensionValues: {
            rx: 1,
          },
          updateActiveKey: jest.fn(),
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

      const alignActions = wrapper.find('DummyObjectPanelActionList[id="align"]').props().actions;
      expect(alignActions[0].label).toBe('Top Align');
      alignActions[0].onClick();
      expect(alignTop).toHaveBeenCalledTimes(1);
      expect(alignActions[1].label).toBe('Middle Align');
      alignActions[1].onClick();
      expect(alignMiddle).toHaveBeenCalledTimes(1);
      expect(alignActions[2].label).toBe('Bottom Align');
      alignActions[2].onClick();
      expect(alignBottom).toHaveBeenCalledTimes(1);
      expect(alignActions[3].label).toBe('Left Align');
      alignActions[3].onClick();
      expect(alignLeft).toHaveBeenCalledTimes(1);
      expect(alignActions[4].label).toBe('Center Align');
      alignActions[4].onClick();
      expect(alignCenter).toHaveBeenCalledTimes(1);
      expect(alignActions[5].label).toBe('Right Align');
      alignActions[5].onClick();
      expect(alignRight).toHaveBeenCalledTimes(1);
      wrapper.find('DummyObjectPanelItem[id="group"]').props().onClick();
      expect(groupSelectedElements).toHaveBeenCalledTimes(1);
      const bolleanActions = wrapper
        .find('DummyObjectPanelActionList[id="boolean"]')
        .props().actions;
      expect(bolleanActions[0].label).toBe('Union');
      bolleanActions[0].onClick();
      expect(booleanOperationSelectedElements).toHaveBeenCalledTimes(1);
      expect(booleanOperationSelectedElements).toHaveBeenNthCalledWith(1, 'union');
      expect(bolleanActions[1].label).toBe('Subtract');
      bolleanActions[1].onClick();
      expect(booleanOperationSelectedElements).toHaveBeenCalledTimes(2);
      expect(booleanOperationSelectedElements).toHaveBeenNthCalledWith(2, 'diff');
      expect(bolleanActions[2].label).toBe('Intersect');
      bolleanActions[2].onClick();
      expect(booleanOperationSelectedElements).toHaveBeenCalledTimes(3);
      expect(booleanOperationSelectedElements).toHaveBeenNthCalledWith(3, 'intersect');
      expect(bolleanActions[3].label).toBe('Difference');
      bolleanActions[3].onClick();
      expect(booleanOperationSelectedElements).toHaveBeenCalledTimes(4);
      expect(booleanOperationSelectedElements).toHaveBeenNthCalledWith(4, 'xor');
    });

    test('contains other types of elements', () => {
      document.body.innerHTML = '<g id="svg_3" data-tempgroup="true"><path id="svg_1"></path><line id="svg_2"></line></g>';
      isElemFillable.mockReturnValue(true);
      const wrapper = mount(
        <ObjectPanelContext.Provider value={{
          activeKey: null,
          polygonSides: 5,
          dimensionValues: {
            rx: 1,
          },
          updateActiveKey: jest.fn(),
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
      expect(isElemFillable).toHaveBeenCalledTimes(5);
      expect(isElemFillable).toHaveBeenNthCalledWith(1, document.getElementById('svg_1'));
      expect(isElemFillable).toHaveBeenNthCalledWith(2, document.getElementById('svg_1'));
      expect(isElemFillable).toHaveBeenNthCalledWith(3, document.getElementById('svg_1'));
      expect(isElemFillable).toHaveBeenNthCalledWith(4, document.getElementById('svg_1'));
    });
  });
});
