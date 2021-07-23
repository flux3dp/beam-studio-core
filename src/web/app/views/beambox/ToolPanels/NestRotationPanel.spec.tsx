/* eslint-disable import/first */
import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

jest.mock('helpers/i18n', () => ({
  lang: {
    beambox: {
      tool_panels: {
        _nest: {
          rotations: 'Possible Rotation',
        },
      },
    },
  },
}));

import NestRotationPanel from './NestRotationPanel';

test('should render correctly', () => {
  const onValueChange = jest.fn();
  const wrapper = shallow(<NestRotationPanel
    rotations={1}
    onValueChange={onValueChange}
  />);
  expect(toJson(wrapper)).toMatchSnapshot();

  wrapper.find('UnitInput').props().getValue(2);
  expect(onValueChange).toHaveBeenCalledTimes(1);
  expect(onValueChange).toHaveBeenNthCalledWith(1, 2);
  expect(toJson(wrapper)).toMatchSnapshot();
});
