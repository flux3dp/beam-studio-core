/* eslint-disable import/first */
import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const getNextStepRequirement = jest.fn();
const handleNextStep = jest.fn();
jest.mock('app/views/tutorials/tutorialController', () => ({
  getNextStepRequirement,
  handleNextStep,
}));

jest.mock('helpers/i18n', () => ({
  lang: {
    beambox: {
      right_panel: {
        tabs: {
          layers: 'Layers',
          objects: 'Objects',
          path_edit: 'Path Edit',
        },
      },
    },
    topbar: {
      tag_names: {
        rect: 'Rectangle',
        ellipse: 'Oval',
        path: 'Path',
        polygon: 'Polygon',
        image: 'Image',
        text: 'Text',
        text_path: 'Text on Path',
        line: 'Line',
        g: 'Group',
        multi_select: 'Multiple Objects',
        use: 'Imported Object',
        svg: 'SVG Object',
        dxf: 'DXF Object',
      },
    },
  },
}));

jest.mock('app/constants/tutorial-constants', () => ({
  TO_LAYER_PANEL: 'TO_LAYER_PANEL',
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

import Tab from './Tab';

describe('should render correctly', () => {
  test('no selected element', () => {
    expect(toJson(shallow(<Tab
      mode="element"
      selectedElement={null}
      selectedTab="layers"
      setSelectedTab={jest.fn()}
    />))).toMatchSnapshot();
  });

  test('in path edit mode', () => {
    document.body.innerHTML = '<path id="svg_1"></path>';
    expect(toJson(shallow(<Tab
      mode="path-edit"
      selectedElement={document.getElementById('svg_1')}
      selectedTab="objects"
      setSelectedTab={jest.fn()}
    />))).toMatchSnapshot();
  });

  describe('in element node', () => {
    describe('in objects tab', () => {
      test('not use tag', () => {
        document.body.innerHTML = '<ellipse id="svg_1"></ellipse>';
        const setSelectedTab = jest.fn();
        const wrapper = shallow(<Tab
          mode="element"
          selectedElement={document.getElementById('svg_1')}
          selectedTab="objects"
          setSelectedTab={setSelectedTab}
        />);
        expect(toJson(wrapper)).toMatchSnapshot();

        wrapper.find('div.objects').simulate('click');
        expect(setSelectedTab).toHaveBeenCalledTimes(1);
        expect(setSelectedTab).toHaveBeenNthCalledWith(1, 'objects');
      });

      test('multiple objects', () => {
        document.body.innerHTML = '<g id="svg_3" data-tempgroup="true"></g>';
        expect(toJson(shallow(<Tab
          mode="element"
          selectedElement={document.getElementById('svg_3')}
          selectedTab="objects"
          setSelectedTab={jest.fn()}
        />))).toMatchSnapshot();
      });

      test('dxf object', () => {
        document.body.innerHTML = '<use id="svg_1" data-dxf="true"></use>';
        expect(toJson(shallow(<Tab
          mode="element"
          selectedElement={document.getElementById('svg_1')}
          selectedTab="objects"
          setSelectedTab={jest.fn()}
        />))).toMatchSnapshot();
      });

      test('svg object', () => {
        document.body.innerHTML = '<use id="svg_1" data-svg="true"></use>';
        expect(toJson(shallow(<Tab
          mode="element"
          selectedElement={document.getElementById('svg_1')}
          selectedTab="objects"
          setSelectedTab={jest.fn()}
        />))).toMatchSnapshot();
      });

      test('textpath object', () => {
        document.body.innerHTML = '<g id="svg_1" data-textpath-g="1"></g>';
        expect(toJson(shallow(<Tab
          mode="element"
          selectedElement={document.getElementById('svg_1')}
          selectedTab="objects"
          setSelectedTab={jest.fn()}
        />))).toMatchSnapshot();
      });

      test('other types', () => {
        document.body.innerHTML = '<use id="svg_1"></use>';
        expect(toJson(shallow(<Tab
          mode="element"
          selectedElement={document.getElementById('svg_1')}
          selectedTab="objects"
          setSelectedTab={jest.fn()}
        />))).toMatchSnapshot();
      });
    });

    describe('in layers tab', () => {
      beforeEach(() => {
        jest.resetAllMocks();
      });

      test('in tutorial mode', () => {
        document.body.innerHTML = '<ellipse id="svg_1"></ellipse>';
        const setSelectedTab = jest.fn();
        const wrapper = shallow(<Tab
          mode="element"
          selectedElement={document.getElementById('svg_1')}
          selectedTab="layers"
          setSelectedTab={setSelectedTab}
        />);
        expect(toJson(wrapper)).toMatchSnapshot();

        getNextStepRequirement.mockReturnValue('TO_LAYER_PANEL');
        wrapper.find('div.layers').simulate('click');
        expect(setSelectedTab).toHaveBeenCalledTimes(1);
        expect(setSelectedTab).toHaveBeenNthCalledWith(1, 'layers');
        expect(clearSelection).toHaveBeenCalledTimes(1);
        expect(handleNextStep).toHaveBeenCalledTimes(1);
      });

      test('not in tutorial mode', () => {
        document.body.innerHTML = '<ellipse id="svg_1"></ellipse>';
        const setSelectedTab = jest.fn();
        const wrapper = shallow(<Tab
          mode="element"
          selectedElement={document.getElementById('svg_1')}
          selectedTab="layers"
          setSelectedTab={setSelectedTab}
        />);

        getNextStepRequirement.mockReturnValue('');
        wrapper.find('div.layers').simulate('click');
        expect(setSelectedTab).toHaveBeenCalledTimes(1);
        expect(setSelectedTab).toHaveBeenNthCalledWith(1, 'layers');
        expect(clearSelection).not.toHaveBeenCalled();
        expect(handleNextStep).not.toHaveBeenCalled();
      });
    });
  });
});
