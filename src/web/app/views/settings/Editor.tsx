import * as React from 'react';

import BeamboxConstant, { WorkAreaModel } from 'app/actions/beambox/constant';
import Controls from 'app/views/settings/Control';
import FontFuncs from 'app/actions/beambox/font-funcs';
import i18n from 'helpers/i18n';
import SelectControl from 'app/views/settings/SelectControl';
import storage from 'implementations/storage';
import UnitInput from 'app/widgets/Unit-Input-v2';
import { StorageKey } from 'interfaces/IStorage';

interface Props {
  defaultUnit: string;
  x0: number;
  y0: number;
  selectedModel: WorkAreaModel;
  guideSelectionOptions: { value: any, label: string, selected: boolean }[];
  imageDownsamplingOptions: { value: any, label: string, selected: boolean }[];
  antiAliasingOptions: { value: any, label: string, selected: boolean }[];
  continuousDrawingOptions: { value: any, label: string, selected: boolean }[];
  simplifyClipperPath: { value: any, label: string, selected: boolean }[];
  updateConfigChange: (id: StorageKey, newVal: any) => void;
  updateBeamboxPreferenceChange: (item_key: string, newVal: any) => void;
  updateModel: (selectedModel: WorkAreaModel) => void;
}

function Editor({
  defaultUnit,
  x0,
  y0,
  selectedModel,
  guideSelectionOptions,
  imageDownsamplingOptions,
  antiAliasingOptions,
  continuousDrawingOptions,
  simplifyClipperPath,
  updateConfigChange,
  updateBeamboxPreferenceChange,
  updateModel,
}: Props): JSX.Element {
  const lang = i18n.lang;
  const [defaultFont, updateDefaultFont] = React.useState(storage.get('default-font') || {
    family: 'Arial',
    style: 'Regular',
  });
  const fontOptions = FontFuncs.availableFontFamilies.map((family: string) => {
    const fontName = FontFuncs.fontNameMap.get(family);
    const label = typeof fontName === 'string' ? fontName : family;
    return {
      value: family,
      label,
      selected: family === defaultFont.family,
    };
  });
  const onSelectFont = (family) => {
    const fonts = FontFuncs.requestFontsOfTheFontFamily(family);
    const newDefaultFont = fonts.filter((font) => font.style === 'Regular')[0] || fonts[0];
    storage.set('default-font', {
      family: newDefaultFont.family,
      postscriptName: newDefaultFont.postscriptName,
      style: newDefaultFont.style,
    });
    updateDefaultFont({
      family: newDefaultFont.family,
      postscriptName: newDefaultFont.postscriptName,
      style: newDefaultFont.style,
    });
  };
  const fontStyleOptions = FontFuncs.requestFontsOfTheFontFamily(defaultFont.family).map(
    (font) => ({
      value: font.postscriptName,
      label: font.style,
      selected: font.style === defaultFont.style,
    }),
  );
  const onSelectFontStyle = (postscriptName) => {
    const newDefaultFont = FontFuncs.getFontOfPostscriptName(postscriptName);
    storage.set('default-font', {
      family: newDefaultFont.family,
      postscriptName: newDefaultFont.postscriptName,
      style: newDefaultFont.style,
    });
    updateDefaultFont({
      family: newDefaultFont.family,
      postscriptName: newDefaultFont.postscriptName,
      style: newDefaultFont.style,
    });
  };

  return (
    <>
      <div className="subtitle">{lang.settings.groups.editor}</div>
      <SelectControl
        label={lang.settings.default_units}
        options={[
          {
            value: 'mm',
            label: lang.menu.mm,
            selected: defaultUnit === 'mm',
          },
          {
            value: 'inches',
            label: lang.menu.inches,
            selected: defaultUnit === 'inches',
          },
        ]}
        onChange={(e) => updateConfigChange('default-units', e.target.value)}
      />
      <SelectControl
        label={lang.settings.default_font_family}
        options={fontOptions}
        onChange={(e) => onSelectFont(e.target.value)}
      />
      <SelectControl
        label={lang.settings.default_font_style}
        options={fontStyleOptions}
        onChange={(e) => onSelectFontStyle(e.target.value)}
      />
      <SelectControl
        label={lang.settings.default_beambox_model}
        options={[
          {
            value: 'fbm1',
            label: 'beamo',
            selected: selectedModel === 'fbm1',
          },
          {
            value: 'fbb1b',
            label: 'Beambox',
            selected: selectedModel === 'fbb1b',
          },
          {
            value: 'fbb1p',
            label: 'Beambox Pro',
            selected: selectedModel === 'fbb1p',
          },
        ]}
        onChange={(e) => {
          updateBeamboxPreferenceChange('model', e.target.value);
          updateModel(e.target.value);
        }}
      />
      <SelectControl
        label={lang.settings.guides}
        id="set-guide"
        options={guideSelectionOptions}
        onChange={(e) => updateBeamboxPreferenceChange('show_guides', e.target.value)}
      />
      <Controls label={lang.settings.guides_origin}>
        <span className="font2" style={{ marginRight: '10px', lineHeight: '32px' }}>X</span>
        <UnitInput
          unit={defaultUnit === 'inches' ? 'in' : 'mm'}
          min={0}
          max={BeamboxConstant.dimension.getWidth(selectedModel) / 10}
          defaultValue={x0}
          getValue={(val) => updateBeamboxPreferenceChange('guide_x0', val)}
          forceUsePropsUnit
          className={{ half: true }}
        />
        <span className="font2" style={{ marginRight: '10px', lineHeight: '32px' }}>Y</span>
        <UnitInput
          unit={defaultUnit === 'inches' ? 'in' : 'mm'}
          min={0}
          max={BeamboxConstant.dimension.getHeight(selectedModel) / 10}
          defaultValue={y0}
          getValue={(val) => updateBeamboxPreferenceChange('guide_y0', val)}
          forceUsePropsUnit
          className={{ half: true }}
        />
      </Controls>
      <SelectControl
        label={lang.settings.image_downsampling}
        url={lang.settings.help_center_urls.image_downsampling}
        options={imageDownsamplingOptions}
        onChange={(e) => updateBeamboxPreferenceChange('image_downsampling', e.target.value)}
      />
      <SelectControl
        label={lang.settings.anti_aliasing}
        url={lang.settings.help_center_urls.anti_aliasing}
        options={antiAliasingOptions}
        onChange={(e) => updateBeamboxPreferenceChange('anti-aliasing', e.target.value)}
      />
      <SelectControl
        label={lang.settings.continuous_drawing}
        url={lang.settings.help_center_urls.continuous_drawing}
        options={continuousDrawingOptions}
        onChange={(e) => updateBeamboxPreferenceChange('continuous_drawing', e.target.value)}
      />
      <SelectControl
        label={lang.settings.simplify_clipper_path}
        url={lang.settings.help_center_urls.simplify_clipper_path}
        options={simplifyClipperPath}
        onChange={(e) => updateBeamboxPreferenceChange('simplify_clipper_path', e.target.value)}
      />
    </>
  );
}

export default Editor;
