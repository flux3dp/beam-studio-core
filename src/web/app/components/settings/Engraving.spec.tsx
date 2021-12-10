import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

jest.mock('helpers/i18n', () => ({
  lang: {
    settings: {
      fast_gradient: 'Speed Optimization',
      help_center_urls: {
        fast_gradient: 'https://support.flux3dp.com/hc/en-us/articles/360004496235',
      },
      groups: {
        engraving: 'Rastering (Scanning)',
      },
    },
  },
}));

// eslint-disable-next-line import/first
import Engraving from './Engraving';

test('should render correctly', () => {
  const updateBeamboxPreferenceChange = jest.fn();
  const wrapper = shallow(<Engraving
    fastGradientOptions={[
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
    reverseEngravingOptions={[
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
  />);
  expect(toJson(wrapper)).toMatchSnapshot();

  wrapper.find('SelectControl').at(0).simulate('change', {
    target: {
      value: 'FALSE',
    },
  });
  expect(updateBeamboxPreferenceChange).toHaveBeenCalledTimes(1);
  expect(updateBeamboxPreferenceChange).toHaveBeenNthCalledWith(1, 'fast_gradient', 'FALSE');

  wrapper.find('SelectControl').at(1).simulate('change', {
    target: {
      value: 'FALSE',
    },
  });

  expect(updateBeamboxPreferenceChange).toHaveBeenCalledTimes(2);
  expect(updateBeamboxPreferenceChange).toHaveBeenNthCalledWith(2, 'reverse-engraving', 'FALSE');
});
