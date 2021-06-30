import * as React from 'react';

import i18n from 'helpers/i18n';
import SelectControl from 'app/views/settings/SelectControl';

interface Props {
  fontSubstituteOptions: { value: any, label: string, selected: boolean }[];
  updateBeamboxPreferenceChange: (item_key: string, newVal: any) => void;
}

function TextToPath({ fontSubstituteOptions, updateBeamboxPreferenceChange }: Props): JSX.Element {
  const lang = i18n.lang;
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
    </>
  );
}

export default TextToPath;
