/* eslint-disable import/first */
import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

jest.mock('app/views/beambox/Right-Panels/Options-Blocks/Image-Options', () => function ImageOptions() {
  return (
    <div>
      This is dummy ImageOptions
    </div>
  );
});

jest.mock('app/views/beambox/Right-Panels/Options-Blocks/InFillBlock', () => function DummyInFillBlock() {
  return (
    <div>
      This is dummy InFillBlock
    </div>
  );
});

jest.mock('app/views/beambox/Right-Panels/Options-Blocks/RectOptions', () => function RectOptions() {
  return (
    <div>
      This is dummy RectOptions
    </div>
  );
});

jest.mock('app/views/beambox/Right-Panels/Options-Blocks/TextOptions', () => function TextOptions() {
  return (
    <div>
      This is dummy TextOptions
    </div>
  );
});

jest.mock('app/views/beambox/Right-Panels/Options-Blocks/PolygonOptions', () => function PolygonOptions() {
  return (
    <div>
      This is dummy PolygonOptions
    </div>
  );
});

import OptionsPanel from './OptionsPanel';

describe('should render correctly', () => {
  test('rect', () => {
    const updateDimensionValues = jest.fn();
    document.body.innerHTML = '<rect id="rect" />';
    const wrapper = shallow(<OptionsPanel
      elem={document.getElementById('rect')}
      rx={null}
      updateObjectPanel={jest.fn()}
      updateDimensionValues={updateDimensionValues}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('RectOptions').props().updateDimensionValues();
    expect(updateDimensionValues).toHaveBeenCalledTimes(1);
  });

  test('text', () => {
    const updateObjectPanel = jest.fn();
    const updateDimensionValues = jest.fn();
    document.body.innerHTML = '<text id="text" />';
    const wrapper = shallow(<OptionsPanel
      elem={document.getElementById('text')}
      rx={null}
      updateObjectPanel={updateObjectPanel}
      updateDimensionValues={updateDimensionValues}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('TextOptions').props().updateDimensionValues();
    expect(updateDimensionValues).toHaveBeenCalledTimes(1);

    wrapper.find('TextOptions').props().updateObjectPanel();
    expect(updateObjectPanel).toHaveBeenCalledTimes(1);
  });

  test('image', () => {
    const updateObjectPanel = jest.fn();
    document.body.innerHTML = '<image id="image" />';
    const wrapper = shallow(<OptionsPanel
      elem={document.getElementById('image')}
      rx={null}
      updateObjectPanel={updateObjectPanel}
      updateDimensionValues={jest.fn()}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('ImageOptions').props().updateObjectPanel();
    expect(updateObjectPanel).toHaveBeenCalledTimes(1);
  });

  describe('polygon', () => {
    test('desktop version', () => {
      document.body.innerHTML = '<polygon id="polygon" />';
      const wrapper = shallow(<OptionsPanel
        elem={document.getElementById('polygon')}
        rx={null}
        polygonSides={8}
        updateObjectPanel={jest.fn()}
        updateDimensionValues={jest.fn()}
      />);
      expect(toJson(wrapper)).toMatchSnapshot();
    });

    test('web version', () => {
      window.FLUX.version = 'web';
      document.body.innerHTML = '<polygon id="polygon" />';
      const wrapper = shallow(<OptionsPanel
        elem={document.getElementById('polygon')}
        rx={null}
        polygonSides={8}
        updateObjectPanel={jest.fn()}
        updateDimensionValues={jest.fn()}
      />);
      expect(toJson(wrapper)).toMatchSnapshot();
    });
  });

  test('others', () => {
    document.body.innerHTML = '<xxx id="xxx" />';
    const wrapper = shallow(<OptionsPanel
      elem={document.getElementById('xxx')}
      rx={null}
      updateObjectPanel={jest.fn()}
      updateDimensionValues={jest.fn()}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('no element', () => {
    const wrapper = shallow(<OptionsPanel
      elem={null}
      rx={null}
      updateObjectPanel={jest.fn()}
      updateDimensionValues={jest.fn()}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
