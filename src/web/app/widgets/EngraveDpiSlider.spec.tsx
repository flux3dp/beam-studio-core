/* eslint-disable import/first */
import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

jest.mock('helpers/i18n', () => ({
  lang: {
    beambox: {
      document_panel: {
        engrave_dpi: 'Resolution',
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        ultra: 'Ultra High',
      },
    },
  },
  getActiveLang: () => 'en',
}));

import EngraveDpiSlider from './EngraveDpiSlider';

test('should render correctly', () => {
  const mockOnChange = jest.fn();
  expect(toJson(shallow(<EngraveDpiSlider
    value="low"
    onChange={mockOnChange}
  />))).toMatchSnapshot();

  expect(toJson(shallow(<EngraveDpiSlider
    value="medium"
    onChange={mockOnChange}
  />))).toMatchSnapshot();

  expect(toJson(shallow(<EngraveDpiSlider
    value="high"
    onChange={mockOnChange}
  />))).toMatchSnapshot();

  const wrapper = shallow(<EngraveDpiSlider
    value="ultra"
    onChange={mockOnChange}
  />);
  expect(toJson(wrapper)).toMatchSnapshot();

  wrapper.find('input.slider').simulate('change', {
    target: {
      value: 3,
    },
  });
  expect(mockOnChange).toHaveBeenCalledTimes(1);
  expect(mockOnChange).toHaveBeenNthCalledWith(1, 'ultra');
});
