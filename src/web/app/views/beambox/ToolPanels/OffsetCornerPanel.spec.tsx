/* eslint-disable import/first */
import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

jest.mock('helpers/i18n', () => ({
  lang: {
    beambox: {
      tool_panels: {
        _offset: {
          corner_type: 'Corner',
          sharp: 'Sharp',
          round: 'Round',
        },
      },
    },
  },
}));

import OffsetCornerPanel from './OffsetCornerPanel';

test('should render correctly', () => {
  const onValueChange = jest.fn();
  const wrapper = shallow(<OffsetCornerPanel
    cornerType="sharp"
    onValueChange={onValueChange}
  />);
  expect(toJson(wrapper)).toMatchSnapshot();

  wrapper.find('p.caption').simulate('click');
  expect(toJson(wrapper)).toMatchSnapshot();

  wrapper.find('Select').props().onChange({
    target: {
      value: 'round',
    },
  });
  expect(onValueChange).toHaveBeenCalledTimes(1);
  expect(onValueChange).toHaveBeenNthCalledWith(1, 'round');
  expect(toJson(wrapper)).toMatchSnapshot();
});
