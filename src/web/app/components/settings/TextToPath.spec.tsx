import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

jest.mock('helpers/i18n', () => ({
  lang: {
    settings: {
      font_substitute: 'Substitute Unsupported Characters',
      help_center_urls: {
        font_substitute: 'https://support.flux3dp.com/hc/en-us/articles/360004496575',
      },
      groups: {
        text_to_path: 'Text',
      },
    },
  },
}));

// eslint-disable-next-line import/first
import TextToPath from './TextToPath';

test('should render correctly', () => {
  const updateBeamboxPreferenceChange = jest.fn();
  const wrapper = shallow(<TextToPath
    fontSubstituteOptions={[
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

  wrapper.find('SelectControl').simulate('change', {
    target: {
      value: 'FALSE',
    },
  });
  expect(updateBeamboxPreferenceChange).toHaveBeenCalledTimes(1);
  expect(updateBeamboxPreferenceChange).toHaveBeenNthCalledWith(1, 'font-substitute', 'FALSE');
});
