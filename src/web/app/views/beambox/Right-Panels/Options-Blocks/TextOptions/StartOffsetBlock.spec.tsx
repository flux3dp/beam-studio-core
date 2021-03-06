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
            start_offset: 'Text Offset',
          },
        },
      },
    },
  },
}));

import StartOffsetBlock from './StartOffsetBlock';

test('should render correctly', () => {
  const onValueChange = jest.fn();
  const wrapper = shallow(<StartOffsetBlock
    value={0}
    onValueChange={onValueChange}
  />);
  expect(toJson(wrapper)).toMatchSnapshot();

  wrapper.find('div.option-block').simulate('click');
  expect(toJson(wrapper)).toMatchSnapshot();

  wrapper.find('UnitInput').props().getValue(100);
  expect(onValueChange).toHaveBeenCalledTimes(1);
  expect(onValueChange).toHaveBeenNthCalledWith(1, 100);
  expect(toJson(wrapper)).toMatchSnapshot();
});
