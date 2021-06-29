import * as React from 'react';

import GeneralSetting from 'app/views/settings/SettingGeneral';
import settings from 'app/app-settings';

export default class HomeView extends React.PureComponent {
  render() {
    const { supported_langs } = settings.i18n;
    return (
      <div className="studio-container settings-studio">
        <div className="settings-gradient-overlay" />
        <GeneralSetting supportedLangs={supported_langs} />
      </div>
    );
  }
}
