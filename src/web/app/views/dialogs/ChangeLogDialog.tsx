import React from 'react';

import browser from 'implementations/browser';
import changelog from 'implementations/changelog';
import i18n from 'helpers/i18n';
import Modal from 'app/widgets/Modal';

const LANG = i18n.lang.change_logs;

interface Props {
  onClose: () => void;
}

function ChangeLogDialog({ onClose }: Props): JSX.Element {
  const renderChangeLogs = () => {
    const CHANGES = i18n.getActiveLang().startsWith('zh') ? changelog.CHANGES_TW : changelog.CHANGES_EN;
    const logs = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const key of Object.keys(CHANGES)) {
      if (CHANGES[key].length > 0) {
        logs.push(<div className="change-log-category" key={key}>{LANG[key]}</div>);
        for (let i = 0; i < CHANGES[key].length; i += 1) {
          logs.push(
            <div className="change-log-item" key={`${key}-${i}`}>
              <div className="index">{`${i + 1}.`}</div>
              <pre className="log">{CHANGES[key][i]}</pre>
            </div>,
          );
        }
      }
    }
    return logs;
  };

  const changeLogs = renderChangeLogs();
  if (changeLogs.length === 0) {
    onClose();
    return null;
  }

  // const { version } = window.electron;
  const handleLink = () => {
    browser.open(LANG.help_center_url);
  };

  return (
    <Modal>
      <div className="change-log-dialog">
        <div className="header">
          <img src="icon.png" alt="Beam Studio Logo" />
          <div className="app">{`Beam Studio Web`}</div>
          {/* <div className="app">{`Beam Studio ${version.replace('-', ' ')}`}</div> */}
        </div>
        <div className="title">{LANG.change_log}</div>
        <div className="change-log-container">
          {changeLogs}
        </div>
        <div
          role="button"
          tabIndex={0}
          className="link"
          onKeyDown={handleLink}
          onClick={handleLink}
        >
          {LANG.see_older_version}
        </div>
        <div className="footer">
          <button
            type="button"
            className="btn btn-default primary"
            onClick={onClose}
          >
            OK
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ChangeLogDialog;
