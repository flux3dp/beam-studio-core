import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

import MenuItem from './MenuItem';

describe('MenuItem tests', () => {
  test('extends className correctly', () => {
    const className = 'CLASSNAME_PROP';
    const attributes = {
      className: 'CLASSNAME_ATTRIBUTE',
    };

    const wrapper = shallow(
      <MenuItem className={className} attributes={attributes} />,
    );

    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
