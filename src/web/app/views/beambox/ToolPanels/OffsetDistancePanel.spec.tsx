/* eslint-disable import/first */
import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

jest.mock('helpers/i18n', () => ({
  lang: {
    beambox: {
      tool_panels: {
        _offset: {
          dist: 'Offset Distance',
        },
      },
    },
  },
}));

const get = jest.fn();
jest.mock('implementations/storage', () => ({
  get,
}));

import OffsetDistancePanel from './OffsetDistancePanel';

describe('should render correctly', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('default unit is inches', () => {
    get.mockReturnValue('inches');
    const onValueChange = jest.fn();
    const wrapper = shallow(<OffsetDistancePanel
      distance={100}
      onValueChange={onValueChange}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('p.caption').simulate('click');
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('UnitInput').props().getValue(50);
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenNthCalledWith(1, 50);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('default unit is mm', () => {
    get.mockReturnValue(undefined);
    expect(toJson(shallow(<OffsetDistancePanel
      distance={100}
      onValueChange={jest.fn()}
    />))).toMatchSnapshot();

    get.mockReturnValue(undefined);
    expect(toJson(shallow(<OffsetDistancePanel
      distance={100}
      onValueChange={jest.fn()}
    />))).toMatchSnapshot();
  });
});
