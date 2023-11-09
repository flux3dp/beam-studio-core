import classNames from 'classnames';
import React from 'react';

import useI18n from 'helpers/useI18n';

import styles from './ConnectUsb.module.scss';

const ConnectUsb = (): JSX.Element => {
  const lang = useI18n().initialize;

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
            <div className={styles.subtitle}>HEXA</div>
            <div>1. {lang.connect_usb.tutorial1}</div>
            <div>2. {lang.connect_usb.tutorial2}</div>
          </div>
          <div className={classNames(styles.contents, styles.tutorial)}>
            <div className={styles.subtitle}>Ador</div>
            <div>1. {lang.connect_usb.turn_off_machine}</div>
            <div>2. {lang.connect_usb.tutorial1}</div>
            <div>3. {lang.connect_usb.turn_on_machine}</div>
            <div>4. {lang.connect_usb.wait_for_turning_on}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectUsb;
