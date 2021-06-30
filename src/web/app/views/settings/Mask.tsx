import * as React from 'react';

import i18n from 'helpers/i18n';
import SelectControl from 'app/views/settings/SelectControl';

interface Props {
  maskOptions: { value: any, label: string, selected: boolean }[];
  updateBeamboxPreferenceChange: (item_key: string, newVal: any) => void;
}

function Mask({ maskOptions, updateBeamboxPreferenceChange }: Props): JSX.Element {
  const lang = i18n.lang;
  return (
    <>
      <div className="subtitle">{lang.settings.groups.mask}</div>
      <SelectControl
        label={lang.settings.mask}
        url={lang.settings.help_center_urls.mask}
        id="set-mask"
        options={maskOptions}
        onChange={(e) => updateBeamboxPreferenceChange('enable_mask', e.target.value)}
      />
    </>
  );
}

export default Mask;
