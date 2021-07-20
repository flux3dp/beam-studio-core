/* eslint-disable import/first */
import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

jest.mock('helpers/i18n', () => ({
  lang: {
    beambox: {
      tool_panels: {
        _offset: {
          direction: 'Offset Direction',
          inward: 'Inward',
          outward: 'Outward',
        },
      },
    },
  },
}));

import OffsetDirectionPanel from './OffsetDirectionPanel';

test('should render correctly', () => {
  const onValueChange = jest.fn();
  const wrapper = shallow(<OffsetDirectionPanel
    dir={1}
    onValueChange={onValueChange}
  />);
  expect(toJson(wrapper)).toMatchSnapshot();

  wrapper.find('p.caption').simulate('click');
  expect(toJson(wrapper)).toMatchSnapshot();

  wrapper.find('Select').props().onChange({
    target: {
      value: 0,
    },
  });
  expect(onValueChange).toHaveBeenCalledTimes(1);
  expect(onValueChange).toHaveBeenNthCalledWith(1, 0);
  expect(toJson(wrapper)).toMatchSnapshot();
});
