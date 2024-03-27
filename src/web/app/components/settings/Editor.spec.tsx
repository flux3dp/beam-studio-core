import * as React from 'react';
import { act } from 'react-dom/test-utils';
import { fireEvent, render } from '@testing-library/react';

import { OptionValues } from 'app/constants/enums';

jest.mock('helpers/is-dev', () => () => true);

jest.mock('helpers/i18n', () => ({
  lang: {
    menu: {
      mm: 'mm',
      inches: 'Inches',
    },
    settings: {
      default_units: 'Default Units',
      default_font_family: 'Default Font',
      default_font_style: 'Default Font Style',
      default_beambox_model: 'Default Document Setting',
      guides_origin: 'Guides Origin',
      guides: 'Guides',
      image_downsampling: 'Bitmap Previewing Quality',
      anti_aliasing: 'Anti-Aliasing',
      continuous_drawing: 'Continuous Drawing',
      simplify_clipper_path: 'Optimize the Calculated Path',
      help_center_urls: {
        image_downsampling: 'https://support.flux3dp.com/hc/en-us/articles/360004494995',
        anti_aliasing: 'https://support.flux3dp.com/hc/en-us/articles/360004408956',
        continuous_drawing: 'https://support.flux3dp.com/hc/en-us/articles/360004406496',
        simplify_clipper_path: 'https://support.flux3dp.com/hc/en-us/articles/360004407276',
      },
      groups: {
        editor: 'Editor',
      },
    },
  },
}));

const getFontOfPostscriptName = jest.fn();
jest.mock('app/actions/beambox/font-funcs', () => ({
  requestAvailableFontFamilies: () => ['Arial', 'Courier', 'Apple LiSung'],
  fontNameMap: new Map(
    Object.entries({
      Arial: 'Arial',
      Courier: 'Courier',
      'Apple LiSung': '蘋果儷細宋',
    })
  ),
  requestFontsOfTheFontFamily: (family) => {
    const fonts = {
      Arial: [
        {
          family: 'Arial',
          style: 'Regular',
          postscriptName: 'ArialMT',
        },
        {
          family: 'Arial',
          style: 'Bold',
          postscriptName: 'Arial-BoldMT',
        },
        {
          family: 'Arial',
          style: 'Bold Italic',
          postscriptName: 'Arial-BoldItalicMT',
        },
        {
          family: 'Arial',
          style: 'Italic',
          postscriptName: 'Arial-ItalicMT',
        },
      ],
      Courier: [
        {
          family: 'Courier',
          style: 'Regular',
          postscriptName: 'Regular',
        },
        {
          family: 'Courier',
          style: 'Bold',
          postscriptName: 'Courier-Bold',
        },
        {
          family: 'Courier',
          style: 'Bold Oblique',
          postscriptName: 'Courier-BoldOblique',
        },
        {
          family: 'Courier',
          style: 'Oblique',
          postscriptName: 'Courier-Oblique',
        },
      ],
      'Apple LiSung': [
        {
          family: 'Apple LiSung',
          style: 'Light',
          postscriptName: 'LiSungLight',
        },
      ],
    };
    return fonts[family];
  },
  getFontOfPostscriptName,
}));

const map = new Map();
map.set('default-font', {
  family: 'Arial',
  style: 'Regular',
});
jest.mock('implementations/storage', () => ({
  get: (key) => map.get(key),
  set: (key, value) => map.set(key, value),
}));

jest.mock(
  'app/components/settings/SelectControl',
  () =>
    ({ id, label, url, onChange, options }: any) =>
      (
        <div>
          mock-select-control id:{id}
          label:{label}
          url:{url}
          options:{JSON.stringify(options)}
          <input className="select-control" onChange={onChange} />
        </div>
      )
);

