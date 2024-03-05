/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';

import SelectControl from 'app/components/settings/SelectControl';
import useI18n from 'helpers/useI18n';

interface Props {
  fontSubstituteOptions: { value: any; label: string; selected: boolean }[];
  updateBeamboxPreferenceChange: (item_key: string, newVal: any) => void;
  defaultFontConvert: string;
}

function TextToPath({
  fontSubstituteOptions,
  updateBeamboxPreferenceChange,
  defaultFontConvert,
}: Props): JSX.Element {
  const lang = useI18n();
  const defaultLaserModuleOptions = React.useMemo(
    () => [
      { value: '1.0', label: '1.0', selected: defaultFontConvert === '1.0' },
      { value: '2.0', label: '2.0', selected: defaultFontConvert === '2.0' },
    ],
    [defaultFontConvert]
  );
  return (
    <>
      <div className="subtitle">{lang.settings.groups.text_to_path}</div>
      <SelectControl
        label={lang.settings.font_substitute}
        url={lang.settings.help_center_urls.font_substitute}
        id="font-substitue"
        options={fontSubstituteOptions}
        onChange={(e) => updateBeamboxPreferenceChange('font-substitute', e.target.value)}
      />
      <SelectControl
        label={lang.settings.font_convert}
        url={lang.settings.help_center_urls.font_convert}
        id="font-convert"
        options={defaultLaserModuleOptions}
        onChange={(e) => updateBeamboxPreferenceChange('font-convert', e.target.value)}
      />
    </>
  );
}

export default TextToPath;
