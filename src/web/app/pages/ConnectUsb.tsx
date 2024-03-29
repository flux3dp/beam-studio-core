import classNames from 'classnames';
import React, { useMemo } from 'react';

import useI18n from 'helpers/useI18n';

import styles from './ConnectUsb.module.scss';

const ConnectUsb = (): JSX.Element => {
  const lang = useI18n().initialize;

  const { model } = useMemo(() => {
    const queryString = window.location.hash.split('?')[1] || '';
    const urlParams = new URLSearchParams(queryString);
    return {
      model: urlParams.get('model'),
    };
  }, []);

  const handleNext = () => {
    const urlParams = new URLSearchParams({ model, usb: '1' });
    const queryString = urlParams.toString();
    window.location.hash = `#initialize/connect/connect-machine-ip?${queryString}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles['top-bar']} />
      <div className={styles.btns}>
        <div className={styles.btn} onClick={() => window.history.back()}>
          {lang.back}
        </div>
        <div className={classNames(styles.btn, styles.primary)} onClick={handleNext}>
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
          <div className={styles.title}>{lang.connect_usb.title}</div>
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
