import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

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
  availableFontFamilies: ['Arial', 'Courier', 'Apple LiSung'],
  fontNameMap: new Map(Object.entries({
    Arial: 'Arial',
    Courier: 'Courier',
    'Apple LiSung': '蘋果儷細宋',
  })),
  requestFontsOfTheFontFamily: (family) => {
    const fonts = {
      Arial: [{
        family: 'Arial',
        style: 'Regular',
        postscriptName: 'ArialMT',
      }, {
        family: 'Arial',
        style: 'Bold',
        postscriptName: 'Arial-BoldMT',
      }, {
        family: 'Arial',
        style: 'Bold Italic',
        postscriptName: 'Arial-BoldItalicMT',
      }, {
        family: 'Arial',
        style: 'Italic',
        postscriptName: 'Arial-ItalicMT',
      }],
      Courier: [{
        family: 'Courier',
        style: 'Regular',
        postscriptName: 'Regular',
      }, {
        family: 'Courier',
        style: 'Bold',
        postscriptName: 'Courier-Bold',
      }, {
        family: 'Courier',
        style: 'Bold Oblique',
        postscriptName: 'Courier-BoldOblique',
      }, {
        family: 'Courier',
        style: 'Oblique',
        postscriptName: 'Courier-Oblique',
      }],
      'Apple LiSung': [{
        family: 'Apple LiSung',
        style: 'Light',
        postscriptName: 'LiSungLight',
      }],
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

// eslint-disable-next-line import/first
import Editor from './Editor';

describe('should render correctly', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('initially no warning', () => {
    const updateConfigChange = jest.fn();
    const updateBeamboxPreferenceChange = jest.fn();
    const updateModel = jest.fn();
    const wrapper = shallow(<Editor
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
      updateConfigChange={updateConfigChange}
      updateBeamboxPreferenceChange={updateBeamboxPreferenceChange}
      updateModel={updateModel}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('SelectControl').at(0).simulate('change', {
      target: {
        value: 'inches',
      },
    });
    expect(updateConfigChange).toHaveBeenCalledTimes(1);
    expect(updateConfigChange).toHaveBeenNthCalledWith(1, 'default-units', 'inches');

    wrapper.find('SelectControl').at(1).simulate('change', {
      target: {
        value: 'Apple LiSung',
      },
    });
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('SelectControl').at(1).simulate('change', {
      target: {
        value: 'Courier',
      },
    });
    expect(toJson(wrapper)).toMatchSnapshot();

    getFontOfPostscriptName.mockReturnValue({
      family: 'Courier',
      style: 'Bold',
      postscriptName: 'Courier-Bold',
    });
    wrapper.find('SelectControl').at(2).simulate('change', {
      target: {
        value: 'Courier-Bold',
      },
    });
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('SelectControl').at(3).simulate('change', {
      target: {
        value: 'fbm1',
      },
    });
    expect(updateBeamboxPreferenceChange).toHaveBeenCalledTimes(1);
    expect(updateBeamboxPreferenceChange).toHaveBeenNthCalledWith(1, 'model', 'fbm1');
    expect(updateModel).toHaveBeenCalledTimes(1);
    expect(updateModel).toHaveBeenNthCalledWith(1, 'fbm1');

    wrapper.find('SelectControl').at(4).simulate('change', {
      target: {
        value: 'TRUE',
      },
    });
    expect(updateBeamboxPreferenceChange).toHaveBeenCalledTimes(2);
    expect(updateBeamboxPreferenceChange).toHaveBeenNthCalledWith(2, 'show_guides', 'TRUE');

    wrapper.find('SelectControl').at(5).simulate('change', {
      target: {
        value: 'TRUE',
      },
    });
    expect(updateBeamboxPreferenceChange).toHaveBeenCalledTimes(3);
    expect(updateBeamboxPreferenceChange).toHaveBeenNthCalledWith(3, 'image_downsampling', 'TRUE');

    wrapper.find('SelectControl').at(6).simulate('change', {
      target: {
        value: 'TRUE',
      },
    });
    expect(updateBeamboxPreferenceChange).toHaveBeenCalledTimes(4);
    expect(updateBeamboxPreferenceChange).toHaveBeenNthCalledWith(4, 'anti-aliasing', 'TRUE');

    wrapper.find('SelectControl').at(7).simulate('change', {
      target: {
        value: 'TRUE',
      },
    });
    expect(updateBeamboxPreferenceChange).toHaveBeenCalledTimes(5);
    expect(updateBeamboxPreferenceChange).toHaveBeenNthCalledWith(5, 'continuous_drawing', 'TRUE');

    wrapper.find('SelectControl').at(8).simulate('change', {
      target: {
        value: 'TRUE',
      },
    });
    expect(updateBeamboxPreferenceChange).toHaveBeenCalledTimes(6);
    expect(updateBeamboxPreferenceChange).toHaveBeenNthCalledWith(6, 'simplify_clipper_path', 'TRUE');

    wrapper.find('UnitInput').at(0).props().getValue(1);
    expect(updateBeamboxPreferenceChange).toHaveBeenCalledTimes(7);
    expect(updateBeamboxPreferenceChange).toHaveBeenNthCalledWith(7, 'guide_x0', 1);

    wrapper.find('UnitInput').at(1).props().getValue(2);
    expect(updateBeamboxPreferenceChange).toHaveBeenCalledTimes(8);
    expect(updateBeamboxPreferenceChange).toHaveBeenNthCalledWith(8, 'guide_y0', 2);
  });
});
