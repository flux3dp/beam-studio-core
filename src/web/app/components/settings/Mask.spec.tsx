import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

jest.mock('helpers/i18n', () => ({
  lang: {
    settings: {
      mask: 'Workarea Clipping',
      help_center_urls: {
        mask: 'https://support.flux3dp.com/hc/en-us/articles/360004408876',
      },
      groups: {
        mask: 'Workarea Clipping',
      },
    },
  },
}));

// eslint-disable-next-line import/first
import Mask from './Mask';

test('should render correctly', () => {
  const updateBeamboxPreferenceChange = jest.fn();
  const wrapper = shallow(
    <Mask
      maskOptions={[
        {
          value: 'TRUE',
          label: 'On',
          selected: true,
        },
        {
          value: 'FALSE',
          label: 'Off',
          selected: false,
        },
      ]}
      updateBeamboxPreferenceChange={updateBeamboxPreferenceChange}
    />
  );
  expect(toJson(wrapper)).toMatchSnapshot();

  wrapper.find('SelectControl').simulate('change', {
    target: {
      value: 'FALSE',
    },
  });
  expect(updateBeamboxPreferenceChange).toHaveBeenCalledTimes(1);
  expect(updateBeamboxPreferenceChange).toHaveBeenNthCalledWith(1, 'enable_mask', 'FALSE');
});
