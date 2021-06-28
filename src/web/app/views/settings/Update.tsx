import * as React from 'react';

import i18n from 'helpers/i18n';
import SelectControl from 'app/views/settings/SelectControl';
import { StorageKey } from 'interfaces/IStorage';

interface Props {
  updateNotificationOptions: { value: any, label: string, selected: boolean, }[];
  updateConfigChange: (id: StorageKey, newVal: any) => void;
}

function Update({ updateNotificationOptions, updateConfigChange }: Props): JSX.Element {
  const lang = i18n.lang;
  return (
    <>
      <div className="subtitle">{lang.settings.groups.update}</div>
      <SelectControl
        label={lang.settings.check_updates}
        options={updateNotificationOptions}
        onChange={(e) => updateConfigChange('auto_check_update', e.target.value)}
      />
    </>
  );
}

export default Update;
