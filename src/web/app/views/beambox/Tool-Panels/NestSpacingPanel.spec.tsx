/* eslint-disable import/first */
import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

jest.mock('helpers/i18n', () => ({
  lang: {
    beambox: {
      tool_panels: {
        _nest: {
          spacing: 'Spacing',
        },
      },
    },
  },
}));

const get = jest.fn();
jest.mock('implementations/storage', () => ({
  get,
}));

import NestSpacingPanel from './NestSpacingPanel';

describe('should render correctly', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('default unit is inches', () => {
    get.mockReturnValue('inches');
    const onValueChange = jest.fn();
    const wrapper = shallow(<NestSpacingPanel
      spacing={100}
      onValueChange={onValueChange}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('UnitInput').props().getValue(50);
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenNthCalledWith(1, 50);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('default unit is mm', () => {
    get.mockReturnValue(undefined);
    const onValueChange = jest.fn();
    const wrapper = shallow(<NestSpacingPanel
      spacing={100}
      onValueChange={onValueChange}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
