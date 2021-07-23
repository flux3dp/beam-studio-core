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

const read = jest.fn();
jest.mock('app/actions/beambox/beambox-preference', () => ({
  read,
}));

import Interval from './Interval';

describe('should render correctly', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('default unit is inches', () => {
    get.mockReturnValue('inches');
    read.mockReturnValue('fbb1b');
    const onValueChange = jest.fn();
    const wrapper = shallow(<Interval
      dx={25.4}
      dy={25.4}
      onValueChange={onValueChange}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('p.caption').simulate('click');
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.setProps({ dx: 254, dy: 254, onValueChange });
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('UnitInput').at(0).props().getValue(100);
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenNthCalledWith(1, { dx: 100, dy: 254 });
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('UnitInput').at(1).props().getValue(100);
    expect(onValueChange).toHaveBeenCalledTimes(2);
    expect(onValueChange).toHaveBeenNthCalledWith(2, { dx: 100, dy: 100 });
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('default unit is mm', () => {
    get.mockReturnValue(undefined);
    read.mockReturnValue('fbb1b');
    const wrapper = shallow(<Interval
      dx={25.4}
      dy={25.4}
      onValueChange={jest.fn()}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
