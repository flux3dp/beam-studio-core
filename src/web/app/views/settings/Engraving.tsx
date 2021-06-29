import * as React from 'react';

import i18n from 'helpers/i18n';
import SelectControl from 'app/views/settings/SelectControl';

interface Props {
  fastGradientOptions: { value: any, label: string, selected: boolean }[];
  updateBeamboxPreferenceChange: (item_key: string, newVal: any) => void;
}

class Engraving extends React.Component<Props> {
  render() {
    const { fastGradientOptions, updateBeamboxPreferenceChange } = this.props;
    const lang = i18n.lang;

    return (
      <>
        <div className="subtitle">{lang.settings.groups.engraving}</div>
        <SelectControl
          label={lang.settings.fast_gradient}
          url={lang.settings.help_center_urls.fast_gradient}
          options={fastGradientOptions}
          onChange={(e) => updateBeamboxPreferenceChange('fast_gradient', e.target.value)}
        />
      </>
    );
  }
}

export default Engraving;
