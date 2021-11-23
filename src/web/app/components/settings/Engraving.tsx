import * as React from 'react';

import i18n from 'helpers/i18n';
import SelectControl from 'app/components/settings/SelectControl';

interface Props {
  fastGradientOptions: { value: any, label: string, selected: boolean }[];
  reverseEngravingOptions: { value: any, label: string, selected: boolean }[];
  updateBeamboxPreferenceChange: (item_key: string, newVal: any) => void;
}

function Engraving({
  fastGradientOptions,
  reverseEngravingOptions,
  updateBeamboxPreferenceChange,
}: Props): JSX.Element {
  const { lang } = i18n;
  return (
    <>
      <div className="subtitle">{lang.settings.groups.engraving}</div>
      <SelectControl
        id="set-fast-gradient"
        label={lang.settings.fast_gradient}
        url={lang.settings.help_center_urls.fast_gradient}
        options={fastGradientOptions}
        onChange={(e) => updateBeamboxPreferenceChange('fast_gradient', e.target.value)}
      />
      <SelectControl
        id="set-reverse-engraving"
        label={lang.settings.engraving_direction}
        options={reverseEngravingOptions}
        onChange={(e) => updateBeamboxPreferenceChange('reverse-engraving', e.target.value)}
      />
    </>
  );
}

export default Engraving;
