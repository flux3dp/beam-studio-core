import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

jest.mock('helpers/i18n', () => ({
  lang: {
    settings: {
      share_with_flux: 'Share Beam Studio Analytics',
      groups: {
        privacy: 'Privacy',
      },
    },
  },
}));

// eslint-disable-next-line import/first
import Privacy from './Privacy';

test('should render correctly', () => {
  const updateConfigChange = jest.fn();
  const wrapper = shallow(<Privacy
    enableSentryOptions={[
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
  expect(updateConfigChange).toHaveBeenNthCalledWith(1, 'enable-sentry', 'FALSE');
});
