import * as React from 'react';

import i18n from 'helpers/i18n';
import Modal from 'app/widgets/Modal';
import storage from 'implementations/storage';
import windowLocationReload from 'app/actions/windowLocation';

const { lang } = i18n;

export default function () {
  interface Props {
    className?: string;
  }

  return class SkipConnectMachine extends React.PureComponent<Props> {
    onStart = () => {
      if (!storage.get('printer-is-ready')) {
        storage.set('new-user', true);
      }
      storage.set('printer-is-ready', true);
      window.location.hash = '#studio/beambox';
      windowLocationReload();
    };

    renderSelectMachineStep = () => {
      const { className = '' } = this.props;
      return (
        <div className={`skip-connect-machine ${className}`}>
          <h1 className="main-title">{lang.initialize.setting_completed.great}</h1>
          <div className="text-content">
            {lang.initialize.setting_completed.setup_later}
          </div>
          <button
            type="button"
            className="btn btn-action"
            onClick={() => this.onStart()}
          >
            {lang.initialize.setting_completed.ok}
          </button>
        </div>
      );
    };

    render() {
      const wrapperClassName = {
        initialization: true,
      };
      const content = (
        <div className="connect-machine">
          <div className="top-bar" />
          {this.renderSelectMachineStep()}
        </div>
      );

      return (
        <Modal className={wrapperClassName} content={content} />
      );
    }
  };
}
