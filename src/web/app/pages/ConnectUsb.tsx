import classNames from 'classnames';
import React, { useEffect } from 'react';

import i18n from 'helpers/i18n';

import styles from './ConnectUsb.module.scss';

let lang = i18n.lang.initialize;
const updateLang = () => {
  lang = i18n.lang.initialize;
};

const ConnectUsb = (): JSX.Element => {
  useEffect(() => {
    updateLang();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles['top-bar']} />
      <div className={styles.btns}>
        <div
          className={styles.btn}
          onClick={() => {
            window.location.hash = '#initialize/connect/select-connection-type';
          }}
        >
          {lang.back}
        </div>
        <div
          className={classNames(styles.btn, styles.primary)}
          onClick={() => {
            window.location.hash = '#initialize/connect/connect-machine-ip?usb=1';
          }}
        >
          {lang.next}
        </div>
      </div>
      <div className={styles.main}>
        <div className={styles.image}>
          <div className={classNames(styles.circle, styles.c1)} />
          <img src="img/init-panel/icon-usb-cable.svg" draggable="false" />
          <div className={classNames(styles.circle, styles.c2)} />
        </div>
        <div className={styles.text}>
          <div className={styles.title}>
            {lang.connect_usb.title}
            <span className={styles.sub}>{lang.connect_usb.title_sub}</span>
          </div>
          <div className={classNames(styles.contents, styles.tutorial)}>
            <div>{lang.connect_usb.tutorial1}</div>
            <div>{lang.connect_usb.tutorial2}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectUsb;
