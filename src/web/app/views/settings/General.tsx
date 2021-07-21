/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';

import i18n from 'helpers/i18n';
import SelectControl from 'app/views/settings/SelectControl';
import { StorageKey } from 'interfaces/IStorage';

interface Props {
  supportedLangs: { [key: string]: string };
  notificationOptions: { value: any, label: string, selected: boolean }[];
  changeActiveLang: (e: React.ChangeEvent) => void;
  updateConfigChange: (id: StorageKey, newVal: any) => void;
}

function General({
  supportedLangs,
  notificationOptions,
  changeActiveLang,
  updateConfigChange,
}: Props): JSX.Element {
  const lang = i18n.lang;
  return (
    <>
      <div className="subtitle">{lang.settings.groups.general}</div>
      <SelectControl
        label={lang.settings.language}
        id="select-lang"
        options={Object.keys(supportedLangs).map((l) => ({
          value: l,
          label: supportedLangs[l],
          selected: l === i18n.getActiveLang(),
        }))}
        onChange={changeActiveLang}
      />
      <SelectControl
        label={lang.settings.notifications}
        id="set-notifications"
        options={notificationOptions}
        onChange={(e) => updateConfigChange('notification', e.target.value)}
      />
    </>
  );
}

export default General;