jest.mock(
  'app/widgets/Unit-Input-v2',
  () =>
    ({ id, unit, min, max, defaultValue, getValue, forceUsePropsUnit, className }: any) =>
      (
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
import Editor from './Editor';

describe('should render correctly', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('initially no warning', async () => {
    const updateConfigChange = jest.fn();
    const updateBeamboxPreferenceChange = jest.fn();
    const updateModel = jest.fn();
    const { container } = render(
      <Editor
        defaultUnit="mm"
        x0={0}
        y0={0}
        selectedModel="fbb1b"
        guideSelectionOptions={[
          {
            value: 'TRUE',
            label: 'On',
            selected: false,
          },
          {
            value: 'FALSE',
            label: 'Off',
            selected: true,
          },
        ]}
        imageDownsamplingOptions={[
          {
            value: 'TRUE',
            label: 'Low',
            selected: false,
          },
          {
            value: 'FALSE',
            label: 'Normal',
            selected: true,
          },
        ]}
        antiAliasingOptions={[
          {
            value: 'TRUE',
            label: 'On',
            selected: false,
          },
          {
            value: 'FALSE',
            label: 'Off',
            selected: true,
          },
        ]}
        continuousDrawingOptions={[
          {
            value: 'TRUE',
            label: 'On',
            selected: false,
          },
          {
            value: 'FALSE',
            label: 'Off',
            selected: true,
          },
        ]}
        simplifyClipperPath={[
          {
            value: 'TRUE',
            label: 'On',
            selected: false,
          },
          {
            value: 'FALSE',
            label: 'Off',
            selected: true,
          },
        ]}
        enableLowSpeedOptions={[
          {
            value: 'TRUE',
            label: 'On',
            selected: false,
          },
          {
            value: 'FALSE',
            label: 'Off',
            selected: true,
          },
        ]}
        enableCustomBacklashOptions={[
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
        updateConfigChange={updateConfigChange}
        updateBeamboxPreferenceChange={updateBeamboxPreferenceChange}
        updateModel={updateModel}
      />
    );
    expect(container).toMatchSnapshot();

    const SelectControls = container.querySelectorAll('.select-control');
    const UnitInputs = container.querySelectorAll('.unit-input');

    fireEvent.change(SelectControls[0], { target: { value: 'inches' } });
    expect(updateConfigChange).toHaveBeenCalledTimes(1);
    expect(updateConfigChange).toHaveBeenNthCalledWith(1, 'default-units', 'inches');

    fireEvent.change(SelectControls[1], { target: { value: 'Apple LiSung' } });
    expect(container).toMatchSnapshot();

    fireEvent.change(SelectControls[1], { target: { value: 'Courier' } });
    expect(container).toMatchSnapshot();

    getFontOfPostscriptName.mockReturnValue({
      family: 'Courier',
      style: 'Bold',
      postscriptName: 'Courier-Bold',
    });
    fireEvent.change(SelectControls[2], { target: { value: 'Courier-Bold' } });
    expect(container).toMatchSnapshot();

    fireEvent.change(SelectControls[3], { target: { value: 'fbm1' } });
    expect(updateBeamboxPreferenceChange).toHaveBeenCalledTimes(1);
    expect(updateBeamboxPreferenceChange).toHaveBeenNthCalledWith(1, 'model', 'fbm1');
    expect(updateModel).toHaveBeenCalledTimes(1);
    expect(updateModel).toHaveBeenNthCalledWith(1, 'fbm1');

    fireEvent.change(SelectControls[4], { target: { value: 'TRUE' } });
    expect(updateBeamboxPreferenceChange).toHaveBeenCalledTimes(2);
    expect(updateBeamboxPreferenceChange).toHaveBeenNthCalledWith(2, 'show_guides', 'TRUE');

    fireEvent.change(SelectControls[5], { target: { value: 'TRUE' } });
    expect(updateBeamboxPreferenceChange).toHaveBeenCalledTimes(3);
    expect(updateBeamboxPreferenceChange).toHaveBeenNthCalledWith(3, 'image_downsampling', 'TRUE');

    fireEvent.change(SelectControls[6], { target: { value: 'TRUE' } });
    expect(updateBeamboxPreferenceChange).toHaveBeenCalledTimes(4);
    expect(updateBeamboxPreferenceChange).toHaveBeenNthCalledWith(4, 'anti-aliasing', 'TRUE');

    fireEvent.change(SelectControls[7], { target: { value: 'TRUE' } });
    expect(updateBeamboxPreferenceChange).toHaveBeenCalledTimes(5);
    expect(updateBeamboxPreferenceChange).toHaveBeenNthCalledWith(5, 'continuous_drawing', 'TRUE');

    fireEvent.change(SelectControls[8], { target: { value: 'TRUE' } });
    expect(updateBeamboxPreferenceChange).toHaveBeenCalledTimes(6);
    expect(updateBeamboxPreferenceChange).toHaveBeenNthCalledWith(6, 'simplify_clipper_path', 'TRUE');

    fireEvent.change(SelectControls[9], { target: { value: 'TRUE' } });
    expect(updateBeamboxPreferenceChange).toHaveBeenCalledTimes(7);
    expect(updateBeamboxPreferenceChange).toHaveBeenNthCalledWith(7, 'enable-low-speed', 'TRUE');

    fireEvent.change(UnitInputs[0], { target: { value: 1 } });
    expect(updateBeamboxPreferenceChange).toHaveBeenCalledTimes(8);
    expect(updateBeamboxPreferenceChange).toHaveBeenNthCalledWith(8, 'guide_x0', 1);

    fireEvent.change(UnitInputs[1], { target: { value: 2 } });
    expect(updateBeamboxPreferenceChange).toHaveBeenCalledTimes(9);
    expect(updateBeamboxPreferenceChange).toHaveBeenNthCalledWith(9, 'guide_y0', 2);

    fireEvent.change(SelectControls[10], { target: { value: OptionValues.TRUE } });
    expect(updateBeamboxPreferenceChange).toHaveBeenCalledTimes(10);
    expect(updateBeamboxPreferenceChange).toHaveBeenNthCalledWith(10, 'enable-custom-backlash', 'TRUE');
  });
});
