import React from 'react';
import { fireEvent, render } from '@testing-library/react';

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

jest.mock('app/components/settings/SelectControl', () =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ({ id, label, onChange, options, url }: any) => (
    <div>
      mock-select-control id:{id}
      label:{label}
      url:{url}
      options:{JSON.stringify(options)}
      <input className="select-control" onChange={onChange} />
    </div>
  )
);

// eslint-disable-next-line import/first
import Mask from './Mask';

test('should render correctly', () => {
  const updateBeamboxPreferenceChange = jest.fn();
  const { container } = render(
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
  expect(container).toMatchSnapshot();

  fireEvent.change(container.querySelector('.select-control'), {
    target: {
      value: 'FALSE',
    },
  });
  expect(updateBeamboxPreferenceChange).toHaveBeenCalledTimes(1);
  expect(updateBeamboxPreferenceChange).toHaveBeenNthCalledWith(1, 'enable_mask', 'FALSE');
});
