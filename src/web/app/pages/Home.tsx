import * as React from 'react';

import appSettings from 'app/app-settings';
import i18n from 'helpers/i18n';
import menu from 'implementations/menu';
import Modal from 'app/widgets/Modal';
import SelectView from 'app/widgets/Select';
import { ILang } from 'interfaces/ILang';

interface State {
  lang: ILang;
}

export default class Home extends React.Component<any, State> {
  constructor(props) {
    super(props);
    this.state = {
      lang: i18n.lang,
    };
  }

  private getLanguageOptions = () => {
    const options = [];
    const langCodes = Object.keys(appSettings.i18n.supported_langs);
    for (let i = 0; i < langCodes.length; i += 1) {
      const langCode = langCodes[i];
      options.push({
        value: langCode,
        label: appSettings.i18n.supported_langs[langCode],
        selected: langCode === i18n.getActiveLang(),
      });
    }
    return options;
  };

  private changeActiveLang = (e) => {
    i18n.setActiveLang(e.currentTarget.value);
    menu.updateLanguage();
    this.setState({
      lang: i18n.lang,
    });
  };

  // Lifecycle
  render(): JSX.Element {
    const { lang } = this.state;
    const options = this.getLanguageOptions();
    const wrapperClassName = {
      initialization: true,
    };
    const content = (
      <div className="home text-center">
        <img className="brand-image" src="img/menu/main_logo.svg" />
        <div>
          <h1 className="headline">{lang.initialize.select_language}</h1>
          <div className="language">
            <SelectView id="select-lang" options={options} onChange={this.changeActiveLang} />
          </div>
          <div>
            <a href="#initialize/connect/flux-id-login" className="btn btn-action btn-large">{lang.initialize.next}</a>
          </div>
        </div>
      </div>
    );

    return (
      <Modal className={wrapperClassName} content={content} />
    );
  }
}
