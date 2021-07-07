/* eslint-disable import/first */
import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

jest.mock('helpers/i18n', () => ({
  lang: {
    beambox: {
      right_panel: {
        object_panel: {
          option_panel: {
            rounded_corner: 'Rounded corner',
          },
        },
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

const changeSelectedAttribute = jest.fn();
getSVGAsync.mockImplementation((callback) => {
  callback({
    Canvas: {
      changeSelectedAttribute,
    },
  });
});

import RectOptions from './RectOptions';

describe('should render correctly', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('unit is inches', () => {
    get.mockReturnValue('inches');
    const updateDimensionValues = jest.fn();
    document.body.innerHTML = '<div id="flux" />';
    const wrapper = shallow(
      <RectOptions
        elem={document.getElementById('flux')}
        rx={0}
        updateDimensionValues={updateDimensionValues}
      />,
    );

    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('UnitInput').props().getValue(10);
    expect(changeSelectedAttribute).toHaveBeenCalledTimes(1);
    expect(changeSelectedAttribute).toHaveBeenNthCalledWith(1, 'rx', 100, [document.getElementById('flux')]);
    expect(updateDimensionValues).toHaveBeenCalledTimes(1);
    expect(updateDimensionValues).toHaveBeenNthCalledWith(1, { rx: 100 });
  });

  test('unit is not inches', () => {
    get.mockReturnValue(null);
    document.body.innerHTML = '<div id="flux" />';
    const wrapper = shallow(
      <RectOptions
        elem={document.getElementById('flux')}
        rx={10}
        updateDimensionValues={jest.fn()}
      />,
    );
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
