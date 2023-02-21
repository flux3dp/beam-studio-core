import classNames from 'classnames';
import React, { useEffect, useMemo } from 'react';

import dialog from 'app/actions/dialog-caller';
import i18n from 'helpers/i18n';
import storage from 'implementations/storage';
import windowLocationReload from 'app/actions/windowLocation';

import styles from './SelectConnectionType.module.scss';

let lang = i18n.lang.initialize;
const updateLang = () => {
  lang = i18n.lang.initialize;
};

const TYPE_URL_MAP = {
  wifi: '#initialize/connect/connect-wi-fi',
  wired: '#initialize/connect/connect-wired',
  ether2ether: '#initialize/connect/connect-ethernet',
  usb: '#initialize/connect/connect-usb',
};

const SelectConnectionType = (): JSX.Element => {
  useEffect(() => {
    updateLang();
  }, []);

  const isNewUser = useMemo(() => !storage.get('printer-is-ready'), []);

  const handleBtnClick = () => {
    if (isNewUser) {
      storage.set('new-user', true);
    }
    storage.set('printer-is-ready', true);
    dialog.showLoadingWindow();
    window.location.hash = '#studio/beambox';
    windowLocationReload();
  };

  const handleConnectionTypeClick = (type: 'wifi' | 'wired' | 'ether2ether' | 'usb') => {
    const url = TYPE_URL_MAP[type];
    window.location.hash = url;
  };

  const renderConnectionTypeButton = (type: 'wifi' | 'wired' | 'ether2ether' | 'usb'): JSX.Element => (
    <button
      id={`connect-${type}`}
      type="button"
      className={classNames('btn', styles.btn)}
      onClick={() => handleConnectionTypeClick(type)}
    >
      {lang.connection_types[type]}
      {type === 'usb' ? <span className={styles.sub}>{lang.connect_usb.title_sub}</span> : null}
    </button>
  );

  const renderConnectionTypeContainer = (type: 'wifi' | 'wired' | 'ether2ether' | 'usb'): JSX.Element => (
    <div className={styles['btn-container']}>
      <img className={styles.icon} src={`img/init-panel/icon-${type}.svg`} draggable="false" />
      {renderConnectionTypeButton(type)}
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles['top-bar']} />
      <div className={styles.btns}>
        <div className={classNames(styles.btn, styles.primary)} onClick={handleBtnClick}>
          {isNewUser ? lang.skip : lang.cancel}
        </div>
      </div>
      <div className={styles.main}>
        <h1 className={styles.title}>{lang.select_connection_type}</h1>
        <div className={styles.btns}>
          {renderConnectionTypeContainer('wifi')}
          {renderConnectionTypeContainer('wired')}
          {renderConnectionTypeContainer('ether2ether')}
          {renderConnectionTypeContainer('usb')}
        </div>
      </div>
    </div>
  );
};

export default SelectConnectionType;
