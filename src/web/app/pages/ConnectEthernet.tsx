import classNames from 'classnames';
import React, { useEffect } from 'react';

import browser from 'implementations/browser';
import i18n from 'helpers/i18n';

import styles from './ConnectEthernet.module.scss';

let lang = i18n.lang.initialize;
const updateLang = () => {
  lang = i18n.lang.initialize;
};

const ConnectEthernet = (): JSX.Element => {
  useEffect(() => {
    updateLang();
  }, []);

  const guideHref = window.os === 'MacOS'
    ? lang.connect_ethernet.tutorial2_a_href_mac : lang.connect_ethernet.tutorial2_a_href_win;

  return (
    <div className={styles.container}>
      <div className={styles['top-bar']} />
      <div className={styles.btns}>
        <div
          className={styles.btn}
          onClick={() => { window.location.hash = '#initialize/connect/select-connection-type'; }}
        >
          {lang.back}
        </div>
        <div
          className={classNames(styles.btn, styles.primary)}
          onClick={() => { window.location.hash = '#initialize/connect/connect-machine-ip?wired=1'; }}
        >
          {lang.next}
        </div>
      </div>
      <div className={styles.main}>
        <div className={styles.image}>
          <div className={classNames(styles.circle, styles.c1)} />
          <img src="img/init-panel/icon-dual-cable.svg" draggable="false" />
          <div className={classNames(styles.circle, styles.c2)} />
        </div>
        <div className={styles.text}>
          <div className={styles.title}>{lang.connect_ethernet.title}</div>
          <div className={classNames(styles.contents, styles.tutorial)}>
            <div>{lang.connect_ethernet.tutorial1}</div>
            <div>
              {lang.connect_ethernet.tutorial2_1}
              <span className={styles.link} onClick={() => browser.open(guideHref)}>
                {lang.connect_ethernet.tutorial2_a_text}
              </span>
              {lang.connect_ethernet.tutorial2_2}
            </div>
            <div>{lang.connect_ethernet.tutorial3}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectEthernet;
