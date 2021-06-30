import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

jest.mock('helpers/i18n', () => ({
  lang: {
    settings: {
      preview_movement_speed: 'Preview Movement Speed',
      preview_movement_speed_hl: 'Preview Movement Speed (Diode Laser Enabled)',
      groups: {
        camera: 'Camera',
      },
    },
  },
  getActiveLang: () => 'en',
}));

// eslint-disable-next-line import/first
import Camera from './Camera';

test('should render correctly', () => {
  expect(toJson(shallow(<Camera
    speed={{
      unit: 'in/s',
      decimal: 2,
      defaultValue: 1,
      getValue: jest.fn(),
    }}
    speedHL={{
      unit: 'mm/s',
      decimal: 0,
      defaultValue: 1,
      getValue: jest.fn(),
    }}
  />))).toMatchSnapshot();
});
