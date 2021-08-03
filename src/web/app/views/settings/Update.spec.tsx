import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

jest.mock('helpers/i18n', () => ({
  lang: {
    settings: {
      check_updates: 'Auto Check',
      groups: {
        update: 'Software Updates',
      },
    },
  },
}));

// eslint-disable-next-line import/first
import Update from './Update';

describe('should render correctly', () => {
  test('desktop version', () => {
    const updateConfigChange = jest.fn();
    const wrapper = shallow(<Update
      isWeb={false}
      updateNotificationOptions={[
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
      updateConfigChange={updateConfigChange}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('SelectControl').simulate('change', {
      target: {
        value: 'FALSE',
      },
    });
    expect(updateConfigChange).toHaveBeenCalledTimes(1);
    expect(updateConfigChange).toHaveBeenNthCalledWith(1, 'auto_check_update', 'FALSE');
  });

  test('web version', () => {
    const updateConfigChange = jest.fn();
    const wrapper = shallow(<Update
      isWeb
      updateNotificationOptions={[
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
      updateConfigChange={updateConfigChange}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
