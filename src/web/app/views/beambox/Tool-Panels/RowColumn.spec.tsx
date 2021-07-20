/* eslint-disable import/first */
import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

jest.mock('helpers/i18n', () => ({
  lang: {
    beambox: {
      tool_panels: {
        array_dimension: 'Array Dimension',
        rows: 'Rows',
        columns: 'Cols.',
      },
    },
  },
}));

import RowColumn from './RowColumn';

describe('should render correctly', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('valid input', () => {
    const onValueChange = jest.fn();
    const wrapper = shallow(<RowColumn
      row={2}
      column={3}
      onValueChange={onValueChange}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('p.caption').simulate('click');
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.setProps({ row: 3, column: 2, onValueChange });
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('UnitInput').at(0).props().getValue(4);
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenNthCalledWith(1, { row: 3, column: 4 });
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('UnitInput').at(1).props().getValue(5);
    expect(onValueChange).toHaveBeenCalledTimes(2);
    expect(onValueChange).toHaveBeenNthCalledWith(2, { row: 5, column: 4 });
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('invalid row and column input', () => {
    const wrapper = shallow(<RowColumn
      row={0}
      column={0}
      onValueChange={jest.fn()}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
