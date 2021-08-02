/* eslint-disable import/first */
import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

jest.mock('helpers/i18n', () => ({
  lang: {
    topbar: {
      tag_names: {
        rect: 'Rectangle',
        ellipse: 'Oval',
        path: 'Path',
        polygon: 'Polygon',
        image: 'Image',
        text: 'Text',
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

const getSVGAsync = jest.fn();
jest.mock('helpers/svg-editor-helper', () => ({
  getSVGAsync,
}));

const getObjectLayer = jest.fn();
getSVGAsync.mockImplementation((callback) => {
  callback({
    Canvas: {
      getObjectLayer,
    },
  });
});

import ElementTitle from './ElementTitle';

describe('should render correctly', () => {
  test('no selected element', () => {
    expect(toJson(shallow(<ElementTitle
      selectedElem={null}
    />))).toMatchSnapshot();
    expect(getObjectLayer).not.toHaveBeenCalled();
  });

  test('multiple selections', () => {
    document.body.innerHTML = '<g id="svg_1" data-tempgroup="true" />';
    const wrapper = shallow(<ElementTitle
      selectedElem={document.getElementById('svg_1')}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(getObjectLayer).not.toHaveBeenCalled();
  });

  describe('single selection', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    test('not use', () => {
      getObjectLayer.mockReturnValue({
        title: 'Layer 1',
      });
      document.body.innerHTML = '<rect id="svg_1" />';
      const wrapper = shallow(<ElementTitle
        selectedElem={document.getElementById('svg_1')}
      />);
      expect(toJson(wrapper)).toMatchSnapshot();
      expect(getObjectLayer).toHaveBeenCalledTimes(1);
      expect(getObjectLayer).toHaveBeenNthCalledWith(1, document.getElementById('svg_1'));
    });

    test('svg', () => {
      getObjectLayer.mockReturnValue({
        title: 'Layer 1',
      });
      document.body.innerHTML = '<use id="svg_1" data-svg="true" />';
      const wrapper = shallow(<ElementTitle
        selectedElem={document.getElementById('svg_1')}
      />);
      expect(toJson(wrapper)).toMatchSnapshot();
      expect(getObjectLayer).toHaveBeenCalledTimes(1);
      expect(getObjectLayer).toHaveBeenNthCalledWith(1, document.getElementById('svg_1'));
    });

    test('dxf', () => {
      getObjectLayer.mockReturnValue({
        title: 'Layer 1',
      });
      document.body.innerHTML = '<use id="svg_1" data-dxf="true" />';
      const wrapper = shallow(<ElementTitle
        selectedElem={document.getElementById('svg_1')}
      />);
      expect(toJson(wrapper)).toMatchSnapshot();
      expect(getObjectLayer).toHaveBeenCalledTimes(1);
      expect(getObjectLayer).toHaveBeenNthCalledWith(1, document.getElementById('svg_1'));
    });

    test('imported object', () => {
      getObjectLayer.mockReturnValue({
        title: 'Layer 1',
      });
      document.body.innerHTML = '<use id="svg_1" />';
      const wrapper = shallow(<ElementTitle
        selectedElem={document.getElementById('svg_1')}
      />);
      expect(toJson(wrapper)).toMatchSnapshot();
      expect(getObjectLayer).toHaveBeenCalledTimes(1);
      expect(getObjectLayer).toHaveBeenNthCalledWith(1, document.getElementById('svg_1'));
    });

    test('no layer title given', () => {
      getObjectLayer.mockReturnValue(null);
      document.body.innerHTML = '<use id="svg_1" />';
      const wrapper = shallow(<ElementTitle
        selectedElem={document.getElementById('svg_1')}
      />);
      expect(toJson(wrapper)).toMatchSnapshot();
      expect(getObjectLayer).toHaveBeenCalledTimes(1);
      expect(getObjectLayer).toHaveBeenNthCalledWith(1, document.getElementById('svg_1'));
    });
  });
});
