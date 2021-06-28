import * as React from 'react';

import i18n from 'helpers/i18n';
import SelectControl from 'app/views/settings/SelectControl';
import { StorageKey } from 'interfaces/IStorage';

interface Props {
  enableSentryOptions: { value: any, label: string, selected: boolean }[];
  updateConfigChange: (id: StorageKey, newVal: any) => void;
}

class Privacy extends React.Component<Props> {
  render() {
    const {
      enableSentryOptions,
      updateConfigChange,
    } = this.props;
    const lang = i18n.lang;

    return (
      <>
        <div className="subtitle">{lang.settings.groups.privacy}</div>
        <SelectControl
          label={lang.settings.share_with_flux}
          id="set-sentry"
          options={enableSentryOptions}
          onChange={(e) => updateConfigChange('enable-sentry', e.target.value)}
        />
      </>
    );
  }
}

export default Privacy;
