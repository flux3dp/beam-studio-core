import * as React from 'react';
import toJson from 'enzyme-to-json';
import { shallow } from 'enzyme';

import Select from './Select';

describe('test Select', () => {
  test('should render correctly', () => {
    const mockOnChange = jest.fn();
    const wrapper = shallow(<Select
      id="123"
      name="select-lang"
      className="test123"
      options={[
        {
          value: 'en',
          label: 'en',
          selected: true,
        },
        {
          value: 'es',
          label: 'es',
          selected: false,
        },
        {
          value: 'jp',
          label: 'jp',
          selected: true,
        },
      ]}
      multiple
      onChange={mockOnChange}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.find('.test123').simulate('change');
    expect(mockOnChange).toHaveBeenCalled();

    expect(toJson(shallow(<Select
      id="123"
      name="select-lang"
      className="test123"
      options={[
        {
          value: 'en',
          label: 'en',
          selected: true,
        },
        {
          value: 'es',
          label: 'es',
          selected: false,
        },
        {
          value: 'jp',
          label: 'jp',
          selected: false,
        },
      ]}
      onChange={jest.fn()}
    />))).toMatchSnapshot();
  });
});
