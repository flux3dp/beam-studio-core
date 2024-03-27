import React from 'react';
import { render } from '@testing-library/react';

import { OptionValues } from 'app/constants/enums';

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

jest.mock('app/components/settings/Control', () => 'mock-control');

jest.mock('app/components/settings/SelectControl', () =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ({ id, label, url, onChange, options }: any) => (
    <div>
      mock-select-control id:{id}
      label:{label}
      url:{url}
      options:{JSON.stringify(options)}
      <input className="select-control" onChange={onChange} />
    </div>
  )
);

jest.mock('app/widgets/Unit-Input-v2', () =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ({ id, unit, min, max, defaultValue, getValue, forceUsePropsUnit, className }: any) => (
    <div>
      mock-unit-input id:{id}
      unit:{unit}
      min:{min}
      max:{max}
      defaultValue:{defaultValue}
      forceUsePropsUnit:{forceUsePropsUnit ? 'true' : 'false'}
      className:{JSON.stringify(className)}
      <input className="unit-input" onChange={(e) => getValue(+e.target.value)} />
    </div>
  )
);

// eslint-disable-next-line import/first
import Camera from './Camera';

const mockUpdateBeamboxPreferenceChange = jest.fn();

test('should render correctly', () => {
  const { container } = render(
    <Camera
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
      enableCustomPreviewHeightOptions={[
        {
          value: OptionValues.TRUE,
          label: 'On',
          selected: false,
        },
        {
          value: OptionValues.FALSE,
          label: 'Off',
          selected: true,
        },
      ]}
      updateBeamboxPreferenceChange={mockUpdateBeamboxPreferenceChange}
    />
  );
  expect(container).toMatchSnapshot();
});
