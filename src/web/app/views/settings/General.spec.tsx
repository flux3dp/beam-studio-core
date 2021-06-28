import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

jest.mock('helpers/i18n', () => ({
  lang: {
    settings: {
      language: 'Language',
      notifications: 'Desktop Notifications',
      groups: {
        general: 'General',
      },
    },
  },
  getActiveLang: () => 'en',
}));

// eslint-disable-next-line import/first
import General from './General';

test('should render correctly', () => {
  const changeActiveLang = jest.fn();
  const updateConfigChange = jest.fn();
  const wrapper = shallow(<General
    supportedLangs={{
      de: 'Deutsche',
      en: 'English',
      es: 'Español',
      'zh-tw': '繁體中文',
      ja: '日本語',
      'zh-cn': '简体中文',
    }}
    notificationOptions={[
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
    changeActiveLang={changeActiveLang}
    updateConfigChange={updateConfigChange}
  />);
  expect(toJson(wrapper)).toMatchSnapshot();

  wrapper.find('SelectControl').at(0).simulate('change');
  expect(changeActiveLang).toHaveBeenCalledTimes(1);

  wrapper.find('SelectControl').at(1).simulate('change', {
    target: {
      value: 'FALSE',
    },
  });
  expect(updateConfigChange).toHaveBeenCalledTimes(1);
  expect(updateConfigChange).toHaveBeenNthCalledWith(1, 'notification', 'FALSE');
});
