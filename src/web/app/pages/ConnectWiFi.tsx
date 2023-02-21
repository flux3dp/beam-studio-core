import classNames from 'classnames';
import React, { useEffect } from 'react';

import i18n from 'helpers/i18n';
import { Collapse } from 'antd';

import styles from './ConnectWiFi.module.scss';

let lang = i18n.lang.initialize;
const updateLang = () => {
  lang = i18n.lang.initialize;
};

const ConnectWiFi = (): JSX.Element => {
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
            window.location.hash = '#initialize/connect/connect-machine-ip?wired=0';
          }}
        >
          {lang.next}
        </div>
      </div>
      <div className={styles.main}>
        <div className={styles.image}>
          <div className={styles.hint} />
          <img
            src="img/init-panel/touch-panel-en.jpg"
            draggable="false"
          />
        </div>
        <div className={styles.text}>
          <div className={styles.title}>{lang.connect_wifi.title}</div>
          <div className={classNames(styles.contents, styles.tutorial)}>
            <div>{lang.connect_wifi.tutorial1}</div>
            <div>{lang.connect_wifi.tutorial2}</div>
          </div>
          <Collapse accordion>
            <Collapse.Panel key="1" header={lang.connect_wifi.what_if_1}>
              <div className={classNames(styles.contents, styles.collapse)}>{lang.connect_wifi.what_if_1_content}</div>
            </Collapse.Panel>
            <Collapse.Panel key="2" header={lang.connect_wifi.what_if_2}>
              <div className={classNames(styles.contents, styles.collapse)}>{lang.connect_wifi.what_if_2_content}</div>
            </Collapse.Panel>
          </Collapse>
        </div>
      </div>
    </div>
  );
};

export default ConnectWiFi;
