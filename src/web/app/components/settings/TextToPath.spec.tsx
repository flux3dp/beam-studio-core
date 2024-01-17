import React from 'react';
import { fireEvent, render } from '@testing-library/react';

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
import TextToPath from './TextToPath';

test('should render correctly', () => {
  const updateBeamboxPreferenceChange = jest.fn();
  const { container } = render(
    <TextToPath
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
    />
  );
  expect(container).toMatchSnapshot();

  fireEvent.change(container.querySelector('.select-control'), {
    target: {
      value: 'FALSE',
    },
  });
  expect(updateBeamboxPreferenceChange).toHaveBeenCalledTimes(1);
  expect(updateBeamboxPreferenceChange).toHaveBeenNthCalledWith(1, 'font-substitute', 'FALSE');
});
