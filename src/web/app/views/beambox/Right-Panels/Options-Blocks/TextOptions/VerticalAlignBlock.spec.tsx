/* eslint-disable import/first */
import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

enum VerticalAlign {
  BOTTOM = 0,
  MIDDLE = 1,
  TOP = 2,
}

jest.mock('app/actions/beambox/textPathEdit', () => ({
  VerticalAlign,
}));

const isMobile = jest.fn();
jest.mock('helpers/system-helper', () => ({
  isMobile: () => isMobile(),
}));

jest.mock('helpers/i18n', () => ({
  lang: {
    beambox: {
      right_panel: {
        object_panel: {
          option_panel: {
            vertical_align: 'Vertical Align',
          },
          bottom_align: 'Bottom Align',
          middle_align: 'Middle Align',
          top_align: 'Top Align',
        },
      },
    },
  },
}));

import VerticalAlignBlock from './VerticalAlignBlock';

describe('test VerticalAlignBlock', () => {
  test('should render correctly', () => {
    const onValueChange = jest.fn();
    const wrapper = shallow(
      <VerticalAlignBlock value={VerticalAlign.BOTTOM} onValueChange={onValueChange} />
    );
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('div.option-block').simulate('click');
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('select').simulate('change', { target: { value: VerticalAlign.TOP } });
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenNthCalledWith(1, VerticalAlign.TOP);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('should render correctly in mobile', () => {
    isMobile.mockReturnValue(true);
    const onValueChange = jest.fn();
    const wrapper = shallow(
      <VerticalAlignBlock value={VerticalAlign.BOTTOM} onValueChange={onValueChange} />
    );
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
